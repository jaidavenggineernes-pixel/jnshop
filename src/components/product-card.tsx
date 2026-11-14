"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Check } from "lucide-react";
import { formatRupiah, calculateDiscountPercentage } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const primaryImage =
    product.images?.find((img: any) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.png";

  const activePrice = product.discountPrice || product.price;
  const discountPercentage = calculateDiscountPercentage(
    product.price,
    product.discountPrice
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.variants?.[0] || undefined, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article className="group bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 transition-colors overflow-hidden flex flex-col justify-between h-full">
      {/* Product Media */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 border-b border-zinc-200">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        </Link>

        {/* Format & Discount Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
          <span
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              product.isPhysical
                ? "bg-white text-zinc-900 border-zinc-300"
                : "bg-green-50 text-green-800 border-green-200"
            }`}
          >
            {product.isPhysical ? "Fisik" : "Digital"}
          </span>

          {discountPercentage > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-red-700 text-white text-[11px] font-bold tabular-nums">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Wishlist Action (44x44px hit area) */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? `Hapus ${product.name} dari wishlist` : `Simpan ${product.name} ke wishlist`}
          className={`absolute top-1.5 right-1.5 w-11 h-11 rounded-lg border flex items-center justify-center transition-colors ${
            wishlisted
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-white/95 border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:border-zinc-300"
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? "fill-red-700" : ""}`} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-zinc-950/60 flex items-center justify-center">
            <span className="px-3 py-1 bg-white text-zinc-900 text-xs font-bold rounded-md">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Product Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-medium text-zinc-600 truncate">
              {product.category?.name || "Koleksi"}
            </span>
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-zinc-700 font-medium shrink-0 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-zinc-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-green-800 transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-end justify-between gap-2 pt-2 border-t border-zinc-100">
          <div className="min-w-0">
            {discountPercentage > 0 && (
              <span className="text-xs text-zinc-600 line-through block leading-tight tabular-nums">
                {formatRupiah(product.price)}
              </span>
            )}
            <span className="text-base font-bold text-zinc-900 tabular-nums tracking-tight">
              {formatRupiah(activePrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={`Tambah ${product.name} ke keranjang`}
            className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
              added
                ? "bg-green-800 text-white"
                : "bg-zinc-900 hover:bg-green-800 text-white disabled:bg-zinc-200 disabled:text-zinc-500"
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}
