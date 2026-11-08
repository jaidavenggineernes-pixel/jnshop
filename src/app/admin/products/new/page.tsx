"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Package,
  Binary,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [isPhysical, setIsPhysical] = useState(true);
  const [digitalDeliveryType, setDigitalDeliveryType] = useState("INSTANT_DOWNLOAD");
  const [digitalFileUrl, setDigitalFileUrl] = useState("");
  const [digitalLicenseKey, setDigitalLicenseKey] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [allowCod, setAllowCod] = useState(true);

  const [generatingAI, setGeneratingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.categories?.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      } catch {
        // fallback
      }
    }
    loadCategories();
  }, []);

  const handleGenerateAIDescription = async () => {
    if (!name.trim()) {
      setError("Isi nama produk terlebih dahulu agar AI dapat menyusun deskripsi yang relevan.");
      return;
    }

    setGeneratingAI(true);
    setError("");

    try {
      const res = await fetch("/api/ai/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DESCRIPTION",
          input: { name, isPhysical, price },
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setDescription(data.text);
      }
    } catch {
      setError("Gagal membuat deskripsi dengan AI.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) {
      setError("Nama, harga, dan kategori wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          shortDescription: shortDescription.trim() || null,
          description: description.trim() || name.trim(),
          price: parseFloat(price),
          discountPrice: discountPrice ? parseFloat(discountPrice) : null,
          stock: parseInt(stock) || 0,
          sku: sku.trim() || null,
          weight: isPhysical ? parseFloat(weight) || 0.5 : 0,
          isPhysical,
          digitalDeliveryType: !isPhysical ? digitalDeliveryType : null,
          digitalFileUrl: !isPhysical ? digitalFileUrl.trim() || null : null,
          digitalLicenseKey: !isPhysical ? digitalLicenseKey.trim() || null : null,
          categoryId,
          imageUrl: imageUrl.trim() || null,
          isFeatured,
          allowCod: isPhysical ? allowCod : false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan produk.");
      }

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tambah Produk Baru</h1>
          <p className="text-xs text-slate-500">
            Lengkapi data produk fisik atau digital untuk ditampilkan di etalase JNshop.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Informasi Dasar Produk
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Produk *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Keychron K2 Pro Mechanical Keyboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Format / Tipe Produk
              </label>
              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsPhysical(true)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    isPhysical
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 bg-white"
                  }`}
                >
                  📦 Produk Fisik
                </button>
                <button
                  type="button"
                  onClick={() => setIsPhysical(false)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    !isPhysical
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 bg-white"
                  }`}
                >
                  ⚡ Produk Digital
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Singkat (Short Description)
            </label>
            <input
              type="text"
              placeholder="1-2 kalimat ringkasan produk untuk tampilan kartu"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
            />
          </div>

          {/* Description with AI generation button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Deskripsi Lengkap & Spesifikasi *
              </label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={generatingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[11px] shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{generatingAI ? "Menulis..." : "Buat dengan AI ✨"}</span>
              </button>
            </div>
            <textarea
              rows={5}
              required
              placeholder="Deskripsi fitur, dimensi, paket penjualan, dan spesifikasi produk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Harga & Persediaan Stok
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Normal (Rp) *
              </label>
              <input
                type="number"
                required
                min={0}
                placeholder="Contoh: 1500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Harga Diskon / Promo (Rp)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Kosongkan jika tidak ada promo"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jumlah Stok *</label>
              <input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode SKU</label>
              <input
                type="text"
                placeholder="Contoh: GAD-K2PRO-01"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm uppercase font-mono"
              />
            </div>

            {isPhysical && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Berat Produk (Kilogram)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Digital Product Delivery Settings (if digital) */}
        {!isPhysical && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-blue-900 border-b border-blue-100 pb-3 flex items-center gap-2">
              <Binary className="w-4 h-4 text-blue-600" />
              Pengaturan Pemenuhan Produk Digital
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pengiriman Digital
                </label>
                <select
                  value={digitalDeliveryType}
                  onChange={(e) => setDigitalDeliveryType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="INSTANT_DOWNLOAD">Tautan Download Langsung</option>
                  <option value="LICENSE_KEY">Kode Serial / Lisensi Software</option>
                  <option value="MANUAL_EMAIL">Jadwal Sesi / Email Manual</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan File Unduhan (Google Drive / GitHub / Dropbox)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={digitalFileUrl}
                  onChange={(e) => setDigitalFileUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Lisensi / Token Akses Bawaan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: JN-2026-PRO-XXXX"
                value={digitalLicenseKey}
                onChange={(e) => setDigitalLicenseKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono"
              />
            </div>
          </div>
        )}

        {/* Payment Rules & Anti-Loss Protection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 font-serif">
              Aturan Metode Pembayaran & Anti-Loss
            </h2>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
              Proteksi Kerugian Toko
            </span>
          </div>

          {!isPhysical ? (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
              <span className="font-bold shrink-0">🔒 Produk Digital:</span>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                Metode Cash on Delivery (COD) dinonaktifkan secara permanen untuk produk digital demi mencegah pencurian file/lisensi tanpa pembayaran. Pembeli wajib menyelesaikan pembayaran di awal (QRIS / Transfer Bank).
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="allowCod"
                checked={allowCod}
                onChange={(e) => setAllowCod(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded border-stone-300 mt-0.5 cursor-pointer"
              />
              <div>
                <label htmlFor="allowCod" className="text-xs font-bold text-stone-900 cursor-pointer block">
                  Izinkan Metode Pembayaran Cash on Delivery (COD)
                </label>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  Centang opsi ini jika Anda mengizinkan pembeli membayar saat paket diterima. Hilangkan centang jika produk bernilai tinggi atau rawan penipuan/return fiktif.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Image & Featured */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Media & Tampilan Etalase
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Foto Produk Utama (Unsplash / Cloudinary / Direct link)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold text-slate-800 cursor-pointer">
              Tandai sebagai Produk Unggulan di Halaman Utama (Featured)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan Produk..." : "Publikasikan Produk"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
