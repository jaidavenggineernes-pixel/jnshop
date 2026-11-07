import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { notifyNewOrder } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      recipientName,
      recipientPhone,
      shippingAddress,
      notes,
      courierName,
      paymentMethod,
      couponCode,
      items,
    } = body;

    if (!recipientName || !recipientPhone || !items || items.length === 0) {
      return NextResponse.json({ error: "Data pesanan tidak lengkap." }, { status: 400 });
    }

    const session = await getSessionUser();

    // 1. Calculate item subtotals and check stock
    let totalAmount = 0;
    const orderItemsData: any[] = [];
    let hasPhysicalItems = false;

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Produk ${item.productName || ""} tidak lagi tersedia.` },
          { status: 400 }
        );
      }

      const availableStock = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)?.stock ?? 0
        : product.stock;

      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Stok produk "${product.name}" tidak mencukupi (sisa ${availableStock}).` },
          { status: 400 }
        );
      }

      if (product.isPhysical) {
        hasPhysicalItems = true;
      }

      const effectivePrice = item.price || product.discountPrice || product.price;
      const subtotal = effectivePrice * item.quantity;
      totalAmount += subtotal;

      orderItemsData.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        productPrice: effectivePrice,
        quantity: item.quantity,
        subtotal,
        isDigital: !product.isPhysical,
        digitalAccessCode: !product.isPhysical ? product.digitalLicenseKey || null : null,
      });

      // Reduce product / variant stock
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // 2. Validate Coupon Discount (if applied)
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive && coupon.quota > coupon.usedCount && totalAmount >= coupon.minPurchase) {
        if (coupon.type === "PERCENTAGE") {
          discountAmount = (totalAmount * coupon.value) / 100;
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = Math.min(coupon.value, totalAmount);
        }

        // Increment coupon used count
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    // 3. Calculate shipping fee
    const shippingFee = hasPhysicalItems
      ? courierName?.includes("Express")
        ? 32000
        : 18000
      : 0;

    const grandTotal = Math.max(0, totalAmount - discountAmount + shippingFee);
    const orderNumber = generateOrderNumber();

    // 4. Create the complete Order record
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.id || null,
        status: paymentMethod === "COD" ? "PROCESSING" : "PENDING_PAYMENT",
        totalAmount,
        discountAmount,
        shippingFee,
        grandTotal,
        notes: notes || null,
        shippingAddressJson: shippingAddress ? JSON.stringify(shippingAddress) : null,
        recipientName,
        recipientPhone,
        courierName: hasPhysicalItems ? courierName || "SiCepat" : "Digital Fulfillment",
        items: {
          create: orderItemsData,
        },
        payments: {
          create: {
            paymentMethod,
            paymentChannel: paymentMethod,
            amount: grandTotal,
            status: paymentMethod === "COD" ? "PENDING" : "PENDING",
          },
        },
        shipments: hasPhysicalItems
          ? {
              create: {
                courierName: courierName || "SiCepat",
                status: "PENDING",
                estimatedDays: courierName?.includes("Express") ? "1 Hari" : "1-3 Hari",
              },
            }
          : undefined,
      },
      include: {
        items: true,
        payments: true,
      },
    });

    // 5. Trigger automated notification
    await notifyNewOrder(order, session);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        grandTotal: order.grandTotal,
        status: order.status,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal saat membuat pesanan." }, { status: 500 });
  }
}
