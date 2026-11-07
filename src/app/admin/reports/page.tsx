import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";
import {
  FileSpreadsheet,
  Download,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CreditCard,
} from "lucide-react";


export default async function AdminReportsPage() {
  const [orders, payments] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, payments: true },
    }),
    prisma.payment.findMany({
      where: { status: "PAID" },
    }),
  ]);

  const paidOrders = orders.filter((o) =>
    ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(o.status)
  );

  const totalGrossRevenue = paidOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalItemsSold = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  // Group by payment methods
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laporan & Analitik Bisnis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ringkasan omset penjualan, volume transaksi, dan ekspor data buku kas ke Excel/CSV.
          </p>
        </div>

        <a
          href="/api/admin/reports/export"
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Laporan ke CSV</span>
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Omset Penjualan (Lunas)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatRupiah(totalGrossRevenue)}</div>
          <p className="text-[11px] text-slate-500">Dari {paidOrders.length} transaksi selesai</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Unit Produk Terjual
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalItemsSold} Unit</div>
          <p className="text-[11px] text-slate-500">Termasuk produk fisik & lisensi digital</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rata-rata Nilai Pesanan
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatRupiah(paidOrders.length > 0 ? totalGrossRevenue / paidOrders.length : 0)}
          </div>
          <p className="text-[11px] text-slate-500">Average Order Value (AOV)</p>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" />
          Distribusi Metode Pembayaran
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(paymentMethodsBreakdown).map(([method, data]) => (
            <div key={method} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-900">{method}</span>
              <div className="text-base font-extrabold text-blue-600">
                {formatRupiah(data.total)}
              </div>
              <div className="text-[11px] text-slate-400">{data.count} transaksi berhasil</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
