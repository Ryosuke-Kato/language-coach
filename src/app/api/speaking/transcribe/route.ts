import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_TRANSCRIPT } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json({ transcript: DEMO_TRANSCRIPT });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
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
    return NextResponse.json({ transcript });
  } catch (err: unknown) {
    console.error("Transcription error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
