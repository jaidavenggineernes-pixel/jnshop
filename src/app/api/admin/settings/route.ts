import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { id: "default" } });
    return NextResponse.json({ setting });
  } catch (error) {
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
    } = body;

    const cleanWhatsapp = (whatsappNumber || "").replace(/\D/g, "");

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
      },
      update: {
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
      },
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
          aiConfigured: Boolean(geminiApiKey),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      setting: updated,
      message: "Pengaturan toko dan nomor kontak berhasil diperbarui di seluruh website.",
    });
  } catch (error: any) {
    console.error("PUT store settings error:", error);
    if (error?.message === "UNAUTHORIZED" || error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json({ error: "Akses ditolak: Khusus Administrator." }, { status: 403 });
    }
    return NextResponse.json({ error: "Gagal memperbarui pengaturan toko." }, { status: 500 });
  }
}
