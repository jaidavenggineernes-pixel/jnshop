import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyPaymentVerified } from "@/lib/notifications";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Handle Midtrans notification payload
    const orderId = body.order_id;
    const statusCode = body.status_code;
    const grossAmount = body.gross_amount;
    const signatureKey = body.signature_key;
    const transactionStatus = body.transaction_status;
    const fraudStatus = body.fraud_status;

    if (serverKey && signatureKey) {
      const hash = crypto
        .createHash("sha512")
        .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
        .digest("hex");

      if (hash !== signatureKey) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { items: true, payments: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let isSuccess = false;

    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        // Challenged by fraud system
      } else if (fraudStatus === "accept") {
        isSuccess = true;
      }
    } else if (transactionStatus === "settlement") {
      isSuccess = true;
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ message: "Order cancelled" });
    }

    if (isSuccess) {
      const allDigital = order.items.every((i) => i.isDigital);
      const nextStatus = allDigital ? "DELIVERED" : "PROCESSING";

      await prisma.order.update({
        where: { id: order.id },
        data: { status: nextStatus },
      });

      if (order.payments.length > 0) {
        await prisma.payment.update({
          where: { id: order.payments[0].id },
          data: {
            status: "PAID",
            paymentGatewayPayload: JSON.stringify(body),
          },
        });
      }

      if (allDigital) {
        await prisma.orderItem.updateMany({
          where: { orderId: order.id },
          data: { digitalAccessDelivered: true },
        });
      }

      await notifyPaymentVerified(order);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Internal webhook error" }, { status: 500 });
  }
}
