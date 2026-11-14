"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  UploadCloud,
  Printer,
  Binary,
  MessageCircle,
  Check,
  Mail,
  QrCode,
  ImagePlus,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { createCustomerToAdminQRISUrl } from "@/lib/notification-links";

interface OrderViewProps {
  order: any;
  paymentMethodDetail: any;
  storeSetting: any;
}

export function OrderView({ order, paymentMethodDetail, storeSetting }: OrderViewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [useLinkMode, setUseLinkMode] = useState(false);
  const [proofNote, setProofNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  const payment = order.payments?.[0];
  const shippingAddress = order.shippingAddressJson
    ? JSON.parse(order.shippingAddressJson)
    : null;
  let qrisMeta: Record<string, any> = {};
  if (payment?.paymentGatewayPayload) {
    try {
      qrisMeta = JSON.parse(payment.paymentGatewayPayload);
    } catch {
      // ignore invalid json
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file gambar maksimal 5MB.");
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !proofUrl.trim()) {
      setUploadError("Pilih foto bukti transfer atau isi tautan gambar terlebih dahulu.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      let res: Response;
      if (selectedFile && !useLinkMode) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (proofNote.trim()) {
          formData.append("note", proofNote.trim());
        }
        res = await fetch(`/api/orders/${order.orderNumber}/proof`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`/api/orders/${order.orderNumber}/proof`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proofUrl: proofUrl.trim(),
            note: proofNote.trim(),
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengunggah bukti.");
      }

      setUploadSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah bukti pembayaran.");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Menunggu Pembayaran", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "WAITING_CONFIRMATION":
        return { label: "Menunggu Verifikasi", bg: "bg-zinc-100 text-zinc-900 border-zinc-300" };
      case "PAID":
        return { label: "Terbayar & Siap", bg: "bg-green-50 text-green-800 border-green-200" };
      case "PROCESSING":
        return { label: "Sedang Dikemas", bg: "bg-zinc-100 text-zinc-900 border-zinc-200" };
      case "READY_TO_SHIP":
        return { label: "Siap Dikirim", bg: "bg-zinc-100 text-zinc-900 border-zinc-200" };
      case "SHIPPED":
        return { label: "Dalam Pengiriman", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-green-50 text-green-800 border-green-200" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-red-50 text-red-800 border-red-200" };
      default:
        return { label: status, bg: "bg-zinc-100 text-zinc-900 border-zinc-200" };
    }
  };

  const statusBadge = getStatusBadge(order.status);
  const isPaid = ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(
    order.status
  );

  const storeTitle = storeSetting?.storeName || "JNshop";
  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");
  const whatsappMessage = `Halo Admin ${storeTitle}, saya ingin konfirmasi pesanan #${order.orderNumber} senilai ${formatRupiah(order.grandTotal)}.`;
  const whatsappUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Header & Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 mb-1.5">
            <Link href="/" className="hover:text-zinc-900">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/account/orders" className="hover:text-zinc-900">
              Pesanan
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-900 font-mono font-semibold">{order.orderNumber}</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Invoice #{order.orderNumber}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[44px] px-4 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-zinc-700" />
            <span>Cetak</span>
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Admin</span>
          </a>
        </div>
      </div>

      {/* Status Banner */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
          <div>
            <span className="text-xs text-zinc-600 block">Status Pesanan</span>
            <div className="mt-1.5 flex items-center gap-2.5 flex-wrap">
              <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${statusBadge.bg}`}>
                {statusBadge.label}
              </span>
              <span className="text-xs text-zinc-600">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-zinc-600 block">Total Tagihan</span>
            <div className="text-2xl font-bold text-zinc-900 mt-0.5 tabular-nums">
              {formatRupiah(order.grandTotal)}
            </div>
          </div>
        </div>

        {/* Clean Stepper (no animate-pulse) */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { num: 1, label: "Diterima", active: order.status !== "CANCELLED", highlight: false },
            {
              num: 2,
              label: order.status === "WAITING_CONFIRMATION" ? "Verifikasi" : "Lunas",
              active: isPaid,
              highlight: order.status === "WAITING_CONFIRMATION",
            },
            { num: 3, label: "Dikirim", active: ["SHIPPED", "DELIVERED"].includes(order.status), highlight: false },
            { num: 4, label: "Selesai", active: order.status === "DELIVERED", highlight: false },
          ].map((step) => (
            <div key={step.label} className="space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                  step.active
                    ? "bg-green-800 text-white"
                    : step.highlight
                    ? "bg-amber-600 text-white"
                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                }`}
              >
                {step.active ? <Check className="w-4 h-4" /> : step.num}
              </div>
              <p className="font-semibold text-zinc-800 text-xs">{step.label}</p>
            </div>
          ))}
        </div>

        {order.trackingNumber && (
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-zinc-600 font-semibold uppercase tracking-wider">
                Nomor Resi ({order.courierName})
              </span>
              <div className="text-base font-mono font-bold text-zinc-900 mt-0.5">
                {order.trackingNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(order.trackingNumber)}
              className="min-h-[40px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white text-xs font-semibold shrink-0"
            >
              {copiedKey ? "Resi Disalin" : "Salin Resi"}
            </button>
          </div>
        )}
      </div>

      {/* Digital Fulfillment */}
      {order.items.some((item: any) => item.isDigital) && (
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-200">
            <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center justify-center shrink-0">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900">
                Akses Unduhan & Lisensi Digital
              </h2>
              <p className="text-xs text-zinc-600">
                {isPaid
                  ? "Pembayaran terverifikasi. File unduhan dan kode lisensi siap dipakai."
                  : "Akses terbuka otomatis setelah pembayaran dikonfirmasi admin."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.items
              .filter((item: any) => item.isDigital)
              .map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900">{item.productName}</h3>
                    {isPaid ? (
                      <div className="mt-2 space-y-1">
                        {item.digitalAccessCode && (
                          <div className="text-xs text-zinc-700 flex items-center gap-2">
                            <span>Kode Lisensi:</span>
                            <span className="font-mono font-semibold bg-white px-2.5 py-0.5 rounded border border-zinc-300 text-zinc-900">
                              {item.digitalAccessCode}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-green-800 font-semibold">
                          Lisensi resmi aktif
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-800 font-medium mt-1">
                        Menunggu konfirmasi pembayaran
                      </p>
                    )}
                  </div>

                  {isPaid && (
                    <a
                      href={item.product?.digitalFileUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[40px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs inline-flex items-center gap-2 shrink-0"
                    >
                      <span>Akses File</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Payment Instructions & Direct Proof Upload */}
      {!isPaid && (
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-6">
          <div className="pb-3 border-b border-zinc-200">
            <h2 className="font-bold text-base text-zinc-900">
              Instruksi Pembayaran ({payment?.paymentMethod || "Transfer"})
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Bayar sesuai nominal tepat dan unggah foto bukti transaksi di bawah.
            </p>
          </div>

          {payment?.paymentMethod === "QRIS_INSTANT" && (
            <div className="space-y-4">
              {qrisMeta.qrisSentAt ? (
                <div className="p-4 sm:p-5 bg-green-50 rounded-xl border border-green-200 space-y-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-green-800 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm text-green-950">
                        Kode QRIS Telah Dikirim ke Email Anda
                      </h3>
                      <p className="text-xs text-green-900 mt-0.5 leading-relaxed">
                        Admin telah mengirimkan kode QRIS nominal presisi ke{" "}
                        <strong>{order.customerEmail}</strong> pada {formatDate(qrisMeta.qrisSentAt)}.
                      </p>
                    </div>
                  </div>

                  {qrisMeta.qrisAdminMessage && (
                    <div className="bg-white p-3.5 rounded-lg border border-green-200 text-xs text-zinc-800 space-y-1">
                      <span className="font-semibold text-zinc-600 block">Pesan dari Admin:</span>
                      <p className="whitespace-pre-wrap leading-relaxed">{qrisMeta.qrisAdminMessage}</p>
                    </div>
                  )}

                  {qrisMeta.qrisImageUrl && (
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-white rounded-xl border border-green-200">
                      <div className="w-48 h-48 bg-zinc-50 p-2 rounded-lg border border-zinc-200 shrink-0 flex items-center justify-center">
                        <img
                          src={qrisMeta.qrisImageUrl}
                          alt={`Kode QRIS Pesanan ${order.orderNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2 text-xs text-zinc-700">
                        <h4 className="font-bold text-sm text-zinc-900">Cara Bayar QRIS dari Admin:</h4>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Buka m-Banking atau E-Wallet (GoPay, OVO, Dana, ShopeePay, BCA Mobile).</li>
                          <li>Pindai kode QRIS di samping (atau cek email {order.customerEmail}).</li>
                          <li>
                            Pastikan nominal pembayaran tepat{" "}
                            <strong>{formatRupiah(order.grandTotal)}</strong>.
                          </li>
                          <li>Unggah screenshot bukti bayar di bawah ini.</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 sm:p-5 bg-amber-50 rounded-xl border border-amber-200 space-y-4">
                  <div className="flex items-start gap-2.5">
                    <QrCode className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm text-amber-950">
                        Pesanan Diterima, Kode QRIS Akan Dikirim ke Email Anda
                      </h3>
                      <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                        Detail pesanan, nominal tepat, dan pesan tambahan Anda telah diteruskan ke Admin. Admin akan mengirimkan kode QRIS sesuai total tagihan ke alamat email Anda di bawah ini agar tidak terjadi kesalahan nominal.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-2 border-t border-amber-200">
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <span className="text-zinc-600 block">Nominal Tagihan Presisi:</span>
                      <span className="text-base font-bold text-zinc-900 font-mono tabular-nums">
                        {formatRupiah(order.grandTotal)}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200">
                      <span className="text-zinc-600 block">Email Tujuan QRIS:</span>
                      <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                        <span className="truncate">{order.customerEmail || "Belum tercantum"}</span>
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="bg-white p-3 rounded-lg border border-amber-200 text-xs">
                      <span className="text-zinc-600 block">Pesan Tambahan Anda ke Admin:</span>
                      <p className="text-zinc-900 font-medium mt-0.5 whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  )}

                  <a
                    href={createCustomerToAdminQRISUrl(
                      {
                        orderNumber: order.orderNumber,
                        recipientName: order.recipientName,
                        recipientPhone: order.recipientPhone,
                        customerEmail: order.customerEmail,
                        notes: order.notes,
                        grandTotal: order.grandTotal,
                      },
                      storeSetting?.whatsappNumber || "6285191219129"
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Konfirmasi / Chat WhatsApp Admin (+{cleanWa})</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {(payment?.paymentMethod === "BCA_MANUAL" ||
            payment?.paymentMethod === "MANDIRI_MANUAL" ||
            payment?.paymentMethod === "MANUAL_TRANSFER") && (
            <div className="p-4 sm:p-5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-zinc-600 block">Nomor Rekening Tujuan:</span>
                  <div className="text-lg sm:text-xl font-mono font-bold text-zinc-900 tracking-wider mt-0.5">
                    {paymentMethodDetail?.accountNumber || "1234567890"}
                  </div>
                  <span className="text-xs text-zinc-700 block mt-0.5">
                    a/n {paymentMethodDetail?.accountName || "JNshop Official Store"} (
                    {payment?.paymentMethod?.includes("BCA") ? "Bank BCA" : "Bank Mandiri"})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(paymentMethodDetail?.accountNumber || "1234567890")}
                  className="min-h-[40px] px-4 rounded-lg bg-white border border-zinc-300 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-green-800" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? "Disalin" : "Salin Rekening"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Direct File Proof Upload Form */}
          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-green-800" />
                Unggah Bukti Pembayaran
              </h3>
              {!order.payments?.[0]?.paymentProofUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setUseLinkMode(!useLinkMode);
                    setUploadError("");
                  }}
                  className="text-xs font-semibold text-green-800 hover:underline"
                >
                  {useLinkMode ? "Upload Foto Langsung" : "Atau gunakan tautan URL"}
                </button>
              )}
            </div>

            {order.payments?.[0]?.paymentProofUrl ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs text-green-950 space-y-3">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-green-800" />
                  <span>Bukti transfer sudah diterima admin untuk diverifikasi.</span>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={order.payments[0].paymentProofUrl}
                    alt="Bukti transfer terunggah"
                    className="w-20 h-20 object-cover rounded-lg border border-green-300 bg-white"
                  />
                  <a
                    href={order.payments[0].paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-green-900 underline"
                  >
                    Buka Gambar Penuh
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadProof} className="space-y-3.5">
                {!useLinkMode ? (
                  <div>
                    <label
                      htmlFor="proof-file-input"
                      className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-zinc-300 hover:border-green-800 rounded-xl bg-zinc-50 cursor-pointer transition-colors text-center"
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Pratinjau bukti bayar"
                          className="max-h-40 rounded-lg object-contain border border-zinc-200 bg-white"
                        />
                      ) : (
                        <>
                          <ImagePlus className="w-6 h-6 text-zinc-700" />
                          <span className="text-xs font-semibold text-zinc-900">
                            Pilih Foto Screenshot / Struk Transfer
                          </span>
                          <span className="text-[11px] text-zinc-600">
                            Format JPG, PNG, atau WEBP (maks. 5MB)
                          </span>
                        </>
                      )}
                      <input
                        id="proof-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    {selectedFile && (
                      <p className="text-xs text-zinc-700 mt-1.5">
                        File terpilih: <strong>{selectedFile.name}</strong>
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor="proof-url-input" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Tautan Gambar Bukti Transfer *
                    </label>
                    <input
                      id="proof-url-input"
                      type="url"
                      placeholder="https://..."
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="proof-note" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Catatan Pengirim (Nama di Rekening)
                  </label>
                  <input
                    id="proof-note"
                    type="text"
                    placeholder="Contoh: Transfer BCA atas nama Budi Santoso"
                    value={proofNote}
                    onChange={(e) => setProofNote(e.target.value)}
                    className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                  />
                </div>

                {uploadError && <p className="text-xs font-medium text-red-800">{uploadError}</p>}
                {uploadSuccess && (
                  <p className="text-xs font-semibold text-green-800">
                    Bukti pembayaran terkirim. Memuat ulang halaman...
                  </p>
                )}

                <button
                  type="submit"
                  disabled={uploading || (!selectedFile && !proofUrl.trim())}
                  className="min-h-[44px] px-5 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-4">
        <h2 className="font-bold text-base text-zinc-900 pb-3 border-b border-zinc-200">
          Rincian Barang
        </h2>

        <div className="divide-y divide-zinc-200">
          {order.items.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-zinc-900 block">{item.productName}</span>
                <span className="text-xs text-zinc-600 tabular-nums">
                  {formatRupiah(item.productPrice)} x {item.quantity} unit ({item.isDigital ? "Digital" : "Fisik"})
                </span>
              </div>
              <span className="font-bold text-zinc-900 tabular-nums shrink-0">
                {formatRupiah(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-zinc-200 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-zinc-600">
            <span>Subtotal Produk</span>
            <span className="font-semibold text-zinc-900 tabular-nums">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-800 font-semibold">
              <span>Potongan Voucher</span>
              <span className="tabular-nums">-{formatRupiah(order.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-zinc-600">
            <span>Pengiriman ({order.courierName})</span>
            <span className="font-semibold text-zinc-900 tabular-nums">
              {formatRupiah(order.shippingFee)}
            </span>
          </div>

          <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-200">
            <span>Total Tagihan</span>
            <span className="tabular-nums">{formatRupiah(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Recipient & Address */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
        <div>
          <h3 className="font-bold text-zinc-900 text-sm mb-1.5">Penerima</h3>
          <p className="font-semibold text-zinc-900">{order.recipientName}</p>
          <p className="text-zinc-600 mt-0.5">WhatsApp: {order.recipientPhone}</p>
          {order.customerEmail && (
            <p className="text-zinc-600 mt-0.5">Email: {order.customerEmail}</p>
          )}
          {order.notes && (
            <p className="text-zinc-700 mt-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-xs">
              Catatan: {order.notes}
            </p>
          )}
        </div>

        <div>
          <h3 className="font-bold text-zinc-900 text-sm mb-1.5">Alamat Pengiriman</h3>
          {shippingAddress ? (
            <p className="text-zinc-700 leading-relaxed">
              {shippingAddress.streetAddress}, Kec. {shippingAddress.district}, {shippingAddress.city},{" "}
              {shippingAddress.province} {shippingAddress.postalCode}
            </p>
          ) : (
            <p className="text-zinc-600">Pesanan produk digital tanpa pengiriman fisik.</p>
          )}
        </div>
      </div>
    </div>
  );
}
