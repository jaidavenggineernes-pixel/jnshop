import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminUser();
    const setting = await prisma.storeSetting.findUnique({ where: { id: "default" } });
    return NextResponse.json({ setting });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to load store settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await req.json();

    const {
      storeName,
      tagLine,
      description,
      email,
      phone,
      whatsappNumber,
      address,
      bannerAnnouncement,
      termsAndConditions,
      privacyPolicy,
      returnPolicy,
      geminiApiKey,
      aiModel,
      // Email & QRIS Notification Settings
      adminNotificationEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      emailFrom,
      resendApiKey,
      // Homepage Hero & Showcase CMS
      heroBadge,
      heroTitle,
      heroSubtitle,
      heroPrimaryBtnText,
      heroPrimaryBtnLink,
      heroSecondaryBtnText,
      heroSecondaryBtnLink,
      guarantee1Title,
      guarantee1Desc,
      guarantee2Title,
      guarantee2Desc,
      guarantee3Title,
      guarantee3Desc,
      showcaseBadgeLeft,
      showcaseBadgeRight,
      showcaseImageUrl,
      showcaseTagPill,
      showcaseTitle,
      showcaseSubtitle,
      showcaseLinkText,
      showcaseLinkUrl,
      showcaseConsultText,
    } = body;

    const cleanWhatsapp = (whatsappNumber || "").replace(/\D/g, "");

    const updatePayload: any = {
      storeName,
      tagLine,
      description,
      email,
      phone,
      whatsappNumber: cleanWhatsapp,
      address,
      bannerAnnouncement,
      termsAndConditions,
      privacyPolicy,
      returnPolicy,
      geminiApiKey,
      aiModel,
    };

    if (adminNotificationEmail !== undefined) {
      updatePayload.adminNotificationEmail = String(adminNotificationEmail).trim() || null;
    }
    if (smtpHost !== undefined) {
      updatePayload.smtpHost = String(smtpHost).trim() || null;
    }
    if (smtpPort !== undefined && smtpPort !== "") {
      const parsedPort = Number.parseInt(String(smtpPort), 10);
      updatePayload.smtpPort = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 587;
    }
    if (smtpUser !== undefined) {
      updatePayload.smtpUser = String(smtpUser).trim() || null;
    }
    if (smtpPass !== undefined) {
      updatePayload.smtpPass = String(smtpPass).trim() || null;
    }
    if (emailFrom !== undefined) {
      updatePayload.emailFrom = String(emailFrom).trim() || null;
    }
    if (resendApiKey !== undefined) {
      updatePayload.resendApiKey = String(resendApiKey).trim() || null;
    }

    if (heroBadge !== undefined) updatePayload.heroBadge = heroBadge;
    if (heroTitle !== undefined) updatePayload.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) updatePayload.heroSubtitle = heroSubtitle;
    if (heroPrimaryBtnText !== undefined) updatePayload.heroPrimaryBtnText = heroPrimaryBtnText;
    if (heroPrimaryBtnLink !== undefined) updatePayload.heroPrimaryBtnLink = heroPrimaryBtnLink;
    if (heroSecondaryBtnText !== undefined) updatePayload.heroSecondaryBtnText = heroSecondaryBtnText;
    if (heroSecondaryBtnLink !== undefined) updatePayload.heroSecondaryBtnLink = heroSecondaryBtnLink;

    if (guarantee1Title !== undefined) updatePayload.guarantee1Title = guarantee1Title;
    if (guarantee1Desc !== undefined) updatePayload.guarantee1Desc = guarantee1Desc;
    if (guarantee2Title !== undefined) updatePayload.guarantee2Title = guarantee2Title;
    if (guarantee2Desc !== undefined) updatePayload.guarantee2Desc = guarantee2Desc;
    if (guarantee3Title !== undefined) updatePayload.guarantee3Title = guarantee3Title;
    if (guarantee3Desc !== undefined) updatePayload.guarantee3Desc = guarantee3Desc;

    if (showcaseBadgeLeft !== undefined) updatePayload.showcaseBadgeLeft = showcaseBadgeLeft;
    if (showcaseBadgeRight !== undefined) updatePayload.showcaseBadgeRight = showcaseBadgeRight;
    if (showcaseImageUrl !== undefined) updatePayload.showcaseImageUrl = showcaseImageUrl;
    if (showcaseTagPill !== undefined) updatePayload.showcaseTagPill = showcaseTagPill;
    if (showcaseTitle !== undefined) updatePayload.showcaseTitle = showcaseTitle;
    if (showcaseSubtitle !== undefined) updatePayload.showcaseSubtitle = showcaseSubtitle;
    if (showcaseLinkText !== undefined) updatePayload.showcaseLinkText = showcaseLinkText;
    if (showcaseLinkUrl !== undefined) updatePayload.showcaseLinkUrl = showcaseLinkUrl;
    if (showcaseConsultText !== undefined) updatePayload.showcaseConsultText = showcaseConsultText;

    const updated = await prisma.storeSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        storeName: storeName || "JNshop",
        tagLine: tagLine || "",
        description: description || "",
        email: email || "owner@jnshop.com",
        phone: phone || "+62 851-9121-9129",
        whatsappNumber: cleanWhatsapp || "6285191219129",
        address: address || "Jakarta, Indonesia",
        bannerAnnouncement: bannerAnnouncement || null,
        termsAndConditions: termsAndConditions || null,
        privacyPolicy: privacyPolicy || null,
        returnPolicy: returnPolicy || null,
        geminiApiKey: geminiApiKey || null,
        aiModel: aiModel || "gemini-2.5-flash",
        ...updatePayload,
      },
      update: updatePayload,
    });

    // Revalidate paths so storefront and layouts update immediately
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/help");
      revalidatePath("/admin/settings");
    } catch (e) {
      console.warn("Revalidate path warning:", e);
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "STORE_SETTINGS_UPDATE",
        entityType: "STORE_SETTING",
        entityId: "default",
        detailsJson: JSON.stringify({
          storeName,
          phone,
          whatsappNumber: cleanWhatsapp,
          heroTitle: heroTitle?.substring(0, 50),
          aiConfigured: Boolean(geminiApiKey),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      setting: updated,
      message: "Seluruh pengaturan dan konten halaman beranda toko berhasil disimpan & diperbarui secara live.",
    });
  } catch (error: any) {
    console.error("PUT store settings error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json({ error: "Gagal memperbarui pengaturan toko." }, { status: 500 });
  }
}
