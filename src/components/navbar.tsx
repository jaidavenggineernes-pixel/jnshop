"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  LogOut,
  PackageCheck,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export function Navbar({ categories = [] }: { categories?: any[] }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top Editorial Announcement Bar */}
      <div className="bg-[#1c1917] text-stone-300 text-xs py-2 px-4 border-b border-stone-850">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="flex items-center justify-center gap-1.5 font-medium tracking-wide text-[11px] sm:text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>
              Koleksi Alat Kerja & Solusi Digital Terkurasi • Pengiriman dari Jakarta • Voucher 15%: <strong className="text-amber-300 tracking-wider font-mono">JNSHOPNEW</strong>
            </span>
          </p>
          <div className="flex items-center gap-4 text-stone-400 text-xs">
            <Link href="/help" className="hover:text-stone-200 transition-colors">
              Pusat Bantuan
            </Link>
            <span className="text-stone-700">|</span>
            <Link href="/orders/track" className="hover:text-stone-200 transition-colors">
              Lacak Pesanan
            </Link>
            <span className="text-stone-700">|</span>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noreferrer"
              className="text-stone-300 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#faf9f6]/95 backdrop-blur-md border-b border-stone-200/90 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#1c1917] text-[#faf9f6] flex items-center justify-center font-bold text-lg shadow-sm border border-stone-800 group-hover:scale-102 transition-transform">
                  JN
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-[#1c1917]">
                    JN<span className="text-stone-500 font-normal">shop</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-semibold text-stone-400">
                    Boutique & Atelier
                  </span>
                </div>
              </Link>

              {/* Desktop Categories Links */}
              <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-stone-600">
                <Link
                  href="/products"
                  className="px-3 py-2 rounded-xl hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Semua Koleksi
                </Link>
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="px-3 py-2 rounded-xl hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  >
                    {cat.name.split("&")[0].trim()}
                  </Link>
                ))}
              </div>
            </div>

            {/* Human Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari keyboard, stand laptop, lisensi digital..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-100/90 border border-stone-200/80 text-stone-900 text-sm rounded-full pl-10 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all placeholder:text-stone-400 placeholder:text-xs"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Wishlist Button */}
              <Link
                href="/account/wishlist"
                className="relative p-2.5 rounded-xl text-stone-600 hover:text-red-500 hover:bg-stone-100 transition-colors"
                title="Favorit Saya"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                title="Keranjang Belanja"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#1c1917] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Menu / Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-all text-sm font-medium text-stone-700 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-800 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 text-sm animate-fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-stone-900 truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                        {user.role === "ADMIN" && (
                          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-800">
                            Pemilik Toko / Admin
                          </span>
                        )}
                      </div>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-stone-900 hover:bg-stone-50 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-stone-500" />
                          Dashboard Pengelola
                        </Link>
                      )}

                      <Link
                        href="/account/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        <PackageCheck className="w-4 h-4 text-stone-400" />
                        Pesanan Saya
                      </Link>

                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        <UserIcon className="w-4 h-4 text-stone-400" />
                        Profil Akun
                      </Link>

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 text-left font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-[#faf9f6] bg-[#1c1917] hover:bg-stone-800 rounded-xl shadow-xs transition-all"
                  >
                    Daftar
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari perlengkapan meja kerja, software..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-100 border border-stone-200 text-stone-900 text-xs rounded-full pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white"
                />
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-3 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-[#faf9f6] px-4 pt-4 pb-6 space-y-4">
            <div className="font-bold text-[10px] text-stone-400 uppercase tracking-widest">
              Koleksi & Kategori Toko
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold hover:border-stone-400"
              >
                Semua Koleksi
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold hover:border-stone-400 truncate"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-stone-200/80 pt-3 flex flex-col gap-2 text-xs">
              <Link
                href="/orders/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-stone-700 py-1.5 font-medium"
              >
                <PackageCheck className="w-4 h-4 text-stone-500" />
                Lacak Pengiriman Pesanan
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-stone-700 py-1.5 font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-stone-500" />
                Garansi Retur 7 Hari & FAQ
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
