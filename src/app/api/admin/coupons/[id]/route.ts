import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Voucher tidak ditemukan." },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (body.code !== undefined) {
      const cleanCode = String(body.code).trim().toUpperCase();
      if (!cleanCode) {
        return NextResponse.json(
          { error: "Kode voucher tidak boleh kosong." },
          { status: 400 }
        );
      }
      if (cleanCode !== existing.code) {
        const dup = await prisma.coupon.findUnique({ where: { code: cleanCode } });
        if (dup) {
          return NextResponse.json(
            { error: `Kode voucher "${cleanCode}" sudah digunakan.` },
            { status: 400 }
          );
        }
      }
      updateData.code = cleanCode;
    }

    if (body.description !== undefined) {
      updateData.description = body.description ? String(body.description).trim() : null;
    }

    if (body.type !== undefined) {
      if (body.type !== "PERCENTAGE" && body.type !== "FIXED") {
        return NextResponse.json(
          { error: "Tipe diskon harus PERCENTAGE atau FIXED." },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }

    if (body.value !== undefined) {
      const parsedValue = Number(body.value);
      if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return NextResponse.json(
          { error: "Nilai potongan voucher harus lebih besar dari 0." },
          { status: 400 }
        );
      }
      const effectiveType = updateData.type || existing.type;
      if (effectiveType === "PERCENTAGE" && parsedValue > 100) {
        return NextResponse.json(
          { error: "Diskon persentase tidak boleh melebihi 100%." },
          { status: 400 }
        );
      }
      updateData.value = parsedValue;
    }

    if (body.minPurchase !== undefined) {
      const parsedMin = Number(body.minPurchase);
      updateData.minPurchase = Number.isFinite(parsedMin) && parsedMin >= 0 ? parsedMin : 0;
    }

    if (body.maxDiscount !== undefined) {
      if (body.maxDiscount === null || body.maxDiscount === "") {
        updateData.maxDiscount = null;
      } else {
        const parsedMax = Number(body.maxDiscount);
        updateData.maxDiscount = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : null;
      }
    }

    if (body.quota !== undefined) {
      const parsedQuota = parseInt(String(body.quota), 10);
      if (!Number.isFinite(parsedQuota) || parsedQuota < 0) {
        return NextResponse.json(
          { error: "Kuota voucher tidak valid." },
          { status: 400 }
        );
      }
      updateData.quota = parsedQuota;
    }

    if (body.startDate !== undefined) {
      if (!body.startDate) {
        updateData.startDate = new Date();
      } else {
        const parsedStart = new Date(body.startDate);
        if (Number.isNaN(parsedStart.getTime())) {
          return NextResponse.json(
            { error: "Format tanggal mulai tidak valid." },
            { status: 400 }
          );
        }
        updateData.startDate = parsedStart;
      }
    }

    if (body.endDate !== undefined) {
      if (body.endDate === null || body.endDate === "") {
        updateData.endDate = null;
      } else {
        const parsedEnd = new Date(body.endDate);
        if (Number.isNaN(parsedEnd.getTime())) {
          return NextResponse.json(
            { error: "Format tanggal tenggat waktu tidak valid." },
            { status: 400 }
          );
        }
        const effectiveStart = updateData.startDate || existing.startDate;
        if (effectiveStart && parsedEnd < effectiveStart) {
          return NextResponse.json(
            { error: "Tanggal tenggat waktu tidak boleh lebih awal dari tanggal mulai berlaku." },
            { status: 400 }
          );
        }
        updateData.endDate = parsedEnd;
      }
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "COUPON_UPDATE",
        entityType: "COUPON",
        entityId: id,
        detailsJson: JSON.stringify({
          code: updated.code,
          value: updated.value,
          endDate: updated.endDate,
          isActive: updated.isActive,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      coupon: updated,
      message: `Voucher "${updated.code}" berhasil diperbarui.`,
    });
  } catch (error: any) {
    console.error("Admin PATCH coupon error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Gagal memperbarui voucher." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    const { id } = await params;

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Voucher tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.coupon.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "COUPON_DELETE",
        entityType: "COUPON",
        entityId: id,
        detailsJson: JSON.stringify({
          code: existing.code,
          usedCount: existing.usedCount,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Voucher "${existing.code}" berhasil dihapus dari sistem.`,
    });
  } catch (error: any) {
    console.error("Admin DELETE coupon error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Gagal menghapus voucher." },
      { status: 500 }
    );
  }
}
