"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  isPhysical: boolean;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date | string;
  category: {
    id?: string;
    name: string;
    slug?: string;
  };
  images: {
    url: string;
  }[];
  variants?: any[];
}

interface AdminProductsClientProps {
  initialProducts: ProductItem[];
  categories: { id: string; name: string }[];
}

export default function AdminProductsClient({
  initialProducts,
  categories,
}: AdminProductsClientProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Modal confirmation
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    product: ProductItem | null;
    errorMsg?: string | null;
    canArchiveFallback?: boolean;
  }>({
    isOpen: false,
    product: null,
    errorMsg: null,
    canArchiveFallback: false,
  });

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Counts
  const counts = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const archived = products.filter((p) => !p.isActive).length;
    return { total, active, archived };
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Tab filter
      if (activeTab === "active" && !p.isActive) return false;
      if (activeTab === "archived" && p.isActive) return false;

      // Category filter
      if (selectedCategory !== "all" && p.category.name !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchSku = p.sku ? p.sku.toLowerCase().includes(query) : false;
        const matchCat = p.category.name.toLowerCase().includes(query);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      return true;
    });
  }, [products, activeTab, selectedCategory, searchQuery]);

  // Handle Toggle Active/Archive
  const handleToggleArchive = async (product: ProductItem) => {
    const nextState = !product.isActive;
    const actionLabel = nextState ? "mengaktifkan kembali" : "mengarsipkan";

    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Gagal ${actionLabel} produk.`);
      }

      // Update state locally
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, isActive: nextState } : item
        )
      );

      showToast(
        "success",
        nextState
          ? `Produk "${product.name}" kini aktif dan muncul kembali di etalase toko.`
          : `Produk "${product.name}" berhasil diarsipkan. Pengguna tidak akan melihat atau memilih produk ini lagi di toko.`
      );

      // If modal was open for fallback archive, close it
      if (modalState.isOpen) {
        setModalState({ isOpen: false, product: null });
      }
    } catch (err: any) {
      showToast("error", err.message || `Terjadi kesalahan saat ${actionLabel} produk.`);
    } finally {
      setLoadingId(null);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (product: ProductItem) => {
    setModalState({
      isOpen: true,
      product,
      errorMsg: null,
      canArchiveFallback: false,
    });
  };

  // Execute Permanent Delete
  const handleExecuteDelete = async () => {
    if (!modalState.product) return;
    const product = modalState.product;

    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.hasOrders) {
          // Has orders, guide to archive
          setModalState((prev) => ({
            ...prev,
            errorMsg: data.error,
            canArchiveFallback: true,
          }));
          return;
        }
        throw new Error(data.error || "Gagal menghapus produk.");
      }

      // Delete succeeded
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      showToast("success", `Produk "${product.name}" berhasil dihapus secara permanen dari katalog.`);
      setModalState({ isOpen: false, product: null });
    } catch (err: any) {
      setModalState((prev) => ({
        ...prev,
        errorMsg: err.message || "Gagal menghapus produk.",
      }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toast && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-2xl border text-sm shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
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
            ) : toast.type === "error" ? (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <p className="font-medium leading-relaxed">{toast.text}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif">
            Manajemen Produk
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Kelola status aktif, arsipkan item nonaktif, atau hapus produk dari katalog toko ({counts.total} total item).
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </Link>
      </div>

      {/* Tab Filters & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        {/* Top Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Semua Produk ({counts.total})
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "active"
                  ? "bg-white text-emerald-800 font-bold shadow-xs"
                  : "text-stone-500 hover:text-emerald-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Aktif di Toko ({counts.active})</span>
            </button>
            <button
              onClick={() => setActiveTab("archived")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === "archived"
                  ? "bg-white text-amber-800 font-bold shadow-xs"
                  : "text-stone-500 hover:text-amber-700"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Diarsipkan / Nonaktif ({counts.archived})</span>
            </button>
          </div>

          <div className="text-xs text-stone-400">
            Menampilkan <span className="font-semibold text-stone-700">{filteredProducts.length}</span> item
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama produk, SKU, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400/30 transition-all text-stone-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="sm:w-56 shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400/30 transition-all text-stone-700 font-medium"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-400">
              <Package className="w-6 h-6 stroke-1" />
            </div>
            <p className="text-sm font-semibold text-stone-800">
              Tidak ada produk yang cocok
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Coba sesuaikan filter pencarian atau tab status untuk menemukan produk yang dicari.
            </p>
            {(searchQuery || activeTab !== "all" || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                  setSelectedCategory("all");
                }}
                className="mt-4 text-xs font-semibold text-stone-700 underline underline-offset-4 hover:text-stone-900"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50/90 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100 text-[11px]">
                <tr>
                  <th className="py-3 px-5">Produk</th>
                  <th className="py-3 px-4">Kategori & Tipe</th>
                  <th className="py-3 px-4">Harga</th>
                  <th className="py-3 px-4">Stok</th>
                  <th className="py-3 px-4">Status Toko</th>
                  <th className="py-3 px-5 text-right">Kelola & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {filteredProducts.map((p) => {
                  const img =
                    p.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=80";
                  const isLoading = loadingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-stone-50/70 transition-colors ${
                        !p.isActive ? "bg-stone-50/40 opacity-80" : ""
                      }`}
                    >
                      {/* Product Name & Image */}
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
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.sku && (
                                <span className="text-[10px] text-stone-400 font-mono">
                                  SKU: {p.sku}
                                </span>
                              )}
                              {p.isFeatured && (
                                <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                  Unggulan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Type */}
                      <td className="py-4 px-4">
                        <div className="text-stone-800 font-medium">{p.category.name}</div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.isPhysical
                              ? "bg-stone-100 text-stone-700"
                              : "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}
                        >
                          {p.isPhysical ? "Fisik" : "Digital"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-stone-900">
                        <div>{formatRupiah(p.discountPrice || p.price)}</div>
                        {p.discountPrice && (
                          <div className="text-[10px] text-stone-400 line-through font-normal">
                            {formatRupiah(p.price)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold ${
                            p.stock <= 3
                              ? "text-rose-600"
                              : p.stock <= 10
                              ? "text-amber-600"
                              : "text-stone-800"
                          }`}
                        >
                          {p.stock} unit
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-200 font-medium text-[11px]">
                            <Archive className="w-3 h-3 text-stone-500" />
                            <span>Diarsipkan (Nonaktif)</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {/* Toggle Archive / Activate Button */}
                          <button
                            onClick={() => handleToggleArchive(p)}
                            disabled={isLoading}
                            title={
                              p.isActive
                                ? "Arsipkan produk agar tidak muncul dan tidak dapat dibeli oleh pengguna"
                                : "Aktifkan kembali produk ini ke etalase toko"
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                              p.isActive
                                ? "bg-stone-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-stone-700 border-stone-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                            } disabled:opacity-50`}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : p.isActive ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                                <span>Arsipkan</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </button>

                          {/* View in Store Button */}
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            title="Buka halaman produk di tab baru"
                            className="inline-flex items-center p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Product Button */}
                          <button
                            onClick={() => openDeleteModal(p)}
                            disabled={isLoading}
                            title="Hapus produk dari katalog"
                            className="inline-flex items-center p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Delete & Safe Archive Safeguard */}
      {modalState.isOpen && modalState.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-5">
            {/* Modal Icon & Header */}
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  modalState.canArchiveFallback
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {modalState.canArchiveFallback ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {modalState.canArchiveFallback
                    ? "Produk Memiliki Riwayat Pesanan"
                    : "Konfirmasi Hapus Produk"}
                </h3>
                <p className="text-xs text-stone-500">
                  {modalState.canArchiveFallback
                    ? "Produk terlindungi demi menjaga keutuhan riwayat invoice pelanggan."
                    : "Tindakan ini akan menghapus produk dari database."}
                </p>
              </div>
            </div>

            {/* Product Card Preview inside Modal */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center gap-3">
              <img
                src={
                  modalState.product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80"
                }
                alt=""
                className="w-12 h-12 rounded-lg object-cover bg-stone-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-stone-900 text-xs truncate">
                  {modalState.product.name}
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {formatRupiah(
                    modalState.product.discountPrice || modalState.product.price
                  )}{" "}
                  • Stok: {modalState.product.stock}
                </p>
              </div>
            </div>

            {/* Error / Alert Message if fallback */}
            {modalState.errorMsg && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tidak Dapat Dihapus Permanen</span>
                </p>
                <p className="leading-relaxed text-[11px] text-amber-800">
                  {modalState.errorMsg}
                </p>
              </div>
            )}

            {!modalState.canArchiveFallback && !modalState.errorMsg && (
              <p className="text-xs text-stone-600 leading-relaxed">
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-stone-900">
                  "{modalState.product.name}"
                </span>
                ? Jika produk ini belum pernah dipesan, data akan dihapus permanen.
                Jika Anda hanya ingin menyembunyikan produk agar pelanggan tidak bisa membeli,
                cukup gunakan opsi <strong>Arsipkan</strong>.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, product: null })}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Batal
              </button>

              {/* If product has orders, offer 1-click Archive instead */}
              {modalState.canArchiveFallback ? (
                <button
                  type="button"
                  onClick={() => handleToggleArchive(modalState.product!)}
                  disabled={loadingId === modalState.product.id}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  {loadingId === modalState.product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4" />
                  )}
                  <span>Arsipkan Produk Ini Saja</span>
                </button>
              ) : (
                <>
                  {/* Button to archive instead of delete */}
                  {modalState.product.isActive && (
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(modalState.product!)}
                      disabled={loadingId === modalState.product.id}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-stone-600" />
                      <span>Arsipkan Saja</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleExecuteDelete}
                    disabled={loadingId === modalState.product.id}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    {loadingId === modalState.product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Hapus Permanen</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
