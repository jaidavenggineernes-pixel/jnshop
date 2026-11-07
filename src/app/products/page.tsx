import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { MobileCatalogFilters } from "@/components/mobile-catalog-filters";
import { Filter, Search, RotateCcw } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string; // "physical" | "digital"
    minPrice?: string;
    maxPrice?: string;
    sort?: string; // "newest" | "price_asc" | "price_desc" | "rating"
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q?.trim() || "";
  const categorySlug = resolvedParams.category || "";
  const typeFilter = resolvedParams.type || "";
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sort = resolvedParams.sort || "newest";
  const isFeatured = resolvedParams.featured === "true";

  // Build Prisma where conditions
  const where: any = {
    isActive: true,
  };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { shortDescription: { contains: q } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (typeFilter === "physical") {
    where.isPhysical = true;
  } else if (typeFilter === "digital") {
    where.isPhysical = false;
  }

  if (isFeatured) {
    where.isFeatured = true;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // Sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sort === "rating") {
    orderBy = { rating: "desc" };
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Breadcrumbs & Title */}
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">Katalog Toko</span>
          {categorySlug && (
            <>
              <span>/</span>
              <span className="text-stone-900 font-medium">
                {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
              </span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {q ? `Pencarian: "${q}"` : categorySlug ? categories.find((c) => c.slug === categorySlug)?.name : "Katalog Pilihan JNshop"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Menampilkan {products.length} kurasi produk fisik & digital siap pakai.
            </p>
          </div>

          {/* Active Filter Badges */}
          {(q || categorySlug || typeFilter || isFeatured) && (
            <div className="flex flex-wrap items-center gap-2">
              {q && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200">
                  Kata Kunci: {q}
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 uppercase">
                  Tipe: {typeFilter}
                </span>
              )}
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2 ml-1"
              >
                Reset Filter
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-Friendly Interactive Filter & Sort Controls */}
      <MobileCatalogFilters
        categories={categories}
        totalProducts={products.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block bg-white/95 p-6 rounded-2xl border border-stone-200/90 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
            <span className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-700" />
              Saring Produk
            </span>
            <Link
              href="/products"
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              Reset
            </Link>
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-2.5">
              Format Produk
            </label>
            <div className="space-y-1">
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, type: "" }).toString()}`}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  !typeFilter ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                Semua Format
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, type: "physical" }).toString()}`}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  typeFilter === "physical" ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                📦 Produk Fisik
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, type: "digital" }).toString()}`}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  typeFilter === "digital" ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                ⚡ Produk Digital & Lisensi
              </Link>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-2.5">
              Kategori
            </label>
            <div className="space-y-1">
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, category: "" }).toString()}`}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  !categorySlug ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                <span>Semua Kategori</span>
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?${new URLSearchParams({ ...resolvedParams, category: c.slug }).toString()}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                    categorySlug === c.slug ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                  }`}
                >
                  <span className="truncate pr-2">{c.name}</span>
                  <span className={`text-xs ${categorySlug === c.slug ? "text-stone-300" : "text-stone-400"}`}>
                    ({c._count.products})
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Sorting Filter */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-2.5">
              Urutan
            </label>
            <div className="space-y-1">
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, sort: "newest" }).toString()}`}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  sort === "newest" ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                Rilisan Terbaru
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, sort: "price_asc" }).toString()}`}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  sort === "price_asc" ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                Harga Terendah
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, sort: "price_desc" }).toString()}`}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  sort === "price_desc" ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                Harga Tertinggi
              </Link>
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, sort: "rating" }).toString()}`}
                className={`block px-3 py-2 rounded-xl text-xs sm:text-sm transition-colors ${
                  sort === "rating" ? "bg-stone-900 text-stone-100 font-medium" : "text-stone-700 hover:bg-stone-100/70"
                }`}
              >
                Rating Tertinggi
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {products.length === 0 ? (
            <div className="bg-white/95 rounded-2xl border border-stone-200/90 p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto border border-stone-200">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">Tidak ada produk ditemukan</h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                Sesuaikan kata kunci pencarian Anda atau reset filter untuk menjelajahi seluruh koleksi JNshop.
              </p>
              <Link
                href="/products"
                className="inline-block px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 font-medium text-xs sm:text-sm hover:bg-stone-800 transition-colors shadow-sm"
              >
                Tampilkan Semua Koleksi
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
