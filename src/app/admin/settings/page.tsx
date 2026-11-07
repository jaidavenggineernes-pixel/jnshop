"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("JNshop");
  const [tagLine, setTagLine] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bannerAnnouncement, setBannerAnnouncement] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");

  // AI Settings
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          const s = data.setting;
          if (s) {
            setStoreName(s.storeName || "JNshop");
            setTagLine(s.tagLine || "");
            setDescription(s.description || "");
            setEmail(s.email || "");
            setPhone(s.phone || "");
            setWhatsappNumber(s.whatsappNumber || "");
            setAddress(s.address || "");
            setBannerAnnouncement(s.bannerAnnouncement || "");
            setTermsAndConditions(s.termsAndConditions || "");
            setPrivacyPolicy(s.privacyPolicy || "");
            setReturnPolicy(s.returnPolicy || "");
            setGeminiApiKey(s.geminiApiKey || "");
            setAiModel(s.aiModel || "gemini-2.5-flash");
          }
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleTestAi = async () => {
    if (!geminiApiKey.trim()) {
      setAiTestResult({
        success: false,
        error: "Masukkan Google Gemini API Key terlebih dahulu sebelum menguji.",
      });
      return;
    }

    setTestingAi(true);
    setAiTestResult(null);

    try {
      const res = await fetch("/api/admin/settings/test-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey.trim(),
          model: aiModel,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiTestResult({
          success: true,
          message: data.message,
          latencyMs: data.latencyMs,
        });
      } else {
        setAiTestResult({
          success: false,
          error: data.error || "Gagal menguji koneksi ke Google Gemini.",
        });
      }
    } catch (e: any) {
      setAiTestResult({
        success: false,
        error: e.message || "Terjadi kesalahan jaringan saat menguji AI.",
      });
    } finally {
      setTestingAi(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          tagLine,
          description,
          email,
          phone,
          whatsappNumber,
          address,
          bannerAnnouncement,
          termsAndConditions,
          privacyPolicy,
          returnPolicy,
          geminiApiKey: geminiApiKey.trim(),
          aiModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Memuat pengaturan...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pengaturan Identitas & Konfigurasi JNshop
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Atur nama brand toko, WhatsApp admin, alamat, integrasi Google Gemini AI, dan ketentuan layanan.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Pengaturan toko dan konfigurasi AI berhasil diperbarui!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Google Gemini AI Configuration Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/50 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base text-white flex items-center gap-2">
                  <span>AI Shopping Assistant (Google Gemini)</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      geminiApiKey ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    }`}
                  >
                    {geminiApiKey ? "🟢 Gemini Cloud AI Aktif" : "🟡 Mesin Lokal Cerdas Aktif"}
                  </span>
                </h2>
                <p className="text-[11px] text-indigo-200">
                  Menggerakkan asisten belanja interaktif real-time di storefront JNshop untuk melayani pembeli.
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white text-xs font-semibold transition-all border border-white/10"
            >
              <span>Dapatkan Free Gemini Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block font-semibold text-indigo-100">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-indigo-950/80 border border-indigo-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder:text-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-indigo-300/80">
                Kunci ini disimpan aman di database toko Anda. Jika dibiarkan kosong, AI JNshop otomatis berjalan dalam mode <strong>Mesin Lokal Cerdas</strong> berkecepatan tinggi tanpa batasan kuota.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-indigo-100">
                Model AI yang Dipilih
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-indigo-950/80 border border-indigo-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sangat Cepat & Cerdas)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Stabil)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Penalaran Kompleks)</option>
              </select>
              <p className="text-[10px] text-indigo-300/80">Rekomendasi: gemini-2.5-flash untuk respon instan.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestAi}
              disabled={testingAi || !geminiApiKey.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${testingAi ? "animate-spin" : ""}`} />
              <span>{testingAi ? "Menguji Koneksi..." : "Uji Koneksi Gemini API"}</span>
            </button>

            {aiTestResult && (
              <div
                className={`flex-1 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  aiTestResult.success
                    ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200"
                    : "bg-red-500/20 border border-red-400/40 text-red-200"
                }`}
              >
                {aiTestResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <div>
                      <strong>Terhubung Sukses!</strong> ({aiTestResult.latencyMs}ms): &quot;
                      {aiTestResult.message}&quot;
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
                    <div className="truncate">{aiTestResult.error}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Identitas Brand Toko
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Toko *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Toko</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Kontak Resmi & Alamat
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Toko</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Admin (Format: 628...)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Alamat Fisik Toko</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pengumuman Banner Beranda (Announcement Bar)
            </label>
            <input
              type="text"
              value={bannerAnnouncement}
              onChange={(e) => setBannerAnnouncement(e.target.value)}
              placeholder="Contoh: Diskon 15% kode JNSHOPNEW..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
            />
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Syarat, Ketentuan & Kebijakan Toko
          </h2>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Syarat & Ketentuan</label>
            <textarea
              rows={3}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kebijakan Garansi & Pengembalian Barang (Retur)
            </label>
            <textarea
              rows={3}
              value={returnPolicy}
              onChange={(e) => setReturnPolicy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Pengaturan Toko & AI"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
