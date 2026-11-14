import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { formatRupiah } from "@/lib/utils";
import { escapeHtml, getEmailConfiguration, sendTransactionalEmail } from "@/lib/email";
import { sendInAppNotification } from "@/lib/notifications";
import { saveUploadedImage } from "@/lib/uploads";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const customerEmail = order.customerEmail?.trim();
    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json(
        { error: "Pesanan ini tidak memiliki alamat email pelanggan yang valid." },
        { status: 400 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let qrisImageFile: File | null = null;
    let qrisExternalUrl = "";
    let adminMessage = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const maybeFile = formData.get("qrisImage");
      if (maybeFile instanceof File && maybeFile.size > 0) {
        qrisImageFile = maybeFile;
      }
      qrisExternalUrl = String(formData.get("qrisUrl") || "").trim();
      adminMessage = String(formData.get("adminMessage") || "").trim();
    } else {
      const body = await req.json();
      qrisExternalUrl = String(body.qrisUrl || "").trim();
      adminMessage = String(body.adminMessage || "").trim();
    }

    if (!qrisImageFile && !qrisExternalUrl && !adminMessage) {
      return NextResponse.json(
        { error: "Lampirkan gambar QRIS, tautan QRIS, atau pesan untuk pelanggan." },
        { status: 400 }
      );
    }

    let uploadedQris: {
      url: string;
      buffer: Buffer;
      filename: string;
      contentType: string;
    } | null = null;

    if (qrisImageFile) {
      try {
        uploadedQris = await saveUploadedImage("qris", order.orderNumber, qrisImageFile);
      } catch (err: any) {
        return NextResponse.json(
          { error: err?.message || "Gagal mengunggah gambar QRIS." },
          { status: 400 }
        );
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const emailCfg = await getEmailConfiguration();
    const orderUrl = `${appUrl}/orders/${encodeURIComponent(order.orderNumber)}`;
    const exactNominal = formatRupiah(order.grandTotal);

    const itemsListHtml = order.items
      .map(
        (i) =>
          `<li style="margin-bottom: 4px;">${escapeHtml(i.productName)} (x${i.quantity}) : <strong>${escapeHtml(
            formatRupiah(i.subtotal)
          )}</strong></li>`
      )
      .join("");

    const defaultIntro =
      adminMessage ||
      `Berikut adalah kode QRIS resmi JNshop dengan nominal tepat ${exactNominal} untuk pesanan #${order.orderNumber}.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 14px; background: #ffffff; color: #18181b;">
        <div style="border-bottom: 1px solid #e4e4e7; padding-bottom: 14px; margin-bottom: 18px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #166534; font-weight: 700;">JNshop Pembayaran QRIS</div>
          <h2 style="margin: 4px 0 0 0; font-size: 19px;">Kode QRIS Pesanan #${escapeHtml(order.orderNumber)}</h2>
        </div>

        <p style="font-size: 14px; color: #27272a; line-height: 1.6;">
          Halo <strong>${escapeHtml(order.recipientName)}</strong>,<br/>
          ${escapeHtml(defaultIntro).replace(/\n/g, "<br/>")}
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <div style="font-size: 12px; color: #166534; font-weight: 600;">Nominal Tagihan Tepat</div>
          <div style="font-size: 24px; font-weight: 800; color: #14532d; margin-top: 2px;">${escapeHtml(exactNominal)}</div>
          <div style="font-size: 12px; color: #166534; margin-top: 4px;">No. Pesanan: <strong style="font-family: monospace;">${escapeHtml(order.orderNumber)}</strong></div>
        </div>

        ${
          uploadedQris
            ? `<div style="text-align: center; padding: 16px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; margin: 16px 0;">
                <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; color: #27272a;">Scan Kode QRIS di Bawah Ini:</p>
                <img src="cid:qris-code-image" alt="Kode QRIS Pesanan ${escapeHtml(order.orderNumber)}" style="max-width: 280px; width: 100%; height: auto; border-radius: 8px; border: 1px solid #d4d4d8;" />
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #52525b;">(Gambar QRIS juga dilampirkan pada email ini jika tidak muncul otomatis.)</p>
              </div>`
            : ""
        }

        ${
          qrisExternalUrl
            ? `<div style="margin: 16px 0; padding: 14px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; font-size: 13px;">
                <div style="font-weight: 600; margin-bottom: 6px;">Tautan Kode QRIS:</div>
                <a href="${escapeHtml(qrisExternalUrl)}" style="color: #166534; word-break: break-all;">${escapeHtml(qrisExternalUrl)}</a>
              </div>`
            : ""
        }

        <div style="margin: 16px 0; font-size: 13px; color: #27272a;">
          <strong>Rincian Pesanan Anda:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            ${itemsListHtml}
          </ul>
        </div>

        <div style="font-size: 13px; color: #52525b; background: #f4f4f5; padding: 14px; border-radius: 10px; margin-top: 16px;">
          Setelah menyelesaikan pembayaran, unggah screenshot bukti bayar melalui halaman pesanan Anda atau balas email ini / konfirmasi via WhatsApp admin:
          <div style="margin-top: 10px;">
            <a href="${orderUrl}" style="display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 12px;">
              Buka Halaman Pesanan
            </a>
          </div>
        </div>
      </div>
    `;

    const text = [
      `Halo ${order.recipientName},`,
      "",
      defaultIntro,
      "",
      `No. Pesanan: ${order.orderNumber}`,
      `Nominal Tepat: ${exactNominal}`,
      qrisExternalUrl ? `Tautan QRIS: ${qrisExternalUrl}` : "",
      "",
      `Halaman Pesanan / Unggah Bukti Bayar: ${orderUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    const emailResult = await sendTransactionalEmail({
      to: customerEmail,
      replyTo: emailCfg.adminNotificationEmail,
      subject: `Kode QRIS Pembayaran Pesanan #${order.orderNumber} (${exactNominal}) - JNshop`,
      html,
      text,
      attachments: uploadedQris
        ? [
            {
              filename: `QRIS-${order.orderNumber}${uploadedQris.filename.slice(uploadedQris.filename.lastIndexOf("."))}`,
              content: uploadedQris.buffer,
              contentType: uploadedQris.contentType,
              cid: "qris-code-image",
            },
          ]
        : undefined,
    });

    const qrisSentAt = new Date().toISOString();
    const payment = order.payments?.[0];
    let existingPayload: Record<string, any> = {};

    if (payment?.paymentGatewayPayload) {
      try {
        existingPayload = JSON.parse(payment.paymentGatewayPayload);
      } catch {
        // ignore
      }
    }

    const updatedPayloadObj = {
      ...existingPayload,
      qrisSentAt,
      qrisSentBy: admin.email,
      qrisSentTo: customerEmail,
      qrisImageUrl: uploadedQris?.url || existingPayload.qrisImageUrl || null,
      qrisExternalUrl: qrisExternalUrl || existingPayload.qrisExternalUrl || null,
      qrisAdminMessage: adminMessage || defaultIntro,
      qrisCustomerEmailStatus: emailResult.sent ? "SENT" : "NOT_SENT",
      qrisCustomerEmailProvider: emailResult.provider,
      qrisCustomerEmailError: emailResult.error || null,
    };

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentGatewayPayload: JSON.stringify(updatedPayloadObj),
          adminVerificationNote: adminMessage || payment.adminVerificationNote,
        },
      });
    }

    if (order.userId) {
      await sendInAppNotification({
        userId: order.userId,
        title: `Kode QRIS Pesanan ${order.orderNumber} Telah Dikirim`,
        message: `Admin telah mengirimkan kode QRIS nominal ${exactNominal} ke email ${customerEmail}.`,
        type: "PAYMENT",
        linkUrl: `/orders/${order.orderNumber}`,
      });
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "QRIS_SENT_TO_CUSTOMER",
        entityType: "ORDER",
        entityId: order.id,
        detailsJson: JSON.stringify({
          orderNumber: order.orderNumber,
          customerEmail,
          emailSent: emailResult.sent,
          provider: emailResult.provider,
          hasUploadedImage: Boolean(uploadedQris),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      emailSent: emailResult.sent,
      provider: emailResult.provider,
      emailError: emailResult.error || null,
      qrisSentAt,
      qrisImageUrl: updatedPayloadObj.qrisImageUrl,
      paymentGatewayPayload: JSON.stringify(updatedPayloadObj),
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized" || err?.message === "Forbidden") {
      return NextResponse.json({ error: "Akses admin diperlukan." }, { status: 403 });
    }
    console.error("Send QRIS error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal memproses pengiriman QRIS." },
      { status: 500 }
    );
  }
}
