import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DEMO_FEEDBACK } from "@/lib/mockData";

const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1800));
    return NextResponse.json(DEMO_FEEDBACK);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { transcript, language, level, topic } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional language coach analyzing a ${language} conversation by ${level} learners. Provide constructive, encouraging feedback.`,
        },
        {
          role: "user",
          content: `Analyze this ${language} conversation. Topic: ${topic}. Level: ${level}.

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

Include 4-6 feedback points and 3 quiz questions.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content ?? "{}");
    return NextResponse.json(data);
  } catch (err) {
    console.error("Feedback generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
