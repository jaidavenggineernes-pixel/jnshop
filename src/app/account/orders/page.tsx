import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";
import { PackageCheck, ArrowRight, Eye, ChevronRight } from "lucide-react";

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
        return { label: "Menunggu Pembayaran", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "WAITING_CONFIRMATION":
        return { label: "Menunggu Verifikasi", bg: "bg-zinc-100 text-zinc-900 border-zinc-300" };
      case "PAID":
        return { label: "Terbayar & Siap", bg: "bg-green-50 text-green-800 border-green-200" };
      case "PROCESSING":
        return { label: "Sedang Dikemas", bg: "bg-zinc-100 text-zinc-900 border-zinc-200" };
      case "SHIPPED":
        return { label: "Dalam Pengiriman", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-green-50 text-green-800 border-green-200" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-red-50 text-red-800 border-red-200" };
      default:
        return { label: status, bg: "bg-zinc-100 text-zinc-800 border-zinc-200" };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="pb-5 border-b border-zinc-200">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 mb-2">
          <Link href="/" className="hover:text-zinc-900">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/account" className="hover:text-zinc-900">
            Akun
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-zinc-900 font-semibold">Pesanan</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Riwayat Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Pantau pengiriman fisik, cetak invoice, dan akses file digital Anda.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center mx-auto">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Belum Ada Transaksi</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Anda belum memiliki riwayat pesanan di JNshop.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
          >
            <span>Lihat Katalog</span>
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
                className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-4 hover:border-zinc-400 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-200">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-xs sm:text-sm text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                      {order.orderNumber}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-600">{formatDate(order.createdAt)}</span>
                </div>

                <div className="divide-y divide-zinc-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-zinc-900 block">
                          {item.productName}
                        </span>
                        <span className="text-xs text-zinc-600 tabular-nums">
                          {item.quantity} x {formatRupiah(item.productPrice)} ({item.isDigital ? "Digital" : "Fisik"})
                        </span>
                      </div>
                      <span className="font-bold text-zinc-900 tabular-nums">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-zinc-200">
                  <div>
                    <span className="text-xs text-zinc-600 block">Total Tagihan</span>
                    <div className="text-base sm:text-lg font-bold text-zinc-900 tabular-nums">
                      {formatRupiah(order.grandTotal)}
                    </div>
                  </div>

                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Buka Invoice</span>
                    <ChevronRight className="w-4 h-4" />
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
