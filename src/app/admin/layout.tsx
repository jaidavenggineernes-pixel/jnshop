import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ShieldAlert } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  if (session.role !== "ADMIN") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/95 rounded-2xl p-8 border border-stone-200/90 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center mx-auto border border-stone-200">
            <ShieldAlert className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Akses Ditolak (403)</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Halaman ini khusus untuk Administrator / Pemilik Toko JNshop. Akun Anda saat ini ({session.email}) berstatus Pelanggan.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl bg-stone-900 text-stone-100 font-medium text-xs hover:bg-stone-800 transition-colors"
            >
              Kembali ke Toko
            </Link>
            <Link
              href="/login?redirect=/admin"
              className="py-2 px-4 rounded-xl text-stone-700 hover:text-stone-900 font-medium text-xs hover:underline"
            >
              Ganti Akun ke Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex flex-col lg:flex-row">
      <AdminNav user={session} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
