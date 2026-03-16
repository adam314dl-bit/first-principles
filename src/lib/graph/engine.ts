// src/lib/graph/engine.ts
import { eq } from "drizzle-orm";
import { topics, edges } from "@/lib/db/schema";
import type { DB } from "@/lib/db";

export type TopicRow = typeof topics.$inferSelect;
export type EdgeRow = typeof edges.$inferSelect;

/** Returns locked topics whose prerequisite edges are all satisfied (source mastered). */
export function getAvailableTopics(db: DB): TopicRow[] {
  const allTopics = db.select().from(topics).all();
  const allEdges = db.select().from(edges).all();
  const topicMap = new Map(allTopics.map((t) => [t.id, t]));
  const prereqsByTarget = new Map<string, string[]>();
  for (const e of allEdges) {
    if (e.type === "prerequisite") {
      const list = prereqsByTarget.get(e.targetId) || [];
      list.push(e.sourceId);
      prereqsByTarget.set(e.targetId, list);
    }
  }
  const available: TopicRow[] = [];
  for (const t of allTopics) {
    if (t.status !== "locked") continue;
    const prereqs = prereqsByTarget.get(t.id) || [];
    if (prereqs.length === 0) continue;
    if (prereqs.every((pid) => topicMap.get(pid)?.status === "mastered")) available.push(t);
  }
  return available;
}

/** When a topic is mastered, unlock downstream locked topics whose prereqs are now all met. */
export function unlockAfterMastery(db: DB, topicId: string): string[] {
  const allEdges = db.select().from(edges).all();
  const allTopics = db.select().from(topics).all();
  const topicMap = new Map(allTopics.map((t) => [t.id, t]));
  const downstreamIds = new Set<string>();
  for (const e of allEdges) {
    if (e.type === "prerequisite" && e.sourceId === topicId) downstreamIds.add(e.targetId);
  }
  const prereqsByTarget = new Map<string, string[]>();
  for (const e of allEdges) {
    if (e.type === "prerequisite") {
      const list = prereqsByTarget.get(e.targetId) || [];
      list.push(e.sourceId);
      prereqsByTarget.set(e.targetId, list);
    }
  }
  const unlocked: string[] = [];
  for (const targetId of downstreamIds) {
    const target = topicMap.get(targetId);
    if (!target || target.status !== "locked") continue;
    const prereqs = prereqsByTarget.get(targetId) || [];
    if (prereqs.every((pid) => topicMap.get(pid)?.status === "mastered")) {
      db.update(topics).set({ status: "available" }).where(eq(topics.id, targetId)).run();
      unlocked.push(targetId);
    }
  }
  return unlocked;
}

/** Find topics within 2 hops of mastered nodes in two different subjects. */
export function findBridgeTopics(db: DB): TopicRow[] {
  const allTopics = db.select().from(topics).all();
  const allEdges = db.select().from(edges).all();
  const topicMap = new Map(allTopics.map((t) => [t.id, t]));
  const adj = new Map<string, Set<string>>();
  for (const e of allEdges) {
    if (!adj.has(e.sourceId)) adj.set(e.sourceId, new Set());
    if (!adj.has(e.targetId)) adj.set(e.targetId, new Set());
    adj.get(e.sourceId)!.add(e.targetId);
    adj.get(e.targetId)!.add(e.sourceId);
  }
  const masteredBySubject = new Map<string, TopicRow[]>();
  for (const t of allTopics) {
    if (t.status === "mastered") {
      const list = masteredBySubject.get(t.subject) || [];
      list.push(t);
      masteredBySubject.set(t.subject, list);
    }
  }
  const subjects = Array.from(masteredBySubject.keys());
  if (subjects.length < 2) return [];
  function within2Hops(nodeId: string): Set<string> {
    const result = new Set<string>();
    for (const n1 of adj.get(nodeId) || []) {
      result.add(n1);
      for (const n2 of adj.get(n1) || []) result.add(n2);
    }
    result.delete(nodeId);
    return result;
  }
  const bridgeSet = new Set<string>();
  for (let i = 0; i < subjects.length; i++) {
    for (let j = i + 1; j < subjects.length; j++) {
      for (const a of masteredBySubject.get(subjects[i])!) {
        const reachA = within2Hops(a.id);
        for (const b of masteredBySubject.get(subjects[j])!) {
          const reachB = within2Hops(b.id);
          for (const cid of reachA) {
            if (reachB.has(cid) && topicMap.get(cid)?.status !== "mastered") bridgeSet.add(cid);
          }
        }
      }
    }
  }
  return Array.from(bridgeSet).map((id) => topicMap.get(id)!);
}

/** Return mastered topics connected to a given topic via edges, with edge weight. */
export function getConnectedMasteredTopics(db: DB, topicId: string): { topic: TopicRow; weight: number }[] {
  const allEdges = db.select().from(edges).all();
  const allTopics = db.select().from(topics).all();
  const topicMap = new Map(allTopics.map((t) => [t.id, t]));
  const results: { topic: TopicRow; weight: number }[] = [];
  const seen = new Set<string>();
  for (const e of allEdges) {
    const connectedId = e.sourceId === topicId ? e.targetId : e.targetId === topicId ? e.sourceId : null;
    if (connectedId && !seen.has(connectedId)) {
      const connected = topicMap.get(connectedId);
      if (connected?.status === "mastered") {
        results.push({ topic: connected, weight: e.weight });
        seen.add(connectedId);
      }
    }
  }
  return results;
}
