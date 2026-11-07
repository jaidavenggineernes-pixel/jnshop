import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting JNshop Database Seeding...");

  // Clear existing data in reverse order of relations
  await prisma.auditLog.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  console.log("🧹 Cleaned old database records.");

  // 1. Store Settings
  const storeSetting = await prisma.storeSetting.create({
    data: {
      id: "default",
      storeName: "JNshop",
      tagLine: "Toko Online Pribadi Terpercaya & Modern",
      description:
        "Platform e-commerce resmi JNshop menjual produk fisik berkualitas premium, produk digital terlengkap, dan jasa konsultasi profesional.",
      logoUrl: "/logo.png",
      email: "owner@jnshop.com",
      phone: "+62 812-3456-7890",
      whatsappNumber: "6281234567890",
      address: "Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12190",
      socialMediaJson: JSON.stringify({
        instagram: "jnshop.id",
        tiktok: "@jnshop_official",
        github: "jnshop-team",
      }),
      currency: "IDR",
      maintenanceMode: false,
      bannerAnnouncement: "🎉 PROMO SPESIAL: Gunakan voucher JNSHOPNEW untuk diskon 15% pada order pertama Anda!",
      termsAndConditions:
        "1. Semua transaksi yang dilakukan di JNshop dijamin aman.\n2. Untuk produk digital, akses unduhan/lisensi dikirim seketika setelah pembayaran terverifikasi.\n3. Garansi retur produk fisik berlaku 7 hari sejak barang diterima.",
      privacyPolicy:
        "JNshop berkomitmen menjaga kerahasiaan data pribadi pelanggan. Kami tidak pernah membagikan email atau nomor telepon Anda ke pihak ketiga manapun.",
      returnPolicy:
        "Pengembalian barang dapat diajukan jika barang rusak saat diterima atau tidak sesuai spesifikasi, disertai video unboxing.",
    },
  });

  // 2. Users (Admin and Customer)
  const adminPassword = await bcrypt.hash("admin123456", 10);
  const customerPassword = await bcrypt.hash("customer123456", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@jnshop.com",
      passwordHash: adminPassword,
      name: "JNshop Owner (Admin)",
      phone: "+6281234567890",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      emailVerified: new Date(),
      phoneVerified: new Date(),
      profile: {
        create: {
          bio: "Owner & Administrator of JNshop E-Commerce Platform.",
          gender: "MALE",
        },
      },
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "budi@gmail.com",
      passwordHash: customerPassword,
      name: "Budi Santoso",
      phone: "081298765432",
      role: "CUSTOMER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      emailVerified: new Date(),
      phoneVerified: new Date(),
      profile: {
        create: {
          bio: "Tech enthusiast & loyal JNshop shopper.",
          gender: "MALE",
        },
      },
      addresses: {
        create: {
          recipientName: "Budi Santoso",
          phone: "081298765432",
          streetAddress: "Jl. Senopati Dalam No. 18, RT 02 / RW 03",
          province: "DKI Jakarta",
          city: "Jakarta Selatan",
          district: "Kebayoran Baru",
          postalCode: "12190",
          isPrimary: true,
          notes: "Pagar hitam depan pos satpam",
        },
      },
    },
  });

  console.log("👤 Created Admin (admin@jnshop.com) and Customer (budi@gmail.com)");

  // 3. Categories
  const catDigital = await prisma.category.create({
    data: {
      name: "Produk Digital & Lisensi",
      slug: "produk-digital-lisensi",
      description: "Source code, template, license key, e-book, dan aset digital siap pakai.",
      icon: "Binary",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
      displayOrder: 1,
    },
  });

  const catGadget = await prisma.category.create({
    data: {
      name: "Elektronik & Gadget",
      slug: "elektronik-gadget",
      description: "Keyboard mekanikal, mouse ergonomis, smartwatch, audio, dan periferal komputer.",
      icon: "Laptop",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
      displayOrder: 2,
    },
  });

  const catWorkspace = await prisma.category.create({
    data: {
      name: "Aksesoris & Workspace",
      slug: "aksesoris-workspace",
      description: "Desk mat premium, stand laptop aluminium, organizer kabel, dan setup meja kerja.",
      icon: "MousePointer",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
      displayOrder: 3,
    },
  });

  const catServices = await prisma.category.create({
    data: {
      name: "Jasa & Layanan Profesional",
      slug: "jasa-layanan-profesional",
      description: "Konsultasi sistem web, audit performa, desain UI/UX, dan implementasi custom.",
      icon: "Briefcase",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
      displayOrder: 4,
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      name: "Merchandise & Fashion",
      slug: "merchandise-fashion",
      description: "Apparel premium edisi terbatas, hoodie heavyweight, dan merchandise eksklusif JNshop.",
      icon: "Shirt",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
      displayOrder: 5,
    },
  });

  console.log("📁 Created 5 Core Categories");

  // 4. Products & Variants
  // Product 1: Digital Boilerplate
  const prodBoilerplate = await prisma.product.create({
    data: {
      name: "JNshop SaaS Starter Kit — Next.js 15 & Prisma Production Boilerplate",
      slug: "jnshop-saas-starter-kit-nextjs-prisma",
      description:
        "Starter kit e-commerce & SaaS full-stack lengkap berbasis Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma ORM, Auth RBAC, integrasi Payment Gateway, dan AI Assistant. Dilengkapi dokumentasi arsitektur dan panduan deployment 1-click ke Vercel.",
      shortDescription: "Full-stack Next.js 15 & Prisma production template dengan payment & AI assistant.",
      price: 349000,
      discountPrice: 249000,
      stock: 999,
      sku: "DIG-NEXT15-STARTER",
      weight: 0,
      isPhysical: false,
      digitalDeliveryType: "INSTANT_DOWNLOAD",
      digitalFileUrl: "https://drive.google.com/uc?id=jnshop-starter-kit-v2",
      digitalLicenseKey: "JN-PROD-2026-KEY-994821",
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 38,
      categoryId: catDigital.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
            alt: "Code editor and Next.js framework screen",
            isPrimary: true,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            alt: "Analytics dashboard preview",
            isPrimary: false,
            order: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Personal License (1 Project)",
            sku: "DIG-NEXT15-PERSONAL",
            price: 249000,
            stock: 999,
            attributesJson: JSON.stringify({ license: "Personal", projects: "1 Project" }),
          },
          {
            name: "Commercial License (Unlimited Projects)",
            sku: "DIG-NEXT15-COMMERCIAL",
            price: 599000,
            stock: 999,
            attributesJson: JSON.stringify({ license: "Commercial", projects: "Unlimited" }),
          },
        ],
      },
    },
  });

  // Product 2: Digital Figma UI/UX Kit
  const prodFigma = await prisma.product.create({
    data: {
      name: "E-Commerce Master UI/UX Design System (Figma 100+ Components)",
      slug: "ecommerce-master-uiux-design-system-figma",
      description:
        "Sistem desain UI/UX e-commerce terlengkap dengan 100+ komponen responsive (Auto-Layout 5.0, Variable Tokens, Dark/Light Mode, Mobile App screens, dan Desktop Admin Dashboard).",
      shortDescription: "Desain sistem e-commerce profesional di Figma dengan autolayout & token variabel.",
      price: 189000,
      discountPrice: 129000,
      stock: 999,
      sku: "DIG-FIGMA-DESIGN-KIT",
      weight: 0,
      isPhysical: false,
      digitalDeliveryType: "INSTANT_DOWNLOAD",
      digitalFileUrl: "https://www.figma.com/community/file/jnshop-design-system",
      isActive: true,
      isFeatured: true,
      rating: 4.8,
      reviewCount: 24,
      categoryId: catDigital.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
            alt: "UI/UX wireframe design kit",
            isPrimary: true,
            order: 1,
          },
        ],
      },
    },
  });

  // Product 3: Keyboard Mechanical
  const prodKeyboard = await prisma.product.create({
    data: {
      name: "Keychron K2 Pro Wireless Custom Mechanical Keyboard (QMK/VIA Hot-Swap)",
      slug: "keychron-k2-pro-wireless-mechanical-keyboard",
      description:
        "Keyboard mekanikal wireless 75% dengan bodi kokoh, RGB backlight, konektivitas Bluetooth 5.1 & Type-C kabel, baterai 4000mAh, serta dukungan kustomisasi switch hot-swappable dan pemrograman via QMK/VIA.",
      shortDescription: "Keyboard mechanical 75% wireless Bluetooth & kabel dengan hot-swappable switches.",
      price: 1450000,
      discountPrice: 1299000,
      stock: 25,
      sku: "GAD-KEYCHRON-K2PRO",
      weight: 1.1,
      isPhysical: true,
      isActive: true,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 42,
      categoryId: catGadget.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80",
            alt: "Keychron mechanical keyboard on modern desk",
            isPrimary: true,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
            alt: "Mechanical keyboard keycaps detail",
            isPrimary: false,
            order: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Red Switch (Linear & Silent)",
            sku: "GAD-K2PRO-RED",
            price: 1299000,
            stock: 10,
            attributesJson: JSON.stringify({ switch: "Red", type: "Linear" }),
          },
          {
            name: "Brown Switch (Tactile & Gentle)",
            sku: "GAD-K2PRO-BROWN",
            price: 1299000,
            stock: 8,
            attributesJson: JSON.stringify({ switch: "Brown", type: "Tactile" }),
          },
          {
            name: "Blue Switch (Clicky & Crisp)",
            sku: "GAD-K2PRO-BLUE",
            price: 1299000,
            stock: 7,
            attributesJson: JSON.stringify({ switch: "Blue", type: "Clicky" }),
          },
        ],
      },
    },
  });

  // Product 4: Mouse Wireless Ergonomis
  const prodMouse = await prisma.product.create({
    data: {
      name: "Logitech MX Master 3S Advanced Ergonomic Wireless Mouse 8K DPI",
      slug: "logitech-mx-master-3s-ergonomic-mouse",
      description:
        "Mouse flagship untuk produktivitas kerja dengan sensor optik 8.000 DPI yang dapat bekerja di atas kaca. Dilengkapi roda MagSpeed elektromagnetik super cepat, klik senyap (quiet click), dan baterai isi ulang hingga 70 hari.",
      shortDescription: "Mouse ergonomis premium 8K DPI dengan scroll MagSpeed dan quiet click.",
      price: 1680000,
      discountPrice: 1490000,
      stock: 18,
      sku: "GAD-LOGI-MXM3S",
      weight: 0.4,
      isPhysical: true,
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 31,
      categoryId: catGadget.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
            alt: "Logitech MX Master 3S Wireless Mouse",
            isPrimary: true,
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Graphite Dark",
            sku: "GAD-MXM3S-GRAPHITE",
            price: 1490000,
            stock: 12,
            attributesJson: JSON.stringify({ color: "Graphite" }),
          },
          {
            name: "Pale Grey White",
            sku: "GAD-MXM3S-GREY",
            price: 1490000,
            stock: 6,
            attributesJson: JSON.stringify({ color: "Pale Grey" }),
          },
        ],
      },
    },
  });

  // Product 5: Laptop Stand Aluminium
  const prodStand = await prisma.product.create({
    data: {
      name: "Aluminium Ergonomic Laptop Stand with 360° Rotating Base",
      slug: "aluminium-ergonomic-laptop-stand-360-rotating",
      description:
        "Stand laptop bahan aluminium tebal aerospace-grade dengan poros rotasi 360 derajat. Mencegah panas berlebih berkat ventilasi lebar dan dapat menopang laptop hingga 17 inci dengan aman.",
      shortDescription: "Stand laptop aluminium kokoh rotasi 360 derajat untuk postur ergonomis.",
      price: 299000,
      discountPrice: 229000,
      stock: 40,
      sku: "WKS-STAND-ALU360",
      weight: 0.85,
      isPhysical: true,
      isActive: true,
      isFeatured: false,
      rating: 4.8,
      reviewCount: 19,
      categoryId: catWorkspace.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
            alt: "Aluminium Laptop Stand on Desk",
            isPrimary: true,
            order: 1,
          },
        ],
      },
    },
  });

  // Product 6: Desk Mat Vegan Leather
  const prodMat = await prisma.product.create({
    data: {
      name: "Premium Desk Mat Vegan Leather Waterproof (90x40 cm)",
      slug: "premium-desk-mat-vegan-leather-waterproof",
      description:
        "Alas meja kerja kulit sintetis vegan premium ukuran jumbo 90x40 cm. Tahan air, mudah dibersihkan dari tumpahan kopi, tidak licin di permukaan kayu/kaca, dan memberikan kenyamanan maksimal saat mengetik dan menggunakan mouse.",
      shortDescription: "Alas meja kerja kulit vegan anti air ukuran 90x40cm elegan dan mewah.",
      price: 149000,
      discountPrice: 99000,
      stock: 60,
      sku: "WKS-DESKMAT-VEGAN",
      weight: 0.6,
      isPhysical: true,
      isActive: true,
      isFeatured: false,
      rating: 4.7,
      reviewCount: 15,
      categoryId: catWorkspace.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
            alt: "Premium Leather Desk Mat",
            isPrimary: true,
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Midnight Black",
            sku: "WKS-MAT-BLACK",
            price: 99000,
            stock: 25,
            attributesJson: JSON.stringify({ color: "Midnight Black" }),
          },
          {
            name: "Saddle Tan Brown",
            sku: "WKS-MAT-BROWN",
            price: 99000,
            stock: 20,
            attributesJson: JSON.stringify({ color: "Saddle Tan" }),
          },
          {
            name: "Forest Dark Green",
            sku: "WKS-MAT-GREEN",
            price: 99000,
            stock: 15,
            attributesJson: JSON.stringify({ color: "Forest Green" }),
          },
        ],
      },
    },
  });

  // Product 7: Jasa Konsultasi Web & Audit
  const prodConsulting = await prisma.product.create({
    data: {
      name: "Sesi Konsultasi & Code Review Architecture Web E-Commerce (1-on-1)",
      slug: "sesi-konsultasi-code-review-architecture-web-ecommerce",
      description:
        "Sesi konsultasi privat 1-on-1 selama 90 menit langsung dengan tim engineer JNshop. Membahas arsitektur web modern, optimasi performa Core Web Vitals, keamanan endpoint, strategi payment gateway, dan deployment scalability.",
      shortDescription: "Privat 1-on-1 konsultasi & audit sistem web 90 menit via Google Meet.",
      price: 1500000,
      discountPrice: 990000,
      stock: 10,
      sku: "SRV-CONSULT-1ON1",
      weight: 0,
      isPhysical: false,
      digitalDeliveryType: "MANUAL_EMAIL",
      isActive: true,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 12,
      categoryId: catServices.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
            alt: "Code consulting and architecture planning",
            isPrimary: true,
            order: 1,
          },
        ],
      },
    },
  });

  // Product 8: JNshop Heavyweight Hoodie
  const prodHoodie = await prisma.product.create({
    data: {
      name: "JNshop Heavyweight Signature Hoodie (Cotton Fleece 330gsm)",
      slug: "jnshop-heavyweight-signature-hoodie",
      description:
        "Hoodie signature edisi terbatas JNshop dengan material Cotton Fleece tebal 330gsm yang sangat lembut di kulit. Jahitan rantai premium dengan pola boxy-fit modern dan bordir minimalis JNshop di dada.",
      shortDescription: "Hoodie katun fleece 330gsm boxy-fit tebal dan nyaman khas JNshop.",
      price: 380000,
      discountPrice: 299000,
      stock: 35,
      sku: "FAS-HOODIE-SIGNATURE",
      weight: 0.75,
      isPhysical: true,
      isActive: true,
      isFeatured: true,
      rating: 4.9,
      reviewCount: 28,
      categoryId: catFashion.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
            alt: "Minimalist black hoodie",
            isPrimary: true,
            order: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Size M",
            sku: "FAS-HOODIE-M",
            price: 299000,
            stock: 10,
            attributesJson: JSON.stringify({ size: "M" }),
          },
          {
            name: "Size L",
            sku: "FAS-HOODIE-L",
            price: 299000,
            stock: 15,
            attributesJson: JSON.stringify({ size: "L" }),
          },
          {
            name: "Size XL",
            sku: "FAS-HOODIE-XL",
            price: 299000,
            stock: 10,
            attributesJson: JSON.stringify({ size: "XL" }),
          },
        ],
      },
    },
  });

  console.log("📦 Created 8 Diverse Products with Images & Variants");

  // 5. Payment Methods
  await prisma.paymentMethod.createMany({
    data: [
      {
        code: "BCA_MANUAL",
        name: "Transfer Bank BCA",
        type: "MANUAL_TRANSFER",
        description: "Transfer manual ke rekening Bank Central Asia JNshop. Verifikasi cepat oleh admin.",
        instructions:
          "Transfer tepat sesuai total invoice ke rekening BCA 1234-5678-90 a/n JNshop Official. Simpan struk/tangkapan layar dan unggah bukti transfer pada halaman detail pesanan.",
        accountName: "JNshop Official Store",
        accountNumber: "1234567890",
        logoUrl: "/icons/bca.png",
        isActive: true,
        displayOrder: 1,
      },
      {
        code: "MANDIRI_MANUAL",
        name: "Transfer Bank Mandiri",
        type: "MANUAL_TRANSFER",
        description: "Transfer manual ke rekening Bank Mandiri JNshop.",
        instructions:
          "Transfer tepat sesuai nominal pesanan ke Mandiri 9876-5432-1098 a/n JNshop Official. Unggah bukti pembayaran untuk diproses.",
        accountName: "JNshop Official Store",
        accountNumber: "987654321098",
        logoUrl: "/icons/mandiri.png",
        isActive: true,
        displayOrder: 2,
      },
      {
        code: "QRIS_INSTANT",
        name: "QRIS All Payment",
        type: "QRIS",
        description: "Scan QRIS via BCA Mobile, Livin, GoPay, OVO, DANA, ShopeePay.",
        instructions: "Pindai kode QRIS dinamis yang muncul menggunakan aplikasi perbankan atau e-wallet pilihan Anda.",
        accountName: "JNshop QRIS Merchant",
        accountNumber: "NMID-ID1029384756",
        logoUrl: "/icons/qris.png",
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226610014ID.LINKAJA.WWW011893600918000000000002150000000000000005204581253033605802ID5910JNSHOP%20OFFICIAL6013JAKARTA%20SELATAN61051219062070703A0163041A2B",
        isActive: true,
        displayOrder: 3,
      },
      {
        code: "BNI_VA",
        name: "BNI Virtual Account",
        type: "VIRTUAL_ACCOUNT",
        description: "Bayar otomatis melalui nomor Virtual Account BNI tanpa perlu konfirmasi manual.",
        instructions: "Masukkan kode Virtual Account 8808123456789012 pada menu transfer Virtual Account bank Anda.",
        accountName: "JNshop VA Billing",
        accountNumber: "8808123456789012",
        logoUrl: "/icons/bni.png",
        isActive: true,
        displayOrder: 4,
      },
      {
        code: "COD",
        name: "Cash on Delivery (COD)",
        type: "COD",
        description: "Bayar tunai kepada kurir saat barang fisik tiba di alamat rumah Anda.",
        instructions: "Pastikan Anda menyiapkan uang pas saat kurir mengantarkan paket ke alamat pengiriman.",
        isActive: true,
        displayOrder: 5,
      },
    ],
  });

  console.log("💳 Created 5 Payment Methods");

  // 6. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "JNSHOPNEW",
        description: "Voucher selamat datang pelanggan baru diskon 15%",
        type: "PERCENTAGE",
        value: 15,
        minPurchase: 100000,
        maxDiscount: 50000,
        quota: 500,
        usedCount: 14,
        isActive: true,
      },
      {
        code: "DISKONHEMAT10",
        description: "Potongan diskon 10% belanja hemat",
        type: "PERCENTAGE",
        value: 10,
        minPurchase: 50000,
        maxDiscount: 25000,
        quota: 1000,
        usedCount: 42,
        isActive: true,
      },
      {
        code: "HEMAT50RB",
        description: "Potongan langsung Rp 50.000 untuk pembelian minimal Rp 500.000",
        type: "FIXED",
        value: 50000,
        minPurchase: 500000,
        maxDiscount: 50000,
        quota: 100,
        usedCount: 8,
        isActive: true,
      },
    ],
  });

  console.log("🎟️ Created 3 Promo Coupons");

  // 7. Product Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: prodBoilerplate.id,
        userId: customerUser.id,
        rating: 5,
        title: "Arsitektur kode sangat rapi dan lengkap!",
        comment:
          "Sangat menghemat waktu development saya hingga berminggu-minggu. Integrasi Prisma, Next.js, dan payment gateway langsung jalan tanpa kendala. Recommended!",
        isModerated: true,
        isApproved: true,
      },
      {
        productId: prodKeyboard.id,
        userId: customerUser.id,
        rating: 5,
        title: "Keyboard terbaik untuk ngoding seharian",
        comment:
          "Packaging sangat rapi dengan bubble wrap tebal. Switch red sangat empuk dan feel mengetiknya sangat memuaskan.",
        isModerated: true,
        isApproved: true,
      },
      {
        productId: prodMouse.id,
        userId: customerUser.id,
        rating: 5,
        title: "Scroll wheel MagSpeed luar biasa",
        comment:
          "Bentuknya pas banget di genggaman tangan. Baterainya awet berminggu-minggu. JNshop pelayanannya top banget!",
        isModerated: true,
        isApproved: true,
      },
    ],
  });

  console.log("⭐ Created Sample Product Reviews");

  // 8. Sample Completed Order (for Budi)
  const orderCompleted = await prisma.order.create({
    data: {
      orderNumber: "JN-20261101-9981",
      userId: customerUser.id,
      status: "DELIVERED",
      totalAmount: 249000,
      discountAmount: 0,
      shippingFee: 0,
      grandTotal: 249000,
      notes: "Kirim link lisensi segera ya",
      recipientName: "Budi Santoso",
      recipientPhone: "081298765432",
      shippingAddressJson: JSON.stringify({
        recipient: "Budi Santoso",
        phone: "081298765432",
        address: "Jl. Senopati Dalam No. 18, Kebayoran Baru, Jakarta Selatan",
      }),
      createdAt: new Date(Date.now() - 6 * 86400000), // 6 days ago
      items: {
        create: [
          {
            productId: prodBoilerplate.id,
            productName: prodBoilerplate.name,
            productPrice: 249000,
            quantity: 1,
            subtotal: 249000,
            isDigital: true,
            digitalAccessDelivered: true,
            digitalAccessCode: "JN-PROD-2026-KEY-994821",
          },
        ],
      },
      payments: {
        create: [
          {
            paymentMethod: "QRIS",
            paymentChannel: "QRIS_INSTANT",
            transactionId: "TX-QRIS-998124",
            amount: 249000,
            status: "PAID",
          },
        ],
      },
    },
  });

  // 9. Sample Active Order (Physical In-Transit)
  const orderShipped = await prisma.order.create({
    data: {
      orderNumber: "JN-20261105-4421",
      userId: customerUser.id,
      status: "SHIPPED",
      totalAmount: 1299000,
      discountAmount: 50000, // Used coupon
      shippingFee: 18000,
      grandTotal: 1267000,
      notes: "Tolong bungkus bubble wrap ekstra tebal",
      recipientName: "Budi Santoso",
      recipientPhone: "081298765432",
      trackingNumber: "JN882910398ID",
      courierName: "SiCepat REG",
      shippingAddressJson: JSON.stringify({
        recipient: "Budi Santoso",
        phone: "081298765432",
        address: "Jl. Senopati Dalam No. 18, Kebayoran Baru, Jakarta Selatan",
      }),
      createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
      items: {
        create: [
          {
            productId: prodKeyboard.id,
            productName: prodKeyboard.name,
            productPrice: 1299000,
            quantity: 1,
            subtotal: 1299000,
            isDigital: false,
          },
        ],
      },
      payments: {
        create: [
          {
            paymentMethod: "MANUAL_TRANSFER",
            paymentChannel: "BCA_MANUAL",
            amount: 1267000,
            status: "PAID",
            paymentProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
            adminVerifiedBy: adminUser.id,
            adminVerifiedAt: new Date(Date.now() - 40 * 3600000),
          },
        ],
      },
      shipments: {
        create: [
          {
            courierName: "SiCepat",
            service: "REG",
            trackingNumber: "JN882910398ID",
            status: "IN_TRANSIT",
            estimatedDays: "1-2 hari kerja",
            shippedAt: new Date(Date.now() - 24 * 3600000),
            notes: "Paket sedang dalam perjalanan menuju hub transit Jakarta Selatan.",
          },
        ],
      },
    },
  });

  // 10. Sample Pending Order with Proof Uploaded waiting for admin verification
  const orderWaitingVerification = await prisma.order.create({
    data: {
      orderNumber: "JN-20261107-1092",
      userId: customerUser.id,
      status: "WAITING_CONFIRMATION",
      totalAmount: 1490000,
      discountAmount: 0,
      shippingFee: 22000,
      grandTotal: 1512000,
      notes: "Sudah transfer dari rekening atas nama Budi Santoso",
      recipientName: "Budi Santoso",
      recipientPhone: "081298765432",
      shippingAddressJson: JSON.stringify({
        recipient: "Budi Santoso",
        phone: "081298765432",
        address: "Jl. Senopati Dalam No. 18, Kebayoran Baru, Jakarta Selatan",
      }),
      createdAt: new Date(),
      items: {
        create: [
          {
            productId: prodMouse.id,
            productName: prodMouse.name,
            productPrice: 1490000,
            quantity: 1,
            subtotal: 1490000,
            isDigital: false,
          },
        ],
      },
      payments: {
        create: [
          {
            paymentMethod: "MANUAL_TRANSFER",
            paymentChannel: "BCA_MANUAL",
            amount: 1512000,
            status: "PENDING",
            paymentProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
          },
        ],
      },
    },
  });

  // 11. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: adminUser.id,
      action: "INITIAL_STORE_SETUP",
      entityType: "STORE_SETTING",
      entityId: storeSetting.id,
      detailsJson: JSON.stringify({ message: "JNshop store system initialized with complete seed data." }),
      ipAddress: "127.0.0.1",
      userAgent: "JNshop System Seeder",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n=======================================================");
  console.log("🎉 JNSHOP IS READY!");
  console.log("Admin Account    : admin@jnshop.com / admin123456");
  console.log("Customer Account : budi@gmail.com / customer123456");
  console.log("Store Front      : http://localhost:3000");
  console.log("Admin Dashboard  : http://localhost:3000/admin");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
