"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Grid,
  ShoppingBag,
  Heart,
  User,
  Sparkles,
  PackageCheck,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useAuth } from "@/lib/auth-context";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user } = useAuth();

  // Don't display in admin dashboard
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleOpenAI = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("jnshop-open-ai", {
          detail: { prompt: "Halo JNshop AI! Rekomendasikan produk terbaik atau bantu saya berbelanja hari ini." },
        })
      );
    }
  };

  const navItems = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Katalog",
      href: "/products",
      icon: Grid,
      isActive: pathname?.startsWith("/products") || pathname?.startsWith("/categories"),
    },
    {
      label: "Tanya AI",
      onClick: handleOpenAI,
      isSpecial: true,
    },
    {
      label: "Keranjang",
      onClick: () => setIsCartOpen(true),
      icon: ShoppingBag,
      badge: itemCount,
      isActive: pathname === "/cart",
    },
    {
      label: user ? "Akun" : "Masuk",
      href: user ? "/account" : "/login",
      icon: User,
      isActive: pathname?.startsWith("/account") || pathname === "/login" || pathname === "/register",
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] sm:hidden px-3 py-1.5 pb-safe"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item, index) => {
          if (item.isSpecial) {
            return (
              <button
                key="special-ai"
                onClick={item.onClick}
                className="flex flex-col items-center justify-center -mt-5 group cursor-pointer focus:outline-none"
                title="Buka JNshop AI Shopping Assistant"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 group-active:scale-95 transition-transform border-2 border-white">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 mt-1">
                  Tanya AI
                </span>
              </button>
            );
          }

          const Icon = item.icon!;
          const content = (
            <div className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all">
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    item.isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-800"
                  }`}
                />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-colors ${
                  item.isActive
                    ? "font-extrabold text-blue-600"
                    : "font-medium text-slate-500 group-hover:text-slate-800"
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="group focus:outline-none cursor-pointer"
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={index} href={item.href!} className="group focus:outline-none">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
