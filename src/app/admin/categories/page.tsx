"use client";

import React, { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("ShoppingBag");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      // ignore network error
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), icon }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat kategori.");
      }

      setName("");
      setDescription("");
      await loadCategories();
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
          Kategori Produk
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">
          Kelompokkan produk fisik dan lisensi digital di katalog JNshop.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-zinc-200 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-800" />
            Tambah Kategori Baru
          </h2>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label htmlFor="cat-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Nama Kategori *
              </label>
              <input
                id="cat-name"
                type="text"
                required
                placeholder="Contoh: Aksesoris Meja"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
              />
            </div>

            <div>
              <label htmlFor="cat-desc" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Deskripsi Singkat
              </label>
              <input
                id="cat-desc"
                type="text"
                placeholder="Penjelasan kategori di halaman koleksi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
              />
            </div>

            <div>
              <label htmlFor="cat-icon" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Ikon Referensi
              </label>
              <select
                id="cat-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
              >
                <option value="ShoppingBag">ShoppingBag (Umum)</option>
                <option value="Binary">Binary (Digital & Code)</option>
                <option value="Laptop">Laptop (Perangkat Keras)</option>
                <option value="MousePointer">MousePointer (Aksesoris)</option>
                <option value="Briefcase">Briefcase (Jasa)</option>
                <option value="Shirt">Shirt (Apparel)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full min-h-[44px] rounded-lg bg-zinc-900 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-5 border-b border-zinc-200 font-bold text-sm text-zinc-900">
            Kategori Aktif ({categories.length})
          </div>

          <div className="divide-y divide-zinc-100 text-xs">
            {categories.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-zinc-900 text-sm block">{c.name}</span>
                  <span className="text-zinc-600 font-mono text-[11px]">slug: {c.slug}</span>
                  {c.description && <p className="text-zinc-600 mt-1">{c.description}</p>}
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 font-semibold text-zinc-900 tabular-nums shrink-0">
                  {c._count?.products || 0} Produk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
