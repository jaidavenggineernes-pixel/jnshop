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
