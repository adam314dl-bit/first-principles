// src/app/api/ai/explain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeExplainPrompt } from "@/lib/prompts/challenge-explain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge, topic, user_attempt, topic_id } = body as {
      challenge: string;
      topic: string;
      user_attempt: string;
      topic_id?: string;
    };

    if (!challenge || !topic || !user_attempt) {
      return NextResponse.json({ error: "challenge, topic, and user_attempt are required" }, { status: 400 });
    }
    if (user_attempt.trim().length < 20) {
      return NextResponse.json({ error: "A genuine attempt is required before unlocking the explanation. Write at least 20 characters of reasoning." }, { status: 400 });
    }

    // Check for pre-written explanation
    if (topic_id) {
      const lesson = db.select().from(lessons).where(eq(lessons.topicId, topic_id)).get();
      if (lesson) {
        const fullText = `${lesson.explanation}\n\n**Going deeper:** ${lesson.goingDeeper}`;
        return NextResponse.json({ explanation: fullText, source: "lesson" });
      }
    }

    // Fall back to AI
    const prompt = challengeExplainPrompt({ challenge, topic, userAttempt: user_attempt });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 2000, temperature: 0.6 });
    return NextResponse.json({ explanation: response.content.trim(), source: "ai" });
  } catch (error) {
    console.error("Explanation generation failed:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
