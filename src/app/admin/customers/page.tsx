import React from "react";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Users, Mail, Phone, ShoppingBag } from "lucide-react";


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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Pelanggan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Data seluruh pelanggan yang terdaftar dan bertransaksi di JNshop ({customers.length} pengguna).
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Pelanggan</th>
                <th className="py-3.5 px-4">Kontak WhatsApp</th>
                <th className="py-3.5 px-4">Tanggal Registrasi</th>
                <th className="py-3.5 px-4">Total Pesanan</th>
                <th className="py-3.5 px-6 text-right">Total Belanja (Lunas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Belum ada data pelanggan yang terdaftar.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const totalSpent = c.orders.reduce((sum, ord) => sum + ord.grandTotal, 0);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{c.name}</span>
                          <span className="text-[11px] text-slate-400">{c.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {c.phone ? (
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:underline font-semibold"
                          >
                            {c.phone}
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-500">{formatDate(c.createdAt)}</td>

                      <td className="py-4 px-4 font-bold text-slate-800">
                        {c.orders.length} Transaksi
                      </td>

                      <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
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
