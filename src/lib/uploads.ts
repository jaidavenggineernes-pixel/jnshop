import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function saveUploadedImage(
  folder: "proofs" | "qris",
  prefix: string,
  file: File
): Promise<{ url: string; buffer: Buffer; filename: string; contentType: string }> {
  const ext = EXT_BY_MIME[file.type];
  if (!ext) {
    throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran gambar harus antara 1 byte dan 5MB.");
  }

  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `${safePrefix}-${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  // 1. Cloud Storage: Vercel Blob (when BLOB_READ_WRITE_TOKEN is configured in Vercel dashboard)
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      const pathname = `${folder}/${filename}`;
      const res = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${blobToken}`,
          "x-add-random-suffix": "1",
          "content-type": file.type,
        },
        body: buffer,
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.url) {
          return {
            url: data.url,
            buffer,
            filename,
            contentType: file.type,
          };
        }
      } else {
        console.warn("Vercel Blob upload response not OK:", await res.text().catch(() => ""));
      }
    } catch (blobErr) {
      console.warn("Vercel Blob upload error, attempting fallback:", blobErr);
    }
  }

  // 2. Local Disk Storage: for local development or VPS where disk is writable
  try {
    const dir = path.resolve(process.cwd(), "storage", folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);

    return {
      url: `/api/uploads/${folder}/${filename}`,
      buffer,
      filename,
      contentType: file.type,
    };
  } catch (fsErr: any) {
    // 3. Resilient Fallback for Serverless (Vercel) without persistent disk: Data URI
    console.warn("Local storage write skipped on serverless filesystem, encoding to Data URI:", fsErr?.message);
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    return {
      url: dataUri,
      buffer,
      filename,
      contentType: file.type,
    };
  }
}

export async function serveStorageImage(folder: "proofs" | "qris", filename: string) {
  try {
    const safeName = path.basename(filename);

    if (!safeName || safeName !== filename || !/^[a-zA-Z0-9._-]+$/.test(safeName)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME_BY_EXT[ext];
    if (!contentType) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const filePath = path.resolve(process.cwd(), "storage", folder, safeName);
    const data = await fs.readFile(filePath);

    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
