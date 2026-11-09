import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { transcript, language, level, topic } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional language coach analyzing a ${language} conversation by ${level} learners. Provide constructive, encouraging feedback that helps learners improve.`,
        },
        {
          role: "user",
          content: `Analyze this ${language} conversation transcript and provide detailed language learning feedback.

Topic: ${topic}
Level: ${level}

Transcript:
${transcript}

Return JSON with this exact shape:
{
  "overallScore": 78,
  "summary": "One encouraging summary sentence",
  "points": [
    {
      "category": "grammar",
      "title": "Subject-verb agreement",
      "detail": "Specific observation with example from the transcript",
      "positive": true
    },
    {
      "category": "vocabulary",
      "title": "Good range of expressions",
      "detail": "Specific observation",
      "positive": true
    },
    {
      "category": "fluency",
      "title": "Natural flow",
      "detail": "Specific observation",
      "positive": false
    },
    {
      "category": "pronunciation",
      "title": "Pronunciation tip",
      "detail": "Specific tip for improvement",
      "positive": false
    }
  ],
  "quizQuestions": [
    {
      "id": 1,
      "question": "What grammar point appeared most in the conversation?",
      "options": ["Present tense", "Past tense", "Future tense", "Conditionals"],
      "correctIndex": 1
    }
  ]
}

Include 4-6 feedback points and 3 quiz questions about grammar/vocabulary from the conversation.`,
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
