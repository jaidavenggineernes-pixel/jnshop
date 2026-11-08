import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminUser();
    const methods = await prisma.paymentMethod.findMany({
      orderBy: { displayOrder: "asc" },
    });

    // Also get product count stats regarding COD
    const [totalProducts, digitalProducts, physicalWithCod, physicalNoCod] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isPhysical: false } }),
      prisma.product.count({ where: { isPhysical: true, allowCod: true } }),
      prisma.product.count({ where: { isPhysical: true, allowCod: false } }),
    ]);

    return NextResponse.json({
      success: true,
      methods,
      stats: {
        totalProducts,
        digitalProducts,
        physicalWithCod,
        physicalNoCod,
      },
    });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }
    return NextResponse.json({ error: "Gagal memuat metode pembayaran." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await req.json();
    const { id, isActive, accountName, accountNumber, maxAmount, description, instructions } = body;

    if (!id) {
      return NextResponse.json({ error: "ID Metode Pembayaran wajib diisi." }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (accountName !== undefined) updateData.accountName = accountName?.trim() || null;
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber?.trim() || null;
    if (maxAmount !== undefined) updateData.maxAmount = maxAmount ? parseFloat(maxAmount) : null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (instructions !== undefined) updateData.instructions = instructions?.trim() || null;

    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: updateData,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "PAYMENT_METHOD_UPDATE",
        entityType: "PAYMENT_METHOD",
        entityId: id,
        detailsJson: JSON.stringify({
          code: updated.code,
          isActive: updated.isActive,
          maxAmount: updated.maxAmount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      method: updated,
      message: `Metode pembayaran ${updated.name} berhasil diperbarui.`,
    });
  } catch (error: any) {
    console.error("Admin PUT payment error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }
    return NextResponse.json({ error: "Gagal memperbarui metode pembayaran." }, { status: 500 });
  }
}
