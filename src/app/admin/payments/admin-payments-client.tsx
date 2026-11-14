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
  AlertTriangle,
  Save,
  Search,
  Loader2,
  Lock,
  ExternalLink,
  X,
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

  const handleToggleProductCod = async (product: ProductPaymentRule) => {
    if (!product.isPhysical) {
      showToast(
        "error",
        "Produk digital dilarang menggunakan metode COD demi mencegah kebocoran lisensi."
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
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-800 shrink-0" />
            )}
            <p className="font-semibold leading-relaxed">{toast.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Keamanan Transaksi & Kontrol Pembayaran</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mt-1">
            Pengaturan & Pembatasan Metode Pembayaran
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Atur metode pembayaran aktif toko, batasi COD pada produk bernilai tinggi, dan lindungi produk digital dari pembayaran tertunda.
          </p>
        </div>

        <Link
          href="/checkout"
          target="_blank"
          className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold transition-colors shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
          <span>Pratinjau Checkout</span>
        </Link>
      </div>

      {/* Security Summary Banner */}
      <div className="bg-zinc-900 text-zinc-100 rounded-xl p-5 sm:p-6 border border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:divide-x lg:divide-zinc-800 text-left">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-green-300 font-semibold">
              Proteksi Digital
            </div>
            <div className="text-xl font-bold text-white">
              {stats.digitalCount} Produk Digital
            </div>
            <p className="text-xs text-zinc-300">
              Otomatis memblokir COD agar file dan lisensi dibayar di muka.
            </p>
          </div>

          <div className="lg:pl-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">
              Batas Maksimal COD
            </div>
            <div className="text-xl font-bold text-white">
              Rp 1.500.000
            </div>
            <p className="text-xs text-zinc-300">
              Pesanan di atas batas ini dialihkan ke QRIS atau Transfer.
            </p>
          </div>

          <div className="lg:pl-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-zinc-300 font-semibold">
              Produk Fisik COD
            </div>
            <div className="text-xl font-bold text-white">
              {stats.physicalCodCount} Diizinkan / {stats.physicalNoCodCount} Diblokir
            </div>
            <p className="text-xs text-zinc-300">
              Anda dapat mematikan COD per produk kapan saja.
            </p>
          </div>

          <div className="lg:pl-5 space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-zinc-300 font-semibold">
              Saluran Pembayaran Live
            </div>
            <div className="text-xl font-bold text-white">
              {stats.activeMethods} dari {methods.length} Aktif
            </div>
            <p className="text-xs text-zinc-300">
              QRIS, BCA, Mandiri, BNI VA, dan COD terkelola terpusat.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-xl border border-zinc-200">
        <button
          type="button"
          onClick={() => setActiveTab("methods")}
          className={`min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "methods"
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>1. Saluran Pembayaran Toko ({methods.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "products"
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>2. Pembatasan Per Produk ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: GLOBAL PAYMENT METHODS */}
      {activeTab === "methods" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {methods.map((method) => {
            const isCod = method.code === "COD";
            const isSaving = savingMethodId === method.id;
            const form = editForms[method.id] || {};

            return (
              <div
                key={method.id}
                className={`bg-white rounded-xl border p-5 sm:p-6 space-y-4 ${
                  method.isActive
                    ? "border-zinc-200"
                    : "border-zinc-200 bg-zinc-50/70"
                }`}
              >
                <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200 bg-zinc-50 text-zinc-800">
                      {method.code === "QRIS_INSTANT" ? (
                        <QrCode className="w-5 h-5" />
                      ) : method.code === "COD" ? (
                        <Banknote className="w-5 h-5" />
                      ) : (
                        <Building className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900">
                        {method.name}
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-600">
                        Kode: {method.code}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleMethodActive(method)}
                    disabled={isSaving}
                    className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                      method.isActive
                        ? "bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                        : "bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : method.isActive ? (
                      <span>Aktif di Checkout</span>
                    ) : (
                      <span>Nonaktif</span>
                    )}
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {!isCod && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
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
                          className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
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
                          className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                        />
                      </div>
                    </div>
                  )}

                  {isCod && (
                    <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-amber-800 shrink-0" />
                        <span>Aturan Pembatasan COD</span>
                      </div>
                      <ul className="text-[11px] text-amber-900 space-y-1 list-disc list-inside leading-relaxed">
                        <li>Produk digital diblokir otomatis dari COD.</li>
                        <li>Pesanan melebihi batas nominal otomatis dialihkan ke Transfer / QRIS.</li>
                      </ul>
                      <div>
                        <label className="block font-semibold text-zinc-900 mb-1 text-[11px]">
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
                          className="w-full min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                      Deskripsi Singkat di Checkout
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
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                      Instruksi Pembayaran (Muncul di Invoice)
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
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSaveMethodDetails(method)}
                      disabled={isSaving}
                      className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PER-PRODUCT PAYMENT RESTRICTIONS */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setProductTypeFilter("all")}
                  className={`min-h-[44px] px-3 py-1.5 rounded-md transition-colors ${
                    productTypeFilter === "all"
                      ? "bg-white text-zinc-900 font-bold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Semua Produk ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProductTypeFilter("physical")}
                  className={`min-h-[44px] px-3 py-1.5 rounded-md transition-colors ${
                    productTypeFilter === "physical"
                      ? "bg-white text-zinc-900 font-bold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Produk Fisik ({products.filter((p) => p.isPhysical).length})
                </button>
                <button
                  type="button"
                  onClick={() => setProductTypeFilter("digital")}
                  className={`min-h-[44px] px-3 py-1.5 rounded-md transition-colors ${
                    productTypeFilter === "digital"
                      ? "bg-white text-green-800 font-bold"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Produk Digital ({products.filter((p) => !p.isPhysical).length})
                </button>
              </div>

              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk berdasarkan nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30 text-zinc-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200 text-[11px]">
                  <tr>
                    <th className="py-3.5 px-5">Produk</th>
                    <th className="py-3.5 px-4">Kategori & Tipe</th>
                    <th className="py-3.5 px-4">Harga</th>
                    <th className="py-3.5 px-4">Status Metode COD</th>
                    <th className="py-3.5 px-5 text-right">Aksi Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium text-zinc-700">
                  {filteredProducts.map((p) => {
                    const img =
                      p.images?.[0]?.url ||
                      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=80";
                    const isToggling = togglingProductId === p.id;

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={img}
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0 border border-zinc-200"
                            />
                            <div className="min-w-0 max-w-xs">
                              <span className="font-semibold text-zinc-900 text-sm block truncate">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-zinc-600 font-mono">
                                ID: {p.id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-zinc-900">{p.category.name}</div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              p.isPhysical
                                ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                                : "bg-green-50 text-green-800 border border-green-200"
                            }`}
                          >
                            {p.isPhysical ? "Barang Fisik" : "Digital & Lisensi"}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-bold text-zinc-900">
                          {formatRupiah(p.discountPrice || p.price)}
                        </td>

                        <td className="py-4 px-4">
                          {!p.isPhysical ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 font-semibold text-[11px]">
                              <Lock className="w-3 h-3 text-red-800" />
                              <span>Wajib Bayar di Awal (COD Diblokir)</span>
                            </span>
                          ) : p.allowCod ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-800 border border-green-200 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-800" />
                              <span>COD Diizinkan</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                              <AlertTriangle className="w-3 h-3 text-amber-800" />
                              <span>COD Dinonaktifkan Admin</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          {!p.isPhysical ? (
                            <span className="text-[11px] text-zinc-600">
                              Terkunci Otomatis
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleProductCod(p)}
                              disabled={isToggling}
                              className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                                p.allowCod
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                                  : "bg-green-50 hover:bg-green-100 text-green-800 border-green-200"
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : p.allowCod ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-amber-800" />
                                  <span>Matikan COD</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-800" />
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
