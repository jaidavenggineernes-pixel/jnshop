import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderView } from "./order-view";


interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: {
              slug: true,
              digitalFileUrl: true,
              digitalLicenseKey: true,
              images: { take: 1 },
            },
          },
        },
      },
      payments: true,
      shipments: true,
    },
  });

  if (!order) {
    notFound();
  }

  const paymentMethodDetail = await prisma.paymentMethod.findFirst({
    where: {
      code: order.payments?.[0]?.paymentChannel || order.payments?.[0]?.paymentMethod,
    },
  });

  const storeSetting = await prisma.storeSetting.findUnique({
    where: { id: "default" },
  });

  return (
    <OrderView
      order={order}
      paymentMethodDetail={paymentMethodDetail}
      storeSetting={storeSetting}
    />
  );
}
