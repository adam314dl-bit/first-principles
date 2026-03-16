// src/app/api/sessions/[id]/attempts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, attempts, topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const MIN_ATTEMPT_LENGTH = 20;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  try {
    const body = await req.json();
    const { content, hint_level_used } = body as { content: string; hint_level_used?: number };
    if (!content || typeof content !== "string") return NextResponse.json({ error: "content is required and must be a string" }, { status: 400 });
    if (content.trim().length < MIN_ATTEMPT_LENGTH) {
      return NextResponse.json({ error: `Attempt must be at least ${MIN_ATTEMPT_LENGTH} characters. Give it a genuine try!` }, { status: 400 });
    }
    const attemptId = uuidv4();
    db.insert(attempts).values({ id: attemptId, sessionId: id, content: content.trim(), hintLevelUsed: hint_level_used ?? 0 }).run();
    // Mark topic mastery as at least 1 on first attempt
    const topic = db.select().from(topics).where(eq(topics.id, session.topicId)).get();
    if (topic && topic.masteryLevel < 1) {
      db.update(topics).set({ masteryLevel: 1 }).where(eq(topics.id, session.topicId)).run();
    }
    const created = db.select().from(attempts).where(eq(attempts.id, attemptId)).get();
    return NextResponse.json({ ...created, genuine: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
