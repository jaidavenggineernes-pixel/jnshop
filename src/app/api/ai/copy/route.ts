import { NextResponse } from "next/server";
import { generateAdminCopy } from "@/lib/ai";
import { requireAdminUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await requireAdminUser();
    const { type, input } = await req.json();

    const copy = await generateAdminCopy(type || "DESCRIPTION", input || {});

    return NextResponse.json({ success: true, text: copy });
  } catch (error: any) {
    console.error("AI Copy error:", error);
    return NextResponse.json({ error: "Failed to generate AI copy" }, { status: 500 });
  }
}
