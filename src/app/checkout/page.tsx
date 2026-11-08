"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Building,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Banknote,
  Binary,
  Lock,
  Loader2,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatRupiah } from "@/lib/utils";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponFromQuery = searchParams.get("coupon");

  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Checkout Form State
  const [recipientName, setRecipientName] = useState(user?.name || "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [province, setProvince] = useState("DKI Jakarta");
  const [city, setCity] = useState("Jakarta Selatan");
  const [district, setDistrict] = useState("Kebayoran Baru");
  const [postalCode, setPostalCode] = useState("12190");
  const [orderNotes, setOrderNotes] = useState("");

  // Courier & Payment Method
  const [courier, setCourier] = useState("SiCepat REG");
  const [paymentMethod, setPaymentMethod] = useState("QRIS_INSTANT");
  const [availableMethods, setAvailableMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [hasDigitalInCart, setHasDigitalInCart] = useState(false);

  // Voucher
  const [couponCode, setCouponCode] = useState(couponFromQuery || "");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync user info when loaded
  useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.name);
      if (!recipientPhone && user.phone) setRecipientPhone(user.phone);
    }
  }, [user]);

  // Check if any physical items exist in cart
  const hasPhysicalItems = items.some((item) => item.isPhysical);
  const shippingFee = hasPhysicalItems ? (courier.includes("Express") ? 32000 : 18000) : 0;

  // Dynamic Payment Method Governance (Anti-Fraud & Rules)
  useEffect(() => {
    async function loadPaymentMethods() {
      if (items.length === 0) return;
      try {
        setLoadingMethods(true);
        const productIds = items.map((it) => it.productId).join(",");
        const hasDigital = items.some((it) => !it.isPhysical);
        setHasDigitalInCart(hasDigital);
        const estTotal = Math.max(0, subtotal - discountAmount + shippingFee);

        const res = await fetch(
          `/api/payment-methods?productIds=${encodeURIComponent(productIds)}&hasDigital=${hasDigital}&amount=${estTotal}`
        );
        if (res.ok) {
          const data = await res.json();
          const list = data.methods || [];
          setAvailableMethods(list);

          // If current selected method is unavailable, auto-pick first available
          const currentMethodEligible = list.find(
            (m: any) => m.code === paymentMethod && m.isAvailable
          );
          if (!currentMethodEligible) {
            const firstValid = list.find((m: any) => m.isAvailable);
            if (firstValid) {
              setPaymentMethod(firstValid.code);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load payment methods:", err);
      } finally {
        setLoadingMethods(false);
      }
    }
    loadPaymentMethods();
  }, [items, subtotal, discountAmount, shippingFee]);

  // Auto apply coupon if present in query
  useEffect(() => {
    if (couponFromQuery && subtotal > 0 && !appliedCoupon) {
      handleValidateCoupon(couponFromQuery);
    }
  }, [couponFromQuery, subtotal]);

  const handleValidateCoupon = async (codeToUse?: string) => {
    const code = codeToUse || couponCode;
    if (!code.trim()) return;

    setLoadingVoucher(true);
    setVoucherError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setVoucherError(data.error || "Kupon tidak berlaku");
        setDiscountAmount(0);
        setAppliedCoupon(null);
      } else {
        setDiscountAmount(data.discountAmount);
        setAppliedCoupon(data.coupon.code);
        setCouponCode("");
      }
    } catch {
      setVoucherError("Gagal memeriksa kupon");
    } finally {
      setLoadingVoucher(false);
    }
  };

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!recipientName.trim() || !recipientPhone.trim()) {
      setErrorMessage("Nama penerima dan nomor telepon wajib diisi.");
      return;
    }

    if (hasPhysicalItems && (!streetAddress.trim() || !city.trim() || !postalCode.trim())) {
      setErrorMessage("Alamat lengkap pengiriman wajib diisi untuk produk fisik.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Keranjang belanja kosong.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        shippingAddress: hasPhysicalItems
          ? {
              streetAddress: streetAddress.trim(),
              province,
              city,
              district,
              postalCode,
            }
          : null,
        notes: orderNotes.trim(),
        courierName: hasPhysicalItems ? courier : "Digital Delivery",
        paymentMethod,
        couponCode: appliedCoupon,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          productName: item.name,
          isDigital: !item.isPhysical,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat pesanan");
      }

      // Clear local cart and redirect to invoice page
      clearCart();
      router.push(`/orders/${data.order.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pesanan.");
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Keranjang Belanja Anda Kosong</h2>
        <p className="text-sm text-slate-500">
          Tidak ada item yang dapat di-checkout. Silakan pilih produk terlebih dahulu.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-md"
        >
          <span>Ke Katalog Produk</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-blue-600">
          Beranda
        </Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-blue-600">
          Keranjang
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Checkout Pesanan</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Checkout & Pembayaran
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi data penerima, pilih opsi pengiriman dan metode pembayaran resmi JNshop.
        </p>
      </div>

      {/* Visual Progress Stepper */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
              ✓
            </div>
            <span className="font-semibold text-slate-700 text-[11px]">1. Keranjang</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs ring-4 ring-blue-100">
              2
            </div>
            <span className="font-extrabold text-blue-600 text-[11px]">2. Pengiriman</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs ring-4 ring-blue-100">
              3
            </div>
            <span className="font-extrabold text-blue-600 text-[11px]">3. Pembayaran</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 font-bold flex items-center justify-center text-xs">
              4
            </div>
            <span className="font-medium text-slate-400 text-[11px]">4. Selesai</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Recipient Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Informasi Kontak & Penerima
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address (Required if has physical goods) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Alamat Pengiriman
                </h2>
                {!hasPhysicalItems && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Khusus Produk Digital (Gratis Ongkir)
                  </span>
                )}
              </div>

              {hasPhysicalItems ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Jl. Senopati Dalam No. 18, Pagar hitam sebelah masjid"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Provinsi *
                      </label>
                      <input
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Kota / Kabupaten *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Kecamatan *
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Kode Pos *
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* Courier selection */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Pilihan Ekspedisi Pengiriman
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: "SiCepat REG", fee: 18000, eta: "1-2 Hari" },
                        { name: "JNE Regular", fee: 18000, eta: "2-3 Hari" },
                        { name: "J&T Express", fee: 32000, eta: "Besok Sampai" },
                      ].map((c) => (
                        <div
                          key={c.name}
                          onClick={() => setCourier(c.name)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            courier === c.name
                              ? "border-blue-600 bg-blue-50/70 shadow-sm"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900">{c.name}</div>
                          <div className="text-xs text-blue-600 font-extrabold mt-0.5">
                            {formatRupiah(c.fee)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Estimasi {c.eta}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 text-blue-900 text-xs flex items-center gap-3">
                  <Binary className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>
                    Semua produk di keranjang Anda adalah produk digital / jasa. Akses tautan unduhan dan lisensi akan dikirimkan otomatis setelah transaksi selesai tanpa ongkos kirim.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan untuk Penjual (Opsional)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Contoh: Tolong packing kayu / kirim lisensi ke email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* 3. Payment Methods (Governed Dynamically with Anti-Loss Safeguards) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Pilih Metode Pembayaran
                </h2>
                <span className="text-[11px] text-stone-500 font-medium">
                  {availableMethods.filter((m) => m.isAvailable).length} Opsi Tersedia
                </span>
              </div>

              {/* Digital Goods Anti-Loss Callout */}
              {hasDigitalInCart && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Proteksi Keamanan Produk Digital Aktif:</span>
                    <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                      Keranjang Anda memuat produk digital / lisensi software. Demi keamanan dan mencegah kerugian pembatalan sepihak, metode <strong>Cash on Delivery (COD) tidak tersedia</strong>. Lisensi dan file unduhan langsung terkirim seketika setelah pembayaran QRIS atau Transfer terverifikasi.
                    </p>
                  </div>
                </div>
              )}

              {loadingMethods ? (
                <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-600" />
                  <p>Memverifikasi aturan pembayaran produk...</p>
                </div>
              ) : availableMethods.length === 0 ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center space-y-1">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto" />
                  <p className="font-bold">Tidak ada metode pembayaran yang memenuhi syarat</p>
                  <p className="text-[11px] text-amber-800">
                    Silakan hubungi admin toko jika Anda mengalami kendala pembayaran.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableMethods.map((method) => {
                    const isSelected = paymentMethod === method.code;
                    const isAllowed = method.isAvailable;

                    return (
                      <div
                        key={method.id}
                        onClick={() => {
                          if (isAllowed) {
                            setPaymentMethod(method.code);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          !isAllowed
                            ? "border-stone-200 bg-stone-50/70 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "border-stone-900 bg-stone-50 shadow-sm cursor-pointer"
                            : "border-slate-200 hover:border-slate-300 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              method.code === "QRIS_INSTANT"
                                ? "bg-blue-50 text-blue-600"
                                : method.code === "COD"
                                ? "bg-stone-100 text-stone-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {method.code === "QRIS_INSTANT" ? (
                              <QrCode className="w-5 h-5 text-blue-600" />
                            ) : method.code === "COD" ? (
                              <Banknote className="w-5 h-5 text-stone-800" />
                            ) : (
                              <Building className="w-5 h-5 text-stone-800" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">
                                {method.name}
                              </span>
                              {!isAllowed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Tidak Tersedia</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {method.description || "Metode pembayaran resmi JNshop"}
                            </p>
                            {!isAllowed && method.restrictionReason && (
                              <p className="text-[11px] text-amber-700 font-semibold mt-1">
                                ⚠️ {method.restrictionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {isAllowed && isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-stone-900 shrink-0 self-end sm:self-center" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Area */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            
            {/* Products in Checkout */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Ringkasan Pesanan ({items.length})</span>
                <Link href="/cart" className="text-xs text-blue-600 font-semibold hover:underline">
                  Edit Keranjang
                </Link>
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">{item.name}</span>
                        <span className="text-slate-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Kupon Diskon</span>
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-800">{appliedCoupon}</span>
                    <span className="text-emerald-600 ml-1.5">(-{formatRupiah(discountAmount)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setDiscountAmount(0);
                    }}
                    className="text-red-600 font-bold hover:underline"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kode voucher..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleValidateCoupon()}
                    disabled={!couponCode.trim() || loadingVoucher}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    Pakai
                  </button>
                </div>
              )}
              {voucherError && <p className="text-xs text-red-500 font-medium">{voucherError}</p>}
            </div>

            {/* Total Payment Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
                Total Tagihan
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Belanja</span>
                  <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon Voucher ({appliedCoupon})</span>
                    <span>-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({hasPhysicalItems ? courier : "Digital Delivery"})</span>
                  <span className="font-semibold text-slate-900">
                    {shippingFee === 0 ? "GRATIS (Rp 0)" : formatRupiah(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-serif font-bold text-sm text-stone-900">Total Pembayaran</span>
                <span className="text-2xl font-serif font-bold text-stone-900">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-100 font-medium text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                <span>Transaksi Terproteksi & Invoice Resmi Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Checkout Bar */}
        <div className="fixed bottom-12 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] sm:hidden flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-stone-500 font-medium uppercase">Total Tagihan</div>
            <div className="text-base font-serif font-bold text-stone-900">{formatRupiah(grandTotal)}</div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-stone-100 font-medium text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {submitting ? "Memproses..." : "Bayar Sekarang"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-4xl mx-auto py-20 text-center text-sm text-slate-400">
          Memuat formulir checkout...
        </div>
      }
    >
      <CheckoutForm />
    </React.Suspense>
  );
}
