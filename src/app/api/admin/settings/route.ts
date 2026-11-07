import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

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

    const updated = await prisma.storeSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        storeName: storeName || "JNshop",
        tagLine: tagLine || "",
        description: description || "",
        email: email || "owner@jnshop.com",
        phone: phone || "+6281234567890",
        whatsappNumber: whatsappNumber || "6281234567890",
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
        whatsappNumber,
        address,
        bannerAnnouncement,
        termsAndConditions,
        privacyPolicy,
        returnPolicy,
        geminiApiKey,
        aiModel,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "STORE_SETTINGS_UPDATE",
        entityType: "STORE_SETTING",
        entityId: "default",
        detailsJson: JSON.stringify({ storeName, aiConfigured: Boolean(geminiApiKey) }),
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui pengaturan toko." }, { status: 500 });
  }
}
