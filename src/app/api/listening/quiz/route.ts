import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_QUIZ } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(DEMO_QUIZ);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const { transcript, language, level } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a language learning assessment expert. Create comprehension quiz questions in English about ${language} content for ${level} learners.`,
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(
      `Based on this ${language} transcript, create 5 multiple-choice comprehension questions in English.

Transcript:
${transcript}

Return JSON: { "questions": [{ "id": 1, "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 }] }`
    );

    const data = JSON.parse(result.response.text());
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Quiz generation error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
