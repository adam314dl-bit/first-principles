// src/app/api/sessions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, messages, attempts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const sessionMessages = db.select().from(messages).where(eq(messages.sessionId, id)).all();
  const sessionAttempts = db.select().from(attempts).where(eq(attempts.sessionId, id)).all();
  return NextResponse.json({ ...session, messages: sessionMessages, attempts: sessionAttempts });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.scratchpadContent !== undefined) updates.scratchpadContent = body.scratchpadContent;
  if (body.journalSummary !== undefined) updates.journalSummary = body.journalSummary;
  if (body.mode !== undefined) updates.mode = body.mode;
  if (body.endSession === true) updates.endedAt = new Date().toISOString();
  if (Object.keys(updates).length > 0) db.update(sessions).set(updates).where(eq(sessions.id, id)).run();
  const updated = db.select().from(sessions).where(eq(sessions.id, id)).get();
  return NextResponse.json(updated);
}
