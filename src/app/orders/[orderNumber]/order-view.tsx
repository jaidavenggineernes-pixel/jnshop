"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  AlertCircle,
  Copy,
  ExternalLink,
  UploadCloud,
  Printer,
  Binary,
  MessageCircle,
  Check,
  ChevronRight,
  Mail,
  QrCode,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { createCustomerToAdminQRISUrl } from "@/lib/notifications";

interface OrderViewProps {
  order: any;
  paymentMethodDetail: any;
  storeSetting: any;
}

export function OrderView({ order, paymentMethodDetail, storeSetting }: OrderViewProps) {
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedBank, setCopiedBank] = useState(false);

  const payment = order.payments?.[0];
  const shipment = order.shipments?.[0];
  const shippingAddress = order.shippingAddressJson
    ? JSON.parse(order.shippingAddressJson)
    : null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim()) return;

    setUploading(true);
    setUploadError("");

    try {
      const res = await fetch(`/api/orders/${order.orderNumber}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofUrl: proofUrl.trim(),
          notes: proofNote.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengunggah bukti.");
      }

      setUploadSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah bukti pembayaran.");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Menunggu Pembayaran", bg: "bg-amber-50 text-amber-900 border-amber-200" };
      case "WAITING_CONFIRMATION":
        return { label: "Verifikasi Kurator", bg: "bg-stone-100 text-stone-800 border-stone-300" };
      case "PAID":
        return { label: "Terbayar & Siap", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "PROCESSING":
        return { label: "Sedang Dikemas", bg: "bg-stone-100 text-stone-800 border-stone-200" };
      case "READY_TO_SHIP":
        return { label: "Siap Dikirim", bg: "bg-stone-100 text-stone-800 border-stone-200" };
      case "SHIPPED":
        return { label: "Dalam Pengiriman", bg: "bg-amber-50 text-amber-900 border-amber-200" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-stone-100 text-stone-500 border-stone-200" };
      default:
        return { label: status, bg: "bg-stone-100 text-stone-800 border-stone-200" };
    }
  };

  const statusBadge = getStatusBadge(order.status);
  const isPaid = ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(
    order.status
  );

  const whatsappMessage = `Halo Kurator JNshop, saya ingin konfirmasi pesanan saya dengan nomor: ${order.orderNumber} senilai ${formatRupiah(order.grandTotal)}.`;
  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Top Bar with Print & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-1.5">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/account/orders" className="hover:text-stone-900 transition-colors">
              Pesanan
            </Link>
            <span>/</span>
            <span className="text-stone-800 font-mono font-medium">{order.orderNumber}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Invoice Pesanan #{order.orderNumber}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Cetak Invoice</span>
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-200 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Hubungi Kurator</span>
          </a>
        </div>
      </div>

      {/* Order Status Banner */}
      <div className="bg-white/95 rounded-2xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <span className="text-xs text-stone-500 block">Status Pesanan:</span>
            <div className="mt-1 flex items-center gap-2.5">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full border ${statusBadge.bg}`}
              >
                {statusBadge.label}
              </span>
              <span className="text-xs text-stone-500">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-stone-500 block">Total Pembayaran:</span>
            <div className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
              {formatRupiah(order.grandTotal)}
            </div>
          </div>
        </div>

        {/* Tracking Timeline Stepper */}
        <div className="py-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-6">
            Progres Pemenuhan Pesanan
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  order.status !== "CANCELLED"
                    ? "bg-stone-900 text-stone-100 ring-4 ring-stone-200/70"
                    : "bg-stone-200 text-stone-500"
                }`}
              >
                1
              </div>
              <p className="font-medium text-stone-800 text-xs">Diterima</p>
            </div>

            <div className="space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  isPaid
                    ? "bg-stone-900 text-stone-100 ring-4 ring-stone-200/70"
                    : order.status === "WAITING_CONFIRMATION"
                    ? "bg-amber-700 text-amber-100 animate-pulse"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                2
              </div>
              <p className="font-medium text-stone-800 text-xs">
                {order.status === "WAITING_CONFIRMATION" ? "Verifikasi" : "Lunas"}
              </p>
            </div>

            <div className="space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  ["SHIPPED", "DELIVERED"].includes(order.status)
                    ? "bg-stone-900 text-stone-100 ring-4 ring-stone-200/70"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                3
              </div>
              <p className="font-medium text-stone-800 text-xs">Dikirim</p>
            </div>

            <div className="space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  order.status === "DELIVERED"
                    ? "bg-emerald-700 text-emerald-100 ring-4 ring-emerald-100"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                4
              </div>
              <p className="font-medium text-stone-800 text-xs">Selesai</p>
            </div>
          </div>
        </div>

        {/* Resi Tracking Box if Shipped */}
        {order.trackingNumber && (
          <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
            <div>
              <span className="text-[11px] text-amber-800 font-medium uppercase tracking-wider">
                Nomor Resi Ekspedisi ({order.courierName})
              </span>
              <div className="text-base font-mono font-bold tracking-wider text-amber-950 mt-0.5">
                {order.trackingNumber}
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Paket Anda telah diserahkan ke kurir {order.courierName}.
              </p>
            </div>
            <button
              onClick={() => handleCopy(order.trackingNumber)}
              className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Salin Resi
            </button>
          </div>
        )}
      </div>

      {/* Digital Products Fulfillment Box */}
      {order.items.some((item: any) => item.isDigital) && (
        <div className="bg-white/95 rounded-2xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="p-2 rounded-xl bg-stone-100 text-stone-800 border border-stone-200">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Akses Unduhan & Lisensi Digital
              </h3>
              <p className="text-xs text-stone-500">
                {isPaid
                  ? "Pembayaran telah terkonfirmasi. Tautan unduhan dan lisensi siap digunakan."
                  : "Akses otomatis aktif setelah pembayaran dikonfirmasi kurator toko."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.items
              .filter((item: any) => item.isDigital)
              .map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 bg-stone-50/70 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-900">{item.productName}</h4>
                    {isPaid ? (
                      <div className="mt-2 space-y-1">
                        {item.digitalAccessCode && (
                          <div className="text-xs text-stone-700 flex items-center gap-2">
                            <span className="text-stone-500">Kode Lisensi:</span>
                            <span className="font-mono font-medium bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-900">
                              {item.digitalAccessCode}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-emerald-700 font-medium">
                          ✓ Lisensi resmi aktif tanpa batas waktu
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-800 mt-1">
                        Menunggu verifikasi pembayaran untuk membuka akses unduhan.
                      </p>
                    )}
                  </div>

                  {isPaid && (
                    <a
                      href={item.product?.digitalFileUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <span>Akses File Digital</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Payment Instructions & Manual Transfer Proof Upload */}
      {!isPaid && (
        <div className="bg-white/95 rounded-2xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-6">
          <div className="pb-3 border-b border-stone-100">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Instruksi Pembayaran ({payment?.paymentMethod || "Transfer"})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Selesaikan pembayaran sesuai nominal tepat agar verifikasi otomatis berjalan cepat.
            </p>
          </div>

          {/* QRIS Display with Exact Nominal & Anti-Loss Protection */}
          {payment?.paymentMethod === "QRIS_INSTANT" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                      <QrCode className="w-4 h-4 text-amber-800" />
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-amber-950">
                        Pembayaran QRIS Presisi & Anti-Loss
                      </h4>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Notifikasi otomatis pesanan ini telah terkirim ke Admin JNshop.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Nominal Tepat
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1 border-t border-amber-200/70">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="text-[11px] text-amber-800 block">Nominal Tagihan Tepat:</span>
                    <span className="text-base font-black text-amber-950 font-mono">
                      {formatRupiah(order.grandTotal)}
                    </span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                    <span className="text-[11px] text-amber-800 block">Email Pelanggan Terdaftar:</span>
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate">{order.customerEmail || "Belum tercantum"}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={createCustomerToAdminQRISUrl(
                      {
                        orderNumber: order.orderNumber,
                        recipientName: order.recipientName,
                        recipientPhone: order.recipientPhone,
                        customerEmail: order.customerEmail,
                        grandTotal: order.grandTotal,
                      },
                      storeSetting?.whatsappNumber || "6285191219129"
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Konfirmasi ke WhatsApp Admin (+62 851-9121-9129)</span>
                  </a>
                  <p className="text-[10px] text-stone-500 text-center mt-1.5">
                    Admin akan mencocokkan nominal <strong>{formatRupiah(order.grandTotal)}</strong> ke email <strong>{order.customerEmail || "Anda"}</strong> untuk mencegah selisih.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-stone-50/70 rounded-xl border border-stone-200">
                <div className="w-44 h-44 bg-white p-2 rounded-xl border border-stone-200 shadow-sm shrink-0 flex items-center justify-center">
                  <img
                    src={
                      paymentMethodDetail?.qrCodeUrl ||
                      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=JNSHOP-ORDER-" +
                        order.orderNumber
                    }
                    alt="QRIS Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2.5 text-xs text-stone-600">
                  <h4 className="font-serif font-bold text-sm text-stone-900">Petunjuk Pembayaran QRIS:</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, dll) atau E-Wallet (GoPay, OVO, Dana).</li>
                    <li>Pilih menu <strong>Scan QRIS</strong>.</li>
                    <li>Pindai QR code di samping dan masukkan / pastikan nominal tepat <strong>{formatRupiah(order.grandTotal)}</strong>.</li>
                    <li>Selesaikan pembayaran dan unggah bukti transfer di formulir bawah.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details */}
          {(payment?.paymentMethod === "BCA_MANUAL" || payment?.paymentMethod === "MANDIRI_MANUAL" || payment?.paymentMethod === "MANUAL_TRANSFER") && (
            <div className="p-4 sm:p-5 bg-stone-50/70 rounded-xl border border-stone-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-stone-500 block">Nomor Rekening Tujuan:</span>
                  <div className="text-lg sm:text-xl font-mono font-bold text-stone-900 tracking-wider mt-0.5">
                    {paymentMethodDetail?.accountNumber || "1234567890"}
                  </div>
                  <span className="text-xs text-stone-600 block mt-0.5">
                    a/n {paymentMethodDetail?.accountName || "JNshop Official Store"} (
                    {payment?.paymentMethod?.includes("BCA") ? "Bank BCA" : "Bank Mandiri"})
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(paymentMethodDetail?.accountNumber || "1234567890")}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium text-stone-800 hover:bg-stone-100 flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? "Disalin!" : "Salin Rekening"}</span>
                </button>
              </div>

              <div className="text-xs text-stone-500 pt-2.5 border-t border-stone-200">
                Harap transfer tepat <strong>{formatRupiah(order.grandTotal)}</strong> agar verifikasi tidak terhambat.
              </div>
            </div>
          )}

          {/* Proof Upload Form */}
          <div className="pt-3 border-t border-stone-100 space-y-3.5">
            <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-stone-700" />
              Unggah Bukti Transfer
            </h4>

            {order.payments?.[0]?.paymentProofUrl ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bukti transfer telah diterima kurator.</span>
                </div>
                <p className="text-stone-600">
                  Pesanan Anda sedang dipersiapkan. Anda juga dapat konfirmasi langsung ke kurator via WhatsApp.
                </p>
                <a
                  href={order.payments[0].paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-stone-800 underline font-medium mt-1"
                >
                  Lihat Lampiran Bukti
                </a>
              </div>
            ) : (
              <form onSubmit={handleUploadProof} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Tautan / URL Gambar Bukti Transfer (Imgur / Cloudinary / Drive) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Catatan Pengirim (Nama Pemilik Rekening)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Transfer atas nama Budi Santoso"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 text-stone-900"
                  />
                </div>

                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                {uploadSuccess && (
                  <p className="text-xs text-emerald-700 font-medium">
                    Bukti berhasil dikirim! Halaman akan diperbarui...
                  </p>
                )}

                <button
                  type="submit"
                  disabled={uploading || !proofUrl.trim()}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {uploading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Purchased Items Table */}
      <div className="bg-white/95 rounded-2xl p-5 sm:p-7 border border-stone-200/90 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
          Rincian Barang yang Dipesan
        </h3>

        <div className="divide-y divide-stone-100">
          {order.items.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
              <div className="space-y-0.5">
                <span className="font-medium text-stone-900 block">{item.productName}</span>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span>{formatRupiah(item.productPrice)} × {item.quantity} unit</span>
                  <span>•</span>
                  <span className="text-[10px] uppercase font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                    {item.isDigital ? "Digital" : "Fisik"}
                  </span>
                </div>
              </div>
              <span className="font-serif font-semibold text-stone-900">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Cost summary table */}
        <div className="pt-3 border-t border-stone-100 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal Produk</span>
            <span className="font-medium text-stone-900">{formatRupiah(order.totalAmount)}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-amber-800 font-medium">
              <span>Potongan Voucher Diskon</span>
              <span>-{formatRupiah(order.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-stone-600">
            <span>Biaya Pengiriman ({order.courierName})</span>
            <span className="font-medium text-stone-900">{formatRupiah(order.shippingFee)}</span>
          </div>

          <div className="flex justify-between text-base font-serif font-bold text-stone-900 pt-2 border-t border-stone-100">
            <span>Total Tagihan Akhir</span>
            <span>{formatRupiah(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Recipient & Shipping Information */}
      <div className="bg-white/95 rounded-2xl p-5 sm:p-7 border border-stone-200/90 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
        <div>
          <h4 className="font-serif font-bold text-stone-900 text-sm mb-1.5">Informasi Penerima</h4>
          <p className="font-medium text-stone-900">
            {order.recipientName}
          </p>
          <p className="text-stone-500 mt-0.5">WhatsApp / Telepon: {order.recipientPhone}</p>
          {order.notes && (
            <p className="text-stone-600 mt-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
              Catatan: {order.notes}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-serif font-bold text-stone-900 text-sm mb-1.5">Alamat Pengiriman</h4>
          {shippingAddress ? (
            <p className="text-stone-600 leading-relaxed text-xs sm:text-sm">
              {shippingAddress.streetAddress}, Kecamatan {shippingAddress.district}, {shippingAddress.city},{" "}
              {shippingAddress.province} {shippingAddress.postalCode}
            </p>
          ) : (
            <p className="text-stone-500 text-xs">Produk digital (Pengiriman via dashboard / unduhan instan).</p>
          )}
        </div>
      </div>
    </div>
  );
}
