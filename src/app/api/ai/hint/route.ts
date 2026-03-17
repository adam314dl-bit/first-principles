// src/app/api/ai/hint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeHintsPrompt } from "@/lib/prompts/challenge-hints";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge, hint_level, user_attempt, topic_id } = body as {
      challenge: string;
      hint_level: number;
      user_attempt?: string;
      topic_id?: string;
    };

    if (!challenge) return NextResponse.json({ error: "challenge is required" }, { status: 400 });
    if (!hint_level || hint_level < 1 || hint_level > 3) {
      return NextResponse.json({ error: "hint_level must be 1, 2, or 3" }, { status: 400 });
    }

    // Check for pre-written hint
    if (topic_id) {
      const lesson = db.select().from(lessons).where(eq(lessons.topicId, topic_id)).get();
      if (lesson) {
        const hintText = hint_level === 1 ? lesson.hint1 : hint_level === 2 ? lesson.hint2 : lesson.hint3;
        return NextResponse.json({ hint: hintText, hint_level, source: "lesson" });
      }
    }

    // Fall back to AI
    const prompt = challengeHintsPrompt({ challenge, hintLevel: hint_level, userAttempt: user_attempt });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 400, temperature: 0.7 });
    return NextResponse.json({ hint: response.content.trim(), hint_level, source: "ai" });
  } catch (error) {
    console.error("Hint generation failed:", error);
    return NextResponse.json({ error: "Failed to generate hint" }, { status: 500 });
  }
}
