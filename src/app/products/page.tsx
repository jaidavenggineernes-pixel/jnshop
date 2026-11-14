import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { MobileCatalogFilters } from "@/components/mobile-catalog-filters";
import { Filter, Search } from "lucide-react";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
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

  const activeCategoryName = categories.find((c) => c.slug === categorySlug)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-zinc-200">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 mb-3">
          <Link href="/" className="hover:text-zinc-900 transition-colors">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-zinc-900 font-medium">Katalog</span>
          {categorySlug && (
            <>
              <span aria-hidden="true">/</span>
              <span className="text-zinc-900 font-semibold">{activeCategoryName || categorySlug}</span>
            </>
          )}
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              {q
                ? `Hasil Pencarian: "${q}"`
                : activeCategoryName || "Katalog Produk JNshop"}
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              Menampilkan {products.length} produk fisik dan lisensi digital siap pesan.
            </p>
          </div>

          {(q || categorySlug || typeFilter || isFeatured) && (
            <div className="flex flex-wrap items-center gap-2">
              {q && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-900 border border-zinc-200">
                  Kata Kunci: {q}
                </span>
              )}
              {typeFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-800 border border-green-200">
                  Format: {typeFilter === "physical" ? "Fisik" : "Digital"}
                </span>
              )}
              <Link
                href="/products"
                className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 underline underline-offset-4 ml-1"
              >
                Reset Filter
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Controls */}
      <MobileCatalogFilters categories={categories} totalProducts={products.length} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block bg-white p-5 rounded-xl border border-zinc-200 space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <span className="font-bold text-zinc-900 text-sm inline-flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-700" />
              Filter Katalog
            </span>
            <Link
              href="/products"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              Reset
            </Link>
          </div>

          {/* Format Filter */}
          <div>
            <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2.5">
              Format Produk
            </h2>
            <div className="space-y-1">
              {[
                { label: "Semua Format", value: "" },
                { label: "Produk Fisik", value: "physical" },
                { label: "Produk Digital & Lisensi", value: "digital" },
              ].map((opt) => (
                <Link
                  key={opt.label}
                  href={`/products?${new URLSearchParams({ ...resolvedParams, type: opt.value }).toString()}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    typeFilter === opt.value
                      ? "bg-zinc-900 text-white font-semibold"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2.5">
              Kategori
            </h2>
            <div className="space-y-1">
              <Link
                href={`/products?${new URLSearchParams({ ...resolvedParams, category: "" }).toString()}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  !categorySlug
                    ? "bg-zinc-900 text-white font-semibold"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <span>Semua Kategori</span>
              </Link>
              {categories.map((c) => {
                const active = categorySlug === c.slug;
                return (
                  <Link
                    key={c.id}
                    href={`/products?${new URLSearchParams({ ...resolvedParams, category: c.slug }).toString()}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-zinc-900 text-white font-semibold"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    <span className="truncate pr-2">{c.name}</span>
                    <span className={`text-xs tabular-nums ${active ? "text-zinc-300" : "text-zinc-600"}`}>
                      ({c._count.products})
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h2 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2.5">
              Urutkan
            </h2>
            <div className="space-y-1">
              {[
                { label: "Rilisan Terbaru", value: "newest" },
                { label: "Harga Terendah", value: "price_asc" },
                { label: "Harga Tertinggi", value: "price_desc" },
                { label: "Rating Tertinggi", value: "rating" },
              ].map((s) => (
                <Link
                  key={s.value}
                  href={`/products?${new URLSearchParams({ ...resolvedParams, sort: s.value }).toString()}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    sort === s.value
                      ? "bg-zinc-900 text-white font-semibold"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center mx-auto border border-zinc-200">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-zinc-900">
                Tidak ada produk yang sesuai
              </h2>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                Ubah kata kunci pencarian atau reset filter untuk melihat seluruh katalog.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-lg bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 transition-colors"
              >
                Tampilkan Semua Produk
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
