import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DEMO_QUIZ } from "@/lib/mockData";

const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(DEMO_QUIZ);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { transcript, language, level } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a language learning assessment expert. Create comprehension quiz questions in English about ${language} content for ${level} learners.`,
        },
        {
          role: "user",
          content: `Based on this ${language} transcript, create 5 multiple-choice comprehension questions in English.

Transcript:
${transcript}

Return JSON: { "questions": [{ "id": 1, "question": "...", "options": ["A","B","C","D"], "correctIndex": 0 }] }`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content ?? "{}");
    return NextResponse.json(data);
  } catch (err) {
    console.error("Quiz generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
