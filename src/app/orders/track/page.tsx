"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, PackageSearch, ArrowRight } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = orderNumber.trim().toUpperCase();
    if (!cleanCode) {
      setError("Masukkan nomor invoice pesanan Anda.");
      return;
    }
    setError("");
    router.push(`/orders/${encodeURIComponent(cleanCode)}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 space-y-6">
      <div className="text-center space-y-2.5">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center mx-auto">
          <PackageSearch className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Lacak Status Pesanan
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Masukkan kode invoice pesanan untuk melihat status pembayaran, nomor resi, atau mengunduh produk digital Anda.
        </p>
      </div>

      <form
        onSubmit={handleTrack}
        className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4"
      >
        <div>
          <label htmlFor="track-order-input" className="block text-xs font-semibold text-zinc-800 mb-1.5">
            Nomor Pesanan / Invoice
          </label>
          <div className="relative">
            <input
              id="track-order-input"
              type="text"
              placeholder="Contoh: INV-20261108-XXXX"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg pl-10 pr-4 text-sm font-mono uppercase text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
            />
            <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {error && <p className="text-xs font-medium text-red-800 mt-1.5">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full min-h-[44px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <span>Cek Status Pesanan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-zinc-600">
        Sudah memiliki akun?{" "}
        <Link href="/account/orders" className="font-semibold text-green-800 hover:underline">
          Lihat seluruh riwayat pesanan
        </Link>
      </div>
    </div>
  );
}
