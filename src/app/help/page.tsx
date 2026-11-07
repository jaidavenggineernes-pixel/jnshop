import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  CreditCard,
  Send,
  Mail,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";


export default async function HelpPage() {
  const storeSetting = await prisma.storeSetting.findUnique({
    where: { id: "default" },
  });

  const faqs = [
    {
      q: "Bagaimana cara memesan produk di JNshop?",
      a: "Pilih produk yang Anda inginkan dari katalog, tentukan varian atau jumlahnya, klik 'Tambah ke Keranjang' atau 'Beli Sekarang', lalu isi alamat pengiriman dan pilih metode pembayaran resmi.",
    },
    {
      q: "Bagaimana cara pengiriman produk digital?",
      a: "Produk digital (source code, lisensi software, e-book) dikirimkan seketika setelah pembayaran terverifikasi. Anda dapat langsung mengunduh file dan menyalin kode lisensi dari halaman invoice pesanan Anda.",
    },
    {
      q: "Metode pembayaran apa saja yang diterima?",
      a: "Kami menerima QRIS All Payment (BCA Mobile, Livin, GoPay, OVO, Dana), Transfer Manual BCA & Mandiri, BNI Virtual Account, serta COD (Cash on Delivery) untuk produk fisik.",
    },
    {
      q: "Bagaimana jika pembayaran transfer manual saya belum dikonfirmasi?",
      a: "Pastikan Anda telah mengunggah bukti transfer pada halaman invoice pesanan Anda. Admin kami akan memverifikasi dalam waktu 10-30 menit pada jam kerja. Anda juga dapat konfirmasi cepat lewat tombol WhatsApp.",
    },
    {
      q: "Apakah produk fisik bergaransi?",
      a: "Ya! Semua produk fisik bergaransi resmi toko 7 hari sejak barang diterima. Jika cacat pabrik atau rusak saat perjalanan, Anda dapat mengajukan penggantian unit baru dengan melampirkan video unboxing.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-wider">
          Pusat Bantuan Pelanggan
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Ada yang Bisa Kami Bantu?
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Temukan jawaban seputar pemesanan, verifikasi pembayaran, pengiriman fisik dan lisensi digital di JNshop.
        </p>
      </div>

      {/* Quick Category Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Panduan Pembayaran</h3>
          <p className="text-xs text-slate-500">
            Cara scan QRIS, transfer bank, dan cara upload bukti struk pembayaran manual.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Pengiriman & Resi</h3>
          <p className="text-xs text-slate-500">
            Estimasi waktu tiba, kurir ekspedisi resmi, dan cara melacak posisi paket Anda.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Garansi & Retur</h3>
          <p className="text-xs text-slate-500">
            Kebijakan retur barang cacat produksi dalam 7 hari dan jaminan lisensi digital.
          </p>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Informasi lengkap seputar operasional dan kebijakan toko online JNshop.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="text-blue-600">Q:</span>
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & WhatsApp Help */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              Layanan Langsung Pemilik Toko
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              Butuh Bantuan Mendesak atau Penawaran Custom?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tim JNshop siap melayani pertanyaan seputar ketersediaan produk, konsultasi arsitektur web, pengiriman kilat, hingga kerjasama proyek secara langsung.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{storeSetting?.address || "Jakarta, Indonesia"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{storeSetting?.email || "owner@jnshop.com"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/15 space-y-4 text-center md:text-left">
            <h3 className="font-bold text-base text-white">Hubungi Admin via WhatsApp</h3>
            <p className="text-xs text-blue-100">
              Respon cepat setiap hari pada jam operasional toko (08.00 - 22.00 WIB).
            </p>
            <a
              href={`https://wa.me/${storeSetting?.whatsappNumber || "6281234567890"}?text=Halo%20Admin%20JNshop,%20saya%20ingin%20bertanya`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp (+{storeSetting?.whatsappNumber || "6281234567890"})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
