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
        heroBadge: true,
        heroTitle: true,
        heroSubtitle: true,
        heroPrimaryBtnText: true,
        heroPrimaryBtnLink: true,
        heroSecondaryBtnText: true,
        heroSecondaryBtnLink: true,
        guarantee1Title: true,
        guarantee1Desc: true,
        guarantee2Title: true,
        guarantee2Desc: true,
        guarantee3Title: true,
        guarantee3Desc: true,
        showcaseBadgeLeft: true,
        showcaseBadgeRight: true,
        showcaseImageUrl: true,
        showcaseTagPill: true,
        showcaseTitle: true,
        showcaseSubtitle: true,
        showcaseLinkText: true,
        showcaseLinkUrl: true,
        showcaseConsultText: true,
      },
    });

    return NextResponse.json({
      success: true,
      setting,
    });
  } catch (error) {
    console.error("Public get settings error:", error);
    return NextResponse.json(
      { error: "Gagal memuat informasi toko" },
      { status: 500 }
    );
  }
}
