"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("10");
  const [minPurchase, setMinPurchase] = useState("50000");
  const [maxDiscount, setMaxDiscount] = useState("50000");
  const [quota, setQuota] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          description,
          type,
          value,
          minPurchase,
          maxDiscount: type === "PERCENTAGE" ? maxDiscount : null,
          quota,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat kupon");
      }

      setCode("");
      setDescription("");
      await loadCoupons();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Kupon & Promosi Diskon
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola kode voucher potongan harga untuk meningkatkan konversi penjualan toko.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Add Coupon Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Buat Kode Voucher Baru
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kode Voucher *</label>
              <input
                type="text"
                required
                placeholder="Contoh: FLASHMANTAP"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keterangan Promo</label>
              <input
                type="text"
                placeholder="Contoh: Diskon belanja spesial akhir pekan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Diskon</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Besar Diskon {type === "PERCENTAGE" ? "(%)" : "(Rp)"} *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimal Pembelian (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Kuota Penggunaan</label>
                <input
                  type="number"
                  min={1}
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2"
                />
              </div>
            </div>

            {type === "PERCENTAGE" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maksimal Potongan Diskon (Rp Cap)
                </label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{loading ? "Menyimpan..." : "Aktifkan Voucher"}</span>
            </button>
          </form>
        </div>

        {/* Existing Coupons Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 font-bold text-sm text-slate-900">
            Daftar Kupon Aktif ({coupons.length})
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-blue-600 tracking-wider">
                      {c.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {c.type === "PERCENTAGE" ? `Diskon ${c.value}%` : `Potongan ${formatRupiah(c.value)}`}
                    </span>
                  </div>
                  {c.description && <p className="text-slate-500 mt-1">{c.description}</p>}
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Min. Belanja: {formatRupiah(c.minPurchase)} | Terpakai: {c.usedCount} / {c.quota}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-700">
                  {c.quota - c.usedCount} Sisa
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
