import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Tag,
  Settings,
  FileSpreadsheet,
  ArrowLeft,
  ShieldAlert,
  Bell,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  if (session.role !== "ADMIN") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Akses Ditolak (403)</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman ini khusus untuk Pemilik Toko / Administrator JNshop. Anda saat ini login sebagai pelanggan ({session.email}).
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Kembali ke Toko
            </Link>
            <Link
              href="/login"
              className="py-2 px-4 rounded-xl text-blue-600 font-semibold text-xs hover:underline"
            >
              Ganti Akun ke Admin (admin@jnshop.com)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
              JN
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                JNshop <span className="text-blue-400">Admin</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Owner Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto text-xs font-semibold">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-blue-400" />
            <span>Ringkasan Statistik</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Package className="w-4 h-4 text-indigo-400" />
            <span>Manajemen Produk</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Manajemen Pesanan</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FolderTree className="w-4 h-4 text-amber-400" />
            <span>Kategori Produk</span>
          </Link>

          <Link
            href="/admin/customers"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Daftar Pelanggan</span>
          </Link>

          <Link
            href="/admin/coupons"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Tag className="w-4 h-4 text-pink-400" />
            <span>Kupon & Diskon</span>
          </Link>

          <Link
            href="/admin/reports"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
            <span>Laporan & Ekspor CSV</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Pengaturan Toko</span>
          </Link>
        </nav>

        {/* Back to Customer Storefront */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Toko Online</span>
            </span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
