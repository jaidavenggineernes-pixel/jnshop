import { prisma } from "./prisma";
import { formatRupiah } from "./utils";

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

/**
 * Generate formatted WhatsApp message text
 */
export function formatWhatsAppOrderMessage(order: {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  items: { productName: string; quantity: number; subtotal: number }[];
}): string {
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. ${item.productName} (x${item.quantity}) - ${formatRupiah(item.subtotal)}`)
    .join("\n");

  return `*🛍️ JNSHOP — NOTIFIKASI PESANAN*
---------------------------------------
No. Pesanan : *${order.orderNumber}*
Status      : *${order.status}*
Penerima    : ${order.recipientName} (${order.recipientPhone})
Metode Bayar: ${order.paymentMethod}
Total Bayar : *${formatRupiah(order.grandTotal)}*

*Daftar Produk:*
${itemsText}

---------------------------------------
Terima kasih telah berbelanja di *JNshop*!
Pantau pesanan Anda di: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${order.orderNumber}`;
}

/**
 * Generate formatted WhatsApp alert for Admin specifically for QRIS orders
 */
export function formatAdminQRISAlertMessage(order: {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  customerEmail?: string | null;
  grandTotal: number;
  items?: { productName: string; quantity: number; subtotal: number }[];
}): string {
  const itemsText = (order.items || [])
    .map((item, idx) => `  ${idx + 1}. ${item.productName} (x${item.quantity}) - ${formatRupiah(item.subtotal)}`)
    .join("\n");

  return `🚨 *[NOTIFIKASI PESANAN QRIS — JNSHOP]* 🚨
----------------------------------------------
Halo Admin, ada pesanan baru menggunakan *QRIS* yang memerlukan pengiriman kode QRIS sesuai nominal belanja:

📄 *No. Pesanan:* ${order.orderNumber}
💰 *Nominal Tepat:* *${formatRupiah(order.grandTotal)}*
👤 *Nama Pelanggan:* ${order.recipientName}
📧 *Email Pelanggan:* *${order.customerEmail || "-"}*
📱 *WhatsApp Cust:* ${order.recipientPhone}

🛒 *Rincian Produk:*
${itemsText || "  (Lihat detail di dashboard admin)"}

----------------------------------------------
⚠️ *Tindakan Diperlukan Segera:*
Kirimkan QRIS dengan nominal presisi *${formatRupiah(order.grandTotal)}* ke email pelanggan (*${order.customerEmail || "-"}*) atau WA agar tidak terjadi selisih nominal atau kerugian.

Kelola di Admin Panel:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders`;
}

/**
 * Generates direct WhatsApp click-to-chat URL for customer notifying admin about QRIS
 */
export function createCustomerToAdminQRISUrl(order: {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  customerEmail?: string | null;
  grandTotal: number;
}, adminNumber = "6285191219129"): string {
  const cleanPhone = adminNumber.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
  
  const text = `Halo Admin JNshop (+62 851-9121-9129),
Saya baru saja membuat pesanan dengan pembayaran QRIS di JNshop:

• No. Pesanan : ${order.orderNumber}
• Total Belanja : ${formatRupiah(order.grandTotal)}
• Nama : ${order.recipientName}
• Email Saya : ${order.customerEmail || "-"}
• No. WhatsApp : ${order.recipientPhone}

Mohon bantu kirimkan QRIS resmi dengan nominal presisi ${formatRupiah(order.grandTotal)} ke email/WhatsApp saya agar tidak terjadi kesalahan nominal. Terima kasih!`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates direct WhatsApp click-to-chat URL for Admin sending QRIS to Customer
 */
export function createAdminToCustomerQRISUrl(order: {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  customerEmail?: string | null;
  grandTotal: number;
}): string {
  const cleanPhone = order.recipientPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

  const text = `Halo Kak ${order.recipientName},
Terima kasih telah berbelanja di *JNshop*!

Berikut rincian pesanan QRIS Anda:
• No. Pesanan: *${order.orderNumber}*
• Total Tagihan Tepat: *${formatRupiah(order.grandTotal)}*
• Email Terdaftar: *${order.customerEmail || "-"}*

Silakan lakukan pembayaran tepat sebesar *${formatRupiah(order.grandTotal)}*.
Setelah scan & bayar via QRIS, mohon kirimkan bukti transfer ke sini atau unggah di link:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${order.orderNumber}`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates direct WhatsApp click-to-chat URL
 */
export function createWhatsAppChatUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Backend notification dispatcher for orders & payments
 */
export async function notifyNewOrder(order: any, customerUser?: any) {
  // 1. Notify Customer in-app
  if (order.userId) {
    await sendInAppNotification({
      userId: order.userId,
      title: "Pesanan Berhasil Dibuat",
      message: `Pesanan ${order.orderNumber} berhasil dibuat. Silakan selesaikan pembayaran sebesar ${formatRupiah(order.grandTotal)}.`,
      type: "ORDER",
      linkUrl: `/orders/${order.orderNumber}`,
    });
  }

  // 2. Notify Admin in-app
  const adminUsers = await prisma.user.findMany({ where: { role: "ADMIN" } });
  for (const admin of adminUsers) {
    await sendInAppNotification({
      userId: admin.id,
      title: "Pesanan Baru Masuk!",
      message: `Ada pesanan baru ${order.orderNumber} dari ${order.recipientName} sebesar ${formatRupiah(order.grandTotal)}.`,
      type: "ORDER",
      linkUrl: `/admin/orders`,
    });
  }

  // 3. Send WhatsApp if WhatsApp Cloud API configured
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

  // 4. Send Email if Resend configured
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && customerUser?.email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "orders@jnshop.com",
          to: [customerUser.email],
          subject: `Konfirmasi Pesanan ${order.orderNumber} - JNshop`,
          html: `<h1>Terima Kasih Atas Pesanan Anda!</h1><p>No. Pesanan: <strong>${order.orderNumber}</strong></p><p>Total: <strong>${formatRupiah(order.grandTotal)}</strong></p><p>Metode Pembayaran: ${order.paymentMethod}</p>`,
        }),
      });
    } catch (e) {
      console.error("Resend Email error:", e);
    }
  }

  // 5. DEDICATED QRIS ADMIN NOTIFICATION (Email & WhatsApp for Anti-Loss & Exact Nominal)
  const isQris =
    order.paymentMethod === "QRIS_INSTANT" ||
    order.payments?.[0]?.paymentMethod === "QRIS_INSTANT" ||
    order.payments?.[0]?.paymentChannel === "QRIS_INSTANT";

  if (isQris) {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "jaidav.enggineernes@gmail.com";
    const adminPhone = process.env.ADMIN_NOTIFICATION_WHATSAPP || "6285191219129";
    const custEmail = order.customerEmail || customerUser?.email || "Tidak tercantum";

    // A. Priority In-App Notification for Admin
    for (const admin of adminUsers) {
      await sendInAppNotification({
        userId: admin.id,
        title: `🚨 [QRIS] Pesanan ${order.orderNumber} Masuk — Wajib Kirim QRIS!`,
        message: `Pelanggan: ${order.recipientName} (${custEmail} / ${order.recipientPhone}). Nominal Tepat: ${formatRupiah(order.grandTotal)}. Harap kirimkan QRIS ke email pelanggan agar tidak terjadi kerugian nominal.`,
        type: "PAYMENT",
        linkUrl: `/admin/orders`,
      });
    }

    // B. Email Notification to Admin (jaidav.enggineernes@gmail.com)
    if (resendKey) {
      try {
        const itemsListHtml = (order.items || [])
          .map(
            (i: any) =>
              `<li>${i.productName || "Item"} (x${i.quantity}) — <strong>${formatRupiah(i.subtotal || i.productPrice * i.quantity)}</strong></li>`
          )
          .join("");

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "orders@jnshop.com",
            to: [adminEmail],
            subject: `🚨 [PESANAN QRIS MASUK] #${order.orderNumber} — Total: ${formatRupiah(order.grandTotal)} (Kirim ke: ${custEmail})`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e7e5e4; border-radius: 16px; background: #fafaf9;">
                <div style="background: #1c1917; color: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
                  <h2 style="margin: 0; font-size: 18px;">🚨 Notifikasi Pesanan QRIS — JNSHOP</h2>
                  <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.85;">Peringatan Anti-Loss & Pengiriman QRIS Nominal Tepat</p>
                </div>
                
                <p style="font-size: 14px; color: #292524;">
                  Halo Admin, pelanggan baru saja membuat pesanan dengan metode <strong>QRIS</strong>. Mohon segera kirimkan kode QRIS dengan nominal belanja presisi ke email pelanggan untuk menghindari selisih atau kerugian:
                </p>

                <div style="background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin: 16px 0;">
                  <table style="width: 100%; font-size: 13px; color: #292524; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #78716c;">No. Pesanan:</td>
                      <td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${order.orderNumber}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #78716c;">Nominal Belanja Tepat:</td>
                      <td style="padding: 6px 0; font-weight: bold; font-size: 16px; color: #0284c7;">${formatRupiah(order.grandTotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #78716c;">Email Pelanggan:</td>
                      <td style="padding: 6px 0; font-weight: bold;"><a href="mailto:${custEmail}" style="color: #2563eb;">${custEmail}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #78716c;">Nama Penerima:</td>
                      <td style="padding: 6px 0; font-weight: bold;">${order.recipientName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #78716c;">WhatsApp Pelanggan:</td>
                      <td style="padding: 6px 0; font-weight: bold;"><a href="https://wa.me/${order.recipientPhone.replace(/\D/g, "")}" style="color: #059669;">${order.recipientPhone}</a></td>
                    </tr>
                  </table>
                </div>

                <div style="margin: 16px 0; font-size: 13px; color: #44403c;">
                  <strong>Daftar Item:</strong>
                  <ul style="margin: 8px 0; padding-left: 20px;">
                    ${itemsListHtml}
                  </ul>
                </div>

                <div style="text-align: center; margin-top: 24px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders" style="display: inline-block; background: #1c1917; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 13px;">
                    Buka Pesanan di Admin Dashboard →
                  </a>
                </div>
              </div>
            `,
          }),
        });
      } catch (err) {
        console.error("Failed to send QRIS admin notification email:", err);
      }
    }

    // C. WhatsApp Notification to Admin (6285191219129)
    if (token && phoneId) {
      try {
        const qrisAdminMessage = formatAdminQRISAlertMessage({
          orderNumber: order.orderNumber,
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          customerEmail: custEmail,
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
      `[QRIS ADMIN NOTIFICATION] Dispatched successfully for Order #${order.orderNumber} -> Admin Email: ${adminEmail}, Admin WA: ${adminPhone}, Cust Email: ${custEmail}, Nominal: ${order.grandTotal}`
    );
  }
}

export async function notifyPaymentVerified(order: any) {
  if (order.userId) {
    await sendInAppNotification({
      userId: order.userId,
      title: "Pembayaran Dikonfirmasi! 🎉",
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
      title: "Pesanan Dalam Pengiriman 🚚",
      message: `Pesanan ${order.orderNumber} sedang dikirim via ${courier} dengan No. Resi ${trackingNumber}.`,
      type: "ORDER",
      linkUrl: `/orders/${order.orderNumber}`,
    });
  }
}
