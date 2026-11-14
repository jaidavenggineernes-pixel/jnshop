import React from "react";
import Link from "next/link";
import {
  Truck,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  CreditCard,
  Mail,
  MapPin,
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
      q: "Bagaimana alur pemesanan di JNshop?",
      a: "Pilih produk fisik atau digital dari katalog, tambahkan ke keranjang, lalu lanjutkan ke halaman checkout. Isi kontak penerima dan pilih metode pembayaran yang tersedia untuk produk tersebut.",
    },
    {
      q: "Bagaimana cara menerima produk digital?",
      a: "Setelah pembayaran dikonfirmasi admin, tautan unduhan dan kode lisensi otomatis aktif di halaman invoice pesanan Anda.",
    },
    {
      q: "Metode pembayaran apa saja yang tersedia?",
      a: "Kami mendukung QRIS nominal tepat, transfer manual Bank BCA dan Bank Mandiri, Virtual Account, serta Cash on Delivery (COD) khusus produk fisik tertentu yang diizinkan toko.",
    },
    {
      q: "Berapa lama verifikasi bukti transfer manual?",
      a: "Unggah foto screenshot bukti transfer langsung di halaman invoice pesanan. Admin akan memverifikasi pada jam operasional (08.00 - 22.00 WIB). Anda juga dapat mengirim konfirmasi melalui WhatsApp.",
    },
    {
      q: "Apakah produk fisik memiliki garansi?",
      a: "Semua produk fisik dilengkapi garansi toko 7 hari sejak barang diterima untuk penggantian unit baru atau pengembalian dana penuh bila terdapat cacat produksi.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-zinc-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-green-800 block">
          Pusat Bantuan {storeTitle}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          Bantuan, Pembayaran & Garansi
        </h1>
        <p className="text-sm text-zinc-600 max-w-2xl leading-relaxed">
          Panduan lengkap alur pemesanan, verifikasi pembayaran QRIS dan transfer bank, pelacakan pengiriman, serta kebijakan retur.
        </p>
      </div>

      {/* Policy Summary Cards with Footer Anchor Targets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          id="panduan-pembayaran"
          className="p-6 rounded-xl bg-white border border-zinc-200 space-y-2.5 scroll-mt-24"
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-sm text-zinc-900">Panduan Pembayaran</h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Gunakan QRIS nominal tepat atau transfer bank BCA/Mandiri, lalu unggah foto bukti bayar langsung di halaman invoice pesanan Anda.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-zinc-200 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-sm text-zinc-900">Pengiriman & Resi</h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Paket fisik dikirim dari Jakarta lewat JNE, SiCepat, atau J&T. Nomor resi otomatis muncul di{" "}
            <Link href="/orders/track" className="font-semibold text-green-800 hover:underline">
              halaman pelacakan
            </Link>
            .
          </p>
        </div>

        <div
          id="kebijakan-retur"
          className="p-6 rounded-xl bg-white border border-zinc-200 space-y-2.5 scroll-mt-24"
        >
          <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-sm text-zinc-900">Garansi & Retur 7 Hari</h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            {storeSetting?.returnPolicy ||
              "Tukar unit baru atau pengembalian dana 100% jika produk fisik tiba dalam keadaan cacat atau tidak sesuai pesanan."}
          </p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 space-y-6">
        <div className="border-b border-zinc-200 pb-4">
          <h2 className="text-xl font-bold text-zinc-900">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Informasi seputar pemesanan, lisensi digital, dan konfirmasi transaksi.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 sm:p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1.5">
              <h3 className="font-bold text-sm text-zinc-900">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Store Policies referenced from Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          id="syarat-ketentuan"
          className="bg-white rounded-xl p-6 border border-zinc-200 space-y-2 scroll-mt-24"
        >
          <h2 className="font-bold text-sm text-zinc-900">Syarat & Ketentuan</h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
            {storeSetting?.termsAndConditions ||
              "Pesanan produk digital bersifat final setelah tautan unduhan atau lisensi diakses. Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelum checkout selesai."}
          </p>
        </div>
        <div
          id="kebijakan-privasi"
          className="bg-white rounded-xl p-6 border border-zinc-200 space-y-2 scroll-mt-24"
        >
          <h2 className="font-bold text-sm text-zinc-900">Kebijakan Privasi</h2>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
            {storeSetting?.privacyPolicy ||
              "Data kontak seperti nama, nomor WhatsApp, alamat kirim, dan email hanya digunakan untuk pemrosesan pesanan, verifikasi QRIS, dan pengiriman invoice."}
          </p>
        </div>
      </div>

      {/* Contact Admin */}
      <div className="bg-zinc-900 text-white rounded-xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-400 block">
            Kontak Langsung Admin
          </span>
          <h2 className="text-2xl font-bold leading-snug">
            Butuh Bantuan Teknis atau Konfirmasi Pesanan?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Hubungi tim {storeTitle} langsung untuk pertanyaan kompatibilitas perangkat, status pengiriman, atau verifikasi pembayaran.
          </p>

          <div className="pt-2 space-y-1.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-400 shrink-0" />
              <span>{storeSetting?.address || "Jakarta, Indonesia"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-400 shrink-0" />
              <span>{storeSetting?.email || "owner@jnshop.com"}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 space-y-3">
          <h3 className="font-bold text-base text-white">WhatsApp Toko</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Jam operasional setiap hari pukul 08.00 - 22.00 WIB.
          </p>
          <a
            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${storeTitle}, saya butuh bantuan terkait produk atau pesanan.`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full min-h-[44px] px-4 rounded-lg bg-green-700 hover:bg-green-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp (+{cleanWa})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
