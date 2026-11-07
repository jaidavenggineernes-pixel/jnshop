"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, PackageCheck, ShieldCheck, ArrowRight } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      router.push(`/orders/${orderNumber.trim()}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mx-auto border border-stone-200">
          <PackageCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Lacak Pengiriman & Status Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Masukkan nomor invoice transaksi JNshop Anda untuk memantau status pesanan, nomor resi ekspedisi, atau mengakses unduhan lisensi digital.
        </p>
      </div>

      <div className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Nomor Invoice / ID Pesanan
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: JN-20261101-9981"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full bg-stone-50/60 border border-stone-200 text-stone-900 font-mono tracking-wider rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!orderNumber.trim()}
            className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-100 font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Cari Data Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
            <span>Verifikasi aman JNshop</span>
          </div>
          <Link href="/account/orders" className="text-stone-800 font-medium hover:underline">
            Lihat di Akun Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
