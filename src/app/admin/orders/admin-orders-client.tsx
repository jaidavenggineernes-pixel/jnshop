"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle,
  Truck,
  Eye,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";

interface AdminOrdersClientProps {
  initialOrders: any[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Action modal states
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("SiCepat REG");
  const [loadingAction, setLoadingAction] = useState(false);

  // Filter
  const filteredOrders = orders.filter((o) => {
    const matchTab =
      activeTab === "ALL"
        ? true
        : activeTab === "WAITING_CONFIRMATION"
        ? o.status === "WAITING_CONFIRMATION"
        : activeTab === "PENDING_PAYMENT"
        ? o.status === "PENDING_PAYMENT"
        : activeTab === "PROCESSING"
        ? o.status === "PROCESSING"
        : activeTab === "SHIPPED"
        ? o.status === "SHIPPED"
        : activeTab === "DELIVERED"
        ? o.status === "DELIVERED"
        : true;

    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.recipientName.toLowerCase().includes(search.toLowerCase()) ||
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
      const data = await res.json();
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
        return { label: "Menunggu Bayar", bg: "bg-amber-100 text-amber-800" };
      case "WAITING_CONFIRMATION":
        return { label: "Perlu Verifikasi!", bg: "bg-blue-100 text-blue-800 animate-pulse font-bold" };
      case "PAID":
        return { label: "Lunas", bg: "bg-emerald-100 text-emerald-800" };
      case "PROCESSING":
        return { label: "Diproses", bg: "bg-indigo-100 text-indigo-800" };
      case "SHIPPED":
        return { label: "Dikirim", bg: "bg-teal-100 text-teal-800" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-emerald-100 text-emerald-800" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-red-100 text-red-800" };
      default:
        return { label: status, bg: "bg-slate-100 text-slate-800" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verifikasi transfer manual, input nomor resi ekspedisi, dan pantau status transaksi ({orders.length} total pesanan).
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm space-y-4">
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
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">No. Pesanan</th>
                <th className="py-3.5 px-4">Penerima & WhatsApp</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada pesanan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const payment = ord.payments?.[0];
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {formatDate(ord.createdAt)}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{ord.recipientName}</span>
                        <a
                          href={`https://wa.me/${ord.recipientPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{ord.recipientPhone}</span>
                        </a>
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800">
                          {payment?.paymentMethod || "Transfer"}
                        </span>
                        {payment?.paymentProofUrl && (
                          <span className="block text-[10px] text-blue-600 font-bold">
                            ✓ Bukti Diunggah
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-black text-slate-900">
                        {formatRupiah(ord.grandTotal)}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setCourierName(ord.courierName || "SiCepat REG");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400">Detail & Pengelolaan:</span>
                <h3 className="text-lg font-black text-slate-900 font-mono">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Buyer Box */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400">Penerima:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {selectedOrder.recipientName}
                </p>
                <p className="text-slate-600">WhatsApp: {selectedOrder.recipientPhone}</p>
                {selectedOrder.notes && (
                  <p className="text-slate-500 mt-1 italic">&quot;{selectedOrder.notes}&quot;</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-400">Status Saat Ini:</span>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      getStatusBadge(selectedOrder.status).bg
                    }`}
                  >
                    {getStatusBadge(selectedOrder.status).label}
                  </span>
                </div>
                <div className="text-base font-black text-blue-600 mt-2">
                  {formatRupiah(selectedOrder.grandTotal)}
                </div>
              </div>
            </div>

            {/* Payment Proof Verification Box */}
            {selectedOrder.payments?.[0]?.paymentProofUrl && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Bukti Transfer yang Diunggah Pelanggan
                  </span>
                  <a
                    href={selectedOrder.payments[0].paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-semibold underline flex items-center gap-1"
                  >
                    <span>Buka Foto Asli</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="w-full max-h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img
                    src={selectedOrder.payments[0].paymentProofUrl}
                    alt="Bukti Transfer"
                    className="max-h-48 object-contain"
                  />
                </div>

                {selectedOrder.status === "WAITING_CONFIRMATION" && (
                  <button
                    onClick={() => handleVerifyPayment(selectedOrder.id)}
                    disabled={loadingAction}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Verifikasi Pembayaran Ini</span>
                  </button>
                )}
              </div>
            )}

            {/* Input Resi Tracking (for Processing Orders) */}
            {["PAID", "PROCESSING"].includes(selectedOrder.status) && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Input Nomor Resi Pengiriman
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Ekspedisi (SiCepat / JNE / J&T)"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Resi Resmi..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <button
                  onClick={() => handleAddTracking(selectedOrder.id)}
                  disabled={loadingAction || !trackingNumber.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Kirim Pesanan & Kirim Resi ke Pelanggan</span>
                </button>
              </div>
            )}

            {/* Ordered Items List */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">Daftar Produk:</span>
              <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{item.productName}</span>
                      <span className="text-slate-500 block">
                        Qty: {item.quantity} × {formatRupiah(item.productPrice)}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Status Fast Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Ubah Status Cepat:</span>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "DELIVERED")}
                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                >
                  Selesai
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, "CANCELLED")}
                  className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold"
                >
                  Batalkan
                </button>
              </div>

              <Link
                href={`/orders/${selectedOrder.orderNumber}`}
                target="_blank"
                className="text-blue-600 font-bold hover:underline flex items-center gap-1"
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
