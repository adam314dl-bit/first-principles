// src/app/api/sessions/[id]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  try {
    const body = await req.json();
    const { role, content } = body as { role: string; content: string };
    if (!role || !content) return NextResponse.json({ error: "role and content are required" }, { status: 400 });
    if (role !== "user" && role !== "tutor") return NextResponse.json({ error: "role must be 'user' or 'tutor'" }, { status: 400 });
    const msgId = uuidv4();
    db.insert(messages).values({ id: msgId, sessionId: id, role: role as "user" | "tutor", content }).run();
    const created = db.select().from(messages).where(eq(messages.id, msgId)).get();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
