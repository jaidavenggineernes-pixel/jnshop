import React from "react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        where: { status: { in: ["PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"] } },
        select: { grandTotal: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Daftar Pelanggan
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 mt-1">
          Total {customers.length} akun pelanggan terdaftar di JNshop.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-600 uppercase tracking-wider font-semibold border-b border-zinc-200">
              <tr>
                <th className="py-3.5 px-6">Pelanggan</th>
                <th className="py-3.5 px-4">WhatsApp</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-4">Transaksi Lunas</th>
                <th className="py-3.5 px-6 text-right">Total Belanja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-600">
                    Belum ada data pelanggan.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const totalSpent = c.orders.reduce((sum, ord) => sum + ord.grandTotal, 0);
                  return (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white font-bold flex items-center justify-center shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-900 text-sm block">{c.name}</span>
                          <span className="text-xs text-zinc-600">{c.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.phone ? (
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-800 hover:underline font-semibold"
                          >
                            {c.phone}
                          </a>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600">{formatDate(c.createdAt)}</td>

                      <td className="py-3.5 px-4 font-semibold text-zinc-900 tabular-nums">
                        {c.orders.length} Pesanan
                      </td>

                      <td className="py-3.5 px-6 text-right font-bold text-zinc-900 text-sm tabular-nums">
                        {formatRupiah(totalSpent)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
