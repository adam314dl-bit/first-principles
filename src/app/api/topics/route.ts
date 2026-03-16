// src/app/api/topics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let result;
  if (status) {
    result = db.select().from(topics).where(eq(topics.status, status as "locked" | "available" | "in-progress" | "mastered")).all();
  } else {
    result = db.select().from(topics).all();
  }
  return NextResponse.json({ topics: result });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subject, difficulty, description, status } = body;

  if (!title || !subject) {
    return NextResponse.json({ error: "title and subject are required" }, { status: 400 });
  }

  const id = body.id || uuidv4();
  const newTopic = {
    id,
    title,
    subject,
    difficulty: difficulty ?? 1,
    status: status ?? "locked" as const,
    masteryLevel: 0,
    description: description ?? "",
  };

  db.insert(topics).values(newTopic).run();
  return NextResponse.json(newTopic, { status: 201 });
}
