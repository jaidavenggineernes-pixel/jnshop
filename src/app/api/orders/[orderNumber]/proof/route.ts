import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInAppNotification } from "@/lib/notifications";
import { saveUploadedImage } from "@/lib/uploads";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const contentType = req.headers.get("content-type") || "";

    let proofUrl = "";
    let note: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const uploadedFile = formData.get("file");
      const rawUrl = formData.get("proofUrl");
      const rawNote = formData.get("note");
      note = typeof rawNote === "string" && rawNote.trim() ? rawNote.trim() : null;

      if (uploadedFile && uploadedFile instanceof File && uploadedFile.size > 0) {
        const saved = await saveUploadedImage("proofs", orderNumber, uploadedFile);
        proofUrl = saved.url;
      } else if (typeof rawUrl === "string" && rawUrl.trim()) {
        proofUrl = rawUrl.trim();
      }
    } else {
      const body = await req.json();
      proofUrl = typeof body.proofUrl === "string" ? body.proofUrl.trim() : "";
      note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;
    }

    if (!proofUrl) {
      return NextResponse.json(
        { error: "Pilih file gambar bukti transfer atau isi tautan gambar." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    // Update payment record
    if (order.payments.length > 0) {
      await prisma.payment.update({
        where: { id: order.payments[0].id },
        data: {
          paymentProofUrl: proofUrl,
          adminVerificationNote: note,
        },
      });
    }

    // Set order status to WAITING_CONFIRMATION
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "WAITING_CONFIRMATION",
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    for (const admin of admins) {
      await sendInAppNotification({
        userId: admin.id,
        title: "Bukti Transfer Masuk",
        message: `Pelanggan telah mengunggah bukti transfer untuk pesanan ${order.orderNumber}. Mohon verifikasi.`,
        type: "PAYMENT",
        linkUrl: `/admin/orders`,
      });
    }

    return NextResponse.json({
      success: true,
      proofUrl,
      message: "Bukti transfer berhasil dikirim. Menunggu verifikasi admin.",
      order: updated,
    });
  } catch (error) {
    console.error("Proof upload error:", error);
    return NextResponse.json({ error: "Gagal menyimpan bukti transfer." }, { status: 500 });
  }
}
