import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { id: "default" },
      select: {
        id: true,
        storeName: true,
        tagLine: true,
        description: true,
        logoUrl: true,
        email: true,
        phone: true,
        whatsappNumber: true,
        address: true,
        bannerAnnouncement: true,
        termsAndConditions: true,
        privacyPolicy: true,
        returnPolicy: true,
        socialMediaJson: true,
        currency: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      setting: setting || {
        storeName: "JNshop",
        tagLine: "Toko Online Pribadi Terpercaya & Modern",
        description: "Platform e-commerce resmi JNshop menjual produk fisik berkualitas premium dan produk digital terlengkap.",
        email: "owner@jnshop.com",
        phone: "+62 851-9121-9129",
        whatsappNumber: "6285191219129",
        address: "Jl. Ciputat Raya, Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310",
        bannerAnnouncement: "🎉 PROMO SPESIAL: Gunakan voucher JNSHOPNEW untuk diskon 15% pada order pertama Anda!",
      },
    });
  } catch (error) {
    console.error("Public get settings error:", error);
    return NextResponse.json(
      { error: "Gagal memuat informasi toko" },
      { status: 500 }
    );
  }
}
