# Panduan Lengkap Deploy JNshop ke Vercel

Panduan ini memandu Anda mendeploy **JNshop** ke **Vercel** dengan arsitektur cloud production (PostgreSQL gratis + Vercel Blob Storage gratis). Seluruh fitur toko, keranjang, notifikasi QRIS email, panel admin, dan katalog produk berjalan 100% normal.

---

## Ringkasan Langkah
1. Buat Database PostgreSQL Gratis (**Supabase** atau **Neon** - 2 menit)
2. Inisialisasi Struktur Tabel & Data Toko (`db:push` & `db:seed`)
3. Hubungkan Repositori GitHub ke Vercel & Isi Environment Variables
4. Aktifkan Vercel Blob Storage (1-Click untuk Bukti Bayar & QRIS)

---

## Langkah 1: Buat Database PostgreSQL Cloud Gratis (Supabase)

1. Buka [https://supabase.com](https://supabase.com) lalu masuk/daftar menggunakan akun GitHub Anda.
2. Klik tombol **New Project**, pilih nama proyek (misal: `jnshop-db`), buat **Database Password** yang kuat (catat password ini), dan pilih Region terdekat (misal: **Singapore**).
3. Setelah database siap (sekitar 1-2 menit), buka menu **Project Settings** (ikon gerigi di kiri bawah) > pilih **Database**.
4. Gulir ke bagian **Connection string** > pilih tab **URI** (atau **Connection pooling: Session/Transaction mode**).
5. Salin URI koneksi tersebut. Formatnya terlihat seperti ini:
   ```text
   postgresql://postgres:[PASSWORD_ANDA]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
   ```
   *(Ganti `[PASSWORD_ANDA]` dengan password yang Anda buat di langkah 2)*.

> **Alternatif selain Supabase:** Anda juga bisa menggunakan [https://neon.tech](https://neon.tech) (gratis, tanpa kartu kredit) yang langsung memberikan `DATABASE_URL` instan.

---

## Langkah 2: Inisialisasi Tabel & Data Awal Toko ke Database Cloud

Buka terminal laptop Anda di folder `jnshop`, lalu jalankan 2 perintah berikut:

```bash
# 1. Masukkan URL database Supabase Anda ke DATABASE_URL sementara
DATABASE_URL="postgresql://postgres:[PASSWORD_ANDA]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" npm run db:push

# 2. Masukkan data katalog produk awal, kategori, pengaturan toko, dan akun admin default
DATABASE_URL="postgresql://postgres:[PASSWORD_ANDA]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require" npm run db:seed
```

Kedua perintah ini akan:
* Membuat semua tabel e-commerce secara otomatis (User, Product, Order, Payment, StoreSetting, dll.).
* Mengisi produk-produk siap pakai dan akun admin default (`admin@jnshop.com` / `admin123456`).

---

## Langkah 3: Simpan Kode ke GitHub & Hubungkan ke Vercel

1. Commit perubahan terbaru Anda:
   ```bash
   git add .
   git commit -m "feat: prepare cloud architecture for Vercel deployment"
   git push origin main
   ```
2. Buka dashboard [https://vercel.com](https://vercel.com).
3. Klik tombol **Add New...** > pilih **Project**.
4. Pilih repositori GitHub `jnshop` Anda, lalu klik **Import**.
5. Sebelum menekan Deploy, buka bagian **Environment Variables** dan masukkan variabel berikut:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | URI PostgreSQL Supabase/Neon Anda dari Langkah 1 |
| `JWT_SECRET` | String acak rahasia (contoh: `jnshop-super-secret-production-key-2026-safe`) |
| `NEXT_PUBLIC_APP_URL` | URL Vercel Anda (misal `https://jnshop.vercel.app`) |
| `ADMIN_NOTIFICATION_EMAIL` | `jaidav.enggineernes@gmail.com` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `jaidav.enggineernes@gmail.com` |
| `SMTP_PASS` | Sandi Aplikasi Google 16 karakter akun Gmail Anda |
| `EMAIL_FROM` | `JNshop Store <jaidav.enggineernes@gmail.com>` |
| `GEMINI_API_KEY` | API Key Google Gemini Anda |

6. Klik tombol **Deploy** dan tunggu proses build selesai (sekitar 1-2 menit).

---

## Langkah 4: Aktifkan Vercel Blob Storage (Penyimpanan Foto Bukti Bayar & QRIS)

Agar foto bukti transfer pelanggan dan gambar kode QRIS admin tersimpan di CDN cloud berkecepatan tinggi:

1. Di dashboard proyek Anda di Vercel, klik tab **Storage** pada menu atas.
2. Klik tombol **Create Database** > pilih **Blob**.
3. Beri nama (misal: `jnshop-blob`), lalu klik **Create**.
4. Vercel akan otomatis menyuntikkan variabel `BLOB_READ_WRITE_TOKEN` ke proyek Anda.
5. Lakukan **Redeploy** sekali agar token aktif.

*(Catatan: Jika Vercel Blob belum diaktifkan, sistem sudah dilengkapi cadangan otomatis Base64 Data URI sehingga pelanggan dan admin tetap bisa mengunggah bukti bayar dan QRIS tanpa error).*

---

## Langkah 5: Login ke Halaman Admin Toko Live

Setelah deploy selesai:
1. Buka `https://nama-proyek-anda.vercel.app/login`
2. Masuk menggunakan akun admin:
   - **Email:** `admin@jnshop.com`
   - **Password:** `admin123456`
3. Segera ubah kata sandi akun admin Anda di menu Akun / Profil untuk keamanan toko Anda.

Selamat! Toko online **JNshop** Anda kini resmi live di internet via Vercel dengan performa tinggi, aman, dan siap menerima pesanan.
