// src/lib/progress/mastery.ts
import { eq, inArray } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { topics, attempts, reviewResults, sessions } from "@/lib/db/schema";

export function calculateMastery(db: DB, topicId: string): number {
  const topic = db.select().from(topics).where(eq(topics.id, topicId)).get();
  if (!topic) return 0;

  const topicSessions = db.select().from(sessions).where(eq(sessions.topicId, topicId)).all();
  if (topicSessions.length === 0) return 0;

  const sessionIds = topicSessions.map((s) => s.id);
  const allAttempts = sessionIds.length > 0
    ? db.select().from(attempts).where(inArray(attempts.sessionId, sessionIds)).all()
    : [];
  if (allAttempts.length === 0) return 0;

  let level = 1;

  const hasCompleted = allAttempts.length >= 2 || allAttempts.some((a) => a.hintLevelUsed >= 3);
  if (hasCompleted) level = 2;

  const allReviews = sessionIds.length > 0
    ? db.select().from(reviewResults).where(inArray(reviewResults.sessionId, sessionIds)).all()
    : [];

  if (allReviews.some((r) => r.reviewType === "teach-it" && r.passed) && level >= 2) level = 3;
  if (allReviews.some((r) => r.reviewType === "connect" && r.passed) && level >= 3) level = 4;
  if (allReviews.some((r) => r.reviewType === "what-if" && r.passed) && level >= 4) level = 5;

  return level;
}

export function updateMastery(db: DB, topicId: string): number {
  const newLevel = calculateMastery(db, topicId);
  db.update(topics).set({
    masteryLevel: newLevel,
    status: newLevel === 0 ? "locked" : newLevel >= 2 ? "mastered" : "in-progress",
    updatedAt: new Date().toISOString(),
  }).where(eq(topics.id, topicId)).run();
  return newLevel;
}

export function advanceMasteryFromReview(
  db: DB, topicId: string, reviewType: "teach-it" | "what-if" | "connect", passed: boolean
): { previousLevel: number; newLevel: number } {
  const topic = db.select().from(topics).where(eq(topics.id, topicId)).get();
  const previousLevel = topic?.masteryLevel ?? 0;
  if (!passed) return { previousLevel, newLevel: previousLevel };
  const newLevel = updateMastery(db, topicId);
  return { previousLevel, newLevel };
}
