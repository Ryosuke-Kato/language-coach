import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const isDemo = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.GEMINI_API_KEY;

const DEMO_TOPICS = [
  "Café Life",
  "Food & Drinks",
  "Morning Routine",
  "Social Spaces",
  "Urban Daily Life",
];

export async function POST(req: NextRequest) {
  if (isDemo()) {
    await new Promise((r) => setTimeout(r, 1200));
    return NextResponse.json({ topics: DEMO_TOPICS });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent([
      {
        inlineData: { mimeType, data: base64 },
      },
      `Identify 4–6 specific topics or keywords visible in this image that could serve as language learning conversation topics (e.g. places, activities, objects, situations). Be concise — 1–4 words each.
Return JSON: { "topics": ["...", "..."] }`,
    ]);

    const data = JSON.parse(result.response.text());
    return NextResponse.json({ topics: data.topics ?? [] });
  } catch (err: unknown) {
    console.error("Image analysis error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
