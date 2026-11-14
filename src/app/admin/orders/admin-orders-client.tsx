"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  ExternalLink,
  Search,
  Check,
  X,
  MessageCircle,
  AlertTriangle,
  Mail,
  QrCode,
  Send,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import { createAdminToCustomerQRISUrl } from "@/lib/notification-links";

interface AdminOrdersClientProps {
  initialOrders: any[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("SiCepat REG");
  const [loadingAction, setLoadingAction] = useState(false);

  // Admin QRIS Email Response states
  const [qrisFile, setQrisFile] = useState<File | null>(null);
  const [qrisPreviewUrl, setQrisPreviewUrl] = useState<string | null>(null);
  const [qrisExternalUrl, setQrisExternalUrl] = useState("");
  const [qrisAdminMessage, setQrisAdminMessage] = useState("");
  const [sendingQris, setSendingQris] = useState(false);
  const [qrisFeedback, setQrisFeedback] = useState<{
    type: "success" | "warning" | "error";
    text: string;
  } | null>(null);

  const parseGatewayMeta = (order: any): Record<string, any> => {
    const raw = order?.payments?.[0]?.paymentGatewayPayload;
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const openManageOrderModal = (ord: any) => {
    setSelectedOrder(ord);
    setCourierName(ord.courierName || "SiCepat REG");
    setQrisFile(null);
    setQrisPreviewUrl(null);
    setQrisExternalUrl("");
    setQrisFeedback(null);
    setQrisAdminMessage(
      `Berikut kode QRIS resmi JNshop untuk pesanan #${ord.orderNumber} dengan nominal tepat ${formatRupiah(
        ord.grandTotal
      )}. Silakan pindai dan transfer tepat sesuai nominal tersebut.`
    );
  };

  const handleSendQrisToCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSendingQris(true);
    setQrisFeedback(null);

    try {
      const formData = new FormData();
      if (qrisFile) {
        formData.append("qrisImage", qrisFile);
      }
      if (qrisExternalUrl.trim()) {
        formData.append("qrisUrl", qrisExternalUrl.trim());
      }
      if (qrisAdminMessage.trim()) {
        formData.append("adminMessage", qrisAdminMessage.trim());
      }

      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/send-qris`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim kode QRIS ke pelanggan.");
      }

      const updateOrderPaymentPayload = (ord: any) => {
        if (ord.id !== selectedOrder.id) return ord;
        const payments = [...(ord.payments || [])];
        if (payments[0]) {
          payments[0] = {
            ...payments[0],
            paymentGatewayPayload: data.paymentGatewayPayload,
          };
        }
        return { ...ord, payments };
      };

      setOrders((prev) => prev.map(updateOrderPaymentPayload));
      setSelectedOrder((prev: any) => (prev ? updateOrderPaymentPayload(prev) : prev));
      setQrisFile(null);
      setQrisPreviewUrl(null);

      if (data.emailSent) {
        setQrisFeedback({
          type: "success",
          text: `Kode QRIS berhasil dikirim ke email ${selectedOrder.customerEmail} (via ${data.provider?.toUpperCase()}).`,
        });
      } else {
        setQrisFeedback({
          type: "warning",
          text: `Data QRIS disimpan ke pesanan, namun email otomatis belum terkirim: ${
            data.emailError || "SMTP/Resend belum dikonfigurasi."
          } Atur SMTP di Pengaturan > Email atau klik tombol aplikasi email di bawah.`,
        });
      }
    } catch (err: any) {
      setQrisFeedback({
        type: "error",
        text: err?.message || "Terjadi kesalahan saat mengirim kode QRIS.",
      });
    } finally {
      setSendingQris(false);
    }
  };

  useEffect(() => {
    if (!selectedOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedOrder(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrder]);

  const filteredOrders = orders.filter((o) => {
    const matchTab = activeTab === "ALL" ? true : o.status === activeTab;

    const q = search.toLowerCase();
    const matchSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.recipientName.toLowerCase().includes(q) ||
      o.recipientPhone.includes(search);

    return matchTab && matchSearch;
  });

  const handleVerifyPayment = async (orderId: string) => {
    if (!confirm("Konfirmasi verifikasi pembayaran pesanan ini?")) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VERIFY_PAYMENT" }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: data.order.status } : ord))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: data.order.status });
        }
      } else {
        alert(data.error || "Gagal verifikasi pembayaran");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddTracking = async (orderId: string) => {
    if (!trackingNumber.trim()) {
      alert("Masukkan nomor resi pengiriman.");
      return;
    }
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ADD_TRACKING",
          trackingNumber: trackingNumber.trim(),
          courierName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === orderId
              ? {
                  ...ord,
                  status: "SHIPPED",
                  trackingNumber: trackingNumber.trim(),
                  courierName,
                }
              : ord
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: "SHIPPED",
            trackingNumber: trackingNumber.trim(),
            courierName,
          });
        }
        setTrackingNumber("");
      } else {
        alert(data.error || "Gagal memperbarui nomor resi");
      }
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Menunggu Bayar", bg: "bg-amber-50 text-amber-800 border border-amber-200" };
      case "WAITING_CONFIRMATION":
        return {
          label: "Perlu Verifikasi",
          bg: "bg-amber-100 text-amber-900 border border-amber-300 font-bold",
        };
      case "PAID":
        return { label: "Lunas", bg: "bg-green-50 text-green-800 border border-green-200" };
      case "PROCESSING":
        return { label: "Diproses", bg: "bg-zinc-100 text-zinc-900 border border-zinc-300" };
      case "SHIPPED":
        return { label: "Dikirim", bg: "bg-zinc-900 text-white border border-zinc-900" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-green-50 text-green-800 border border-green-200" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-red-50 text-red-800 border border-red-200" };
      default:
        return { label: status, bg: "bg-zinc-100 text-zinc-800 border border-zinc-200" };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Manajemen Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">
          Verifikasi transfer manual, input nomor resi ekspedisi, dan pantau transaksi ({orders.length} total pesanan).
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-zinc-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            {[
              { id: "ALL", label: "Semua Pesanan" },
              { id: "WAITING_CONFIRMATION", label: "Perlu Verifikasi" },
              { id: "PENDING_PAYMENT", label: "Menunggu Bayar" },
              { id: "PROCESSING", label: "Diproses" },
              { id: "SHIPPED", label: "Dalam Pengiriman" },
              { id: "DELIVERED", label: "Selesai" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Cari no. invoice / nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800/30"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-3.5 px-6">No. Pesanan</th>
                <th className="py-3.5 px-4">Penerima & Kontak</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium text-zinc-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-600">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const payment = ord.payments?.[0];
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-zinc-900">
                        {ord.orderNumber}
                        <span className="block text-[11px] text-zinc-600 font-sans font-normal mt-0.5">
                          {formatDate(ord.createdAt)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-zinc-900 block">{ord.recipientName}</span>
                        {ord.customerEmail && (
                          <a
                            href={`mailto:${ord.customerEmail}`}
                            className="text-[11px] text-zinc-700 hover:text-zinc-900 hover:underline flex items-center gap-1 mt-0.5 truncate max-w-[190px]"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{ord.customerEmail}</span>
                          </a>
                        )}
                        <a
                          href={`https://wa.me/${ord.recipientPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-green-800 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <MessageCircle className="w-3 h-3 shrink-0" />
                          <span>{ord.recipientPhone}</span>
                        </a>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-zinc-900">
                            {payment?.paymentMethod || "Transfer"}
                          </span>
                          {payment?.paymentMethod === "QRIS_INSTANT" && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              QRIS Presisi
                            </span>
                          )}
                        </div>
                        {payment?.paymentProofUrl && (
                          <span className="block text-[11px] text-green-800 font-semibold mt-0.5">
                            Bukti Diunggah
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-bold text-zinc-900">
                        {formatRupiah(ord.grandTotal)}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => openManageOrderModal(ord)}
                          className="min-h-[44px] px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs transition-colors"
                        >
                          Kelola Pesanan
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Order Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manage-order-title"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 border border-zinc-200 max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <span className="text-xs text-zinc-600">Detail & Pengelolaan</span>
                <h3 id="manage-order-title" className="text-lg font-bold text-zinc-900 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Tutup jendela detail pesanan"
                className="w-11 h-11 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Buyer Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div>
                <span className="text-zinc-600">Penerima & Kontak</span>
                <p className="font-bold text-zinc-900 text-sm mt-0.5">
                  {selectedOrder.recipientName}
                </p>
                {selectedOrder.customerEmail && (
                  <p className="text-zinc-700 flex items-center gap-1.5 mt-1 font-medium">
                    <Mail className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                    <span className="truncate">{selectedOrder.customerEmail}</span>
                  </p>
                )}
                <p className="text-zinc-700 flex items-center gap-1.5 mt-1">
                  <MessageCircle className="w-3.5 h-3.5 text-green-800 shrink-0" />
                  <span>WhatsApp: {selectedOrder.recipientPhone}</span>
                </p>
                {selectedOrder.notes && (
                  <p className="text-zinc-600 mt-1.5 italic">&quot;{selectedOrder.notes}&quot;</p>
                )}
              </div>
              <div className="sm:text-right">
                <span className="text-zinc-600">Status Saat Ini</span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      getStatusBadge(selectedOrder.status).bg
                    }`}
                  >
                    {getStatusBadge(selectedOrder.status).label}
                  </span>
                </div>
                <div className="text-base font-bold text-zinc-900 mt-2">
                  {formatRupiah(selectedOrder.grandTotal)}
                </div>
              </div>
            </div>

            {/* QRIS Response & Email Dispatch Panel */}
            {selectedOrder.payments?.[0]?.paymentMethod === "QRIS_INSTANT" && (() => {
              const qrisMeta = parseGatewayMeta(selectedOrder);
              return (
                <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-4 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-amber-800" />
                      Respon & Kirim Kode QRIS ke Email Pelanggan
                    </span>
                    {qrisMeta.qrisSentAt ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-300">
                        QRIS Sudah Dikirim
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Menunggu Kirim QRIS
                      </span>
                    )}
                  </div>

                  {/* Admin Email Alert Status */}
                  {qrisMeta.adminEmailStatus === "SENT" ? (
                    <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-[11px] text-green-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-800 shrink-0" />
                      <span>
                        Notifikasi otomatis pesanan ini telah dikirim ke email admin:{" "}
                        <strong>{qrisMeta.adminEmailTo || "jaidav.enggineernes@gmail.com"}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-white border border-amber-300 text-[11px] text-amber-950 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        Notifikasi email otomatis belum aktif{" "}
                        {qrisMeta.adminEmailError ? `(${qrisMeta.adminEmailError})` : "(SMTP belum diatur)"}.
                      </span>
                      <Link
                        href="/admin/settings?tab=email"
                        className="font-bold text-green-800 underline shrink-0"
                      >
                        Atur Email SMTP
                      </Link>
                    </div>
                  )}

                  {/* Summary Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-amber-200">
                    <div>
                      <span className="text-[11px] text-zinc-600 block">Email Tujuan Pelanggan</span>
                      <span className="font-bold text-zinc-900 text-xs flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                        <span className="truncate">{selectedOrder.customerEmail || "Tidak ada email"}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-600 block">Nominal Tagihan Tepat</span>
                      <span className="font-bold text-zinc-900 text-sm font-mono mt-0.5 block">
                        {formatRupiah(selectedOrder.grandTotal)}
                      </span>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
                      <span className="text-[11px] font-bold text-amber-900 block">
                        Pesan Tambahan dari Pelanggan:
                      </span>
                      <p className="text-zinc-900 whitespace-pre-wrap">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Already Sent Preview */}
                  {qrisMeta.qrisSentAt && qrisMeta.qrisImageUrl && (
                    <div className="p-3 bg-white rounded-lg border border-green-200 flex items-center gap-3">
                      <img
                        src={qrisMeta.qrisImageUrl}
                        alt="QRIS terkirim"
                        className="w-16 h-16 object-contain rounded border border-zinc-200 bg-zinc-50 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-green-800">
                          QRIS terakhir dikirim pada {formatDate(qrisMeta.qrisSentAt)}
                        </p>
                        {qrisMeta.qrisAdminMessage && (
                          <p className="text-zinc-600 truncate mt-0.5">{qrisMeta.qrisAdminMessage}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Direct Send QRIS Form */}
                  <form onSubmit={handleSendQrisToCustomer} className="space-y-3 bg-white p-3.5 rounded-lg border border-amber-200">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-800 mb-1.5">
                        1. Upload Foto Kode QRIS Sesuai Nominal ({formatRupiah(selectedOrder.grandTotal)})
                      </label>
                      <label
                        htmlFor="admin-qris-file"
                        className="flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-300 hover:border-green-800 rounded-lg bg-zinc-50 cursor-pointer text-xs font-medium text-zinc-800"
                      >
                        {qrisPreviewUrl ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={qrisPreviewUrl}
                              alt="Pratinjau QRIS"
                              className="w-14 h-14 object-contain rounded border border-zinc-200 bg-white"
                            />
                            <span className="text-xs font-semibold text-green-800">
                              {qrisFile?.name} (Klik untuk ganti)
                            </span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 text-zinc-700" />
                            <span>Pilih Gambar QRIS (JPG / PNG / WEBP)</span>
                          </>
                        )}
                        <input
                          id="admin-qris-file"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setQrisFile(f);
                            setQrisPreviewUrl(f ? URL.createObjectURL(f) : null);
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    <div>
                      <label htmlFor="admin-qris-url" className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Atau Tautan Gambar/Halaman QRIS (Opsional)
                      </label>
                      <input
                        id="admin-qris-url"
                        type="url"
                        value={qrisExternalUrl}
                        onChange={(e) => setQrisExternalUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full min-h-[38px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900"
                      />
                    </div>

                    <div>
                      <label htmlFor="admin-qris-msg" className="block text-[11px] font-bold text-zinc-800 mb-1">
                        2. Pesan Tambahan untuk Pelanggan
                      </label>
                      <textarea
                        id="admin-qris-msg"
                        rows={2}
                        value={qrisAdminMessage}
                        onChange={(e) => setQrisAdminMessage(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-900"
                      />
                    </div>

                    {qrisFeedback && (
                      <div
                        className={`p-2.5 rounded-lg text-[11px] font-medium border ${
                          qrisFeedback.type === "success"
                            ? "bg-green-50 border-green-200 text-green-900"
                            : qrisFeedback.type === "warning"
                            ? "bg-amber-50 border-amber-300 text-amber-950"
                            : "bg-red-50 border-red-200 text-red-900"
                        }`}
                      >
                        {qrisFeedback.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sendingQris || (!qrisFile && !qrisExternalUrl.trim() && !qrisAdminMessage.trim())}
                      className="w-full min-h-[44px] py-2 px-4 rounded-lg bg-green-800 hover:bg-green-900 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {sendingQris
                          ? "Mengirim Kode QRIS ke Email Pelanggan..."
                          : `Kirim Kode QRIS ke ${selectedOrder.customerEmail || "Email Pelanggan"}`}
                      </span>
                    </button>
                  </form>

                  {/* Manual Fallback Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={createAdminToCustomerQRISUrl({
                        orderNumber: selectedOrder.orderNumber,
                        recipientName: selectedOrder.recipientName,
                        recipientPhone: selectedOrder.recipientPhone,
                        customerEmail: selectedOrder.customerEmail,
                        grandTotal: selectedOrder.grandTotal,
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-h-[44px] py-2 px-3 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4 text-green-800" />
                      <span>Kabari via WhatsApp</span>
                    </a>

                    {selectedOrder.customerEmail && (
                      <a
                        href={`mailto:${selectedOrder.customerEmail}?subject=${encodeURIComponent(
                          `Kode QRIS Pembayaran #${selectedOrder.orderNumber} (${formatRupiah(
                            selectedOrder.grandTotal
                          )}) - JNshop`
                        )}&body=${encodeURIComponent(
                          `Halo ${selectedOrder.recipientName},\n\nTerima kasih telah berbelanja di JNshop.\nBerikut rincian pesanan Anda:\n- No. Pesanan: ${
                            selectedOrder.orderNumber
                          }\n- Nominal Belanja Tepat: ${formatRupiah(
                            selectedOrder.grandTotal
                          )}\n\nTerlampir kode QRIS resmi JNshop untuk nominal tersebut.\n\nSalam,\nAdmin JNshop (+62 851-9121-9129)`
                        )}`}
                        className="flex-1 min-h-[44px] py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Buka Aplikasi Email (Manual)</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Payment Proof Verification Box */}
            {selectedOrder.payments?.[0]?.paymentProofUrl && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-800" />
                    Bukti Transfer yang Diunggah Pelanggan
                  </span>
                  <a
                    href={selectedOrder.payments[0].paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-800 font-semibold hover:underline flex items-center gap-1 min-h-[44px] px-1"
                  >
                    <span>Buka Foto Asli</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="w-full max-h-48 rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
                  <img
                    src={selectedOrder.payments[0].paymentProofUrl}
                    alt="Bukti Transfer"
                    className="max-h-48 object-contain"
                  />
                </div>

                {selectedOrder.status === "WAITING_CONFIRMATION" && (
                  <button
                    type="button"
                    onClick={() => handleVerifyPayment(selectedOrder.id)}
                    disabled={loadingAction}
                    className="w-full min-h-[44px] py-2.5 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Verifikasi Pembayaran Ini</span>
                  </button>
                )}
              </div>
            )}

            {/* Input Resi Tracking */}
            {["PAID", "PROCESSING"].includes(selectedOrder.status) && (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-xs">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-zinc-700" />
                  Input Nomor Resi Pengiriman
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Ekspedisi (SiCepat / JNE / J&T)"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="min-h-[44px] bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Resi Resmi..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    className="min-h-[44px] bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddTracking(selectedOrder.id)}
                  disabled={loadingAction || !trackingNumber.trim()}
                  className="w-full min-h-[44px] py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Simpan Resi & Tandai Dikirim</span>
                </button>
              </div>
            )}

            {/* Ordered Items List */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-zinc-900 block">Daftar Produk</span>
              <div className="divide-y divide-zinc-200 max-h-40 overflow-y-auto border border-zinc-200 rounded-xl px-3 bg-zinc-50">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-zinc-900">{item.productName}</span>
                      <span className="text-zinc-600 block">
                        Qty: {item.quantity} x {formatRupiah(item.productPrice)}
                      </span>
                    </div>
                    <span className="font-bold text-zinc-900 shrink-0">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast Actions */}
            <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-zinc-600">Ubah Status Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "DELIVERED")}
                  disabled={loadingAction}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-semibold"
                >
                  Selesai
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED")}
                  disabled={loadingAction}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-semibold"
                >
                  Batalkan
                </button>
              </div>

              <Link
                href={`/orders/${selectedOrder.orderNumber}`}
                target="_blank"
                className="min-h-[44px] px-2 text-green-800 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Invoice Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
