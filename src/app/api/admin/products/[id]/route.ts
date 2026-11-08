import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true, category: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    // Prepare fields to update
    const updateData: any = {};
    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }
    if (typeof body.isFeatured === "boolean") {
      updateData.isFeatured = body.isFeatured;
    }
    if (typeof body.stock === "number" || typeof body.stock === "string") {
      updateData.stock = Math.max(0, parseInt(body.stock, 10) || 0);
    }
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price);
    }
    if (body.discountPrice !== undefined) {
      updateData.discountPrice = body.discountPrice ? parseFloat(body.discountPrice) : null;
    }
    if (body.name) {
      updateData.name = body.name.trim();
    }
    if (typeof body.allowCod === "boolean") {
      // Digital products can NEVER use COD
      updateData.allowCod = existing.isPhysical ? body.allowCod : false;
    }
    if (body.allowedPaymentMethods !== undefined) {
      updateData.allowedPaymentMethods =
        typeof body.allowedPaymentMethods === "string"
          ? body.allowedPaymentMethods
          : JSON.stringify(body.allowedPaymentMethods);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { name: true, slug: true } },
        images: { take: 1 },
        variants: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
      message: updated.isActive
        ? `Produk "${updated.name}" berhasil diaktifkan kembali.`
        : `Produk "${updated.name}" berhasil diarsipkan (disembunyikan dari toko).`,
    });
  } catch (error: any) {
    console.error("Admin PATCH product error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Gagal memperbarui status produk." },
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
