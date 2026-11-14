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
        // ignore network hiccup
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="pb-5 border-b border-zinc-200">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 mb-2">
          <Link href="/" className="hover:text-zinc-900">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/account" className="hover:text-zinc-900">
            Akun
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-zinc-900 font-semibold">Wishlist</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Produk Tersimpan ({wishlistIds.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Daftar item favorit yang Anda simpan untuk dibeli nanti.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-zinc-600">
          Memuat daftar simpanan...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Wishlist Masih Kosong</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Klik ikon hati pada kartu produk manapun untuk menyimpannya ke daftar ini.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
          >
            <span>Lihat Katalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => {
            const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
            const price = p.discountPrice || p.price;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col justify-between hover:border-zinc-400 transition-colors group"
              >
                <div>
                  <div className="relative aspect-[4/3] w-full bg-zinc-100 border-b border-zinc-200 overflow-hidden">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p.id)}
                      aria-label={`Hapus ${p.name} dari wishlist`}
                      className="absolute top-2 right-2 w-11 h-11 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:text-red-800 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-1">
                    <span className="text-xs font-medium text-zinc-600 block truncate">
                      {p.category?.name}
                    </span>
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-semibold text-sm text-zinc-900 hover:text-green-800 line-clamp-2 leading-snug block"
                    >
                      {p.name}
                    </Link>
                    <div className="text-base font-bold text-zinc-900 pt-1 tabular-nums">
                      {formatRupiah(price)}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    type="button"
                    onClick={() => addItem(p, p.variants?.[0], 1)}
                    className="w-full min-h-[44px] rounded-lg bg-zinc-900 hover:bg-green-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Keranjang</span>
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
