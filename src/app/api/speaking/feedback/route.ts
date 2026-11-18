import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { DEMO_FEEDBACK } from "@/lib/mockData";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1800));
    return NextResponse.json(DEMO_FEEDBACK);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const { transcript, language, level } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a professional language coach analyzing a ${language} conversation by ${level} learners. Provide constructive, encouraging feedback.`,
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(
      `Analyze this ${language} conversation. Level: ${level}.

Transcript:
${transcript}

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
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Feedback generation error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
