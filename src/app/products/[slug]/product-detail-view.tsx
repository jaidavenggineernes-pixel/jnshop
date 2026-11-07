"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Share2,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Plus,
  Minus,
  Binary,
  MessageCircle,
  Check,
  FileText,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { formatRupiah, calculateDiscountPercentage } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { ProductCard } from "@/components/product-card";

interface ProductDetailViewProps {
  product: any;
  relatedProducts: any[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping" | "reviews">("desc");

  const [selectedImage, setSelectedImage] = useState(
    product.images?.find((img: any) => img.isPrimary)?.url ||
      product.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80"
  );

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const effectivePrice = selectedVariant?.price ?? (product.discountPrice || product.price);
  const originalPrice = selectedVariant?.price ?? product.price;
  const discountPercent = calculateDiscountPercentage(originalPrice, effectivePrice);
  const availableStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = availableStock <= 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem(product, selectedVariant, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!isOutOfStock) {
      addItem(product, selectedVariant, quantity);
      router.push("/checkout");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAskAI = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jnshop-open-ai", {
          detail: {
            prompt: `Beri tahu saya spesifikasi utama dan keunggulan dari ${product.name}, apakah produk ini cocok untuk kebutuhan saya?`,
          },
        })
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-12 pb-28 sm:pb-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto no-scrollbar">
        <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600 transition-colors whitespace-nowrap">
          Katalog
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-blue-600 transition-colors whitespace-nowrap"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Photo */}
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-102"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md">
                Diskon {discountPercent}%
              </span>
            )}
            <span
              className={`absolute top-4 right-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl shadow-md backdrop-blur-md ${
                product.isPhysical ? "bg-slate-900/80 text-white" : "bg-blue-600/90 text-white"
              }`}
            >
              {product.isPhysical ? "📦 Produk Fisik" : "⚡ Produk Digital"}
            </span>
          </div>

          {/* Thumbnails Row */}
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImage === img.url
                      ? "border-blue-600 shadow-md ring-2 ring-blue-100"
                      : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Value Props & Guarantee Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">Garansi 7 Hari</div>
                <div className="text-[10px] text-slate-400">Retur & Uang Kembali</div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">100% Original</div>
                <div className="text-[10px] text-slate-400">Jaminan Kualitas</div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">Kirim Cepat</div>
                <div className="text-[10px] text-slate-400">Bubble Wrap Gratis</div>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-violet-600 shrink-0" />
              <div>
                <div className="text-[11px] font-bold text-slate-800">Invoice Resmi</div>
                <div className="text-[10px] text-slate-400">Bukti Bayar Sah</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details & Actions Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={`/categories/${product.category.slug}`}
                className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline"
              >
                {product.category.name}
              </Link>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating?.toFixed(1) || "5.0"}</span>
                <span className="text-slate-400 font-normal">
                  ({product.reviews?.length || 1} ulasan)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {product.sku && (
              <span className="text-xs text-slate-400 mt-1 block">SKU: {product.sku}</span>
            )}
          </div>

          {/* Price Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-slate-400">Harga Produk</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  {formatRupiah(effectivePrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatRupiah(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  availableStock > 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {availableStock > 0 ? `Tersedia: ${availableStock} unit` : "Stok Habis"}
              </span>
            </div>
          </div>

          {/* Variants Selector (if any) */}
          {product.variants?.length > 0 && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pilih Varian
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isVarOutOfStock = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={isVarOutOfStock}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600"
                          : isVarOutOfStock
                          ? "border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed"
                          : "border-slate-200 text-slate-700 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span>{v.name}</span>
                      {v.price && v.price !== product.price && (
                        <span className="text-slate-400 text-[11px]">
                          ({formatRupiah(v.price)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumlah Pembelian
            </span>
            <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                disabled={quantity >= availableStock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  justAdded
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Ditambahkan!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Keranjang</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Beli Sekarang</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  wishlisted
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                <span>{wishlisted ? "Tersimpan di Favorit" : "Simpan ke Favorit"}</span>
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Bagikan Tautan Produk"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Link Disalin!" : "Bagikan"}</span>
              </button>
            </div>

            {/* Ask AI directly about this product */}
            <button
              type="button"
              onClick={handleAskAI}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-blue-50 to-violet-50 border border-indigo-200 hover:border-indigo-400 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-indigo-100/60 cursor-pointer shadow-2xs group"
            >
              <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
              <span>Tanya JNshop AI tentang {product.name}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tabs for Description, Specifications, Shipping & Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-slate-100 overflow-x-auto no-scrollbar bg-slate-50/50 p-2 gap-1.5">
          <button
            onClick={() => setActiveTab("desc")}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "desc"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            📋 Deskripsi Produk
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "specs"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            ⚙️ Spesifikasi Teknis
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "shipping"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            🚚 Pengiriman & Garansi
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "reviews"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            ⭐ Ulasan Pembeli ({product.reviews?.length || 0})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-10">
          {activeTab === "desc" && (
            <div className="space-y-6">
              <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                {product.description}
              </div>

              {!product.isPhysical && (
                <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-2">
                  <h4 className="font-bold text-sm flex items-center gap-2 text-blue-900">
                    <Binary className="w-4 h-4 text-blue-600" />
                    Informasi Pemenuhan Produk Digital
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Produk ini merupakan aset digital resmi. Tautan unduhan langsung dan lisensi aktivasi otomatis dapat diakses di halaman detail pesanan Anda setelah verifikasi pembayaran berhasil.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Rincian Spesifikasi Produk</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500">Kategori</span>
                  <span className="font-semibold text-slate-900">{product.category.name}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500">Tipe Produk</span>
                  <span className="font-semibold text-slate-900">
                    {product.isPhysical ? "Fisik (Barang Dikirim Kurir)" : "Digital (Download Langsung)"}
                  </span>
                </div>
                {product.sku && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                    <span className="text-slate-500">SKU / Kode Produk</span>
                    <span className="font-semibold text-slate-900 font-mono">{product.sku}</span>
                  </div>
                )}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500">Stok Tersedia</span>
                  <span className="font-semibold text-emerald-600">{availableStock} Unit</span>
                </div>
                {selectedVariant && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                    <span className="text-slate-500">Varian Terpilih</span>
                    <span className="font-semibold text-blue-600">{selectedVariant.name}</span>
                  </div>
                )}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between">
                  <span className="text-slate-500">Kondisi</span>
                  <span className="font-semibold text-slate-900">100% Baru & Bergaransi</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <h3 className="font-bold text-sm text-slate-900">Informasi Pengiriman & Garansi Retur</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Ekspedisi & Kurir Resmi
                  </h4>
                  <p className="text-slate-600 text-xs">
                    Pengiriman produk fisik didukung oleh <strong>JNE Express</strong>, <strong>SiCepat</strong>, dan <strong>J&T Express</strong> ke seluruh wilayah Indonesia. Estimasi pengiriman Jabodetabek 1-2 hari kerja, Pulau Jawa 2-3 hari kerja, dan Luar Jawa 3-5 hari kerja.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                    Garansi 7 Hari Pengembalian
                  </h4>
                  <p className="text-slate-600 text-xs">
                    Anda berhak mengajukan retur barang atau pengembalian dana penuh (100% refund) apabila produk fisik yang diterima dalam kondisi rusak, cacat produksi, atau tidak sesuai pesanan dalam waktu 7 hari sejak paket diterima.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Ulasan & Rating Pelanggan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ulasan nyata dari pelanggan yang telah berbelanja di JNshop
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl text-amber-700 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{product.rating?.toFixed(1) || "5.0"}</span>
                  <span className="text-slate-400 font-normal">/ 5.0</span>
                </div>
              </div>

              {product.reviews?.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
                </p>
              ) : (
                <div className="space-y-3">
                  {product.reviews?.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {r.user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900">
                              {r.user?.name || "Pelanggan Terverifikasi"}
                            </span>
                            <span className="text-[10px] text-emerald-600 ml-2 font-medium">
                              ✓ Terverifikasi
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: r.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      {r.title && <h4 className="font-bold text-xs text-slate-900">{r.title}</h4>}
                      <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts?.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Produk Terkait Lainnya
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Purchase Bar (Visible on Mobile only) */}
      <div className="fixed bottom-12 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Harga</div>
          <div className="text-base font-black text-blue-600 truncate leading-tight">
            {formatRupiah(effectivePrice)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              justAdded
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "border-blue-600 text-blue-600 bg-blue-50/60"
            }`}
            title="Tambahkan ke Keranjang"
          >
            {justAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Beli Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
