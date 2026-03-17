// src/lib/db/schema.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const topics = sqliteTable("topics", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  difficulty: integer("difficulty").notNull().default(1),
  status: text("status", { enum: ["locked", "available", "in-progress", "mastered"] }).notNull().default("locked"),
  masteryLevel: integer("mastery_level").notNull().default(0),
  description: text("description").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
  cosmosX: real("cosmos_x"),
  cosmosY: real("cosmos_y"),
  cosmosRadius: real("cosmos_radius").default(10),
  domain: text("domain").default("core"),
  nodeType: text("node_type").default("star"),
});

export const edges = sqliteTable("edges", {
  id: text("id").primaryKey(),
  sourceId: text("source_id").notNull().references(() => topics.id),
  targetId: text("target_id").notNull().references(() => topics.id),
  type: text("type", { enum: ["prerequisite", "related", "deepens"] }).notNull().default("prerequisite"),
  weight: real("weight").notNull().default(1.0),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  topicId: text("topic_id").notNull().references(() => topics.id),
  mode: text("mode", { enum: ["challenge", "dialogue"] }).notNull().default("challenge"),
  scratchpadContent: text("scratchpad_content").notNull().default(""),
  journalSummary: text("journal_summary"),
  startedAt: text("started_at").notNull().default(sql`(datetime('now'))`),
  endedAt: text("ended_at"),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  role: text("role", { enum: ["user", "tutor"] }).notNull(),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull().default(sql`(datetime('now'))`),
});

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  content: text("content").notNull(),
  hintLevelUsed: integer("hint_level_used").notNull().default(0),
  timestamp: text("timestamp").notNull().default(sql`(datetime('now'))`),
});

export const reviewResults = sqliteTable("review_results", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  reviewType: text("review_type", { enum: ["teach-it", "what-if", "connect"] }).notNull(),
  passed: integer("passed", { mode: "boolean" }).notNull().default(false),
  feedback: text("feedback").notNull().default(""),
  timestamp: text("timestamp").notNull().default(sql`(datetime('now'))`),
});

export const visualizations = sqliteTable("visualizations", {
  id: text("id").primaryKey(),
  topicId: text("topic_id").notNull().references(() => topics.id),
  visualizationCode: text("visualization_code").notNull(),
  source: text("source", { enum: ["ai-generated", "curated"] }).notNull().default("ai-generated"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  topicId: text("topic_id").notNull().references(() => topics.id),
  hook: text("hook").notNull(),
  problem: text("problem").notNull(),
  hint1: text("hint1").notNull(),
  hint2: text("hint2").notNull(),
  hint3: text("hint3").notNull(),
  explanation: text("explanation").notNull(),
  goingDeeper: text("going_deeper").notNull(),
});
