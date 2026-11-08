"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  Building,
  Banknote,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Search,
  Filter,
  Package,
  Binary,
  Loader2,
  Sliders,
  Lock,
  ExternalLink,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export interface PaymentMethodItem {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string | null;
  instructions: string | null;
  accountName: string | null;
  accountNumber: string | null;
  logoUrl: string | null;
  qrCodeUrl: string | null;
  isActive: boolean;
  minAmount: number | null;
  maxAmount: number | null;
  isForPhysicalOnly: boolean;
  displayOrder: number;
}

export interface ProductPaymentRule {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  isPhysical: boolean;
  isActive: boolean;
  allowCod: boolean;
  allowedPaymentMethods: string | null;
  category: {
    name: string;
  };
  images: { url: string }[];
}

interface AdminPaymentsClientProps {
  initialMethods: PaymentMethodItem[];
  initialProducts: ProductPaymentRule[];
}

export default function AdminPaymentsClient({
  initialMethods,
  initialProducts,
}: AdminPaymentsClientProps) {
  const [methods, setMethods] = useState<PaymentMethodItem[]>(initialMethods);
  const [products, setProducts] = useState<ProductPaymentRule[]>(initialProducts);

  const [activeTab, setActiveTab] = useState<"methods" | "products">("methods");
  const [productTypeFilter, setProductTypeFilter] = useState<"all" | "physical" | "digital">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [savingMethodId, setSavingMethodId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);

  // Method edit states
  const [editForms, setEditForms] = useState<{ [id: string]: Partial<PaymentMethodItem> }>(() => {
    const initial: { [id: string]: Partial<PaymentMethodItem> } = {};
    for (const m of initialMethods) {
      initial[m.id] = {
        accountName: m.accountName || "",
        accountNumber: m.accountNumber || "",
        maxAmount: m.maxAmount || undefined,
        description: m.description || "",
        instructions: m.instructions || "",
      };
    }
    return initial;
  });

  // Toast feedback
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

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productTypeFilter === "physical" && !p.isPhysical) return false;
      if (productTypeFilter === "digital" && p.isPhysical) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.name.toLowerCase().includes(q);
        if (!matchName && !matchCat) return false;
      }

      return true;
    });
  }, [products, productTypeFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const activeMethods = methods.filter((m) => m.isActive).length;
    const codMethod = methods.find((m) => m.code === "COD");
    const codActive = Boolean(codMethod?.isActive);
    const digitalCount = products.filter((p) => !p.isPhysical).length;
    const physicalCodCount = products.filter((p) => p.isPhysical && p.allowCod).length;
    const physicalNoCodCount = products.filter((p) => p.isPhysical && !p.allowCod).length;

    return {
      activeMethods,
      codActive,
      digitalCount,
      physicalCodCount,
      physicalNoCodCount,
    };
  }, [methods, products]);

  // Toggle Payment Method Active
  const handleToggleMethodActive = async (method: PaymentMethodItem) => {
    const nextActive = !method.isActive;
    setSavingMethodId(method.id);

    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: method.id,
          isActive: nextActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah status metode pembayaran");

      setMethods((prev) =>
        prev.map((m) => (m.id === method.id ? { ...m, isActive: nextActive } : m))
      );

      showToast(
        "success",
        `Metode "${method.name}" kini ${nextActive ? "DIAKTIFKAN" : "DINONAKTIFKAN"} untuk seluruh transaksi toko.`
      );
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan.");
    } finally {
      setSavingMethodId(null);
    }
  };

  // Save Method Details
  const handleSaveMethodDetails = async (method: PaymentMethodItem) => {
    const form = editForms[method.id] || {};
    setSavingMethodId(method.id);

    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: method.id,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          maxAmount: form.maxAmount,
          description: form.description,
          instructions: form.instructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan rincian metode pembayaran");

      setMethods((prev) =>
        prev.map((m) => (m.id === method.id ? { ...m, ...data.method } : m))
      );

      showToast("success", `Rincian pembayaran "${method.name}" berhasil disimpan.`);
    } catch (err: any) {
      showToast("error", err.message || "Gagal menyimpan rincian pembayaran.");
    } finally {
      setSavingMethodId(null);
    }
  };

  // Toggle Product COD Allowance
  const handleToggleProductCod = async (product: ProductPaymentRule) => {
    if (!product.isPhysical) {
      showToast(
        "error",
        "Produk digital dilarang keras menggunakan metode COD demi mencegah kerugian dan kebocoran lisensi."
      );
      return;
    }

    const nextAllowCod = !product.allowCod;
    setTogglingProductId(product.id);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowCod: nextAllowCod }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah aturan pembayaran produk");

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, allowCod: nextAllowCod } : p))
      );

      showToast(
        "success",
        nextAllowCod
          ? `Produk "${product.name}" kini MENGIZINKAN metode COD.`
          : `Produk "${product.name}" kini MEMBLOKIR metode COD. Pembeli wajib membayar di awal (QRIS/Transfer).`
      );
    } catch (err: any) {
      showToast("error", err.message || "Terjadi kesalahan.");
    } finally {
      setTogglingProductId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-2xl border text-xs shadow-xs transition-all animate-in fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-stone-50 border-stone-200 text-stone-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <p className="font-semibold leading-relaxed">{toast.text}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Keamanan Transaksi & Anti-Loss Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif mt-1">
            Pengaturan & Pembatasan Metode Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Atur metode pembayaran aktif toko, batasi COD pada produk bernilai tinggi, dan lindungi produk digital dari risiko penipuan / pembatalan sepihak.
          </p>
        </div>

        <Link
          href="/checkout"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
          <span>Pratinjau Halaman Checkout</span>
        </Link>
      </div>

      {/* Security Protection Highlights Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-3xl p-5 sm:p-6 shadow-md border border-stone-700/60">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-stone-800 text-center md:text-left">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1 justify-center md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Proteksi Anti-Loss Digital</span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {stats.digitalCount} Produk Digital
            </div>
            <p className="text-[11px] text-stone-400">
              Otomatis 100% memblokir COD agar lisensi/software tidak dicuri tanpa bayar.
            </p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-5 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
              Batas Maksimal COD
            </div>
            <div className="text-xl font-extrabold text-white">
              Rp 1.500.000
            </div>
            <p className="text-[11px] text-stone-400">
              Pesanan di atas batas ini otomatis dialihkan ke Transfer / QRIS.
            </p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-5 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
              Produk Fisik COD
            </div>
            <div className="text-xl font-extrabold text-white">
              {stats.physicalCodCount} Diizinkan / {stats.physicalNoCodCount} Diblokir
            </div>
            <p className="text-[11px] text-stone-400">
              Anda dapat mematikan COD untuk barang yang rawan return fiktif.
            </p>
          </div>

          <div className="pt-3 md:pt-0 md:pl-5 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">
              Metode Pembayaran Live
            </div>
            <div className="text-xl font-extrabold text-white">
              {stats.activeMethods} dari {methods.length} Aktif
            </div>
            <p className="text-[11px] text-stone-400">
              QRIS, BCA, Mandiri, Virtual Account, & COD terverifikasi.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs: Global Methods vs Per-Product Rules */}
      <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-stone-200/90 shadow-xs">
        <button
          onClick={() => setActiveTab("methods")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "methods"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>1. Kelola Saluran Pembayaran Toko ({methods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "products"
              ? "bg-stone-900 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>2. Aturan Pembatasan Per Produk ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: GLOBAL PAYMENT METHODS MANAGEMENT */}
      {activeTab === "methods" && (
        <div className="space-y-5 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {methods.map((method) => {
              const isCod = method.code === "COD";
              const isSaving = savingMethodId === method.id;
              const form = editForms[method.id] || {};

              return (
                <div
                  key={method.id}
                  className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 space-y-4 shadow-xs ${
                    method.isActive
                      ? "border-stone-200/90"
                      : "border-stone-200/60 bg-stone-50/50 opacity-80"
                  }`}
                >
                  {/* Card Header & Status Toggle */}
                  <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          method.code === "QRIS_INSTANT"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : method.code === "BCA_MANUAL"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : method.code === "MANDIRI_MANUAL"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : method.code === "BNI_VA"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-stone-100 text-stone-800 border-stone-300"
                        }`}
                      >
                        {method.code === "QRIS_INSTANT" ? (
                          <QrCode className="w-5 h-5" />
                        ) : method.code === "COD" ? (
                          <Banknote className="w-5 h-5" />
                        ) : (
                          <Building className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900 font-serif">
                          {method.name}
                        </h3>
                        <span className="text-[10px] font-mono font-medium text-stone-400">
                          Kode: {method.code}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleMethodActive(method)}
                      disabled={isSaving}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        method.isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                          : "bg-stone-100 text-stone-500 border-stone-300 hover:bg-stone-200"
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : method.isActive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Aktif di Checkout</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-stone-400" />
                          <span>Nonaktif (Disembunyikan)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Form Details */}
                  <div className="space-y-3 text-xs">
                    {!isCod && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                            Nama Pemilik Rekening / Merchant
                          </label>
                          <input
                            type="text"
                            value={form.accountName || ""}
                            onChange={(e) =>
                              setEditForms((prev) => ({
                                ...prev,
                                [method.id]: { ...prev[method.id], accountName: e.target.value },
                              }))
                            }
                            placeholder="Contoh: JNshop Official Store"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                            Nomor Rekening / VA / NMID
                          </label>
                          <input
                            type="text"
                            value={form.accountNumber || ""}
                            onChange={(e) =>
                              setEditForms((prev) => ({
                                ...prev,
                                [method.id]: { ...prev[method.id], accountNumber: e.target.value },
                              }))
                            }
                            placeholder="Contoh: 1234567890"
                            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-stone-400"
                          />
                        </div>
                      </div>
                    )}

                    {isCod && (
                      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Aturan Anti-Kerugian COD (Cash on Delivery)</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          • Produk digital otomatis diblokir dari COD secara permanen di tingkat sistem.
                          <br />
                          • Pesanan di atas batas maksimal nominal tidak akan bisa memilih COD.
                        </p>
                        <div>
                          <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                            Batas Maksimal Nominal Belanja COD (Rp)
                          </label>
                          <input
                            type="number"
                            value={form.maxAmount || 1500000}
                            onChange={(e) =>
                              setEditForms((prev) => ({
                                ...prev,
                                [method.id]: {
                                  ...prev[method.id],
                                  maxAmount: parseFloat(e.target.value) || 0,
                                },
                              }))
                            }
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                        Deskripsi Singkat di Halaman Checkout
                      </label>
                      <input
                        type="text"
                        value={form.description || ""}
                        onChange={(e) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [method.id]: { ...prev[method.id], description: e.target.value },
                          }))
                        }
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 mb-1 text-[11px]">
                        Petunjuk / Instruksi Pembayaran (Muncul di Invoice)
                      </label>
                      <textarea
                        rows={2}
                        value={form.instructions || ""}
                        onChange={(e) =>
                          setEditForms((prev) => ({
                            ...prev,
                            [method.id]: { ...prev[method.id], instructions: e.target.value },
                          }))
                        }
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveMethodDetails(method)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Simpan Perubahan Metode</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PER-PRODUCT PAYMENT RESTRICTIONS */}
      {activeTab === "products" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setProductTypeFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    productTypeFilter === "all"
                      ? "bg-white text-stone-900 font-bold shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Semua Produk ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProductTypeFilter("physical")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    productTypeFilter === "physical"
                      ? "bg-white text-stone-900 font-bold shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Produk Fisik ({products.filter((p) => p.isPhysical).length})
                </button>
                <button
                  type="button"
                  onClick={() => setProductTypeFilter("digital")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    productTypeFilter === "digital"
                      ? "bg-white text-blue-900 font-bold shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Produk Digital ({products.filter((p) => !p.isPhysical).length})
                </button>
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk berdasarkan nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100 text-[11px]">
                  <tr>
                    <th className="py-3 px-5">Produk</th>
                    <th className="py-3 px-4">Kategori & Tipe</th>
                    <th className="py-3 px-4">Harga</th>
                    <th className="py-3 px-4">Status Metode COD</th>
                    <th className="py-3 px-5 text-right">Aksi Kontrol Pembayaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredProducts.map((p) => {
                    const img =
                      p.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=80";
                    const isToggling = togglingProductId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Product info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={img}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/60"
                            />
                            <div className="min-w-0 max-w-xs">
                              <span className="font-semibold text-stone-900 text-sm block truncate">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                ID: {p.id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category & Type */}
                        <td className="py-4 px-4">
                          <div className="text-stone-800">{p.category.name}</div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.isPhysical
                                ? "bg-stone-100 text-stone-700"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {p.isPhysical ? "Barang Fisik" : "Digital & Lisensi"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-4 font-bold text-stone-900">
                          {formatRupiah(p.discountPrice || p.price)}
                        </td>

                        {/* COD Rule Status */}
                        <td className="py-4 px-4">
                          {!p.isPhysical ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-[11px]">
                              <Lock className="w-3 h-3 text-rose-600" />
                              <span>Wajib Bayar di Awal (COD Diblokir)</span>
                            </span>
                          ) : p.allowCod ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>COD Diizinkan</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>COD Dinonaktifkan Admin</span>
                            </span>
                          )}
                        </td>

                        {/* Action Toggle */}
                        <td className="py-4 px-5 text-right">
                          {!p.isPhysical ? (
                            <span className="text-[11px] text-stone-400 italic">
                              Terkunci Otomatis (Anti-Loss)
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleProductCod(p)}
                              disabled={isToggling}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                p.allowCod
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200"
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : p.allowCod ? (
                                <>
                                  <Lock className="w-3 h-3 text-amber-700" />
                                  <span>Matikan COD Produk Ini</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>Aktifkan COD</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
