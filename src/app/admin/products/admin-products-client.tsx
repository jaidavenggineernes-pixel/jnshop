"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldAlert,
  X,
  Pencil,
  Save,
  Binary,
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export interface ProductVariantItem {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  stock: number;
}

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  shortDescription?: string | null;
  description?: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  weight?: number;
  isPhysical: boolean;
  digitalDeliveryType?: string | null;
  digitalFileUrl?: string | null;
  digitalLicenseKey?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  allowCod?: boolean;
  allowedPaymentMethods?: string | null;
  categoryId?: string;
  createdAt: Date | string;
  category: {
    id?: string;
    name: string;
    slug?: string;
  };
  images: {
    id?: string;
    url: string;
    isPrimary?: boolean;
  }[];
  variants?: ProductVariantItem[];
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

  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

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

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editFocusField, setEditFocusField] = useState<"price" | "name">("price");
  const [editName, setEditName] = useState("");
  const [editShortDesc, setEditShortDesc] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [editStock, setEditStock] = useState("0");
  const [editSku, setEditSku] = useState("");
  const [editWeight, setEditWeight] = useState("0.5");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editIsPhysical, setEditIsPhysical] = useState(true);
  const [editDigitalDeliveryType, setEditDigitalDeliveryType] = useState("INSTANT_DOWNLOAD");
  const [editDigitalFileUrl, setEditDigitalFileUrl] = useState("");
  const [editDigitalLicenseKey, setEditDigitalLicenseKey] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageMode, setEditImageMode] = useState<"upload" | "url">("upload");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editAllowCod, setEditAllowCod] = useState(true);
  const [editVariants, setEditVariants] = useState<{ id: string; name: string; price: string; stock: string }[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [editSavingStatus, setEditSavingStatus] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!modalState.isOpen && !editModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editModalOpen && !editSaving) {
          setEditModalOpen(false);
          setEditingProduct(null);
        } else if (modalState.isOpen) {
          setModalState({ isOpen: false, product: null });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalState.isOpen, editModalOpen, editSaving]);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const counts = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const archived = products.filter((p) => !p.isActive).length;
    return { total, active, archived };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeTab === "active" && !p.isActive) return false;
      if (activeTab === "archived" && p.isActive) return false;

      if (selectedCategory !== "all" && p.category.name !== selectedCategory) {
        return false;
      }

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

      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, isActive: nextState } : item
        )
      );

      showToast(
        "success",
        nextState
          ? `Produk "${product.name}" kini aktif dan muncul kembali di etalase toko.`
          : `Produk "${product.name}" berhasil diarsipkan. Pelanggan tidak lagi melihat produk ini di toko.`
      );

      if (modalState.isOpen) {
        setModalState({ isOpen: false, product: null });
      }
    } catch (err: any) {
      showToast("error", err.message || `Terjadi kesalahan saat ${actionLabel} produk.`);
    } finally {
      setLoadingId(null);
    }
  };

  const openEditModal = (product: ProductItem, focusField: "price" | "name" = "price") => {
    setEditingProduct(product);
    setEditFocusField(focusField);
    setEditName(product.name || "");
    setEditShortDesc(product.shortDescription || "");
    setEditDescription(product.description || "");
    setEditPrice(String(product.price ?? ""));
    setEditDiscountPrice(product.discountPrice ? String(product.discountPrice) : "");
    setEditStock(String(product.stock ?? 0));
    setEditSku(product.sku || "");
    setEditWeight(String(product.weight ?? 0.5));
    setEditCategoryId(product.categoryId || product.category?.id || categories[0]?.id || "");
    setEditIsPhysical(product.isPhysical);
    setEditDigitalDeliveryType(product.digitalDeliveryType || "INSTANT_DOWNLOAD");
    setEditDigitalFileUrl(product.digitalFileUrl || "");
    setEditDigitalLicenseKey(product.digitalLicenseKey || "");
    const initialImg = product.images?.[0]?.url || "";
    setEditImageUrl(initialImg);
    setEditImagePreview(initialImg);
    setEditImageFile(null);
    setEditImageMode(initialImg && !initialImg.startsWith("/api/uploads/") && !initialImg.startsWith("data:") ? "url" : "upload");
    setEditIsFeatured(Boolean(product.isFeatured));
    setEditIsActive(Boolean(product.isActive));
    setEditAllowCod(Boolean(product.allowCod));
    setEditVariants(
      (product.variants || []).map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price !== null && v.price !== undefined ? String(v.price) : "",
        stock: String(v.stock ?? 0),
      }))
    );
    setEditError("");
    setEditModalOpen(true);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setEditError("Format file gambar harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setEditError("Ukuran foto maksimal 5MB.");
      return;
    }

    setEditError("");
    setEditImageFile(file);
    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview(URL.createObjectURL(file));
  };

  const handleEditRemoveFile = () => {
    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImageFile(null);
    setEditImagePreview("");
    setEditImageUrl("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedPrice = Number(editPrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setEditError("Harga normal wajib berupa angka lebih dari Rp 0.");
      return;
    }

    const parsedDiscount = editDiscountPrice.trim() ? Number(editDiscountPrice) : null;
    if (parsedDiscount !== null) {
      if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
        setEditError("Harga diskon/promo tidak valid.");
        return;
      }
      if (parsedDiscount >= parsedPrice) {
        setEditError("Harga diskon/promo harus lebih kecil daripada harga normal.");
        return;
      }
    }

    setEditSaving(true);
    setEditSavingStatus("Menyiapkan data produk...");
    setEditError("");

    try {
      let finalImageUrl = editImageUrl.trim();

      if (editImageMode === "upload") {
        if (editImageFile) {
          setEditSavingStatus("Mengunggah foto baru...");
          const uploadFormData = new FormData();
          uploadFormData.append("file", editImageFile);

          const uploadRes = await fetch("/api/uploads/products", {
            method: "POST",
            body: uploadFormData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            throw new Error(uploadData.error || "Gagal mengunggah foto produk.");
          }
          finalImageUrl = uploadData.url;
        } else if (editImagePreview) {
          finalImageUrl = editImagePreview;
        } else {
          finalImageUrl = "";
        }
      }

      setEditSavingStatus("Menyimpan pembaruan produk...");
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          shortDescription: editShortDesc.trim() || null,
          description: editDescription.trim() || editName.trim(),
          price: parsedPrice,
          discountPrice: parsedDiscount,
          stock: parseInt(editStock, 10) || 0,
          sku: editSku.trim() || null,
          weight: editIsPhysical ? parseFloat(editWeight) || 0.5 : 0,
          categoryId: editCategoryId,
          isPhysical: editIsPhysical,
          digitalDeliveryType: !editIsPhysical ? editDigitalDeliveryType : null,
          digitalFileUrl: !editIsPhysical ? editDigitalFileUrl.trim() || null : null,
          digitalLicenseKey: !editIsPhysical ? editDigitalLicenseKey.trim() || null : null,
          imageUrl: finalImageUrl,
          isFeatured: editIsFeatured,
          isActive: editIsActive,
          allowCod: editIsPhysical ? editAllowCod : false,
          variants: editVariants.map((v) => ({
            id: v.id,
            price: v.price.trim() ? Number(v.price) : null,
            stock: parseInt(v.stock, 10) || 0,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui produk.");
      }

      setProducts((prev) =>
        prev.map((item) => (item.id === editingProduct.id ? data.product : item))
      );

      showToast("success", data.message || `Produk "${editName}" berhasil diperbarui.`);
      setEditModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      setEditError(err.message || "Terjadi kesalahan saat menyimpan perubahan.");
    } finally {
      setEditSaving(false);
    }
  };

  const openDeleteModal = (product: ProductItem) => {
    setModalState({
      isOpen: true,
      product,
      errorMsg: null,
      canArchiveFallback: false,
    });
  };

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
          setModalState((prev) => ({
            ...prev,
            errorMsg: data.error,
            canArchiveFallback: true,
          }));
          return;
        }
        throw new Error(data.error || "Gagal menghapus produk.");
      }

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
          className={`flex items-start justify-between gap-3 p-4 rounded-xl border text-sm ${
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-black/5 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Manajemen Produk
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Kelola status aktif, arsipkan item nonaktif, atau hapus produk dari katalog toko ({counts.total} total item).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/payments"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 font-semibold text-xs transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-amber-800" />
            <span>Aturan Pembayaran</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </Link>
        </div>
      </div>

      {/* Tab Filters & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`min-h-[44px] px-3.5 py-2 rounded-md transition-colors ${
                activeTab === "all"
                  ? "bg-white text-zinc-900 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Semua Produk ({counts.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-colors ${
                activeTab === "active"
                  ? "bg-white text-green-800 font-bold"
                  : "text-zinc-600 hover:text-green-800"
              }`}
            >
              <span>Aktif di Toko ({counts.active})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("archived")}
              className={`min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-colors ${
                activeTab === "archived"
                  ? "bg-white text-amber-800 font-bold"
                  : "text-zinc-600 hover:text-amber-800"
              }`}
            >
              <span>Diarsipkan ({counts.archived})</span>
            </button>
          </div>

          <div className="text-xs text-zinc-600">
            Menampilkan <span className="font-semibold text-zinc-900">{filteredProducts.length}</span> item
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama produk, SKU, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-10 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30 text-zinc-900"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Hapus kata kunci pencarian"
                className="w-9 h-9 rounded-md flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="sm:w-56 shrink-0">
            <select
              aria-label="Filter kategori produk"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30 text-zinc-900 font-medium"
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
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-600">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              Tidak ada produk yang cocok
            </p>
            <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto">
              Coba sesuaikan filter pencarian atau tab status untuk menemukan produk yang dicari.
            </p>
            {(searchQuery || activeTab !== "all" || selectedCategory !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveTab("all");
                  setSelectedCategory("all");
                }}
                className="mt-4 min-h-[44px] px-4 text-xs font-semibold text-green-800 underline underline-offset-4 hover:text-green-900"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200 text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">Produk</th>
                  <th className="py-3.5 px-4">Kategori & Tipe</th>
                  <th className="py-3.5 px-4">Harga</th>
                  <th className="py-3.5 px-4">Stok</th>
                  <th className="py-3.5 px-4">Status Toko</th>
                  <th className="py-3.5 px-5 text-right">Kelola & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-medium text-zinc-700">
                {filteredProducts.map((p) => {
                  const img =
                    p.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=80";
                  const isLoading = loadingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-zinc-50 transition-colors ${
                        !p.isActive ? "bg-zinc-50/70" : ""
                      }`}
                    >
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
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {p.sku && (
                                <span className="text-[11px] text-zinc-600 font-mono">
                                  SKU: {p.sku}
                                </span>
                              )}
                              {p.isFeatured && (
                                <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                                  Unggulan
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-zinc-900 font-medium">{p.category.name}</div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.isPhysical
                              ? "bg-zinc-100 text-zinc-800 border border-zinc-200"
                              : "bg-green-50 text-green-800 border border-green-200"
                          }`}
                        >
                          {p.isPhysical ? "Fisik" : "Digital"}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-zinc-900">
                        <button
                          type="button"
                          onClick={() => openEditModal(p, "price")}
                          title="Klik untuk mengedit harga produk ini dengan cepat"
                          className="group text-left rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 transition-colors inline-flex flex-col items-start"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span>{formatRupiah(p.discountPrice || p.price)}</span>
                            <Pencil className="w-3 h-3 text-zinc-500 group-hover:text-green-800 transition-colors" />
                          </span>
                          {p.discountPrice && (
                            <span className="text-[11px] text-zinc-600 line-through font-normal">
                              {formatRupiah(p.price)}
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`font-bold ${
                            p.stock <= 3
                              ? "text-red-800"
                              : p.stock <= 10
                              ? "text-amber-800"
                              : "text-zinc-900"
                          }`}
                        >
                          {p.stock} unit
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        {p.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-800 border border-green-200 font-semibold text-[11px]">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold text-[11px]">
                            <Archive className="w-3 h-3 text-zinc-600" />
                            <span>Diarsipkan</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(p, "price")}
                            disabled={isLoading}
                            title={`Edit harga & detail ${p.name}`}
                            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-200 disabled:opacity-50"
                          >
                            <Pencil className="w-3.5 h-3.5 text-zinc-700" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleArchive(p)}
                            disabled={isLoading}
                            title={
                              p.isActive
                                ? "Arsipkan produk agar tidak muncul dan tidak dapat dibeli pelanggan"
                                : "Aktifkan kembali produk ini ke etalase toko"
                            }
                            className={`min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                              p.isActive
                                ? "bg-zinc-50 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 text-zinc-800 border-zinc-200"
                                : "bg-green-50 hover:bg-green-100 text-green-800 border-green-200"
                            } disabled:opacity-50`}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : p.isActive ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                                <span>Arsipkan</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3.5 h-3.5 text-green-800" />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            aria-label={`Buka halaman ${p.name} di toko`}
                            className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openDeleteModal(p)}
                            disabled={isLoading}
                            aria-label={`Hapus ${p.name}`}
                            className="w-11 h-11 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-zinc-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Confirmation Modal */}
      {modalState.isOpen && modalState.product && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-zinc-200 shadow-lg space-y-5">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  modalState.canArchiveFallback
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }`}
              >
                {modalState.canArchiveFallback ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <Trash2 className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 id="delete-product-title" className="text-lg font-bold text-zinc-900">
                  {modalState.canArchiveFallback
                    ? "Produk Memiliki Riwayat Pesanan"
                    : "Konfirmasi Hapus Produk"}
                </h3>
                <p className="text-xs text-zinc-600">
                  {modalState.canArchiveFallback
                    ? "Produk terlindungi demi menjaga keutuhan riwayat invoice pelanggan."
                    : "Tindakan ini akan menghapus produk dari database."}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-3">
              <img
                src={
                  modalState.product.images?.[0]?.url ||
                  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80"
                }
                alt={modalState.product.name}
                className="w-12 h-12 rounded-lg object-cover bg-zinc-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 text-xs truncate">
                  {modalState.product.name}
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {formatRupiah(
                    modalState.product.discountPrice || modalState.product.price
                  )}{" "}
                  | Stok: {modalState.product.stock}
                </p>
              </div>
            </div>

            {modalState.errorMsg && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Tidak Dapat Dihapus Permanen</span>
                </p>
                <p className="leading-relaxed text-[11px] text-amber-800">
                  {modalState.errorMsg}
                </p>
              </div>
            )}

            {!modalState.canArchiveFallback && !modalState.errorMsg && (
              <p className="text-xs text-zinc-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus{" "}
                <span className="font-semibold text-zinc-900">
                  &quot;{modalState.product.name}&quot;
                </span>
                ? Jika belum pernah dipesan, data akan dihapus permanen. Untuk menyembunyikan produk dari etalase saja, pilih opsi <strong>Arsipkan</strong>.
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, product: null })}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                Batal
              </button>

              {modalState.canArchiveFallback ? (
                <button
                  type="button"
                  onClick={() => handleToggleArchive(modalState.product!)}
                  disabled={loadingId === modalState.product.id}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors"
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
                  {modalState.product.isActive && (
                    <button
                      type="button"
                      onClick={() => handleToggleArchive(modalState.product!)}
                      disabled={loadingId === modalState.product.id}
                      className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-zinc-700" />
                      <span>Arsipkan Saja</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleExecuteDelete}
                    disabled={loadingId === modalState.product.id}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-semibold transition-colors"
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

      {/* Full Edit Product Modal (Works on Active & Archived Products without Re-uploading) */}
      {editModalOpen && editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-product-title"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-lg my-6 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4 bg-zinc-50/70">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 id="edit-product-title" className="text-base font-bold text-zinc-900">
                    Edit Produk & Harga
                  </h3>
                  {!editingProduct.isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                      <Archive className="w-3 h-3" />
                      Diarsipkan
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-600 mt-0.5 truncate">
                  Ubah harga, stok, atau detail tanpa harus mengunggah ulang produk dari awal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!editSaving) {
                    setEditModalOpen(false);
                    setEditingProduct(null);
                  }
                }}
                aria-label="Tutup modal edit produk"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEdit} className="overflow-y-auto p-6 space-y-5 text-xs">
              {editError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Priority Section: Price & Stock */}
              <div className="p-4 rounded-xl bg-green-50/60 border border-green-200 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-zinc-900 text-xs">Harga & Ketersediaan Stok</span>
                  <span className="text-[11px] text-green-800 font-semibold">
                    Langsung diperbarui di toko
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label htmlFor="edit-price" className="block font-semibold text-zinc-800 mb-1.5">
                      Harga Normal (Rp) *
                    </label>
                    <input
                      id="edit-price"
                      type="number"
                      min="1"
                      step="1"
                      required
                      autoFocus={editFocusField === "price"}
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="150000"
                      className="w-full min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800/40"
                    />
                    {Number(editPrice) > 0 && (
                      <p className="text-[11px] text-zinc-600 mt-1">
                        Ditampilkan: <strong className="text-zinc-900">{formatRupiah(Number(editPrice))}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="edit-discount-price" className="block font-semibold text-zinc-800 mb-1.5">
                      Harga Promo (Opsional)
                    </label>
                    <input
                      id="edit-discount-price"
                      type="number"
                      min="0"
                      step="1"
                      value={editDiscountPrice}
                      onChange={(e) => setEditDiscountPrice(e.target.value)}
                      placeholder="Kosongkan jika non-promo"
                      className="w-full min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800/40"
                    />
                    {Number(editDiscountPrice) > 0 && (
                      <p className="text-[11px] text-green-800 mt-1">
                        Harga jual: <strong>{formatRupiah(Number(editDiscountPrice))}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="edit-stock" className="block font-semibold text-zinc-800 mb-1.5">
                      Stok Unit *
                    </label>
                    <input
                      id="edit-stock"
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full min-h-[44px] bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800/40"
                    />
                  </div>
                </div>

                {/* Variant Prices if product has variants */}
                {editVariants.length > 0 && (
                  <div className="pt-3 border-t border-green-200/80 space-y-2">
                    <p className="font-semibold text-zinc-800 text-[11px]">
                      Harga Khusus per Varian (Kosongkan untuk mengikuti harga dasar produk)
                    </p>
                    <div className="space-y-2">
                      {editVariants.map((variant, idx) => (
                        <div
                          key={variant.id}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-zinc-200"
                        >
                          <div className="sm:col-span-5 font-semibold text-zinc-900 truncate">
                            {variant.name}
                          </div>
                          <div className="sm:col-span-4">
                            <input
                              type="number"
                              min="0"
                              value={variant.price}
                              onChange={(e) => {
                                const next = [...editVariants];
                                next[idx] = { ...next[idx], price: e.target.value };
                                setEditVariants(next);
                              }}
                              placeholder="Harga varian (Rp)"
                              aria-label={`Harga varian ${variant.name}`}
                              className="w-full min-h-[38px] bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) => {
                                const next = [...editVariants];
                                next[idx] = { ...next[idx], stock: e.target.value };
                                setEditVariants(next);
                              }}
                              placeholder="Stok"
                              aria-label={`Stok varian ${variant.name}`}
                              className="w-full min-h-[38px] bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-xs text-zinc-900"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Image & Identity (preserved without re-upload) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="edit-name" className="block font-semibold text-zinc-800 mb-1.5">
                    Nama Produk *
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                </div>

                <div>
                  <label htmlFor="edit-category" className="block font-semibold text-zinc-800 mb-1.5">
                    Kategori *
                  </label>
                  <select
                    id="edit-category"
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-sku" className="block font-semibold text-zinc-800 mb-1.5">
                    Kode SKU (Opsional)
                  </label>
                  <input
                    id="edit-sku"
                    type="text"
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    placeholder="Contoh: JN-KEY-01"
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                </div>

                <div className="sm:col-span-2 space-y-3 p-4 rounded-xl border border-zinc-200 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-900">
                        Foto Produk Utama
                      </label>
                      <p className="text-[11px] text-zinc-600">
                        Perbarui foto produk dengan mengunggah gambar langsung dari komputer atau ponsel, atau isi tautan URL gambar.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setEditImageMode("upload")}
                        className={`min-h-[34px] px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          editImageMode === "upload"
                            ? "bg-white text-green-900 shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-green-800" />
                        <span>Unggah File Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditImageMode("url")}
                        className={`min-h-[34px] px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          editImageMode === "url"
                            ? "bg-white text-green-900 shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-zinc-600" />
                        <span>Link URL</span>
                      </button>
                    </div>
                  </div>

                  {editImageMode === "upload" ? (
                    <div>
                      <input
                        id="edit-prod-file-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleEditFileChange}
                        className="hidden"
                      />

                      {!editImagePreview ? (
                        <label
                          htmlFor="edit-prod-file-input"
                          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 hover:border-green-800 rounded-xl bg-zinc-50 hover:bg-zinc-100/70 transition-colors cursor-pointer text-center group"
                        >
                          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-800 group-hover:scale-105 transition-transform mb-2">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-zinc-900">
                            Pilih berkas foto baru dari perangkat Anda
                          </span>
                          <span className="text-[11px] text-zinc-600 mt-0.5">
                            Format JPG, PNG, WEBP (Maksimal 5MB)
                          </span>
                        </label>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50">
                          <div className="flex items-center gap-3">
                            <img
                              src={editImagePreview}
                              alt="Foto Produk"
                              className="w-16 h-16 object-cover rounded-lg border border-zinc-200 bg-white shrink-0 shadow-sm"
                            />
                            <div>
                              <p className="text-xs font-bold text-zinc-900 line-clamp-1">
                                {editImageFile ? editImageFile.name : (editName || editingProduct.name)}
                              </p>
                              {editImageFile ? (
                                <p className="text-[11px] text-zinc-600 mt-0.5">
                                  File baru: {(editImageFile.size / 1024).toFixed(1)} KB (siap diunggah)
                                </p>
                              ) : (
                                <p className="text-[11px] text-zinc-600 mt-0.5">
                                  Foto produk saat ini tersimpan
                                </p>
                              )}
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-900 border border-green-200">
                                <ImageIcon className="w-3 h-3 text-green-800" />
                                {editImageFile ? "Foto baru dipilih" : "Foto aktif"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <label
                              htmlFor="edit-prod-file-input"
                              className="min-h-[38px] px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-100 cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Ganti Foto</span>
                            </label>
                            <button
                              type="button"
                              onClick={handleEditRemoveFile}
                              className="min-h-[38px] px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-700 text-xs font-semibold hover:bg-red-50 inline-flex items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {editImageUrl && (
                          <img
                            src={editImageUrl}
                            alt={editName || editingProduct.name}
                            className="w-12 h-12 rounded-lg object-cover border border-zinc-200 bg-zinc-100 shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        )}
                        <input
                          id="edit-image-url"
                          type="url"
                          value={editImageUrl}
                          onChange={(e) => {
                            setEditImageUrl(e.target.value);
                            setEditImagePreview(e.target.value);
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Type & Specific Settings */}
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-zinc-900">Tipe Produk</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditIsPhysical(true)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                        editIsPhysical
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      Produk Fisik
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditIsPhysical(false)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                        !editIsPhysical
                          ? "bg-green-800 text-white border-green-800"
                          : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      <Binary className="w-3.5 h-3.5" />
                      Produk Digital
                    </button>
                  </div>
                </div>

                {editIsPhysical ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label htmlFor="edit-weight" className="block font-semibold text-zinc-800 mb-1">
                        Berat Produk (kg)
                      </label>
                      <input
                        id="edit-weight"
                        type="number"
                        step="any"
                        min="0"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        className="w-full min-h-[44px] bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                      />
                    </div>
                    <label className="flex items-center gap-2.5 pt-5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={editAllowCod}
                        onChange={(e) => setEditAllowCod(e.target.checked)}
                        className="w-4 h-4 accent-green-800 rounded"
                      />
                      <span className="font-semibold text-zinc-800">Izinkan Bayar di Tempat (COD)</span>
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label htmlFor="edit-digital-type" className="block font-semibold text-zinc-800 mb-1">
                        Metode Pengiriman Digital
                      </label>
                      <select
                        id="edit-digital-type"
                        value={editDigitalDeliveryType}
                        onChange={(e) => setEditDigitalDeliveryType(e.target.value)}
                        className="w-full min-h-[44px] bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                      >
                        <option value="INSTANT_DOWNLOAD">Tautan Unduhan Langsung</option>
                        <option value="LICENSE_KEY">Kode Lisensi / Serial Key</option>
                        <option value="MANUAL_EMAIL">Pengiriman Manual via Email Admin</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="edit-digital-url" className="block font-semibold text-zinc-800 mb-1">
                        Tautan File Digital (Opsional)
                      </label>
                      <input
                        id="edit-digital-url"
                        type="text"
                        value={editDigitalFileUrl}
                        onChange={(e) => setEditDigitalFileUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full min-h-[44px] bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="edit-digital-key" className="block font-semibold text-zinc-800 mb-1">
                        Kode Lisensi / Akses Default (Opsional)
                      </label>
                      <input
                        id="edit-digital-key"
                        type="text"
                        value={editDigitalLicenseKey}
                        onChange={(e) => setEditDigitalLicenseKey(e.target.value)}
                        className="w-full min-h-[44px] bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="edit-short-desc" className="block font-semibold text-zinc-800 mb-1.5">
                    Ringkasan Singkat (Opsional)
                  </label>
                  <input
                    id="edit-short-desc"
                    type="text"
                    value={editShortDesc}
                    onChange={(e) => setEditShortDesc(e.target.value)}
                    placeholder="Satu kalimat unggulan produk"
                    className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                </div>

                <div>
                  <label htmlFor="edit-description" className="block font-semibold text-zinc-800 mb-1.5">
                    Deskripsi Lengkap
                  </label>
                  <textarea
                    id="edit-description"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                </div>
              </div>

              {/* Visibility & Featured Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 accent-green-800 rounded"
                  />
                  <span className="font-semibold text-zinc-900">
                    Tampilkan Aktif di Toko (Nonaktifkan untuk tetap di Arsip)
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-green-800 rounded"
                  />
                  <span className="font-semibold text-zinc-900">Produk Unggulan</span>
                </label>
              </div>

              {/* Sticky Footer Actions */}
              <div className="pt-4 border-t border-zinc-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {editSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{editSaving ? (editSavingStatus || "Menyimpan...") : "Simpan Perubahan Produk"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
