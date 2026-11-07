import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";
import { PackageCheck, ArrowRight, ShoppingBag, Eye } from "lucide-react";


export default async function CustomerOrdersPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payments: true,
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Menunggu Bayar", bg: "bg-amber-100 text-amber-800" };
      case "WAITING_CONFIRMATION":
        return { label: "Menunggu Verifikasi", bg: "bg-blue-100 text-blue-800" };
      case "PAID":
        return { label: "Lunas", bg: "bg-emerald-100 text-emerald-800" };
      case "PROCESSING":
        return { label: "Diproses", bg: "bg-indigo-100 text-indigo-800" };
      case "SHIPPED":
        return { label: "Dalam Pengiriman", bg: "bg-teal-100 text-teal-800" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-emerald-100 text-emerald-800" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-red-100 text-red-800" };
      default:
        return { label: status, bg: "bg-slate-100 text-slate-800" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <Link href="/" className="hover:text-blue-600">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-blue-600">
            Akun
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Pesanan Saya</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Riwayat & Daftar Pesanan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pantau status pesanan, unduh invoice, dan akses lisensi produk digital Anda.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Belum Ada Pesanan</h2>
          <p className="text-sm text-slate-500">
            Anda belum pernah melakukan pemesanan di JNshop. Mulai belanja produk fisik & digital sekarang!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md"
          >
            <span>Mulai Belanja</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(order.createdAt)}</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 text-sm block">
                          {item.productName}
                        </span>
                        <span className="text-slate-500">
                          Qty: {item.quantity} × {formatRupiah(item.productPrice)}
                        </span>
                        <span className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 ml-2">
                          {item.isDigital ? "Digital" : "Fisik"}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500">Total Pembayaran:</span>
                    <div className="text-lg font-black text-blue-600">
                      {formatRupiah(order.grandTotal)}
                    </div>
                  </div>

                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Detail & Invoice</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
