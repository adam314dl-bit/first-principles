// src/__tests__/seed-data.test.ts
import { describe, it, expect } from "vitest";
import seedData from "@/data/seed-topics.json";

describe("Seed Data", () => {
  it("contains at least 25 topics", () => {
    expect(seedData.topics.length).toBeGreaterThanOrEqual(25);
  });

  it("every topic has required fields with valid values", () => {
    for (const t of seedData.topics) {
      expect(t.id).toBeTruthy();
      expect(t.title).toBeTruthy();
      expect(t.subject).toBeTruthy();
      expect(t.difficulty).toBeGreaterThanOrEqual(1);
      expect(t.difficulty).toBeLessThanOrEqual(5);
      expect(["locked", "available", "in-progress", "mastered"]).toContain(t.status);
      expect(typeof t.masteryLevel).toBe("number");
      expect(t.description).toBeTruthy();
    }
  });

  it("has topics across math, physics, and cs subjects", () => {
    const subjects = new Set(seedData.topics.map((t) => t.subject));
    expect(subjects.has("math")).toBe(true);
    expect(subjects.has("physics")).toBe(true);
    expect(subjects.has("cs")).toBe(true);
  });

  it("contains at least 25 edges with valid references", () => {
    expect(seedData.edges.length).toBeGreaterThanOrEqual(25);
    const topicIds = new Set(seedData.topics.map((t) => t.id));
    for (const e of seedData.edges) {
      expect(topicIds.has(e.sourceId)).toBe(true);
      expect(topicIds.has(e.targetId)).toBe(true);
      expect(["prerequisite", "related", "deepens"]).toContain(e.type);
    }
  });

  it("has at least one available topic per subject", () => {
    const available = seedData.topics.filter((t) => t.status === "available").map((t) => t.subject);
    expect(available).toContain("math");
    expect(available).toContain("physics");
    expect(available).toContain("cs");
  });
});
