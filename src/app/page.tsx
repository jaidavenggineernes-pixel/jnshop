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
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";


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

  // Icon map for categories
  const getCategoryIcon = (iconName: string | null) => {
    switch (iconName) {
      case "Binary":
        return <Binary className="w-6 h-6 text-blue-600" />;
      case "Laptop":
        return <Laptop className="w-6 h-6 text-indigo-600" />;
      case "MousePointer":
        return <MousePointer className="w-6 h-6 text-violet-600" />;
      case "Briefcase":
        return <Briefcase className="w-6 h-6 text-emerald-600" />;
      case "Shirt":
        return <Shirt className="w-6 h-6 text-amber-600" />;
      default:
        return <ShoppingBag className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 md:pt-24 md:pb-32">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Personal E-Commerce & AI Assistant Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Pusat Belanja Produk Fisik & Digital{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                  Terpercaya di JNshop
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Temukan workstation ergonomis, periferal gadget, kode sumber, lisensi digital instan, dan layanan konsultasi teknologi dalam satu platform terintegrasi.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/products"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Jelajahi Katalog Lengkap</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/categories/produk-digital-lisensi"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all text-center"
                >
                  Produk Digital & Lisensi
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-slate-400">Jaminan Garansi Resmi</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Instant</div>
                  <div className="text-xs text-slate-400">Pengiriman File Digital</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">4.9 / 5.0</div>
                  <div className="text-xs text-slate-400">Rating Kepuasan Pembeli</div>
                </div>
              </div>
            </div>

            {/* Right Card Feature Presentation */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-800/80 to-slate-900/90 rounded-3xl p-6 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Asisten Belanja AI</h4>
                      <p className="text-[11px] text-slate-400">Tersedia 24/7 di JNshop</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Aktif
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/40 text-slate-300">
                    <p className="font-semibold text-blue-300 mb-1">🤖 JNshop AI:</p>
                    <p>
                      &quot;Bingung memilih varian switch keyboard atau lisensi software? Anda bisa tanya langsung ke saya lewat tombol di pojok kanan bawah!&quot;
                    </p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/20">
                    <div className="flex items-center gap-2 text-white font-semibold mb-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Metode Pembayaran Lengkap</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      QRIS All Payment, Transfer BCA / Mandiri, BNI VA otomatis, dan Cash on Delivery.
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-[11px] text-slate-400">Verifikasi Transaksi Aman</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE QUICK CATEGORIES STRIP */}
      <div className="lg:hidden px-4 -mt-10 relative z-20">
        <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
            <span>Kategori Populer</span>
            <Link href="/products" className="text-blue-600 font-semibold text-[11px]">
              Lihat Semua →
            </Link>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <Link
              href="/products"
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold whitespace-nowrap shrink-0"
            >
              🔥 Semua Produk
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 font-medium whitespace-nowrap border border-slate-200/80 shrink-0 hover:bg-slate-100"
              >
                {c.name.split("&")[0].trim()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Kategori Produk
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Temukan kebutuhan belanja Anda berdasarkan kategori pilihan terbaik.
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>Lihat Semua Produk</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-lg hover:shadow-slate-200/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors mb-4 border border-slate-100">
                  {getCategoryIcon(cat.icon)}
                </div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {cat.description || "Koleksi produk pilihan"}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{cat._count.products} Produk</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-blue-600" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. PROMO VOUCHER BANNER */}
      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/10">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold tracking-wider uppercase backdrop-blur-md">
                  Voucher Spesial Belanja
                </span>
                <h3 className="text-2xl sm:text-3xl font-black">
                  Diskon Tambahan Hingga 15% Untuk Anda!
                </h3>
                <p className="text-sm text-blue-100 max-w-xl">
                  Gunakan kode voucher saat checkout untuk menikmati potongan harga langsung pada produk fisik maupun produk digital pilihan Anda.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-3 text-center"
                  >
                    <div className="text-[10px] text-blue-200 uppercase font-semibold">Kode Voucher</div>
                    <div className="text-base font-black tracking-wider text-amber-300 font-mono">
                      {coupon.code}
                    </div>
                    <div className="text-[11px] text-white font-medium">
                      {coupon.type === "PERCENTAGE" ? `Potongan ${coupon.value}%` : `Diskon Rp ${coupon.value.toLocaleString("id-ID")}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Paling Direkomendasikan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Produk Unggulan JNshop
            </h2>
          </div>
          <Link
            href="/products?featured=true"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>Lihat Semua Unggulan</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. DIGITAL VS PHYSICAL SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Digital */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Binary className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Koleksi Produk Digital</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Boilerplate Next.js & SaaS, master design Figma, e-book praktis, dan lisensi software dengan alur unduhan otomatis seketika setelah pembayaran terkonfirmasi.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Instant Download & License Key Generator
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Bebas Biaya Ongkos Kirim (Rp 0)
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-800">
              <Link
                href="/categories/produk-digital-lisensi"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300"
              >
                <span>Jelajahi Produk Digital</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card Physical */}
          <div className="bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 text-white rounded-3xl p-8 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Gadget & Setup Kerja Ergonomis</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tingkatkan efisiensi kerja Anda dengan mouse ergonomis 8K DPI, mechanical keyboard hot-swap, stand laptop kokoh, dan alas meja kulit vegan.
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pengemasan bubble wrap aman & nomor resi pelacakan
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Dukungan Cash on Delivery (COD) dan Bank Transfer
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-800">
              <Link
                href="/categories/elektronik-gadget"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300"
              >
                <span>Jelajahi Gadget & Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Produk Terbaru
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Koleksi rilisan terbaru yang baru saja ditambahkan ke etalase JNshop.
            </p>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>Lihat Semua Rilisan</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
