import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
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
Each question should test understanding of the content.

Transcript:
${transcript}

Return JSON with this exact shape:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text in English",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}`,
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
