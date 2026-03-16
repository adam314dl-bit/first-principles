// src/__tests__/mastery.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/lib/db/schema";
import { calculateMastery, updateMastery, advanceMasteryFromReview } from "@/lib/progress/mastery";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const testDb = drizzle(sqlite, { schema });
  sqlite.exec(`
    CREATE TABLE topics (id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL, difficulty INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'locked', mastery_level INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')), cosmos_x REAL, cosmos_y REAL, cosmos_radius REAL DEFAULT 10, domain TEXT DEFAULT 'core', node_type TEXT DEFAULT 'star');
    CREATE TABLE sessions (id TEXT PRIMARY KEY, topic_id TEXT NOT NULL REFERENCES topics(id), mode TEXT NOT NULL DEFAULT 'challenge', scratchpad_content TEXT NOT NULL DEFAULT '', journal_summary TEXT, started_at TEXT NOT NULL DEFAULT (datetime('now')), ended_at TEXT);
    CREATE TABLE attempts (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), content TEXT NOT NULL, hint_level_used INTEGER NOT NULL DEFAULT 0, timestamp TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE review_results (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), review_type TEXT NOT NULL, passed INTEGER NOT NULL DEFAULT 0, feedback TEXT NOT NULL DEFAULT '', timestamp TEXT NOT NULL DEFAULT (datetime('now')));
  `);
  return testDb;
}

function seedTopic(testDb: ReturnType<typeof createTestDb>, id: string) {
  testDb.insert(schema.topics).values({ id, title: "Test Topic", subject: "math", difficulty: 3, status: "available", masteryLevel: 0, description: "A test topic" }).run();
}

function seedSession(testDb: ReturnType<typeof createTestDb>, topicId: string): string {
  const sid = uuidv4();
  testDb.insert(schema.sessions).values({ id: sid, topicId, mode: "challenge" }).run();
  return sid;
}

describe("calculateMastery", () => {
  let testDb: ReturnType<typeof createTestDb>;
  beforeEach(() => { testDb = createTestDb(); });

  it("returns 0 for a topic with no sessions", () => {
    seedTopic(testDb, "t1");
    expect(calculateMastery(testDb, "t1")).toBe(0);
  });

  it("returns 1 after a single attempt", () => {
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "my attempt" }).run();
    expect(calculateMastery(testDb, "t1")).toBe(1);
  });

  it("returns 2 after multiple attempts", () => {
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a1" }).run();
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a2" }).run();
    expect(calculateMastery(testDb, "t1")).toBe(2);
  });

  it("returns 3 after passing teach-it review", () => {
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a1" }).run();
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a2" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "teach-it", passed: true, feedback: "Great!" }).run();
    expect(calculateMastery(testDb, "t1")).toBe(3);
  });

  it("returns 4 after passing connect review (with teach-it passed)", () => {
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a1" }).run();
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a2" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "teach-it", passed: true, feedback: "Good" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "connect", passed: true, feedback: "Nice" }).run();
    expect(calculateMastery(testDb, "t1")).toBe(4);
  });

  it("returns 5 after passing what-if review (with all prior levels)", () => {
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a1" }).run();
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a2" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "teach-it", passed: true, feedback: "Good" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "connect", passed: true, feedback: "Good" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "what-if", passed: true, feedback: "Deep!" }).run();
    expect(calculateMastery(testDb, "t1")).toBe(5);
  });

  it("does not skip levels — what-if alone does not reach level 5", () => {
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a1" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "what-if", passed: true, feedback: "Good" }).run();
    expect(calculateMastery(testDb, "t1")).toBe(1);
  });
});

describe("updateMastery", () => {
  it("updates the topic record in the database", () => {
    const testDb = createTestDb();
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "attempt" }).run();
    expect(updateMastery(testDb, "t1")).toBe(1);
    const topic = testDb.select().from(schema.topics).where(eq(schema.topics.id, "t1")).get();
    expect(topic?.masteryLevel).toBe(1);
    expect(topic?.status).toBe("in-progress");
  });

  it("sets status to mastered when level reaches 2", () => {
    const testDb = createTestDb();
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a1" }).run();
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a2" }).run();
    expect(updateMastery(testDb, "t1")).toBe(2);
    const topic = testDb.select().from(schema.topics).where(eq(schema.topics.id, "t1")).get();
    expect(topic?.status).toBe("mastered");
  });
});

describe("advanceMasteryFromReview", () => {
  it("returns previous and new level on pass", () => {
    const testDb = createTestDb();
    seedTopic(testDb, "t1");
    const sid = seedSession(testDb, "t1");
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a1" }).run();
    testDb.insert(schema.attempts).values({ id: uuidv4(), sessionId: sid, content: "a2" }).run();
    testDb.insert(schema.reviewResults).values({ id: uuidv4(), sessionId: sid, reviewType: "teach-it", passed: true, feedback: "Good" }).run();
    const result = advanceMasteryFromReview(testDb, "t1", "teach-it", true);
    expect(result.previousLevel).toBe(0);
    expect(result.newLevel).toBe(3);
  });

  it("does not change level on fail", () => {
    const testDb = createTestDb();
    seedTopic(testDb, "t1");
    testDb.update(schema.topics).set({ masteryLevel: 2 }).where(eq(schema.topics.id, "t1")).run();
    const result = advanceMasteryFromReview(testDb, "t1", "teach-it", false);
    expect(result.previousLevel).toBe(2);
    expect(result.newLevel).toBe(2);
  });
});
