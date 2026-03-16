// src/app/api/ai/review/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, edges, sessions, reviewResults } from "@/lib/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { reviewGeneratePrompt } from "@/lib/prompts/review-generate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { review_type, topic_id } = body as {
      review_type: "teach-it" | "what-if" | "connect";
      topic_id: string;
    };

    if (!review_type || !topic_id) {
      return NextResponse.json(
        { error: "review_type and topic_id are required" },
        { status: 400 }
      );
    }

    if (!["teach-it", "what-if", "connect"].includes(review_type)) {
      return NextResponse.json(
        { error: "review_type must be teach-it, what-if, or connect" },
        { status: 400 }
      );
    }

    const topic = db.select().from(topics).where(eq(topics.id, topic_id)).get();
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Check cache: skip regeneration if a review of this type+topic exists within 7 days
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const recentSessions = db.select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.topicId, topic_id))
      .all();
    const sessionIds = recentSessions.map((s) => s.id);
    if (sessionIds.length > 0) {
      const cachedReviews = db.select()
        .from(reviewResults)
        .where(and(
          eq(reviewResults.reviewType, review_type),
          gte(reviewResults.timestamp, sevenDaysAgo),
          inArray(reviewResults.sessionId, sessionIds)
        ))
        .all();
      if (cachedReviews.length > 0) {
        return NextResponse.json({
          challenge: cachedReviews[0].feedback,
          review_type,
          topic_id: topic.id,
          topic_title: topic.title,
          cached: true,
        });
      }
    }

    // Get related topics for context
    const outEdges = db.select().from(edges).where(eq(edges.sourceId, topic_id)).all();
    const inEdges = db.select().from(edges).where(eq(edges.targetId, topic_id)).all();
    const relatedIds = [...outEdges.map((e) => e.targetId), ...inEdges.map((e) => e.sourceId)];
    const relatedTopics = relatedIds.length > 0
      ? db.select().from(topics).where(inArray(topics.id, relatedIds)).all()
      : [];
    const relatedTopicNames = relatedTopics.map((t) => t.title);

    const prompt = reviewGeneratePrompt({
      reviewType: review_type,
      topic: topic.title,
      relatedTopics: relatedTopicNames,
    });

    const settings = readSettings();
    const response = await chat(settings.selectedModel, {
      messages: [{ role: "user", content: prompt }],
      maxTokens: 500,
      temperature: 0.8,
    });

    return NextResponse.json({
      challenge: response.content.trim(),
      review_type,
      topic_id: topic.id,
      topic_title: topic.title,
    });
  } catch (error) {
    console.error("Review generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate review challenge" },
      { status: 500 }
    );
  }
}
