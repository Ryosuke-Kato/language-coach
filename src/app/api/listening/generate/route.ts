import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_LISTENING } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1200));
    return NextResponse.json(DEMO_LISTENING);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const { language, level, topic, contentType } = await req.json();

    const wordCounts: Record<string, number> = {
      A1: 80,
      A2: 120,
      B1: 180,
      B2: 250,
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
      `Create a ${contentType} in ${language} at ${level} level about "${topic}". Approximately ${wordCount} words.
Return JSON: { "title": "...", "transcript": "..." }`
    );

    const data = JSON.parse(result.response.text());
    const duration = Math.ceil(
      (data.transcript.split(/\s+/).length / 130) * 60
    );

    return NextResponse.json({
      title: data.title,
      transcript: data.transcript,
      duration,
    });
  } catch (err: unknown) {
    console.error("Listening generate error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
