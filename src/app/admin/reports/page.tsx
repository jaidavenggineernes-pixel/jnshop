import React from "react";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import { Download, DollarSign, ShoppingBag, TrendingUp, CreditCard } from "lucide-react";

export default async function AdminReportsPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payments: true },
  });

  const paidOrders = orders.filter((o) =>
    ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(o.status)
  );

  const totalGrossRevenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalItemsSold = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  const paymentMethodsBreakdown: { [key: string]: { count: number; total: number } } = {};
  for (const o of paidOrders) {
    const method = o.payments?.[0]?.paymentMethod || "Transfer";
    if (!paymentMethodsBreakdown[method]) {
      paymentMethodsBreakdown[method] = { count: 0, total: 0 };
    }
    paymentMethodsBreakdown[method].count += 1;
    paymentMethodsBreakdown[method].total += o.grandTotal;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Laporan & Ekspor CSV
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Ringkasan omset transaksi terverifikasi dan unduhan data penjualan.
          </p>
        </div>

        <a
          href="/api/admin/reports/export"
          download
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Unduh CSV Laporan</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Omset Penjualan (Lunas)
            </span>
            <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {formatRupiah(totalGrossRevenue)}
          </div>
          <p className="text-xs text-zinc-600 tabular-nums">
            Dari {paidOrders.length} transaksi selesai
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Unit Terjual
            </span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {totalItemsSold} Unit
          </div>
          <p className="text-xs text-zinc-600">Produk fisik dan digital</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Rata-rata Nilai Pesanan
            </span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {formatRupiah(paidOrders.length > 0 ? totalGrossRevenue / paidOrders.length : 0)}
          </div>
          <p className="text-xs text-zinc-600">Average Order Value</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
        <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-green-800" />
          Distribusi Metode Pembayaran
        </h2>

        {Object.keys(paymentMethodsBreakdown).length === 0 ? (
          <p className="text-xs text-zinc-600 py-4">Belum ada transaksi lunas tercatat.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(paymentMethodsBreakdown).map(([method, data]) => (
              <div key={method} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                <span className="text-xs font-bold text-zinc-900 block">{method}</span>
                <div className="text-base font-bold text-green-800 tabular-nums">
                  {formatRupiah(data.total)}
                </div>
                <div className="text-xs text-zinc-600 tabular-nums">
                  {data.count} transaksi berhasil
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
