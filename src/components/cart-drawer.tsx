"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    appliedCoupon,
  } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const totalUnits = items.reduce((a, b) => a + b.quantity, 0);
  const isCouponEligible =
    Boolean(appliedCoupon) &&
    subtotal > 0 &&
    (typeof appliedCoupon?.minPurchase !== "number" || subtotal >= appliedCoupon.minPurchase);
  const discount = isCouponEligible ? Math.min(appliedCoupon!.discountAmount, subtotal) : 0;
  const netSubtotal = Math.max(0, subtotal - discount);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja"
    >
      <div
        className="fixed inset-0 bg-zinc-950/50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-zinc-900" />
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                Keranjang ({totalUnits})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              aria-label="Tutup keranjang"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 px-4 flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center mb-4 border border-zinc-200">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-zinc-900 text-base mb-1">
                  Keranjang masih kosong
                </h3>
                <p className="text-xs text-zinc-600 max-w-xs mb-6 leading-relaxed">
                  Tambahkan perlengkapan meja kerja atau produk digital dari katalog untuk melanjutkan ke checkout.
                </p>
                <Link
                  href="/products"
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors"
                >
                  Lihat Katalog
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 bg-zinc-50 rounded-xl border border-zinc-200"
                >
                  <div className="relative w-18 h-18 rounded-lg overflow-hidden bg-white shrink-0 border border-zinc-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-sm font-semibold text-zinc-900 hover:text-green-800 line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-600">
                          <span>{item.isPhysical ? "Fisik" : "Digital"}</span>
                          {item.variantName && (
                            <>
                              <span aria-hidden="true">•</span>
                              <span className="truncate">{item.variantName}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Hapus ${item.name}`}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center border border-zinc-300 bg-white rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Kurangi jumlah ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-zinc-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Tambah jumlah ${item.name}`}
                          className="w-8 h-8 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-zinc-900 tabular-nums">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-zinc-200 bg-white space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-800 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Kupon {appliedCoupon.code}
                    </span>
                    <span className="tabular-nums">-{formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                  <span>Estimasi Total</span>
                  <span className="tabular-nums">{formatRupiah(netSubtotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="min-h-[44px] px-3 rounded-lg border border-zinc-300 text-zinc-900 font-semibold text-xs flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                  Lihat Keranjang
                </Link>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="min-h-[44px] px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
