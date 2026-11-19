import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireIdentity } from "../../../../../cursor/identity";
import { DEMO_TRANSCRIPT } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

const ALLOWED_LANGUAGES = ["English", "French", "Spanish", "Japanese", "Mandarin", "Vietnamese"];
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const identity = await requireIdentity(req);
  if (identity instanceof Response) return identity;

  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json({ transcript: DEMO_TRANSCRIPT });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = String(formData.get("language") ?? "");

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }
    if (!ALLOWED_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Audio file too large (max 10 MB)" },
        { status: 413 }
      );
    }

    const bytes = await audioFile.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = audioFile.type || "audio/webm";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      { inlineData: { mimeType, data: base64 } },
      `Transcribe exactly what is said in this audio recording in ${language}. Return only the transcription text with no additional commentary or formatting.`,
    ]);

    const transcript = result.response.text().trim();
    return NextResponse.json(
      { transcript },
      { headers: { "cache-control": "private, no-store" } }
    );
  } catch (err: unknown) {
    console.error("Transcription error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
