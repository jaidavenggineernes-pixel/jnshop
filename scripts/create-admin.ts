import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("==================================================");
  console.log("🔐 JNshop — Pembuatan Akun Administrator Pertama");
  console.log("==================================================");

  const email = (await question("Masukkan Alamat Email Admin: ")).trim().toLowerCase();
  const name = (await question("Masukkan Nama Lengkap: ")).trim();
  const phone = (await question("Masukkan Nomor WhatsApp/HP: ")).trim();
  const password = await question("Masukkan Kata Sandi (min 6 karakter): ");

  if (!email || !name || !password || password.length < 6) {
    console.error("❌ Data tidak valid. Email, nama, dan kata sandi minimal 6 karakter wajib diisi.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`⚠️ Email ${email} sudah ada di database. Mengupdate role menjadi ADMIN...`);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        name,
        phone,
        passwordHash,
      },
    });
    console.log(`✅ Berhasil! Akun ${email} sekarang memiliki akses ADMIN.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        name,
        phone,
        role: "ADMIN",
        passwordHash,
        emailVerified: new Date(),
        profile: {
          create: {
            bio: "Owner & Administrator JNshop",
          },
        },
      },
    });
    console.log(`✅ Akun Admin berhasil dibuat untuk: ${email}`);
  }

  console.log("==================================================");
  console.log("Silakan login di: http://localhost:3000/login");
  console.log("Dashboard Admin : http://localhost:3000/admin");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
  });
