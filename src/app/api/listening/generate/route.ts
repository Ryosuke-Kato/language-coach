import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { language, level, topic, contentType } = await req.json();

    const wordCounts: Record<string, number> = {
      A1: 80,
      A2: 120,
      B1: 180,
      B2: 250,
    };
    const wordCount = wordCounts[level] ?? 150;

    const systemPrompt = `You are a language learning content creator. Generate natural, engaging ${contentType} transcripts in ${language} for ${level} learners. The content must be clearly about the given topic and appropriate for the learner's level.`;

    const userPrompt = `Create a ${contentType} in ${language} at ${level} level about "${topic}". 
The transcript should be approximately ${wordCount} words.
Return JSON with this exact shape:
{
  "title": "Short catchy title",
  "transcript": "The full text in ${language}",
  "ttsText": "The text optimized for TTS (clean, no stage directions)"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const data = JSON.parse(completion.choices[0].message.content ?? "{}");

    // Generate TTS audio
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: data.ttsText ?? data.transcript,
      speed: level === "A1" || level === "A2" ? 0.9 : 1.0,
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());
    const audioBase64 = audioBuffer.toString("base64");
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Rough duration estimate: ~130 words/min
    const wordCount2 = data.transcript.split(/\s+/).length;
    const duration = Math.ceil((wordCount2 / 130) * 60);

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
