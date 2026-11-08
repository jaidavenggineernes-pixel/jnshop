"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  LayoutTemplate,
  FileText,
  Sliders,
  Image as ImageIcon,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();

  // Navigation tab inside settings: "hero" (Konten Beranda) | "identity" (Kontak & Brand) | "ai" (Gemini AI) | "policy" (Syarat & Ketentuan)
  const [activeTab, setActiveTab] = useState<"hero" | "identity" | "ai" | "policy">("hero");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "hero" || tabParam === "identity" || tabParam === "ai" || tabParam === "policy") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // 1. Store identity & Contacts
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

  // 2. AI Settings
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

  // 3. Homepage Hero & Showcase CMS (Shown in User Photo)
  const [heroBadge, setHeroBadge] = useState("Kurasi Khusus • Toko Pribadi & Digital Studio");
  const [heroTitle, setHeroTitle] = useState(
    "Peralatan kerja pilihan & aset digital siap pakai, dibuat dengan rasa & dedikasi."
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Selamat datang di JNshop. Toko independen yang menyediakan workstation ergonomis, periferal berkualitas, dan software boilerplate yang saya uji dan pakai sendiri dalam proyek nyata."
  );
  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState("Lihat Seluruh Koleksi");
  const [heroPrimaryBtnLink, setHeroPrimaryBtnLink] = useState("/products");
  const [heroSecondaryBtnText, setHeroSecondaryBtnText] = useState("⚡ Produk Digital & Lisensi");
  const [heroSecondaryBtnLink, setHeroSecondaryBtnLink] = useState("/categories/produk-digital-lisensi");

  // 4. Trust Guarantees (3 boxes)
  const [guarantee1Title, setGuarantee1Title] = useState("Garansi 7 Hari");
  const [guarantee1Desc, setGuarantee1Desc] = useState("Retur ganti baru / refund");
  const [guarantee2Title, setGuarantee2Title] = useState("0 Detik");
  const [guarantee2Desc, setGuarantee2Desc] = useState("Lisensi digital langsung aktif");
  const [guarantee3Title, setGuarantee3Title] = useState("Personal");
  const [guarantee3Desc, setGuarantee3Desc] = useState("Dukungan pemilik toko");

  // 5. Curated Flagship Showcase Card (Right box in User Photo)
  const [showcaseBadgeLeft, setShowcaseBadgeLeft] = useState("Rekomendasi Minggu Ini");
  const [showcaseBadgeRight, setShowcaseBadgeRight] = useState("Kurasi Edisi 2026");
  const [showcaseImageUrl, setShowcaseImageUrl] = useState(
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
  );
  const [showcaseTagPill, setShowcaseTagPill] = useState("Keychron K2 Pro • Hot-Swap");
  const [showcaseTitle, setShowcaseTitle] = useState("Workstation Setup Terpopuler");
  const [showcaseSubtitle, setShowcaseSubtitle] = useState(
    "Mekanikal keyboard & stand laptop aluminium 360°"
  );
  const [showcaseLinkText, setShowcaseLinkText] = useState("Buka Detail →");
  const [showcaseLinkUrl, setShowcaseLinkUrl] = useState("/products");
  const [showcaseConsultText, setShowcaseConsultText] = useState("Butuh panduan sebelum membeli?");

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

            if (s.heroBadge) setHeroBadge(s.heroBadge);
            if (s.heroTitle) setHeroTitle(s.heroTitle);
            if (s.heroSubtitle) setHeroSubtitle(s.heroSubtitle);
            if (s.heroPrimaryBtnText) setHeroPrimaryBtnText(s.heroPrimaryBtnText);
            if (s.heroPrimaryBtnLink) setHeroPrimaryBtnLink(s.heroPrimaryBtnLink);
            if (s.heroSecondaryBtnText) setHeroSecondaryBtnText(s.heroSecondaryBtnText);
            if (s.heroSecondaryBtnLink) setHeroSecondaryBtnLink(s.heroSecondaryBtnLink);

            if (s.guarantee1Title) setGuarantee1Title(s.guarantee1Title);
            if (s.guarantee1Desc) setGuarantee1Desc(s.guarantee1Desc);
            if (s.guarantee2Title) setGuarantee2Title(s.guarantee2Title);
            if (s.guarantee2Desc) setGuarantee2Desc(s.guarantee2Desc);
            if (s.guarantee3Title) setGuarantee3Title(s.guarantee3Title);
            if (s.guarantee3Desc) setGuarantee3Desc(s.guarantee3Desc);

            if (s.showcaseBadgeLeft) setShowcaseBadgeLeft(s.showcaseBadgeLeft);
            if (s.showcaseBadgeRight) setShowcaseBadgeRight(s.showcaseBadgeRight);
            if (s.showcaseImageUrl) setShowcaseImageUrl(s.showcaseImageUrl);
            if (s.showcaseTagPill) setShowcaseTagPill(s.showcaseTagPill);
            if (s.showcaseTitle) setShowcaseTitle(s.showcaseTitle);
            if (s.showcaseSubtitle) setShowcaseSubtitle(s.showcaseSubtitle);
            if (s.showcaseLinkText) setShowcaseLinkText(s.showcaseLinkText);
            if (s.showcaseLinkUrl) setShowcaseLinkUrl(s.showcaseLinkUrl);
            if (s.showcaseConsultText) setShowcaseConsultText(s.showcaseConsultText);
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
    return `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
      `Halo Kurator ${storeName || "JNshop"}, ini adalah pesan uji koneksi WhatsApp resmi toko.`
    )}`;
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
          // Homepage Hero & Showcase CMS
          heroBadge,
          heroTitle,
          heroSubtitle,
          heroPrimaryBtnText,
          heroPrimaryBtnLink,
          heroSecondaryBtnText,
          heroSecondaryBtnLink,
          guarantee1Title,
          guarantee1Desc,
          guarantee2Title,
          guarantee2Desc,
          guarantee3Title,
          guarantee3Desc,
          showcaseBadgeLeft,
          showcaseBadgeRight,
          showcaseImageUrl,
          showcaseTagPill,
          showcaseTitle,
          showcaseSubtitle,
          showcaseLinkText,
          showcaseLinkUrl,
          showcaseConsultText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
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
        <span>Memuat pengaturan lengkap dan modul CMS toko...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-widest">
            <Sliders className="w-3.5 h-3.5" />
            <span>Pusat Kendali Konten Toko (CMS & Settings)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-serif mt-1">
            Manajemen Konten & Tampilan Website
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Ubah headline hero banner, rekomendasi produk unggulan, tombol aksi, kontak WhatsApp, hingga teks garansi tanpa perlu membuka kode program.
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
            <span>{saving ? "Menyimpan ke Seluruh Website..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Semua Perubahan Berhasil Disimpan & Live!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Konten banner beranda, produk unggulan, teks garansi, dan kontak WhatsApp telah diperbarui langsung di halaman publik toko.
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

      {/* Primary Category Tabs: Hero CMS / Identity / AI / Policies */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "hero"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900"
            }`}
          >
            <LayoutTemplate className="w-4 h-4 text-amber-400" />
            <span>1. Konten Beranda & Hero Banner (CMS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "identity"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900"
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>2. Identitas Brand & Kontak WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ai"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>3. Google Gemini AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "policy"
                ? "bg-stone-900 text-white shadow-xs"
                : "bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900"
            }`}
          >
            <FileText className="w-4 h-4 text-stone-400" />
            <span>4. Kebijakan & Ketentuan Layanan</span>
          </button>
        </div>

        {/* View Mode & Device Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === "split"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="Editor & Pratinjau Berdampingan"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("form")}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === "form"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="Formulir Editor Saja"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Form</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === "preview"
                  ? "bg-white text-stone-900 font-bold shadow-xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="Layar Pratinjau Penuh"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Preview</span>
            </button>
          </div>

          {viewMode !== "form" && (
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  previewDevice === "desktop"
                    ? "bg-white text-stone-900 font-bold shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Layar Komputer Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  previewDevice === "mobile"
                    ? "bg-white text-stone-900 font-bold shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Layar Smartphone Mobile"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Editor + Right Live Preview */}
      <div
        className={`grid gap-6 ${
          viewMode === "split"
            ? "grid-cols-1 xl:grid-cols-12 items-start"
            : "grid-cols-1"
        }`}
      >
        {/* LEFT COLUMN: THE COMPREHENSIVE FORM EDITOR */}
        {viewMode !== "preview" && (
          <form
            onSubmit={handleSave}
            className={`space-y-6 text-xs ${
              viewMode === "split" ? "xl:col-span-6" : "max-w-4xl mx-auto"
            }`}
          >
            {/* TAB 1: HOMEPAGE HERO CMS (AS SHOWN IN USER PHOTO) */}
            {activeTab === "hero" && (
              <div className="space-y-6 animate-in fade-in">
                {/* 1.1 Headline & Main Narrative */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-amber-600" />
                      <h2 className="font-bold text-sm text-stone-900 font-serif">
                        Teks Judul & Narasi Utama Beranda
                      </h2>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">
                      Elemen Kiri Banner Utama
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Label Badge Atas (Pill Tag)
                    </label>
                    <input
                      type="text"
                      value={heroBadge}
                      onChange={(e) => setHeroBadge(e.target.value)}
                      placeholder="Contoh: Kurasi Khusus • Toko Pribadi & Digital Studio"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Teks dengan titik indikator kecil di atas judul utama.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Headline Utama (Judul Besar) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="Contoh: Peralatan kerja pilihan & aset digital siap pakai, dibuat dengan rasa & dedikasi."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 font-serif font-bold text-stone-900 leading-snug"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Teks paling mencolok yang pertama kali dibaca oleh pembeli saat membuka website.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">
                      Paragraf Narasi / Penjelasan Toko
                    </label>
                    <textarea
                      rows={3}
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="Selamat datang di JNshop. Toko independen yang menyediakan workstation ergonomis..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400 leading-relaxed text-stone-700"
                    />
                  </div>
                </div>

                {/* 1.2 Call to Action Buttons */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                  <h2 className="font-bold text-sm text-stone-900 font-serif border-b border-stone-100 pb-3">
                    Tombol Aksi Banner (Call-to-Action)
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3 p-3.5 bg-stone-50/70 rounded-2xl border border-stone-200/60">
                      <div className="text-[11px] font-bold text-stone-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stone-900" />
                        <span>Tombol Utama (Hitam Gelap)</span>
                      </div>
                      <div>
                        <label className="block font-medium text-stone-600 mb-1 text-[11px]">
                          Teks Tombol
                        </label>
                        <input
                          type="text"
                          value={heroPrimaryBtnText}
                          onChange={(e) => setHeroPrimaryBtnText(e.target.value)}
                          placeholder="Lihat Seluruh Koleksi"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-stone-400"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-600 mb-1 text-[11px]">
                          URL Link Tujuan
                        </label>
                        <input
                          type="text"
                          value={heroPrimaryBtnLink}
                          onChange={(e) => setHeroPrimaryBtnLink(e.target.value)}
                          placeholder="/products"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-stone-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-3.5 bg-stone-50/70 rounded-2xl border border-stone-200/60">
                      <div className="text-[11px] font-bold text-stone-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-white border border-stone-400" />
                        <span>Tombol Kedua (Putih Border)</span>
                      </div>
                      <div>
                        <label className="block font-medium text-stone-600 mb-1 text-[11px]">
                          Teks Tombol
                        </label>
                        <input
                          type="text"
                          value={heroSecondaryBtnText}
                          onChange={(e) => setHeroSecondaryBtnText(e.target.value)}
                          placeholder="⚡ Produk Digital & Lisensi"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-stone-400"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-600 mb-1 text-[11px]">
                          URL Link Tujuan
                        </label>
                        <input
                          type="text"
                          value={heroSecondaryBtnLink}
                          onChange={(e) => setHeroSecondaryBtnLink(e.target.value)}
                          placeholder="/categories/produk-digital-lisensi"
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-stone-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.3 Trust Guarantees (3 Boxes at bottom of Hero) */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h2 className="font-bold text-sm text-stone-900 font-serif">
                      3 Poin Jaminan & Kepercayaan Toko
                    </h2>
                    <span className="text-[10px] text-stone-400">
                      Terletak di bawah tombol banner
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-2">
                      <span className="font-bold text-stone-700 text-[11px]">Kotak 1</span>
                      <input
                        type="text"
                        value={guarantee1Title}
                        onChange={(e) => setGuarantee1Title(e.target.value)}
                        placeholder="Garansi 7 Hari"
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={guarantee1Desc}
                        onChange={(e) => setGuarantee1Desc(e.target.value)}
                        placeholder="Retur ganti baru / refund"
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-[11px] text-stone-500"
                      />
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-2">
                      <span className="font-bold text-stone-700 text-[11px]">Kotak 2</span>
                      <input
                        type="text"
                        value={guarantee2Title}
                        onChange={(e) => setGuarantee2Title(e.target.value)}
                        placeholder="0 Detik"
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={guarantee2Desc}
                        onChange={(e) => setGuarantee2Desc(e.target.value)}
                        placeholder="Lisensi digital langsung aktif"
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-[11px] text-stone-500"
                      />
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 space-y-2">
                      <span className="font-bold text-stone-700 text-[11px]">Kotak 3</span>
                      <input
                        type="text"
                        value={guarantee3Title}
                        onChange={(e) => setGuarantee3Title(e.target.value)}
                        placeholder="Personal"
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={guarantee3Desc}
                        onChange={(e) => setGuarantee3Desc(e.target.value)}
                        placeholder="Dukungan pemilik toko"
                        className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1 text-[11px] text-stone-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 1.4 Curated Flagship Showcase Card (The Card on the Right of Photo) */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <h2 className="font-bold text-sm text-stone-900 font-serif">
                        Kartu Produk Rekomendasi Unggulan (Kanan Banner)
                      </h2>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      Sesuai Foto Unggahan Anda
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                        Badge Header Kiri (Dot Hijau)
                      </label>
                      <input
                        type="text"
                        value={showcaseBadgeLeft}
                        onChange={(e) => setShowcaseBadgeLeft(e.target.value)}
                        placeholder="Rekomendasi Minggu Ini"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                        Badge Header Kanan
                      </label>
                      <input
                        type="text"
                        value={showcaseBadgeRight}
                        onChange={(e) => setShowcaseBadgeRight(e.target.value)}
                        placeholder="Kurasi Edisi 2026"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                      URL Gambar Foto Produk Unggulan
                    </label>
                    <input
                      type="text"
                      value={showcaseImageUrl}
                      onChange={(e) => setShowcaseImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-stone-400">Preset Foto Cepat:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setShowcaseImageUrl(
                            "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
                          )
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                      >
                        Keyboard Mekanikal
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShowcaseImageUrl(
                            "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80"
                          )
                        }
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                      >
                        Stand Laptop
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                        Tag Pill di Atas Foto
                      </label>
                      <input
                        type="text"
                        value={showcaseTagPill}
                        onChange={(e) => setShowcaseTagPill(e.target.value)}
                        placeholder="Keychron K2 Pro • Hot-Swap"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                        Judul Produk Kartu
                      </label>
                      <input
                        type="text"
                        value={showcaseTitle}
                        onChange={(e) => setShowcaseTitle(e.target.value)}
                        placeholder="Workstation Setup Terpopuler"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                      Deskripsi / Subtitle Kartu
                    </label>
                    <input
                      type="text"
                      value={showcaseSubtitle}
                      onChange={(e) => setShowcaseSubtitle(e.target.value)}
                      placeholder="Mekanikal keyboard & stand laptop aluminium 360°"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                        Teks Tombol Link
                      </label>
                      <input
                        type="text"
                        value={showcaseLinkText}
                        onChange={(e) => setShowcaseLinkText(e.target.value)}
                        placeholder="Buka Detail →"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                        URL Tujuan Link
                      </label>
                      <input
                        type="text"
                        value={showcaseLinkUrl}
                        onChange={(e) => setShowcaseLinkUrl(e.target.value)}
                        placeholder="/products"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-800 mb-1 text-[11px]">
                      Teks Kotak Tanya Owner
                    </label>
                    <input
                      type="text"
                      value={showcaseConsultText}
                      onChange={(e) => setShowcaseConsultText(e.target.value)}
                      placeholder="Butuh panduan sebelum membeli?"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BRAND IDENTITY & WHATSAPP CONTACTS */}
            {activeTab === "identity" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Brand Info */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                  <h2 className="font-bold text-sm text-stone-900 font-serif border-b border-stone-100 pb-3">
                    Identitas Brand Toko
                  </h2>

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
                      Deskripsi Toko di Footer
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>
                </div>

                {/* WhatsApp & Contact */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                  <div className="border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <h2 className="font-bold text-sm text-stone-900 font-serif">
                        Kontak WhatsApp & Saluran Komunikasi
                      </h2>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Nomor ini diterapkan ke tombol WhatsApp floating, header, footer, dan invoice pesanan.
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
                          WA Aktif
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Format internasional tanpa spasi/plus (contoh: <strong>6285191219129</strong>).
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
              </div>
            )}

            {/* TAB 3: GOOGLE GEMINI AI */}
            {activeTab === "ai" && (
              <div className="space-y-6 animate-in fade-in">
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
              </div>
            )}

            {/* TAB 4: POLICIES & TERMS */}
            {activeTab === "policy" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs space-y-4">
                  <h2 className="font-bold text-sm text-stone-900 font-serif border-b border-stone-100 pb-3">
                    Kebijakan & Garansi Toko
                  </h2>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Syarat & Ketentuan Layanan
                    </label>
                    <textarea
                      rows={3}
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
                      rows={3}
                      value={returnPolicy}
                      onChange={(e) => setReturnPolicy(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Kebijakan Privasi Pelanggan
                    </label>
                    <textarea
                      rows={3}
                      value={privacyPolicy}
                      onChange={(e) => setPrivacyPolicy(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save Action Button Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-semibold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan ke Seluruh Website..." : "Simpan Perubahan & Publikasikan"}</span>
              </button>
            </div>
          </form>
        )}

        {/* RIGHT COLUMN: THE LIVE INTERACTIVE PREVIEW PANE (ACCURATELY MATCHING USER PHOTO) */}
        {viewMode !== "form" && (
          <div
            className={`space-y-4 ${
              viewMode === "split" ? "xl:col-span-6 xl:sticky xl:top-6" : "max-w-4xl mx-auto w-full"
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between bg-stone-900 text-stone-200 px-4 py-2.5 rounded-2xl text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white">
                  Pratinjau Toko Real-Time (Sesuai Foto Unggahan)
                </span>
              </div>
              <span className="text-[10px] text-amber-300 font-medium">
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
              {/* Browser or Phone Frame Header */}
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
              <div className="max-h-[820px] overflow-y-auto divide-y divide-stone-200/80 text-stone-800 font-sans">
                
                {/* 1. Live Top Announcement Bar */}
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
                    <span className="text-[10px] px-2 py-1 rounded-md bg-stone-900 text-white font-medium">
                      Keranjang (0)
                    </span>
                  </div>
                </div>

                {/* 3. THE LIVE HERO SECTION (MATCHING USER PHOTO EXACTLY) */}
                <div className="p-4 sm:p-6 bg-[#f4f2ec] space-y-4">
                  {/* Left Narrative Preview */}
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-200/80 border border-stone-300 text-stone-800 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>{heroBadge}</span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-stone-900 font-serif leading-tight">
                      {heroTitle}
                    </h2>

                    <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed font-normal">
                      {heroSubtitle}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="px-4 py-2 rounded-xl bg-[#1c1917] text-[#faf9f6] font-bold text-[11px] flex items-center gap-1.5 shadow-xs">
                        <span>{heroPrimaryBtnText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-white text-stone-800 font-semibold text-[11px] border border-stone-300 shadow-xs">
                        <span>{heroSecondaryBtnText}</span>
                      </div>
                    </div>

                    {/* 3 Guarantees */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-200">
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                          {guarantee1Title}
                        </div>
                        <div className="text-[9px] text-stone-500 truncate">{guarantee1Desc}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                          {guarantee2Title}
                        </div>
                        <div className="text-[9px] text-stone-500 truncate">{guarantee2Desc}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                          {guarantee3Title}
                        </div>
                        <div className="text-[9px] text-stone-500 truncate">{guarantee3Desc}</div>
                      </div>
                    </div>
                  </div>

                  {/* Curated Flagship Showcase Card Preview (The Key Item in Photo) */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-md space-y-3.5 mt-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                          {showcaseBadgeLeft}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold text-stone-400">
                        {showcaseBadgeRight}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 relative group">
                        <img
                          src={showcaseImageUrl}
                          alt={showcaseTitle}
                          className="w-full h-full object-cover"
                        />
                        {showcaseTagPill && (
                          <div className="absolute bottom-2 left-2 bg-[#1c1917]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold">
                            {showcaseTagPill}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {showcaseTitle}
                          </h4>
                          <p className="text-[10px] text-stone-500 truncate">
                            {showcaseSubtitle}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-stone-800 underline shrink-0">
                          {showcaseLinkText}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-[10px]">
                      <span className="text-stone-600 truncate">{showcaseConsultText}</span>
                      <a
                        href={whatsappTestUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0 ml-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Tanya Owner (+{cleanWhatsapp})</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4. Live Footer Preview */}
                <div className="p-4 sm:p-5 bg-[#1c1917] text-stone-400 space-y-3 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-stone-800 text-amber-200 flex items-center justify-center font-bold text-[10px] border border-stone-700">
                      {storeName.substring(0, 2).toUpperCase() || "JN"}
                    </div>
                    <span className="font-bold text-stone-100 text-xs font-serif">
                      {storeName || "JNshop"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-stone-800 space-y-1">
                    <div>WhatsApp Resmi: <span className="text-amber-300 font-mono">+{cleanWhatsapp}</span></div>
                    <div>Email: <span className="text-stone-300">{email || "owner@jnshop.com"}</span></div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 text-[9px] text-stone-500">
                    © {new Date().getFullYear()} {storeName || "JNshop"}. All rights reserved.
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Tip */}
            <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200/80 text-[11px] text-stone-600 flex items-center justify-between">
              <span>
                💡 Begitu Anda menekan <strong>Simpan Perubahan</strong>, seluruh teks di beranda toko publik langsung berubah tanpa perlu menyentuh kodingan.
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="text-stone-900 font-bold underline underline-offset-2 ml-2 hover:text-amber-700 shrink-0"
              >
                Simpan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
