// src/__tests__/api-topics-edges.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE topics (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'locked',
      mastery_level INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE edges (
      id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES topics(id),
      target_id TEXT NOT NULL REFERENCES topics(id),
      type TEXT NOT NULL DEFAULT 'prerequisite', weight REAL NOT NULL DEFAULT 1.0
    );
  `);
  return drizzle(sqlite, { schema });
}

describe("Topics CRUD (unit)", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => { db = createTestDb(); });

  it("inserts and retrieves a topic", () => {
    db.insert(schema.topics).values({ id: "t1", title: "Algebra", subject: "math", difficulty: 2, status: "available", masteryLevel: 0, description: "Basic algebra" }).run();
    const result = db.select().from(schema.topics).where(eq(schema.topics.id, "t1")).get();
    expect(result).toBeDefined();
    expect(result!.title).toBe("Algebra");
    expect(result!.status).toBe("available");
  });

  it("updates a topic", () => {
    db.insert(schema.topics).values({ id: "t1", title: "Algebra", subject: "math", description: "Algebra" }).run();
    db.update(schema.topics).set({ status: "mastered", masteryLevel: 5 }).where(eq(schema.topics.id, "t1")).run();
    const result = db.select().from(schema.topics).where(eq(schema.topics.id, "t1")).get();
    expect(result!.status).toBe("mastered");
    expect(result!.masteryLevel).toBe(5);
  });

  it("deletes a topic", () => {
    db.insert(schema.topics).values({ id: "t1", title: "Algebra", subject: "math", description: "Algebra" }).run();
    db.delete(schema.topics).where(eq(schema.topics.id, "t1")).run();
    expect(db.select().from(schema.topics).where(eq(schema.topics.id, "t1")).get()).toBeUndefined();
  });
});

describe("Edges CRUD (unit)", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    db.insert(schema.topics).values({ id: "t1", title: "A", subject: "math", description: "A" }).run();
    db.insert(schema.topics).values({ id: "t2", title: "B", subject: "math", description: "B" }).run();
    db.insert(schema.topics).values({ id: "t3", title: "C", subject: "math", description: "C" }).run();
  });

  it("inserts, retrieves, and deletes edges", () => {
    db.insert(schema.edges).values({ id: "e1", sourceId: "t1", targetId: "t2", type: "prerequisite", weight: 1.0 }).run();
    db.insert(schema.edges).values({ id: "e2", sourceId: "t2", targetId: "t3", type: "related", weight: 0.7 }).run();
    expect(db.select().from(schema.edges).all().length).toBe(2);
    const result = db.select().from(schema.edges).where(eq(schema.edges.id, "e1")).get();
    expect(result!.sourceId).toBe("t1");
    db.delete(schema.edges).where(eq(schema.edges.id, "e1")).run();
    expect(db.select().from(schema.edges).where(eq(schema.edges.id, "e1")).get()).toBeUndefined();
  });
});
