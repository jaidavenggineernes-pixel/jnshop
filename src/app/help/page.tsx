import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  Truck,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  CreditCard,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HelpPage() {
  const storeSetting = await prisma.storeSetting.findUnique({
    where: { id: "default" },
  });

  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");
  const storeTitle = storeSetting?.storeName || "JNshop";

  const faqs = [
    {
      q: "Bagaimana alur pemesanan produk di JNshop?",
      a: "Pilih produk dari katalog kurasi kami, tentukan jumlah atau varian yang Anda inginkan, lalu klik 'Tambah ke Keranjang' atau 'Beli Sekarang'. Lanjutkan ke pengisian alamat pengiriman dan pilih metode pembayaran resmi.",
    },
    {
      q: "Bagaimana cara pengiriman produk digital?",
      a: "Produk digital (source code, lisensi software resmi, template) dikirimkan seketika setelah pembayaran terverifikasi. Anda dapat langsung mengunduh file dan menyalin kode lisensi dari halaman invoice pesanan Anda.",
    },
    {
      q: "Metode pembayaran apa saja yang diterima?",
      a: "Kami menerima QRIS All Payment (BCA Mobile, Livin, GoPay, OVO, Dana), Transfer Manual BCA & Mandiri, BNI Virtual Account, serta Cash on Delivery (COD) khusus untuk produk fisik tertentu.",
    },
    {
      q: "Bagaimana jika transfer manual saya belum diverifikasi?",
      a: "Pastikan Anda telah mengunggah tautan/foto bukti transfer pada halaman invoice pesanan. Kurator kami akan memverifikasi dalam waktu 10-30 menit pada jam operasional. Anda juga dapat konfirmasi cepat lewat tombol WhatsApp.",
    },
    {
      q: "Apakah produk fisik bergaransi?",
      a: "Ya! Semua produk fisik bergaransi toko 7 hari sejak barang diterima. Jika terdapat cacat produksi atau kerusakan selama perjalanan, Anda dapat mengajukan penggantian unit baru atau pengembalian dana 100%.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-medium text-xs tracking-wide">
          Pusat Bantuan & Layanan Pelanggan
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Ada yang Bisa Kami Bantu?
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Temukan panduan lengkap pemesanan, verifikasi transfer, jaminan garansi retur, dan pengiriman lisensi digital di JNshop.
        </p>
      </div>

      {/* Quick Category Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-sm text-stone-900">Panduan Pembayaran</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Cara scan QRIS, transfer bank lokal, dan cara upload bukti struk pembayaran manual.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-sm text-stone-900">Pengiriman & Resi</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Estimasi waktu tiba, kurir ekspedisi resmi, dan cara melacak posisi paket Anda.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/95 border border-stone-200/90 shadow-sm space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-sm text-stone-900">Garansi & Retur</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Jaminan retur 7 hari uang kembali jika barang cacat produksi serta integritas lisensi digital.
          </p>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="bg-white/95 rounded-2xl p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-xl font-serif font-bold text-stone-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="text-xs text-stone-500 mt-1">
            Informasi lengkap seputar tata kelola transaksi dan kebijakan toko JNshop.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 sm:p-5 rounded-xl bg-stone-50/70 border border-stone-200/70 space-y-2">
              <h4 className="font-serif font-bold text-sm text-stone-900 flex items-baseline gap-2">
                <span className="text-amber-800 font-serif">Q:</span>
                {faq.q}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed pl-5">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & WhatsApp Help */}
      <div className="bg-[#1c1917] text-stone-100 rounded-2xl p-8 sm:p-12 relative overflow-hidden border border-stone-800 shadow-sm">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-stone-800 text-amber-300 text-[10px] font-semibold uppercase tracking-widest border border-stone-700">
              Layanan Langsung Kurator Toko
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 leading-snug">
              Butuh Konsultasi atau Penawaran Custom?
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Kami siap melayani pertanyaan seputar spesifikasi teknis barang, rekomendasi kebutuhan setup meja kerja, hingga kerjasama pengembangan software profesional.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-300" />
                <span>{storeSetting?.address || "Jakarta Selatan, Indonesia"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-300" />
                <span>{storeSetting?.email || "owner@jnshop.com"}</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-900/90 p-6 rounded-xl border border-stone-800 space-y-3.5 text-center md:text-left">
            <h3 className="font-serif font-bold text-base text-stone-100">WhatsApp Personal Kurator</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Respon ramah setiap hari pada jam operasional toko (08.00 - 22.00 WIB).
            </p>
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo Kurator ${storeTitle}, saya ingin berkonsultasi mengenai produk & pesanan.`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp (+{cleanWa})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
