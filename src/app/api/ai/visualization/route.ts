// src/app/api/ai/visualization/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, visualizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic_id } = body as { topic_id: string };

    if (!topic_id) {
      return NextResponse.json({ error: "topic_id is required" }, { status: 400 });
    }

    const topic = db.select().from(topics).where(eq(topics.id, topic_id)).get();
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Check cache
    const cached = db.select().from(visualizations).where(eq(visualizations.topicId, topic_id)).get();
    if (cached) {
      return NextResponse.json({
        id: cached.id,
        topic_id: cached.topicId,
        visualization_code: cached.visualizationCode,
        source: cached.source,
        cached: true,
      });
    }

    const prompt = `Create a self-contained, interactive HTML visualization for the concept of "${topic.title}" in ${topic.subject}.

Requirements:
- Single HTML file starting with <!DOCTYPE html>
- Use HTML5 Canvas or SVG for visualization
- Include inline JavaScript and CSS (no external dependencies)
- Should be interactive (mouse hover, click, or animation)
- Clear labels and title showing "${topic.title}"
- Should illustrate a key principle or relationship
- Keep it concise but visually clear

Return ONLY the complete HTML code. No explanation, no markdown wrapping.`;

    const settings = readSettings();
    const response = await chat(settings.selectedModel, {
      messages: [{ role: "user", content: prompt }],
      maxTokens: 2000,
      temperature: 0.7,
    });

    const code = response.content.trim();

    // Validate it looks like HTML
    if (!code.startsWith("<!DOCTYPE html") && !code.startsWith("<html")) {
      return NextResponse.json({ error: "Generated content is not valid HTML" }, { status: 500 });
    }

    const id = uuidv4();
    db.insert(visualizations).values({
      id,
      topicId: topic_id,
      visualizationCode: code,
      source: "ai-generated",
    }).run();

    return NextResponse.json({
      id,
      topic_id,
      visualization_code: code,
      source: "ai-generated",
      cached: false,
    });
  } catch (error) {
    console.error("Visualization generation failed:", error);
    return NextResponse.json({ error: "Failed to generate visualization" }, { status: 500 });
  }
}
