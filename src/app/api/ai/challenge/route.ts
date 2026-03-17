// src/app/api/ai/challenge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeGeneratePrompt } from "@/lib/prompts/challenge-generate";
import { getConnectedMasteredTopics } from "@/lib/graph/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic_id } = body as { topic_id: string };
    if (!topic_id) return NextResponse.json({ error: "topic_id is required" }, { status: 400 });

    const topic = db.select().from(topics).where(eq(topics.id, topic_id)).get();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    // Check for pre-written lesson first
    const lesson = db.select().from(lessons).where(eq(lessons.topicId, topic_id)).get();
    if (lesson) {
      return NextResponse.json({
        challenge: lesson.problem,
        hook: lesson.hook,
        topic_id: topic.id,
        topic_title: topic.title,
        source: "lesson",
      });
    }

    // Fall back to AI generation
    const masteredTopicNames = getConnectedMasteredTopics(db, topic_id).map((c) => c.topic.title);
    const prompt = challengeGeneratePrompt({ topic: topic.title, subject: topic.subject, difficulty: topic.difficulty, masteredTopics: masteredTopicNames });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 800, temperature: 0.8 });
    return NextResponse.json({
      challenge: response.content.trim(),
      hook: null,
      topic_id: topic.id,
      topic_title: topic.title,
      source: "ai",
      model: response.model,
    });
  } catch (error) {
    console.error("Challenge generation failed:", error);
    return NextResponse.json({ error: "Failed to generate challenge. The tutor is having a moment — try again." }, { status: 500 });
  }
}
