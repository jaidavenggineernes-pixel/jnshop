"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Search,
  Filter,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface CouponItem {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minPurchase: number;
  maxDiscount: number | null;
  quota: number;
  usedCount: number;
  startDate: string | Date;
  endDate: string | Date | null;
  isActive: boolean;
  createdAt: string | Date;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "expired" | "inactive">("all");

  // Create form state
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("10");
  const [minPurchase, setMinPurchase] = useState("50000");
  const [maxDiscount, setMaxDiscount] = useState("50000");
  const [quota, setQuota] = useState("100");
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [hasEndDate, setHasEndDate] = useState(true);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [editValue, setEditValue] = useState("");
  const [editMinPurchase, setEditMinPurchase] = useState("");
  const [editMaxDiscount, setEditMaxDiscount] = useState("");
  const [editQuota, setEditQuota] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editHasEndDate, setEditHasEndDate] = useState(false);
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      showToast("error", "Gagal memuat daftar voucher.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Keyboard shortcut: close modal on Escape
  useEffect(() => {
    if (!editModalOpen && !deleteModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editModalOpen && !editSaving) {
          setEditModalOpen(false);
          setEditingCoupon(null);
        }
        if (deleteModalOpen && !deleting) {
          setDeleteModalOpen(false);
          setCouponToDelete(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editModalOpen, deleteModalOpen, editSaving, deleting]);

  // Helper to determine status
  const getCouponStatus = (c: CouponItem) => {
    const now = new Date();
    if (!c.isActive) {
      return { label: "Nonaktif", color: "bg-zinc-100 text-zinc-700 border-zinc-200" };
    }
    if (c.usedCount >= c.quota) {
      return { label: "Kuota Habis", color: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    if (c.endDate && new Date(c.endDate) < now) {
      return { label: "Kedaluwarsa", color: "bg-red-50 text-red-800 border-red-200" };
    }
    if (c.startDate && new Date(c.startDate) > now) {
      return { label: "Belum Dimulai", color: "bg-zinc-100 text-zinc-700 border-zinc-200" };
    }
    return { label: "Aktif", color: "bg-green-50 text-green-800 border-green-200" };
  };

  const counts = useMemo(() => {
    const now = new Date();
    let total = coupons.length;
    let active = 0;
    let expired = 0;
    let inactive = 0;

    for (const c of coupons) {
      if (!c.isActive) {
        inactive++;
      } else if ((c.endDate && new Date(c.endDate) < now) || c.usedCount >= c.quota) {
        expired++;
      } else {
        active++;
      }
    }
    return { total, active, expired, inactive };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((c) => {
      const isExpiredOrFull = (c.endDate && new Date(c.endDate) < now) || c.usedCount >= c.quota;
      if (activeTab === "active" && (!c.isActive || isExpiredOrFull)) return false;
      if (activeTab === "expired" && (!c.isActive || !isExpiredOrFull)) return false;
      if (activeTab === "inactive" && c.isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchDesc = c.description ? c.description.toLowerCase().includes(q) : false;
        if (!matchCode && !matchDesc) return false;
      }
      return true;
    });
  }, [coupons, activeTab, searchQuery]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || !value) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          description: description.trim() || null,
          type,
          value: Number(value),
          minPurchase: Number(minPurchase) || 0,
          maxDiscount: type === "PERCENTAGE" && maxDiscount ? Number(maxDiscount) : null,
          quota: parseInt(quota, 10) || 100,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          endDate: hasEndDate && endDate ? new Date(endDate + "T23:59:59").toISOString() : null,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat kupon.");
      }

      showToast("success", `Voucher "${cleanCode}" berhasil diaktifkan dengan tenggat waktu.`);
      setCode("");
      setDescription("");
      await loadCoupons();
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan saat membuat kupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setEditCode(c.code);
    setEditDesc(c.description || "");
    setEditType(c.type);
    setEditValue(String(c.value));
    setEditMinPurchase(String(c.minPurchase));
    setEditMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : "");
    setEditQuota(String(c.quota));
    setEditStartDate(c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : "");
    if (c.endDate) {
      setEditHasEndDate(true);
      setEditEndDate(new Date(c.endDate).toISOString().slice(0, 10));
    } else {
      setEditHasEndDate(false);
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setEditEndDate(d.toISOString().slice(0, 10));
    }
    setEditIsActive(c.isActive);
    setEditError("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setEditSaving(true);
    setEditError("");

    try {
      const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editCode.trim().toUpperCase(),
          description: editDesc.trim() || null,
          type: editType,
          value: Number(editValue),
          minPurchase: Number(editMinPurchase) || 0,
          maxDiscount: editType === "PERCENTAGE" && editMaxDiscount ? Number(editMaxDiscount) : null,
          quota: parseInt(editQuota, 10) || 100,
          startDate: editStartDate ? new Date(editStartDate).toISOString() : null,
          endDate: editHasEndDate && editEndDate ? new Date(editEndDate + "T23:59:59").toISOString() : null,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui voucher.");
      }

      showToast("success", data.message || `Voucher "${editCode}" berhasil diperbarui.`);
      setEditModalOpen(false);
      setEditingCoupon(null);
      await loadCoupons();
    } catch (err: any) {
      setEditError(err.message || "Terjadi kesalahan.");
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleStatus = async (c: CouponItem) => {
    const nextState = !c.isActive;
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah status voucher.");
      }
      showToast(
        "success",
        nextState
          ? `Voucher "${c.code}" kini aktif kembali.`
          : `Voucher "${c.code}" dinonaktifkan.`
      );
      await loadCoupons();
    } catch (err: any) {
      showToast("error", err.message || "Gagal mengubah status.");
    }
  };

  const openDeleteModal = (c: CouponItem) => {
    setCouponToDelete(c);
    setDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!couponToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${couponToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus voucher.");
      }
      showToast("success", `Voucher "${couponToDelete.code}" berhasil dihapus.`);
      setDeleteModalOpen(false);
      setCouponToDelete(null);
      await loadCoupons();
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghapus voucher.");
    } finally {
      setDeleting(false);
    }
  };

  // Quick preset dates
  const setQuickEndDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setHasEndDate(true);
    setEndDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-xs ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-900"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-zinc-50 border-zinc-200 text-zinc-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-800 shrink-0" />
            ) : toast.type === "error" ? (
              <XCircle className="w-5 h-5 text-red-800 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" />
            )}
            <p className="font-medium leading-relaxed">{toast.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="pb-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Voucher & Diskon Toko
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Atur tenggat waktu kedaluwarsa, kuota, dan batas potongan maksimal agar promosi terkendali dan tidak merugikan toko.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-800" />
            <span>Proteksi Margin Aktif</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Buat Voucher */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-800" />
              <span>Buat Voucher Baru</span>
            </h2>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              Tentukan kode, nilai diskon, dan tenggat waktu kedaluwarsa.
            </p>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
            <div>
              <label htmlFor="create-coupon-code" className="block font-semibold text-zinc-800 mb-1.5">
                Kode Voucher *
              </label>
              <input
                id="create-coupon-code"
                type="text"
                required
                placeholder="Contoh: HEMAT20, PROMO2026"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 uppercase font-mono font-bold tracking-wider text-zinc-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-800/30"
              />
            </div>

            <div>
              <label htmlFor="create-coupon-desc" className="block font-semibold text-zinc-800 mb-1.5">
                Keterangan Promo (Opsional)
              </label>
              <input
                id="create-coupon-desc"
                type="text"
                placeholder="Contoh: Diskon Pelanggan Baru Bulan Ini"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-zinc-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-800/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="create-coupon-type" className="block font-semibold text-zinc-800 mb-1.5">
                  Tipe Diskon
                </label>
                <select
                  id="create-coupon-type"
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-zinc-900 font-medium"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label htmlFor="create-coupon-val" className="block font-semibold text-zinc-800 mb-1.5">
                  Nilai {type === "PERCENTAGE" ? "(%)" : "(Rp)"} *
                </label>
                <input
                  id="create-coupon-val"
                  type="number"
                  required
                  min={1}
                  max={type === "PERCENTAGE" ? 100 : undefined}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-green-800/30"
                />
              </div>
            </div>

            {/* Proteksi Maksimal Diskon jika Persentase */}
            {type === "PERCENTAGE" && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="create-coupon-cap" className="font-semibold text-amber-900 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                    <span>Batas Maksimal Potongan Diskon (Rp)</span>
                  </label>
                </div>
                <input
                  id="create-coupon-cap"
                  type="number"
                  min={1000}
                  step={1000}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="50000"
                  className="w-full min-h-[38px] bg-white border border-amber-300 rounded-md px-3 text-zinc-900 font-bold text-xs"
                />
                <p className="text-[10px] text-amber-800 leading-tight">
                  Diskon 20% belanja Rp 10.000.000 tetap terbatasi di {formatRupiah(Number(maxDiscount) || 50000)} agar admin tidak rugi.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="create-coupon-min" className="block font-semibold text-zinc-800 mb-1.5">
                  Minimal Belanja (Rp)
                </label>
                <input
                  id="create-coupon-min"
                  type="number"
                  min={0}
                  step={5000}
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-zinc-900"
                />
              </div>

              <div>
                <label htmlFor="create-coupon-quota" className="block font-semibold text-zinc-800 mb-1.5">
                  Kuota Pemakaian
                </label>
                <input
                  id="create-coupon-quota"
                  type="number"
                  min={1}
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-zinc-900 font-bold"
                />
              </div>
            </div>

            {/* Bagian Tanggal Mulai & Tanggal Tenggat Waktu */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-green-800" />
                  <span>Masa Berlaku & Tenggat Waktu</span>
                </span>
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => setHasEndDate(e.target.checked)}
                    className="w-3.5 h-3.5 accent-green-800 rounded"
                  />
                  <span className="font-semibold text-zinc-800">Ada Tenggat Waktu</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="create-start-date" className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Mulai Berlaku
                  </label>
                  <input
                    id="create-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full min-h-[38px] bg-white border border-zinc-300 rounded-lg px-2.5 text-xs text-zinc-900"
                  />
                </div>

                <div>
                  <label htmlFor="create-end-date" className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Tenggat Kedaluwarsa
                  </label>
                  <input
                    id="create-end-date"
                    type="date"
                    disabled={!hasEndDate}
                    value={hasEndDate ? endDate : ""}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full min-h-[38px] bg-white border border-zinc-300 rounded-lg px-2.5 text-xs text-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-500"
                  />
                </div>
              </div>

              {hasEndDate && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-zinc-600 font-medium">Atur cepat:</span>
                  <button
                    type="button"
                    onClick={() => setQuickEndDate(7)}
                    className="px-2 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 rounded text-[10px] font-semibold text-zinc-700"
                  >
                    +7 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickEndDate(14)}
                    className="px-2 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 rounded text-[10px] font-semibold text-zinc-700"
                  >
                    +14 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickEndDate(30)}
                    className="px-2 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 rounded text-[10px] font-semibold text-zinc-700"
                  >
                    +30 Hari
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasEndDate(false)}
                    className="px-2 py-1 bg-white border border-zinc-200 hover:bg-zinc-100 rounded text-[10px] font-semibold text-zinc-700"
                  >
                    Tanpa Batas
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !code.trim()}
              className="w-full min-h-[44px] rounded-lg bg-green-800 hover:bg-green-900 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Voucher...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>Aktifkan Voucher Baru</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Daftar Kupon, Filter, dan Aksi */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 overflow-hidden space-y-0">
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-zinc-900">
                Daftar Voucher Toko ({counts.total})
              </h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                Kelola status, edit tenggat waktu, atau hapus voucher promo.
              </p>
            </div>

            <div className="relative sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kode kupon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[38px] pl-8 pr-8 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30 text-zinc-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="w-7 h-7 flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center gap-1.5 flex-wrap text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`min-h-[36px] px-3 py-1 rounded-md transition-colors ${
                activeTab === "all"
                  ? "bg-white font-bold text-zinc-900 shadow-sm border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Semua ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`min-h-[36px] px-3 py-1 rounded-md transition-colors ${
                activeTab === "active"
                  ? "bg-white font-bold text-green-800 shadow-sm border border-green-200"
                  : "text-zinc-600 hover:text-green-800"
              }`}
            >
              Aktif ({counts.active})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("expired")}
              className={`min-h-[36px] px-3 py-1 rounded-md transition-colors ${
                activeTab === "expired"
                  ? "bg-white font-bold text-red-800 shadow-sm border border-red-200"
                  : "text-zinc-600 hover:text-red-800"
              }`}
            >
              Kedaluwarsa/Habis ({counts.expired})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("inactive")}
              className={`min-h-[36px] px-3 py-1 rounded-md transition-colors ${
                activeTab === "inactive"
                  ? "bg-white font-bold text-zinc-900 shadow-sm border border-zinc-200"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Nonaktif ({counts.inactive})
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-zinc-600">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-400" />
              <span>Memuat data voucher...</span>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-600">
              <Ticket className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p className="font-semibold text-zinc-900">Tidak ada voucher ditemukan.</p>
              <p className="mt-1">Coba sesuaikan kata kunci pencarian atau tab filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 text-xs">
              {filteredCoupons.map((c) => {
                const status = getCouponStatus(c);
                const endDateObj = c.endDate ? new Date(c.endDate) : null;
                const isExpired = endDateObj && endDateObj < new Date();

                return (
                  <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-base text-zinc-900 tracking-wider">
                          {c.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-green-50 text-green-800 border border-green-200 tabular-nums">
                          {c.type === "PERCENTAGE" ? `Diskon ${c.value}%` : `Potongan ${formatRupiah(c.value)}`}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      {c.description && (
                        <p className="text-zinc-700 text-xs font-medium">{c.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600">
                        <span>Min. Belanja: <strong className="text-zinc-800">{formatRupiah(c.minPurchase)}</strong></span>
                        {c.maxDiscount && (
                          <span>| Maks. Potongan: <strong className="text-amber-800">{formatRupiah(c.maxDiscount)}</strong></span>
                        )}
                        <span>| Terpakai: <strong className="text-zinc-800">{c.usedCount}</strong> dari {c.quota}</span>
                      </div>

                      {/* Info Tenggat Waktu */}
                      <div className="flex items-center gap-1.5 text-[11px] pt-0.5">
                        <Clock className={`w-3.5 h-3.5 shrink-0 ${isExpired ? "text-red-700" : "text-zinc-600"}`} />
                        {c.endDate ? (
                          <span className={isExpired ? "text-red-700 font-semibold" : "text-zinc-700"}>
                            Tenggat Waktu: {new Date(c.endDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })} {isExpired ? "(Telah Kedaluwarsa)" : ""}
                          </span>
                        ) : (
                          <span className="text-zinc-600">Berlaku Selamanya (Tanpa Tenggat)</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        title="Edit nilai, kuota, atau tanggal tenggat waktu voucher ini"
                        className="min-h-[40px] px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        title={c.isActive ? "Nonaktifkan voucher ini agar tidak bisa digunakan" : "Aktifkan kembali voucher ini"}
                        className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                          c.isActive
                            ? "bg-zinc-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-zinc-700 border-zinc-200"
                            : "bg-green-50 hover:bg-green-100 text-green-800 border-green-200"
                        }`}
                      >
                        {c.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(c)}
                        aria-label={`Hapus voucher ${c.code}`}
                        title="Hapus voucher ini secara permanen"
                        className="w-10 h-10 rounded-lg hover:bg-red-50 text-zinc-500 hover:text-red-800 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Voucher Modal */}
      {editModalOpen && editingCoupon && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-coupon-title"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 shadow-xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4 bg-zinc-50">
              <div>
                <h3 id="edit-coupon-title" className="font-bold text-sm text-zinc-900">
                  Edit Voucher: <span className="font-mono text-green-800">{editingCoupon.code}</span>
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Perpanjang tenggat waktu, ubah kuota, atau perbarui batas maksimal diskon.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!editSaving) {
                    setEditModalOpen(false);
                    setEditingCoupon(null);
                  }
                }}
                aria-label="Tutup modal edit voucher"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              {editError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label htmlFor="edit-coupon-code" className="block font-semibold text-zinc-800 mb-1">
                  Kode Voucher *
                </label>
                <input
                  id="edit-coupon-code"
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3 uppercase font-mono font-bold text-zinc-900"
                />
              </div>

              <div>
                <label htmlFor="edit-coupon-desc" className="block font-semibold text-zinc-800 mb-1">
                  Keterangan Promo
                </label>
                <input
                  id="edit-coupon-desc"
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-coupon-type" className="block font-semibold text-zinc-800 mb-1">
                    Tipe Diskon
                  </label>
                  <select
                    id="edit-coupon-type"
                    value={editType}
                    onChange={(e: any) => setEditType(e.target.value)}
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-zinc-900 font-medium"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-coupon-val" className="block font-semibold text-zinc-800 mb-1">
                    Nilai {editType === "PERCENTAGE" ? "(%)" : "(Rp)"} *
                  </label>
                  <input
                    id="edit-coupon-val"
                    type="number"
                    required
                    min={1}
                    max={editType === "PERCENTAGE" ? 100 : undefined}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3 font-bold text-zinc-900"
                  />
                </div>
              </div>

              {editType === "PERCENTAGE" && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                  <label htmlFor="edit-coupon-cap" className="font-semibold text-amber-900 text-[11px] block">
                    Batas Maksimal Potongan Diskon (Rp)
                  </label>
                  <input
                    id="edit-coupon-cap"
                    type="number"
                    min={1000}
                    step={1000}
                    value={editMaxDiscount}
                    onChange={(e) => setEditMaxDiscount(e.target.value)}
                    placeholder="Contoh: 50000"
                    className="w-full min-h-[38px] bg-white border border-amber-300 rounded-md px-3 text-zinc-900 font-bold"
                  />
                  <p className="text-[10px] text-amber-800">
                    Batas atas nominal diskon agar margin toko terlindungi.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-coupon-min" className="block font-semibold text-zinc-800 mb-1">
                    Minimal Belanja (Rp)
                  </label>
                  <input
                    id="edit-coupon-min"
                    type="number"
                    min={0}
                    value={editMinPurchase}
                    onChange={(e) => setEditMinPurchase(e.target.value)}
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-zinc-900"
                  />
                </div>

                <div>
                  <label htmlFor="edit-coupon-quota" className="block font-semibold text-zinc-800 mb-1">
                    Total Kuota Pemakaian
                  </label>
                  <input
                    id="edit-coupon-quota"
                    type="number"
                    min={editingCoupon.usedCount || 1}
                    value={editQuota}
                    onChange={(e) => setEditQuota(e.target.value)}
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-zinc-900 font-bold"
                  />
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    Terpakai saat ini: {editingCoupon.usedCount}
                  </p>
                </div>
              </div>

              {/* Tanggal Mulai & Tenggat Waktu */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-green-800" />
                    <span>Perbarui Masa Berlaku</span>
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editHasEndDate}
                      onChange={(e) => setEditHasEndDate(e.target.checked)}
                      className="w-3.5 h-3.5 accent-green-800 rounded"
                    />
                    <span className="font-semibold text-zinc-800">Ada Tenggat Waktu</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="edit-start-date" className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Mulai Berlaku
                    </label>
                    <input
                      id="edit-start-date"
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full min-h-[38px] bg-white border border-zinc-300 rounded-lg px-2.5 text-xs text-zinc-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-end-date" className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Tenggat Kedaluwarsa
                    </label>
                    <input
                      id="edit-end-date"
                      type="date"
                      disabled={!editHasEndDate}
                      value={editHasEndDate ? editEndDate : ""}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full min-h-[38px] bg-white border border-zinc-300 rounded-lg px-2.5 text-xs text-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 accent-green-800 rounded"
                />
                <span className="font-semibold text-zinc-900 text-xs">
                  Voucher Berstatus Aktif (Dapat digunakan saat checkout)
                </span>
              </label>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingCoupon(null);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="min-h-[44px] px-5 py-2.5 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan Voucher</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && couponToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-coupon-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-zinc-200 shadow-xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-coupon-title" className="text-base font-bold text-zinc-900">
                  Hapus Voucher
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Apakah Anda yakin ingin menghapus voucher <strong className="font-mono text-zinc-900">{couponToDelete.code}</strong>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-700 space-y-1">
              <div><strong>Nilai Diskon:</strong> {couponToDelete.type === "PERCENTAGE" ? `${couponToDelete.value}%` : formatRupiah(couponToDelete.value)}</div>
              <div><strong>Riwayat Pemakaian:</strong> {couponToDelete.usedCount} kali digunakan</div>
              {couponToDelete.endDate && (
                <div><strong>Tenggat Waktu:</strong> {new Date(couponToDelete.endDate).toLocaleDateString("id-ID")}</div>
              )}
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Tindakan ini akan menghapus voucher dari sistem. Pelanggan tidak akan bisa lagi menggunakan kode ini saat checkout.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCouponToDelete(null);
                }}
                className="min-h-[44px] px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleExecuteDelete}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
