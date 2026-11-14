"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Tag,
  Settings,
  FileSpreadsheet,
  CreditCard,
  ArrowLeft,
  ExternalLink,
  Menu,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { UserSession } from "@/types";

interface AdminNavProps {
  user: UserSession;
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Ringkasan",
      href: "/admin",
      icon: LayoutDashboard,
      isActive: pathname === "/admin",
    },
    {
      label: "Produk & Arsip",
      href: "/admin/products",
      icon: Package,
      isActive: pathname?.startsWith("/admin/products"),
    },
    {
      label: "Pesanan & Verifikasi",
      href: "/admin/orders",
      icon: ShoppingBag,
      isActive: pathname?.startsWith("/admin/orders"),
    },
    {
      label: "Kategori",
      href: "/admin/categories",
      icon: FolderTree,
      isActive: pathname?.startsWith("/admin/categories"),
    },
    {
      label: "Aturan Pembayaran",
      href: "/admin/payments",
      icon: CreditCard,
      isActive: pathname?.startsWith("/admin/payments"),
    },
    {
      label: "Pelanggan",
      href: "/admin/customers",
      icon: Users,
      isActive: pathname?.startsWith("/admin/customers"),
    },
    {
      label: "Kupon Diskon",
      href: "/admin/coupons",
      icon: Tag,
      isActive: pathname?.startsWith("/admin/coupons"),
    },
    {
      label: "Laporan & CSV",
      href: "/admin/reports",
      icon: FileSpreadsheet,
      isActive: pathname?.startsWith("/admin/reports"),
    },
    {
      label: "Konten & Pengaturan Toko",
      href: "/admin/settings",
      icon: Settings,
      isActive: pathname?.startsWith("/admin/settings"),
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* Mobile Admin Header */}
      <header className="lg:hidden bg-zinc-950 text-zinc-200 border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs">
            JN
          </div>
          <div>
            <span className="font-bold text-sm text-white block leading-tight">
              JNshop Admin
            </span>
            <span className="text-[11px] text-zinc-400 block font-mono">
              {user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            aria-label="Kembali ke Toko"
            className="w-11 h-11 rounded-lg bg-zinc-900 text-zinc-200 hover:text-white flex items-center justify-center border border-zinc-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu admin" : "Buka menu admin"}
            aria-expanded={mobileMenuOpen}
            className="w-11 h-11 rounded-lg bg-zinc-900 text-zinc-200 hover:text-white flex items-center justify-center border border-zinc-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 p-4 space-y-3 z-30 sticky top-[69px]">
          <div className="pb-2.5 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
            <span className="flex items-center gap-1.5 font-semibold text-green-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Aktif</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-zinc-300 hover:text-red-400 font-semibold flex items-center gap-1.5 min-h-[36px] px-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 min-h-[44px] px-3 rounded-lg text-xs font-medium transition-colors ${
                    item.isActive
                      ? "bg-green-800 text-white"
                      : "bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-zinc-950 text-zinc-300 flex-col shrink-0 border-r border-zinc-800 min-h-screen">
        <div className="p-5 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-sm">
            JN
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block leading-tight">
              JNshop Admin
            </span>
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Panel Pemilik
            </span>
          </div>
        </div>

        <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-zinc-800 text-white font-bold text-xs flex items-center justify-center border border-zinc-700 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-zinc-400 truncate font-mono">{user.email}</p>
            </div>
          </div>
        </div>

        <nav aria-label="Menu Admin" className="flex-1 p-3.5 space-y-1 overflow-y-auto text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 min-h-[40px] px-3.5 rounded-lg transition-colors ${
                  item.isActive
                    ? "bg-green-800 text-white font-semibold"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            href="/"
            className="w-full min-h-[40px] flex items-center justify-between px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Toko Online</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full min-h-[40px] flex items-center gap-2 px-3.5 rounded-lg text-zinc-300 hover:text-red-300 hover:bg-red-950/30 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
