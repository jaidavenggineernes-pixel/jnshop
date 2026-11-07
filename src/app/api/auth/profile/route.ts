import { NextResponse } from "next/server";
import { requireAuthUser, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await requireAuthUser();
    const body = await req.json();
    const { name, phone, bio, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Kata sandi saat ini wajib diisi untuk mengubah kata sandi." }, { status: 400 });
      }
      const match = await verifyPassword(currentPassword, user.passwordHash);
      if (!match) {
        return NextResponse.json({ error: "Kata sandi saat ini salah." }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Kata sandi baru minimal 6 karakter." }, { status: 400 });
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...updateData,
        profile: {
          upsert: {
            create: { bio: bio || null },
            update: { bio: bio || null },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
      },
    });

    return NextResponse.json({ success: true, user: updated, message: "Profil berhasil diperbarui!" });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }
    return NextResponse.json({ error: "Gagal memperbarui profil." }, { status: 500 });
  }
}
