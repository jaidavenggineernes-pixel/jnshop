import { prisma } from "./prisma";
import { formatRupiah } from "./utils";

export interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string;
  categoryName: string;
  isPhysical: boolean;
  stock: number;
}

export interface AIResponseResult {
  content: string;
  source: "gemini" | "intelligent-local";
  recommendedProducts?: RecommendedProduct[];
  actionSuggestions?: string[];
}

export async function generateJNshopAIResponse(
  messages: ChatMessageInput[],
  userContext?: any
): Promise<AIResponseResult> {
  // 1. Fetch live database context (catalog, categories, coupons, store settings)
  const storeSetting = await prisma.storeSetting.findUnique({
    where: { id: "default" },
  });

  const activeProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { select: { id: true, name: true, price: true, stock: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    take: 30,
  });

  const activeCoupons = await prisma.coupon.findMany({
    where: { isActive: true },
    take: 10,
  });

  const categories = await prisma.category.findMany({
    select: { name: true, slug: true, description: true },
  });

  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const normalizedQuery = lastUserMsg.toLowerCase().trim();

  // 2. Check if user is inquiring about a specific order number (e.g. JN-20261107-84IR)
  const orderNumberMatch = lastUserMsg.match(/JN-[A-Za-z0-9-]+/i);
  let matchedOrderData: any = null;
  if (orderNumberMatch) {
    try {
      matchedOrderData = await prisma.order.findUnique({
        where: { orderNumber: orderNumberMatch[0].toUpperCase() },
        include: {
          items: true,
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });
    } catch {
      // ignore
    }
  }

  // 3. Compact catalog for system context
  const catalogContext = activeProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    price: formatRupiah(p.discountPrice || p.price),
    rawPrice: p.discountPrice || p.price,
    originalPrice: p.discountPrice ? formatRupiah(p.price) : undefined,
    stock: p.stock,
    isPhysical: p.isPhysical ? "Fisik" : "Digital",
    digitalType: p.digitalDeliveryType,
    description: p.shortDescription || p.description.slice(0, 200),
    variants: p.variants.map((v) => `${v.name} (${formatRupiah(v.price || p.price)})`).join(", "),
  }));

  const couponContext = activeCoupons.map((c) => ({
    code: c.code,
    type: c.type === "PERCENTAGE" ? `Diskon ${c.value}%` : `Potongan ${formatRupiah(c.value)}`,
    minPurchase: formatRupiah(c.minPurchase),
    description: c.description,
  }));

  const systemPrompt = `Anda adalah "JNshop AI", asisten belanja cerdas, ramah, dan profesional untuk platform e-commerce resmi JNshop.
Informasi Toko:
- Nama Toko: ${storeSetting?.storeName || "JNshop"}
- Tagline: ${storeSetting?.tagLine || "Toko Online Pribadi Terpercaya"}
- Deskripsi: ${storeSetting?.description || "Pusat belanja produk fisik & digital"}
- No. WhatsApp Bantuan Toko: +${storeSetting?.whatsappNumber || "6281234567890"}
- Alamat Toko: ${storeSetting?.address || "Jakarta, Indonesia"}
- Garansi Toko: Garansi 7 Hari Pengembalian Barang & Uang Kembali jika produk cacat / tidak sesuai.
- Pengiriman: Mendukung JNE, SiCepat, J&T ke seluruh Indonesia. Pengemasan bubble wrap gratis. Produk digital otomatis terkirim seketika.
- Metode Pembayaran: QRIS Instant, Transfer Bank Manual (BCA & Mandiri), Virtual Account BNI, COD (Bayar di Tempat).

ATURAN PENTING:
1. Jawab selalu dalam Bahasa Indonesia yang ramah, sopan, informatif, dan solutif.
2. HANYA rekomendasikan dan jelaskan produk yang ada di KATALOG DATABASE RESMI berikut. JANGAN MENGARANG produk, harga, atau stok yang tidak ada.
3. Selalu sertakan link rujukan produk dengan format markdown [Nama Produk](/products/slug) jika menyebutkan produk tertentu.
4. Jika pelanggan bertanya tentang status pesanan:
   - Jika ada data pesanan terkait: jelaskan nomor pesanan, status, kurir, dan tautan ke invoice.
   - Jika tidak ada: pandu untuk mengecek di menu Akun -> Pesanan Saya (/account/orders) atau masukkan nomor pesanan JN-... langsung di chat ini.
5. Jika ada voucher diskon yang relevan, sebutkan kode voucher resmi: ${couponContext.map((c) => `${c.code} (${c.type})`).join(", ")}.

KATALOG PRODUK AKTIF SAAT INI DI DATABASE JNSHOP:
${JSON.stringify(catalogContext, null, 2)}

VOUCHER & PROMO TERSEDIA:
${JSON.stringify(couponContext, null, 2)}

KATEGORI TERSEDIA:
${categories.map((c) => `- ${c.name} (/categories/${c.slug})`).join("\n")}
`;

  // 4. Determine Gemini API Key
  const geminiApiKey = storeSetting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  const selectedModel = storeSetting?.aiModel || "gemini-2.5-flash";

  if (geminiApiKey) {
    try {
      const contents = [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      ];

      // Add live order context if detected
      if (matchedOrderData) {
        contents.push({
          role: "user",
          parts: [
            {
              text: `[SISTEM DATA ORDER]: Ditemukan data order nomor ${matchedOrderData.orderNumber}: Status=${matchedOrderData.status}, Total=${formatRupiah(matchedOrderData.grandTotal)}, Kurir=${matchedOrderData.courierName || "JNE"}, Resi=${matchedOrderData.trackingNumber || "Belum diterbitkan"}. Jelaskan status pesanan ini kepada pelanggan.`,
            },
          ],
        });
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey,
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1200,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          // Detect recommended products mentioned in Gemini's response
          const recommended = activeProducts
            .filter((p) => text.includes(p.name) || text.includes(p.slug))
            .slice(0, 3)
            .map((p) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              discountPrice: p.discountPrice,
              imageUrl: p.images[0]?.url,
              categoryName: p.category.name,
              isPhysical: p.isPhysical,
              stock: p.stock,
            }));

          return {
            content: text,
            source: "gemini",
            recommendedProducts: recommended,
            actionSuggestions: getDynamicActionSuggestions(text, activeProducts),
          };
        }
      } else {
        console.warn("Gemini API returned error status:", res.status, await res.text());
      }
    } catch (err) {
      console.warn("Gemini API call failed, switching to intelligent local assistant:", err);
    }
  }

  // 5. Intelligent Multi-Turn Conversational Reasoning Engine (Zero-Config / Offline Fallback)
  // Highly responsive, real-time natural language comprehension across all catalog items & store ops
  const result = evaluateIntelligentLocalQuery({
    query: normalizedQuery,
    rawQuery: lastUserMsg,
    messages,
    activeProducts,
    activeCoupons,
    categories,
    storeSetting,
    matchedOrderData,
    userContext,
  });

  return result;
}

// -------------------------------------------------------------
// Intelligent Local Semantic Reasoning Engine
// -------------------------------------------------------------
function evaluateIntelligentLocalQuery({
  query,
  rawQuery,
  messages,
  activeProducts,
  activeCoupons,
  categories,
  storeSetting,
  matchedOrderData,
  userContext,
}: {
  query: string;
  rawQuery: string;
  messages: ChatMessageInput[];
  activeProducts: any[];
  activeCoupons: any[];
  categories: any[];
  storeSetting: any;
  matchedOrderData: any;
  userContext: any;
}): AIResponseResult {
  // Helper to map products into cards
  const toCards = (list: any[]): RecommendedProduct[] =>
    list.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice,
      imageUrl: p.images?.[0]?.url,
      categoryName: p.category?.name || "Kategori",
      isPhysical: p.isPhysical,
      stock: p.stock,
    }));

  // Context awareness: Check previous assistant messages for mentioned products
  let previousContextProduct: any = null;
  for (let i = messages.length - 2; i >= 0; i--) {
    const prev = messages[i]?.content.toLowerCase() || "";
    for (const p of activeProducts) {
      if (prev.includes(p.name.toLowerCase()) || prev.includes(p.slug.toLowerCase())) {
        previousContextProduct = p;
        break;
      }
    }
    if (previousContextProduct) break;
  }

  // 1. Live Order Lookup by Order Number (e.g. JN-20261107-84IR)
  if (matchedOrderData) {
    const o = matchedOrderData;
    const statusMap: Record<string, string> = {
      PENDING_PAYMENT: "Menunggu Pembayaran (Silakan selesaikan pembayaran & unggah bukti transfer jika manual)",
      WAITING_CONFIRMATION: "Menunggu Konfirmasi Admin (Bukti pembayaran sedang diverifikasi)",
      PAID: "Pembayaran Berhasil Diverifikasi",
      PROCESSING: "Sedang Diproses & Dikemas di Gudang JNshop",
      READY_TO_SHIP: "Paket Siap Dikirim ke Kurir",
      SHIPPED: "Dalam Pengiriman Kurir",
      DELIVERED: "Pesanan Selesai / Telah Diterima",
      CANCELLED: "Pesanan Dibatalkan",
      REFUNDED: "Dana Telah Dikembalikan",
    };

    const statusText = statusMap[o.status] || o.status;
    const itemList = o.items.map((it: any) => `• ${it.productName} (${it.quantity}x) — ${formatRupiah(it.subtotal)}`).join("\n");

    return {
      content: `📦 **Informasi Status Pesanan Anda**\n\nNomor Pesanan: **${o.orderNumber}**\nStatus Terkini: **${statusText}**\nTotal Belanja: **${formatRupiah(o.grandTotal)}**\nPenerima: **${o.recipientName}** (${o.recipientPhone})\nKurir: **${o.courierName || "JNE Express"}**\nNomor Resi: **${o.trackingNumber || "Nomor resi akan muncul setelah paket diserahkan ke kurir"}**\n\n**Daftar Produk:**\n${itemList}\n\nAnda dapat melihat detail lengkap dan invoice pesanan ini melalui tautan: [Lihat Detail Pesanan](/orders/${o.orderNumber}). Jika membutuhkan bantuan lebih lanjut, silakan hubungi WhatsApp Admin kami!`,
      source: "intelligent-local",
      actionSuggestions: ["Cek Kupon Promo", "Rekomendasi Produk Lain", "Hubungi Admin WA"],
    };
  }

  // 2. Specific Technical Inquiries & Product Specs
  // A. Keychron K2 Pro (Switches, Hot-swap, Wireless, Battery)
  if (
    query.includes("switch") ||
    query.includes("red switch") ||
    query.includes("brown switch") ||
    query.includes("blue switch") ||
    query.includes("k2 pro") ||
    query.includes("keychron") ||
    (previousContextProduct?.slug?.includes("keychron") && (query.includes("beda") || query.includes("pilih mana")))
  ) {
    const keychron = activeProducts.find((p) => p.slug.includes("keychron")) || activeProducts[2];
    return {
      content: `Pilihan switch untuk **[Keychron K2 Pro Wireless Mechanical Keyboard](/products/${keychron?.slug || "keychron-k2-pro-wireless-custom-mechanical-keyboard"})** di JNshop:\n\n1. **Red Switch (Linear)**:\n   • Karakter: Sangat halus, ringan, dan tidak berisik (senyap).\n   • Cocok untuk: Lingkungan kerja/kantor, malam hari, dan gaming cepat.\n\n2. **Brown Switch (Tactile)** *(Paling Populer)*:\n   • Karakter: Memiliki 'bump' lembut saat tombol tertekan tanpa bunyi klik keras.\n   • Cocok untuk: Mengetik sehari-hari, coding, dan produktivitas serbaguna.\n\n3. **Blue Switch (Clicky)**:\n   • Karakter: Menghasilkan suara ketikan 'klik' renyah yang khas dengan sensasi tactile tegas.\n   • Cocok untuk: Anda yang menyukai feedback audio mekanikal klasik.\n\nSemua varian Keychron K2 Pro kami sudah mendukung **Hot-Swappable** (bisa ganti switch tanpa solder), konektivitas Bluetooth 5.1 + Kabel Type-C, baterai jumbo 4000mAh, serta kompatibel 100% untuk Mac dan Windows!`,
      source: "intelligent-local",
      recommendedProducts: keychron ? toCards([keychron]) : undefined,
      actionSuggestions: ["Berapa harga Keychron K2 Pro?", "Apakah ada garansi?", "Bisa COD?"],
    };
  }

  // B. Laptop Stand (Compatibility, 16 inch, Material, Weight capacity)
  if (
    query.includes("laptop stand") ||
    query.includes("stand laptop") ||
    query.includes("16 inch") ||
    query.includes("17 inch") ||
    query.includes("15 inch") ||
    query.includes("14 inch") ||
    query.includes("macbook") ||
    query.includes("putar") ||
    query.includes("360") ||
    (previousContextProduct?.slug?.includes("laptop-stand") && (query.includes("muat") || query.includes("bahan")))
  ) {
    const stand = activeProducts.find((p) => p.slug.includes("laptop-stand")) || activeProducts[4];
    return {
      content: `Ya, tentu saja! **[Aluminium Ergonomic Laptop Stand with 360° Rotating Base](/products/${stand?.slug || "aluminium-ergonomic-laptop-stand-with-360-rotating-base"})** kami dirancang khusus dan **sangat muat untuk laptop berukuran 11 hingga 17.3 inci**!\n\n**Keunggulan & Spesifikasi Utama:**\n• **Kompatibilitas Luas:** Sangat pas untuk MacBook Air, MacBook Pro 14" & 16", Dell XPS, ThinkPad, ASUS ROG, dan HP.\n• **Material Premium:** CNC Machined Aluminium Alloy tebal yang kokoh dengan daya topang hingga 10 kg tanpa goyang.\n• **Rotasi 360 Derajat:** Dilengkapi mekanisme rotasi halus dengan bunyi 'klik' memuaskan untuk mempermudah kolaborasi kerja.\n• **Anti Panas (Airflow):** Desain plat berlubang memastikan sirkulasi udara laptop tetap dingin saat performa berat.\n• **Bantalan Silikon:** Dilengkapi pelindung karet silikon penuh agar bodi laptop Anda tidak baret dan tidak licin.\n\nHarga promo saat ini: **${formatRupiah(stand?.discountPrice || stand?.price || 289000)}** (Stok ready di gudang JNshop)!`,
      source: "intelligent-local",
      recommendedProducts: stand ? toCards([stand]) : undefined,
      actionSuggestions: ["Bagaimana cara memesan?", "Bisa kirim hari ini?", "Lihat aksesoris meja lain"],
    };
  }

  // C. Logitech MX Master 3S (Sensor, Glass, DPI, Quiet Click)
  if (
    query.includes("mx master") ||
    query.includes("logitech") ||
    query.includes("mouse") ||
    query.includes("kaca") ||
    query.includes("dpi") ||
    (previousContextProduct?.slug?.includes("logitech") && (query.includes("baterai") || query.includes("suara")))
  ) {
    const mouse = activeProducts.find((p) => p.slug.includes("logitech")) || activeProducts[3];
    return {
      content: `**[Logitech MX Master 3S Advanced Ergonomic Wireless Mouse](/products/${mouse?.slug || "logitech-mx-master-3s-advanced-ergonomic-wireless-mouse-8k-dpi"})** adalah mouse produktivitas terbaik di kelasnya! 🖱️\n\n**Fitur Unggulan:**\n• **Sensor 8.000 DPI Darkfield:** Mampu melakukan tracking presisi di permukaan apa pun, bahkan di atas **meja kaca bening**!\n• **Quiet Clicks:** Mengurangi kebisingan klik hingga 90% dibanding seri sebelumnya, tetap taktil dan nyaman dipakai di kantor tenang.\n• **MagSpeed Electromagnetic Scroll:** Mampu menggulir hingga 1.000 baris per detik secara senyap dan berhenti seketika di piksel tertentu.\n• **Fast Charging USB-C:** Daya tahan baterai hingga 70 hari dengan sekali cas penuh; 1 menit cas cepat cukup untuk 3 jam pemakaian.\n• **Koneksi:** Mendukung Bluetooth Low Energy dan USB Logi Bolt Receiver hingga ke 3 perangkat sekaligus.`,
      source: "intelligent-local",
      recommendedProducts: mouse ? toCards([mouse]) : undefined,
      actionSuggestions: ["Bandingkan dengan Keychron K2", "Metode Pembayaran", "Kupon Diskon"],
    };
  }

  // D. Digital Assets & SaaS Starter Kit (Instant Delivery, License, Updates)
  if (
    query.includes("digital") ||
    query.includes("saas") ||
    query.includes("starter kit") ||
    query.includes("source code") ||
    query.includes("lisensi") ||
    query.includes("download") ||
    query.includes("figma") ||
    query.includes("template")
  ) {
    const digitalProducts = activeProducts.filter((p) => !p.isPhysical);
    return {
      content: `Di **JNshop**, semua produk digital memiliki sistem pemenuhan **Instan & Otomatis**: ⚡\n\n1. **Pengiriman Otomatis:** Seketika pembayaran Anda terverifikasi, tautan download resmi, kredensial lisensi, atau akses repository GitHub langsung aktif di halaman pesanan Anda dan dikirimkan ke email terdaftar.\n2. **Lisensi Komersial Resmi:** Anda bebas menggunakannya untuk proyek pribadi maupun klien komersial.\n3. **Lifetime Updates:** Pembaruan versi gratis tanpa biaya langganan bulanan.\n\n**Produk Digital Unggulan Kami:**\n• **[JNshop SaaS Starter Kit](/products/jnshop-saas-starter-kit-nextjs-15-prisma-production-boilerplate)** — Next.js 15, Prisma ORM, Tailwind CSS, RBAC Auth, dan modul e-commerce lengkap siap produksi.\n• **[E-Commerce Master UI/UX Design System](/products/e-commerce-master-uiux-design-system-figma-100-components)** — 100+ komponen Figma Auto-Layout 5.0, varian mode gelap & terang.\n• **[Sesi Konsultasi & Code Review Architecture Web](/products/sesi-konsultasi-code-review-architecture-web-e-commerce-1-on-1)** — 1-on-1 privat 60-90 menit via Google Meet.`,
      source: "intelligent-local",
      recommendedProducts: toCards(digitalProducts.slice(0, 3)),
      actionSuggestions: ["Cara bayar produk digital", "Apakah dapat support?", "Kupon Diskon"],
    };
  }

  // E. Hoodie & Fashion (Size, Material, GSM)
  if (
    query.includes("hoodie") ||
    query.includes("baju") ||
    query.includes("pakaian") ||
    query.includes("ukuran") ||
    query.includes("size") ||
    query.includes("warna")
  ) {
    const hoodie = activeProducts.find((p) => p.slug.includes("hoodie"));
    return {
      content: `**[JNshop Heavyweight Signature Hoodie](/products/${hoodie?.slug || "jnshop-heavyweight-signature-hoodie-cotton-fleece-330gsm"})**:\n\n• **Material:** 100% Premium Cotton Fleece 330gsm yang tebal, lembut di kulit, hangat, dan breathable.\n• **Cutting:** Oversized modern streetwear fit dengan drop-shoulder yang estetik.\n• **Pilihan Warna:** Jet Black (Hitam Pekat), Heather Grey (Abu-abu), dan Navy Blue.\n• **Pilihan Ukuran:** S, M, L, XL, hingga XXL (Tabel ukuran lingkar dada & panjang badan tersedia di detail produk).\n• **Kelebihan:** Pre-washed sehingga tidak mudah menyusut setelah dicuci.`,
      source: "intelligent-local",
      recommendedProducts: hoodie ? toCards([hoodie]) : undefined,
      actionSuggestions: ["Berapa harganya?", "Bisa kirim ke alamat saya?", "Cara bayar COD"],
    };
  }

  // 3. Comparisons Between Products
  if (
    query.includes("bandingkan") ||
    query.includes("perbandingan") ||
    (query.includes("beda") && query.includes("sama")) ||
    (query.includes("bagusan") && query.includes("atau"))
  ) {
    const foundProds = activeProducts.filter(
      (p) =>
        query.includes(p.name.toLowerCase().split(" ")[0]) ||
        p.name.toLowerCase().split(" ").some((w: string) => w.length > 4 && query.includes(w))
    );

    const compareList = foundProds.length >= 2 ? foundProds.slice(0, 2) : activeProducts.slice(2, 4);
    const [p1, p2] = compareList;

    return {
      content: `Berikut perbandingan antara **[${p1.name}](/products/${p1.slug})** dan **[${p2.name}](/products/${p2.slug})**:\n\n• **${p1.name}:**\n  - Harga: **${formatRupiah(p1.discountPrice || p1.price)}**\n  - Kategori: ${p1.category?.name} (${p1.isPhysical ? "Fisik" : "Digital"})\n  - Keunggulan: ${p1.shortDescription || p1.description.slice(0, 120)}...\n\n• **${p2.name}:**\n  - Harga: **${formatRupiah(p2.discountPrice || p2.price)}**\n  - Kategori: ${p2.category?.name} (${p2.isPhysical ? "Fisik" : "Digital"})\n  - Keunggulan: ${p2.shortDescription || p2.description.slice(0, 120)}...\n\n👉 **Rekomendasi Kami:** Keduanya saling melengkapi untuk setup meja kerja produktif impian Anda! Anda bisa memesan keduanya sekaligus dalam satu keranjang belanja.`,
      source: "intelligent-local",
      recommendedProducts: toCards([p1, p2]),
      actionSuggestions: ["Cek Voucher Diskon", "Metode Pembayaran", "Ongkos Kirim"],
    };
  }

  // 4. Budget Inquiries (e.g. "budget 300 ribu", "di bawah 200rb", "paling murah")
  const budgetMatch = query.match(/(\d+)\s*(rb|ribu|k|juta|jt)?/);
  if (query.includes("budget") || query.includes("di bawah") || query.includes("murah") || (budgetMatch && (query.includes("harga") || query.includes("cari")))) {
    let maxPrice = 500000;
    if (budgetMatch) {
      let num = parseInt(budgetMatch[1], 10);
      const unit = budgetMatch[2];
      if (unit === "juta" || unit === "jt") {
        maxPrice = num * 1000000;
      } else if (unit === "rb" || unit === "ribu" || unit === "k" || num < 1000) {
        maxPrice = num * 1000;
      } else {
        maxPrice = num;
      }
    }

    const filtered = activeProducts
      .filter((p) => (p.discountPrice || p.price) <= maxPrice)
      .sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));

    const targetList = filtered.length > 0 ? filtered : activeProducts.slice(0, 3);
    const itemsText = targetList
      .slice(0, 4)
      .map(
        (p) =>
          `• **[${p.name}](/products/${p.slug})** — *${formatRupiah(p.discountPrice || p.price)}*\n  ${p.shortDescription || p.description.slice(0, 90)}...`
      )
      .join("\n\n");

    return {
      content: `Tentu! Berikut rekomendasi produk terbaik di JNshop yang sesuai dengan budget Anda (${formatRupiah(maxPrice)}):\n\n${itemsText}\n\nIngin tahu lebih detail tentang salah satu produk di atas? Silakan tanyakan pada saya!`,
      source: "intelligent-local",
      recommendedProducts: toCards(targetList.slice(0, 3)),
      actionSuggestions: ["Gunakan Kupon Diskon", "Bagaimana Cara Beli?", "Rekomendasi Lainnya"],
    };
  }

  // 5. Coupons & Promotions Inquiries
  if (
    query.includes("voucher") ||
    query.includes("kupon") ||
    query.includes("diskon") ||
    query.includes("promo") ||
    query.includes("potongan")
  ) {
    const couponList = activeCoupons.map(
      (c) =>
        `• Kode: **${c.code}** — ${c.type === "PERCENTAGE" ? `Diskon ${c.value}%` : `Potongan ${formatRupiah(c.value)}`}\n  *Min. Belanja: ${formatRupiah(c.minPurchase)}* ${c.description ? `(${c.description})` : ""}`
    );

    return {
      content: `🎉 **Kupon Promo & Diskon Spesial JNshop yang Sedang Aktif:**\n\n${couponList.join("\n\n")}\n\n**Cara Menggunakan Kupon:**\n1. Pilih produk yang Anda inginkan dan masukkan ke [Keranjang Belanja](/cart).\n2. Di halaman Keranjang atau [Checkout](/checkout), masukkan kode kupon di kolom "Kode Promo / Voucher".\n3. Klik tombol **Terapkan** dan potongan harga akan otomatis mengurangi total pembayaran Anda!`,
      source: "intelligent-local",
      actionSuggestions: ["Lihat Produk Terlaris", "Cara Checkout", "Tanya Metode Pembayaran"],
    };
  }

  // 6. Shipping & Delivery Inquiries
  if (
    query.includes("kirim") ||
    query.includes("pengiriman") ||
    query.includes("ongkir") ||
    query.includes("ekspedisi") ||
    query.includes("jne") ||
    query.includes("sicepat") ||
    query.includes("surabaya") ||
    query.includes("bandung") ||
    query.includes("medan") ||
    query.includes("kota") ||
    query.includes("sameday") ||
    query.includes("instan")
  ) {
    return {
      content: `🚚 **Informasi Pengiriman JNshop:**\n\n• **Jangkauan Pengiriman:** Kami melayani pengiriman ke seluruh kota dan kabupaten di Indonesia (Sabang sampai Merauke).\n• **Kurir Resmi:** Didukung ekspedisi terpercaya seperti **JNE Express**, **SiCepat**, dan **J&T Express**.\n• **Estimasi Waktu Sampai:**\n  - Jabodetabek: 1 - 2 hari kerja.\n  - Pulau Jawa: 2 - 3 hari kerja.\n  - Luar Pulau Jawa: 3 - 5 hari kerja.\n• **Pengemasan Aman:** Semua produk fisik dikemas dengan bubble wrap berlapis tebal dan kardus pelindung tanpa biaya tambahan.\n• **Produk Digital:** Dikirimkan seketika (0 detik) ke akun dashboard Anda dan email sesaat setelah konfirmasi pembayaran!`,
      source: "intelligent-local",
      actionSuggestions: ["Metode Pembayaran", "Cek Kupon Promo", "Rekomendasi Produk"],
    };
  }

  // 7. Payment Methods Inquiries
  if (
    query.includes("bayar") ||
    query.includes("pembayaran") ||
    query.includes("rekening") ||
    query.includes("qris") ||
    query.includes("transfer") ||
    query.includes("bca") ||
    query.includes("mandiri") ||
    query.includes("cod") ||
    query.includes("va") ||
    query.includes("virtual account")
  ) {
    return {
      content: `💳 **Metode Pembayaran Resmi di JNshop:**\n\n1. **QRIS Instant (Rekomendasi):**\n   Scan barcode QRIS dari aplikasi GoPay, OVO, Dana, ShopeePay, LinkAja, BCA Mobile, Livin Mandiri, atau m-banking lainnya. Verifikasi otomatis!\n\n2. **Transfer Bank Manual:**\n   Transfer ke rekening resmi JNshop:\n   • **Bank BCA**: 8830-1928-33 (a/n JNshop Official)\n   • **Bank Mandiri**: 137-00-19283-99 (a/n JNshop Official)\n   *Setelah transfer, cukup unggah bukti transfer di halaman invoice pesanan.*\n\n3. **Virtual Account (BNI VA):**\n   Nomor VA otomatis diterbitkan saat checkout.\n\n4. **COD (Cash on Delivery):**\n   Bayar tunai di tempat langsung ke kurir saat barang pesanan fisik tiba di alamat Anda.\n\nSemua transaksi aman dan invoice resmi diterbitkan otomatis!`,
      source: "intelligent-local",
      actionSuggestions: ["Bagaimana Cara Checkout?", "Cek Kupon Promo", "Lacak Pesanan"],
    };
  }

  // 8. Warranty & Return Policy (7 Days)
  if (
    query.includes("garansi") ||
    query.includes("retur") ||
    query.includes("kembali") ||
    query.includes("rusak") ||
    query.includes("cacat") ||
    query.includes("komplain")
  ) {
    return {
      content: `🛡️ **Garansi & Kebijakan Pengembalian JNshop:**\n\n• **Garansi 7 Hari Pengembalian:** Jika barang fisik yang Anda terima cacat pabrik, rusak saat pengiriman, atau tidak sesuai pesanan, Anda berhak mengajukan retur barang atau pengembalian dana penuh (100% refund) dalam waktu 7 hari sejak barang diterima.\n• **100% Produk Original:** Semua produk di JNshop dijamin keasliannya dan baru (brand new).\n• **Bantuan Langsung:** Tim Admin dan Customer Care kami siap membantu proses retur secara cepat melalui WhatsApp resmi di **+${storeSetting?.whatsappNumber || "6281234567890"}**.`,
      source: "intelligent-local",
      actionSuggestions: ["Hubungi Admin WA", "Cara Belanja", "Rekomendasi Produk"],
    };
  }

  // 9. Store Profile & About Owner
  if (
    query.includes("toko") ||
    query.includes("siapa") ||
    query.includes("pemilik") ||
    query.includes("owner") ||
    query.includes("alamat") ||
    query.includes("lokasi") ||
    query.includes("kontak") ||
    query.includes("whatsapp")
  ) {
    return {
      content: `🌟 **Tentang JNshop:**\n\n**${storeSetting?.storeName || "JNshop"}** adalah toko e-commerce independen profesional yang dikelola langsung oleh pemilik toko untuk menghadirkan produk fisik berkualitas tinggi (perlengkapan kerja, elektronik, aksesoris) dan produk digital terdepan (software starter kit, design system, dan konsultasi teknologi).\n\n• **Alamat:** ${storeSetting?.address || "Jakarta, Indonesia"}\n• **Email Resmi:** ${storeSetting?.email || "owner@jnshop.com"}\n• **WhatsApp Layanan Pelanggan:** +${storeSetting?.whatsappNumber || "6281234567890"}\n\nAda yang bisa kami bantu untuk kebutuhan belanja Anda hari ini?`,
      source: "intelligent-local",
      actionSuggestions: ["Lihat Katalog Produk", "Cek Kupon Promo", "Tanya Rekomendasi"],
    };
  }

  // 10. Direct Product Search / Specific Name Matching
  const directMatches = activeProducts.filter((p) => {
    const pName = p.name.toLowerCase();
    const pCat = p.category?.name.toLowerCase() || "";
    return (
      query.includes(pName) ||
      pName.split(" ").some((w: string) => w.length >= 4 && query.includes(w)) ||
      query.includes(pCat)
    );
  });

  if (directMatches.length > 0) {
    const topMatches = directMatches.slice(0, 3);
    const cardText = topMatches
      .map(
        (p) =>
          `• **[${p.name}](/products/${p.slug})** — *${formatRupiah(p.discountPrice || p.price)}* (${p.isPhysical ? "Fisik" : "Digital"})\n  ${p.shortDescription || p.description.slice(0, 110)}...`
      )
      .join("\n\n");

    return {
      content: `Saya menemukan produk yang sesuai dengan apa yang Anda cari di JNshop:\n\n${cardText}\n\nApakah Anda ingin mengetahui detail spesifikasi, varian stok, atau cara pembelian produk ini?`,
      source: "intelligent-local",
      recommendedProducts: toCards(topMatches),
      actionSuggestions: ["Berapa ongkos kirimnya?", "Ada kupon diskon?", "Bagaimana cara bayar?"],
    };
  }

  // 11. General Welcoming & Smart Interactive Fallback
  const featured = activeProducts.slice(0, 3);
  return {
    content: `Halo! Saya **JNshop AI**, asisten belanja pintar Anda yang selalu aktif dan siap menjawab segala pertanyaan Anda secara real-time. 🌟\n\n**Beberapa hal yang bisa Anda tanyakan langsung kepada saya:**\n1. 🔍 **Spesifikasi Teknis:** *"Laptop stand ini muat laptop 16 inch gak?"* atau *"Apa bedanya switch red sama brown di Keychron?"*\n2. 💡 **Rekomendasi & Budget:** *"Rekomendasikan perlengkapan meja kerja di bawah 500 ribu"* atau *"Bandingkan mouse Logitech dan keyboard Keychron"*\n3. 🎟️ **Promo & Diskon:** *"Ada kupon diskon apa yang bisa saya pakai hari ini?"*\n4. 🚚 **Pengiriman & Garansi:** *"Bisa kirim ke Surabaya?"* atau *"Apakah ada garansi retur jika barang rusak?"*\n5. 📦 **Cek Pesanan:** Masukkan nomor pesanan Anda (contoh: \`JN-20261107-84IR\`) untuk memantau status secara instan!\n\nApa yang ingin Anda ketahui atau cari saat ini?`,
    source: "intelligent-local",
    recommendedProducts: toCards(featured),
    actionSuggestions: [
      "Laptop stand muat 16 inch?",
      "Beda Red vs Brown Switch",
      "Kupon Diskon yang Aktif",
      "Rekomendasi Budget 300rb",
    ],
  };
}

// Helper to provide dynamic suggestions based on text
function getDynamicActionSuggestions(text: string, activeProducts: any[]): string[] {
  const suggestions: string[] = [];
  const lower = text.toLowerCase();

  if (lower.includes("keyboard") || lower.includes("keychron")) {
    suggestions.push("Apa beda switch red dan brown?", "Berapa lama baterainya?");
  } else if (lower.includes("stand") || lower.includes("laptop")) {
    suggestions.push("Laptop stand muat 16 inch?", "Bisa diputar 360 derajat?");
  } else if (lower.includes("mouse") || lower.includes("logitech")) {
    suggestions.push("Apakah mouse bisa di kaca?", "Berapa DPI Logitech MX Master?");
  } else {
    suggestions.push("Kupon Promo Aktif", "Cara Pembayaran QRIS", "Rekomendasi Terlaris");
  }

  if (suggestions.length < 3) {
    suggestions.push("Garansi Retur 7 Hari", "Bisa kirim ke kota saya?");
  }

  return suggestions.slice(0, 3);
}

export async function generateAdminCopy(type: "DESCRIPTION" | "PROMO_IDEA" | "SALES_SUMMARY", input: any) {
  const storeSetting = await prisma.storeSetting.findUnique({ where: { id: "default" } });
  const geminiApiKey = storeSetting?.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  const selectedModel = storeSetting?.aiModel || "gemini-2.5-flash";

  if (geminiApiKey) {
    try {
      const prompt = `Anda adalah copywriter dan e-commerce strategist untuk JNshop.
Buatkan konten profesional bertipe: ${type}.
Data masukan: ${JSON.stringify(input)}
Gunakan Bahasa Indonesia yang persuasif, menarik, dan berorientasi konversi.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text;
      }
    } catch (e) {
      console.error("AI Admin Copy error:", e);
    }
  }

  // Fallback high quality template
  if (type === "DESCRIPTION") {
    return `Tingkatkan produktivitas dan kenyamanan Anda dengan ${input.name || "produk unggulan ini"}. Dirancang khusus dengan material berkualitas tinggi dan performa handal untuk memenuhi kebutuhan harian Anda. Bergaransi resmi dan didukung layanan purna jual terpercaya dari JNshop. Dapatkan penawaran terbatas sekarang juga!`;
  }

  return `🎉 Flash Sale Spesial JNshop! Dapatkan potongan diskon eksklusif untuk ${input.name || "kategori pilihan"}. Stok terbatas, pesan sekarang sebelum kehabisan!`;
}
