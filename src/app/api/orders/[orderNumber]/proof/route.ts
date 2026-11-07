import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendInAppNotification } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const { proofUrl, note } = await req.json();

    if (!proofUrl) {
      return NextResponse.json({ error: "URL bukti transfer wajib diisi." }, { status: 400 });
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
          adminVerificationNote: note || null,
        },
      });
    }

    // Set order status to WAITING_CONFIRMATION (Requires admin review!)
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
      message: "Bukti transfer berhasil dikirim. Menunggu verifikasi admin.",
      order: updated,
    });
  } catch (error) {
    console.error("Proof upload error:", error);
    return NextResponse.json({ error: "Gagal menyimpan bukti transfer." }, { status: 500 });
  }
}
