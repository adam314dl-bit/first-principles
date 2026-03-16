// src/lib/review/trigger.ts
import { eq } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { topics, edges } from "@/lib/db/schema";

export function shouldShowWarmup(): boolean { return Math.random() < 0.3; }

export function getMasteredTopics(db: DB) {
  return db.select().from(topics).where(eq(topics.status, "mastered")).all();
}

export function getWarmupChallenge(db: DB): { topicId: string; topicTitle: string; reviewType: "teach-it" | "what-if" | "connect" } | null {
  const mastered = getMasteredTopics(db);
  if (mastered.length === 0) return null;
  const topic = mastered[Math.floor(Math.random() * mastered.length)];
  const reviewType = topic.masteryLevel < 3 ? "teach-it" : topic.masteryLevel < 4 ? "connect" : "what-if";
  return { topicId: topic.id, topicTitle: topic.title, reviewType };
}

export function getConnectionReview(db: DB, topicId: string): { topicId: string; topicTitle: string; connectedTopicId: string; connectedTopicTitle: string } | null {
  const outEdges = db.select().from(edges).where(eq(edges.sourceId, topicId)).all();
  const inEdges = db.select().from(edges).where(eq(edges.targetId, topicId)).all();
  const neighborIds = [...outEdges.map((e) => e.targetId), ...inEdges.map((e) => e.sourceId)];
  for (const nid of neighborIds) {
    const neighbor = db.select().from(topics).where(eq(topics.id, nid)).get();
    if (neighbor && neighbor.status === "mastered") {
      const current = db.select().from(topics).where(eq(topics.id, topicId)).get();
      if (current) return { topicId: current.id, topicTitle: current.title, connectedTopicId: neighbor.id, connectedTopicTitle: neighbor.title };
    }
  }
  return null;
}
