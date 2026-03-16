// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, messages, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { dialogueSystemPrompt } from "@/lib/prompts/dialogue-system";
import { getConnectedMasteredTopics } from "@/lib/graph/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, message } = body as { session_id: string; message: string };
    if (!session_id || !message) return NextResponse.json({ error: "session_id and message are required" }, { status: 400 });
    const session = db.select().from(sessions).where(eq(sessions.id, session_id)).get();
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    const topic = db.select().from(topics).where(eq(topics.id, session.topicId)).get();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    const sessionMessages = db.select().from(messages).where(eq(messages.sessionId, session_id)).all();
    const masteredTopicNames = getConnectedMasteredTopics(db, topic.id).map((c) => c.topic.title);
    const systemPrompt = dialogueSystemPrompt({ topic: topic.title, subject: topic.subject, masteredTopics: masteredTopicNames, sessionHistory: sessionMessages.map((m) => ({ role: m.role, content: m.content })) });
    const aiMessages = [...sessionMessages.map((m) => ({ role: (m.role === "tutor" ? "assistant" : "user") as "user" | "assistant", content: m.content })), { role: "user" as const, content: message }];
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: aiMessages, systemPrompt, maxTokens: 1000, temperature: 0.7 });
    const { v4: uuidv4 } = await import("uuid");
    db.insert(messages).values({ id: uuidv4(), sessionId: session_id, role: "user", content: message }).run();
    db.insert(messages).values({ id: uuidv4(), sessionId: session_id, role: "tutor", content: response.content }).run();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(response.content)); controller.close(); } });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json({ error: "Failed to get tutor response" }, { status: 500 });
  }
}
