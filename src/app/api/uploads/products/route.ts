import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await requireAdminUser();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string" || !file.size) {
      return NextResponse.json(
        { error: "File gambar produk wajib dipilih." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap gunakan file gambar JPG, PNG, atau WEBP." },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal ukuran gambar adalah 5MB." },
        { status: 400 }
      );
    }

    const prefix = "prod";
    const saved = await saveUploadedImage("products", prefix, file);

    return NextResponse.json({
      success: true,
      url: saved.url,
      filename: saved.filename,
    });
  } catch (error: any) {
    console.error("Upload product image error:", error);
    if (error?.message === "FORBIDDEN_ADMIN_ONLY") {
      return NextResponse.json(
        { error: "Hanya akun admin yang diizinkan mengunggah foto produk." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Gagal mengunggah gambar produk." },
      { status: 500 }
    );
  }
}
