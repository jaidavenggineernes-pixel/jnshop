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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-blue-600">
            Akun
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Favorit</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Produk Favorit / Wishlist ({wishlistIds.length})
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar produk impian yang Anda simpan untuk dibeli nanti.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Memuat produk favorit...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Belum Ada Produk Favorit</h2>
          <p className="text-sm text-slate-500">
            Simpan produk yang Anda sukai dengan menekan ikon hati pada katalog produk.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md"
          >
            <span>Jelajahi Produk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const primaryImg = p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url;
            const price = p.discountPrice || p.price;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                    <img src={primaryImg} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 text-red-500 shadow-sm hover:scale-105"
                      title="Hapus dari Favorit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[11px] font-semibold text-blue-600 uppercase">
                      {p.category?.name}
                    </span>
                    <Link
                      href={`/products/${p.slug}`}
                      className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-2 block"
                    >
                      {p.name}
                    </Link>
                    <div className="text-base font-extrabold text-slate-900 pt-1">
                      {formatRupiah(price)}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => addItem(p, p.variants?.[0], 1)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Pindahkan ke Keranjang</span>
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
