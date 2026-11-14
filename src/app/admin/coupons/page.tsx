"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
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
      // ignore error
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
        throw new Error(data.error || "Gagal membuat kupon.");
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
      <div className="pb-5 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Kupon & Diskon
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">
          Kelola kode voucher potongan harga yang dapat digunakan saat checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-800" />
            Buat Voucher Baru
          </h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
            <div>
              <label htmlFor="coupon-code" className="block font-semibold text-zinc-800 mb-1.5">
                Kode Voucher *
              </label>
              <input
                id="coupon-code"
                type="text"
                required
                placeholder="Contoh: STUDIONOV"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 uppercase font-mono tracking-wider text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
              />
            </div>

            <div>
              <label htmlFor="coupon-desc" className="block font-semibold text-zinc-800 mb-1.5">
                Keterangan Promo
              </label>
              <input
                id="coupon-desc"
                type="text"
                placeholder="Potongan akhir pekan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="coupon-type" className="block font-semibold text-zinc-800 mb-1.5">
                  Tipe Diskon
                </label>
                <select
                  id="coupon-type"
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-zinc-900"
                >
                  <option value="PERCENTAGE">Persentase (%)</option>
                  <option value="FIXED">Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label htmlFor="coupon-val" className="block font-semibold text-zinc-800 mb-1.5">
                  Nilai {type === "PERCENTAGE" ? "(%)" : "(Rp)"} *
                </label>
                <input
                  id="coupon-val"
                  type="number"
                  required
                  min={1}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 font-bold text-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="coupon-min" className="block font-semibold text-zinc-800 mb-1.5">
                  Minimal Belanja (Rp)
                </label>
                <input
                  id="coupon-min"
                  type="number"
                  min={0}
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-zinc-900"
                />
              </div>

              <div>
                <label htmlFor="coupon-quota" className="block font-semibold text-zinc-800 mb-1.5">
                  Kuota Pemakaian
                </label>
                <input
                  id="coupon-quota"
                  type="number"
                  min={1}
                  value={quota}
                  onChange={(e) => setQuota(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-zinc-900"
                />
              </div>
            </div>

            {type === "PERCENTAGE" && (
              <div>
                <label htmlFor="coupon-cap" className="block font-semibold text-zinc-800 mb-1.5">
                  Batas Maksimal Diskon (Rp)
                </label>
                <input
                  id="coupon-cap"
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-zinc-900"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full min-h-[44px] rounded-lg bg-zinc-900 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
            >
              {loading ? "Menyimpan..." : "Aktifkan Kupon"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-5 border-b border-zinc-200 font-bold text-sm text-zinc-900">
            Kupon Aktif ({coupons.length})
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-zinc-900 tracking-wider">
                      {c.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-green-50 text-green-800 border border-green-200 tabular-nums">
                      {c.type === "PERCENTAGE" ? `Diskon ${c.value}%` : `Potongan ${formatRupiah(c.value)}`}
                    </span>
                  </div>
                  {c.description && <p className="text-zinc-600 mt-1">{c.description}</p>}
                  <p className="text-xs text-zinc-600 mt-1 tabular-nums">
                    Min. Belanja: {formatRupiah(c.minPurchase)} | Terpakai: {c.usedCount} / {c.quota}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 font-semibold text-zinc-900 tabular-nums shrink-0">
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
