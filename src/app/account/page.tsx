"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  const { user, logout, refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil.");
      }

      setSuccessMsg("Profil akun Anda berhasil diperbarui.");
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
        <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center mx-auto">
          <User className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Masuk ke Akun Anda</h1>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Masuk untuk melihat riwayat pesanan, mengunduh lisensi digital, dan mengelola profil.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center min-h-[44px] px-6 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
        >
          Masuk Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 mb-1.5">
            <Link href="/" className="hover:text-zinc-900">
              Beranda
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-zinc-900 font-semibold">Akun Saya</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Pengaturan Akun
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Kelola informasi kontak dan kata sandi akun Anda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="min-h-[40px] px-4 rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 text-xs font-semibold inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Account Navigation Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-zinc-200 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-zinc-900 text-sm truncate">{user.name}</h2>
                <p className="text-xs text-zinc-600 truncate">{user.email}</p>
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-green-50 border border-green-200 text-green-800 text-[11px] font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    Admin Pemilik
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 space-y-1">
              <Link
                href="/account"
                className="flex items-center justify-between min-h-[44px] px-3 rounded-lg bg-zinc-900 text-white text-xs font-semibold"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profil & Keamanan
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center justify-between min-h-[44px] px-3 rounded-lg text-zinc-800 hover:bg-zinc-100 text-xs font-medium"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-zinc-600" />
                  Riwayat Pesanan
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>
              <Link
                href="/account/wishlist"
                className="flex items-center justify-between min-h-[44px] px-3 rounded-lg text-zinc-800 hover:bg-zinc-100 text-xs font-medium"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-zinc-600" />
                  Wishlist Tersimpan
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between min-h-[44px] px-3 rounded-lg bg-green-50 text-green-800 border border-green-200 text-xs font-semibold mt-2"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Buka Panel Admin
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 sm:p-8 border border-zinc-200 space-y-6">
          <h2 className="font-bold text-base text-zinc-900 pb-3 border-b border-zinc-200">
            Data Pribadi & Kata Sandi
          </h2>

          {successMsg && (
            <div className="p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-800 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="account-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  id="account-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                />
              </div>

              <div>
                <label htmlFor="account-phone" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Nomor WhatsApp / HP
                </label>
                <input
                  id="account-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                />
              </div>
            </div>

            <div>
              <label htmlFor="account-email" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Alamat Email
              </label>
              <input
                id="account-email"
                type="email"
                disabled
                value={user.email}
                className="w-full h-11 bg-zinc-100 border border-zinc-200 rounded-lg px-3.5 text-sm text-zinc-600 cursor-not-allowed"
              />
            </div>

            <div className="pt-4 border-t border-zinc-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                <KeyRound className="w-4 h-4 text-green-800" />
                <span>Ubah Kata Sandi (Opsional)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="account-cur-pw" className="block text-xs text-zinc-700 mb-1.5">
                    Kata Sandi Saat Ini
                  </label>
                  <input
                    id="account-cur-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak mengubah"
                    className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                  />
                </div>
                <div>
                  <label htmlFor="account-new-pw" className="block text-xs text-zinc-700 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <input
                    id="account-new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] px-6 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
