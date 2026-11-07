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
        return { label: "Menunggu Pembayaran", bg: "bg-amber-50 text-amber-900 border-amber-200" };
      case "WAITING_CONFIRMATION":
        return { label: "Verifikasi Kurator", bg: "bg-stone-100 text-stone-800 border-stone-300" };
      case "PAID":
        return { label: "Terbayar & Siap", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "PROCESSING":
        return { label: "Sedang Dikemas", bg: "bg-stone-100 text-stone-800 border-stone-200" };
      case "SHIPPED":
        return { label: "Dalam Pengiriman", bg: "bg-amber-50 text-amber-900 border-amber-200" };
      case "DELIVERED":
        return { label: "Selesai", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "CANCELLED":
        return { label: "Dibatalkan", bg: "bg-stone-100 text-stone-500 border-stone-200" };
      default:
        return { label: status, bg: "bg-stone-100 text-stone-700 border-stone-200" };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-stone-900 transition-colors">
            Akun
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">Pesanan</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Riwayat Pembelian & Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Pantau status paket fisik, unduh invoice, dan lisensi digital.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/95 rounded-2xl border border-stone-200/90 p-12 sm:p-16 text-center space-y-4 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto border border-stone-200">
            <PackageCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-serif font-bold text-stone-900">
            Belum Ada Transaksi
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Anda belum memiliki riwayat pesanan di JNshop. Temukan kebutuhan peralatan kerja ergonomis atau aset digital pilihan Anda.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 font-medium text-xs sm:text-sm shadow-sm hover:bg-stone-800 transition-colors"
            >
              <span>Jelajahi Koleksi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-4 hover:border-stone-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-medium text-xs sm:text-sm text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <span className="text-xs text-stone-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                      <div className="space-y-0.5">
                        <span className="font-medium text-stone-900 block">
                          {item.productName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                          <span>Qty: {item.quantity} × {formatRupiah(item.productPrice)}</span>
                          <span>•</span>
                          <span className="text-[10px] uppercase font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                            {item.isDigital ? "Digital" : "Fisik"}
                          </span>
                        </div>
                      </div>
                      <span className="font-serif font-semibold text-stone-900">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-stone-100">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Total Pesanan:</span>
                    <div className="text-base sm:text-lg font-serif font-bold text-stone-900">
                      {formatRupiah(order.grandTotal)}
                    </div>
                  </div>

                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs shadow-sm transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka Invoice & Pelacakan</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
