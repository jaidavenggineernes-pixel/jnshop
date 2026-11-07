import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const { apiKey, model = "gemini-2.5-flash" } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API Key tidak boleh kosong." }, { status: 400 });
    }

    const testPrompt = "Jawab singkat dalam satu kalimat bahasa Indonesia: Apakah Anda siap menjadi asisten belanja cerdas untuk JNshop?";
    const startTime = Date.now();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: testPrompt }] }],
          generationConfig: { maxOutputTokens: 100 },
        }),
      }
    );

    const latency = Date.now() - startTime;

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        {
          success: false,
          error: `Koneksi ke Gemini gagal (${res.status}): ${errText}`,
        },
        { status: 400 }
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Koneksi sukses!";

    return NextResponse.json({
      success: true,
      message: text.trim(),
      latencyMs: latency,
      modelUsed: model,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menguji koneksi Gemini API." },
      { status: 500 }
    );
  }
}
