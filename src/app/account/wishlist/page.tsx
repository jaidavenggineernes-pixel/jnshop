"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/products?ids=${wishlistIds.join(",")}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-stone-900 transition-colors">
            Akun
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">Favorit</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Koleksi Disimpan ({wishlistIds.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Daftar kurasi produk yang ingin Anda pertimbangkan atau beli nanti.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs sm:text-sm text-stone-500 font-serif">
          Menyiapkan koleksi simpanan Anda...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/95 rounded-2xl border border-stone-200/90 p-12 sm:p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto border border-stone-200">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-serif font-bold text-stone-900">
            Belum Ada Item Disimpan
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Klik tanda hati pada kartu produk manapun untuk menyimpannya ke dalam daftar pertimbangan pribadi Anda.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 font-medium text-xs sm:text-sm shadow-sm hover:bg-stone-800 transition-colors"
            >
              <span>Jelajahi Katalog Toko</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((p) => {
            const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
            const price = p.discountPrice || p.price;

            return (
              <div
                key={p.id}
                className="bg-white/95 rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:border-stone-400/80 transition-all group"
              >
                <div>
                  <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/95 text-stone-400 hover:text-red-600 shadow-sm transition-colors border border-stone-200/80"
                      title="Hapus dari Favorit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 sm:p-4 space-y-1.5">
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                      {p.category?.name}
                    </span>
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-serif font-bold text-xs sm:text-sm text-stone-900 hover:text-amber-800 line-clamp-2 leading-snug block transition-colors"
                    >
                      {p.name}
                    </Link>
                    <div className="text-sm sm:text-base font-serif font-bold text-stone-900 pt-1">
                      {formatRupiah(price)}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 pt-0">
                  <button
                    onClick={() => addItem(p, p.variants?.[0], 1)}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ke Keranjang</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
