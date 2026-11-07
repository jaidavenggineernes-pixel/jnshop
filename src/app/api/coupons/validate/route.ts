import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Kode voucher wajib diisi." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Kode voucher tidak valid atau telah berakhir." }, { status: 404 });
    }

    if (coupon.quota <= coupon.usedCount) {
      return NextResponse.json({ error: "Kuota penggunaan voucher ini sudah habis." }, { status: 400 });
    }

    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
      return NextResponse.json({ error: "Masa berlaku voucher telah berakhir." }, { status: 400 });
    }

    if (subtotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimal belanja untuk menggunakan voucher ini adalah Rp ${coupon.minPurchase.toLocaleString("id-ID")}`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
      },
      discountAmount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem validasi voucher." }, { status: 500 });
  }
}
