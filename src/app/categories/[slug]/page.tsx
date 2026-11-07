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
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-stone-900 transition-colors">
          Kategori
        </Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">{category.name}</span>
      </nav>

      {/* Warm Editorial Category Banner */}
      <div className="bg-[#1c1917] text-stone-100 rounded-2xl p-7 sm:p-12 relative overflow-hidden border border-stone-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-300/90 block">
            Koleksi Kategori
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-stone-100">
            {category.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            {category.description || "Kurasi produk dan peralatan pilihan untuk kebutuhan Anda di JNshop."}
          </p>
          <div className="pt-2 text-xs text-stone-400">
            Tersedia {category.products.length} item dalam koleksi ini
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {category.products.length === 0 ? (
        <div className="bg-white/95 rounded-2xl border border-stone-200/90 p-12 text-center text-xs sm:text-sm text-stone-500">
          Belum ada produk aktif dalam kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {category.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
