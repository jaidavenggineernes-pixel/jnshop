import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdminUser();

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
        items: true,
      },
    });

    // Format into CSV
    const headers = [
      "No. Pesanan",
      "Tanggal",
      "Status",
      "Penerima",
      "WhatsApp",
      "Metode Pembayaran",
      "Total Subtotal",
      "Diskon",
      "Ongkos Kirim",
      "Grand Total",
      "Jumlah Item",
    ];

    const rows = orders.map((o) => {
      const paymentMethod = o.payments?.[0]?.paymentMethod || "-";
      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toISOString().slice(0, 10)}"`,
        `"${o.status}"`,
        `"${o.recipientName.replace(/"/g, '""')}"`,
        `"${o.recipientPhone}"`,
        `"${paymentMethod}"`,
        o.totalAmount,
        o.discountAmount,
        o.shippingFee,
        o.grandTotal,
        o.items.length,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="jnshop-orders-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
