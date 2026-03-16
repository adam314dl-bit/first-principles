// src/app/api/ai/review/evaluate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, reviewResults, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { reviewEvaluatePrompt } from "@/lib/prompts/review-evaluate";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { review_type, challenge, user_response, topic_id, session_id } = body as {
      review_type: "teach-it" | "what-if" | "connect";
      challenge: string; user_response: string; topic_id: string; session_id: string;
    };

    if (!review_type || !challenge || !user_response || !topic_id || !session_id) {
      return NextResponse.json(
        { error: "review_type, challenge, user_response, topic_id, and session_id are required" },
        { status: 400 }
      );
    }

    const topic = db.select().from(topics).where(eq(topics.id, topic_id)).get();
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const session = db.select().from(sessions).where(eq(sessions.id, session_id)).get();
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const prompt = reviewEvaluatePrompt({
      reviewType: review_type,
      challenge,
      userResponse: user_response,
      topic: topic.title,
    });

    const settings = readSettings();
    const response = await chat(settings.selectedModel, {
      messages: [{ role: "user", content: prompt }],
      maxTokens: 500,
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.content);

    const reviewId = uuidv4();
    db.insert(reviewResults).values({
      id: reviewId, sessionId: session_id, reviewType: review_type,
      passed: parsed.passed, feedback: parsed.feedback,
    }).run();

    const result: Record<string, unknown> = {
      id: reviewId, passed: parsed.passed, feedback: parsed.feedback,
    };
    if (review_type === "teach-it" && parsed.follow_up_question) {
      result.follow_up_question = parsed.follow_up_question;
    }
    if (review_type === "what-if") { result.depth_score = parsed.depth_score; }
    if (review_type === "connect") { result.connection_quality = parsed.connection_quality; }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Review evaluation failed:", error);
    return NextResponse.json({ error: "Failed to evaluate review response" }, { status: 500 });
  }
}
