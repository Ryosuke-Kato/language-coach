import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireIdentity } from "../../../../../cursor/identity";
import { DEMO_FEEDBACK } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

const ALLOWED_LANGUAGES = ["English", "French", "Spanish", "Japanese", "Mandarin", "Vietnamese"];
const ALLOWED_LEVELS = ["A1", "A2", "B1", "B2"];
const MAX_TRANSCRIPT_LENGTH = 3000;

export async function POST(req: NextRequest) {
  const identity = await requireIdentity(req);
  if (identity instanceof Response) return identity;

  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1800));
    return NextResponse.json(DEMO_FEEDBACK);
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
      systemInstruction: `You are a professional language coach analyzing a ${language} conversation by ${level} learners. Provide constructive, encouraging feedback.`,
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(
      `Analyze this ${language} conversation. Level: ${level}.

Transcript:
${safeTranscript}

Return JSON:
{
  "overallScore": 78,
  "summary": "One encouraging summary sentence",
  "points": [
    { "category": "grammar", "title": "...", "detail": "...", "positive": true },
    { "category": "vocabulary", "title": "...", "detail": "...", "positive": true },
    { "category": "fluency", "title": "...", "detail": "...", "positive": false },
    { "category": "pronunciation", "title": "...", "detail": "...", "positive": false }
  ],
  "quizQuestions": [
    { "id": 1, "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 }
  ]
}

Include 4-6 feedback points and 3 quiz questions.`
    );

    const data = JSON.parse(result.response.text());
    return NextResponse.json(data, {
      headers: { "cache-control": "private, no-store" },
    });
  } catch (err: unknown) {
    console.error("Feedback generation error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
