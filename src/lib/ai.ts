import { prisma } from "./prisma";
import { formatRupiah } from "./utils";

export interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateJNshopAIResponse(messages: ChatMessageInput[], userContext?: any) {
  // 1. Fetch live database context (catalog, categories, store settings)
  const storeSetting = await prisma.storeSetting.findUnique({
    where: { id: "default" },
  });

  const activeProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { select: { name: true, price: true, stock: true } },
    },
    take: 25,
  });

  const categories = await prisma.category.findMany({
    select: { name: true, slug: true, description: true },
  });

  const catalogContext = activeProducts.map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    price: formatRupiah(p.discountPrice || p.price),
    originalPrice: p.discountPrice ? formatRupiah(p.price) : undefined,
    stock: p.stock,
    isPhysical: p.isPhysical ? "Produk Fisik" : "Produk Digital",
    digitalType: p.digitalDeliveryType,
    description: p.shortDescription || p.description.slice(0, 150),
    variants: p.variants.map((v) => `${v.name} (${formatRupiah(v.price || p.price)})`).join(", "),
  }));

  const systemPrompt = `Anda adalah "JNshop AI", asisten belanja cerdas, ramah, dan profesional untuk platform e-commerce resmi JNshop.
Informasi Toko:
- Nama Toko: ${storeSetting?.storeName || "JNshop"}
- Tagline: ${storeSetting?.tagLine}
- Deskripsi: ${storeSetting?.description}
- No. WhatsApp Bantuan Toko: +${storeSetting?.whatsappNumber || "6281234567890"}
- Alamat Toko: ${storeSetting?.address}

ATURAN PENTING:
1. Jawab selalu dalam Bahasa Indonesia yang sopan, ramah, dan solusif.
2. HANYA rekomendasikan dan jelaskan produk yang ada di KATALOG DATABASE RESMI berikut. JANGAN MENGARANG produk, harga, atau stok yang tidak ada.
3. Selalu sertakan link rujukan produk dengan format markdown [Nama Produk](/products/slug) jika menyebutkan produk tertentu.
4. Jika pelanggan bertanya tentang status pesanan mereka, sarankan untuk mengecek di menu Akun -> Pesanan Saya (/account/orders) atau masukkan nomor pesanan di fitur Lacak Pesanan (/orders/[orderNumber]).
5. Jika ada masalah yang memerlukan penanganan khusus (seperti retur, komplain, atau pembayaran kendala), berikan solusi dan sarankan tombol hubungi Admin via WhatsApp.

KATALOG PRODUK AKTIF SAAT INI DI DATABASE JNSHOP:
${JSON.stringify(catalogContext, null, 2)}

KATEGORI TERSEDIA:
${categories.map((c) => `- ${c.name} (/categories/${c.slug})`).join("\n")}
`;

  const geminiApiKey = process.env.GEMINI_API_KEY;

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

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            content: text,
            source: "gemini",
          };
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to intelligent assistant engine:", err);
    }
  }

  // Fallback intelligent offline engine that answers precisely from live database
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || "";

  // 1. Check if user is asking about recommendations / products
  if (lastUserMsg.includes("rekomendasi") || lastUserMsg.includes("cari") || lastUserMsg.includes("produk") || lastUserMsg.includes("beli")) {
    const matched = activeProducts.filter(
      (p) =>
        lastUserMsg.includes(p.category.name.toLowerCase()) ||
        lastUserMsg.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().split(" ").some((w) => w.length > 3 && lastUserMsg.includes(w))
    );

    const targetList = matched.length > 0 ? matched : activeProducts.slice(0, 3);
    const productCards = targetList
      .map(
        (p) =>
          `• **[${p.name}](/products/${p.slug})** — *${formatRupiah(p.discountPrice || p.price)}* (${p.isPhysical ? "Fisik" : "Digital"})\n  ${p.shortDescription || p.description.slice(0, 100)}...`
      )
      .join("\n\n");

    return {
      content: `Halo! Senang bisa membantu Anda di **JNshop**. Berikut beberapa produk pilihan terbaik kami yang sesuai dengan pencarian Anda:\n\n${productCards}\n\nAda spesifikasi khusus atau budget tertentu yang ingin Anda tanyakan? Silakan beri tahu saya!`,
      source: "intelligent-local",
    };
  }

  // 2. Check if user is asking about shipping / payment
  if (lastUserMsg.includes("bayar") || lastUserMsg.includes("pembayaran") || lastUserMsg.includes("metode")) {
    return {
      content: `Di **JNshop**, kami menyediakan beberapa metode pembayaran yang aman dan praktis:\n\n1. **QRIS Instant** — Scan melalui GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin, dll.\n2. **Transfer Bank Manual** — Ke rekening resmi BCA & Mandiri a/n JNshop Official (verifikasi aman oleh admin).\n3. **Virtual Account** — Pembayaran otomatis via BNI VA.\n4. **COD (Cash on Delivery)** — Bayar tunai di tempat saat barang fisik tiba.\n\nSemua transaksi dilindungi dan invoice otomatis dibuat setelah pesanan dikonfirmasi!`,
      source: "intelligent-local",
    };
  }

  // 3. Order tracking
  if (lastUserMsg.includes("lacak") || lastUserMsg.includes("status") || lastUserMsg.includes("pesanan")) {
    return {
      content: `Untuk memantau status pesanan Anda di JNshop:\n\n• Jika sudah memiliki akun, silakan kunjungi menu [Pesanan Saya](/account/orders).\n• Anda juga dapat melacak nomor resi dan tahapan pesanan (Menunggu Pembayaran ➔ Diproses ➔ Dikirim) langsung di halaman detail invoice pesanan Anda.\n\nJika butuh bantuan konfirmasi pembayaran manual, Anda juga dapat menghubungi tim kami via WhatsApp.`,
      source: "intelligent-local",
    };
  }

  // 4. Default welcoming response
  return {
    content: `Halo! Saya **JNshop AI**, asisten belanja pribadi Anda di toko online ini. 🌟\n\nSaya siap membantu Anda:\n1. 🔍 Menemukan produk fisik maupun digital terbaik sesuai kebutuhan & budget Anda.\n2. 📋 Menjelaskan spesifikasi produk, stok, atau varian yang tersedia.\n3. 💳 Panduan cara checkout, diskon voucher, dan metode pembayaran (QRIS, Transfer, COD).\n4. 🚚 Informasi pengiriman dan pelacakan pesanan.\n\nApa yang ingin Anda tanyakan hari ini?`,
    source: "intelligent-local",
  };
}

export async function generateAdminCopy(type: "DESCRIPTION" | "PROMO_IDEA" | "SALES_SUMMARY", input: any) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const prompt = `Anda adalah copywriter dan e-commerce strategist untuk JNshop.
Buatkan konten profesional bertipe: ${type}.
Data masukan: ${JSON.stringify(input)}
Gunakan Bahasa Indonesia yang persuasif, menarik, dan berorientasi konversi.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
