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

  const effectivePrice = selectedVariant?.price ?? (product.discountPrice || product.price);
  const originalPrice = selectedVariant?.price ?? product.price;
  const discountPercent = calculateDiscountPercentage(originalPrice, effectivePrice);
  const availableStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = availableStock <= 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addItem(product, selectedVariant, quantity);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600 transition-colors">
          Katalog
        </Link>
        <span>/</span>
        <Link
          href={`/categories/${product.category.slug}`}
          className="hover:text-blue-600 transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Photo */}
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                Diskon {discountPercent}%
              </span>
            )}
            <span
              className={`absolute top-4 right-4 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-xl shadow-md backdrop-blur-md ${
                product.isPhysical ? "bg-slate-900/80 text-white" : "bg-blue-600/90 text-white"
              }`}
            >
              {product.isPhysical ? "Produk Fisik" : "Digital Download"}
            </span>
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 transition-all shrink-0 ${
                    selectedImage === img.url
                      ? "border-blue-600 scale-105 shadow-md shadow-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Delivery & Assurance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/70">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Truck className="w-4 h-4 text-blue-600" />
                {product.isPhysical ? "Pengiriman Cepat" : "Instant Access"}
              </div>
              <p className="text-[11px] text-slate-500">
                {product.isPhysical
                  ? "Ekspedisi JNE, SiCepat, J&T dengan nomor resi resmi."
                  : "File & kode lisensi otomatis aktif setelah pembayaran terverifikasi."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Original
              </div>
              <p className="text-[11px] text-slate-500">
                Jaminan keaslian unit & garansi retur 7 hari jika barang cacat produksi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                Dukungan Toko
              </div>
              <p className="text-[11px] text-slate-500">
                Bantuan AI & kontak langsung ke owner toko via WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Product Purchase Actions Column */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
          
          {/* Header & Title */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-blue-600 uppercase tracking-wider">
                {product.category.name}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating?.toFixed(1) || "5.0"}</span>
                <span className="text-slate-400 font-normal">
                  ({product.reviewCount || 0} Ulasan)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.sku && (
              <span className="text-xs text-slate-400 mt-1 block">SKU: {product.sku}</span>
            )}
          </div>

          {/* Price Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-slate-400">Total Harga</div>
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
                {availableStock > 0 ? `Stok: ${availableStock} unit` : "Habis"}
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
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 text-slate-700 hover:border-slate-300 bg-white"
                    }`}
                  >
                    {v.name}
                    {v.price && v.price !== product.price && (
                      <span className="text-slate-400 ml-1">({formatRupiah(v.price)})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Jumlah Pembelian
            </span>
            <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                disabled={quantity >= availableStock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="py-3.5 px-4 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Keranjang</span>
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
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  wishlisted
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted ? "fill-red-500" : ""}`} />
                <span>{wishlisted ? "Tersimpan di Favorit" : "Simpan ke Favorit"}</span>
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Bagikan Tautan Produk"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Link Disalin!" : "Bagikan"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
          Deskripsi & Spesifikasi Produk
        </h2>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
          {product.description}
        </div>

        {/* Digital product details banner */}
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

      {/* Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ulasan & Penilaian Pelanggan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ulasan nyata dari pelanggan yang telah membeli produk ini di JNshop
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl text-amber-700 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>{product.rating?.toFixed(1) || "5.0"}</span>
            <span className="text-slate-400 font-normal">/ 5.0</span>
          </div>
        </div>

        {product.reviews?.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan ulasan!
          </p>
        ) : (
          <div className="space-y-4">
            {product.reviews?.map((r: any) => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {r.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900">{r.user?.name || "Pelanggan Terverifikasi"}</span>
                      <span className="text-[10px] text-emerald-600 ml-2 font-medium">✓ Pembeli Terverifikasi</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {r.title && <h4 className="font-bold text-sm text-slate-900">{r.title}</h4>}
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Produk Terkait Lainnya
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
