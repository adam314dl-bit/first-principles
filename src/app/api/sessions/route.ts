// src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, topics } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeTopic = searchParams.get("include_topic") === "true";

  const allSessions = db.select().from(sessions).orderBy(desc(sessions.startedAt)).all();

  if (includeTopic) {
    const enriched = allSessions.map((s) => {
      const topic = db.select().from(topics).where(eq(topics.id, s.topicId)).get();
      return {
        ...s,
        topicTitle: topic?.title ?? null,
        subject: topic?.subject ?? null,
        masteryChange: null, // computed from review history if needed
      };
    });
    return NextResponse.json({ sessions: enriched });
  }

  return NextResponse.json({ sessions: allSessions });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic_id, mode } = body as { topic_id: string; mode?: string };
    if (!topic_id) return NextResponse.json({ error: "topic_id is required" }, { status: 400 });
    const topic = db.select().from(topics).where(eq(topics.id, topic_id)).get();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    const sessionMode = mode === "dialogue" ? "dialogue" : "challenge";
    const id = uuidv4();
    db.insert(sessions).values({ id, topicId: topic_id, mode: sessionMode as "challenge" | "dialogue", scratchpadContent: "", journalSummary: null }).run();
    if (topic.status === "available") {
      db.update(topics).set({ status: "in-progress" }).where(eq(topics.id, topic_id)).run();
    }
    const created = db.select().from(sessions).where(eq(sessions.id, id)).get();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
