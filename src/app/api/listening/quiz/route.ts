import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireIdentity } from "../../../../../cursor/identity";
import { DEMO_QUIZ } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

const ALLOWED_LANGUAGES = ["English", "French", "Spanish", "Japanese", "Mandarin", "Vietnamese"];
const ALLOWED_LEVELS = ["A1", "A2", "B1", "B2"];
const MAX_TRANSCRIPT_LENGTH = 3000;

export async function POST(req: NextRequest) {
  const identity = await requireIdentity(req);
  if (identity instanceof Response) return identity;

  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(DEMO_QUIZ);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const body = await req.json();
    const { transcript, language, level } = body;

    if (!ALLOWED_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }
    if (!ALLOWED_LEVELS.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }
    const safeTranscript = String(transcript).slice(0, MAX_TRANSCRIPT_LENGTH);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a language learning assessment expert. Create comprehension quiz questions in English about ${language} content for ${level} learners.`,
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(
      `Based on this ${language} transcript, create 5 multiple-choice comprehension questions in English.

Transcript:
${safeTranscript}

Return JSON: { "questions": [{ "id": 1, "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 }] }`
    );

    const data = JSON.parse(result.response.text());
    return NextResponse.json(data, {
      headers: { "cache-control": "private, no-store" },
    });
  } catch (err: unknown) {
    console.error("Quiz generation error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
