"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    appliedCoupon,
    setAppliedCoupon,
    clearCoupon,
  } = useCart();

  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setLoadingVoucher(true);
    setVoucherError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: voucherCode.trim(), subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setVoucherError(data.error || "Kode voucher tidak valid.");
        clearCoupon();
      } else {
        setAppliedCoupon({
          id: data.coupon.id,
          code: data.coupon.code,
          description: data.coupon.description,
          type: data.coupon.type,
          value: data.coupon.value,
          minPurchase: Number(data.coupon.minPurchase) || 0,
          maxDiscount: data.coupon.maxDiscount ? Number(data.coupon.maxDiscount) : null,
          discountAmount: Number(data.discountAmount) || 0,
        });
        setVoucherCode("");
        setVoucherError("");
      }
    } catch {
      setVoucherError("Gagal memvalidasi kupon. Coba lagi.");
    } finally {
      setLoadingVoucher(false);
    }
  };

  const isCouponEligible =
    Boolean(appliedCoupon) &&
    subtotal > 0 &&
    (typeof appliedCoupon?.minPurchase !== "number" || subtotal >= appliedCoupon.minPurchase);

  const discountAmount = isCouponEligible
    ? Math.min(appliedCoupon!.discountAmount, subtotal)
    : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const totalUnits = items.reduce((acc, b) => acc + b.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 sm:pb-12">
      {/* Header */}
      <div className="mb-8 pb-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 mb-2">
            <Link href="/" className="hover:text-zinc-900">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-900 font-semibold">Keranjang Belanja</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Keranjang Belanja ({totalUnits})
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Periksa rincian produk fisik atau lisensi digital Anda sebelum melanjutkan ke pembayaran.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="min-h-[40px] px-3 rounded-lg text-xs text-red-800 hover:bg-red-50 font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Keranjang</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-zinc-900">Keranjang Masih Kosong</h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Belum ada item di keranjang Anda. Jelajahi katalog workstation dan produk digital untuk mulai memilih.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
          >
            <span>Lihat Katalog Produk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                        item.isPhysical
                          ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                          : "bg-green-50 text-green-800 border-green-200"
                      }`}
                    >
                      {item.isPhysical ? "Fisik" : "Digital"}
                    </span>
                    {item.variantName && (
                      <span className="text-xs text-zinc-600 font-medium">
                        Varian: {item.variantName}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm sm:text-base font-bold text-zinc-900 hover:text-green-800 transition-colors block truncate"
                  >
                    {item.name}
                  </Link>

                  <div className="text-xs text-zinc-600 tabular-nums">
                    Harga satuan: {formatRupiah(item.price)}
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                  <span className="text-base font-bold text-zinc-900 tabular-nums">
                    {formatRupiah(item.price * item.quantity)}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center border border-zinc-300 bg-white rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label={`Kurangi jumlah ${item.name}`}
                        className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-zinc-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label={`Tambah jumlah ${item.name}`}
                        className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Hapus ${item.name}`}
                      className="w-9 h-9 flex items-center justify-center text-zinc-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Voucher Form */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
                <Tag className="w-4 h-4 text-green-800" />
                <h2>Kode Promo / Voucher</h2>
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-green-900">
                    <CheckCircle2 className="w-4 h-4 text-green-800 shrink-0" />
                    <div>
                      <span className="font-mono font-bold block">{appliedCoupon.code}</span>
                      <span className="text-green-800 tabular-nums">
                        Hemat {formatRupiah(discountAmount)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearCoupon}
                    className="text-xs font-semibold text-red-800 hover:underline px-2 py-1"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyVoucher} className="flex gap-2">
                  <label htmlFor="cart-coupon-input" className="sr-only">
                    Masukkan kode voucher
                  </label>
                  <input
                    id="cart-coupon-input"
                    type="text"
                    placeholder="Contoh: JNSHOPNEW"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-xs font-mono uppercase text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                  />
                  <button
                    type="submit"
                    disabled={loadingVoucher || !voucherCode.trim()}
                    className="min-h-[44px] px-4 bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loadingVoucher ? "Cek..." : "Pakai"}
                  </button>
                </form>
              )}

              {voucherError && (
                <div className="flex items-center gap-1.5 text-xs text-red-800 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{voucherError}</span>
                </div>
              )}
            </div>

            {/* Order Totals */}
            <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-4">
              <h2 className="font-bold text-sm text-zinc-900 pb-3 border-b border-zinc-200">
                Ringkasan Belanja
              </h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal ({totalUnits} unit)</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-800 font-semibold">
                    <span>Diskon ({appliedCoupon?.code})</span>
                    <span className="tabular-nums">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Ongkos Kirim</span>
                  <span className="text-xs font-medium text-zinc-700">
                    {items.some((it) => it.isPhysical)
                      ? "Dihitung saat checkout"
                      : "Gratis (Digital)"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-zinc-900">Estimasi Total</span>
                <span className="text-xl font-bold text-zinc-900 tabular-nums">
                  {formatRupiah(finalTotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full min-h-[48px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Lanjut ke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-green-800" />
                <span>Voucher tersimpan otomatis ke halaman checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Mobile Checkout Bar anchored above 64px MobileBottomNav */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-zinc-200 px-4 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:hidden flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-zinc-600 font-medium">Estimasi Total</div>
            <div className="text-base font-bold text-zinc-900 tabular-nums">
              {formatRupiah(finalTotal)}
            </div>
          </div>
          <Link
            href="/checkout"
            className="min-h-[44px] px-5 bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
