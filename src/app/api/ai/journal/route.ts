// src/app/api/ai/journal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, messages, attempts, reviewResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id } = body as { session_id: string };

    if (!session_id) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const session = db.select().from(sessions).where(eq(sessions.id, session_id)).get();
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Gather session data
    const sessionMessages = db.select().from(messages).where(eq(messages.sessionId, session_id)).all();
    const sessionAttempts = db.select().from(attempts).where(eq(attempts.sessionId, session_id)).all();
    const sessionReviews = db.select().from(reviewResults).where(eq(reviewResults.sessionId, session_id)).all();

    const context = [
      sessionMessages.length > 0 ? `Messages: ${sessionMessages.map((m) => `[${m.role}]: ${m.content}`).join("\n")}` : "",
      sessionAttempts.length > 0 ? `Attempts: ${sessionAttempts.map((a) => a.content).join("\n")}` : "",
      sessionReviews.length > 0 ? `Reviews: ${sessionReviews.map((r) => `${r.reviewType}: ${r.passed ? "passed" : "failed"} — ${r.feedback}`).join("\n")}` : "",
    ].filter(Boolean).join("\n\n");

    const prompt = `You are writing a brief learning journal entry for a student. Write a 2-4 sentence reflective summary in second person ("You..."). Focus on what they engaged with, what they understood, and any areas for growth. Be warm and encouraging.

Session context:
${context || "No detailed content available."}

Write ONLY the summary. No labels, no preamble.`;

    const settings = readSettings();
    const response = await chat(settings.selectedModel, {
      messages: [{ role: "user", content: prompt }],
      maxTokens: 200,
      temperature: 0.7,
    });

    const summary = response.content.trim();

    // Save to session record
    db.update(sessions).set({ journalSummary: summary }).where(eq(sessions.id, session_id)).run();

    return NextResponse.json({ summary, session_id });
  } catch (error) {
    console.error("Journal generation failed:", error);
    return NextResponse.json({ error: "Failed to generate journal entry" }, { status: 500 });
  }
}
