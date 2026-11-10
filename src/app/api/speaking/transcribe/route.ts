import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DEMO_TRANSCRIPT } from "@/lib/mockData";

const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json({ transcript: DEMO_TRANSCRIPT });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const language = formData.get("language") as string;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file" }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: getWhisperLanguageCode(language),
      response_format: "text",
    });

    return NextResponse.json({ transcript: transcription });
  } catch (err) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}

function getWhisperLanguageCode(language: string): string {
  const codes: Record<string, string> = {
    English: "en",
    Spanish: "es",
    French: "fr",
    German: "de",
    Japanese: "ja",
    Korean: "ko",
    Chinese: "zh",
    Italian: "it",
    Portuguese: "pt",
  };
  return codes[language] ?? "en";
}
