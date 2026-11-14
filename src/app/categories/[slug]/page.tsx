import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: "asc" } },
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600">
        <Link href="/" className="hover:text-zinc-900 transition-colors">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/products" className="hover:text-zinc-900 transition-colors">
          Katalog
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-900 font-semibold">{category.name}</span>
      </nav>

      {/* Crisp Category Header */}
      <div className="bg-zinc-50 rounded-xl p-6 sm:p-10 border border-zinc-200">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-green-800 block">
            Kategori Produk
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            {category.name}
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {category.description || "Pilihan peralatan kerja dan produk digital untuk menunjang aktivitas harian Anda."}
          </p>
          <div className="pt-1 text-xs font-semibold text-zinc-700">
            {category.products.length} produk tersedia
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {category.products.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center text-sm text-zinc-600">
          Belum ada produk aktif dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {category.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
