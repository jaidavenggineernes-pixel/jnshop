"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const isHome = pathname === "/";
  const isCatalog = pathname?.startsWith("/products") || pathname?.startsWith("/categories");
  const isCart = pathname === "/cart";
  const isAccount = pathname?.startsWith("/account") || pathname === "/login";

  return (
    <nav
      aria-label="Navigasi Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 min-h-[44px] border-t-2 transition-colors ${
            isHome
              ? "border-green-800 text-green-800 font-semibold"
              : "border-transparent text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] leading-none">Beranda</span>
        </Link>

        <Link
          href="/products"
          className={`flex flex-col items-center justify-center gap-1 min-h-[44px] border-t-2 transition-colors ${
            isCatalog
              ? "border-green-800 text-green-800 font-semibold"
              : "border-transparent text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[11px] leading-none">Katalog</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 min-h-[44px] border-t-2 transition-colors relative ${
            isCart
              ? "border-green-800 text-green-800 font-semibold"
              : "border-transparent text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-green-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none">Keranjang</span>
        </button>

        <Link
          href={user ? "/account" : "/login"}
          className={`flex flex-col items-center justify-center gap-1 min-h-[44px] border-t-2 transition-colors ${
            isAccount
              ? "border-green-800 text-green-800 font-semibold"
              : "border-transparent text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] leading-none">{user ? "Akun" : "Masuk"}</span>
        </Link>
      </div>
    </nav>
  );
}
