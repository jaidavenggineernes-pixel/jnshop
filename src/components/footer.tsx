import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

export function Footer({ storeSetting }: { storeSetting?: any }) {
  const storeTitle = storeSetting?.storeName || "JNshop";
  const storeTagline = storeSetting?.tagLine || "Boutique & Atelier";
  const storeDesc =
    storeSetting?.description ||
    "Ruang belanja mandiri dengan kurasi peralatan meja kerja ergonomis, gawai pilihan, serta aset digital berkualitas tinggi yang dibuat dengan rasa dan dedikasi penuh.";
  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");
  const phoneDisplay =
    storeSetting?.phone || (cleanWa ? `+${cleanWa}` : "+62 851-9121-9129");
  const email = storeSetting?.email || "owner@jnshop.com";
  const address = storeSetting?.address || "Jakarta, Indonesia";

  return (
    <footer className="bg-[#1c1917] text-stone-400 text-sm mt-auto border-t border-stone-800/80">
      {/* Human Commitments / Boutique Value Propositions */}
      <div className="border-b border-stone-800/80 bg-[#171412]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800/80 text-amber-300 border border-stone-700/60 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-100 text-sm font-serif tracking-tight">
                  Kurasi Penuh Dedikasi
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  Semua barang fisik & kode digital diuji langsung oleh kurator kami.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800/80 text-amber-300 border border-stone-700/60 shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-100 text-sm font-serif tracking-tight">
                  Pengiriman & Akses Aman
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  Packing rapi dan aman, lisensi digital langsung terkirim seketika.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800/80 text-amber-300 border border-stone-700/60 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-100 text-sm font-serif tracking-tight">
                  Garansi Retur 7 Hari
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  Jaminan uang kembali tanpa berbelit jika barang tidak sesuai deskripsi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-stone-800/80 text-amber-300 border border-stone-700/60 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-100 text-sm font-serif tracking-tight">
                  {storeTitle} Concierge
                </h4>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  Asisten belanja cerdas & jalur WhatsApp personal langsung ke kurator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-200 font-serif font-bold text-sm">
                {storeTitle.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg tracking-tight text-stone-100 font-bold">
                  {storeTitle}
                </span>
                <span className="text-[10px] tracking-widest uppercase font-medium text-amber-400/80">
                  {storeTagline}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm">
              {storeDesc}
            </p>
            <div className="pt-2 space-y-1.5 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-stone-500">Alamat:</span>
                <span className="text-stone-300">{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-stone-500">Email:</span>
                <a href={`mailto:${email}`} className="text-stone-300 hover:text-amber-200 transition-colors">
                  {email}
                </a>
              </div>
              <div className="pt-1">
                <span className="text-stone-500 block mb-1">WhatsApp Resmi & Konsultasi:</span>
                <a
                  href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${storeTitle}, saya ingin bertanya mengenai produk dan pesanan.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                >
                  <span>WhatsApp: {phoneDisplay}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-stone-200 font-serif font-semibold mb-4 text-sm tracking-wide">
              Koleksi & Kategori
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/products" className="hover:text-amber-200 transition-colors">
                  Katalog Lengkap
                </Link>
              </li>
              <li>
                <Link href="/categories/produk-digital-lisensi" className="hover:text-amber-200 transition-colors">
                  Produk Digital & Lisensi
                </Link>
              </li>
              <li>
                <Link href="/categories/elektronik-gadget" className="hover:text-amber-200 transition-colors">
                  Elektronik & Gadget
                </Link>
              </li>
              <li>
                <Link href="/categories/aksesoris-workspace" className="hover:text-amber-200 transition-colors">
                  Aksesoris & Workspace
                </Link>
              </li>
              <li>
                <Link href="/categories/jasa-layanan-profesional" className="hover:text-amber-200 transition-colors">
                  Jasa & Layanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-stone-200 font-serif font-semibold mb-4 text-sm tracking-wide">
              Layanan Pelanggan
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/help" className="hover:text-amber-200 transition-colors">
                  Pusat Bantuan & Tanya Jawab
                </Link>
              </li>
              <li>
                <Link href="/orders/track" className="hover:text-amber-200 transition-colors">
                  Lacak Paket Pesanan
                </Link>
              </li>
              <li>
                <Link href="/help#panduan-pembayaran" className="hover:text-amber-200 transition-colors">
                  Panduan Pembayaran
                </Link>
              </li>
              <li>
                <Link href="/help#kebijakan-retur" className="hover:text-amber-200 transition-colors">
                  Ketentuan Retur & Garansi
                </Link>
              </li>
              <li>
                <Link href="/help#syarat-ketentuan" className="hover:text-amber-200 transition-colors">
                  Syarat & Ketentuan Belanja
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h4 className="text-stone-200 font-serif font-semibold mb-4 text-sm tracking-wide">
              Metode Pembayaran
            </h4>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Menerima pembayaran instan QRIS, Virtual Account, dan transfer bank manual.
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="bg-stone-900 border border-stone-800 text-stone-300 px-2.5 py-1 rounded-md font-medium">
                QRIS
              </span>
              <span className="bg-stone-900 border border-stone-800 text-stone-300 px-2.5 py-1 rounded-md font-medium">
                BCA
              </span>
              <span className="bg-stone-900 border border-stone-800 text-stone-300 px-2.5 py-1 rounded-md font-medium">
                Mandiri
              </span>
              <span className="bg-stone-900 border border-stone-800 text-stone-300 px-2.5 py-1 rounded-md font-medium">
                BNI VA
              </span>
              <span className="bg-stone-900 border border-stone-800 text-stone-300 px-2.5 py-1 rounded-md font-medium">
                COD
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Transaksi Terenkripsi Aman</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-stone-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {storeTitle}. Dibuat dengan dedikasi penuh di Indonesia.</p>
          <div className="flex items-center gap-6">
            <Link href="/help#kebijakan-privasi" className="hover:text-stone-400 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/help#syarat-ketentuan" className="hover:text-stone-400 transition-colors">
              Ketentuan Layanan
            </Link>
            <Link href="/admin" className="hover:text-stone-400 transition-colors">
              Area Pemilik Toko
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
