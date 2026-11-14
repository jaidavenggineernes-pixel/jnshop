"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Binary,
  Check,
  MessageSquare,
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
      setTimeout(() => setJustAdded(false), 1800);
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
      setTimeout(() => setCopiedLink(false), 1800);
    }
  };

  const handleAskProduct = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jnshop-open-ai", {
          detail: {
            prompt: `Apa spesifikasi utama dan kecocokan produk ${product.name}?`,
          },
        })
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-12 pb-32 sm:pb-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 overflow-x-auto no-scrollbar">
        <Link href="/" className="hover:text-zinc-900 whitespace-nowrap">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="hover:text-zinc-900 whitespace-nowrap">
          Katalog
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-zinc-900 whitespace-nowrap"
        >
          {product.category.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-red-700 text-white text-xs font-bold px-2.5 py-1 rounded-md tabular-nums">
                Diskon {discountPercent}%
              </span>
            )}
            <span
              className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-md border ${
                product.isPhysical
                  ? "bg-white text-zinc-900 border-zinc-300"
                  : "bg-green-50 text-green-800 border-green-200"
              }`}
            >
              {product.isPhysical ? "Produk Fisik" : "Produk Digital"}
            </span>
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  aria-label={`Tampilkan foto ${product.name}`}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                    selectedImage === img.url
                      ? "border-green-800"
                      : "border-zinc-200 hover:border-zinc-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Guarantees Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { icon: RotateCcw, title: "Garansi 7 Hari", sub: "Retur sesuai S&K" },
              { icon: ShieldCheck, title: "Produk Asli", sub: "Terverifikasi toko" },
              {
                icon: Truck,
                title: product.isPhysical ? "Kemasan Aman" : "Akses Instan",
                sub: product.isPhysical ? "Kurir tepercaya" : "Tautan siap pakai",
              },
              { icon: CheckCircle, title: "Invoice Resmi", sub: "Riwayat tercatat" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-2.5"
                >
                  <Icon className="w-4 h-4 text-green-800 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900">{item.title}</div>
                    <div className="text-[11px] text-zinc-600">{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details & Purchase Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs">
              <Link
                href={`/categories/${product.category.slug}`}
                className="font-semibold text-green-800 hover:underline"
              >
                {product.category.name}
              </Link>
              <span className="text-zinc-400" aria-hidden="true">•</span>
              <div className="inline-flex items-center gap-1 text-zinc-700 font-semibold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{product.rating?.toFixed(1) || "5.0"}</span>
                <span className="text-zinc-600 font-normal">
                  ({product.reviews?.length || 0} ulasan)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {product.sku && (
              <span className="text-xs font-mono text-zinc-600 mt-1.5 block">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Price Block */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-baseline justify-between gap-3">
            <div>
              <div className="text-xs text-zinc-600 font-medium">Harga</div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-zinc-900 tabular-nums">
                  {formatRupiah(effectivePrice)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-sm text-zinc-600 line-through tabular-nums">
                    {formatRupiah(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border shrink-0 ${
                availableStock > 0
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {availableStock > 0 ? `Stok ${availableStock}` : "Habis"}
            </span>
          </div>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Pilih Varian
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => {
                  const isSelected = selectedVariant?.id === v.id;
                  const isVarOut = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      disabled={isVarOut}
                      className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                        isSelected
                          ? "border-green-800 bg-green-50 text-green-800"
                          : isVarOut
                          ? "border-zinc-200 bg-zinc-100 text-zinc-500 line-through"
                          : "border-zinc-300 text-zinc-800 hover:border-zinc-900 bg-white"
                      }`}
                    >
                      <span>{v.name}</span>
                      {v.price && v.price !== product.price && (
                        <span className="text-zinc-600 tabular-nums">
                          ({formatRupiah(v.price)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Jumlah
            </span>
            <div className="inline-flex items-center border border-zinc-300 bg-white rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                aria-label="Kurangi jumlah pembelian"
                className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-zinc-900 tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
                aria-label="Tambah jumlah pembelian"
                className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`min-h-[48px] px-4 rounded-lg border font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                  justAdded
                    ? "border-green-800 bg-green-50 text-green-800"
                    : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-900 disabled:opacity-50"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Masuk Keranjang</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Keranjang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="min-h-[48px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                Beli Sekarang
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`min-h-[44px] px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  wishlisted
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-700 text-red-700" : ""}`} />
                <span>{wishlisted ? "Tersimpan" : "Simpan"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[44px] px-3 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? "Tautan Disalin" : "Bagikan"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleAskProduct}
              className="w-full min-h-[44px] px-4 rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-green-800" />
              <span>Tanya Spesifikasi Produk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center border-b border-zinc-200 overflow-x-auto no-scrollbar bg-zinc-50 p-2 gap-1.5">
          {[
            { id: "desc", label: "Deskripsi" },
            { id: "specs", label: "Spesifikasi" },
            { id: "shipping", label: "Pengiriman & Garansi" },
            { id: "reviews", label: `Ulasan (${product.reviews?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[40px] px-4 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-8">
          {activeTab === "desc" && (
            <div className="space-y-6">
              <div className="text-zinc-700 leading-relaxed text-sm whitespace-pre-wrap max-w-3xl">
                {product.description}
              </div>

              {!product.isPhysical && (
                <div className="p-4 sm:p-5 rounded-xl bg-green-50 border border-green-200 text-green-900 space-y-1.5 max-w-3xl">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Binary className="w-4 h-4 text-green-800" />
                    Pengiriman Produk Digital
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-green-900">
                    Tautan unduhan dan kunci aktivasi akan tersedia otomatis di halaman detail pesanan Anda setelah pembayaran dikonfirmasi.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-zinc-900">Rincian Produk</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex justify-between gap-3">
                  <span className="text-zinc-600">Kategori</span>
                  <span className="font-semibold text-zinc-900">{product.category.name}</span>
                </div>
                <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex justify-between gap-3">
                  <span className="text-zinc-600">Format</span>
                  <span className="font-semibold text-zinc-900">
                    {product.isPhysical ? "Fisik (Dikirim Kurir)" : "Digital (Akses Online)"}
                  </span>
                </div>
                {product.sku && (
                  <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex justify-between gap-3">
                    <span className="text-zinc-600">SKU</span>
                    <span className="font-semibold text-zinc-900 font-mono">{product.sku}</span>
                  </div>
                )}
                <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex justify-between gap-3">
                  <span className="text-zinc-600">Ketersediaan</span>
                  <span className="font-semibold text-green-800 tabular-nums">
                    {availableStock} Unit
                  </span>
                </div>
                {selectedVariant && (
                  <div className="p-3.5 bg-zinc-50 rounded-lg border border-zinc-200 flex justify-between gap-3">
                    <span className="text-zinc-600">Varian</span>
                    <span className="font-semibold text-zinc-900">{selectedVariant.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-800" />
                  Ekspedisi Resmi
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  Produk fisik dikirim dari Jakarta menggunakan JNE, SiCepat, atau J&T. Estimasi Jabodetabek 1-2 hari kerja dan luar daerah 2-5 hari kerja.
                </p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-green-800" />
                  Garansi 7 Hari
                </h3>
                <p className="text-zinc-600 leading-relaxed">
                  Berlaku untuk penukaran unit baru atau pengembalian dana jika barang diterima dalam kondisi rusak atau cacat produksi.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900">Ulasan Pembeli</h3>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Penilaian dari pelanggan terverifikasi JNshop
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-900 font-bold text-sm tabular-nums">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{product.rating?.toFixed(1) || "5.0"}</span>
                  <span className="text-zinc-600 font-normal">/ 5.0</span>
                </div>
              </div>

              {product.reviews?.length === 0 ? (
                <p className="text-sm text-zinc-600 py-6 text-center">
                  Belum ada ulasan untuk produk ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {product.reviews?.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                            {r.user?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-zinc-900">
                              {r.user?.name || "Pelanggan Terverifikasi"}
                            </span>
                            <span className="text-[11px] text-green-800 ml-2 font-medium">
                              Terverifikasi
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>
                      {r.title && <h4 className="font-semibold text-xs text-zinc-900">{r.title}</h4>}
                      <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">{r.comment}</p>
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
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            Produk Terkait
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Non-colliding Mobile Purchase Bar anchored cleanly above 64px MobileBottomNav */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-zinc-200 px-4 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-zinc-600 font-medium">Harga</div>
          <div className="text-base font-bold text-zinc-900 truncate tabular-nums">
            {formatRupiah(effectivePrice)}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Tambahkan ke keranjang"
            className={`w-11 h-11 rounded-lg border flex items-center justify-center transition-colors ${
              justAdded
                ? "bg-green-800 border-green-800 text-white"
                : "border-zinc-300 text-zinc-900 bg-zinc-50"
            }`}
          >
            {justAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="min-h-[44px] px-5 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs transition-colors"
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
