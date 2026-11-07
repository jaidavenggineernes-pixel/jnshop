import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-auto border-t border-slate-900">
      {/* Service Highlights / Value Propositions */}
      <div className="border-b border-slate-800/80 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">100% Produk Original</h4>
                <p className="text-xs text-slate-400">Jaminan keaslian dan lisensi resmi.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Pengiriman Cepat</h4>
                <p className="text-xs text-slate-400">Instant download untuk digital, ekspedisi kilat.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Garansi Retur 7 Hari</h4>
                <p className="text-xs text-slate-400">Klaim mudah jika fisik cacat/rusak.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Bantuan AI & WhatsApp</h4>
                <p className="text-xs text-slate-400">Respon cepat dari tim JNshop.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                JN
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                JN<span className="text-blue-500">shop</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Platform toko online pribadi resmi JNshop. Menjual perangkat gadget berkualitas, kebutuhan workstation ergonomis, produk digital (source code, lisensi software), dan layanan konsultasi web.
            </p>
            <div className="pt-2">
              <span className="text-xs text-slate-500 block mb-1">Hubungi Owner / Admin:</span>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <span>WhatsApp: +62 812-3456-7890</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Kategori Pilihan</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/categories/produk-digital-lisensi" className="hover:text-white transition-colors">
                  Produk Digital & Lisensi
                </Link>
              </li>
              <li>
                <Link href="/categories/elektronik-gadget" className="hover:text-white transition-colors">
                  Elektronik & Gadget
                </Link>
              </li>
              <li>
                <Link href="/categories/aksesoris-workspace" className="hover:text-white transition-colors">
                  Aksesoris & Workspace
                </Link>
              </li>
              <li>
                <Link href="/categories/jasa-layanan-profesional" className="hover:text-white transition-colors">
                  Jasa & Layanan
                </Link>
              </li>
              <li>
                <Link href="/categories/merchandise-fashion" className="hover:text-white transition-colors">
                  Merchandise & Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Bantuan & Layanan</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Pusat Bantuan & FAQ
                </Link>
              </li>
              <li>
                <Link href="/orders/track" className="hover:text-white transition-colors">
                  Lacak Pengiriman Pesanan
                </Link>
              </li>
              <li>
                <Link href="/help#panduan-pembayaran" className="hover:text-white transition-colors">
                  Panduan Pembayaran
                </Link>
              </li>
              <li>
                <Link href="/help#kebijakan-retur" className="hover:text-white transition-colors">
                  Kebijakan Pengembalian
                </Link>
              </li>
              <li>
                <Link href="/help#syarat-ketentuan" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Metode Pembayaran</h4>
            <p className="text-xs text-slate-400 mb-3">
              Didukung oleh sistem pembayaran digital terpercaya dan transfer bank resmi.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                QRIS
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                Bank BCA
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                Bank Mandiri
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                BNI VA
              </span>
              <span className="bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                COD
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              Sistem Enkripsi Transaksi Aman
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JNshop Platform. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="/help#kebijakan-privasi" className="hover:text-slate-400">
              Kebijakan Privasi
            </Link>
            <Link href="/help#syarat-ketentuan" className="hover:text-slate-400">
              Ketentuan Layanan
            </Link>
            <Link href="/admin" className="hover:text-slate-400">
              Area Pemilik Toko
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
