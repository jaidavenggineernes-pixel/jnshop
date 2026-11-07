"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const [voucherCode, setVoucherCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
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
        setVoucherError(data.error || "Voucher tidak valid");
        setDiscountAmount(0);
        setAppliedCoupon(null);
      } else {
        setDiscountAmount(data.discountAmount);
        setAppliedCoupon(data.coupon.code);
        setVoucherCode("");
      }
    } catch {
      setVoucherError("Gagal memeriksa voucher. Coba lagi.");
    } finally {
      setLoadingVoucher(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Keranjang Belanja</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Keranjang Belanja
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola item belanja Anda sebelum melanjutkan ke formulir pengiriman & pembayaran.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:text-red-700 font-semibold"
          >
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Keranjang Belanja Anda Kosong</h2>
          <p className="text-sm text-slate-500">
            Anda belum menambahkan produk apapun. Jelajahi katalog JNshop dan temukan produk terbaik untuk Anda.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            <span>Mulai Belanja</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Table Area */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>Produk yang Dipilih ({items.reduce((a, b) => a + b.quantity, 0)})</span>
              <span>Harga Satuan</span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Left Info */}
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-slate-500 mt-0.5">Varian: {item.variantName}</p>
                      )}
                      <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 mt-1">
                        {item.isPhysical ? "Fisik" : "Digital"}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8">
                    <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-lg text-slate-600 hover:bg-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-lg text-slate-600 hover:bg-white"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-slate-900 text-sm">
                        {formatRupiah(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-500 text-xs mt-1 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lanjut Belanja Produk Lain</span>
              </Link>
            </div>
          </div>

          {/* Cart Summary & Checkout Actions */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Voucher Coupon Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Punya Kode Diskon?</span>
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800">Kupon: {appliedCoupon}</span>
                    <p className="text-[11px] text-emerald-600">
                      Hemat {formatRupiah(discountAmount)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setDiscountAmount(0);
                    }}
                    className="text-xs text-red-600 font-semibold hover:underline"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: JNSHOPNEW"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!voucherCode.trim() || loadingVoucher}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-colors"
                  >
                    Terapkan
                  </button>
                </form>
              )}

              {voucherError && <p className="text-xs text-red-500 font-medium">{voucherError}</p>}
            </div>

            {/* Total Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                Ringkasan Transaksi
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon Voucher ({appliedCoupon})</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Biaya Pengiriman</span>
                  <span className="text-slate-500">Dihitung di Checkout</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-serif font-bold text-sm text-stone-900">Total Pembayaran</span>
                <span className="text-2xl font-serif font-bold text-stone-900">
                  {formatRupiah(finalTotal)}
                </span>
              </div>

              <Link
                href={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon}` : ""}`}
                className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Lanjut ke Formulir Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                <span>Transaksi dijamin aman dengan invoice resmi</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Cart Total Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-12 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-stone-500 font-medium uppercase">Total Pembayaran</div>
            <div className="text-base font-serif font-bold text-stone-900">{formatRupiah(finalTotal)}</div>
          </div>
          <Link
            href={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon}` : ""}`}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Mobile Sticky Cart Checkout Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-12 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Belanja</div>
            <div className="text-base font-black text-blue-600">{formatRupiah(finalTotal)}</div>
          </div>
          <Link
            href={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon}` : ""}`}
            className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Checkout ({items.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
