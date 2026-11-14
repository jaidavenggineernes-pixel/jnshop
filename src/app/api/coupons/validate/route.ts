import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Kode voucher wajib diisi." }, { status: 400 });
    }

    const cleanCode = String(code).toUpperCase().trim();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: `Kode voucher "${cleanCode}" tidak ditemukan atau telah dinonaktifkan.` },
        { status: 404 }
      );
    }

    const now = new Date();

    if (coupon.startDate && new Date(coupon.startDate) > now) {
      const startStr = new Date(coupon.startDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return NextResponse.json(
        { error: `Voucher "${cleanCode}" baru dapat digunakan mulai tanggal ${startStr}.` },
        { status: 400 }
      );
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      const endStr = new Date(coupon.endDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return NextResponse.json(
        { error: `Masa berlaku voucher "${cleanCode}" telah berakhir pada tanggal ${endStr}.` },
        { status: 400 }
      );
    }

    if (coupon.quota <= coupon.usedCount) {
      return NextResponse.json(
        { error: `Kuota penggunaan voucher "${cleanCode}" sudah habis (${coupon.usedCount}/${coupon.quota} kuota terpakai).` },
        { status: 400 }
      );
    }

    const numericSubtotal = Number(subtotal) || 0;
    if (numericSubtotal < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimal belanja untuk menggunakan voucher "${cleanCode}" adalah ${formatRupiah(coupon.minPurchase)}. Belanja Anda saat ini ${formatRupiah(numericSubtotal)}.`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (numericSubtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.value, numericSubtotal);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        endDate: coupon.endDate,
      },
      discountAmount,
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem validasi voucher." }, { status: 500 });
  }
}
