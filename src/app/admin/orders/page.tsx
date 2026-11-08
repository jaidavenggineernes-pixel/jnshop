import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminOrdersClient } from "./admin-orders-client";

export const dynamic = "force-dynamic";


export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payments: true,
      shipments: true,
    },
  });

  return <AdminOrdersClient initialOrders={orders} />;
}
