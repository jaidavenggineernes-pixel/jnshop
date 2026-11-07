"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Check } from "lucide-react";
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
  const [justAdded, setJustAdded] = useState(false);

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
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/90 hover:border-stone-400/80 shadow-2xs hover:shadow-xl hover:shadow-stone-200/60 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Media & Badges */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Hemat {discountPercent}%
            </span>
          )}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
              product.isPhysical
                ? "bg-stone-900/80 text-stone-100"
                : "bg-blue-900/80 text-blue-100"
            }`}
          >
            {product.isPhysical ? "Fisik" : "Digital"}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all z-10 cursor-pointer ${
            wishlisted
              ? "bg-red-50 text-red-600 shadow-sm"
              : "bg-white/80 text-stone-400 hover:text-red-500 hover:bg-white"
          }`}
          title={wishlisted ? "Hapus dari Favorit" : "Simpan ke Favorit"}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-500" : ""}`} />
        </button>

        {/* Stock Out Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-stone-950 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Body Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
            <span className="font-medium hover:text-stone-800 transition-colors uppercase tracking-wider text-[10px]">
              {product.category?.name || "Koleksi Toko"}
            </span>
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>{product.rating?.toFixed(1) || "5.0"}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-stone-700 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-stone-900">
                {formatRupiah(effectivePrice)}
              </span>
              {discountPercent > 0 && (
                <span className="text-[11px] text-stone-400 line-through">
                  {formatRupiah(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Icon Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
              justAdded
                ? "bg-emerald-600 text-white"
                : isOutOfStock
                ? "bg-stone-100 text-stone-300 cursor-not-allowed"
                : "bg-stone-900 text-white hover:bg-stone-800 shadow-xs active:scale-95"
            }`}
            title="Tambah ke Keranjang"
          >
            {justAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
