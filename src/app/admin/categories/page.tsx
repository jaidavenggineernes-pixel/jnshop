"use client";

import React, { useState, useEffect } from "react";
import { FolderTree, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

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
      // fallback
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
        throw new Error(data.error || "Gagal membuat kategori");
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Kategori Produk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola struktur kategori untuk mengelompokkan produk fisik dan digital di JNshop.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Add Category */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Tambah Kategori Baru
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kategori *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Aksesoris Gaming"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Singkat
              </label>
              <input
                type="text"
                placeholder="Deskripsi kategori untuk SEO dan etalase"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Icon</label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="ShoppingBag">ShoppingBag (Umum)</option>
                <option value="Binary">Binary (Digital & Code)</option>
                <option value="Laptop">Laptop (Gadget & Komputer)</option>
                <option value="MousePointer">MousePointer (Aksesoris)</option>
                <option value="Briefcase">Briefcase (Jasa & Layanan)</option>
                <option value="Shirt">Shirt (Fashion & Apparel)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{loading ? "Menyimpan..." : "Simpan Kategori"}</span>
            </button>
          </form>
        </div>

        {/* Existing Categories Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 font-bold text-sm text-slate-900">
            Daftar Kategori Aktif ({categories.length})
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {categories.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{c.name}</span>
                  <span className="text-slate-400 font-mono text-[11px]">slug: {c.slug}</span>
                  {c.description && <p className="text-slate-500 mt-0.5">{c.description}</p>}
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-700">
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
