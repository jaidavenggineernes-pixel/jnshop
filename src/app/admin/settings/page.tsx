"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Store,
  Smartphone,
  Monitor,
  RotateCcw,
  ShieldCheck,
  Package,
  Lock,
  ArrowRight,
  Split,
  Eye as EyeIcon,
} from "lucide-react";

export default function AdminSettingsPage() {
  // Store identity state
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

  // Layout View mode: "split" (both) | "form" (editor only) | "preview" (preview only)
  const [viewMode, setViewMode] = useState<"split" | "form" | "preview">("split");
  // Preview device: "desktop" | "mobile"
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

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

  // Sanitized WhatsApp numbers for live testing
  const cleanWhatsapp = useMemo(() => {
    return (whatsappNumber || "6285191219129").replace(/\D/g, "");
  }, [whatsappNumber]);

  const whatsappTestUrl = useMemo(() => {
    return `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Halo Kurator ${storeName || "JNshop"}, ini adalah pesan uji koneksi WhatsApp resmi toko.`)}`;
  }, [cleanWhatsapp, storeName]);

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
          whatsappNumber: cleanWhatsapp,
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
      setTimeout(() => setSuccess(false), 4500);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-stone-400">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mx-auto mb-3" />
        <span>Memuat pengaturan dan pratinjau toko...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-widest">
            <Store className="w-3.5 h-3.5" />
            <span>Konfigurasi & Identitas Toko</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif mt-1">
            Pengaturan & Pratinjau Toko
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Ubah nama brand, nomor telepon, WhatsApp kurator, banner pengumuman, dan amati perubahan secara langsung di panel pratinjau toko.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            <span>Buka Toko Asli (Tab Baru)</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold shadow-sm disabled:opacity-50 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Pengaturan Berhasil Disimpan & Diperbarui!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Nomor telepon, WhatsApp, dan identitas toko telah diterapkan secara live ke seluruh halaman storefront toko.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="text-stone-400 hover:text-stone-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Toolbar: View Mode & Preview Device Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        {/* View Mode */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "split"
                ? "bg-white text-stone-900 font-bold shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Editor & Pratinjau (Split)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("form")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "form"
                ? "bg-white text-stone-900 font-bold shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Formulir Editor Saja</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "preview"
                ? "bg-white text-stone-900 font-bold shadow-xs"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <EyeIcon className="w-3.5 h-3.5" />
            <span>Layar Pratinjau Penuh</span>
          </button>
        </div>

        {/* Device Switcher for Preview */}
        {viewMode !== "form" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 text-[11px] font-medium hidden sm:inline">
              Mode Layar Pratinjau:
            </span>
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  previewDevice === "desktop"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Tampilan Desktop / Laptop"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  previewDevice === "mobile"
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Tampilan Mobile Smartphone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Mobile</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Split Grid */}
      <div
        className={`grid gap-6 ${
          viewMode === "split"
            ? "grid-cols-1 xl:grid-cols-12 items-start"
            : "grid-cols-1"
        }`}
      >
        {/* LEFT COLUMN: The Settings Form */}
        {viewMode !== "preview" && (
          <form
            onSubmit={handleSave}
            className={`space-y-6 text-xs ${
              viewMode === "split" ? "xl:col-span-6" : "max-w-4xl mx-auto"
            }`}
          >
            {/* Google Gemini AI Configuration Card */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-stone-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-indigo-800/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/60 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Google Gemini AI</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          geminiApiKey
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        }`}
                      >
                        {geminiApiKey ? "🟢 Gemini Cloud Aktif" : "🟡 Mesin Cerdas Aktif"}
                      </span>
                    </h2>
                    <p className="text-[10px] text-indigo-200">
                      Menggerakkan asisten belanja interaktif real-time di etalase toko.
                    </p>
                  </div>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white text-[11px] font-semibold transition-all border border-white/10 shrink-0"
                >
                  <span>Free Gemini Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-indigo-100 text-[11px]">
                    Google Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-indigo-950/70 border border-indigo-700/70 rounded-xl pl-3 pr-10 py-2 text-xs text-white placeholder:text-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-semibold text-indigo-100 text-[11px]">
                      Model AI
                    </label>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      className="w-full bg-indigo-950/70 border border-indigo-700/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cepat & Cerdas)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Stabil)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Penalaran Berat)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleTestAi}
                      disabled={testingAi || !geminiApiKey.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-sm"
                    >
                      <Zap className={`w-3.5 h-3.5 ${testingAi ? "animate-spin" : ""}`} />
                      <span>{testingAi ? "Menguji..." : "Uji Koneksi Gemini"}</span>
                    </button>
                  </div>
                </div>

                {aiTestResult && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] flex items-center gap-2 ${
                      aiTestResult.success
                        ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200"
                        : "bg-rose-500/20 border border-rose-400/40 text-rose-200"
                    }`}
                  >
                    {aiTestResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                        <div className="truncate">
                          <strong>Terhubung Sukses!</strong> ({aiTestResult.latencyMs}ms): &quot;
                          {aiTestResult.message}&quot;
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                        <div className="truncate">{aiTestResult.error}</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Brand Identity Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="font-bold text-sm text-stone-900 font-serif">
                  Identitas Brand Toko
                </h2>
                <span className="text-[10px] text-stone-400">
                  Pratinjau langsung di sebelah kanan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nama Toko *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Contoh: JNshop"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tagline Toko
                  </label>
                  <input
                    type="text"
                    value={tagLine}
                    onChange={(e) => setTagLine(e.target.value)}
                    placeholder="Contoh: Toko Online Pribadi Terpercaya"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Deskripsi Singkat Toko
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi yang muncul di footer dan pengantar beranda..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Contact & WhatsApp (Primary Focus) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <h2 className="font-bold text-sm text-stone-900 font-serif">
                    Kontak WhatsApp & Saluran Komunikasi
                  </h2>
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Nomor ini digunakan untuk tombol WhatsApp floating, header toko, footer, dan konfirmasi pesanan pembeli.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    WhatsApp Admin / Kurator *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="6285191219129"
                      className="w-full bg-emerald-50/40 border border-emerald-300 text-stone-900 rounded-xl pl-3.5 pr-20 py-2.5 text-xs font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      WA Resmi
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Gunakan format internasional tanpa tanda plus, misal: <strong>6285191219129</strong>.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Nomor Telepon Tampilan
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 851-9121-9129"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Format rapi untuk ditampilkan pada label teks website.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Email Resmi Toko
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@jnshop.com"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Alamat Fisik / Workshop
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jakarta Selatan, DKI Jakarta"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Banner Pengumuman Atas (Announcement Bar)
                </label>
                <input
                  type="text"
                  value={bannerAnnouncement}
                  onChange={(e) => setBannerAnnouncement(e.target.value)}
                  placeholder="🎉 PROMO: Gunakan voucher JNSHOPNEW untuk diskon 15%!"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Policies Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
              <h2 className="font-bold text-sm text-stone-900 font-serif border-b border-stone-100 pb-3">
                Kebijakan & Garansi Toko
              </h2>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Syarat & Ketentuan Layanan
                </label>
                <textarea
                  rows={2}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Kebijakan Garansi & Retur 7 Hari
                </label>
                <textarea
                  rows={2}
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan ke Seluruh Website..." : "Simpan Pengaturan Toko & AI"}</span>
              </button>
            </div>
          </form>
        )}

        {/* RIGHT COLUMN: The Interactive Live Page Preview */}
        {viewMode !== "form" && (
          <div
            className={`space-y-4 ${
              viewMode === "split" ? "xl:col-span-6 xl:sticky xl:top-6" : "max-w-4xl mx-auto w-full"
            }`}
          >
            {/* Preview Banner Header */}
            <div className="flex items-center justify-between bg-stone-900 text-stone-200 px-4 py-2.5 rounded-2xl text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">Pratinjau Halaman Toko (Live Preview)</span>
              </div>
              <span className="text-[10px] text-stone-400">
                Berubah seketika saat Anda mengetik
              </span>
            </div>

            {/* Preview Device Mockup Container */}
            <div
              className={`transition-all duration-300 mx-auto ${
                previewDevice === "mobile"
                  ? "max-w-sm rounded-[2.5rem] border-[10px] border-stone-800 shadow-2xl overflow-hidden bg-[#faf9f6]"
                  : "w-full rounded-2xl border border-stone-300 shadow-xl overflow-hidden bg-[#faf9f6]"
              }`}
            >
              {/* Browser / Phone Top Notch bar */}
              {previewDevice === "desktop" ? (
                <div className="bg-stone-200/90 border-b border-stone-300 px-4 py-2 flex items-center gap-2 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 mx-2 bg-white rounded-md py-0.5 px-3 text-[11px] text-stone-500 font-mono text-center border border-stone-300 truncate">
                    https://{storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "jnshop"}.com
                  </div>
                </div>
              ) : (
                <div className="bg-stone-900 text-white pt-2 pb-1 px-6 flex items-center justify-between text-[10px]">
                  <span>09:41</span>
                  <div className="w-16 h-3 bg-stone-800 rounded-full" />
                  <span>5G 100%</span>
                </div>
              )}

              {/* Scrollable Inside Preview Content */}
              <div className="max-h-[750px] overflow-y-auto divide-y divide-stone-200/80 text-stone-800 font-sans">
                
                {/* 1. Live Announcement Bar */}
                <div className="bg-[#1c1917] text-stone-300 text-[10px] sm:text-[11px] py-1.5 px-3 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate">
                      {bannerAnnouncement || "Koleksi Alat Kerja & Solusi Digital Terkurasi"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 shrink-0 ml-auto">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span>+{cleanWhatsapp}</span>
                    </span>
                  </div>
                </div>

                {/* 2. Live Navbar */}
                <div className="bg-[#faf9f6]/95 border-b border-stone-200/90 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1c1917] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {storeName.substring(0, 2).toUpperCase() || "JN"}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-stone-900 leading-tight">
                        {storeName || "JNshop"}
                      </div>
                      <div className="text-[8px] uppercase tracking-wider text-stone-400 font-medium">
                        {tagLine || "Boutique & Atelier"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-1 rounded-md bg-stone-100 text-stone-700 font-medium">
                      Katalog
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-md bg-stone-100 text-stone-700 font-medium hidden sm:inline">
                      Digital
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-md bg-stone-900 text-white font-medium">
                      Keranjang (0)
                    </span>
                  </div>
                </div>

                {/* 3. Live Hero Preview */}
                <div className="p-4 sm:p-6 bg-[#f4f2ec] space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>Kurasi Terpercaya • {storeName || "JNshop"}</span>
                  </div>

                  <h3 className="font-serif text-base sm:text-xl font-bold text-stone-900 leading-tight">
                    Peralatan kerja & aset digital terdepan.
                  </h3>

                  <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">
                    {description || "Toko independen yang menyediakan workstation ergonomis, periferal berkualitas, dan software berstandar produksi."}
                  </p>
                </div>

                {/* 4. Live WhatsApp & Direct Customer Care Box (THE KEY DEMO) */}
                <div className="p-4 sm:p-5 bg-white space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 font-serif">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Saluran Resmi WhatsApp Kurator</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Aktif Terhubung
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-stone-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-emerald-950 font-bold">
                        WhatsApp: +{cleanWhatsapp}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {phone ? `Telepon: ${phone}` : "Respon ramah 08:00 - 22:00 WIB"}
                      </div>
                    </div>

                    <a
                      href={whatsappTestUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Tes Buka WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-600 pt-1">
                    <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-200/70 truncate">
                      <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{email || "owner@jnshop.com"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-50 p-2 rounded-xl border border-stone-200/70 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{address || "Jakarta, Indonesia"}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Live AI Assistant Chat Escalation Bar Preview */}
                <div className="p-3 bg-stone-50 space-y-2">
                  <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                    Pratinjau Widget AI Belanja
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-900 font-medium flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Butuh bantuan manusia langsung?</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                      WhatsApp (+{cleanWhatsapp})
                    </span>
                  </div>
                </div>

                {/* 6. Live Boutique Footer Preview */}
                <div className="p-4 sm:p-6 bg-[#1c1917] text-stone-400 space-y-4 text-[11px]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-stone-800 text-amber-200 flex items-center justify-center font-bold text-xs border border-stone-700">
                      {storeName.substring(0, 2).toUpperCase() || "JN"}
                    </div>
                    <div>
                      <div className="font-bold text-stone-100 text-xs font-serif">
                        {storeName || "JNshop"}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-amber-400/80">
                        {tagLine || "Boutique & Atelier"}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400 leading-relaxed">
                    {description || "Ruang belanja mandiri dengan kurasi peralatan meja kerja ergonomis, gawai pilihan, serta aset digital berkualitas tinggi."}
                  </p>

                  <div className="pt-2 border-t border-stone-800 space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">WhatsApp Resmi:</span>
                      <span className="text-amber-300 font-semibold font-mono">
                        +{cleanWhatsapp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">Email:</span>
                      <span className="text-stone-300">{email || "owner@jnshop.com"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-500">Alamat:</span>
                      <span className="text-stone-300">{address || "Jakarta, Indonesia"}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[9px] text-stone-500">
                    <span>© {new Date().getFullYear()} {storeName || "JNshop"}</span>
                    <span>Transaksi Terenkripsi 256-Bit</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Help Tip */}
            <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between">
              <span>
                💡 Begitu Anda menekan <strong>Simpan Perubahan</strong>, server otomatis merevalidasi cache sehingga etalase publik langsung terbarui.
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-stone-900 font-bold underline underline-offset-2 ml-2 hover:text-amber-700 shrink-0"
              >
                Simpan Sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
