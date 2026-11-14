import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat daftar voucher." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await req.json();
    const {
      code,
      description,
      type,
      value,
      minPurchase,
      maxDiscount,
      quota,
      startDate,
      endDate,
      isActive,
    } = body;

    if (!code || value === undefined || value === "") {
      return NextResponse.json(
        { error: "Kode voucher dan nilai potongan wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = String(code).toUpperCase().trim();
    if (!cleanCode) {
      return NextResponse.json(
        { error: "Kode voucher tidak valid." },
        { status: 400 }
      );
    }

    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json(
        { error: `Kode voucher "${cleanCode}" sudah digunakan.` },
        { status: 400 }
      );
    }

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return NextResponse.json(
        { error: "Nilai potongan voucher harus berupa angka lebih besar dari 0." },
        { status: 400 }
      );
    }

    const effectiveType = type === "FIXED" ? "FIXED" : "PERCENTAGE";
    if (effectiveType === "PERCENTAGE" && parsedValue > 100) {
      return NextResponse.json(
        { error: "Diskon persentase tidak boleh melebihi 100%." },
        { status: 400 }
      );
    }

    let parsedStart = new Date();
    if (startDate) {
      const s = new Date(startDate);
      if (!Number.isNaN(s.getTime())) {
        parsedStart = s;
      }
    }

    let parsedEnd: Date | null = null;
    if (endDate) {
      const e = new Date(endDate);
      if (Number.isNaN(e.getTime())) {
        return NextResponse.json(
          { error: "Format tanggal tenggat waktu tidak valid." },
          { status: 400 }
        );
      }
      if (e < parsedStart) {
        return NextResponse.json(
          { error: "Tanggal tenggat waktu tidak boleh lebih awal dari tanggal mulai berlaku." },
          { status: 400 }
        );
      }
      parsedEnd = e;
    }

    const parsedMin = Number(minPurchase);
    const parsedMax = maxDiscount ? Number(maxDiscount) : null;
    const parsedQuota = parseInt(String(quota), 10);

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description?.trim() || null,
        type: effectiveType,
        value: parsedValue,
        minPurchase: Number.isFinite(parsedMin) && parsedMin >= 0 ? parsedMin : 0,
        maxDiscount: effectiveType === "PERCENTAGE" && parsedMax && parsedMax > 0 ? parsedMax : null,
        quota: Number.isFinite(parsedQuota) && parsedQuota > 0 ? parsedQuota : 100,
        startDate: parsedStart,
        endDate: parsedEnd,
        isActive: isActive !== false,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "COUPON_CREATE",
        entityType: "COUPON",
        entityId: coupon.id,
        detailsJson: JSON.stringify({
          code: coupon.code,
          value: coupon.value,
          endDate: coupon.endDate,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      coupon,
      message: `Voucher "${coupon.code}" berhasil dibuat.`,
    });
  } catch (error: any) {
    console.error("Admin POST coupon error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json({ error: "Gagal membuat voucher." }, { status: 500 });
  }
}
