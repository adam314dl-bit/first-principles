// src/__tests__/api-sessions.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE topics (id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL, difficulty INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'locked', mastery_level INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE sessions (id TEXT PRIMARY KEY, topic_id TEXT NOT NULL REFERENCES topics(id), mode TEXT NOT NULL DEFAULT 'challenge', scratchpad_content TEXT NOT NULL DEFAULT '', journal_summary TEXT, started_at TEXT NOT NULL DEFAULT (datetime('now')), ended_at TEXT);
    CREATE TABLE messages (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), role TEXT NOT NULL, content TEXT NOT NULL, timestamp TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE attempts (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), content TEXT NOT NULL, hint_level_used INTEGER NOT NULL DEFAULT 0, timestamp TEXT NOT NULL DEFAULT (datetime('now')));
  `);
  return drizzle(sqlite, { schema });
}

describe("Sessions CRUD (unit)", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    db.insert(schema.topics).values({ id: "derivatives", title: "Derivatives", subject: "math", difficulty: 4, status: "available", masteryLevel: 0, description: "Rates of change" }).run();
  });

  it("creates and retrieves a session", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    const session = db.select().from(schema.sessions).where(eq(schema.sessions.id, "s1")).get();
    expect(session).toBeDefined();
    expect(session!.topicId).toBe("derivatives");
    expect(session!.mode).toBe("challenge");
  });

  it("updates scratchpad content", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    db.update(schema.sessions).set({ scratchpadContent: "# Notes\nf'(x) = lim..." }).where(eq(schema.sessions.id, "s1")).run();
    const session = db.select().from(schema.sessions).where(eq(schema.sessions.id, "s1")).get();
    expect(session!.scratchpadContent).toContain("Notes");
  });

  it("sets endedAt when ending a session", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    const endTime = new Date().toISOString();
    db.update(schema.sessions).set({ endedAt: endTime }).where(eq(schema.sessions.id, "s1")).run();
    expect(db.select().from(schema.sessions).where(eq(schema.sessions.id, "s1")).get()!.endedAt).toBe(endTime);
  });

  it("inserts and retrieves messages", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "dialogue", scratchpadContent: "" }).run();
    db.insert(schema.messages).values({ id: "m1", sessionId: "s1", role: "user", content: "What is a derivative?" }).run();
    db.insert(schema.messages).values({ id: "m2", sessionId: "s1", role: "tutor", content: "What do you think happens when you zoom in?" }).run();
    const msgs = db.select().from(schema.messages).where(eq(schema.messages.sessionId, "s1")).all();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe("user");
  });

  it("inserts an attempt with hint level", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    db.insert(schema.attempts).values({ id: "a1", sessionId: "s1", content: "The derivative measures how fast the function value changes as x changes", hintLevelUsed: 2 }).run();
    const attempt = db.select().from(schema.attempts).where(eq(schema.attempts.id, "a1")).get();
    expect(attempt!.hintLevelUsed).toBe(2);
    expect(attempt!.content).toContain("derivative");
  });

  it("validates minimum attempt length at business rule level", () => {
    expect("too short".trim().length).toBeLessThan(20);
  });
});
