import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Laptop,
  Binary,
  ShieldCheck,
  Tag,
  MessageCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { formatRupiah } from "@/lib/utils";

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
        take: 10,
      }),
      prisma.category.findMany({
        orderBy: { displayOrder: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      }),
      prisma.coupon.findMany({
        where: { isActive: true },
        take: 2,
      }),
      prisma.storeSetting.findUnique({
        where: { id: "default" },
      }),
    ]);

  const storeTitle = storeSetting?.storeName || "JNshop";
  const heroTitle =
    storeSetting?.heroTitle ||
    "Perangkat kerja terkurasi & aset digital siap pakai untuk studio produktif.";
  const heroSubtitle =
    storeSetting?.heroSubtitle ||
    `${storeTitle} adalah toko independen yang menyediakan peralatan workstation ergonomis, periferal pilihan, dan perangkat lunak resmi yang teruji langsung.`;
  const heroPrimaryBtnText = storeSetting?.heroPrimaryBtnText || "Jelajahi Katalog";
  const heroPrimaryBtnLink = storeSetting?.heroPrimaryBtnLink || "/products";
  const rawSecondaryBtn =
    storeSetting?.heroSecondaryBtnText || "Produk Digital & Lisensi";
  const heroSecondaryBtnText = rawSecondaryBtn.replace(/^[⚡📦🔥✨\s]+/, "").trim() || "Produk Digital & Lisensi";
  const heroSecondaryBtnLink =
    storeSetting?.heroSecondaryBtnLink || "/categories/produk-digital-lisensi";

  const guarantee1Title = storeSetting?.guarantee1Title || "Garansi 7 Hari";
  const guarantee1Desc = storeSetting?.guarantee1Desc || "Retur atau penggantian unit baru";
  const guarantee2Title = storeSetting?.guarantee2Title || "Akses Instan";
  const guarantee2Desc = storeSetting?.guarantee2Desc || "Lisensi digital aktif setelah verifikasi";
  const guarantee3Title = storeSetting?.guarantee3Title || "Dukungan Langsung";
  const guarantee3Desc = storeSetting?.guarantee3Desc || "Konsultasi teknis via WhatsApp toko";

  const showcaseBadgeLeft = storeSetting?.showcaseBadgeLeft || "Pilihan Minggu Ini";
  const showcaseBadgeRight = storeSetting?.showcaseBadgeRight || "Edisi Terkurasi";
  const showcaseImageUrl =
    storeSetting?.showcaseImageUrl ||
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80";
  const showcaseTagPill = storeSetting?.showcaseTagPill || "Keychron K2 Pro • Hot-Swap";
  const showcaseTitle = storeSetting?.showcaseTitle || "Workstation Setup Pilihan";
  const showcaseSubtitle =
    storeSetting?.showcaseSubtitle || "Keyboard mekanikal & penyangga laptop aluminium";
  const showcaseLinkText = (storeSetting?.showcaseLinkText || "Buka Detail").replace(/→/g, "").trim();
  const showcaseLinkUrl = storeSetting?.showcaseLinkUrl || "/products";
  const showcaseConsultText =
    storeSetting?.showcaseConsultText || "Butuh rekomendasi spesifikasi?";

  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");

  // Deduplicate latest releases against featured cards where catalog size permits
  const featuredIds = new Set(featuredProducts.map((p) => p.id));
  const distinctLatest = latestProducts.filter((p) => !featuredIds.has(p.id));
  const newArrivals = (distinctLatest.length >= 4 ? distinctLatest : latestProducts).slice(0, 6);

  return (
    <div className="bg-white">
      {/* Studio Asymmetric Hero */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Copy Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-green-800">
                {storeTitle} Studio Catalog
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.12]">
                {heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
                {heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={heroPrimaryBtnLink}
                  className="min-h-[44px] px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <span>{heroPrimaryBtnText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href={heroSecondaryBtnLink}
                  className="min-h-[44px] px-6 py-3 rounded-lg bg-white border border-zinc-300 hover:border-zinc-900 text-zinc-900 font-semibold text-sm inline-flex items-center gap-2 transition-colors"
                >
                  <Binary className="w-4 h-4 text-green-800" />
                  <span>{heroSecondaryBtnText}</span>
                </Link>
              </div>

              {/* Single Clean 3-Point Operational Standard */}
              <div className="pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <div className="text-sm font-bold text-zinc-900">{guarantee1Title}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">{guarantee1Desc}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">{guarantee2Title}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">{guarantee2Desc}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-900">{guarantee3Title}</div>
                  <div className="text-xs text-zinc-600 mt-0.5">{guarantee3Desc}</div>
                </div>
              </div>
            </div>

            {/* Hero Showcase Column */}
            <div className="lg:col-span-5">
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-200">
                  <span className="font-semibold text-zinc-900">{showcaseBadgeLeft}</span>
                  <span className="font-medium text-green-800 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-md">
                    {showcaseBadgeRight}
                  </span>
                </div>

                <Link
                  href={showcaseLinkUrl}
                  className="block relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-white border border-zinc-200 group"
                >
                  <img
                    src={showcaseImageUrl}
                    alt={showcaseTitle}
                    width={640}
                    height={480}
                    fetchPriority="high"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </Link>

                <div className="space-y-3">
                  <div className="text-xs font-mono text-zinc-600">{showcaseTagPill}</div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-zinc-900 text-base leading-snug">
                        {showcaseTitle}
                      </h2>
                      <p className="text-xs text-zinc-600 mt-1">{showcaseSubtitle}</p>
                    </div>
                    <Link
                      href={showcaseLinkUrl}
                      className="shrink-0 min-h-[36px] px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-green-800 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{showcaseLinkText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-zinc-200 flex items-center justify-between gap-2 text-xs">
                    <span className="text-zinc-600">{showcaseConsultText}</span>
                    <a
                      href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${storeTitle}, saya butuh konsultasi spesifikasi produk.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-green-800 hover:text-green-900 inline-flex items-center gap-1 shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Tanya via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Index */}
      <section className="border-b border-zinc-200 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/products"
              className="min-h-[40px] px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap inline-flex items-center"
            >
              Semua Produk
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="min-h-[40px] px-4 py-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-800 text-xs font-medium whitespace-nowrap inline-flex items-center gap-2 transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-zinc-600 tabular-nums">
                  ({cat._count?.products ?? 0})
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Storefront Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Section 1: Pilihan Kurasi (4-Column Visual Grid) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-zinc-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                Pilihan Kurasi
              </h2>
              <p className="text-sm text-zinc-600 mt-1">
                Perangkat workstation dan lisensi perangkat lunak yang paling banyak digunakan.
              </p>
            </div>
            <Link
              href="/products?featured=true"
              className="text-sm font-semibold text-green-800 hover:text-green-900 inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Lihat Semua Kurasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Section 2: Split Format Directory & Active Voucher */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link
            href="/products?type=physical"
            className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl p-6 flex flex-col justify-between gap-4 transition-colors group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-900">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900">Perangkat Fisik</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Keyboard mekanikal, penyangga laptop aluminium, dan aksesori meja dikirim aman dari Jakarta.
              </p>
            </div>
            <span className="text-xs font-semibold text-zinc-900 group-hover:text-green-800 inline-flex items-center gap-1">
              <span>Telusuri Barang Fisik</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/products?type=digital"
            className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl p-6 flex flex-col justify-between gap-4 transition-colors group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-800">
                <Binary className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-zinc-900">Produk Digital & Lisensi</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Template kerja, source code kit, dan lisensi software dengan akses langsung setelah konfirmasi.
              </p>
            </div>
            <span className="text-xs font-semibold text-green-800 inline-flex items-center gap-1">
              <span>Lihat Aset Digital</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <div className="bg-zinc-900 text-white rounded-xl p-6 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400">
                <Tag className="w-4 h-4" />
                <span>Voucher Belanja Aktif</span>
              </div>
              {coupons.length > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="font-mono font-bold text-lg tracking-wider bg-zinc-800 px-3 py-1 rounded-md border border-zinc-700">
                      {coupons[0].code}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      {coupons[0].type === "PERCENTAGE"
                        ? `Diskon ${coupons[0].value}%`
                        : `Potongan ${formatRupiah(coupons[0].value)}`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                    {coupons[0].description || "Masukkan kode ini di halaman keranjang atau checkout."}
                  </p>
                </>
              ) : (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Pantau promo berkala atau cek status pengiriman pesanan Anda kapan saja.
                </p>
              )}
            </div>
            <Link
              href="/orders/track"
              className="text-xs font-semibold text-white hover:text-green-400 inline-flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Lacak Status Pesanan</span>
            </Link>
          </div>
        </section>

        {/* Section 3: Baru Masuk (Distinct 2-Column Compact Technical List) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-zinc-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                Baru Masuk Katalog
              </h2>
              <p className="text-sm text-zinc-600 mt-1">
                Rilisan terbaru lengkap dengan status format dan harga langsung.
              </p>
            </div>
            <Link
              href="/products?sort=newest"
              className="text-sm font-semibold text-green-800 hover:text-green-900 inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Semua Rilisan Baru</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newArrivals.map((product) => {
              const imgUrl =
                product.images?.find((img: any) => img.isPrimary)?.url ||
                product.images?.[0]?.url ||
                "/placeholder.png";
              const price = product.discountPrice || product.price;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-400 rounded-xl p-4 flex items-center gap-4 transition-colors"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          product.isPhysical
                            ? "bg-zinc-100 text-zinc-800 border-zinc-200"
                            : "bg-green-50 text-green-800 border-green-200"
                        }`}
                      >
                        {product.isPhysical ? "Fisik" : "Digital"}
                      </span>
                      <span className="text-xs text-zinc-600 truncate">
                        {product.category?.name || "Katalog"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-zinc-900 text-sm sm:text-base truncate group-hover:text-green-800 transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="font-bold text-sm sm:text-base text-zinc-900 tabular-nums">
                        {formatRupiah(price)}
                      </span>
                      <span className="text-xs text-zinc-600 font-medium">
                        {product.stock > 0 ? `Stok ${product.stock}` : "Habis"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
