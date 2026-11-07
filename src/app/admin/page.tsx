import React from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  TrendingUp,
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
        return { label: "Menunggu Bayar", bg: "bg-amber-100 text-amber-800" };
      case "WAITING_CONFIRMATION":
        return { label: "Perlu Verifikasi", bg: "bg-blue-100 text-blue-800 animate-pulse" };
      case "PAID":
        return { label: "Lunas", bg: "bg-emerald-100 text-emerald-800" };
      case "PROCESSING":
        return { label: "Diproses", bg: "bg-indigo-100 text-indigo-800" };
      case "SHIPPED":
        return { label: "Dikirim", bg: "bg-teal-100 text-teal-800" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-emerald-100 text-emerald-800" };
      default:
        return { label: status, bg: "bg-slate-100 text-slate-800" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Pemilik Toko
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau ringkasan pendapatan, pesanan masuk, verifikasi transfer, dan stok produk secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            + Tambah Produk Baru
          </Link>
        </div>
      </div>

      {/* Verification Notice Banner */}
      {pendingVerificationCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              Ada <strong>{pendingVerificationCount} pesanan</strong> yang telah mengunggah bukti transfer manual dan menunggu verifikasi Anda!
            </span>
          </div>
          <Link
            href="/admin/orders?status=WAITING_CONFIRMATION"
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-sm"
          >
            Verifikasi Sekarang
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pendapatan
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{formatRupiah(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Dari pesanan yang telah dibayar</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pesanan
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalOrdersCount} Pesanan</div>
          <div className="text-[11px] text-slate-500">
            {pendingVerificationCount} menunggu verifikasi transfer
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pelanggan
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCustomersCount} User</div>
          <div className="text-[11px] text-slate-500">Pelanggan terdaftar di toko</div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Katalog Produk
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalProductsCount} Produk</div>
          <div className="text-[11px] text-slate-500">
            {lowStockProducts.length > 0 ? (
              <span className="text-red-500 font-semibold">
                {lowStockProducts.length} produk stok menipis
              </span>
            ) : (
              "Semua stok aman"
            )}
          </div>
        </div>
      </div>

      {/* Main Tables Grid: Recent Orders & Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Pesanan Masuk Terbaru</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar transaksi pelanggan terakhir</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">No. Pesanan</th>
                  <th className="py-3 px-4">Penerima</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {ord.orderNumber}
                        <span className="block text-[10px] text-slate-400 font-sans font-normal">
                          {formatDate(ord.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                          {ord.recipientName}
                        </span>
                        <span className="text-[11px] text-slate-400">{ord.recipientPhone}</span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        {formatRupiah(ord.grandTotal)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/orders/${ord.orderNumber}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
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

        {/* Low Stock Alert Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Peringatan Stok Menipis</span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              Semua produk memiliki persediaan stok yang cukup aman.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-red-50/60 border border-red-100 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                    {p.sku && <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>}
                  </div>
                  <span className="font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-lg shrink-0">
                    Sisa {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/products"
            className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 pt-2"
          >
            Kelola Stok di Manajemen Produk →
          </Link>
        </div>
      </div>
    </div>
  );
}
