"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wand2,
  Save,
  Package,
  Binary,
  AlertCircle,
  Lock,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [sku, setSku] = useState("");
  const [weight, setWeight] = useState("0.5");
  const [isPhysical, setIsPhysical] = useState(true);
  const [digitalDeliveryType, setDigitalDeliveryType] = useState("INSTANT_DOWNLOAD");
  const [digitalFileUrl, setDigitalFileUrl] = useState("");
  const [digitalLicenseKey, setDigitalLicenseKey] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [allowCod, setAllowCod] = useState(true);

  const [generatingAI, setGeneratingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.categories?.length > 0) {
            setCategoryId(data.categories[0].id);
          }
        }
      } catch {
        // fallback
      }
    }
    loadCategories();
  }, []);

  const handleGenerateAIDescription = async () => {
    if (!name.trim()) {
      setError("Isi nama produk terlebih dahulu agar AI dapat menyusun deskripsi yang relevan.");
      return;
    }

    setGeneratingAI(true);
    setError("");

    try {
      const res = await fetch("/api/ai/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DESCRIPTION",
          input: { name, isPhysical, price },
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setDescription(data.text);
      }
    } catch {
      setError("Gagal membuat deskripsi dengan AI.");
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format file gambar harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5MB.");
      return;
    }

    setError("");
    setImageFile(file);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId) {
      setError("Nama, harga, dan kategori wajib diisi.");
      return;
    }

    setSaving(true);
    setSavingStatus("Memvalidasi data produk...");
    setError("");

    try {
      let finalImageUrl: string | null = null;

      if (imageMode === "upload") {
        if (imageFile) {
          setSavingStatus("Mengunggah foto produk...");
          const uploadFormData = new FormData();
          uploadFormData.append("file", imageFile);

          const uploadRes = await fetch("/api/uploads/products", {
            method: "POST",
            body: uploadFormData,
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            throw new Error(uploadData.error || "Gagal mengunggah foto produk.");
          }
          finalImageUrl = uploadData.url;
        }
      } else {
        finalImageUrl = imageUrl.trim() || null;
      }

      setSavingStatus("Menyimpan katalog produk...");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          shortDescription: shortDescription.trim() || null,
          description: description.trim() || name.trim(),
          price: parseFloat(price),
          discountPrice: discountPrice ? parseFloat(discountPrice) : null,
          stock: parseInt(stock) || 0,
          sku: sku.trim() || null,
          weight: isPhysical ? parseFloat(weight) || 0.5 : 0,
          isPhysical,
          digitalDeliveryType: !isPhysical ? digitalDeliveryType : null,
          digitalFileUrl: !isPhysical ? digitalFileUrl.trim() || null : null,
          digitalLicenseKey: !isPhysical ? digitalLicenseKey.trim() || null : null,
          categoryId,
          imageUrl: finalImageUrl,
          isFeatured,
          allowCod: isPhysical ? allowCod : false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan produk.");
      }

      router.push("/admin/products");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
      setSavingStatus("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          aria-label="Kembali ke manajemen produk"
          className="w-11 h-11 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 flex items-center justify-center transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Tambah Produk Baru</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Lengkapi data produk fisik atau digital untuk ditampilkan di etalase JNshop.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-zinc-200 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3">
            Informasi Dasar Produk
          </h2>

          <div>
            <label htmlFor="prod-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Nama Produk *
            </label>
            <input
              id="prod-name"
              type="text"
              required
              placeholder="Contoh: Keychron K2 Pro Mechanical Keyboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-category" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Kategori *
              </label>
              <select
                id="prod-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Format / Tipe Produk
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhysical(true)}
                  className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg border text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
                    isPhysical
                      ? "border-green-800 bg-green-50 text-green-800"
                      : "border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Produk Fisik</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPhysical(false)}
                  className={`flex-1 min-h-[44px] py-2 px-3 rounded-lg border text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 ${
                    !isPhysical
                      ? "border-green-800 bg-green-50 text-green-800"
                      : "border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50"
                  }`}
                >
                  <Binary className="w-4 h-4" />
                  <span>Produk Digital</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="prod-short" className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Ringkasan Singkat (Short Description)
            </label>
            <input
              id="prod-short"
              type="text"
              placeholder="1-2 kalimat ringkasan produk untuk tampilan kartu"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label htmlFor="prod-desc" className="text-xs font-semibold text-zinc-800">
                Deskripsi Lengkap & Spesifikasi *
              </label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={generatingAI}
                className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-[11px] disabled:opacity-50 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{generatingAI ? "Menulis..." : "Bantu Tulis Deskripsi"}</span>
              </button>
            </div>
            <textarea
              id="prod-desc"
              rows={5}
              required
              placeholder="Deskripsi fitur, dimensi, paket penjualan, dan spesifikasi produk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-zinc-200 space-y-4">
          <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3">
            Harga & Persediaan Stok
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="prod-price" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Harga Normal (Rp) *
              </label>
              <input
                id="prod-price"
                type="number"
                required
                min={0}
                placeholder="Contoh: 1500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
              />
            </div>

            <div>
              <label htmlFor="prod-discount" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Harga Promo (Rp)
              </label>
              <input
                id="prod-discount"
                type="number"
                min={0}
                placeholder="Kosongkan jika tidak ada promo"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
              />
            </div>

            <div>
              <label htmlFor="prod-stock" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Jumlah Stok *
              </label>
              <input
                id="prod-stock"
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-sku" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Kode SKU
              </label>
              <input
                id="prod-sku"
                type="text"
                placeholder="Contoh: GAD-K2PRO-01"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 uppercase font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
              />
            </div>

            {isPhysical && (
              <div>
                <label htmlFor="prod-weight" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Berat Produk (Kilogram)
                </label>
                <input
                  id="prod-weight"
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                />
              </div>
            )}
          </div>
        </div>

        {/* Digital Product Delivery Settings */}
        {!isPhysical && (
          <div className="bg-white rounded-xl p-6 sm:p-7 border border-green-200 space-y-4">
            <h2 className="font-bold text-sm text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
              <Binary className="w-4 h-4 text-green-800" />
              <span>Pengaturan Pemenuhan Produk Digital</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dig-type" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Metode Pengiriman Digital
                </label>
                <select
                  id="dig-type"
                  value={digitalDeliveryType}
                  onChange={(e) => setDigitalDeliveryType(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                >
                  <option value="INSTANT_DOWNLOAD">Tautan Download Langsung</option>
                  <option value="LICENSE_KEY">Kode Serial / Lisensi Software</option>
                  <option value="MANUAL_EMAIL">Jadwal Sesi / Email Manual</option>
                </select>
              </div>

              <div>
                <label htmlFor="dig-url" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Tautan File Unduhan (Google Drive / GitHub / Dropbox)
                </label>
                <input
                  id="dig-url"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={digitalFileUrl}
                  onChange={(e) => setDigitalFileUrl(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dig-license" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Kode Lisensi / Token Akses Bawaan (Opsional)
              </label>
              <input
                id="dig-license"
                type="text"
                placeholder="Contoh: JN-2026-PRO-XXXX"
                value={digitalLicenseKey}
                onChange={(e) => setDigitalLicenseKey(e.target.value)}
                className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-mono text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
              />
            </div>
          </div>
        )}

        {/* Payment Rules */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-zinc-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
            <h2 className="font-bold text-sm text-zinc-900">
              Aturan Metode Pembayaran
            </h2>
            <span className="text-[11px] text-green-800 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full font-semibold">
              Proteksi Kerugian Toko
            </span>
          </div>

          {!isPhysical ? (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-red-800 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 leading-relaxed">
                <strong>Produk Digital:</strong> Metode Cash on Delivery (COD) dinonaktifkan otomatis untuk mencegah pengiriman lisensi/file tanpa pembayaran. Pembeli wajib membayar di muka (QRIS / Transfer Bank).
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="allowCod"
                checked={allowCod}
                onChange={(e) => setAllowCod(e.target.checked)}
                className="w-5 h-5 text-green-800 rounded border-zinc-300 mt-0.5 shrink-0"
              />
              <div>
                <label htmlFor="allowCod" className="text-xs font-bold text-zinc-900 cursor-pointer block">
                  Izinkan Metode Pembayaran Cash on Delivery (COD)
                </label>
                <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                  Centang opsi ini jika Anda mengizinkan pembeli membayar saat paket diterima. Hilangkan centang untuk produk bernilai tinggi agar pembayaran selalu di muka.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Media & Tampilan Etalase */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-zinc-200 space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="font-bold text-sm text-zinc-900">
              Media & Foto Produk
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              Pilih cara menambahkan foto: unggah berkas langsung dari perangkat Anda atau gunakan tautan URL eksternal.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setImageMode("upload")}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                imageMode === "upload"
                  ? "bg-white text-green-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <UploadCloud className="w-4 h-4 text-green-800" />
              <span>Unggah File Foto</span>
            </button>
            <button
              type="button"
              onClick={() => setImageMode("url")}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
                imageMode === "url"
                  ? "bg-white text-green-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <LinkIcon className="w-4 h-4 text-zinc-600" />
              <span>Gunakan Link URL</span>
            </button>
          </div>

          {/* Direct File Upload Mode */}
          {imageMode === "upload" ? (
            <div>
              <input
                id="prod-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {!imagePreview ? (
                <label
                  htmlFor="prod-file-input"
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-300 hover:border-green-800 rounded-xl bg-zinc-50 hover:bg-zinc-100/70 transition-colors cursor-pointer text-center group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-800 group-hover:scale-105 transition-transform mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">
                    Klik untuk memilih foto produk
                  </span>
                  <span className="text-xs text-zinc-600 mt-1 max-w-sm leading-relaxed">
                    Pilih file gambar langsung dari komputer atau ponsel Anda (Format JPG, PNG, WEBP, Maksimal 5MB)
                  </span>
                </label>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                  <div className="flex items-center gap-4">
                    <img
                      src={imagePreview}
                      alt="Preview Foto Produk"
                      className="w-20 h-20 object-cover rounded-lg border border-zinc-200 bg-white shrink-0 shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 line-clamp-1">
                        {imageFile?.name || "Foto Berkas Terpilih"}
                      </p>
                      {imageFile && (
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          Ukuran: {(imageFile.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-900 border border-green-200">
                        <ImageIcon className="w-3 h-3 text-green-800" />
                        Foto siap diunggah & disimpan
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <label
                      htmlFor="prod-file-input"
                      className="min-h-[40px] px-3.5 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold hover:bg-zinc-100 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="min-h-[40px] px-3.5 py-2 rounded-lg border border-red-200 bg-white text-red-700 text-xs font-semibold hover:bg-red-50 inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* External Image URL Mode */
            <div className="space-y-3">
              <div>
                <label htmlFor="prod-img" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  URL Tautan Foto Produk Utama
                </label>
                <input
                  id="prod-img"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full min-h-[44px] bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-800/30"
                />
              </div>

              {imageUrl.trim().length > 10 && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50">
                  <img
                    src={imageUrl}
                    alt="Pratinjau URL"
                    className="w-16 h-16 object-cover rounded-md border border-zinc-200 bg-white shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="text-xs text-zinc-700">
                    <p className="font-semibold text-zinc-900">Pratinjau Foto URL</p>
                    <p className="text-[11px] text-zinc-600 break-all line-clamp-1">{imageUrl}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-100">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-5 h-5 text-green-800 rounded border-zinc-300"
            />
            <label htmlFor="isFeatured" className="text-xs font-semibold text-zinc-900 cursor-pointer">
              Tandai sebagai Produk Unggulan di Halaman Utama
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/products"
            className="min-h-[44px] px-5 py-2.5 rounded-lg border border-zinc-200 text-zinc-800 font-semibold text-xs hover:bg-zinc-50 inline-flex items-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-6 py-2.5 rounded-lg bg-green-800 hover:bg-green-900 text-white font-semibold text-xs disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? (savingStatus || "Menyimpan Produk...") : "Publikasikan Produk"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
