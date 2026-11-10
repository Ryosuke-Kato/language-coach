import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DEMO_LISTENING } from "@/lib/mockData";

const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1200)); // simulate latency
    return NextResponse.json(DEMO_LISTENING);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { language, level, topic, contentType } = await req.json();

    const wordCounts: Record<string, number> = {
      A1: 80,
      A2: 120,
      B1: 180,
      B2: 250,
    };
    const wordCount = wordCounts[level] ?? 150;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a language learning content creator. Generate natural, engaging ${contentType} transcripts in ${language} for ${level} learners.`,
        },
        {
          role: "user",
          content: `Create a ${contentType} in ${language} at ${level} level about "${topic}". Approximately ${wordCount} words.
Return JSON: { "title": "...", "transcript": "...", "ttsText": "..." }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const data = JSON.parse(completion.choices[0].message.content ?? "{}");

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: data.ttsText ?? data.transcript,
      speed: level === "A1" || level === "A2" ? 0.9 : 1.0,
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());
    const audioDataUrl = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
    const duration = Math.ceil((data.transcript.split(/\s+/).length / 130) * 60);

    return NextResponse.json({
      title: data.title,
      transcript: data.transcript,
      audioUrl: audioDataUrl,
      duration,
    });
  } catch (err) {
    console.error("Listening generate error:", err);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
