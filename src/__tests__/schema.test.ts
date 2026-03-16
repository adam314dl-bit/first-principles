// src/__tests__/schema.test.ts
import { describe, it, expect } from "vitest";
import * as schema from "@/lib/db/schema";

describe("Database Schema", () => {
  const cases: [string, object, string[]][] = [
    ["topics", schema.topics, ["id", "title", "subject", "difficulty", "status", "masteryLevel", "description", "createdAt", "updatedAt"]],
    ["edges", schema.edges, ["id", "sourceId", "targetId", "type", "weight"]],
    ["sessions", schema.sessions, ["id", "topicId", "mode", "scratchpadContent", "journalSummary", "startedAt", "endedAt"]],
    ["messages", schema.messages, ["id", "sessionId", "role", "content", "timestamp"]],
    ["attempts", schema.attempts, ["id", "sessionId", "content", "hintLevelUsed", "timestamp"]],
    ["reviewResults", schema.reviewResults, ["id", "sessionId", "reviewType", "passed", "feedback", "timestamp"]],
    ["visualizations", schema.visualizations, ["id", "topicId", "visualizationCode", "source", "createdAt"]],
  ];

  it.each(cases)("%s table has all required columns", (_name, table, cols) => {
    const keys = Object.keys(table);
    for (const col of cols) { expect(keys).toContain(col); }
  });
});
