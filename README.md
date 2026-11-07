# 🛍️ JNshop — Personal E-Commerce Platform & AI Shopping Assistant

Platform e-commerce modern full-stack berbasis website yang dirancang khusus untuk mengelola penjualan produk fisik, produk digital, lisensi software, dan jasa profesional secara mandiri dan terpercaya. Dilengkapi **JNshop AI Assistant**, Dashboard Pemilik Toko (Admin), sistem transaksi lengkap, dan integrasi notifikasi.

---

## 🌟 Fitur Utama

### 1. Etalase & Pengalaman Pelanggan (Storefront)
- **Halaman Utama (Landing Page):**
  - Banner promosi interaktif & slider penawaran.
  - Showcase kategori (Digital & Lisensi, Gadget, Workspace, Layanan Jasa, Fashion).
  - Produk Unggulan (Featured), Produk Terbaru, dan Produk Terlaris.
  - Kartu produk interaktif dengan label diskon, rating bintang, status stok, tombol detail, dan tombol tambah ke keranjang cepat.
- **Katalog & Pencarian Canggih:**
  - Pencarian kata kunci real-time.
  - Filter format (Produk Fisik vs Produk Digital & Lisensi).
  - Filter rentang harga (Min/Max).
  - Filter kategori & pengurutan (Termurah, Termahal, Terbaru, Rating Tertinggi).
- **Halaman Detail Produk:**
  - Galeri multi-foto interaktif.
  - Pemilihan varian (Switch keyboard, Ukuran baju, Warna mouse, Lisensi personal/komersial).
  - Kontrol jumlah beli dengan validasi stok otomatis.
  - Tombol **+ Keranjang**, **Beli Sekarang** (langsung ke checkout), dan **Bagikan**.
  - Rincian pemenuhan produk digital (Instant Download & License Key).
  - Ulasan & rating pelanggan terverifikasi.
  - Rekomendasi produk terkait.
- **Keranjang Belanja (Cart System):**
  - Slide-over drawer keranjang cepat di semua halaman.
  - Halaman keranjang lengkap dengan pengubah kuantitas, penghitung diskon, dan subtotal otomatis.
  - Penyimpanan data keranjang persisten (tidak hilang saat refresh).
- **Checkout & Multi-Metode Pembayaran:**
  - Formulir pengiriman berstandar alamat Indonesia (Provinsi, Kota/Kabupaten, Kecamatan, Kode Pos).
  - Pilihan ekspedisi pengiriman (SiCepat, JNE, J&T). Gratis ongkos kirim otomatis untuk pesanan serba digital.
  - Penerapan kode voucher promo (contoh: `JNSHOPNEW` untuk diskon 15%).
  - Metode pembayaran:
    1. **QRIS Instant All Payment** (BCA Mobile, Livin, GoPay, OVO, Dana, ShopeePay).
    2. **Transfer Bank Manual BCA & Mandiri** dengan formulir upload bukti transfer dan verifikasi ketat oleh admin.
    3. **BNI Virtual Account**.
    4. **Cash on Delivery (COD)** untuk produk fisik.
  - Pembuatan invoice unik otomatis (`JN-YYYYMMDD-XXXX`).
- **Pelacakan Pesanan (Order Tracking):**
  - Timeline status (Menunggu Bayar ➔ Menunggu Verifikasi ➔ Lunas ➔ Diproses ➔ Dikirim ➔ Selesai).
  - Nomor resi pengiriman terlacak.
  - Akses unduhan langsung file digital & kode lisensi segera setelah pembayaran lunas.
  - Halaman lacak pesanan publik tanpa harus login (`/orders/track`).
- **Area Akun Pelanggan:**
  - Riwayat lengkap transaksi dan status pesanan.
  - Daftar produk favorit (Wishlist) dengan tombol pindah ke keranjang.
  - Pengaturan profil dan ganti kata sandi.
- **Pusat Bantuan & FAQ:**
  - Jawaban pertanyaan umum seputar pembayaran, garansi retur 7 hari, dan pengiriman.
  - Tombol WhatsApp bantuan langsung ke pemilik toko.

---

### 2. JNshop AI — Asisten Belanja Cerdas
- **Widget Chatbot Floating:** Tersedia di pojok kanan bawah seluruh halaman website.
- **Didukung Gemini AI & Konteks Database Real-time:**
  - Membaca langsung katalog database JNshop (harga, stok, spesifikasi, dan varian) sehingga **tidak mengarang (halusinasi)** data produk.
  - Membantu pelanggan mencari produk berdasarkan kebutuhan dan anggaran.
  - Memberikan tautan langsung ke produk terkait dalam format link interaktif.
  - Menjelaskan tata cara pembayaran dan pelacakan pesanan.
  - **Eskalasi ke WhatsApp Admin:** Tombol klik-ke-chat WhatsApp dengan teks otomatis jika pelanggan membutuhkan bantuan langsung pemilik toko.

---

### 3. Dashboard Admin / Owner (`/admin`)
- **Proteksi Akses (RBAC):** Hanya akun dengan role `ADMIN` yang dapat mengakses area admin.
- **Statistik & KPI Real-Time:**
  - Total omset penjualan lunas.
  - Jumlah total pesanan & notifikasi pesanan yang perlu diverifikasi transfernya.
  - Jumlah pelanggan terdaftar.
  - Peringatan stok menipis (Low Stock Alert).
  - Tabel transaksi terbaru dengan aksi cepat.
- **Manajemen Produk:**
  - Tambah produk fisik atau digital.
  - Fitur **Buat Deskripsi dengan AI ✨** untuk membuat copy produk otomatis.
  - Pengaturan harga, diskon, SKU, stok, varian, dan tautan file/lisensi digital.
- **Manajemen Pesanan:**
  - Filter status pesanan.
  - Inspeksi bukti transfer yang diunggah pelanggan.
  - **Tombol Verifikasi Pembayaran Manual:** Memvalidasi bukti transfer, mengubah status menjadi lunas/diproses, dan mengirim notifikasi ke pembeli.
  - **Input Nomor Resi Ekspedisi:** Mengubah status menjadi dikirim dan mengirimkan resi ke pelanggan.
- **Manajemen Pelanggan:** Daftar seluruh pembeli, kontak WhatsApp, tanggal gabung, dan total belanja.
- **Kategori Produk:** Tambah dan kelola kategori produk.
- **Kupon & Promo:** Buat kode voucher (persentase diskon atau nominal tetap, minimal belanja, kuota, cap maksimal).
- **Pengaturan Toko:** Kelola nama toko, nomor WhatsApp notifikasi, alamat, pengumuman running banner, dan kebijakan retur/privasi.
- **Laporan & Ekspor CSV:** Unduh buku kas transaksi ke format CSV untuk dianalisis di Microsoft Excel atau Google Sheets.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) & React 19 |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Database ORM** | Prisma ORM |
| **Database** | SQLite (Zero-config lokal) & PostgreSQL (Production Supabase/Neon/Railway) |
| **Autentikasi & RBAC** | JWT Session via HTTP-Only Cookies (`jose`) & Password Hash (`bcryptjs`) |
| **AI Assistant** | Google Gemini API + Context Retrieval Engine |
| **Payment Gateway** | Arsitektur Midtrans Snap / Xendit + Manual Bank Transfer Verification Flow |
| **Notifikasi** | WhatsApp Click-to-Chat Deep Links & WhatsApp Cloud API + Email Abstraction |

---

## 🚀 Panduan Menjalankan Project Secara Lokal

### 1. Kloning atau Buka Folder Project
Buka folder `jnshop` di Visual Studio Code:
```bash
cd /Users/mac/jnshop
```

### 2. Konfigurasi Environment (`.env`)
File `.env` sudah dikonfigurasi untuk siap jalan langsung. Jika ingin menambahkan API Key Gemini untuk asisten AI:
```env
# Database lokal (SQLite bawaan, file:./dev.db)
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="jnshop-super-secure-jwt-key-default-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google Gemini API Key (Dapatkan gratis di https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=""

# WhatsApp Admin Toko
WHATSAPP_DEFAULT_ADMIN_NUMBER="6281234567890"

# Midtrans (Opsional untuk payment gateway)
MIDTRANS_SERVER_KEY=""
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=""
MIDTRANS_IS_PRODUCTION="false"
```

### 3. Generate Database & Seed Data Bawaan
Jalankan perintah berikut untuk mengisi database dengan produk, kategori, kupon, akun admin, dan pesanan sampel:
```bash
npm run db:push
npm run db:seed
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akun Login Bawaan (Demo Credentials)

Untuk mempermudah pengujian, sistem telah dilengkapi akun bawaan yang bisa langsung digunakan:

### 👑 Akun Administrator (Owner JNshop)
- **Email:** `admin@jnshop.com`
- **Password:** `admin123456`
- **Akses:** Halaman Utama, Katalog, Akun, dan [Dashboard Admin (/admin)](http://localhost:3000/admin)

### 👤 Akun Pelanggan (Customer Demo)
- **Email:** `budi@gmail.com`
- **Password:** `customer123456`
- **Akses:** Belanja, Riwayat Pesanan, Wishlist, Profil

> **Tips:** Di halaman login (`/login`), terdapat tombol **1-Click Akun Demo** sehingga Anda tidak perlu mengetik email & kata sandi secara manual saat pengujian.

---

## 🛡️ Panduan Membuat Akun Admin Baru Secara Aman

Jika Anda ingin membuat akun admin pemilik baru atau memperbarui akun yang ada, jalankan script CLI interaktif:
```bash
npm run admin:create
```
Ikuti instruksi di terminal untuk memasukkan nama, email, nomor WhatsApp, dan password aman Anda.

---

## 🌐 Panduan Deployment ke Production (Vercel & PostgreSQL)

### 1. Database PostgreSQL (Supabase / Neon / Railway)
1. Buat database PostgreSQL baru di [Supabase](https://supabase.com) atau [Neon](https://neon.tech).
2. Salin connection string PostgreSQL.
3. Ganti provider di `prisma/schema.prisma` menjadi `postgresql` (atau salin isi file `prisma/schema.postgresql.prisma` ke `prisma/schema.prisma`).
4. Jalankan:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### 2. Deploy ke Vercel
1. Hubungkan repository GitHub Anda ke [Vercel](https://vercel.com).
2. Masukkan Environment Variables:
   - `DATABASE_URL`: URL PostgreSQL Anda
   - `JWT_SECRET`: String acak yang aman
   - `NEXT_PUBLIC_APP_URL`: Domain Vercel Anda (contoh: `https://jnshop.vercel.app`)
   - `GEMINI_API_KEY`: API Key Google Gemini
   - `MIDTRANS_SERVER_KEY` & `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` (jika menggunakan Midtrans)
3. Klik **Deploy**. Website JNshop Anda langsung aktif secara global!

---

## 📱 Kesiapan Pengembangan Mobile App (Android & iOS)

Struktur JNshop dibangun dengan Next.js App Router dan REST API terpisah (`/api/*`), sehingga di masa depan Anda dapat menghubungkan aplikasi mobile (React Native / Flutter / Expo / PWA) ke backend JNshop yang sama tanpa perlu membangun ulang database atau sistem transaksi.
