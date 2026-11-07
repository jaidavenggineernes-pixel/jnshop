"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  PackageCheck,
  Heart,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          bio,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil");
      }

      setSuccessMsg("Profil akun Anda berhasil diperbarui!");
      setCurrentPassword("");
      setNewPassword("");
      await refreshUser();
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto border border-stone-200">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900">
          Silakan Masuk ke Akun Anda
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Masuk untuk mengakses riwayat pesanan, lisensi produk digital, dan preferensi akun Anda.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-stone-900 text-stone-100 font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
        >
          Masuk ke Akun
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Breadcrumb & Title */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <Link href="/" className="hover:text-stone-900 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-stone-800 font-medium">Akun Saya</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Ruang Pribadi & Profil
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Kelola data diri, pantau pesanan, atau hubungi pemilik toko.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 bg-white/95 rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-sm space-y-6">
          <div className="flex items-center gap-3.5 pb-5 border-b border-stone-100">
            <div className="w-12 h-12 rounded-xl bg-stone-900 text-amber-200 font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-sm border border-stone-800">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <h3 className="font-serif font-bold text-base text-stone-900 truncate">
                {user.name}
              </h3>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                {user.role === "ADMIN" ? "Pemilik Toko (Admin)" : "Pelanggan Terdaftar"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-amber-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-amber-800" />
                  <span>Buka Dashboard Pemilik</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
              </Link>
            )}

            <Link
              href="/account"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-900 bg-stone-100/90 border border-stone-200"
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-stone-800" />
                <span>Pengaturan Profil</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900"></span>
            </Link>

            <Link
              href="/account/orders"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-4 h-4 text-stone-400" />
                <span>Daftar Pesanan & Resi</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <Link
              href="/account/wishlist"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-stone-400" />
                <span>Koleksi Favorit</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <div className="border-t border-stone-100 my-2 pt-2" />

            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-stone-500 hover:text-red-700 hover:bg-red-50/60 text-left transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </aside>

        {/* Profile Form */}
        <div className="lg:col-span-8 bg-white/95 rounded-2xl p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Informasi Pribadi & Kontak
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Data ini digunakan untuk pengiriman barang fisik dan pengiriman lisensi digital.
            </p>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Alamat Email (Akun Utama)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-stone-100/70 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Nomor WhatsApp / Kontak Aktif
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all placeholder:text-stone-400"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Digunakan kurir pengiriman dan konfirmasi pesanan kilat dari JNshop.
              </p>
            </div>

            {/* Change Password Section */}
            <div className="pt-5 border-t border-stone-100 space-y-4">
              <div>
                <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-stone-700" />
                  Keamanan & Kata Sandi
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Biarkan kosong jika tidak ingin mengubah kata sandi Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Kata Sandi Saat Ini
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-stone-50/60 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs sm:text-sm shadow-sm disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
