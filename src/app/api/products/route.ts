import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");

    if (ids) {
      const idList = ids.split(",").filter(Boolean);
      const products = await prisma.product.findMany({
        where: { id: { in: idList }, isActive: true },
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: "asc" } },
          variants: true,
        },
      });
      return NextResponse.json({ products });
    }

    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category");

    const where: any = { isActive: true };
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await req.json();

    const {
      name,
      description,
      shortDescription,
      price,
      discountPrice,
      stock,
      sku,
      weight,
      isPhysical,
      digitalDeliveryType,
      digitalFileUrl,
      digitalLicenseKey,
      categoryId,
      imageUrl,
      isFeatured,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Nama produk, harga, dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const slug = slugify(name) + "-" + Math.random().toString(36).substring(2, 6);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description || name,
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stock: parseInt(stock) || 0,
        sku: sku || null,
        weight: weight ? parseFloat(weight) : 0.5,
        isPhysical: isPhysical !== false,
        digitalDeliveryType: digitalDeliveryType || null,
        digitalFileUrl: digitalFileUrl || null,
        digitalLicenseKey: digitalLicenseKey || null,
        isFeatured: isFeatured === true,
        categoryId,
        images: imageUrl
          ? {
              create: [
                {
                  url: imageUrl,
                  alt: name,
                  isPrimary: true,
                  order: 0,
                },
              ],
            }
          : undefined,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "PRODUCT_CREATE",
        entityType: "PRODUCT",
        entityId: product.id,
        detailsJson: JSON.stringify({ productName: product.name, price: product.price }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Hanya admin pemilik yang berhak menambah produk." }, { status: 403 });
    }
    return NextResponse.json({ error: "Gagal membuat produk." }, { status: 500 });
  }
}
