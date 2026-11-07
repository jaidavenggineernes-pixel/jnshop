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
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

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
          note: proofNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah bukti pembayaran");
      }

      setUploadSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || "Terjadi kesalahan.");
    } finally {
      setUploading(false);
    }
  };

  // Status mapping
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Menunggu Pembayaran", bg: "bg-amber-100 text-amber-800 border-amber-200" };
      case "WAITING_CONFIRMATION":
        return { label: "Menunggu Verifikasi Admin", bg: "bg-blue-100 text-blue-800 border-blue-200" };
      case "PAID":
        return { label: "Pembayaran Berhasil", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "PROCESSING":
        return { label: "Sedang Diproses", bg: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "READY_TO_SHIP":
        return { label: "Siap Dikirim", bg: "bg-purple-100 text-purple-800 border-purple-200" };
      case "SHIPPED":
        return { label: "Dalam Pengiriman", bg: "bg-teal-100 text-teal-800 border-teal-200" };
      case "DELIVERED":
        return { label: "Pesanan Selesai", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-red-100 text-red-800 border-red-200" };
      default:
        return { label: status, bg: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  const statusBadge = getStatusBadge(order.status);
  const isPaid = ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(
    order.status
  );

  const whatsappMessage = `Halo Admin JNshop, saya ingin konfirmasi pesanan saya dengan nomor: ${order.orderNumber} senilai ${formatRupiah(order.grandTotal)}.`;
  const whatsappUrl = `https://wa.me/${storeSetting?.whatsappNumber || "6281234567890"}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Top Bar with Print & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/" className="hover:text-blue-600">
              Beranda
            </Link>
            <span>/</span>
            <Link href="/account/orders" className="hover:text-blue-600">
              Pesanan
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{order.orderNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Invoice Pesanan {order.orderNumber}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak Invoice</span>
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Konfirmasi WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Order Status Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400">Status Pesanan:</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge.bg}`}
              >
                {statusBadge.label}
              </span>
              <span className="text-xs text-slate-400">
                Waktu Pemesanan: {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Total Pembayaran:</span>
            <div className="text-2xl font-black text-blue-600">{formatRupiah(order.grandTotal)}</div>
          </div>
        </div>

        {/* Tracking Timeline Stepper */}
        <div className="py-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Progres Status Transaksi
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="space-y-2">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  order.status !== "CANCELLED"
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                1
              </div>
              <p className="font-semibold text-slate-800 text-[11px]">Dibuat</p>
            </div>

            <div className="space-y-2">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  isPaid
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : order.status === "WAITING_CONFIRMATION"
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                2
              </div>
              <p className="font-semibold text-slate-800 text-[11px]">
                {order.status === "WAITING_CONFIRMATION" ? "Verifikasi" : "Lunas"}
              </p>
            </div>

            <div className="space-y-2">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  ["SHIPPED", "DELIVERED"].includes(order.status)
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                3
              </div>
              <p className="font-semibold text-slate-800 text-[11px]">Dikirim</p>
            </div>

            <div className="space-y-2">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  order.status === "DELIVERED"
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                4
              </div>
              <p className="font-semibold text-slate-800 text-[11px]">Selesai</p>
            </div>
          </div>
        </div>

        {/* Resi Tracking Box if Shipped */}
        {order.trackingNumber && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-teal-950">
            <div>
              <span className="text-xs text-teal-700 font-semibold uppercase">
                Nomor Resi Pengiriman ({order.courierName})
              </span>
              <div className="text-lg font-mono font-black tracking-wider text-teal-900 mt-0.5">
                {order.trackingNumber}
              </div>
              <p className="text-xs text-teal-700 mt-1">
                Paket Anda sedang dalam perjalanan via {order.courierName}.
              </p>
            </div>
            <button
              onClick={() => handleCopy(order.trackingNumber)}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shrink-0 self-start sm:self-auto"
            >
              Salin No. Resi
            </button>
          </div>
        )}
      </div>

      {/* Digital Products Fulfillment Box (Instant Access once Paid) */}
      {order.items.some((item: any) => item.isDigital) && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Akses Unduhan & Lisensi Produk Digital
              </h3>
              <p className="text-xs text-slate-500">
                {isPaid
                  ? "Pembayaran telah terkonfirmasi. Tautan dan kode lisensi Anda siap digunakan."
                  : "Akses otomatis aktif setelah pembayaran diverifikasi oleh sistem / admin."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.items
              .filter((item: any) => item.isDigital)
              .map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{item.productName}</h4>
                    {isPaid ? (
                      <div className="mt-2 space-y-1">
                        {item.digitalAccessCode && (
                          <div className="text-xs text-slate-700 flex items-center gap-2">
                            <span className="text-slate-400">Kode Lisensi:</span>
                            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600">
                              {item.digitalAccessCode}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-emerald-600 font-medium">
                          ✓ Akses aktif tanpa batas waktu
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 mt-1">
                        Menunggu verifikasi pembayaran untuk membuka akses unduhan.
                      </p>
                    )}
                  </div>

                  {isPaid && (
                    <a
                      href={item.product?.digitalFileUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <span>Buka File / Download</span>
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
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900">
              Petunjuk Pembayaran ({payment?.paymentMethod || "Transfer"})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan selesaikan pembayaran sesuai nominal tepat agar proses verifikasi berjalan lancar.
            </p>
          </div>

          {/* QRIS Display */}
          {payment?.paymentMethod === "QRIS_INSTANT" && (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-48 h-48 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
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
              <div className="space-y-3 text-xs text-slate-600">
                <h4 className="font-bold text-sm text-slate-900">Cara Bayar via QRIS:</h4>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Buka aplikasi m-Banking (BCA Mobile, Livin, dll) atau E-Wallet (GoPay, OVO, Dana).</li>
                  <li>Pilih menu <strong>Scan QRIS</strong>.</li>
                  <li>Pindai QR code di samping dan periksa nominal tagihan ({formatRupiah(order.grandTotal)}).</li>
                  <li>Masukkan PIN transaksi Anda hingga status pembayaran selesai.</li>
                </ol>
                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl font-medium">
                  Setelah scan, unggah bukti atau hubungi admin agar pesanan langsung kami proses!
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details */}
          {(payment?.paymentMethod === "BCA_MANUAL" || payment?.paymentMethod === "MANDIRI_MANUAL" || payment?.paymentMethod === "MANUAL_TRANSFER") && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400">Nomor Rekening Tujuan:</span>
                  <div className="text-xl font-mono font-black text-slate-900 tracking-wider mt-0.5">
                    {paymentMethodDetail?.accountNumber || "1234567890"}
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    a/n {paymentMethodDetail?.accountName || "JNshop Official Store"} (
                    {payment?.paymentMethod?.includes("BCA") ? "Bank BCA" : "Bank Mandiri"})
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(paymentMethodDetail?.accountNumber || "1234567890")}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? "Disalin!" : "Salin No. Rekening"}</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 pt-3 border-t border-slate-200">
                Harap transfer tepat sebesar <strong>{formatRupiah(order.grandTotal)}</strong> agar sistem dapat mencocokkan pembayaran Anda.
              </div>
            </div>
          )}

          {/* Proof Upload Form */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Unggah Bukti Transfer / Resi Pembayaran
            </h4>

            {order.payments?.[0]?.paymentProofUrl ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bukti pembayaran telah berhasil dikirim!</span>
                </div>
                <p>
                  Admin JNshop sedang memverifikasi pembayaran Anda. Anda juga dapat konfirmasi cepat lewat WhatsApp.
                </p>
                <a
                  href={order.payments[0].paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-blue-600 underline font-semibold mt-1"
                >
                  Lihat Lampiran Bukti
                </a>
              </div>
            ) : (
              <form onSubmit={handleUploadProof} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tautan / URL Gambar Bukti Transfer (Imgur / Cloudinary / Drive) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Pengirim (Nama Pemilik Rekening)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Transfer dari rekening BCA a/n Budi Santoso"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
                {uploadSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold">
                    Bukti berhasil dikirim! Halaman akan diperbarui...
                  </p>
                )}

                <button
                  type="submit"
                  disabled={uploading || !proofUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Purchased Items Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Rincian Barang yang Dipesan
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item: any) => (
            <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 block text-sm">{item.productName}</span>
                <span className="text-slate-500">
                  {formatRupiah(item.productPrice)} × {item.quantity} unit
                </span>
                <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 ml-2">
                  {item.isDigital ? "Digital" : "Fisik"}
                </span>
              </div>
              <span className="font-extrabold text-slate-900 text-sm">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Cost summary table */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal Produk</span>
            <span className="font-semibold text-slate-900">{formatRupiah(order.totalAmount)}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Potongan Diskon Voucher</span>
              <span>-{formatRupiah(order.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>Biaya Pengiriman ({order.courierName})</span>
            <span className="font-semibold text-slate-900">{formatRupiah(order.shippingFee)}</span>
          </div>

          <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
            <span>Total Tagihan Akhir</span>
            <span className="text-blue-600">{formatRupiah(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Recipient & Shipping Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-2">Informasi Penerima</h4>
          <p className="text-slate-700">
            <strong>{order.recipientName}</strong>
          </p>
          <p className="text-slate-500 mt-1">No. WhatsApp / HP: {order.recipientPhone}</p>
          {order.notes && (
            <p className="text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Catatan: {order.notes}
            </p>
          )}
        </div>

        <div>
          <h4 className="font-bold text-slate-900 text-sm mb-2">Alamat Pengiriman</h4>
          {shippingAddress ? (
            <p className="text-slate-600 leading-relaxed">
              {shippingAddress.streetAddress}, Kecamatan {shippingAddress.district}, {shippingAddress.city},{" "}
              {shippingAddress.province} {shippingAddress.postalCode}
            </p>
          ) : (
            <p className="text-slate-500">Produk digital (Pengiriman via dashboard / download link).</p>
          )}
        </div>
      </div>
    </div>
  );
}
