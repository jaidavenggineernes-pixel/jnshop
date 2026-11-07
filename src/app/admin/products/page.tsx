import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { Package, Plus, Search, Tag, Trash2, Edit, CheckCircle, XCircle } from "lucide-react";


export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { take: 1 },
      variants: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Produk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola katalog produk fisik, produk digital, lisensi, dan varian barang di JNshop ({products.length} item).
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Harga & Diskon</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {products.map((p) => {
                const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&auto=format&fit=crop&q=80";
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img src={img} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 text-sm block line-clamp-1">
                          {p.name}
                        </span>
                        {p.sku && <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 font-semibold">
                      {p.category.name}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.isPhysical ? "bg-slate-100 text-slate-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {p.isPhysical ? "Fisik" : "Digital"}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div>{formatRupiah(p.discountPrice || p.price)}</div>
                      {p.discountPrice && (
                        <div className="text-[10px] text-slate-400 line-through">
                          {formatRupiah(p.price)}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`font-black ${
                          p.stock <= 5 ? "text-red-600" : p.stock <= 15 ? "text-amber-600" : "text-slate-800"
                        }`}
                      >
                        {p.stock} unit
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Disembunyikan</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-block px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                      >
                        Lihat
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
