import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const isDemo = () => process.env.NEXT_PUBLIC_DEMO_MODE === "true";

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
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
            {
              type: "text",
              text: `Identify 4–6 specific topics or keywords visible in this image that could serve as language learning conversation topics (e.g. places, activities, objects, situations). Be concise — 1–4 words each.
Return JSON: { "topics": ["...", "..."] }`,
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const data = JSON.parse(completion.choices[0].message.content ?? "{}");
    return NextResponse.json({ topics: data.topics ?? [] });
  } catch (err) {
    console.error("Image analysis error:", err);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
