// src/lib/db/seed.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import seedData from "../../data/seed-cosmos.json";
import path from "path";

async function seed() {
  const dbPath = path.resolve(process.cwd(), "first-principles.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });

  console.log("Seeding database...");

  // Clear existing data (order matters for foreign keys)
  db.delete(schema.edges).run();
  db.delete(schema.visualizations).run();
  db.delete(schema.reviewResults).run();
  db.delete(schema.attempts).run();
  db.delete(schema.messages).run();
  db.delete(schema.sessions).run();
  db.delete(schema.topics).run();

  for (const topic of seedData.topics) {
    db.insert(schema.topics).values({
      id: topic.id, title: topic.title, subject: topic.subject,
      difficulty: topic.difficulty,
      status: topic.status as "locked" | "available" | "in-progress" | "mastered",
      masteryLevel: topic.masteryLevel, description: topic.description,
      cosmosX: topic.cosmosX, cosmosY: topic.cosmosY,
      cosmosRadius: topic.cosmosRadius, domain: topic.domain,
      nodeType: topic.nodeType,
    }).run();
  }
  console.log(`Inserted ${seedData.topics.length} topics.`);

  for (let i = 0; i < seedData.edges.length; i++) {
    const edge = seedData.edges[i];
    db.insert(schema.edges).values({
      id: `e${i + 1}`, sourceId: edge.sourceId, targetId: edge.targetId,
      type: edge.type as "prerequisite" | "related" | "deepens",
      weight: edge.weight,
    }).run();
  }
  console.log(`Inserted ${seedData.edges.length} edges.`);

  console.log("Seeding complete.");
  sqlite.close();
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
