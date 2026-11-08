"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  Tag,
  Settings,
  FileSpreadsheet,
  LayoutTemplate,
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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      label: "Ringkasan Statistik",
      href: "/admin",
      icon: LayoutDashboard,
      isActive: pathname === "/admin",
    },
    {
      label: "Manajemen Produk",
      href: "/admin/products",
      icon: Package,
      isActive: pathname?.startsWith("/admin/products"),
    },
    {
      label: "Manajemen Pesanan",
      href: "/admin/orders",
      icon: ShoppingBag,
      isActive: pathname?.startsWith("/admin/orders"),
    },
    {
      label: "Kategori Produk",
      href: "/admin/categories",
      icon: FolderTree,
      isActive: pathname?.startsWith("/admin/categories"),
    },
    {
      label: "Daftar Pelanggan",
      href: "/admin/customers",
      icon: Users,
      isActive: pathname?.startsWith("/admin/customers"),
    },
    {
      label: "Kupon & Diskon",
      href: "/admin/coupons",
      icon: Tag,
      isActive: pathname?.startsWith("/admin/coupons"),
    },
    {
      label: "Laporan & Ekspor CSV",
      href: "/admin/reports",
      icon: FileSpreadsheet,
      isActive: pathname?.startsWith("/admin/reports"),
    },
    {
      label: "Konten Beranda (CMS)",
      href: "/admin/settings?tab=hero",
      icon: LayoutTemplate,
      isActive: pathname === "/admin/settings",
    },
    {
      label: "Pengaturan & Kontak",
      href: "/admin/settings?tab=identity",
      icon: Settings,
      isActive: false,
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
      {/* Mobile Top Header for Admin (Visible on mobile/tablet) */}
      <header className="lg:hidden bg-[#1c1917] text-stone-200 border-b border-stone-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-200 font-serif font-bold text-sm">
            JN
          </div>
          <div>
            <span className="font-serif font-bold text-sm text-stone-100 block leading-tight">
              JNshop <span className="text-amber-300">Admin</span>
            </span>
            <span className="text-[10px] text-stone-400 block font-mono">
              {user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white text-xs flex items-center gap-1 border border-stone-700"
            title="Ke Toko"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-stone-800 text-stone-200 hover:text-white border border-stone-700 cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#171412] border-b border-stone-800 p-4 space-y-1 z-30 sticky top-[53px] shadow-xl animate-in slide-in-from-top duration-150">
          <div className="pb-2 mb-2 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1.5 font-medium text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sesi Administrator Aktif</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-stone-400 hover:text-red-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    item.isActive
                      ? "bg-stone-800 text-amber-300 border border-stone-700"
                      : "text-stone-300 hover:bg-stone-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Admin Sidebar (Visible on lg and larger) */}
      <aside className="hidden lg:flex w-64 bg-[#1c1917] text-stone-300 flex-col shrink-0 border-r border-stone-800 min-h-screen">
        {/* Brand header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-200 font-serif font-bold text-base shadow-sm">
              JN
            </div>
            <div>
              <span className="font-serif font-bold text-base tracking-tight text-stone-100 block leading-tight">
                JNshop <span className="text-amber-300">Admin</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-stone-400 font-medium">
                Panel Pemilik Toko
              </span>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-5 py-3.5 border-b border-stone-800/80 bg-stone-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-stone-800 text-amber-200 font-serif font-bold text-xs flex items-center justify-center border border-stone-700 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-stone-200 truncate">{user.name}</p>
              <p className="text-[10px] text-stone-400 truncate font-mono">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  item.isActive
                    ? "bg-stone-800 text-amber-200 font-semibold border border-stone-700/80 shadow-xs"
                    : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.isActive ? "text-amber-300" : "text-stone-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to Customer Storefront & Logout */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-stone-800/70 hover:bg-stone-800 text-stone-300 hover:text-stone-100 text-xs font-medium transition-colors border border-stone-700/60"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Lihat Toko Online</span>
            </span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-stone-400 hover:text-red-400 hover:bg-red-950/20 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
