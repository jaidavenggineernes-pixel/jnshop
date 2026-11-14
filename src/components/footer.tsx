"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";

export function Footer({ storeSetting }: { storeSetting?: any }) {
  const pathname = usePathname();

  // Admin routes render dedicated workspace without storefront footer
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const storeTitle = storeSetting?.storeName || "JNshop";
  const storeTagline = storeSetting?.tagLine || "Independent Studio";
  const storeDesc =
    storeSetting?.description ||
    "Katalog independen perlengkapan workstation, aksesori meja kerja, perangkat lunak resmi, dan produk digital siap pakai.";
  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");
  const phoneDisplay =
    storeSetting?.phone || (cleanWa ? `+${cleanWa}` : "+62 851-9121-9129");
  const email = storeSetting?.email || "owner@jnshop.com";
  const address = storeSetting?.address || "Jakarta, Indonesia";

  return (
    <footer className="bg-zinc-950 text-zinc-300 text-sm mt-auto border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Direct Contact */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-xs tracking-tight">
                {storeTitle.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-base text-white tracking-tight">
                  {storeTitle}
                </span>
                <span className="text-[11px] font-medium text-zinc-400">
                  {storeTagline}
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-zinc-300">
              {storeDesc}
            </p>

            <div className="text-xs space-y-1.5 text-zinc-300 pt-1">
              <p>{address}</p>
              <p>Email: {email}</p>
              <p>Telepon / WA: {phoneDisplay}</p>
            </div>
          </div>

          {/* Katalog Produk */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-tight">
              Katalog Produk
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Semua Produk
                </Link>
              </li>
              <li>
                <Link href="/products?type=physical" className="hover:text-white transition-colors">
                  Perangkat Fisik
                </Link>
              </li>
              <li>
                <Link href="/products?type=digital" className="hover:text-white transition-colors">
                  Produk Digital & Lisensi
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="hover:text-white transition-colors">
                  Pilihan Utama
                </Link>
              </li>
              <li>
                <Link href="/categories/ergonomics-desk-setup" className="hover:text-white transition-colors">
                  Ergonomi & Meja Kerja
                </Link>
              </li>
            </ul>
          </div>

          {/* Bantuan & Informasi */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-tight">
              Layanan & Bantuan
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Pusat Bantuan & FAQ
                </Link>
              </li>
              <li>
                <Link href="/orders/track" className="hover:text-white transition-colors">
                  Lacak Pesanan
                </Link>
              </li>
              <li>
                <Link href="/help#panduan-pembayaran" className="hover:text-white transition-colors">
                  Panduan Pembayaran
                </Link>
              </li>
              <li>
                <Link href="/help#kebijakan-retur" className="hover:text-white transition-colors">
                  Ketentuan Retur & Garansi
                </Link>
              </li>
              <li>
                <Link href="/help#syarat-ketentuan" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Metode Pembayaran */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-tight">
              Pembayaran Didukung
            </h3>
            <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
              Mendukung QRIS terverifikasi, transfer Virtual Account, transfer bank manual, serta COD untuk produk fisik tertentu.
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {["QRIS", "BCA", "Mandiri", "BNI VA", "COD"].map((method) => (
                <span
                  key={method}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-200 px-2.5 py-1 rounded-md font-medium"
                >
                  {method}
                </span>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2 text-xs text-green-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Transaksi Diverifikasi Admin</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} {storeTitle}. Jakarta, Indonesia.</p>
          <div className="flex items-center gap-6">
            <Link href="/help#kebijakan-privasi" className="hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/help#syarat-ketentuan" className="hover:text-white transition-colors">
              Ketentuan Layanan
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Panel Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
