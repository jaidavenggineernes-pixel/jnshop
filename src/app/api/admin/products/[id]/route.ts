import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploads";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    const { id } = await params;
    let body: any;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      let uploadedUrl: string | null = null;
      const file = formData.get("file") as File | null;
      if (file && typeof file !== "string" && file.size > 0) {
        const saved = await saveUploadedImage("products", "prod", file);
        uploadedUrl = saved.url;
      }

      body = {};
      const entries = Array.from(formData.entries());
      for (const [key, val] of entries) {
        if (key === "file") continue;
        if (key === "isActive" || key === "isFeatured" || key === "isPhysical" || key === "allowCod") {
          body[key] = val === "true";
        } else if (key === "variants") {
          try {
            body.variants = JSON.parse(val.toString());
          } catch {
            body.variants = [];
          }
        } else {
          body[key] = val.toString();
        }
      }
      if (uploadedUrl) {
        body.imageUrl = uploadedUrl;
      }
    } else {
      body = await req.json();
    }

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] }, category: true, variants: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }
    if (typeof body.isFeatured === "boolean") {
      updateData.isFeatured = body.isFeatured;
    }
    if (body.name !== undefined) {
      const cleanName = String(body.name).trim();
      if (!cleanName) {
        return NextResponse.json({ error: "Nama produk tidak boleh kosong." }, { status: 400 });
      }
      updateData.name = cleanName;
    }
    if (body.shortDescription !== undefined) {
      updateData.shortDescription = body.shortDescription ? String(body.shortDescription).trim() : null;
    }
    if (body.description !== undefined) {
      const cleanDesc = String(body.description).trim();
      updateData.description = cleanDesc || updateData.name || existing.name;
    }
    if (body.price !== undefined) {
      const parsedPrice = Number(body.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json({ error: "Harga normal harus berupa angka lebih dari 0." }, { status: 400 });
      }
      updateData.price = parsedPrice;
    }
    if (body.discountPrice !== undefined) {
      if (body.discountPrice === null || body.discountPrice === "") {
        updateData.discountPrice = null;
      } else {
        const parsedDiscount = Number(body.discountPrice);
        if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
          return NextResponse.json({ error: "Harga diskon tidak valid." }, { status: 400 });
        }
        const effectiveBasePrice = updateData.price ?? existing.price;
        if (parsedDiscount >= effectiveBasePrice) {
          return NextResponse.json(
            { error: "Harga promo/diskon harus lebih rendah daripada harga normal." },
            { status: 400 }
          );
        }
        updateData.discountPrice = parsedDiscount > 0 ? parsedDiscount : null;
      }
    }
    if (typeof body.stock === "number" || typeof body.stock === "string") {
      const parsedStock = parseInt(String(body.stock), 10);
      updateData.stock = Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : existing.stock;
    }
    if (body.sku !== undefined) {
      const cleanSku = body.sku ? String(body.sku).trim() : null;
      if (cleanSku && cleanSku !== existing.sku) {
        const dup = await prisma.product.findFirst({
          where: { sku: cleanSku, id: { not: id } },
          select: { id: true },
        });
        if (dup) {
          return NextResponse.json(
            { error: `SKU "${cleanSku}" sudah digunakan oleh produk lain.` },
            { status: 400 }
          );
        }
      }
      updateData.sku = cleanSku;
    }
    if (body.categoryId !== undefined && body.categoryId !== existing.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: String(body.categoryId) } });
      if (!cat) {
        return NextResponse.json({ error: "Kategori yang dipilih tidak ditemukan." }, { status: 400 });
      }
      updateData.categoryId = cat.id;
    }

    const nextIsPhysical =
      typeof body.isPhysical === "boolean" ? body.isPhysical : existing.isPhysical;
    if (typeof body.isPhysical === "boolean") {
      updateData.isPhysical = body.isPhysical;
    }

    if (body.weight !== undefined) {
      const parsedWeight = Number(body.weight);
      updateData.weight = nextIsPhysical && Number.isFinite(parsedWeight) && parsedWeight >= 0 ? parsedWeight : 0;
    } else if (!nextIsPhysical) {
      updateData.weight = 0;
    }

    if (!nextIsPhysical) {
      if (body.digitalDeliveryType !== undefined) {
        updateData.digitalDeliveryType = body.digitalDeliveryType || "INSTANT_DOWNLOAD";
      }
      if (body.digitalFileUrl !== undefined) {
        updateData.digitalFileUrl = body.digitalFileUrl ? String(body.digitalFileUrl).trim() : null;
      }
      if (body.digitalLicenseKey !== undefined) {
        updateData.digitalLicenseKey = body.digitalLicenseKey ? String(body.digitalLicenseKey).trim() : null;
      }
      updateData.allowCod = false;
    } else if (typeof body.allowCod === "boolean") {
      updateData.allowCod = body.allowCod;
    }

    if (body.allowedPaymentMethods !== undefined) {
      updateData.allowedPaymentMethods =
        typeof body.allowedPaymentMethods === "string"
          ? body.allowedPaymentMethods
          : JSON.stringify(body.allowedPaymentMethods);
    }

    // Only touch primary image if imageUrl is explicitly supplied and differs from current primary
    const primaryImg = existing.images[0];
    if (body.imageUrl !== undefined) {
      const cleanImg = body.imageUrl ? String(body.imageUrl).trim() : "";
      if (cleanImg && cleanImg !== primaryImg?.url) {
        if (primaryImg) {
          await prisma.productImage.update({
            where: { id: primaryImg.id },
            data: { url: cleanImg, alt: updateData.name || existing.name },
          });
        } else {
          await prisma.productImage.create({
            data: {
              productId: id,
              url: cleanImg,
              alt: updateData.name || existing.name,
              isPrimary: true,
              order: 0,
            },
          });
        }
      }
    }

    // Optional variant price/stock updates
    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (!v?.id) continue;
        const belongsToProduct = existing.variants.some((ev) => ev.id === v.id);
        if (!belongsToProduct) continue;

        const vData: any = {};
        if (v.price === null || v.price === "") {
          vData.price = null;
        } else if (v.price !== undefined) {
          const vp = Number(v.price);
          if (!Number.isFinite(vp) || vp < 0) {
            return NextResponse.json({ error: "Harga varian tidak valid." }, { status: 400 });
          }
          vData.price = vp > 0 ? vp : null;
        }
        if (v.stock !== undefined) {
          const vs = parseInt(String(v.stock), 10);
          if (Number.isFinite(vs)) {
            vData.stock = Math.max(0, vs);
          }
        }
        if (Object.keys(vData).length > 0) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: vData,
          });
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
        variants: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: Object.keys(updateData).length === 1 && "isActive" in updateData
          ? updated.isActive
            ? "PRODUCT_RESTORE"
            : "PRODUCT_ARCHIVE"
          : "PRODUCT_UPDATE",
        entityType: "PRODUCT",
        entityId: id,
        detailsJson: JSON.stringify({
          name: updated.name,
          price: updated.price,
          discountPrice: updated.discountPrice,
          stock: updated.stock,
          isActive: updated.isActive,
        }),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath(`/products/${updated.slug}`);
      revalidatePath("/admin/products");
      if (existing.category?.slug) revalidatePath(`/categories/${existing.category.slug}`);
      if (updated.category?.slug) revalidatePath(`/categories/${updated.category.slug}`);
    } catch (e) {
      console.warn("Revalidate warning:", e);
    }

    const isPureArchiveToggle =
      Object.keys(updateData).length === 1 && typeof body.isActive === "boolean" && body.price === undefined;

    return NextResponse.json({
      success: true,
      product: updated,
      message: isPureArchiveToggle
        ? updated.isActive
          ? `Produk "${updated.name}" berhasil diaktifkan kembali.`
          : `Produk "${updated.name}" berhasil diarsipkan (disembunyikan dari toko).`
        : `Perubahan produk "${updated.name}" berhasil disimpan.`,
    });
  } catch (error: any) {
    console.error("Admin PATCH product error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Gagal memperbarui produk." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
    const { id } = await params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
            wishlists: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    // Safety check: Has the product been purchased in customer orders?
    if (existing._count.orderItems > 0) {
      return NextResponse.json(
        {
          error: `Produk "${existing.name}" memiliki ${existing._count.orderItems} riwayat transaksi pesanan pelanggan. Menghapus produk ini secara permanen akan merusak riwayat faktur dan pesanan pelanggan. Disarankan untuk menggunakan fitur 'Arsipkan' (Nonaktifkan) agar produk tidak lagi terlihat atau bisa dibeli oleh pelanggan.`,
          hasOrders: true,
          orderCount: existing._count.orderItems,
          canArchive: true,
        },
        { status: 400 }
      );
    }

    // Safe to delete completely (no orders associated)
    // Cascade deletes handle images, variants, cart items, wishlists, reviews
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Produk "${existing.name}" berhasil dihapus permanen dari katalog JNshop.`,
    });
  } catch (error: any) {
    console.error("Admin DELETE product error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Gagal menghapus produk dari database." },
      { status: 500 }
    );
  }
}
