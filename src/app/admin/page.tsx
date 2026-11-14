import React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Eye,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [
    totalOrdersCount,
    pendingVerificationCount,
    totalCustomersCount,
    totalProductsCount,
    lowStockProducts,
    recentOrders,
    completedOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { status: "WAITING_CONFIRMATION" },
    }),
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
    prisma.product.count({
      where: { isActive: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 }, isActive: true },
      take: 5,
      select: { id: true, name: true, stock: true, sku: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true, payments: true },
    }),
    prisma.order.findMany({
      where: { status: { in: ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"] } },
      select: { grandTotal: true },
    }),
  ]);

  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.grandTotal, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Menunggu Bayar", bg: "bg-amber-50 text-amber-800 border border-amber-200" };
      case "WAITING_CONFIRMATION":
        return { label: "Perlu Verifikasi", bg: "bg-zinc-900 text-white" };
      case "PAID":
        return { label: "Lunas", bg: "bg-green-50 text-green-800 border border-green-200" };
      case "PROCESSING":
        return { label: "Diproses", bg: "bg-zinc-100 text-zinc-900 border border-zinc-200" };
      case "SHIPPED":
        return { label: "Dikirim", bg: "bg-amber-50 text-amber-800 border border-amber-200" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-green-50 text-green-800 border border-green-200" };
      default:
        return { label: status, bg: "bg-zinc-100 text-zinc-800 border border-zinc-200" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Ringkasan Toko
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Pantau pendapatan, pesanan masuk, verifikasi transfer, dan ketersediaan stok.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="min-h-[44px] px-5 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs inline-flex items-center justify-center transition-colors self-start sm:self-auto"
        >
          + Tambah Produk
        </Link>
      </div>

      {/* Pending Verification Banner */}
      {pendingVerificationCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0" />
            <span>
              Terdapat <strong>{pendingVerificationCount} pesanan</strong> menunggu verifikasi bukti pembayaran.
            </span>
          </div>
          <Link
            href="/admin/orders"
            className="min-h-[36px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs inline-flex items-center justify-center shrink-0"
          >
            Periksa Pesanan
          </Link>
        </div>
      )}

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Pendapatan Terverifikasi
            </span>
            <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-xs text-zinc-600 tabular-nums">
            Dari {completedOrders.length} transaksi terbayar
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Total Pesanan
            </span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {totalOrdersCount}
          </div>
          <div className="text-xs text-zinc-600 tabular-nums">
            {pendingVerificationCount} menunggu konfirmasi
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Pelanggan
            </span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {totalCustomersCount}
          </div>
          <div className="text-xs text-zinc-600">Akun pelanggan terdaftar</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Produk Aktif
            </span>
            <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">
            {totalProductsCount}
          </div>
          <div className="text-xs text-zinc-600">
            {lowStockProducts.length > 0 ? (
              <span className="text-red-800 font-semibold">
                {lowStockProducts.length} produk stok menipis
              </span>
            ) : (
              "Semua stok aman"
            )}
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-zinc-900">Pesanan Terbaru</h2>
              <p className="text-xs text-zinc-600 mt-0.5">6 transaksi terakhir masuk</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-green-800 hover:underline inline-flex items-center gap-1"
            >
              <span>Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-5">Invoice</th>
                  <th className="py-3 px-4">Penerima</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {recentOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-zinc-900">
                        {ord.orderNumber}
                        <span className="block text-[11px] text-zinc-600 font-sans font-normal mt-0.5">
                          {formatDate(ord.createdAt)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-900 block truncate max-w-[140px]">
                          {ord.recipientName}
                        </span>
                        <span className="text-[11px] text-zinc-600">{ord.recipientPhone}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-900 tabular-nums">
                        {formatRupiah(ord.grandTotal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/orders/${ord.orderNumber}`}
                          className="inline-flex items-center gap-1.5 min-h-[34px] px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-zinc-200 space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 pb-3 border-b border-zinc-200">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Stok Menipis</span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-zinc-600 py-6 text-center">
              Seluruh produk aktif memiliki stok aman.
            </p>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-semibold text-zinc-900 block truncate">{p.name}</span>
                    {p.sku && <span className="text-[11px] font-mono text-zinc-600">SKU: {p.sku}</span>}
                  </div>
                  <span className="font-bold text-red-800 bg-white border border-red-200 px-2 py-0.5 rounded-md shrink-0 tabular-nums">
                    Sisa {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/products"
            className="block text-center text-xs font-semibold text-green-800 hover:underline pt-1"
          >
            Kelola Stok Produk →
          </Link>
        </div>
      </div>
    </div>
  );
}
