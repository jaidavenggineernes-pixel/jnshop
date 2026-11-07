import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const body = await req.json();
    const { code, description, type, value, minPurchase, maxDiscount, quota } = body;

    if (!code || !value) {
      return NextResponse.json({ error: "Kode voucher dan nilai potongan wajib diisi." }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await prisma.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: "Kode voucher ini sudah digunakan." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description?.trim() || null,
        type: type || "PERCENTAGE",
        value: parseFloat(value),
        minPurchase: parseFloat(minPurchase) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        quota: parseInt(quota) || 100,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat kupon." }, { status: 500 });
  }
}
