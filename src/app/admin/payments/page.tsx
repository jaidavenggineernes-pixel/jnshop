import React from "react";
import { prisma } from "@/lib/prisma";
import AdminPaymentsClient from "./admin-payments-client";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const [methods, products] = await Promise.all([
    prisma.paymentMethod.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountPrice: true,
        isPhysical: true,
        isActive: true,
        allowCod: true,
        allowedPaymentMethods: true,
        category: { select: { name: true } },
        images: { take: 1, orderBy: { order: "asc" } },
      },
    }),
  ]);

  return (
    <AdminPaymentsClient
      initialMethods={methods}
      initialProducts={products}
    />
  );
}
