import { NextResponse } from "next/server";
import { generateJNshopAIResponse } from "@/lib/ai";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const session = await getSessionUser();
    const result = await generateJNshopAIResponse(messages, session);

    return NextResponse.json({
      reply: result.content,
      source: result.source,
      recommendedProducts: result.recommendedProducts || [],
      actionSuggestions: result.actionSuggestions || [],
    });
  } catch (err) {
    console.error("AI Chat route error:", err);
    return NextResponse.json(
      {
        reply: "Halo! Maaf, JNshop AI sedang dalam pemeliharaan singkat. Anda dapat langsung bertanya kepada pemilik toko via WhatsApp di tombol yang tersedia.",
        source: "intelligent-local",
        recommendedProducts: [],
        actionSuggestions: ["Hubungi Admin WA", "Katalog Produk", "Cara Belanja"],
      },
      { status: 200 }
    );
  }
}
