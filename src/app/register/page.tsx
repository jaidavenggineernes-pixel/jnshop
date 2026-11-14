"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, User, Mail, Lock, Phone, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await register(name, email, password, phone);
    setLoading(false);

    if (res.success) {
      router.push("/account");
    } else {
      setError(res.error || "Gagal membuat akun.");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-sm">
              JN
            </div>
            <div className="text-left leading-tight">
              <span className="font-bold text-lg tracking-tight text-zinc-900 block">
                JNshop
              </span>
              <span className="text-[11px] font-medium text-zinc-600 block">
                Independent Studio
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900 pt-2">Daftar Akun Baru</h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Buat akun untuk melacak pesanan dan mengakses produk digital Anda.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Nama Lengkap *
              </label>
              <div className="relative">
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-green-800 placeholder:text-zinc-500"
                />
                <User className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Alamat Email *
              </label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-green-800 placeholder:text-zinc-500"
                />
                <Mail className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Nomor WhatsApp (Opsional)
              </label>
              <div className="relative">
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-green-800 placeholder:text-zinc-500"
                />
                <Phone className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Kata Sandi *
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:bg-white focus:border-green-800 placeholder:text-zinc-500"
                />
                <Lock className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{loading ? "Mendaftar..." : "Buat Akun"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-600 pt-2 border-t border-zinc-100">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-green-800 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
