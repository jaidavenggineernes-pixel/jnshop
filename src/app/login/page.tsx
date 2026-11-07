"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, AlertCircle, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (email.toLowerCase().includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } else {
      setError(res.error || "Gagal masuk. Periksa email dan password Anda.");
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);

    if (res.success) {
      if (demoEmail.includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } else {
      setError(res.error || "Gagal masuk ke akun demo");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-200 font-serif font-bold text-base shadow-sm">
              JN
            </div>
            <div className="text-left">
              <span className="font-serif font-bold text-xl tracking-tight text-stone-900 block leading-tight">
                JNshop
              </span>
              <span className="text-[9px] tracking-widest uppercase font-medium text-amber-800 block">
                Boutique & Atelier
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-serif font-bold text-stone-900 pt-2">Masuk ke Akun Anda</h1>
          <p className="text-xs text-stone-600">
            Akses pesanan, riwayat lisensi produk digital, dan preferensi akun Anda.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white/95 rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50/60 border border-stone-200 text-stone-900 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-stone-700">
                  Kata Sandi
                </label>
                <Link href="/help" className="text-xs text-stone-500 hover:text-stone-900 transition-colors">
                  Pusat Bantuan
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50/60 border border-stone-200 text-stone-900 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-100 font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Sedang Memproses...</span>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Accounts */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <span className="text-[11px] font-medium text-stone-500 block text-center">
              Akses Cepat Pengujian:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@jnshop.com", "admin123456")}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-200/90 transition-colors flex items-center justify-center gap-1.5 font-medium cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Pemilik (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("budi@gmail.com", "customer123456")}
                className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-200/90 transition-colors flex items-center justify-center gap-1.5 font-medium cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-stone-600" />
                <span>Pelanggan (Budi)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-stone-500">
          Belum memiliki akun JNshop?{" "}
          <Link href="/register" className="font-medium text-stone-900 hover:underline">
            Daftar Akun Baru
          </Link>
        </p>
      </div>
    </div>
  );
}
