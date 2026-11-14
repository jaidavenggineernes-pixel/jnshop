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
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-white">
        <div className="max-w-md w-full bg-white rounded-xl p-8 border border-zinc-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Akses Dibatasi (403)</h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Halaman ini khusus Administrator JNshop. Akun Anda saat ini ({session.email}) berstatus Pelanggan.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="min-h-[44px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-xs flex items-center justify-center transition-colors"
            >
              Kembali ke Toko
            </Link>
            <Link
              href="/login?redirect=/admin"
              className="min-h-[40px] px-4 rounded-lg text-zinc-700 hover:text-zinc-900 font-semibold text-xs flex items-center justify-center hover:underline"
            >
              Masuk dengan Akun Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col lg:flex-row">
      <AdminNav user={session} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
