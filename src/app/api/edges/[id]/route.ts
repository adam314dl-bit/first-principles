// src/app/api/edges/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { edges } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(edges).where(eq(edges.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Edge not found" }, { status: 404 });
  db.delete(edges).where(eq(edges.id, id)).run();
  return NextResponse.json({ deleted: true });
}
