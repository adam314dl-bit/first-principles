// src/__tests__/graph-engine.test.ts
import { describe, it, expect } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAvailableTopics, unlockAfterMastery, findBridgeTopics, getConnectedMasteredTopics } from "@/lib/graph/engine";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE topics (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'locked',
      mastery_level INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      cosmos_x REAL, cosmos_y REAL, cosmos_radius REAL DEFAULT 10,
      domain TEXT DEFAULT 'core', node_type TEXT DEFAULT 'star'
    );
    CREATE TABLE edges (
      id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES topics(id),
      target_id TEXT NOT NULL REFERENCES topics(id),
      type TEXT NOT NULL DEFAULT 'prerequisite', weight REAL NOT NULL DEFAULT 1.0
    );
  `);
  return drizzle(sqlite, { schema });
}

function seedGraph(db: ReturnType<typeof createTestDb>) {
  db.insert(schema.topics).values({ id: "arithmetic", title: "Arithmetic", subject: "math", status: "mastered", masteryLevel: 5, description: "Numbers" }).run();
  db.insert(schema.topics).values({ id: "algebra", title: "Algebra", subject: "math", status: "locked", masteryLevel: 0, description: "Variables" }).run();
  db.insert(schema.topics).values({ id: "calculus", title: "Calculus", subject: "math", status: "locked", masteryLevel: 0, description: "Limits" }).run();
  db.insert(schema.topics).values({ id: "kinematics", title: "Kinematics", subject: "physics", status: "mastered", masteryLevel: 5, description: "Motion" }).run();
  db.insert(schema.topics).values({ id: "newtons-laws", title: "Newton's Laws", subject: "physics", status: "locked", masteryLevel: 0, description: "Forces" }).run();
  db.insert(schema.topics).values({ id: "vectors", title: "Vectors", subject: "math", status: "locked", masteryLevel: 0, description: "Direction" }).run();
  db.insert(schema.edges).values({ id: "e1", sourceId: "arithmetic", targetId: "algebra", type: "prerequisite", weight: 1.0 }).run();
  db.insert(schema.edges).values({ id: "e2", sourceId: "algebra", targetId: "calculus", type: "prerequisite", weight: 1.0 }).run();
  db.insert(schema.edges).values({ id: "e3", sourceId: "kinematics", targetId: "newtons-laws", type: "prerequisite", weight: 1.0 }).run();
  db.insert(schema.edges).values({ id: "e4", sourceId: "algebra", targetId: "vectors", type: "prerequisite", weight: 0.8 }).run();
  db.insert(schema.edges).values({ id: "e5", sourceId: "vectors", targetId: "newtons-laws", type: "related", weight: 0.7 }).run();
  db.insert(schema.edges).values({ id: "e6", sourceId: "arithmetic", targetId: "kinematics", type: "related", weight: 0.5 }).run();
}

describe("getAvailableTopics", () => {
  it("returns locked topics whose prerequisites are all mastered", () => {
    const db = createTestDb(); seedGraph(db);
    const ids = getAvailableTopics(db).map((t) => t.id);
    expect(ids).toContain("algebra");
    expect(ids).toContain("newtons-laws");
    expect(ids).not.toContain("calculus");
    expect(ids).not.toContain("arithmetic");
  });
});

describe("unlockAfterMastery", () => {
  it("unlocks downstream topics when all prerequisites are mastered", () => {
    const db = createTestDb(); seedGraph(db);
    db.update(schema.topics).set({ status: "mastered", masteryLevel: 5 })
      .where(eq(schema.topics.id, "algebra")).run();
    const unlocked = unlockAfterMastery(db, "algebra");
    expect(unlocked).toContain("calculus");
    expect(unlocked).toContain("vectors");
  });

  it("does not unlock topics with unmet prerequisites", () => {
    const db = createTestDb(); seedGraph(db);
    const unlocked = unlockAfterMastery(db, "arithmetic");
    expect(unlocked).toContain("algebra");
    expect(unlocked).not.toContain("calculus");
  });
});

describe("findBridgeTopics", () => {
  it("finds topics reachable from mastered nodes in different subjects", () => {
    const db = createTestDb(); seedGraph(db);
    expect(findBridgeTopics(db).map((t) => t.id)).toContain("algebra");
  });

  it("returns empty when only one subject has mastered topics", () => {
    const db = createTestDb();
    db.insert(schema.topics).values({ id: "t1", title: "A", subject: "math", status: "mastered", masteryLevel: 5, description: "A" }).run();
    db.insert(schema.topics).values({ id: "t2", title: "B", subject: "math", status: "locked", masteryLevel: 0, description: "B" }).run();
    db.insert(schema.edges).values({ id: "e1", sourceId: "t1", targetId: "t2", type: "prerequisite", weight: 1.0 }).run();
    expect(findBridgeTopics(db).length).toBe(0);
  });
});

describe("getConnectedMasteredTopics", () => {
  it("returns mastered topics with weights, excludes non-mastered", () => {
    const db = createTestDb(); seedGraph(db);
    const connected = getConnectedMasteredTopics(db, "algebra");
    const ids = connected.map((c) => c.topic.id);
    expect(ids).toContain("arithmetic");
    expect(connected.find((c) => c.topic.id === "arithmetic")!.weight).toBe(1.0);
    expect(ids).not.toContain("calculus");
    expect(ids).not.toContain("vectors");
  });
});
