import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireIdentity } from "../../../../../cursor/identity";
import { DEMO_LISTENING } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

const ALLOWED_LANGUAGES = ["English", "French", "Spanish", "Japanese", "Mandarin", "Vietnamese"];
const ALLOWED_LEVELS = ["A1", "A2", "B1", "B2"];
const ALLOWED_CONTENT_TYPES = ["dialogue", "news", "story", "announce"];
const MAX_TOPIC_LENGTH = 100;

export async function POST(req: NextRequest) {
  const identity = await requireIdentity(req);
  if (identity instanceof Response) return identity;

  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1200));
    return NextResponse.json(DEMO_LISTENING);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const body = await req.json();
    const { language, level, topic, contentType } = body;

    if (!ALLOWED_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }
    if (!ALLOWED_LEVELS.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    const safeTopic = String(topic).slice(0, MAX_TOPIC_LENGTH);

    const wordCounts: Record<string, number> = {
      A1: 80, A2: 120, B1: 180, B2: 250,
    };
    const wordCount = wordCounts[level] ?? 150;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a language learning content creator. Generate natural, engaging ${contentType} transcripts in ${language} for ${level} learners.`,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const result = await model.generateContent(
      `Create a ${contentType} in ${language} at ${level} level about "${safeTopic}". Approximately ${wordCount} words.
Return JSON: { "title": "...", "transcript": "..." }`
    );

    const data = JSON.parse(result.response.text());
    const duration = Math.ceil((data.transcript.split(/\s+/).length / 130) * 60);

    return NextResponse.json(
      { title: data.title, transcript: data.transcript, duration },
      { headers: { "cache-control": "private, no-store" } }
    );
  } catch (err: unknown) {
    console.error("Listening generate error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
