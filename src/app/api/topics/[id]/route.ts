// src/app/api/topics/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = db.select().from(topics).where(eq(topics.id, id)).get();
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  return NextResponse.json(topic);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(topics).where(eq(topics.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.subject !== undefined) updates.subject = body.subject;
  if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
  if (body.status !== undefined) updates.status = body.status;
  if (body.masteryLevel !== undefined) updates.masteryLevel = body.masteryLevel;
  if (body.description !== undefined) updates.description = body.description;
  db.update(topics).set(updates).where(eq(topics.id, id)).run();
  const updated = db.select().from(topics).where(eq(topics.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(topics).where(eq(topics.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  db.delete(topics).where(eq(topics.id, id)).run();
  return NextResponse.json({ deleted: true });
}
