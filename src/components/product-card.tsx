"use client";

import React from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check, Sparkles } from "lucide-react";
import { ProductData } from "@/types";
import { formatRupiah, calculateDiscountPercentage } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

interface ProductCardProps {
  product: ProductData | any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const primaryImage =
    product.images?.find((img: any) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80";

  const discountPercent = calculateDiscountPercentage(product.price, product.discountPrice);
  const effectivePrice = product.discountPrice || product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem(product, product.variants?.[0], 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Media & Badges */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm">
              -{discountPercent}%
            </span>
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg backdrop-blur-md shadow-sm ${
              product.isPhysical
                ? "bg-slate-900/80 text-white"
                : "bg-blue-600/90 text-white"
            }`}
          >
            {product.isPhysical ? "Fisik" : "Digital"}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all z-10 ${
            wishlisted
              ? "bg-red-50 text-red-500 shadow-md"
              : "bg-white/80 text-slate-400 hover:text-red-500 hover:bg-white"
          }`}
          title={wishlisted ? "Hapus dari Favorit" : "Simpan ke Favorit"}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`} />
        </button>

        {/* Stock Out Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-950 text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium hover:text-blue-600 transition-colors">
              {product.category?.name || "JNshop Official"}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{product.rating?.toFixed(1) || "5.0"}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount || 0})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Short Description or Variant info */}
          {product.shortDescription && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-xs text-slate-400">Harga</div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-slate-900">
                {formatRupiah(effectivePrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  {formatRupiah(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Icon Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:scale-95"
            }`}
            title="Tambah ke Keranjang"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
