import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { notifyPaymentVerified, notifyOrderShipped } from "@/lib/notifications";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser();
    const { id } = await params;
    const body = await req.json();
    const { action, status, trackingNumber, courierName } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payments: true, items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (action === "VERIFY_PAYMENT") {
      // 1. Mark payment as PAID
      if (order.payments.length > 0) {
        await prisma.payment.update({
          where: { id: order.payments[0].id },
          data: {
            status: "PAID",
            adminVerifiedBy: admin.id,
            adminVerifiedAt: new Date(),
          },
        });
      }

      // Check if all items are digital
      const allDigital = order.items.every((it) => it.isDigital);
      const nextStatus = allDigital ? "DELIVERED" : "PROCESSING";

      const updated = await prisma.order.update({
        where: { id },
        data: { status: nextStatus },
      });

      // Mark digital items delivered
      if (allDigital) {
        await prisma.orderItem.updateMany({
          where: { orderId: id },
          data: { digitalAccessDelivered: true },
        });
      }

      // Notify customer
      await notifyPaymentVerified(order);

      // Audit log
      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "PAYMENT_VERIFIED",
          entityType: "ORDER",
          entityId: order.id,
          detailsJson: JSON.stringify({ orderNumber: order.orderNumber, amount: order.grandTotal }),
        },
      });

      return NextResponse.json({ success: true, order: updated });
    }

    if (action === "ADD_TRACKING") {
      if (!trackingNumber) {
        return NextResponse.json({ error: "Nomor resi wajib diisi." }, { status: 400 });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: "SHIPPED",
          trackingNumber: trackingNumber.trim(),
          courierName: courierName || order.courierName,
        },
      });

      // Update shipment record
      await prisma.shipment.create({
        data: {
          orderId: id,
          trackingNumber: trackingNumber.trim(),
          courierName: courierName || order.courierName || "SiCepat",
          status: "IN_TRANSIT",
          shippedAt: new Date(),
        },
      });

      // Notify customer
      await notifyOrderShipped(order, trackingNumber.trim(), courierName || order.courierName || "SiCepat");

      return NextResponse.json({ success: true, order: updated });
    }

    if (status) {
      const updated = await prisma.order.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pesanan" }, { status: 500 });
  }
}
