import { prisma } from "./prisma";
import { formatRupiah } from "./utils";
import { escapeHtml, getEmailConfiguration, sendTransactionalEmail } from "./email";

interface NotificationPayload {
  userId?: string | null;
  title: string;
  message: string;
  type: "ORDER" | "PAYMENT" | "PROMO" | "SYSTEM" | "STOCK_ALERT";
  linkUrl?: string;
}

export async function sendInAppNotification(payload: NotificationPayload) {
  try {
    return await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        linkUrl: payload.linkUrl,
      },
    });
  } catch (err) {
    console.error("Failed to create in-app notification:", err);
    return null;
  }
}

export function formatWhatsAppOrderMessage(order: {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  notes?: string | null;
  items: { productName: string; quantity: number; subtotal: number }[];
}): string {
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. ${item.productName} (x${item.quantity}) - ${formatRupiah(item.subtotal)}`)
    .join("\n");

  const notesSection = order.notes?.trim() ? `\nCatatan     : ${order.notes.trim()}` : "";

  return `*JNSHOP: NOTIFIKASI PESANAN*
---------------------------------------
No. Pesanan : *${order.orderNumber}*
Status      : *${order.status}*
Penerima    : ${order.recipientName} (${order.recipientPhone})
Metode Bayar: ${order.paymentMethod}
Total Bayar : *${formatRupiah(order.grandTotal)}*${notesSection}

*Daftar Produk:*
${itemsText}

---------------------------------------
Terima kasih telah berbelanja di *JNshop*!
Pantau pesanan Anda di: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${order.orderNumber}`;
}

export function formatAdminQRISAlertMessage(order: {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  customerEmail?: string | null;
  notes?: string | null;
  grandTotal: number;
  items?: { productName: string; quantity: number; subtotal: number }[];
}): string {
  const itemsText = (order.items || [])
    .map((item, idx) => `  ${idx + 1}. ${item.productName} (x${item.quantity}) - ${formatRupiah(item.subtotal)}`)
    .join("\n");

  const notesLine = order.notes?.trim()
    ? `\nPesan Tambahan: ${order.notes.trim()}`
    : "";

  return `*[PESANAN QRIS BARU: JNSHOP]*
----------------------------------------------
Halo Admin, ada pesanan baru menggunakan *QRIS* yang membutuhkan pengiriman kode QRIS sesuai nominal belanja:

No. Pesanan     : ${order.orderNumber}
Nominal Tepat   : *${formatRupiah(order.grandTotal)}*
Nama Pelanggan  : ${order.recipientName}
Email Pelanggan : *${order.customerEmail || "-"}*
WhatsApp Cust   : ${order.recipientPhone}${notesLine}

*Rincian Produk:*
${itemsText || "  (Lihat detail di dashboard admin)"}

----------------------------------------------
Tindakan Diperlukan:
Kirimkan kode QRIS dengan nominal presisi *${formatRupiah(order.grandTotal)}* ke email pelanggan (*${order.customerEmail || "-"}*) melalui dashboard admin atau balas email notifikasi.

Kelola di Admin Panel:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders`;
}

export {
  createCustomerToAdminQRISUrl,
  createAdminToCustomerQRISUrl,
  createWhatsAppChatUrl,
} from "./notification-links";

function parseShippingSummary(shippingAddressJson?: string | null): string {
  if (!shippingAddressJson) return "";
  try {
    const addr = JSON.parse(shippingAddressJson);
    return [addr.streetAddress, addr.district, addr.city, addr.province, addr.postalCode]
      .filter(Boolean)
      .join(", ");
  } catch {
    return "";
  }
}

export async function notifyNewOrder(order: any, customerUser?: any) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const emailCfg = await getEmailConfiguration();

  // 1. Notify Customer in-app
  if (order.userId) {
    await sendInAppNotification({
      userId: order.userId,
      title: "Pesanan Berhasil Dibuat",
      message: `Pesanan ${order.orderNumber} berhasil dibuat dengan total ${formatRupiah(order.grandTotal)}.`,
      type: "ORDER",
      linkUrl: `/orders/${order.orderNumber}`,
    });
  }

  // 2. Notify Admin in-app
  const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN" } });
  for (const admin of adminUsers) {
    await sendInAppNotification({
      userId: admin.id,
      title: "Pesanan Baru Masuk",
      message: `Ada pesanan baru ${order.orderNumber} dari ${order.recipientName} sebesar ${formatRupiah(order.grandTotal)}.`,
      type: "ORDER",
      linkUrl: `/admin/orders`,
    });
  }

  // 3. Send WhatsApp to customer if WhatsApp Cloud API configured
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneId && order.recipientPhone) {
    try {
      const messageBody = formatWhatsAppOrderMessage(order);
      await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: order.recipientPhone.replace(/\D/g, ""),
          type: "text",
          text: { body: messageBody },
        }),
      });
    } catch (e) {
      console.error("WhatsApp Cloud API error:", e);
    }
  }

  const custEmail = order.customerEmail?.trim() || customerUser?.email?.trim() || "";
  const isQris =
    order.paymentMethod === "QRIS_INSTANT" ||
    order.payments?.[0]?.paymentMethod === "QRIS_INSTANT" ||
    order.payments?.[0]?.paymentChannel === "QRIS_INSTANT";

  // 4. Send customer order confirmation if non-QRIS & email exists (for QRIS, admin sends exact QRIS directly to custEmail)
  if (!isQris && custEmail) {
    await sendTransactionalEmail({
      to: custEmail,
      subject: `Konfirmasi Pesanan #${order.orderNumber} - JNshop`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background: #ffffff; color: #18181b;">
          <h2 style="margin: 0 0 8px 0; font-size: 18px;">Terima Kasih Atas Pesanan Anda</h2>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #52525b;">Pesanan Anda sedang diproses oleh tim JNshop.</p>
          <p style="font-size: 14px;">No. Pesanan: <strong style="font-family: monospace;">${escapeHtml(order.orderNumber)}</strong></p>
          <p style="font-size: 14px;">Total: <strong>${escapeHtml(formatRupiah(order.grandTotal))}</strong></p>
          <p style="font-size: 14px;">Metode Pembayaran: ${escapeHtml(order.payments?.[0]?.paymentMethod || order.paymentMethod || "Transfer")}</p>
          <p style="margin-top: 20px;">
            <a href="${appUrl}/orders/${encodeURIComponent(order.orderNumber)}" style="display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 13px;">Lihat Status Pesanan</a>
          </p>
        </div>
      `,
    });
  }

  // 5. DEDICATED QRIS ADMIN NOTIFICATION (Automatic Email to Admin + Additional Notes + Details)
  if (isQris) {
    const adminEmail = emailCfg.adminNotificationEmail;
    const adminPhone = process.env.ADMIN_NOTIFICATION_WHATSAPP || "6285191219129";
    const shippingText = parseShippingSummary(order.shippingAddressJson);
    const customerNotes = order.notes?.trim() || "";

    for (const admin of adminUsers) {
      await sendInAppNotification({
        userId: admin.id,
        title: `[QRIS] Pesanan ${order.orderNumber} Masuk: Kirim QRIS ke ${custEmail || order.recipientPhone}`,
        message: `Pelanggan ${order.recipientName} (${custEmail || "-"}) menunggu kode QRIS nominal ${formatRupiah(order.grandTotal)}.${customerNotes ? ` Catatan: "${customerNotes}"` : ""}`,
        type: "PAYMENT",
        linkUrl: `/admin/orders`,
      });
    }

    const itemsListHtml = (order.items || [])
      .map(
        (i: any) =>
          `<li style="margin-bottom: 6px;"><strong>${escapeHtml(i.productName || "Item")}</strong> (x${i.quantity}) : <strong>${escapeHtml(
            formatRupiah(i.subtotal || i.productPrice * i.quantity)
          )}</strong></li>`
      )
      .join("");

    const itemsPlain = (order.items || [])
      .map(
        (i: any, idx: number) =>
          `${idx + 1}. ${i.productName || "Item"} (x${i.quantity}) : ${formatRupiah(
            i.subtotal || i.productPrice * i.quantity
          )}`
      )
      .join("\n");

    const qrisEmailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 620px; margin: auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 14px; background: #ffffff; color: #18181b;">
        <div style="background: #18181b; color: #ffffff; padding: 18px 20px; border-radius: 10px; margin-bottom: 20px;">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #86efac; font-weight: 700;">Notifikasi Otomatis Pesanan QRIS</div>
          <h2 style="margin: 4px 0 0 0; font-size: 18px;">Pesanan Baru #${escapeHtml(order.orderNumber)}</h2>
        </div>

        <p style="font-size: 14px; color: #27272a; line-height: 1.6;">
          Pelanggan memilih metode pembayaran <strong>QRIS</strong> dan menunggu pengiriman kode QRIS dengan nominal tepat ke alamat email di bawah ini.
        </p>

        <div style="background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; font-size: 13px; color: #18181b; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #52525b; width: 170px;">No. Pesanan:</td>
              <td style="padding: 6px 0; font-weight: 700; font-family: monospace;">${escapeHtml(order.orderNumber)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #52525b;">Nominal Tagihan Tepat:</td>
              <td style="padding: 6px 0; font-weight: 800; font-size: 16px; color: #166534;">${escapeHtml(formatRupiah(order.grandTotal))}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #52525b;">Email Pelanggan:</td>
              <td style="padding: 6px 0; font-weight: 700;"><a href="mailto:${escapeHtml(custEmail)}" style="color: #166534;">${escapeHtml(custEmail || "Tidak tercantum")}</a></td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #52525b;">Nama Pelanggan:</td>
              <td style="padding: 6px 0; font-weight: 600;">${escapeHtml(order.recipientName)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #52525b;">WhatsApp Pelanggan:</td>
              <td style="padding: 6px 0; font-weight: 600;">${escapeHtml(order.recipientPhone)}</td>
            </tr>
            ${
              shippingText
                ? `<tr><td style="padding: 6px 0; color: #52525b; vertical-align: top;">Alamat Pengiriman:</td><td style="padding: 6px 0;">${escapeHtml(shippingText)}</td></tr>`
                : ""
            }
          </table>
        </div>

        ${
          customerNotes
            ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin: 16px 0;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e; margin-bottom: 4px;">Pesan Tambahan dari Pelanggan:</div>
                <div style="font-size: 13px; color: #451a03; white-space: pre-wrap;">${escapeHtml(customerNotes)}</div>
              </div>`
            : ""
        }

        <div style="margin: 16px 0; font-size: 13px; color: #27272a;">
          <strong>Rincian Item & Tagihan:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            ${itemsListHtml}
          </ul>
          <div style="font-size: 12px; color: #52525b; border-top: 1px solid #e4e4e7; padding-top: 8px; margin-top: 8px;">
            Subtotal: ${escapeHtml(formatRupiah(order.totalAmount))} |
            Diskon: -${escapeHtml(formatRupiah(order.discountAmount || 0))} |
            Ongkir: ${escapeHtml(formatRupiah(order.shippingFee || 0))} |
            <strong>Total Akhir: ${escapeHtml(formatRupiah(order.grandTotal))}</strong>
          </div>
        </div>

        <div style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
          <a href="${appUrl}/admin/orders" style="display: inline-block; background: #166534; color: #ffffff; text-decoration: none; padding: 11px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-right: 10px;">
            Buka Admin & Kirim QRIS ke Pelanggan
          </a>
          ${
            custEmail
              ? `<a href="mailto:${escapeHtml(custEmail)}?subject=${encodeURIComponent(
                  `Kode QRIS Pembayaran Pesanan #${order.orderNumber} (${formatRupiah(order.grandTotal)}) - JNshop`
                )}" style="display: inline-block; background: #f4f4f5; color: #18181b; text-decoration: none; padding: 11px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; border: 1px solid #d4d4d8;">
                  Balas Langsung via Email
                </a>`
              : ""
          }
        </div>
      </div>
    `;

    const qrisEmailText = [
      `PESANAN QRIS BARU #${order.orderNumber} - JNSHOP`,
      `Nominal Tepat: ${formatRupiah(order.grandTotal)}`,
      `Nama: ${order.recipientName}`,
      `Email Pelanggan: ${custEmail || "-"}`,
      `WhatsApp: ${order.recipientPhone}`,
      customerNotes ? `Pesan Tambahan: ${customerNotes}` : "",
      shippingText ? `Alamat: ${shippingText}` : "",
      "",
      "Daftar Produk:",
      itemsPlain,
      "",
      `Kelola & Kirim QRIS di: ${appUrl}/admin/orders`,
    ]
      .filter(Boolean)
      .join("\n");

    const emailResult = await sendTransactionalEmail({
      to: adminEmail,
      replyTo: custEmail || undefined,
      subject: `[PESANAN QRIS] #${order.orderNumber} (${formatRupiah(order.grandTotal)}) dari ${order.recipientName}`,
      html: qrisEmailHtml,
      text: qrisEmailText,
    });

    // Save email dispatch status into Payment.paymentGatewayPayload for transparency in Admin
    const paymentId = order.payments?.[0]?.id;
    if (paymentId) {
      let existingPayload: Record<string, any> = {};
      try {
        if (order.payments[0].paymentGatewayPayload) {
          existingPayload = JSON.parse(order.payments[0].paymentGatewayPayload);
        }
      } catch {
        // ignore parse fallback
      }

      const nextPayload = {
        ...existingPayload,
        adminNotifiedAt: new Date().toISOString(),
        adminEmailTo: adminEmail,
        adminEmailStatus: emailResult.sent ? "SENT" : "NOT_SENT",
        adminEmailProvider: emailResult.provider,
        adminEmailError: emailResult.error || null,
      };

      await prisma.payment.update({
        where: { id: paymentId },
        data: { paymentGatewayPayload: JSON.stringify(nextPayload) },
      });
    }

    // Optional WhatsApp Cloud API Admin alert if configured
    if (token && phoneId) {
      try {
        const qrisAdminMessage = formatAdminQRISAlertMessage({
          orderNumber: order.orderNumber,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          customerEmail: custEmail,
          notes: order.notes,
          grandTotal: order.grandTotal,
          items: order.items,
        });

        await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: adminPhone.replace(/\D/g, ""),
            type: "text",
            text: { body: qrisAdminMessage },
          }),
        });
      } catch (err) {
        console.error("Failed to send QRIS admin WhatsApp notification:", err);
      }
    }

    console.log(
      `[QRIS ADMIN EMAIL] Order #${order.orderNumber} -> ${adminEmail} | status=${emailResult.sent ? "SENT" : "NOT_SENT"} provider=${emailResult.provider}${emailResult.error ? ` err=${emailResult.error}` : ""}`
    );
  }
}

export async function notifyPaymentVerified(order: any) {
  if (order.userId) {
    await sendInAppNotification({
      userId: order.userId,
      title: "Pembayaran Dikonfirmasi",
      message: `Pembayaran untuk pesanan ${order.orderNumber} telah diverifikasi. Pesanan Anda segera kami proses.`,
      type: "PAYMENT",
      linkUrl: `/orders/${order.orderNumber}`,
    });
  }
}

export async function notifyOrderShipped(order: any, trackingNumber: string, courier: string) {
  if (order.userId) {
    await sendInAppNotification({
      userId: order.userId,
      title: "Pesanan Dalam Pengiriman",
      message: `Pesanan ${order.orderNumber} sedang dikirim via ${courier} dengan No. Resi ${trackingNumber}.`,
      type: "ORDER",
      linkUrl: `/orders/${order.orderNumber}`,
    });
  }
}
