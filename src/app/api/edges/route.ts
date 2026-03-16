// src/app/api/edges/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { edges, topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  return NextResponse.json(db.select().from(edges).all());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sourceId, targetId, type, weight } = body;
  if (!sourceId || !targetId) return NextResponse.json({ error: "sourceId and targetId are required" }, { status: 400 });
  const source = db.select().from(topics).where(eq(topics.id, sourceId)).get();
  const target = db.select().from(topics).where(eq(topics.id, targetId)).get();
  if (!source || !target) return NextResponse.json({ error: "source or target topic not found" }, { status: 404 });
  const id = body.id || uuidv4();
  const newEdge = { id, sourceId, targetId, type: type ?? "prerequisite" as const, weight: weight ?? 1.0 };
  db.insert(edges).values(newEdge).run();
  return NextResponse.json(newEdge, { status: 201 });
}
