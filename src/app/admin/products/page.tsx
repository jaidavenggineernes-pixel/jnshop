import React from "react";
import { prisma } from "@/lib/prisma";
import AdminProductsClient from "./admin-products-client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { take: 1, orderBy: { order: "asc" } },
        variants: true,
      },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminProductsClient
      initialProducts={products}
      categories={categories}
    />
  );
}
