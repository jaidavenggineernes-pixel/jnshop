"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Bot,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  MessageCircle,
  Store,
  Smartphone,
  Monitor,
  ArrowRight,
  Split,
  LayoutTemplate,
  FileText,
  Sliders,
  Image as ImageIcon,
  X,
  Mail,
  Send,
} from "lucide-react";

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"hero" | "identity" | "ai" | "email" | "policy">("hero");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "hero" ||
      tabParam === "identity" ||
      tabParam === "ai" ||
      tabParam === "email" ||
      tabParam === "policy"
    ) {
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

  // 2b. Email & QRIS Notification Settings
  const [adminNotificationEmail, setAdminNotificationEmail] = useState("jaidav.enggineernes@gmail.com");
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [emailFrom, setEmailFrom] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [showResendKey, setShowResendKey] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    latencyMs?: number;
  } | null>(null);

  // 3. Homepage Hero & Showcase CMS
  const [heroBadge, setHeroBadge] = useState("Kurasi Khusus | Studio Perangkat & Aset Digital");
  const [heroTitle, setHeroTitle] = useState(
    "Peralatan kerja pilihan & aset digital siap pakai, dibuat dengan rasa & dedikasi."
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Selamat datang di JNshop. Toko independen yang menyediakan workstation ergonomis, periferal berkualitas, dan software boilerplate yang saya uji dan pakai sendiri dalam proyek nyata."
  );
  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState("Lihat Seluruh Koleksi");
  const [heroPrimaryBtnLink, setHeroPrimaryBtnLink] = useState("/products");
  const [heroSecondaryBtnText, setHeroSecondaryBtnText] = useState("Produk Digital & Lisensi");
  const [heroSecondaryBtnLink, setHeroSecondaryBtnLink] = useState("/categories/produk-digital-lisensi");

  // 4. Trust Guarantees
  const [guarantee1Title, setGuarantee1Title] = useState("Garansi 7 Hari");
  const [guarantee1Desc, setGuarantee1Desc] = useState("Retur ganti baru / refund");
  const [guarantee2Title, setGuarantee2Title] = useState("0 Detik");
  const [guarantee2Desc, setGuarantee2Desc] = useState("Lisensi digital langsung aktif");
  const [guarantee3Title, setGuarantee3Title] = useState("Personal");
  const [guarantee3Desc, setGuarantee3Desc] = useState("Dukungan pemilik toko");

  // 5. Curated Flagship Showcase Card
  const [showcaseBadgeLeft, setShowcaseBadgeLeft] = useState("Rekomendasi Minggu Ini");
  const [showcaseBadgeRight, setShowcaseBadgeRight] = useState("Kurasi Edisi 2026");
  const [showcaseImageUrl, setShowcaseImageUrl] = useState(
    "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
  );
  const [showcaseTagPill, setShowcaseTagPill] = useState("Keychron K2 Pro | Hot-Swap");
  const [showcaseTitle, setShowcaseTitle] = useState("Workstation Setup Terpopuler");
  const [showcaseSubtitle, setShowcaseSubtitle] = useState(
    "Mekanikal keyboard & stand laptop aluminium 360"
  );
  const [showcaseLinkText, setShowcaseLinkText] = useState("Buka Detail");
  const [showcaseLinkUrl, setShowcaseLinkUrl] = useState("/products");
  const [showcaseConsultText, setShowcaseConsultText] = useState("Butuh panduan sebelum membeli?");

  // Layout controls
  const [viewMode, setViewMode] = useState<"split" | "form" | "preview">("split");
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
            setAdminNotificationEmail(s.adminNotificationEmail || "jaidav.enggineernes@gmail.com");
            setSmtpHost(s.smtpHost || "smtp.gmail.com");
            setSmtpPort(s.smtpPort ? String(s.smtpPort) : "587");
            setSmtpUser(s.smtpUser || "");
            setSmtpPass(s.smtpPass || "");
            setEmailFrom(s.emailFrom || "");
            setResendApiKey(s.resendApiKey || "");

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

  const cleanWhatsapp = useMemo(() => {
    return (whatsappNumber || "6285191219129").replace(/\D/g, "");
  }, [whatsappNumber]);

  const whatsappTestUrl = useMemo(() => {
    return `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
      `Halo Admin ${storeName || "JNshop"}, ini adalah pesan uji koneksi WhatsApp resmi toko.`
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

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailTestResult(null);

    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminNotificationEmail: adminNotificationEmail.trim(),
          smtpHost: smtpHost.trim(),
          smtpPort: smtpPort.trim(),
          smtpUser: smtpUser.trim(),
          smtpPass: smtpPass.trim(),
          emailFrom: emailFrom.trim(),
          resendApiKey: resendApiKey.trim(),
          targetEmail: adminNotificationEmail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEmailTestResult({
          success: true,
          message: data.message,
          latencyMs: data.latencyMs,
        });
      } else {
        setEmailTestResult({
          success: false,
          error: data.error || "Gagal mengirim email uji coba.",
        });
      }
    } catch (e: any) {
      setEmailTestResult({
        success: false,
        error: e.message || "Terjadi kesalahan jaringan saat menguji email.",
      });
    } finally {
      setTestingEmail(false);
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
          adminNotificationEmail: adminNotificationEmail.trim(),
          smtpHost: smtpHost.trim(),
          smtpPort: smtpPort.trim(),
          smtpUser: smtpUser.trim(),
          smtpPass: smtpPass.trim(),
          emailFrom: emailFrom.trim(),
          resendApiKey: resendApiKey.trim(),
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
      <div className="p-16 text-center text-xs text-zinc-600">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto mb-3" />
        <span>Memuat pengaturan lengkap dan modul CMS toko...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-800 uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            <span>Pusat Kendali Konten Toko (CMS & Pengaturan)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mt-1">
            Manajemen Konten & Tampilan Website
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Ubah headline beranda, produk rekomendasi unggulan, tombol aksi, kontak WhatsApp, hingga teks jaminan tanpa membuka kode program.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-zinc-600" />
            <span>Buka Toko Publik</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-green-800 hover:bg-green-900 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-green-800 shrink-0" />
            <div>
              <p className="font-bold">Semua Perubahan Berhasil Disimpan</p>
              <p className="text-[11px] text-green-800 mt-0.5">
                Konten beranda, kartu rekomendasi, teks jaminan, dan kontak WhatsApp telah diperbarui di halaman publik toko.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            aria-label="Tutup pesan sukses"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-800 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Category Tabs + View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-zinc-200">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "hero"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>1. Konten Beranda & Banner</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "identity"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>2. Identitas & Kontak WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai")}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "ai"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>3. Asisten Gemini AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("policy")}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "policy"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. Kebijakan & Retur</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "email"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>5. Email & Notifikasi QRIS</span>
          </button>
        </div>

        {/* View Mode & Device Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`min-h-[36px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "split"
                  ? "bg-white text-zinc-900 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Editor & Pratinjau Berdampingan"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("form")}
              className={`min-h-[36px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "form"
                  ? "bg-white text-zinc-900 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Formulir Editor Saja"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Form</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`min-h-[36px] px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                viewMode === "preview"
                  ? "bg-white text-zinc-900 font-bold"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              title="Layar Pratinjau Penuh"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Preview</span>
            </button>
          </div>

          {viewMode !== "form" && (
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setPreviewDevice("desktop")}
                aria-label="Mode pratinjau desktop"
                className={`w-9 h-9 rounded-md transition-colors flex items-center justify-center ${
                  previewDevice === "desktop"
                    ? "bg-white text-zinc-900 font-bold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice("mobile")}
                aria-label="Mode pratinjau mobile"
                className={`w-9 h-9 rounded-md transition-colors flex items-center justify-center ${
                  previewDevice === "mobile"
                    ? "bg-white text-zinc-900 font-bold"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Editor + Live Preview */}
      <div
        className={`grid gap-6 ${
          viewMode === "split" ? "grid-cols-1 xl:grid-cols-12 items-start" : "grid-cols-1"
        }`}
      >
        {/* LEFT COLUMN: FORM EDITOR */}
        {viewMode !== "preview" && (
          <form
            onSubmit={handleSave}
            className={`space-y-6 text-xs ${
              viewMode === "split" ? "xl:col-span-6" : "max-w-4xl mx-auto w-full"
            }`}
          >
            {/* TAB 1: HOMEPAGE HERO CMS */}
            {activeTab === "hero" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-green-800" />
                      <h2 className="font-bold text-sm text-zinc-900">
                        Judul & Narasi Utama Beranda
                      </h2>
                    </div>
                    <span className="text-[11px] text-zinc-600 font-medium">
                      Kolom Kiri Hero
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Label Atas Pendek (Kicker)
                    </label>
                    <input
                      type="text"
                      value={heroBadge}
                      onChange={(e) => setHeroBadge(e.target.value)}
                      placeholder="Contoh: Kurasi Khusus | Studio Perangkat & Aset Digital"
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30 font-medium"
                    />
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Teks pengantar singkat di atas judul utama beranda.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Headline Utama (Judul Besar) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="Contoh: Peralatan kerja pilihan & aset digital siap pakai..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30 font-bold text-zinc-900 leading-snug"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Paragraf Narasi / Penjelasan Toko
                    </label>
                    <textarea
                      rows={3}
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="Selamat datang di JNshop..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30 leading-relaxed text-zinc-800"
                    />
                  </div>
                </div>

                {/* Call to Action Buttons */}
                <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
                  <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3">
                    Tombol Aksi Banner (Call-to-Action)
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="text-[11px] font-bold text-zinc-900">
                        Tombol Utama (Solid Gelap)
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1 text-[11px]">
                          Teks Tombol
                        </label>
                        <input
                          type="text"
                          value={heroPrimaryBtnText}
                          onChange={(e) => setHeroPrimaryBtnText(e.target.value)}
                          placeholder="Lihat Seluruh Koleksi"
                          className="w-full min-h-[40px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:ring-2 focus:ring-green-800/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1 text-[11px]">
                          URL Link Tujuan
                        </label>
                        <input
                          type="text"
                          value={heroPrimaryBtnLink}
                          onChange={(e) => setHeroPrimaryBtnLink(e.target.value)}
                          placeholder="/products"
                          className="w-full min-h-[40px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 focus:ring-2 focus:ring-green-800/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="text-[11px] font-bold text-zinc-900">
                        Tombol Kedua (Putih Border)
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1 text-[11px]">
                          Teks Tombol
                        </label>
                        <input
                          type="text"
                          value={heroSecondaryBtnText}
                          onChange={(e) => setHeroSecondaryBtnText(e.target.value)}
                          placeholder="Produk Digital & Lisensi"
                          className="w-full min-h-[40px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:ring-2 focus:ring-green-800/30"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-zinc-700 mb-1 text-[11px]">
                          URL Link Tujuan
                        </label>
                        <input
                          type="text"
                          value={heroSecondaryBtnLink}
                          onChange={(e) => setHeroSecondaryBtnLink(e.target.value)}
                          placeholder="/categories/produk-digital-lisensi"
                          className="w-full min-h-[40px] bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-900 focus:ring-2 focus:ring-green-800/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Guarantees */}
                <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <h2 className="font-bold text-sm text-zinc-900">
                      3 Poin Jaminan & Kepercayaan Toko
                    </h2>
                    <span className="text-[11px] text-zinc-600">
                      Ditampilkan di bawah tombol banner
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                      <span className="font-bold text-zinc-800 text-[11px]">Poin 1</span>
                      <input
                        type="text"
                        value={guarantee1Title}
                        onChange={(e) => setGuarantee1Title(e.target.value)}
                        placeholder="Garansi 7 Hari"
                        className="w-full min-h-[38px] bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-900"
                      />
                      <input
                        type="text"
                        value={guarantee1Desc}
                        onChange={(e) => setGuarantee1Desc(e.target.value)}
                        placeholder="Retur ganti baru / refund"
                        className="w-full min-h-[36px] bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-[11px] text-zinc-700"
                      />
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                      <span className="font-bold text-zinc-800 text-[11px]">Poin 2</span>
                      <input
                        type="text"
                        value={guarantee2Title}
                        onChange={(e) => setGuarantee2Title(e.target.value)}
                        placeholder="0 Detik"
                        className="w-full min-h-[38px] bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-900"
                      />
                      <input
                        type="text"
                        value={guarantee2Desc}
                        onChange={(e) => setGuarantee2Desc(e.target.value)}
                        placeholder="Lisensi digital langsung aktif"
                        className="w-full min-h-[36px] bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-[11px] text-zinc-700"
                      />
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                      <span className="font-bold text-zinc-800 text-[11px]">Poin 3</span>
                      <input
                        type="text"
                        value={guarantee3Title}
                        onChange={(e) => setGuarantee3Title(e.target.value)}
                        placeholder="Personal"
                        className="w-full min-h-[38px] bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-zinc-900"
                      />
                      <input
                        type="text"
                        value={guarantee3Desc}
                        onChange={(e) => setGuarantee3Desc(e.target.value)}
                        placeholder="Dukungan pemilik toko"
                        className="w-full min-h-[36px] bg-white border border-zinc-200 rounded-lg px-2.5 py-1 text-[11px] text-zinc-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Curated Flagship Showcase Card */}
                <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-green-800" />
                      <h2 className="font-bold text-sm text-zinc-900">
                        Kartu Rekomendasi Unggulan (Kanan Banner)
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                        Label Header Kiri
                      </label>
                      <input
                        type="text"
                        value={showcaseBadgeLeft}
                        onChange={(e) => setShowcaseBadgeLeft(e.target.value)}
                        placeholder="Rekomendasi Minggu Ini"
                        className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                        Label Header Kanan
                      </label>
                      <input
                        type="text"
                        value={showcaseBadgeRight}
                        onChange={(e) => setShowcaseBadgeRight(e.target.value)}
                        placeholder="Kurasi Edisi 2026"
                        className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                      URL Gambar Foto Produk Unggulan
                    </label>
                    <input
                      type="text"
                      value={showcaseImageUrl}
                      onChange={(e) => setShowcaseImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900"
                    />
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] text-zinc-600">Preset Foto Cepat:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setShowcaseImageUrl(
                            "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
                          )
                        }
                        className="min-h-[32px] text-[11px] px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium"
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
                        className="min-h-[32px] text-[11px] px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium"
                      >
                        Stand Laptop
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                        Caption Produk di Kartu
                      </label>
                      <input
                        type="text"
                        value={showcaseTagPill}
                        onChange={(e) => setShowcaseTagPill(e.target.value)}
                        placeholder="Keychron K2 Pro | Hot-Swap"
                        className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                        Judul Produk Kartu
                      </label>
                      <input
                        type="text"
                        value={showcaseTitle}
                        onChange={(e) => setShowcaseTitle(e.target.value)}
                        placeholder="Workstation Setup Terpopuler"
                        className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                      Subtitle Kartu
                    </label>
                    <input
                      type="text"
                      value={showcaseSubtitle}
                      onChange={(e) => setShowcaseSubtitle(e.target.value)}
                      placeholder="Mekanikal keyboard & stand laptop aluminium 360"
                      className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                        Teks Tombol Link
                      </label>
                      <input
                        type="text"
                        value={showcaseLinkText}
                        onChange={(e) => setShowcaseLinkText(e.target.value)}
                        placeholder="Buka Detail"
                        className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                        URL Tujuan Link
                      </label>
                      <input
                        type="text"
                        value={showcaseLinkUrl}
                        onChange={(e) => setShowcaseLinkUrl(e.target.value)}
                        placeholder="/products"
                        className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1 text-[11px]">
                      Teks Kotak Konsultasi WhatsApp
                    </label>
                    <input
                      type="text"
                      value={showcaseConsultText}
                      onChange={(e) => setShowcaseConsultText(e.target.value)}
                      placeholder="Butuh panduan sebelum membeli?"
                      className="w-full min-h-[40px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BRAND IDENTITY & WHATSAPP CONTACTS */}
            {activeTab === "identity" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
                  <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3">
                    Identitas Brand Toko
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1.5">
                        Nama Toko *
                      </label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Contoh: JNshop"
                        className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1.5">
                        Tagline Toko
                      </label>
                      <input
                        type="text"
                        value={tagLine}
                        onChange={(e) => setTagLine(e.target.value)}
                        placeholder="Contoh: Perangkat Kerja & Produk Digital"
                        className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Deskripsi Toko di Footer
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>
                </div>

                {/* WhatsApp & Contact */}
                <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
                  <div className="border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-800" />
                      <h2 className="font-bold text-sm text-zinc-900">
                        Kontak WhatsApp & Saluran Komunikasi
                      </h2>
                    </div>
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Nomor ini diterapkan ke tombol konsultasi beranda, footer, konfirmasi QRIS, dan invoice pesanan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1.5">
                        WhatsApp Admin / Pemilik *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="6285191219129"
                          className="w-full min-h-[44px] bg-green-50 border border-green-300 text-zinc-900 rounded-lg pl-3.5 pr-20 py-2 text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-800 bg-green-100 px-1.5 py-0.5 rounded">
                          WA Aktif
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1">
                        Format internasional tanpa spasi/plus (contoh: <strong>6285191219129</strong>).
                      </p>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1.5">
                        Nomor Telepon Tampilan
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+62 851-9121-9129"
                        className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1.5">
                        Email Resmi Toko
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@jnshop.com"
                        className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-800 mb-1.5">
                        Alamat Fisik / Studio
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Jakarta Selatan, DKI Jakarta"
                        className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Banner Pengumuman Atas
                    </label>
                    <input
                      type="text"
                      value={bannerAnnouncement}
                      onChange={(e) => setBannerAnnouncement(e.target.value)}
                      placeholder="PROMO: Gunakan voucher JNSHOPNEW untuk diskon 15%!"
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GOOGLE GEMINI AI */}
            {activeTab === "ai" && (
              <div className="bg-zinc-900 text-white rounded-xl p-6 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-800 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-white flex flex-wrap items-center gap-2">
                        <span>Google Gemini AI</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            geminiApiKey
                              ? "bg-green-900/50 text-green-300 border-green-700"
                              : "bg-zinc-800 text-zinc-300 border-zinc-700"
                          }`}
                        >
                          {geminiApiKey ? "Gemini Cloud Aktif" : "Mode Katalog Lokal"}
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-300">
                        Menggerakkan asisten Tanya Produk di etalase dan pembuatan deskripsi produk.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors border border-zinc-700 shrink-0"
                  >
                    <span>Dapatkan Gemini Key</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-zinc-200 text-xs mb-1.5">
                      Google Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full min-h-[44px] bg-zinc-800 border border-zinc-700 rounded-lg pl-3.5 pr-11 py-2 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        aria-label={showApiKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                        className="w-10 h-10 flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-200 text-xs mb-1.5">
                        Model AI
                      </label>
                      <select
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full min-h-[44px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cepat & Ringan)</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Stabil)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Penalaran Lanjut)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleTestAi}
                        disabled={testingAi || !geminiApiKey.trim()}
                        className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-800 hover:bg-green-700 disabled:opacity-40 text-white font-semibold text-xs transition-colors"
                      >
                        <Zap className={`w-4 h-4 ${testingAi ? "animate-spin" : ""}`} />
                        <span>{testingAi ? "Menguji..." : "Uji Koneksi Gemini"}</span>
                      </button>
                    </div>
                  </div>

                  {aiTestResult && (
                    <div
                      className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                        aiTestResult.success
                          ? "bg-green-900/40 border-green-700 text-green-200"
                          : "bg-red-900/40 border-red-700 text-red-200"
                      }`}
                    >
                      {aiTestResult.success ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-300 shrink-0" />
                          <div className="truncate">
                            <strong>Terhubung</strong> ({aiTestResult.latencyMs}ms): &quot;
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
            )}

            {/* TAB 4: POLICIES & TERMS */}
            {activeTab === "policy" && (
              <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-4">
                <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3">
                  Kebijakan & Garansi Toko
                </h2>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1.5">
                    Syarat & Ketentuan Layanan
                  </label>
                  <textarea
                    rows={3}
                    value={termsAndConditions}
                    onChange={(e) => setTermsAndConditions(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1.5">
                    Kebijakan Garansi & Retur 7 Hari
                  </label>
                  <textarea
                    rows={3}
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-800 mb-1.5">
                    Kebijakan Privasi Pelanggan
                  </label>
                  <textarea
                    rows={3}
                    value={privacyPolicy}
                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: EMAIL & QRIS NOTIFICATION */}
            {activeTab === "email" && (
              <div className="bg-white rounded-xl p-6 border border-zinc-200 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
                  <div>
                    <h2 className="font-bold text-sm text-zinc-900">
                      Email Otomatis & Pengiriman Kode QRIS
                    </h2>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Saat pelanggan memilih QRIS, detail pesanan beserta pesan tambahan otomatis dikirim ke email admin. Admin dapat langsung membalas dengan lampiran QRIS ke email pelanggan dari halaman Pesanan.
                    </p>
                  </div>
                  <Link
                    href="/admin/orders"
                    className="text-xs font-semibold text-green-800 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Kelola Pesanan QRIS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-1.5 text-xs text-zinc-700">
                  <div className="font-bold text-zinc-900">Panduan Cepat Gmail SMTP (Gratis & Langsung Aktif)</div>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-700">
                    <li>Aktifkan Verifikasi 2 Langkah di akun Google pengirim (<span className="font-mono">myaccount.google.com/security</span>).</li>
                    <li>Buat Sandi Aplikasi (App Password) 16 karakter, lalu salin ke kolom <strong>SMTP App Password</strong> di bawah.</li>
                    <li>Isi alamat Gmail Anda pada kolom <strong>SMTP Username</strong>, klik <strong>Simpan Perubahan</strong>, lalu tekan <strong>Kirim Email Uji Coba</strong>.</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Email Admin Penerima Notifikasi QRIS
                    </label>
                    <input
                      type="email"
                      value={adminNotificationEmail}
                      onChange={(e) => setAdminNotificationEmail(e.target.value)}
                      placeholder="jaidav.enggineernes@gmail.com"
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      SMTP Username (Email Pengirim)
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="jaidav.enggineernes@gmail.com"
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                    <p className="text-[11px] text-zinc-600 mt-1">
                      Isi alamat email Gmail penuh (contoh: <span className="font-mono">jaidav.enggineernes@gmail.com</span>), bukan nama aplikasi.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      SMTP Password / Gmail App Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPass ? "text" : "password"}
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        placeholder="16 karakter App Password Gmail"
                        className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 pr-11 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        aria-label={showSmtpPass ? "Sembunyikan password SMTP" : "Tampilkan password SMTP"}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900"
                      >
                        {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Alamat Pengirim / Sender Header (Opsional)
                    </label>
                    <input
                      type="text"
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                      placeholder="JNshop Store <jaidav.enggineernes@gmail.com>"
                      className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-zinc-200">
                    <label className="block font-semibold text-zinc-800 mb-1.5">
                      Resend API Key (Alternatif Opsional jika tidak memakai SMTP)
                    </label>
                    <div className="relative">
                      <input
                        type={showResendKey ? "text" : "password"}
                        value={resendApiKey}
                        onChange={(e) => setResendApiKey(e.target.value)}
                        placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2.5 pr-11 text-xs font-mono text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResendKey(!showResendKey)}
                        aria-label={showResendKey ? "Sembunyikan Resend API Key" : "Tampilkan Resend API Key"}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-zinc-600 hover:text-zinc-900"
                      >
                        {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="min-h-[44px] px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{testingEmail ? "Mengirim Email Uji Coba..." : "Kirim Email Uji Coba"}</span>
                  </button>

                  {emailTestResult && (
                    <div
                      className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg border ${
                        emailTestResult.success
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      {emailTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      )}
                      <span>
                        {emailTestResult.success ? emailTestResult.message : emailTestResult.error}
                        {emailTestResult.latencyMs ? ` (${emailTestResult.latencyMs}ms)` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Menyimpan..." : "Simpan Perubahan & Publikasikan"}</span>
              </button>
            </div>
          </form>
        )}

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW PANE */}
        {viewMode !== "form" && (
          <div
            className={`space-y-4 ${
              viewMode === "split" ? "xl:col-span-6 xl:sticky xl:top-6" : "max-w-4xl mx-auto w-full"
            }`}
          >
            <div className="flex items-center justify-between bg-zinc-900 text-zinc-200 px-4 py-2.5 rounded-xl text-xs">
              <span className="font-semibold text-white">
                Pratinjau Toko Langsung
              </span>
              <span className="text-[11px] text-zinc-300 font-medium">
                Pembaruan otomatis saat mengetik
              </span>
            </div>

            {/* Preview Device Container */}
            <div
              className={`transition-all duration-300 mx-auto ${
                previewDevice === "mobile"
                  ? "max-w-sm rounded-3xl border-[8px] border-zinc-800 overflow-hidden bg-white shadow-lg"
                  : "w-full rounded-xl border border-zinc-300 overflow-hidden bg-white shadow-sm"
              }`}
            >
              {previewDevice === "desktop" ? (
                <div className="bg-zinc-100 border-b border-zinc-200 px-4 py-2 flex items-center gap-2 text-xs text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  </div>
                  <div className="flex-1 mx-2 bg-white rounded-md py-0.5 px-3 text-[11px] text-zinc-600 font-mono text-center border border-zinc-200 truncate">
                    https://{storeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "jnshop"}.com
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900 text-white pt-2 pb-1 px-6 flex items-center justify-between text-[10px]">
                  <span>09:41</span>
                  <div className="w-16 h-2.5 bg-zinc-800 rounded-full" />
                  <span>5G</span>
                </div>
              )}

              <div className="max-h-[820px] overflow-y-auto divide-y divide-zinc-200 text-zinc-900 font-sans">
                {/* 1. Top Announcement Bar */}
                <div className="bg-zinc-900 text-zinc-200 text-[10px] sm:text-[11px] py-1.5 px-3 flex flex-wrap items-center justify-between gap-1.5">
                  <span className="truncate">
                    {bannerAnnouncement || "Koleksi Alat Kerja & Solusi Digital Terkurasi"}
                  </span>
                  <span className="text-green-300 font-semibold flex items-center gap-1 shrink-0 ml-auto">
                    <MessageCircle className="w-2.5 h-2.5" />
                    <span>+{cleanWhatsapp}</span>
                  </span>
                </div>

                {/* 2. Navbar Preview */}
                <div className="bg-white border-b border-zinc-200 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                      {storeName.substring(0, 2).toUpperCase() || "JN"}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-zinc-900 leading-tight">
                        {storeName || "JNshop"}
                      </div>
                      <div className="text-[9px] uppercase tracking-wider text-zinc-600 font-medium">
                        {tagLine || "Studio Perangkat & Digital"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 font-medium">
                      Katalog
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-md bg-zinc-900 text-white font-medium">
                      Keranjang (0)
                    </span>
                  </div>
                </div>

                {/* 3. Live Hero Preview (Crisp Independent Studio) */}
                <div className="p-4 sm:p-6 bg-white space-y-4">
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-green-800">
                      {heroBadge}
                    </p>

                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 leading-tight">
                      {heroTitle}
                    </h2>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {heroSubtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="px-4 py-2 rounded-lg bg-zinc-900 text-white font-semibold text-[11px] flex items-center gap-1.5">
                        <span>{heroPrimaryBtnText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="px-3.5 py-2 rounded-lg bg-white text-zinc-900 font-semibold text-[11px] border border-zinc-200">
                        <span>{heroSecondaryBtnText}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-200">
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                          {guarantee1Title}
                        </div>
                        <div className="text-[10px] text-zinc-600 truncate">{guarantee1Desc}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                          {guarantee2Title}
                        </div>
                        <div className="text-[10px] text-zinc-600 truncate">{guarantee2Desc}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                          {guarantee3Title}
                        </div>
                        <div className="text-[10px] text-zinc-600 truncate">{guarantee3Desc}</div>
                      </div>
                    </div>
                  </div>

                  {/* Curated Showcase Card Preview */}
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3 mt-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-800">
                        {showcaseBadgeLeft}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-600">
                        {showcaseBadgeRight}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-zinc-200 relative">
                        <img
                          src={showcaseImageUrl}
                          alt={showcaseTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {showcaseTagPill && (
                        <div className="text-[11px] font-semibold text-zinc-700">
                          {showcaseTagPill}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-0.5">
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 truncate">
                            {showcaseTitle}
                          </h4>
                          <p className="text-[11px] text-zinc-600 truncate">
                            {showcaseSubtitle}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-green-800 underline shrink-0">
                          {showcaseLinkText}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-zinc-200 flex items-center justify-between text-[10px]">
                      <span className="text-zinc-600 truncate">{showcaseConsultText}</span>
                      <a
                        href={whatsappTestUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-green-800 hover:underline flex items-center gap-1 shrink-0 ml-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>+{cleanWhatsapp}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4. Footer Preview */}
                <div className="p-4 sm:p-5 bg-zinc-900 text-zinc-300 space-y-3 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-zinc-800 text-white flex items-center justify-center font-bold text-[10px] border border-zinc-700">
                      {storeName.substring(0, 2).toUpperCase() || "JN"}
                    </div>
                    <span className="font-bold text-white text-xs">
                      {storeName || "JNshop"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 space-y-1">
                    <div>
                      WhatsApp Resmi: <span className="text-green-300 font-mono">+{cleanWhatsapp}</span>
                    </div>
                    <div>
                      Email: <span className="text-zinc-200">{email || "owner@jnshop.com"}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
                    © {new Date().getFullYear()} {storeName || "JNshop"}.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 flex items-center justify-between gap-2">
              <span>
                Tekan <strong>Simpan Perubahan</strong> untuk menerapkan seluruh teks dan nomor kontak langsung ke toko publik.
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-zinc-900 text-white font-semibold text-xs shrink-0"
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
