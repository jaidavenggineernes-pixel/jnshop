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
    });
  } catch (err) {
    console.error("AI Chat route error:", err);
    return NextResponse.json(
      { reply: "Maaf, JNshop AI sedang dalam pemeliharaan. Silakan hubungi admin via WhatsApp." },
      { status: 500 }
    );
  }
}
