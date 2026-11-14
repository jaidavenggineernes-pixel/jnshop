import { formatRupiah } from "./utils";

export function createCustomerToAdminQRISUrl(
  order: {
    orderNumber: string;
    recipientName: string;
    recipientPhone: string;
    customerEmail?: string | null;
    notes?: string | null;
    grandTotal: number;
  },
  adminNumber = "6285191219129"
): string {
  const cleanPhone = adminNumber.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
  const noteText = order.notes?.trim() ? `\n- Pesan Tambahan : ${order.notes.trim()}` : "";

  const text = `Halo Admin JNshop (+62 851-9121-9129),
Saya baru saja membuat pesanan dengan pembayaran QRIS di JNshop:

- No. Pesanan : ${order.orderNumber}
- Total Belanja : ${formatRupiah(order.grandTotal)}
- Nama : ${order.recipientName}
- Email Saya : ${order.customerEmail || "-"}
- No. WhatsApp : ${order.recipientPhone}${noteText}

Mohon kirimkan kode QRIS dengan nominal presisi ${formatRupiah(order.grandTotal)} ke email saya. Terima kasih.`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export function createAdminToCustomerQRISUrl(order: {
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  customerEmail?: string | null;
  grandTotal: number;
}): string {
  const cleanPhone = order.recipientPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

  const text = `Halo ${order.recipientName},
Terima kasih telah berbelanja di *JNshop*.

Berikut rincian pesanan QRIS Anda:
- No. Pesanan: *${order.orderNumber}*
- Total Tagihan Tepat: *${formatRupiah(order.grandTotal)}*
- Email Tujuan QRIS: *${order.customerEmail || "-"}*

Kode QRIS dengan nominal presisi ${formatRupiah(order.grandTotal)} kami kirimkan ke email tersebut. Silakan cek kotak masuk/spam Anda.`;

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export function createWhatsAppChatUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}
