"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Heart,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LogOut,
  PackageCheck,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

export function Navbar({
  categories = [],
  storeSetting,
}: {
  categories?: any[];
  storeSetting?: any;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Admin routes render dedicated AdminNav workspace without storefront header
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");
  const bannerText =
    storeSetting?.bannerAnnouncement ||
    "Katalog Workstation & Produk Digital Terkurasi | Voucher Diskon 15%: JNSHOPNEW";
  const storeTitle = storeSetting?.storeName || "JNshop";
  const storeTagline = storeSetting?.tagLine || "Independent Studio";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Studio Announcement Strip */}
      <div className="bg-zinc-900 text-zinc-200 text-xs py-2 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="font-medium tracking-tight text-xs text-zinc-200">
            {bannerText}
          </p>
          <div className="flex items-center gap-4 text-zinc-300 text-xs shrink-0">
            <Link href="/help" className="hover:text-white transition-colors">
              Pusat Bantuan
            </Link>
            <span className="text-zinc-600" aria-hidden="true">/</span>
            <Link href="/orders/track" className="hover:text-white transition-colors">
              Lacak Pesanan
            </Link>
            <span className="text-zinc-600" aria-hidden="true">/</span>
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${storeTitle}, saya ingin bertanya mengenai produk.`)}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-200 hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-green-400" />
              <span>WhatsApp +{cleanWa}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            {/* Brand + Desktop Navigation */}
            <div className="flex items-center gap-6 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 group min-w-0">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0">
                  {storeTitle.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col leading-tight min-w-0">
                  <span className="font-bold text-lg tracking-tight text-zinc-900 truncate">
                    {storeTitle}
                  </span>
                  <span className="hidden sm:block text-[11px] font-medium text-zinc-600 truncate max-w-[220px]">
                    {storeTagline}
                  </span>
                </div>
              </Link>

              <nav aria-label="Kategori Utama" className="hidden lg:flex items-center gap-1 text-sm font-medium">
                <Link
                  href="/products"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === "/products"
                      ? "bg-green-50 text-green-800 font-semibold"
                      : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  Semua Koleksi
                </Link>
                {categories.slice(0, 4).map((cat) => {
                  const active = pathname === `/categories/${cat.slug}`;
                  return (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? "bg-green-50 text-green-800 font-semibold"
                          : "text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100"
                      }`}
                    >
                      {cat.name.split("&")[0].trim()}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm relative">
              <label htmlFor="desktop-search" className="sr-only">
                Cari produk
              </label>
              <input
                id="desktop-search"
                type="text"
                placeholder="Cari produk atau lisensi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:bg-white focus:border-green-800 transition-colors"
              />
              <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/account/wishlist"
                aria-label="Wishlist tersimpan"
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-zinc-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Buka keranjang belanja"
                className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-green-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                    {itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-label="Menu akun pengguna"
                    className="flex items-center gap-2 pl-2 pr-2.5 min-h-[44px] rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white transition-colors"
                  >
                    <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-xs font-semibold text-zinc-900 max-w-[110px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
                  </button>

                  {userDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-zinc-200 py-1.5 z-20">
                        <div className="px-4 py-2.5 border-b border-zinc-100">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
                          <p className="text-xs text-zinc-600 truncate">{user.email}</p>
                          {user.role === "ADMIN" && (
                            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-green-50 text-green-800 border border-green-200 text-[11px] font-semibold">
                              <ShieldCheck className="w-3 h-3" />
                              Admin Pemilik
                            </span>
                          )}
                        </div>

                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-800 hover:bg-green-50 font-semibold border-b border-zinc-100"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Panel Admin</span>
                          </Link>
                        )}

                        <Link
                          href="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50"
                        >
                          <UserIcon className="w-4 h-4 text-zinc-600" />
                          <span>Profil Saya</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50"
                        >
                          <PackageCheck className="w-4 h-4 text-zinc-600" />
                          <span>Pesanan Saya</span>
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50"
                        >
                          <Heart className="w-4 h-4 text-zinc-600" />
                          <span>Wishlist</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-800 hover:bg-red-50 font-medium border-t border-zinc-100 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center justify-center min-h-[40px] px-4 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center min-h-[40px] px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium transition-colors"
                  >
                    Daftar
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
                aria-expanded={mobileMenuOpen}
                className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="md:hidden pb-3 pt-0.5 relative">
            <label htmlFor="mobile-search" className="sr-only">
              Cari produk
            </label>
            <input
              id="mobile-search"
              type="text"
              placeholder="Cari produk atau lisensi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:bg-white focus:border-green-800"
            />
            <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-[22px] -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-zinc-200 px-4 py-4 space-y-1">
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-zinc-900 hover:bg-zinc-100"
            >
              Semua Produk Katalog
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center min-h-[44px] px-3 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100"
              >
                {cat.name}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-zinc-100 space-y-1">
              <Link
                href="/orders/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center min-h-[44px] px-3 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Lacak Pesanan
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center min-h-[44px] px-3 rounded-lg text-sm text-zinc-700 hover:bg-zinc-100"
              >
                Pusat Bantuan & Tanya Jawab
              </Link>
              {!user && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center min-h-[44px] px-3 rounded-lg text-sm font-semibold text-green-800 hover:bg-green-50"
                >
                  Masuk ke Akun
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
