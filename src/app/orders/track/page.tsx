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
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
          <PackageCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Lacak Status Pesanan
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Masukkan nomor invoice transaksi JNshop Anda untuk melihat status verifikasi pembayaran, nomor resi pengiriman, atau akses produk digital.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Nomor Pesanan / Invoice
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: JN-20261101-9981"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono tracking-wider rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase placeholder:normal-case placeholder:font-sans"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!orderNumber.trim()}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Cari Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Data terlindungi & terenkripsi</span>
          </div>
          <Link href="/account/orders" className="text-blue-600 font-semibold hover:underline">
            Lihat di Akun Saya
          </Link>
        </div>
      </div>
    </div>
  );
}
