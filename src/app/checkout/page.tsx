"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  QrCode,
  Building,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  AlertCircle,
  Banknote,
  Binary,
  Lock,
  Loader2,
  Check,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatRupiah } from "@/lib/utils";

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponFromQuery = searchParams.get("coupon");

  const {
    items,
    subtotal,
    clearCart,
    appliedCoupon: contextCoupon,
    setAppliedCoupon: setContextCoupon,
    clearCoupon,
  } = useCart();
  const { user } = useAuth();

  // Form State
  const [recipientName, setRecipientName] = useState(user?.name || "");
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [streetAddress, setStreetAddress] = useState("");
  const [province, setProvince] = useState("DKI Jakarta");
  const [city, setCity] = useState("Jakarta Selatan");
  const [district, setDistrict] = useState("Kebayoran Baru");
  const [postalCode, setPostalCode] = useState("12190");
  const [orderNotes, setOrderNotes] = useState("");

  // Courier & Payment
  const [courier, setCourier] = useState("SiCepat REG");
  const [paymentMethod, setPaymentMethod] = useState("QRIS_INSTANT");
  const [availableMethods, setAvailableMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [hasDigitalInCart, setHasDigitalInCart] = useState(false);

  // Voucher
  const [couponCode, setCouponCode] = useState(couponFromQuery || "");
  const [voucherError, setVoucherError] = useState("");
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      if (!recipientName) setRecipientName(user.name);
      if (!recipientPhone && user.phone) setRecipientPhone(user.phone);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
    }
  }, [user]);

  const hasPhysicalItems = items.some((item) => item.isPhysical);
  const shippingFee = hasPhysicalItems ? (courier.includes("Express") ? 32000 : 18000) : 0;
  const isCouponEligible =
    Boolean(contextCoupon) &&
    subtotal > 0 &&
    (typeof contextCoupon?.minPurchase !== "number" || subtotal >= contextCoupon.minPurchase);
  const discountAmount = isCouponEligible
    ? Math.min(contextCoupon!.discountAmount, subtotal)
    : 0;
  const appliedCouponCode = isCouponEligible ? contextCoupon?.code || null : null;

  useEffect(() => {
    if (
      contextCoupon &&
      typeof contextCoupon.minPurchase === "number" &&
      contextCoupon.minPurchase > 0 &&
      subtotal < contextCoupon.minPurchase
    ) {
      const cCode = contextCoupon.code;
      const cMin = contextCoupon.minPurchase;
      clearCoupon();
      setVoucherError(
        `Voucher "${cCode}" dilepas otomatis karena total belanja (${formatRupiah(
          subtotal
        )}) belum mencapai syarat minimal belanja (${formatRupiah(cMin)}).`
      );
    }
  }, [subtotal, contextCoupon, clearCoupon]);

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

  useEffect(() => {
    if (couponFromQuery && subtotal > 0 && !contextCoupon) {
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
        setVoucherError(data.error || "Kupon tidak berlaku.");
        clearCoupon();
      } else {
        setContextCoupon({
          id: data.coupon.id,
          code: data.coupon.code,
          description: data.coupon.description,
          type: data.coupon.type,
          value: data.coupon.value,
          minPurchase: Number(data.coupon.minPurchase) || 0,
          maxDiscount: data.coupon.maxDiscount ? Number(data.coupon.maxDiscount) : null,
          discountAmount: Number(data.discountAmount) || 0,
        });
        setCouponCode("");
        setVoucherError("");
      }
    } catch {
      setVoucherError("Gagal memeriksa kupon.");
    } finally {
      setLoadingVoucher(false);
    }
  };

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const isQrisSelected = paymentMethod === "QRIS_INSTANT" || paymentMethod.includes("QRIS");

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!recipientName.trim() || !recipientPhone.trim()) {
      setErrorMessage("Nama penerima dan nomor WhatsApp wajib diisi.");
      return;
    }

    if (isQrisSelected) {
      if (!customerEmail.trim() || !customerEmail.includes("@") || customerEmail.trim().length < 5) {
        setErrorMessage(
          "Alamat email aktif wajib diisi untuk metode pembayaran QRIS agar kode QRIS nominal tepat dikirim ke email Anda."
        );
        return;
      }
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
        customerEmail: customerEmail.trim() || null,
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
        couponCode: appliedCouponCode,
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
        throw new Error(data.error || "Gagal membuat pesanan.");
      }

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
        <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Keranjang Belanja Kosong</h1>
        <p className="text-sm text-zinc-600">
          Tambahkan produk dari katalog terlebih dahulu sebelum melanjutkan ke checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 min-h-[44px] px-6 rounded-lg bg-zinc-900 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
        >
          <span>Ke Katalog Produk</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const paymentStepNumber = hasPhysicalItems ? 3 : 2;
  const stepperItems = hasPhysicalItems
    ? [
        { num: "1", label: "Keranjang", done: true, active: false },
        { num: "2", label: "Kontak & Alamat", done: false, active: true },
        { num: "3", label: "Pembayaran", done: false, active: true },
        { num: "4", label: "Selesai", done: false, active: false },
      ]
    : [
        { num: "1", label: "Keranjang", done: true, active: false },
        { num: "2", label: "Kontak & Pembayaran", done: false, active: true },
        { num: "3", label: "Selesai", done: false, active: false },
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 sm:pb-12 space-y-8">
      {/* Breadcrumb & Title */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-600 mb-2">
          <Link href="/" className="hover:text-zinc-900">
            Beranda
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/cart" className="hover:text-zinc-900">
            Keranjang
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-zinc-900 font-semibold">Checkout</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Checkout & Pembayaran
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          {hasPhysicalItems
            ? "Lengkapi kontak penerima, alamat pengiriman, dan pilih metode pembayaran."
            : "Pesanan produk digital: cukup isi kontak email & pilih metode pembayaran."}
        </p>
      </div>

      {/* Accurate Progress Stepper */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200">
        <div
          className={`grid ${hasPhysicalItems ? "grid-cols-4" : "grid-cols-3"} gap-2 text-center text-xs`}
        >
          {stepperItems.map((st) => (
            <div key={st.label} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                  st.done
                    ? "bg-green-50 text-green-800 border border-green-300"
                    : st.active
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                }`}
              >
                {st.done ? <Check className="w-3.5 h-3.5" /> : st.num}
              </div>
              <span
                className={`text-xs ${
                  st.active ? "font-semibold text-zinc-900" : "font-medium text-zinc-600"
                }`}
              >
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Contact Information */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-4">
              <h2 className="font-bold text-base text-zinc-900 flex items-center gap-2.5 pb-3 border-b border-zinc-200">
                <span className="w-6 h-6 rounded-md bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Data Penerima & Email
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recipientName" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Nama Penerima *
                  </label>
                  <input
                    id="recipientName"
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                  />
                </div>

                <div>
                  <label htmlFor="recipientPhone" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    id="recipientPhone"
                    type="tel"
                    required
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label htmlFor="customerEmail" className="block text-xs font-semibold text-zinc-800">
                      Alamat Email {isQrisSelected ? "(Wajib untuk QRIS) *" : "(Opsional untuk e-receipt)"}
                    </label>
                    {isQrisSelected && (
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Wajib QRIS
                      </span>
                    )}
                  </div>
                  <input
                    id="customerEmail"
                    type="email"
                    required={isQrisSelected}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="namaanda@gmail.com"
                    className={`w-full h-11 bg-zinc-50 border rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white ${
                      isQrisSelected && !customerEmail
                        ? "border-amber-600 focus:border-green-800"
                        : "border-zinc-300 focus:border-green-800"
                    }`}
                  />
                </div>
              </div>

              {isQrisSelected && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <QrCode className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Alur Pembayaran QRIS:</strong> Detail pesanan, nominal presisi, email Anda, dan pesan tambahan di bawah otomatis diteruskan ke email Admin (<strong>jaidav.enggineernes@gmail.com</strong>). Admin akan mengirimkan kode QRIS sesuai nominal belanja langsung ke alamat email Anda.
                  </p>
                </div>
              )}

              {!hasPhysicalItems && (
                <div className="p-3.5 rounded-lg bg-green-50 border border-green-200 text-green-900 text-xs flex items-start gap-2.5">
                  <Binary className="w-4 h-4 text-green-800 shrink-0 mt-0.5" />
                  <span>
                    Seluruh item di keranjang adalah produk digital. Tidak perlu mengisi alamat kirim dan biaya ongkos kirim Rp 0.
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="orderNotes" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                  Pesan Tambahan / Catatan untuk Admin (Opsional)
                </label>
                <textarea
                  id="orderNotes"
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={
                    isQrisSelected
                      ? "Contoh: Mohon kirim QRIS dari aplikasi Dana/BCA, atau catatan khusus pesanan..."
                      : "Contoh: Catatan khusus, permintaan warna/packing, atau instruksi pengiriman..."
                  }
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-3 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                />
              </div>
            </div>

            {/* Step 2 (Only when Physical items are present): Shipping & Courier */}
            {hasPhysicalItems && (
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-4">
                <h2 className="font-bold text-base text-zinc-900 flex items-center gap-2.5 pb-3 border-b border-zinc-200">
                  <span className="w-6 h-6 rounded-md bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Alamat & Ekspedisi Pengiriman
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="streetAddress" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Alamat Lengkap (Jalan, Nomor Rumah, Patokan) *
                    </label>
                    <textarea
                      id="streetAddress"
                      required
                      rows={2}
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Jl. Senopati No. 18, Jakarta Selatan"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-3 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="province" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Provinsi *
                      </label>
                      <input
                        id="province"
                        type="text"
                        required
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Kota / Kabupaten *
                      </label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="district" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Kecamatan *
                      </label>
                      <input
                        id="district"
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Kode Pos *
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3.5 text-sm text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                      />
                    </div>
                  </div>

                  {/* Courier Selection */}
                  <div>
                    <div className="text-xs font-semibold text-zinc-800 mb-2">
                      Pilih Ekspedisi
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { name: "SiCepat REG", fee: 18000, eta: "1-2 Hari Kerja" },
                        { name: "JNE Regular", fee: 18000, eta: "2-3 Hari Kerja" },
                        { name: "J&T Express", fee: 32000, eta: "1 Hari Kerja" },
                      ].map((c) => {
                        const active = courier === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setCourier(c.name)}
                            className={`p-3.5 rounded-lg border text-left transition-colors ${
                              active
                                ? "border-green-800 bg-green-50"
                                : "border-zinc-200 hover:border-zinc-400 bg-white"
                            }`}
                          >
                            <div className="font-bold text-xs text-zinc-900">{c.name}</div>
                            <div className="text-xs font-bold text-green-800 mt-0.5 tabular-nums">
                              {formatRupiah(c.fee)}
                            </div>
                            <div className="text-[11px] text-zinc-600 mt-0.5">{c.eta}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Payment Method Step */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <h2 className="font-bold text-base text-zinc-900 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">
                    {paymentStepNumber}
                  </span>
                  Pilih Metode Pembayaran
                </h2>
                <span className="text-xs text-zinc-600 font-medium tabular-nums">
                  {availableMethods.filter((m) => m.isAvailable).length} Tersedia
                </span>
              </div>

              {hasDigitalInCart && (
                <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-green-800 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Aturan Produk Digital:</strong> Karena keranjang berisi item digital, metode COD dinonaktifkan. Lisensi/tautan unduhan aktif setelah QRIS atau transfer terverifikasi.
                  </p>
                </div>
              )}

              {loadingMethods ? (
                <div className="p-8 text-center text-xs text-zinc-600 space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-zinc-700" />
                  <p>Memeriksa metode pembayaran yang berlaku...</p>
                </div>
              ) : availableMethods.length === 0 ? (
                <div className="p-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center space-y-1">
                  <p className="font-bold">Tidak ada metode pembayaran tersedia</p>
                  <p>Silakan hubungi WhatsApp toko untuk bantuan pembayaran.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {availableMethods.map((method) => {
                    const isSelected = paymentMethod === method.code;
                    const isAllowed = method.isAvailable;

                    return (
                      <button
                        key={method.id}
                        type="button"
                        disabled={!isAllowed}
                        onClick={() => {
                          if (isAllowed) setPaymentMethod(method.code);
                        }}
                        className={`w-full text-left p-4 rounded-xl border transition-colors flex items-start sm:items-center justify-between gap-3 ${
                          !isAllowed
                            ? "border-zinc-200 bg-zinc-50 opacity-65"
                            : isSelected
                            ? "border-green-800 bg-green-50/70"
                            : "border-zinc-200 hover:border-zinc-400 bg-white"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 text-zinc-900">
                            {method.code === "QRIS_INSTANT" ? (
                              <QrCode className="w-5 h-5 text-green-800" />
                            ) : method.code === "COD" ? (
                              <Banknote className="w-5 h-5" />
                            ) : (
                              <Building className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-zinc-900">
                                {method.name}
                              </span>
                              {!isAllowed && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Lock className="w-3 h-3" />
                                  Tidak Tersedia
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              {method.description || "Metode pembayaran resmi JNshop"}
                            </p>
                            {!isAllowed && method.restrictionReason && (
                              <p className="text-xs text-amber-800 font-medium mt-1">
                                {method.restrictionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {isAllowed && isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-green-800 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
            {/* Items */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <h2 className="font-bold text-sm text-zinc-900">
                  Ringkasan Item ({items.length})
                </h2>
                <Link href="/cart" className="text-xs font-semibold text-green-800 hover:underline">
                  Ubah Keranjang
                </Link>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-zinc-900 block truncate">
                          {item.name}
                        </span>
                        <span className="text-zinc-600 tabular-nums">
                          {item.quantity} x {formatRupiah(item.price)}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 shrink-0 tabular-nums">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900">
                <Tag className="w-4 h-4 text-green-800" />
                <span>Kupon Diskon</span>
              </div>

              {contextCoupon ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-green-900">
                      {contextCoupon.code}
                    </span>
                    <span className="text-green-800 ml-2 tabular-nums">
                      (-{formatRupiah(discountAmount)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearCoupon}
                    className="text-red-800 font-semibold hover:underline"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label htmlFor="checkout-coupon" className="sr-only">
                    Kode kupon
                  </label>
                  <input
                    id="checkout-coupon"
                    type="text"
                    placeholder="Kode voucher..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 h-10 bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-xs uppercase font-mono text-zinc-900 focus:outline-none focus:bg-white focus:border-green-800"
                  />
                  <button
                    type="button"
                    onClick={() => handleValidateCoupon()}
                    disabled={!couponCode.trim() || loadingVoucher}
                    className="px-4 h-10 bg-zinc-900 hover:bg-green-800 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Pakai
                  </button>
                </div>
              )}
              {voucherError && <p className="text-xs text-red-800 font-medium">{voucherError}</p>}
            </div>

            {/* Totals */}
            <div className="bg-white rounded-xl p-5 border border-zinc-200 space-y-4">
              <h2 className="font-bold text-sm text-zinc-900 pb-3 border-b border-zinc-200">
                Total Tagihan
              </h2>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-800 font-semibold">
                    <span>Diskon ({appliedCouponCode})</span>
                    <span className="tabular-nums">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Ongkir ({hasPhysicalItems ? courier : "Digital"})</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">
                    {shippingFee === 0 ? "Rp 0" : formatRupiah(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="font-bold text-sm text-zinc-900">Total Pembayaran</span>
                <span className="text-2xl font-bold text-zinc-900 tabular-nums">
                  {formatRupiah(grandTotal)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] px-4 rounded-lg bg-zinc-900 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Memproses Pesanan...</span>
                ) : (
                  <>
                    <span>Buat Pesanan ({formatRupiah(grandTotal)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-green-800" />
                <span>Invoice resmi diterbitkan setelah konfirmasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Non-colliding Mobile Submit Bar */}
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-zinc-200 px-4 py-2.5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:hidden flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-zinc-600 font-medium">Total Tagihan</div>
            <div className="text-base font-bold text-zinc-900 tabular-nums">
              {formatRupiah(grandTotal)}
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-[44px] px-5 bg-zinc-900 hover:bg-green-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5"
          >
            <span>{submitting ? "Memproses..." : "Buat Pesanan"}</span>
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
        <div className="max-w-4xl mx-auto py-20 text-center text-sm text-zinc-600">
          Memuat halaman checkout...
        </div>
      }
    >
      <CheckoutForm />
    </React.Suspense>
  );
}
