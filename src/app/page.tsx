import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Binary,
  Laptop,
  MousePointer,
  Briefcase,
  Shirt,
  Star,
  CheckCircle2,
  RotateCcw,
  Package,
  HeartHandshake,
  MessageCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, latestProducts, categories, coupons, storeSetting] =
    await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: "asc" } },
          variants: true,
        },
        take: 8,
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: "asc" } },
          variants: true,
        },
        take: 8,
      }),
      prisma.category.findMany({
        orderBy: { displayOrder: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      }),
      prisma.coupon.findMany({
        where: { isActive: true },
        take: 3,
      }),
      prisma.storeSetting.findUnique({
        where: { id: "default" },
      }),
    ]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-24">
      {/* 1. EDITORIAL BOUTIQUE HERO SECTION */}
      <section className="relative overflow-hidden bg-[#f4f2ec] border-b border-stone-200/80 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-200/80 border border-stone-300 text-stone-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Kurasi Khusus • Toko Pribadi & Digital Studio</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
                Peralatan kerja pilihan & aset digital siap pakai,{" "}
                <span className="text-stone-500 font-normal italic">
                  dibuat dengan rasa & dedikasi.
                </span>
              </h1>

              <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Selamat datang di <strong>JNshop</strong>. Toko independen yang menyediakan workstation ergonomis, periferal berkualitas, dan software boilerplate yang saya uji dan pakai sendiri dalam proyek nyata.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#1c1917] hover:bg-stone-800 text-[#faf9f6] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Lihat Seluruh Koleksi</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/categories/produk-digital-lisensi"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm border border-stone-300 transition-all text-center cursor-pointer"
                >
                  ⚡ Produk Digital & Lisensi
                </Link>
              </div>

              {/* Genuine Human Guarantees */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-stone-200 text-left">
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-stone-900">Garansi 7 Hari</div>
                  <div className="text-[11px] text-stone-500 leading-tight">Retur ganti baru / refund</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-stone-900">0 Detik</div>
                  <div className="text-[11px] text-stone-500 leading-tight">Lisensi digital langsung aktif</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-extrabold text-stone-900">Personal</div>
                  <div className="text-[11px] text-stone-500 leading-tight">Dukungan pemilik toko</div>
                </div>
              </div>
            </div>

            {/* Right Curated Flagship Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Rekomendasi Minggu Ini
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-400">Kurasi Edisi 2026</span>
                </div>

                {/* Spotlight item preview */}
                <div className="space-y-3">
                  <div className="aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 relative group">
                    <img
                      src="https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
                      alt="Keychron K2 Pro"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#1c1917]/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold">
                      Keychron K2 Pro • Hot-Swap
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">
                        Workstation Setup Terpopuler
                      </h4>
                      <p className="text-xs text-stone-500">
                        Mekanikal keyboard & stand laptop aluminium 360°
                      </p>
                    </div>
                    <Link
                      href="/products"
                      className="text-xs font-bold text-stone-800 hover:text-stone-600 underline"
                    >
                      Buka Detail →
                    </Link>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-600">Butuh panduan sebelum membeli?</span>
                  <a
                    href={`https://wa.me/${(storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "")}?text=${encodeURIComponent(`Halo Kurator ${storeSetting?.storeName || "JNshop"}, saya ingin berkonsultasi mengenai setup & produk.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Tanya Owner ({storeSetting?.phone || "+62 851-9121-9129"})</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE QUICK CATEGORIES STRIP */}
      <div className="lg:hidden px-4 -mt-10 relative z-20">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
            <span>Kategori Pilihan</span>
            <Link href="/products" className="text-stone-500 font-semibold text-[11px]">
              Semua →
            </Link>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <Link
              href="/products"
              className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-bold whitespace-nowrap shrink-0"
            >
              🔥 Semua Produk
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700 font-medium whitespace-nowrap border border-stone-200 shrink-0 hover:bg-stone-200"
              >
                {c.name.split("&")[0].trim()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CATATAN KURATOR / PEMILIK TOKO */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#f7f6f2] border border-stone-200/90 text-stone-800 relative">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1c1917] text-[#faf9f6] flex items-center justify-center font-bold text-lg shrink-0">
              JN
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Catatan dari Pemilik Toko
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-stone-700 font-normal italic">
                &ldquo;Saya membangun JNshop karena ingin ada toko online yang mengutamakan kualitas nyata daripada sekadar menjual banyak barang murah yang mengecewakan. Setiap barang fisik di toko ini kami periksa kondisinya, dan setiap template kode dirancang untuk standar kerja riil.&rdquo;
              </p>
              <div className="text-xs font-bold text-stone-900 pt-1">
                — Pemilik & Pengelola JNshop Jakarta
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROMO VOUCHER BERMAKNA */}
      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1c1917] text-[#faf9f6] rounded-3xl p-6 sm:p-10 border border-stone-800 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-stone-800 text-amber-300 text-xs font-bold tracking-wider uppercase">
                  Apresiasi Belanja
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Voucher Diskon Spesial Untuk Anda
                </h3>
                <p className="text-sm text-stone-400 max-w-xl">
                  Gunakan kode voucher ini pada halaman keranjang atau checkout untuk menikmati potongan harga langsung pada pesanan Anda.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-stone-850 border border-stone-700/80 rounded-2xl p-4 text-center min-w-[140px]"
                  >
                    <div className="text-[10px] text-stone-400 uppercase font-semibold">Kode Voucher</div>
                    <div className="text-base font-black tracking-wider text-amber-300 font-mono my-0.5">
                      {coupon.code}
                    </div>
                    <div className="text-xs text-stone-300 font-medium">
                      {coupon.type === "PERCENTAGE"
                        ? `Diskon ${coupon.value}%`
                        : `Potongan Rp ${coupon.value.toLocaleString("id-ID")}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS (PRODUK UNGGULAN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Pilihan Editor
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Produk Unggulan JNshop
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1 group"
          >
            <span>Semua Produk Unggulan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. DUA PILAR JNSHOP (FISIK VS DIGITAL) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pilar Digital */}
          <div className="bg-[#f7f6f2] p-8 sm:p-10 rounded-3xl border border-stone-200/90 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md inline-block">
                Digital Atelier
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                Software Boilerplate & Desain Sistem
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Source code Next.js produksi, Figma component library siap pakai, dan lisensi software legal. Dikirimkan otomatis ke email dan dashboard akun Anda seketika setelah pembayaran.
              </p>
            </div>
            <div>
              <Link
                href="/categories/produk-digital-lisensi"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-900 hover:text-stone-700 underline"
              >
                <span>Lihat Koleksi Produk Digital</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pilar Fisik */}
          <div className="bg-[#f7f6f2] p-8 sm:p-10 rounded-3xl border border-stone-200/90 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                Workspace Workshop
              </span>
              <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                Periferal & Alat Kerja Ergonomis
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Stand laptop aluminium rotasi 360°, mouse ergonomis presisi tinggi, dan mechanical keyboard yang nyaman untuk jam kerja panjang. Semua dikemas aman dari Jakarta dengan garansi retur 7 hari.
              </p>
            </div>
            <div>
              <Link
                href="/categories/elektronik-gadget"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-900 hover:text-stone-700 underline"
              >
                <span>Lihat Periferal & Gadget</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST PRODUCTS (RILISAN TERBARU) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
              Etalase Toko
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Rilisan Terbaru
            </h2>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1 group"
          >
            <span>Semua Rilisan</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. KOMITMEN LAYANAN (4 HUMAN COMMITMENTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-stone-200/90 shadow-sm">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900">
              Komitmen Layanan JNshop
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Standar pelayanan yang saya pegang teguh untuk setiap transaksi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-stone-600">
            <div className="space-y-2 p-4 rounded-2xl bg-stone-50/70 border border-stone-100">
              <RotateCcw className="w-5 h-5 text-stone-800" />
              <h4 className="font-bold text-stone-900 text-sm">Garansi Retur 7 Hari</h4>
              <p className="leading-relaxed">
                Jika barang fisik cacat atau rusak dalam perjalanan, kami ganti baru atau uang kembali penuh.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-stone-50/70 border border-stone-100">
              <Zap className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-stone-900 text-sm">Pemenuhan Digital Instan</h4>
              <p className="leading-relaxed">
                Tautan download resmi dan lisensi software langsung terbit seketika tanpa harus menunggu berjam-jam.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-stone-50/70 border border-stone-100">
              <Package className="w-5 h-5 text-stone-800" />
              <h4 className="font-bold text-stone-900 text-sm">Kemasan Ekstra Aman</h4>
              <p className="leading-relaxed">
                Semua produk fisik dikemas dengan bubble wrap tebal dan kotak pelindung tanpa biaya tambahan.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-stone-50/70 border border-stone-100">
              <HeartHandshake className="w-5 h-5 text-stone-800" />
              <h4 className="font-bold text-stone-900 text-sm">Konsultasi Ramah</h4>
              <p className="leading-relaxed">
                Tersedia asisten pintar 24 jam atau chat WhatsApp langsung dengan pemilik toko jika butuh saran.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
