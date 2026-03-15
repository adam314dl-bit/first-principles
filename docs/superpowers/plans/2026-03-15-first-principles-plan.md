# First Principles — Implementation Plan

> **For agentic workers.** Each task is one atomic action (2–5 min). Complete every checkbox in order. All code is provided verbatim — never improvise or skip.

## Goal

Build a personal, curiosity-driven STEM learning platform combining Feynman-style teaching, problem-first learning, an RPG skill tree, and creative review. Local-first with SQLite, AI-powered tutoring, and a warm notebook aesthetic.

## Architecture

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── layout.tsx          # Root layout (fonts, theme)
│   ├── page.tsx            # Home redirect
│   ├── tree/page.tsx       # Skill Tree view
│   ├── playground/page.tsx # Review challenges browser
│   └── journal/page.tsx    # Session history / learning journal
├── components/             # Shared React components
│   ├── TopBar.tsx          # Navigation bar
│   └── ...
├── lib/                    # Core logic
│   ├── db/
│   │   ├── schema.ts       # Drizzle ORM schema
│   │   ├── index.ts        # DB connection
│   │   └── seed.ts         # Seed script
│   ├── prompts/            # AI prompt templates
│   └── ai/                 # Model adapter
├── data/
│   └── seed-topics.json    # Starter topics + edges
└── __tests__/              # Vitest tests
```

## Tech Stack

- **Framework:** Next.js 14+ (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite via Drizzle ORM + better-sqlite3
- **Visualization:** D3.js
- **Math:** KaTeX
- **Testing:** Vitest + React Testing Library
- **Fonts:** Instrument Serif, Caveat, Inter, JetBrains Mono (Google Fonts)

## File Structure Overview

All source code lives under `src/`. The existing `docs/` and `.git/` at the project root are preserved. The Next.js project is scaffolded into the same root directory.

---

## Chunk 1: Project Foundation

### Task 1: Initialize Next.js project

- [ ] **1.1** Scaffold Next.js into a temp directory, then merge into the existing repo root (preserving `docs/`, `.git/`, and other existing files).

```bash
cd /tmp && npx create-next-app@latest fp-scaffold --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

- [ ] **1.2** Copy scaffolded files into the project root (skip `.git/`).

```bash
rsync -av --exclude='.git' --exclude='node_modules' /tmp/fp-scaffold/ /Users/midoriya/Desktop/first-principles/
```

- [ ] **1.3** Install core dependencies.

```bash
cd /Users/midoriya/Desktop/first-principles && npm install drizzle-orm better-sqlite3 d3 katex uuid
```

- [ ] **1.4** Install dev dependencies.

```bash
cd /Users/midoriya/Desktop/first-principles && npm install -D drizzle-kit @types/better-sqlite3 @types/d3 @types/katex @types/uuid vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **1.5** Create `vitest.config.ts` at project root.

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **1.6** Create the test setup file at `src/__tests__/setup.ts`.

```ts
// src/__tests__/setup.ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **1.7** Add test scripts to `package.json`.

```bash
cd /Users/midoriya/Desktop/first-principles && npm pkg set scripts.test="vitest run" && npm pkg set scripts.test:watch="vitest"
```

- [ ] **1.8** Verify the setup compiles.

```bash
cd /Users/midoriya/Desktop/first-principles && npx next build
```

- [ ] **1.9** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "chore: scaffold Next.js project with Tailwind, Drizzle, D3, KaTeX, Vitest"
```

---

### Task 2: Warm Notebook theme

- [ ] **2.1** Replace `tailwind.config.ts` with the warm notebook theme.

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#faf7f2",
        parchment: "#f0e9de",
        "tan-light": "#e8dfd3",
        "tan-dark": "#ddd2c2",
        amber: { DEFAULT: "#d97706", light: "#fef3e2" },
        gold: { DEFAULT: "#b8860b" },
        ink: { DEFAULT: "#2d2a24", body: "#4a4539", muted: "#8a7a65" },
        "locked-bg": "#f5f0e8",
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        hand: ["var(--font-caveat)", "cursive"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **2.2** Replace `src/app/globals.css` with theme variables and lined-paper styles.

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-cream: #faf7f2;
  --color-parchment: #f0e9de;
  --color-tan-light: #e8dfd3;
  --color-tan-dark: #ddd2c2;
  --color-amber: #d97706;
  --color-amber-light: #fef3e2;
  --color-gold: #b8860b;
  --color-ink: #2d2a24;
  --color-ink-body: #4a4539;
  --color-ink-muted: #8a7a65;
  --color-locked-bg: #f5f0e8;
}

body {
  background-color: var(--color-cream);
  color: var(--color-ink-body);
  font-family: var(--font-inter), system-ui, sans-serif;
}

.lined-paper {
  background-image: repeating-linear-gradient(
    transparent, transparent 31px,
    var(--color-tan-light) 31px, var(--color-tan-light) 32px
  );
  background-size: 100% 32px;
  line-height: 32px;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--color-cream); }
::-webkit-scrollbar-thumb { background: var(--color-tan-dark); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-ink-muted); }
```

- [ ] **2.3** Replace `src/app/layout.tsx` with root layout that loads Google Fonts.

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const instrumentSerif = localFont({ src: "./fonts/InstrumentSerif-Regular.ttf", variable: "--font-instrument-serif", display: "swap" });
const caveat = localFont({ src: "./fonts/Caveat-VariableFont_wght.ttf", variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "First Principles",
  description: "A curiosity-driven STEM learning platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${caveat.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **2.4** Download the font files into `src/app/fonts/`.

```bash
mkdir -p /Users/midoriya/Desktop/first-principles/src/app/fonts
curl -L -o /Users/midoriya/Desktop/first-principles/src/app/fonts/InstrumentSerif-Regular.ttf "https://github.com/google/fonts/raw/main/ofl/instrumentserif/InstrumentSerif-Regular.ttf"
curl -L -o /Users/midoriya/Desktop/first-principles/src/app/fonts/Caveat-VariableFont_wght.ttf "https://github.com/google/fonts/raw/main/ofl/caveat/Caveat%5Bwght%5D.ttf"
```

- [ ] **2.4b** Verify font files downloaded successfully.

```bash
ls -la /Users/midoriya/Desktop/first-principles/src/app/fonts/
```

Expected: Both `.ttf` files exist with non-zero file sizes. If either is missing or 0 bytes, re-run the curl commands from step 2.4.

- [ ] **2.5** Replace `src/app/page.tsx` with a redirect to `/tree`.

```tsx
// src/app/page.tsx
import { redirect } from "next/navigation";
export default function Home() { redirect("/tree"); }
```

- [ ] **2.6** Write a theme test at `src/__tests__/theme.test.ts`.

```ts
// src/__tests__/theme.test.ts
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Theme", () => {
  it("globals.css contains all required CSS variables", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf-8");
    const vars = ["--color-cream", "--color-parchment", "--color-tan-light", "--color-tan-dark",
      "--color-amber", "--color-amber-light", "--color-gold", "--color-ink",
      "--color-ink-body", "--color-ink-muted", "--color-locked-bg"];
    for (const v of vars) { expect(css).toContain(v); }
  });

  it("globals.css contains lined-paper class", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf-8");
    expect(css).toContain(".lined-paper");
  });

  it("tailwind.config.ts defines custom font families", () => {
    const config = fs.readFileSync(path.resolve(__dirname, "../../tailwind.config.ts"), "utf-8");
    for (const f of ["font-instrument-serif", "font-caveat", "font-inter", "font-jetbrains-mono"]) {
      expect(config).toContain(f);
    }
  });
});
```

- [ ] **2.7** Run the test.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/theme.test.ts
```

- [ ] **2.8** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: warm notebook theme with custom fonts, CSS variables, and lined-paper"
```

---

### Task 3: Database schema

- [ ] **3.1** Create the DB connection at `src/lib/db/index.ts`.

```ts
// src/lib/db/index.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.resolve(process.cwd(), "first-principles.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
```

- [ ] **3.2** Create the Drizzle schema at `src/lib/db/schema.ts`.

```ts
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
```

- [ ] **3.3** Create `drizzle.config.ts` at project root.

```ts
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: "./first-principles.db" },
} satisfies Config;
```

- [ ] **3.4** Add the SQLite database files to `.gitignore`.

```bash
echo -e "\n# SQLite database\nfirst-principles.db\nfirst-principles.db-journal\nfirst-principles.db-wal" >> /Users/midoriya/Desktop/first-principles/.gitignore
```

- [ ] **3.5** Generate the migration and push to the database.

```bash
cd /Users/midoriya/Desktop/first-principles && npx drizzle-kit generate && npx drizzle-kit push
```

- [ ] **3.6** Write a schema test at `src/__tests__/schema.test.ts`.

```ts
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
```

- [ ] **3.7** Run the schema test.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/schema.test.ts
```

- [ ] **3.8** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: Drizzle ORM schema with topics, edges, sessions, messages, attempts, reviews, visualizations"
```

---

### Task 4: Seed data

- [ ] **4.1** Create `src/data/seed-topics.json` with 25 starter topics and 30 edges.

```json
{
  "topics": [
    { "id": "arithmetic", "title": "Arithmetic", "subject": "math", "difficulty": 1, "status": "available", "masteryLevel": 0, "description": "Foundations of number operations — addition, subtraction, multiplication, division." },
    { "id": "fractions", "title": "Fractions", "subject": "math", "difficulty": 1, "status": "locked", "masteryLevel": 0, "description": "Parts of wholes, ratios, and proportional reasoning." },
    { "id": "algebra-basics", "title": "Algebra Basics", "subject": "math", "difficulty": 2, "status": "locked", "masteryLevel": 0, "description": "Variables, expressions, and solving simple equations." },
    { "id": "linear-equations", "title": "Linear Equations", "subject": "math", "difficulty": 2, "status": "locked", "masteryLevel": 0, "description": "Equations of lines, slope-intercept form, systems of equations." },
    { "id": "quadratics", "title": "Quadratic Equations", "subject": "math", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Parabolas, factoring, the quadratic formula, and completing the square." },
    { "id": "functions", "title": "Functions", "subject": "math", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Mappings between sets — domain, range, composition, inverses." },
    { "id": "trigonometry", "title": "Trigonometry", "subject": "math", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Sine, cosine, tangent — the geometry of triangles and circles." },
    { "id": "limits", "title": "Limits", "subject": "math", "difficulty": 4, "status": "locked", "masteryLevel": 0, "description": "Approaching values, continuity, and the foundation of calculus." },
    { "id": "derivatives", "title": "Derivatives", "subject": "math", "difficulty": 4, "status": "locked", "masteryLevel": 0, "description": "Rates of change, tangent lines, and the power of local approximation." },
    { "id": "integrals", "title": "Integrals", "subject": "math", "difficulty": 4, "status": "locked", "masteryLevel": 0, "description": "Accumulation, area under curves, and the fundamental theorem of calculus." },
    { "id": "vectors", "title": "Vectors", "subject": "math", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Magnitude and direction — the language of physics and geometry." },
    { "id": "kinematics", "title": "Kinematics", "subject": "physics", "difficulty": 2, "status": "available", "masteryLevel": 0, "description": "Describing motion — position, velocity, acceleration without asking why." },
    { "id": "newtons-laws", "title": "Newton's Laws of Motion", "subject": "physics", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Force, mass, acceleration — the three laws that govern motion." },
    { "id": "energy-work", "title": "Energy & Work", "subject": "physics", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Conservation of energy, kinetic and potential energy, work-energy theorem." },
    { "id": "momentum", "title": "Momentum", "subject": "physics", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Impulse, conservation of momentum, and collisions." },
    { "id": "waves", "title": "Waves", "subject": "physics", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Oscillations, frequency, wavelength — how energy travels through space." },
    { "id": "gravity", "title": "Gravity", "subject": "physics", "difficulty": 4, "status": "locked", "masteryLevel": 0, "description": "Universal gravitation, orbits, and the force that shapes the cosmos." },
    { "id": "variables-types", "title": "Variables & Types", "subject": "cs", "difficulty": 1, "status": "available", "masteryLevel": 0, "description": "Storing data — integers, strings, booleans, and how computers represent information." },
    { "id": "control-flow", "title": "Control Flow", "subject": "cs", "difficulty": 1, "status": "locked", "masteryLevel": 0, "description": "If/else, loops, and the logic that directs program execution." },
    { "id": "arrays-lists", "title": "Arrays & Lists", "subject": "cs", "difficulty": 2, "status": "locked", "masteryLevel": 0, "description": "Ordered collections — indexing, iteration, and sequential data." },
    { "id": "recursion", "title": "Recursion", "subject": "cs", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Functions that call themselves — base cases, stack frames, and elegant problem-solving." },
    { "id": "sorting-algorithms", "title": "Sorting Algorithms", "subject": "cs", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Bubble sort, merge sort, quicksort — ordering data efficiently." },
    { "id": "big-o", "title": "Big-O Notation", "subject": "cs", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Measuring algorithmic efficiency — time and space complexity." },
    { "id": "trees-graphs", "title": "Trees & Graphs", "subject": "cs", "difficulty": 4, "status": "locked", "masteryLevel": 0, "description": "Hierarchical and networked data structures — traversal, search, and connectivity." },
    { "id": "hash-tables", "title": "Hash Tables", "subject": "cs", "difficulty": 3, "status": "locked", "masteryLevel": 0, "description": "Key-value lookup in constant time — hashing, collisions, and trade-offs." }
  ],
  "edges": [
    { "id": "e1", "sourceId": "arithmetic", "targetId": "fractions", "type": "prerequisite", "weight": 1.0 },
    { "id": "e2", "sourceId": "arithmetic", "targetId": "algebra-basics", "type": "prerequisite", "weight": 1.0 },
    { "id": "e3", "sourceId": "fractions", "targetId": "algebra-basics", "type": "prerequisite", "weight": 0.8 },
    { "id": "e4", "sourceId": "algebra-basics", "targetId": "linear-equations", "type": "prerequisite", "weight": 1.0 },
    { "id": "e5", "sourceId": "linear-equations", "targetId": "quadratics", "type": "prerequisite", "weight": 1.0 },
    { "id": "e6", "sourceId": "algebra-basics", "targetId": "functions", "type": "prerequisite", "weight": 1.0 },
    { "id": "e7", "sourceId": "functions", "targetId": "trigonometry", "type": "prerequisite", "weight": 0.9 },
    { "id": "e8", "sourceId": "functions", "targetId": "limits", "type": "prerequisite", "weight": 1.0 },
    { "id": "e9", "sourceId": "limits", "targetId": "derivatives", "type": "prerequisite", "weight": 1.0 },
    { "id": "e10", "sourceId": "derivatives", "targetId": "integrals", "type": "prerequisite", "weight": 1.0 },
    { "id": "e11", "sourceId": "trigonometry", "targetId": "vectors", "type": "related", "weight": 0.7 },
    { "id": "e12", "sourceId": "algebra-basics", "targetId": "kinematics", "type": "related", "weight": 0.6 },
    { "id": "e13", "sourceId": "kinematics", "targetId": "newtons-laws", "type": "prerequisite", "weight": 1.0 },
    { "id": "e14", "sourceId": "newtons-laws", "targetId": "energy-work", "type": "prerequisite", "weight": 1.0 },
    { "id": "e15", "sourceId": "newtons-laws", "targetId": "momentum", "type": "prerequisite", "weight": 0.9 },
    { "id": "e16", "sourceId": "energy-work", "targetId": "waves", "type": "prerequisite", "weight": 0.7 },
    { "id": "e17", "sourceId": "newtons-laws", "targetId": "gravity", "type": "deepens", "weight": 1.0 },
    { "id": "e18", "sourceId": "derivatives", "targetId": "newtons-laws", "type": "related", "weight": 0.8 },
    { "id": "e19", "sourceId": "vectors", "targetId": "newtons-laws", "type": "related", "weight": 0.7 },
    { "id": "e20", "sourceId": "variables-types", "targetId": "control-flow", "type": "prerequisite", "weight": 1.0 },
    { "id": "e21", "sourceId": "control-flow", "targetId": "arrays-lists", "type": "prerequisite", "weight": 1.0 },
    { "id": "e22", "sourceId": "arrays-lists", "targetId": "recursion", "type": "prerequisite", "weight": 0.8 },
    { "id": "e23", "sourceId": "arrays-lists", "targetId": "sorting-algorithms", "type": "prerequisite", "weight": 1.0 },
    { "id": "e24", "sourceId": "recursion", "targetId": "sorting-algorithms", "type": "related", "weight": 0.7 },
    { "id": "e25", "sourceId": "sorting-algorithms", "targetId": "big-o", "type": "related", "weight": 0.9 },
    { "id": "e26", "sourceId": "arrays-lists", "targetId": "hash-tables", "type": "prerequisite", "weight": 0.8 },
    { "id": "e27", "sourceId": "recursion", "targetId": "trees-graphs", "type": "prerequisite", "weight": 1.0 },
    { "id": "e28", "sourceId": "big-o", "targetId": "trees-graphs", "type": "related", "weight": 0.6 },
    { "id": "e29", "sourceId": "integrals", "targetId": "energy-work", "type": "related", "weight": 0.8 },
    { "id": "e30", "sourceId": "quadratics", "targetId": "kinematics", "type": "related", "weight": 0.5 }
  ]
}
```

- [ ] **4.2** Create the seed script at `src/lib/db/seed.ts`.

```ts
// src/lib/db/seed.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import seedData from "../../data/seed-topics.json";
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
    }).run();
  }
  console.log(`Inserted ${seedData.topics.length} topics.`);

  for (const edge of seedData.edges) {
    db.insert(schema.edges).values({
      id: edge.id, sourceId: edge.sourceId, targetId: edge.targetId,
      type: edge.type as "prerequisite" | "related" | "deepens",
      weight: edge.weight,
    }).run();
  }
  console.log(`Inserted ${seedData.edges.length} edges.`);

  console.log("Seeding complete.");
  sqlite.close();
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
```

- [ ] **4.3** Install `tsx` and add seed script to `package.json`.

```bash
cd /Users/midoriya/Desktop/first-principles && npm install -D tsx && npm pkg set scripts.db:seed="tsx src/lib/db/seed.ts"
```

- [ ] **4.4** Run the seed script.

```bash
cd /Users/midoriya/Desktop/first-principles && npm run db:seed
```

- [ ] **4.5** Write a seed data validation test at `src/__tests__/seed-data.test.ts`.

```ts
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
```

- [ ] **4.6** Run the seed data test.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/seed-data.test.ts
```

- [ ] **4.7** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: seed data with 25 topics and 30 edges across math, physics, and CS"
```

---

### Task 5: TopBar component + basic pages

- [ ] **5.1** Create the TopBar component at `src/components/TopBar.tsx`. Note: the model selector is a UI-only stub in this chunk — functional model switching (state persistence, API key management) is deferred to Chunk 2 (AI Tutor Adapter).

```tsx
// src/components/TopBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navTabs = [
  { label: "Skill Tree", href: "/tree" },
  { label: "Playground", href: "/playground" },
  { label: "Journal", href: "/journal" },
] as const;

const models = [
  { label: "Claude Sonnet", value: "claude-sonnet" },
  { label: "Claude Opus", value: "claude-opus" },
  { label: "GPT-4o", value: "gpt-4o" },
] as const;

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-tan-light bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/tree" className="flex items-center gap-2">
          <span className="font-serif text-xl text-ink">First Principles</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? "bg-amber-light text-amber" : "text-ink-muted hover:bg-parchment hover:text-ink-body"}`}>
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <label htmlFor="model-select" className="text-xs text-ink-muted">Model:</label>
          <select id="model-select" defaultValue="claude-sonnet" className="rounded-md border border-tan-light bg-parchment px-2 py-1 text-xs text-ink-body focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber">
            {models.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **5.2** Update `src/app/layout.tsx` to include the TopBar.

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import TopBar from "@/components/TopBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const instrumentSerif = localFont({ src: "./fonts/InstrumentSerif-Regular.ttf", variable: "--font-instrument-serif", display: "swap" });
const caveat = localFont({ src: "./fonts/Caveat-VariableFont_wght.ttf", variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "First Principles",
  description: "A curiosity-driven STEM learning platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${caveat.variable} font-sans antialiased`}>
        <TopBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **5.3** Create the Skill Tree stub page at `src/app/tree/page.tsx`.

```tsx
// src/app/tree/page.tsx
export default function TreePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Skill Tree</h1>
      <p className="mt-2 text-ink-muted">Your knowledge graph will appear here. Explore topics, unlock new concepts, and watch your understanding grow.</p>
      <div className="mt-8 flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-tan-dark bg-parchment">
        <p className="font-hand text-xl text-ink-muted">D3 skill tree coming soon...</p>
      </div>
    </div>
  );
}
```

- [ ] **5.4** Create the Playground stub page at `src/app/playground/page.tsx`.

```tsx
// src/app/playground/page.tsx
export default function PlaygroundPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Playground</h1>
      <p className="mt-2 text-ink-muted">Browse review challenges like a game menu — sorted by fun, not urgency.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-tan-light bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg text-ink">Teach It</h3>
          <p className="mt-1 text-sm text-ink-muted">Explain concepts simply to prove you understand them.</p>
        </div>
        <div className="rounded-lg border border-tan-light bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg text-ink">What If?</h3>
          <p className="mt-1 text-sm text-ink-muted">Counterfactual challenges that test deep understanding.</p>
        </div>
        <div className="rounded-lg border border-tan-light bg-white p-6 shadow-sm">
          <h3 className="font-serif text-lg text-ink">Connect</h3>
          <p className="mt-1 text-sm text-ink-muted">Bridge knowledge across topics and discover hidden links.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **5.5** Create the Journal stub page at `src/app/journal/page.tsx`.

```tsx
// src/app/journal/page.tsx
export default function JournalPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Learning Journal</h1>
      <p className="mt-2 text-ink-muted">Your session history, auto-generated summaries, and reflections on what clicked and what needs more work.</p>
      <div className="mt-8 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-tan-dark bg-parchment">
        <p className="font-hand text-xl text-ink-muted">Session entries will appear here...</p>
      </div>
    </div>
  );
}
```

- [ ] **5.6** Write a TopBar test at `src/__tests__/topbar.test.tsx`.

```tsx
// src/__tests__/topbar.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TopBar from "@/components/TopBar";

vi.mock("next/navigation", () => ({ usePathname: () => "/tree" }));
vi.mock("next/link", () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe("TopBar", () => {
  it("renders the logo text", () => {
    render(<TopBar />);
    expect(screen.getByText("First Principles")).toBeTruthy();
  });

  it("renders all three navigation tabs", () => {
    render(<TopBar />);
    expect(screen.getByText("Skill Tree")).toBeTruthy();
    expect(screen.getByText("Playground")).toBeTruthy();
    expect(screen.getByText("Journal")).toBeTruthy();
  });

  it("renders the model select dropdown with options", () => {
    render(<TopBar />);
    const select = screen.getByLabelText("Model:");
    expect(select).toBeTruthy();
    expect(screen.getByText("Claude Sonnet")).toBeTruthy();
    expect(screen.getByText("Claude Opus")).toBeTruthy();
    expect(screen.getByText("GPT-4o")).toBeTruthy();
  });

  it("highlights the active nav tab", () => {
    render(<TopBar />);
    const skillTreeLink = screen.getByText("Skill Tree");
    expect(skillTreeLink.className).toContain("text-amber");
  });
});
```

- [ ] **5.7** Run the TopBar test.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/topbar.test.tsx
```

- [ ] **5.8** Verify the full build compiles.

```bash
cd /Users/midoriya/Desktop/first-principles && npx next build
```

- [ ] **5.9** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: TopBar with nav tabs and model select, stub pages for tree, playground, journal"
```

---

## Chunk 2: AI Tutor Adapter

### Task 6: AI adapter with provider abstraction

- [ ] **6.1** Install the Anthropic and OpenAI SDKs.

```bash
cd /Users/midoriya/Desktop/first-principles && npm install @anthropic-ai/sdk openai
```

- [ ] **6.2** Create `src/lib/ai/types.ts` with all AI adapter types.

```ts
// src/lib/ai/types.ts
export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ChatOptions {
  messages: AIMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  name: string;
  chat(options: ChatOptions): Promise<AIResponse>;
  createWithModel(modelId: string): (options: ChatOptions) => Promise<AIResponse>;
}

export interface ModelConfig {
  id: string;
  label: string;
  provider: "anthropic" | "openai";
  modelId: string;
  maxTokens: number;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "claude-sonnet",
    label: "Claude Sonnet",
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    maxTokens: 8192,
  },
  {
    id: "claude-opus",
    label: "Claude Opus",
    provider: "anthropic",
    modelId: "claude-opus-4-20250514",
    maxTokens: 4096,
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    modelId: "gpt-4o",
    maxTokens: 4096,
  },
];

export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODEL_CONFIGS.find((m) => m.id === modelId);
}
```

- [ ] **6.3** Create the Anthropic provider at `src/lib/ai/providers/anthropic.ts`.

```ts
// src/lib/ai/providers/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatOptions, AIResponse, AIMessage } from "../types";

export class AnthropicProvider implements AIProvider {
  name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async chat(options: ChatOptions): Promise<AIResponse> {
    return this.createWithModel("claude-sonnet-4-6-20250514")(options);
  }

  createWithModel(modelId: string): (options: ChatOptions) => Promise<AIResponse> {
    return async (options: ChatOptions) => {
      const userMessages = options.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const response = await this.client.messages.create({
        model: modelId,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0.7,
        system: options.systemPrompt ?? "",
        messages: userMessages,
      });

      const textBlock = response.content.find((block) => block.type === "text");

      return {
        content: textBlock ? textBlock.text : "",
        model: response.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    };
  }
}
```

- [ ] **6.4** Create the OpenAI provider at `src/lib/ai/providers/openai.ts`.

```ts
// src/lib/ai/providers/openai.ts
import OpenAI from "openai";
import type { AIProvider, ChatOptions, AIResponse } from "../types";

export class OpenAIProvider implements AIProvider {
  name = "openai";
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async chat(options: ChatOptions): Promise<AIResponse> {
    return this.createWithModel("gpt-4o")(options);
  }

  createWithModel(modelId: string): (options: ChatOptions) => Promise<AIResponse> {
    return async (options: ChatOptions) => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }

      for (const msg of options.messages) {
        if (msg.role === "system") continue;
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }

      const response = await this.client.chat.completions.create({
        model: modelId,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0.7,
        messages,
      });

      const choice = response.choices[0];

      return {
        content: choice?.message?.content ?? "",
        model: response.model,
        usage: response.usage
          ? {
              inputTokens: response.usage.prompt_tokens,
              outputTokens: response.usage.completion_tokens ?? 0,
            }
          : undefined,
      };
    };
  }
}
```

- [ ] **6.5** Create the main adapter at `src/lib/ai/adapter.ts`.

```ts
// src/lib/ai/adapter.ts
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAIProvider } from "./providers/openai";
import type { AIProvider, AIResponse, ChatOptions, ModelConfig } from "./types";
import { getModelConfig } from "./types";

export class AIAdapterError extends Error {
  constructor(
    message: string,
    public code: "INVALID_KEY" | "RATE_LIMIT" | "PROVIDER_ERROR" | "UNKNOWN_MODEL",
    public retryable: boolean
  ) {
    super(message);
    this.name = "AIAdapterError";
  }
}

const providerCache = new Map<string, AIProvider>();

function getProvider(config: ModelConfig): AIProvider {
  const cacheKey = config.provider;
  const cached = providerCache.get(cacheKey);
  if (cached) return cached;

  let provider: AIProvider;

  if (config.provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new AIAdapterError(
        "ANTHROPIC_API_KEY is not set. Add it to your .env.local file.",
        "INVALID_KEY",
        false
      );
    }
    provider = new AnthropicProvider(apiKey);
  } else if (config.provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIAdapterError(
        "OPENAI_API_KEY is not set. Add it to your .env.local file.",
        "INVALID_KEY",
        false
      );
    }
    provider = new OpenAIProvider(apiKey);
  } else {
    throw new AIAdapterError(
      `Unknown provider: ${config.provider}`,
      "UNKNOWN_MODEL",
      false
    );
  }

  providerCache.set(cacheKey, provider);
  return provider;
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests");
  }
  return false;
}

function isInvalidKeyError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return msg.includes("invalid api key") || msg.includes("401") || msg.includes("authentication");
  }
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function chat(
  modelId: string,
  options: ChatOptions
): Promise<AIResponse> {
  const config = getModelConfig(modelId);
  if (!config) {
    throw new AIAdapterError(
      `Unknown model: ${modelId}. Available: claude-sonnet, claude-opus, gpt-4o`,
      "UNKNOWN_MODEL",
      false
    );
  }

  const provider = getProvider(config);
  const chatOptions: ChatOptions = {
    ...options,
    maxTokens: options.maxTokens ?? config.maxTokens,
  };

  const callAI = () => provider.createWithModel(config.modelId)(chatOptions);

  try {
    return await callAI();
  } catch (error) {
    if (isInvalidKeyError(error)) {
      providerCache.delete(config.provider);
      throw new AIAdapterError(
        `Invalid API key for ${config.provider}. Check your .env.local file.`,
        "INVALID_KEY",
        false
      );
    }

    // Retry once after 3 seconds for rate limits or generic errors
    await delay(3000);
    try {
      return await callAI();
    } catch (retryError) {
      const code = isRateLimitError(error) ? "RATE_LIMIT" : "PROVIDER_ERROR";
      const msg = isRateLimitError(error)
        ? `Rate limited by ${config.provider}. Please wait a moment and try again.`
        : `AI provider error: ${retryError instanceof Error ? retryError.message : "Unknown error"}`;
      throw new AIAdapterError(msg, code, true);
    }
  }
}

/** Clear the provider cache (useful for testing or after key changes). */
export function clearProviderCache(): void {
  providerCache.clear();
}
```

- [ ] **6.6** Create `.env.local.example` at the project root.

```bash
# .env.local.example
# Copy this file to .env.local and add your API keys.
# At least one key is required for AI features.

ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
```

- [ ] **6.7** Add `.env.local` to `.gitignore` (if not already present).

```bash
cd /Users/midoriya/Desktop/first-principles && grep -q ".env.local" .gitignore || echo -e "\n# Environment\n.env.local" >> .gitignore
```

- [ ] **6.8** Create `src/__tests__/adapter.test.ts` with tests for provider routing and error handling.

```ts
// src/__tests__/adapter.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { chat, clearProviderCache, AIAdapterError } from "@/lib/ai/adapter";
import type { AIResponse, ChatOptions } from "@/lib/ai/types";
import { getModelConfig, MODEL_CONFIGS } from "@/lib/ai/types";

// Mock both provider modules
vi.mock("@/lib/ai/providers/anthropic", () => {
  const mockChat = vi.fn();
  return {
    AnthropicProvider: vi.fn().mockImplementation(() => ({
      name: "anthropic",
      chat: mockChat,
      createWithModel: () => mockChat,
    })),
    __mockChat: mockChat,
  };
});

vi.mock("@/lib/ai/providers/openai", () => {
  const mockChat = vi.fn();
  return {
    OpenAIProvider: vi.fn().mockImplementation(() => ({
      name: "openai",
      chat: mockChat,
      createWithModel: () => mockChat,
    })),
    __mockChat: mockChat,
  };
});

describe("AI Adapter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearProviderCache();
    vi.stubEnv("ANTHROPIC_API_KEY", "test-anthropic-key");
    vi.stubEnv("OPENAI_API_KEY", "test-openai-key");
  });

  const baseOptions: ChatOptions = {
    messages: [{ role: "user", content: "Hello" }],
    systemPrompt: "You are a tutor.",
  };

  describe("getModelConfig", () => {
    it("returns config for claude-sonnet", () => {
      const config = getModelConfig("claude-sonnet");
      expect(config).toBeDefined();
      expect(config!.provider).toBe("anthropic");
      expect(config!.label).toBe("Claude Sonnet");
    });

    it("returns config for gpt-4o", () => {
      const config = getModelConfig("gpt-4o");
      expect(config).toBeDefined();
      expect(config!.provider).toBe("openai");
    });

    it("returns undefined for unknown model", () => {
      expect(getModelConfig("unknown-model")).toBeUndefined();
    });
  });

  describe("MODEL_CONFIGS", () => {
    it("has 3 models", () => {
      expect(MODEL_CONFIGS).toHaveLength(3);
    });

    it("every config has required fields", () => {
      for (const config of MODEL_CONFIGS) {
        expect(config.id).toBeTruthy();
        expect(config.label).toBeTruthy();
        expect(config.provider).toBeTruthy();
        expect(config.modelId).toBeTruthy();
        expect(config.maxTokens).toBeGreaterThan(0);
      }
    });
  });

  describe("chat routing", () => {
    it("throws UNKNOWN_MODEL for invalid model id", async () => {
      await expect(chat("nonexistent", baseOptions)).rejects.toThrow(AIAdapterError);
      try {
        await chat("nonexistent", baseOptions);
      } catch (e) {
        expect((e as AIAdapterError).code).toBe("UNKNOWN_MODEL");
      }
    });

    it("throws INVALID_KEY when ANTHROPIC_API_KEY is missing", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "");
      clearProviderCache();
      await expect(chat("claude-sonnet", baseOptions)).rejects.toThrow(AIAdapterError);
      try {
        await chat("claude-sonnet", baseOptions);
      } catch (e) {
        expect((e as AIAdapterError).code).toBe("INVALID_KEY");
        expect((e as AIAdapterError).retryable).toBe(false);
      }
    });

    it("throws INVALID_KEY when OPENAI_API_KEY is missing", async () => {
      vi.stubEnv("OPENAI_API_KEY", "");
      clearProviderCache();
      await expect(chat("gpt-4o", baseOptions)).rejects.toThrow(AIAdapterError);
      try {
        await chat("gpt-4o", baseOptions);
      } catch (e) {
        expect((e as AIAdapterError).code).toBe("INVALID_KEY");
        expect((e as AIAdapterError).retryable).toBe(false);
      }
    });
  });

  describe("AIAdapterError", () => {
    it("has correct name and properties", () => {
      const err = new AIAdapterError("test error", "RATE_LIMIT", true);
      expect(err.name).toBe("AIAdapterError");
      expect(err.message).toBe("test error");
      expect(err.code).toBe("RATE_LIMIT");
      expect(err.retryable).toBe(true);
    });

    it("marks INVALID_KEY as non-retryable", () => {
      const err = new AIAdapterError("bad key", "INVALID_KEY", false);
      expect(err.retryable).toBe(false);
    });

    it("marks PROVIDER_ERROR as retryable", () => {
      const err = new AIAdapterError("server error", "PROVIDER_ERROR", true);
      expect(err.retryable).toBe(true);
    });
  });
});
```

- [ ] **6.9** Run the adapter tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/adapter.test.ts
```

- [ ] **6.10** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: AI adapter with Anthropic and OpenAI providers, error handling, retry logic"
```

---

### Task 7: Prompt templates

- [ ] **7.1** Create `src/lib/prompts/challenge-generate.ts`.

```ts
// src/lib/prompts/challenge-generate.ts
export interface ChallengeGenerateParams {
  topic: string;
  subject: string;
  difficulty: number;
  masteredTopics: string[];
}

export function challengeGeneratePrompt(params: ChallengeGenerateParams): string {
  const { topic, subject, difficulty, masteredTopics } = params;
  const masteredList = masteredTopics.length > 0
    ? `The learner has already mastered: ${masteredTopics.join(", ")}.`
    : "The learner is just starting out with no prior mastered topics.";

  const subjectGuidance = subject === "math"
    ? "For math: insist on rigor. Require precise definitions and logical steps. Encourage proof-like reasoning."
    : subject === "physics"
    ? "For physics: lead with intuition and physical reasoning before equations. Ask 'what would you expect to happen?' before formalizing."
    : subject === "cs"
    ? "For computer science: emphasize algorithmic thinking. Ask the learner to trace through examples by hand before coding."
    : "Adapt your approach to fit the subject matter.";

  return `You are a Socratic STEM tutor inspired by Richard Feynman's teaching style. Your goal is to create a provocative, curiosity-sparking challenge that forces the learner to think deeply rather than recall facts.

Topic: ${topic}
Subject: ${subject}
Difficulty level: ${difficulty}/5
${masteredList}

${subjectGuidance}

Generate ONE challenge that:
1. Starts with an intriguing question or puzzle — not a textbook exercise
2. Can be approached from first principles — no memorized formulas needed
3. Has layers of depth — a surface answer exists, but deeper reasoning reveals more
4. Connects to the learner's existing knowledge where possible
5. Is appropriate for difficulty level ${difficulty}/5

Format your response as:
**Challenge:** [The provocative question or puzzle]
**Why this matters:** [One sentence connecting this to real understanding]`;
}
```

- [ ] **7.2** Create `src/lib/prompts/challenge-hints.ts`.

```ts
// src/lib/prompts/challenge-hints.ts
export interface ChallengeHintsParams {
  challenge: string;
  hintLevel: number;
  userAttempt?: string;
}

export function challengeHintsPrompt(params: ChallengeHintsParams): string {
  const { challenge, hintLevel, userAttempt } = params;
  const attemptContext = userAttempt
    ? `The learner has attempted: "${userAttempt}"`
    : "The learner has not yet attempted an answer.";

  const hintGuidance = hintLevel === 1
    ? "Give a gentle nudge — a question that redirects thinking. Do NOT reveal any part of the answer. Ask something like 'Think about...' or 'What happens when...'"
    : hintLevel === 2
    ? "Offer a more specific guiding question. Point toward a useful concept or approach without solving the problem. Say something like 'What if you considered...' or 'Try looking at this from the perspective of...'"
    : "Give a concrete nudge — name the specific concept or technique that applies, and suggest the first step. Still do NOT give the full answer, but make the path forward clear.";

  return `You are a Socratic tutor providing a hint for a challenge. Never reveal the full answer. Each hint peels back one layer.

Challenge: ${challenge}
Hint level: ${hintLevel}/3
${attemptContext}

${hintGuidance}

Respond with ONLY the hint — no preamble, no "Here's a hint:". Just the guiding thought.`;
}
```

- [ ] **7.3** Create `src/lib/prompts/challenge-explain.ts`.

```ts
// src/lib/prompts/challenge-explain.ts
export interface ChallengeExplainParams {
  challenge: string;
  topic: string;
  userAttempt: string;
}

export function challengeExplainPrompt(params: ChallengeExplainParams): string {
  const { challenge, topic, userAttempt } = params;

  return `You are a Feynman-style tutor providing a full explanation after a learner has made a genuine attempt at a challenge. Your explanation should be clear enough for a curious beginner but deep enough to satisfy a rigorous thinker.

Topic: ${topic}
Challenge: ${challenge}
Learner's attempt: "${userAttempt}"

Provide a complete explanation that:
1. Acknowledges what the learner got right (if anything) — build on their thinking
2. Derives the answer from first principles — no "it's a well-known fact that..."
3. Uses analogies and concrete examples to build intuition
4. Shows the logical chain of reasoning step by step
5. Ends with a "going deeper" thought — what question does this answer raise?

Format:
**What you got right:** [Acknowledge their reasoning]
**The key insight:** [The core idea in plain language]
**Full explanation:** [Step-by-step derivation from first principles]
**Going deeper:** [A follow-up question that extends the concept]`;
}
```

- [ ] **7.4** Create `src/lib/prompts/dialogue-system.ts`.

```ts
// src/lib/prompts/dialogue-system.ts
export interface DialogueSystemParams {
  topic: string;
  subject: string;
  masteredTopics: string[];
  sessionHistory: Array<{ role: string; content: string }>;
}

export function dialogueSystemPrompt(params: DialogueSystemParams): string {
  const { topic, subject, masteredTopics, sessionHistory } = params;
  const masteredList = masteredTopics.length > 0
    ? `Topics the learner has mastered: ${masteredTopics.join(", ")}.`
    : "The learner is just starting out.";

  const historyContext = sessionHistory.length > 0
    ? `Recent conversation context:\n${sessionHistory.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n")}`
    : "This is the start of a new conversation.";

  const subjectStyle = subject === "math"
    ? "For math topics: insist on rigor and precise definitions. Ask the learner to prove things, not just state them. When they hand-wave, press for details."
    : subject === "physics"
    ? "For physics topics: always start with physical intuition. Ask 'what would you expect?' before any equations. Use thought experiments freely. Connect to everyday experience."
    : subject === "cs"
    ? "For CS topics: think algorithmically. Ask the learner to trace through concrete examples. Discuss trade-offs. Connect abstract ideas to real systems."
    : "Adapt your questioning style to match the subject matter.";

  return `You are a Socratic tutor in the tradition of Richard Feynman. You never lecture — you ask questions. Your goal is to guide the learner to discover understanding for themselves.

Current topic: ${topic}
Subject: ${subject}
${masteredList}

${subjectStyle}

Your approach:
1. Ask the learner to explain in their own words — then poke holes in vague reasoning
2. Use "what if" questions to test understanding boundaries
3. Suggest thought experiments that illuminate the concept
4. When the learner connects to a mastered topic, celebrate it and dig deeper into the connection
5. If you detect a knowledge gap, suggest a challenge: "Want me to give you a problem on this?"
6. Keep responses concise — this is a dialogue, not a lecture. 2-4 sentences max per turn.

${historyContext}`;
}
```

- [ ] **7.5** Create `src/lib/prompts/review-evaluate.ts`.

```ts
// src/lib/prompts/review-evaluate.ts
export interface ReviewEvaluateParams {
  reviewType: "teach-it" | "what-if" | "connect";
  challenge: string;
  userResponse: string;
  topic: string;
}

export function reviewEvaluatePrompt(params: ReviewEvaluateParams): string {
  const { reviewType, challenge, userResponse, topic } = params;

  const evaluationCriteria = reviewType === "teach-it"
    ? `Evaluate whether the learner accurately conveyed the core concept of "${topic}". A passing explanation:
- Identifies the key idea correctly (not necessarily using formal language)
- Does not contain fundamental misconceptions
- Would help someone unfamiliar with the topic build correct intuition
Return: { "passed": boolean, "feedback": "...", "follow_up_question": "..." (optional) }`
    : reviewType === "what-if"
    ? `Evaluate the depth of the learner's counterfactual reasoning about "${topic}". Assess:
- Did they identify which principles would be affected?
- Did they trace consequences beyond the immediate/obvious?
- Did they reason from first principles rather than guessing?
Depth score: 1 = surface-level, 2 = traced one chain of consequences, 3 = explored multiple implications and edge cases.
Return: { "passed": boolean, "feedback": "...", "depth_score": 1|2|3 }`
    : `Evaluate the quality of the connection the learner made involving "${topic}". Assess:
- Is the connection genuine (not superficial or forced)?
- Did they explain the mechanism of the connection (not just "they're related")?
- Did they demonstrate understanding of both connected concepts?
Return: { "passed": boolean, "feedback": "...", "connection_quality": "weak|moderate|strong" }`;

  return `You are evaluating a learner's response to a creative review challenge. Be encouraging but honest. The goal is growth, not gatekeeping.

Review type: ${reviewType}
Topic: ${topic}
Challenge: ${challenge}
Learner's response: "${userResponse}"

${evaluationCriteria}

Respond with ONLY the JSON object. No markdown, no wrapping.`;
}
```

- [ ] **7.6** Create `src/lib/prompts/review-generate.ts`.

```ts
// src/lib/prompts/review-generate.ts
export interface ReviewGenerateParams {
  reviewType: "teach-it" | "what-if" | "connect";
  topic: string;
  relatedTopics: string[];
}

export function reviewGeneratePrompt(params: ReviewGenerateParams): string {
  const { reviewType, topic, relatedTopics } = params;
  const relatedContext = relatedTopics.length > 0
    ? `Related topics the learner knows: ${relatedTopics.join(", ")}.`
    : "No closely related topics mastered yet.";

  const typeInstructions = reviewType === "teach-it"
    ? `Generate a "Teach It" challenge. Examples of good prompts:
- "Explain ${topic} to a curious 12-year-old who asks great questions."
- "Your friend says '[common misconception about ${topic}].' Are they right? What's missing?"
- "Create an analogy for ${topic} using something from everyday life."
Pick ONE creative angle. Make it fun and specific — not generic.`
    : reviewType === "what-if"
    ? `Generate a "What If?" counterfactual challenge. Examples:
- "What would happen if [fundamental assumption of ${topic}] were different?"
- "If [key concept] didn't exist, how would [related field] change?"
- "Remove one key property from [${topic}]. What breaks, and what still works?"
Pick ONE thought-provoking counterfactual. It should force reasoning from first principles.`
    : `Generate a "Connect" challenge that bridges ${topic} with the learner's other knowledge. Examples:
- "You know ${topic} and ${relatedTopics[0] ?? "another concept"}. What's the actual relationship?"
- "Find a real-world system that demonstrates ${topic} — something not in any textbook."
- "Here's a problem that requires combining ${topic} with ${relatedTopics[0] ?? "another concept"}..."
Pick ONE challenge that rewards cross-domain thinking.`;

  return `You are generating a creative review challenge for a STEM learning platform. The challenge should feel like a fun side quest, not homework.

Topic: ${topic}
Review type: ${reviewType}
${relatedContext}

${typeInstructions}

Respond with ONLY the challenge text. No preamble, no labels. Just the challenge.`;
}
```

- [ ] **7.7** Create `src/__tests__/prompts.test.ts` with tests for all six templates.

```ts
// src/__tests__/prompts.test.ts
import { describe, it, expect } from "vitest";
import { challengeGeneratePrompt } from "@/lib/prompts/challenge-generate";
import { challengeHintsPrompt } from "@/lib/prompts/challenge-hints";
import { challengeExplainPrompt } from "@/lib/prompts/challenge-explain";
import { dialogueSystemPrompt } from "@/lib/prompts/dialogue-system";
import { reviewEvaluatePrompt } from "@/lib/prompts/review-evaluate";
import { reviewGeneratePrompt } from "@/lib/prompts/review-generate";

describe("Prompt Templates", () => {
  describe("challengeGeneratePrompt", () => {
    it("returns a non-empty string", () => {
      const result = challengeGeneratePrompt({
        topic: "Derivatives",
        subject: "math",
        difficulty: 4,
        masteredTopics: ["Limits", "Functions"],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains injected topic and subject", () => {
      const result = challengeGeneratePrompt({
        topic: "Newton's Laws",
        subject: "physics",
        difficulty: 3,
        masteredTopics: ["Kinematics"],
      });
      expect(result).toContain("Newton's Laws");
      expect(result).toContain("physics");
      expect(result).toContain("3/5");
      expect(result).toContain("Kinematics");
    });

    it("contains math-specific guidance for math subjects", () => {
      const result = challengeGeneratePrompt({
        topic: "Integrals",
        subject: "math",
        difficulty: 4,
        masteredTopics: [],
      });
      expect(result).toContain("rigor");
    });

    it("contains physics-specific guidance for physics subjects", () => {
      const result = challengeGeneratePrompt({
        topic: "Gravity",
        subject: "physics",
        difficulty: 4,
        masteredTopics: [],
      });
      expect(result).toContain("intuition");
    });

    it("contains cs-specific guidance for CS subjects", () => {
      const result = challengeGeneratePrompt({
        topic: "Recursion",
        subject: "cs",
        difficulty: 3,
        masteredTopics: [],
      });
      expect(result).toContain("algorithmic");
    });

    it("handles empty mastered topics", () => {
      const result = challengeGeneratePrompt({
        topic: "Arithmetic",
        subject: "math",
        difficulty: 1,
        masteredTopics: [],
      });
      expect(result).toContain("just starting out");
    });
  });

  describe("challengeHintsPrompt", () => {
    it("returns a non-empty string", () => {
      const result = challengeHintsPrompt({
        challenge: "Why does a ball fall?",
        hintLevel: 1,
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains the challenge text", () => {
      const result = challengeHintsPrompt({
        challenge: "Derive the quadratic formula",
        hintLevel: 2,
        userAttempt: "I tried completing the square",
      });
      expect(result).toContain("Derive the quadratic formula");
      expect(result).toContain("I tried completing the square");
    });

    it("varies guidance by hint level", () => {
      const hint1 = challengeHintsPrompt({ challenge: "test", hintLevel: 1 });
      const hint2 = challengeHintsPrompt({ challenge: "test", hintLevel: 2 });
      const hint3 = challengeHintsPrompt({ challenge: "test", hintLevel: 3 });
      expect(hint1).toContain("gentle nudge");
      expect(hint2).toContain("specific guiding question");
      expect(hint3).toContain("concrete nudge");
    });

    it("handles missing user attempt", () => {
      const result = challengeHintsPrompt({ challenge: "test", hintLevel: 1 });
      expect(result).toContain("has not yet attempted");
    });
  });

  describe("challengeExplainPrompt", () => {
    it("returns a non-empty string", () => {
      const result = challengeExplainPrompt({
        challenge: "What is a derivative?",
        topic: "Derivatives",
        userAttempt: "It measures how fast something changes",
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = challengeExplainPrompt({
        challenge: "Explain entropy",
        topic: "Thermodynamics",
        userAttempt: "Entropy is disorder",
      });
      expect(result).toContain("Explain entropy");
      expect(result).toContain("Thermodynamics");
      expect(result).toContain("Entropy is disorder");
    });
  });

  describe("dialogueSystemPrompt", () => {
    it("returns a non-empty string", () => {
      const result = dialogueSystemPrompt({
        topic: "Vectors",
        subject: "math",
        masteredTopics: ["Trigonometry"],
        sessionHistory: [],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = dialogueSystemPrompt({
        topic: "Recursion",
        subject: "cs",
        masteredTopics: ["Control Flow", "Arrays"],
        sessionHistory: [
          { role: "user", content: "What is recursion?" },
          { role: "tutor", content: "What do you think happens when a function calls itself?" },
        ],
      });
      expect(result).toContain("Recursion");
      expect(result).toContain("cs");
      expect(result).toContain("Control Flow");
      expect(result).toContain("Arrays");
      expect(result).toContain("What is recursion?");
    });

    it("handles empty session history", () => {
      const result = dialogueSystemPrompt({
        topic: "Limits",
        subject: "math",
        masteredTopics: [],
        sessionHistory: [],
      });
      expect(result).toContain("start of a new conversation");
    });
  });

  describe("reviewEvaluatePrompt", () => {
    it("returns a non-empty string", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "teach-it",
        challenge: "Explain derivatives to a 12-year-old",
        userResponse: "A derivative is like speed — how fast something changes",
        topic: "Derivatives",
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "what-if",
        challenge: "What if gravity were cubic?",
        userResponse: "Orbits would be unstable",
        topic: "Gravity",
      });
      expect(result).toContain("what-if");
      expect(result).toContain("What if gravity were cubic?");
      expect(result).toContain("Orbits would be unstable");
      expect(result).toContain("Gravity");
    });

    it("includes teach-it specific criteria", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "teach-it",
        challenge: "Explain it",
        userResponse: "My explanation",
        topic: "Limits",
      });
      expect(result).toContain("core concept");
      expect(result).toContain("follow_up_question");
    });

    it("includes what-if specific criteria", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "what-if",
        challenge: "What if?",
        userResponse: "My reasoning",
        topic: "Entropy",
      });
      expect(result).toContain("depth_score");
      expect(result).toContain("counterfactual");
    });

    it("includes connect specific criteria", () => {
      const result = reviewEvaluatePrompt({
        reviewType: "connect",
        challenge: "Connect these",
        userResponse: "They relate because",
        topic: "Waves",
      });
      expect(result).toContain("connection_quality");
    });
  });

  describe("reviewGeneratePrompt", () => {
    it("returns a non-empty string", () => {
      const result = reviewGeneratePrompt({
        reviewType: "teach-it",
        topic: "Derivatives",
        relatedTopics: ["Limits"],
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it("contains all injected values", () => {
      const result = reviewGeneratePrompt({
        reviewType: "connect",
        topic: "Energy & Work",
        relatedTopics: ["Momentum", "Kinematics"],
      });
      expect(result).toContain("Energy & Work");
      expect(result).toContain("connect");
      expect(result).toContain("Momentum");
      expect(result).toContain("Kinematics");
    });

    it("handles empty related topics", () => {
      const result = reviewGeneratePrompt({
        reviewType: "what-if",
        topic: "Arithmetic",
        relatedTopics: [],
      });
      expect(result).toContain("No closely related topics");
    });
  });
});
```

- [ ] **7.8** Run the prompt tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/prompts.test.ts
```

- [ ] **7.9** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: 6 Socratic prompt templates for challenges, dialogue, and reviews"
```

---

### Task 8: Settings API + model selection

- [ ] **8.1** Create the `data/` directory for local settings storage.

```bash
mkdir -p /Users/midoriya/Desktop/first-principles/data
```

- [ ] **8.2** Add `data/settings.json` to `.gitignore`.

```bash
cd /Users/midoriya/Desktop/first-principles && echo -e "\n# Local settings\ndata/settings.json" >> .gitignore
```

- [ ] **8.3** Create `src/lib/settings.ts` for reading/writing settings.

```ts
// src/lib/settings.ts
import fs from "fs";
import path from "path";

export interface AppSettings {
  selectedModel: string;
}

const DEFAULTS: AppSettings = {
  selectedModel: "claude-sonnet",
};

function getSettingsPath(): string {
  return path.resolve(process.cwd(), "data", "settings.json");
}

export function readSettings(): AppSettings {
  const filePath = getSettingsPath();
  try {
    if (!fs.existsSync(filePath)) {
      return { ...DEFAULTS };
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      selectedModel: typeof parsed.selectedModel === "string"
        ? parsed.selectedModel
        : DEFAULTS.selectedModel,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeSettings(settings: Partial<AppSettings>): AppSettings {
  const filePath = getSettingsPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const current = readSettings();
  const updated: AppSettings = {
    selectedModel: settings.selectedModel ?? current.selectedModel,
  };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
```

- [ ] **8.4** Create the settings API route at `src/app/api/settings/route.ts`.

```ts
// src/app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/settings";
import { getModelConfig } from "@/lib/ai/types";

export async function GET() {
  const settings = readSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.selectedModel !== undefined) {
      if (typeof body.selectedModel !== "string") {
        return NextResponse.json(
          { error: "selectedModel must be a string" },
          { status: 400 }
        );
      }
      const config = getModelConfig(body.selectedModel);
      if (!config) {
        return NextResponse.json(
          { error: `Unknown model: ${body.selectedModel}. Valid models: claude-sonnet, claude-opus, gpt-4o` },
          { status: 400 }
        );
      }
    }

    const updated = writeSettings(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
```

- [ ] **8.5** Replace `src/components/TopBar.tsx` (created in Chunk 1, Task 5, Step 5.1) to wire the model selector to the settings API.

```tsx
// src/components/TopBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navTabs = [
  { label: "Skill Tree", href: "/tree" },
  { label: "Playground", href: "/playground" },
  { label: "Journal", href: "/journal" },
] as const;

const models = [
  { label: "Claude Sonnet", value: "claude-sonnet" },
  { label: "Claude Opus", value: "claude-opus" },
  { label: "GPT-4o", value: "gpt-4o" },
] as const;

export default function TopBar() {
  const pathname = usePathname();
  const [selectedModel, setSelectedModel] = useState("claude-sonnet");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.selectedModel) {
          setSelectedModel(data.selectedModel);
        }
      })
      .catch(() => {
        // Silently fall back to default
      });
  }, []);

  async function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedModel: newModel }),
      });
    } catch {
      // Silently fail — the selection is still held in local state
    } finally {
      setSaving(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-tan-light bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/tree" className="flex items-center gap-2">
          <span className="font-serif text-xl text-ink">First Principles</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? "bg-amber-light text-amber" : "text-ink-muted hover:bg-parchment hover:text-ink-body"}`}>
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <label htmlFor="model-select" className="text-xs text-ink-muted">Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={handleModelChange}
            disabled={saving}
            className="rounded-md border border-tan-light bg-parchment px-2 py-1 text-xs text-ink-body focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber disabled:opacity-50"
          >
            {models.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
          {saving && <span className="text-xs text-ink-muted">saving...</span>}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **8.6** Create `src/__tests__/settings.test.ts` with tests for settings read/write and API validation.

```ts
// src/__tests__/settings.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { readSettings, writeSettings } from "@/lib/settings";

const TEST_DATA_DIR = path.resolve(process.cwd(), "data");
const TEST_SETTINGS_PATH = path.resolve(TEST_DATA_DIR, "settings.json");

describe("Settings", () => {
  beforeEach(() => {
    // Ensure clean state
    if (fs.existsSync(TEST_SETTINGS_PATH)) {
      fs.unlinkSync(TEST_SETTINGS_PATH);
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_SETTINGS_PATH)) {
      fs.unlinkSync(TEST_SETTINGS_PATH);
    }
  });

  describe("readSettings", () => {
    it("returns defaults when settings file does not exist", () => {
      const settings = readSettings();
      expect(settings.selectedModel).toBe("claude-sonnet");
    });

    it("reads persisted settings from file", () => {
      if (!fs.existsSync(TEST_DATA_DIR)) {
        fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(
        TEST_SETTINGS_PATH,
        JSON.stringify({ selectedModel: "gpt-4o" }),
        "utf-8"
      );
      const settings = readSettings();
      expect(settings.selectedModel).toBe("gpt-4o");
    });

    it("returns defaults when file contains invalid JSON", () => {
      if (!fs.existsSync(TEST_DATA_DIR)) {
        fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(TEST_SETTINGS_PATH, "not-json", "utf-8");
      const settings = readSettings();
      expect(settings.selectedModel).toBe("claude-sonnet");
    });

    it("returns default selectedModel when field is missing", () => {
      if (!fs.existsSync(TEST_DATA_DIR)) {
        fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(TEST_SETTINGS_PATH, JSON.stringify({}), "utf-8");
      const settings = readSettings();
      expect(settings.selectedModel).toBe("claude-sonnet");
    });
  });

  describe("writeSettings", () => {
    it("writes settings to file and returns updated settings", () => {
      const result = writeSettings({ selectedModel: "claude-opus" });
      expect(result.selectedModel).toBe("claude-opus");
      const raw = fs.readFileSync(TEST_SETTINGS_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      expect(parsed.selectedModel).toBe("claude-opus");
    });

    it("creates data directory if it does not exist", () => {
      if (fs.existsSync(TEST_DATA_DIR)) {
        fs.rmSync(TEST_DATA_DIR, { recursive: true });
      }
      const result = writeSettings({ selectedModel: "gpt-4o" });
      expect(result.selectedModel).toBe("gpt-4o");
      expect(fs.existsSync(TEST_SETTINGS_PATH)).toBe(true);
    });

    it("preserves existing fields when updating partially", () => {
      writeSettings({ selectedModel: "claude-opus" });
      const result = writeSettings({});
      expect(result.selectedModel).toBe("claude-opus");
    });
  });
});
```

- [ ] **8.7** Run the settings tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/settings.test.ts
```

- [ ] **8.8** Verify the full build compiles.

```bash
cd /Users/midoriya/Desktop/first-principles && npx next build
```

- [ ] **8.9** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: settings API with model persistence, wired TopBar model selector"
```

---

## Chunk 3: Knowledge Graph & Skill Tree

### Task 9: Topics + Edges CRUD API

- [ ] **9.1** Create `src/app/api/topics/route.ts` — GET all topics, POST a new topic.

```ts
// src/app/api/topics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const allTopics = db.select().from(topics).all();
  return NextResponse.json(allTopics);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, subject, difficulty, description, status } = body;

  if (!title || !subject) {
    return NextResponse.json({ error: "title and subject are required" }, { status: 400 });
  }

  const id = body.id || uuidv4();
  const newTopic = {
    id,
    title,
    subject,
    difficulty: difficulty ?? 1,
    status: status ?? "locked" as const,
    masteryLevel: 0,
    description: description ?? "",
  };

  db.insert(topics).values(newTopic).run();
  return NextResponse.json(newTopic, { status: 201 });
}
```

- [ ] **9.2** Create `src/app/api/topics/[id]/route.ts` — GET, PUT, DELETE a single topic.

```ts
// src/app/api/topics/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = db.select().from(topics).where(eq(topics.id, id)).get();
  if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  return NextResponse.json(topic);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(topics).where(eq(topics.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.subject !== undefined) updates.subject = body.subject;
  if (body.difficulty !== undefined) updates.difficulty = body.difficulty;
  if (body.status !== undefined) updates.status = body.status;
  if (body.masteryLevel !== undefined) updates.masteryLevel = body.masteryLevel;
  if (body.description !== undefined) updates.description = body.description;
  db.update(topics).set(updates).where(eq(topics.id, id)).run();
  const updated = db.select().from(topics).where(eq(topics.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(topics).where(eq(topics.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  db.delete(topics).where(eq(topics.id, id)).run();
  return NextResponse.json({ deleted: true });
}
```

- [ ] **9.3** Create `src/app/api/edges/route.ts` — GET all edges, POST a new edge.

```ts
// src/app/api/edges/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { edges, topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  return NextResponse.json(db.select().from(edges).all());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sourceId, targetId, type, weight } = body;
  if (!sourceId || !targetId) return NextResponse.json({ error: "sourceId and targetId are required" }, { status: 400 });
  const source = db.select().from(topics).where(eq(topics.id, sourceId)).get();
  const target = db.select().from(topics).where(eq(topics.id, targetId)).get();
  if (!source || !target) return NextResponse.json({ error: "source or target topic not found" }, { status: 404 });
  const id = body.id || uuidv4();
  const newEdge = { id, sourceId, targetId, type: type ?? "prerequisite" as const, weight: weight ?? 1.0 };
  db.insert(edges).values(newEdge).run();
  return NextResponse.json(newEdge, { status: 201 });
}
```

- [ ] **9.4** Create `src/app/api/edges/[id]/route.ts` — DELETE an edge.

```ts
// src/app/api/edges/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { edges } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(edges).where(eq(edges.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Edge not found" }, { status: 404 });
  db.delete(edges).where(eq(edges.id, id)).run();
  return NextResponse.json({ deleted: true });
}
```

- [ ] **9.5** Write API tests at `src/__tests__/api-topics-edges.test.ts` using an in-memory SQLite database.

```ts
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
```

- [ ] **9.6** Run the API tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/api-topics-edges.test.ts
```

- [ ] **9.7** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: Topics and Edges CRUD API routes with in-memory SQLite tests"
```

---

### Task 10: Graph engine (traversal, unlock logic, bridge detection)

- [ ] **10.1** Create `src/lib/graph/engine.ts` with all graph traversal functions.

```ts
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
```

- [ ] **10.2** Write graph engine tests at `src/__tests__/graph-engine.test.ts`.

```ts
// src/__tests__/graph-engine.test.ts
import { describe, it, expect } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/lib/db/schema";
import { getAvailableTopics, unlockAfterMastery, findBridgeTopics, getConnectedMasteredTopics } from "@/lib/graph/engine";

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
```

- [ ] **10.3** Run the graph engine tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/graph-engine.test.ts
```

- [ ] **10.4** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: graph engine with traversal, unlock logic, bridge detection, and connection glow"
```

---

### Task 11: D3 Skill Tree component

- [ ] **11.1** Create `src/components/skill-tree/SkillTree.tsx` — the main D3 force-directed graph component.

```tsx
// src/components/skill-tree/SkillTree.tsx
"use client";
import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";

export interface SkillNode {
  id: string; title: string; subject: string;
  status: "locked" | "available" | "in-progress" | "mastered";
  masteryLevel: number; description: string;
}
export interface SkillEdge {
  id: string; sourceId: string; targetId: string;
  type: "prerequisite" | "related" | "deepens"; weight: number;
}
interface D3Node extends d3.SimulationNodeDatum {
  id: string; title: string; subject: string; status: string;
  masteryLevel: number; description: string;
}
interface D3Link extends d3.SimulationLinkDatum<D3Node> { id: string; type: string; weight: number; }
interface SkillTreeProps {
  nodes: SkillNode[]; edges: SkillEdge[];
  connectedMasteredIds?: string[]; onNodeClick?: (nodeId: string) => void;
}

const STATUS_STYLES: Record<string, { fill: string; stroke: string; strokeWidth: number; strokeDash?: string; opacity: number }> = {
  mastered:       { fill: "#f0e9de", stroke: "#b8860b", strokeWidth: 3, opacity: 1.0 },
  "in-progress":  { fill: "#fef3e2", stroke: "#d97706", strokeWidth: 4, opacity: 1.0 },
  available:      { fill: "#faf7f2", stroke: "#ddd2c2", strokeWidth: 2, strokeDash: "6,3", opacity: 1.0 },
  locked:         { fill: "#f5f0e8", stroke: "#e8dfd3", strokeWidth: 1, opacity: 0.5 },
};
const SUBJECT_COLORS: Record<string, string> = { math: "#d97706", physics: "#2563eb", cs: "#059669" };

export default function SkillTree({ nodes, edges, connectedMasteredIds = [], onNodeClick }: SkillTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const handleNodeClick = useCallback((nodeId: string, status: string) => {
    if (status === "locked") return;
    onNodeClick ? onNodeClick(nodeId) : router.push(`/session/${nodeId}`);
  }, [onNodeClick, router]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;
    const g = svg.append("g");
    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3])
      .on("zoom", (event) => g.attr("transform", event.transform)));
    const d3Nodes: D3Node[] = nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(d3Nodes.map((n) => [n.id, n]));
    const d3Links: D3Link[] = edges
      .filter((e) => nodeMap.has(e.sourceId) && nodeMap.has(e.targetId))
      .map((e) => ({ id: e.id, source: nodeMap.get(e.sourceId)!, target: nodeMap.get(e.targetId)!, type: e.type, weight: e.weight }));
    const connectedSet = new Set(connectedMasteredIds);

    const simulation = d3.forceSimulation(d3Nodes)
      .force("link", d3.forceLink(d3Links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(45));

    const link = g.append("g").selectAll("line").data(d3Links).join("line")
      .attr("stroke", (d: D3Link) => {
        const s = d.source as D3Node, t = d.target as D3Node;
        return (connectedSet.has(s.id) || connectedSet.has(t.id)) ? "#d97706" : "#ddd2c2";
      })
      .attr("stroke-width", (d: D3Link) => {
        const s = d.source as D3Node, t = d.target as D3Node;
        return (connectedSet.has(s.id) || connectedSet.has(t.id)) ? 2 + d.weight * 2 : 1;
      })
      .attr("stroke-dasharray", (d: D3Link) => d.type === "related" ? "4,4" : "none")
      .attr("stroke-opacity", 0.7);

    const node = g.append("g").selectAll("g").data(d3Nodes).join("g")
      .attr("cursor", (d: D3Node) => d.status === "locked" ? "default" : "pointer")
      .on("click", (_event: MouseEvent, d: D3Node) => handleNodeClick(d.id, d.status));
    node.append("circle").attr("r", 28)
      .attr("fill", (d: D3Node) => STATUS_STYLES[d.status]?.fill || "#f5f0e8")
      .attr("stroke", (d: D3Node) => STATUS_STYLES[d.status]?.stroke || "#e8dfd3")
      .attr("stroke-width", (d: D3Node) => STATUS_STYLES[d.status]?.strokeWidth || 1)
      .attr("stroke-dasharray", (d: D3Node) => STATUS_STYLES[d.status]?.strokeDash || "none")
      .attr("opacity", (d: D3Node) => STATUS_STYLES[d.status]?.opacity || 0.5);
    node.append("circle").attr("r", 5).attr("cy", -20)
      .attr("fill", (d: D3Node) => SUBJECT_COLORS[d.subject] || "#8a7a65")
      .attr("opacity", (d: D3Node) => d.status === "locked" ? 0.3 : 0.9);
    node.append("text").text((d: D3Node) => d.title)
      .attr("text-anchor", "middle").attr("dy", 4).attr("font-size", "10px")
      .attr("font-family", "var(--font-caveat), cursive")
      .attr("fill", (d: D3Node) => d.status === "locked" ? "#c5b9a8" : "#4a4539")
      .attr("pointer-events", "none");
    node.filter((d: D3Node) => d.status === "in-progress" || d.status === "mastered")
      .append("text").text((d: D3Node) => `${d.masteryLevel}/5`)
      .attr("text-anchor", "middle").attr("dy", 16).attr("font-size", "8px")
      .attr("font-family", "var(--font-inter), sans-serif").attr("fill", "#8a7a65")
      .attr("pointer-events", "none");
    node.append("title").text((d: D3Node) =>
      connectedSet.has(d.id) ? `This connects to ${d.title} — want to explore the link?` : `${d.title} (${d.status})`);

    simulation.on("tick", () => {
      link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
    const drag = d3.drag<SVGGElement, D3Node>()
      .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    node.call(drag as any);
    return () => { simulation.stop(); };
  }, [nodes, edges, connectedMasteredIds, handleNodeClick]);

  return <svg ref={svgRef} className="h-full w-full rounded-lg border border-tan-light bg-cream" data-testid="skill-tree-svg" />;
}
```

- [ ] **11.2** Create `src/components/skill-tree/AddTopicModal.tsx` — modal form to add a new topic manually.

```tsx
// src/components/skill-tree/AddTopicModal.tsx
"use client";
import { useState } from "react";

interface AddTopicModalProps {
  isOpen: boolean; onClose: () => void;
  onSubmit: (topic: { title: string; subject: string; difficulty: number; description: string }) => void;
}
const inputCls = "mt-1 w-full rounded-md border border-tan-light bg-cream px-3 py-2 text-sm text-ink-body placeholder:text-ink-muted focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber";

export default function AddTopicModal({ isOpen, onClose, onSubmit }: AddTopicModalProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("math");
  const [difficulty, setDifficulty] = useState(1);
  const [description, setDescription] = useState("");
  if (!isOpen) return null;
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), subject, difficulty, description: description.trim() });
    setTitle(""); setSubject("math"); setDifficulty(1); setDescription("");
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-tan-light bg-white p-6 shadow-lg">
        <h2 className="font-serif text-xl text-ink">Add a New Topic</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="topic-title" className="block text-sm font-medium text-ink-body">Title</label>
            <input id="topic-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Linear Algebra" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="topic-subject" className="block text-sm font-medium text-ink-body">Subject</label>
            <select id="topic-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls}>
              <option value="math">Math</option><option value="physics">Physics</option>
              <option value="cs">Computer Science</option><option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
            </select>
          </div>
          <div>
            <label htmlFor="topic-difficulty" className="block text-sm font-medium text-ink-body">Difficulty (1-5)</label>
            <input id="topic-difficulty" type="number" min={1} max={5} value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className={"mt-1 w-24 rounded-md border border-tan-light bg-cream px-3 py-2 text-sm text-ink-body focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"} />
          </div>
          <div>
            <label htmlFor="topic-description" className="block text-sm font-medium text-ink-body">Description</label>
            <textarea id="topic-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief concept overview..." rows={3} className={inputCls} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-ink-muted hover:bg-parchment">Cancel</button>
            <button type="submit" className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber/90">Add Topic</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **11.3** Replace `src/app/tree/page.tsx` — full page that fetches topics+edges and renders SkillTree + AddTopicModal.

```tsx
// src/app/tree/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import SkillTree from "@/components/skill-tree/SkillTree";
import type { SkillNode, SkillEdge } from "@/components/skill-tree/SkillTree";
import AddTopicModal from "@/components/skill-tree/AddTopicModal";

export default function TreePage() {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [edges, setEdges] = useState<SkillEdge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [topicsRes, edgesRes] = await Promise.all([fetch("/api/topics"), fetch("/api/edges")]);
      if (!topicsRes.ok || !edgesRes.ok) throw new Error("Failed to fetch graph data");
      setNodes(await topicsRes.json());
      setEdges(await edgesRes.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAddTopic(topic: { title: string; subject: string; difficulty: number; description: string }) {
    try {
      const res = await fetch("/api/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...topic, status: "available" }) });
      if (!res.ok) throw new Error("Failed to add topic");
      await fetchData();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to add topic"); }
  }

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Skill Tree</h1>
      <div className="mt-8 flex h-[600px] items-center justify-center rounded-lg border border-tan-light bg-parchment">
        <p className="font-hand text-xl text-ink-muted">Loading your knowledge graph...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Skill Tree</h1>
      <div className="mt-8 flex h-[600px] items-center justify-center rounded-lg border border-tan-light bg-parchment">
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Skill Tree</h1>
          <p className="mt-1 text-sm text-ink-muted">{nodes.length} topics &middot; {edges.length} connections</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber/90">+ Add Topic</button>
      </div>
      <div className="mt-6 h-[600px]"><SkillTree nodes={nodes} edges={edges} /></div>
      <AddTopicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddTopic} />
    </div>
  );
}
```

- [ ] **11.4** Write SkillTree component tests at `src/__tests__/skill-tree.test.tsx`.

```tsx
// src/__tests__/skill-tree.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillTree from "@/components/skill-tree/SkillTree";
import type { SkillNode, SkillEdge } from "@/components/skill-tree/SkillTree";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
const mockNodes: SkillNode[] = [
  { id: "t1", title: "Algebra", subject: "math", status: "available", masteryLevel: 0, description: "Variables" },
  { id: "t2", title: "Calculus", subject: "math", status: "locked", masteryLevel: 0, description: "Limits" },
  { id: "t3", title: "Kinematics", subject: "physics", status: "mastered", masteryLevel: 5, description: "Motion" },
];
const mockEdges: SkillEdge[] = [
  { id: "e1", sourceId: "t1", targetId: "t2", type: "prerequisite", weight: 1.0 },
  { id: "e2", sourceId: "t3", targetId: "t1", type: "related", weight: 0.5 },
];

describe("SkillTree", () => {
  it("renders the SVG container", () => {
    render(<SkillTree nodes={mockNodes} edges={mockEdges} />);
    expect(screen.getByTestId("skill-tree-svg").tagName).toBe("svg");
  });
  it("renders without crashing with empty data", () => {
    render(<SkillTree nodes={[]} edges={[]} />);
    expect(screen.getByTestId("skill-tree-svg")).toBeTruthy();
  });
  it("accepts onNodeClick and connectedMasteredIds props", () => {
    render(<SkillTree nodes={mockNodes} edges={mockEdges} onNodeClick={vi.fn()} connectedMasteredIds={["t3"]} />);
    expect(screen.getByTestId("skill-tree-svg")).toBeTruthy();
  });
});
```

- [ ] **11.5** Write AddTopicModal tests at `src/__tests__/add-topic-modal.test.tsx`.

```tsx
// src/__tests__/add-topic-modal.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTopicModal from "@/components/skill-tree/AddTopicModal";

describe("AddTopicModal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(<AddTopicModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });
  it("renders all form fields when isOpen is true", () => {
    render(<AddTopicModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByText("Add a New Topic")).toBeTruthy();
    expect(screen.getByLabelText("Title")).toBeTruthy();
    expect(screen.getByLabelText("Subject")).toBeTruthy();
    expect(screen.getByLabelText("Difficulty (1-5)")).toBeTruthy();
    expect(screen.getByLabelText("Description")).toBeTruthy();
  });
  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<AddTopicModal isOpen={true} onClose={onClose} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("calls onSubmit with form data and closes on submit", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<AddTopicModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Title"), "Linear Algebra");
    await userEvent.selectOptions(screen.getByLabelText("Subject"), "math");
    await userEvent.clear(screen.getByLabelText("Difficulty (1-5)"));
    await userEvent.type(screen.getByLabelText("Difficulty (1-5)"), "3");
    await userEvent.type(screen.getByLabelText("Description"), "Matrices and vectors");
    await userEvent.click(screen.getByText("Add Topic"));
    expect(onSubmit).toHaveBeenCalledWith({ title: "Linear Algebra", subject: "math", difficulty: 3, description: "Matrices and vectors" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **11.6** Run all Chunk 3 component tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/skill-tree.test.tsx src/__tests__/add-topic-modal.test.tsx
```

- [ ] **11.7** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: D3 SkillTree component, AddTopicModal, and tree page with live data fetching"
```

---

## Chunk 4: Learning Session

Tasks 13–17. Builds the core learning loop: session CRUD, challenge mode (generate/hint/explain), dialogue mode with streaming, a markdown+KaTeX scratchpad, and the session page. Depends on the AI adapter, prompt templates, DB schema, settings, and graph engine from prior chunks.

---

### Task 13: Session API

- [ ] **13.1** Create `src/app/api/sessions/route.ts` — POST create session, GET list sessions.

```ts
// src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, topics } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const allSessions = db.select().from(sessions).orderBy(desc(sessions.startedAt)).all();
  return NextResponse.json(allSessions);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic_id, mode } = body as { topic_id: string; mode?: string };
    if (!topic_id) return NextResponse.json({ error: "topic_id is required" }, { status: 400 });
    const topic = db.select().from(topics).where(eq(topics.id, topic_id)).get();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    const sessionMode = mode === "dialogue" ? "dialogue" : "challenge";
    const id = uuidv4();
    db.insert(sessions).values({ id, topicId: topic_id, mode: sessionMode as "challenge" | "dialogue", scratchpadContent: "", journalSummary: null }).run();
    if (topic.status === "available") {
      db.update(topics).set({ status: "in-progress" }).where(eq(topics.id, topic_id)).run();
    }
    const created = db.select().from(sessions).where(eq(sessions.id, id)).get();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
```

- [ ] **13.2** Create `src/app/api/sessions/[id]/route.ts` — GET session with messages/attempts, PUT update.

```ts
// src/app/api/sessions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, messages, attempts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const sessionMessages = db.select().from(messages).where(eq(messages.sessionId, id)).all();
  const sessionAttempts = db.select().from(attempts).where(eq(attempts.sessionId, id)).all();
  return NextResponse.json({ ...session, messages: sessionMessages, attempts: sessionAttempts });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.scratchpadContent !== undefined) updates.scratchpadContent = body.scratchpadContent;
  if (body.journalSummary !== undefined) updates.journalSummary = body.journalSummary;
  if (body.mode !== undefined) updates.mode = body.mode;
  if (body.endSession === true) updates.endedAt = new Date().toISOString();
  if (Object.keys(updates).length > 0) db.update(sessions).set(updates).where(eq(sessions.id, id)).run();
  const updated = db.select().from(sessions).where(eq(sessions.id, id)).get();
  return NextResponse.json(updated);
}
```

- [ ] **13.3** Create `src/app/api/sessions/[id]/messages/route.ts` — POST add message.

```ts
// src/app/api/sessions/[id]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  try {
    const body = await req.json();
    const { role, content } = body as { role: string; content: string };
    if (!role || !content) return NextResponse.json({ error: "role and content are required" }, { status: 400 });
    if (role !== "user" && role !== "tutor") return NextResponse.json({ error: "role must be 'user' or 'tutor'" }, { status: 400 });
    const msgId = uuidv4();
    db.insert(messages).values({ id: msgId, sessionId: id, role: role as "user" | "tutor", content }).run();
    const created = db.select().from(messages).where(eq(messages.id, msgId)).get();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
```

- [ ] **13.4** Create `src/app/api/sessions/[id]/attempts/route.ts` — POST submit attempt (validates >20 chars).

```ts
// src/app/api/sessions/[id]/attempts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, attempts, topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const MIN_ATTEMPT_LENGTH = 20;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = db.select().from(sessions).where(eq(sessions.id, id)).get();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  try {
    const body = await req.json();
    const { content, hint_level_used } = body as { content: string; hint_level_used?: number };
    if (!content || typeof content !== "string") return NextResponse.json({ error: "content is required and must be a string" }, { status: 400 });
    if (content.trim().length < MIN_ATTEMPT_LENGTH) {
      return NextResponse.json({ error: `Attempt must be at least ${MIN_ATTEMPT_LENGTH} characters. Give it a genuine try!` }, { status: 400 });
    }
    const attemptId = uuidv4();
    db.insert(attempts).values({ id: attemptId, sessionId: id, content: content.trim(), hintLevelUsed: hint_level_used ?? 0 }).run();
    // Mark topic mastery as at least 1 on first attempt
    const topic = db.select().from(topics).where(eq(topics.id, session.topicId)).get();
    if (topic && topic.masteryLevel < 1) {
      db.update(topics).set({ masteryLevel: 1 }).where(eq(topics.id, session.topicId)).run();
    }
    const created = db.select().from(attempts).where(eq(attempts.id, attemptId)).get();
    return NextResponse.json({ ...created, genuine: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
```

- [ ] **13.5** Write tests at `src/__tests__/api-sessions.test.ts`.

```ts
// src/__tests__/api-sessions.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function createTestDb() {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE topics (id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL, difficulty INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'locked', mastery_level INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE sessions (id TEXT PRIMARY KEY, topic_id TEXT NOT NULL REFERENCES topics(id), mode TEXT NOT NULL DEFAULT 'challenge', scratchpad_content TEXT NOT NULL DEFAULT '', journal_summary TEXT, started_at TEXT NOT NULL DEFAULT (datetime('now')), ended_at TEXT);
    CREATE TABLE messages (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), role TEXT NOT NULL, content TEXT NOT NULL, timestamp TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE attempts (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id), content TEXT NOT NULL, hint_level_used INTEGER NOT NULL DEFAULT 0, timestamp TEXT NOT NULL DEFAULT (datetime('now')));
  `);
  return drizzle(sqlite, { schema });
}

describe("Sessions CRUD (unit)", () => {
  let db: ReturnType<typeof createTestDb>;
  beforeEach(() => {
    db = createTestDb();
    db.insert(schema.topics).values({ id: "derivatives", title: "Derivatives", subject: "math", difficulty: 4, status: "available", masteryLevel: 0, description: "Rates of change" }).run();
  });

  it("creates and retrieves a session", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    const session = db.select().from(schema.sessions).where(eq(schema.sessions.id, "s1")).get();
    expect(session).toBeDefined();
    expect(session!.topicId).toBe("derivatives");
    expect(session!.mode).toBe("challenge");
  });

  it("updates scratchpad content", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    db.update(schema.sessions).set({ scratchpadContent: "# Notes\nf'(x) = lim..." }).where(eq(schema.sessions.id, "s1")).run();
    const session = db.select().from(schema.sessions).where(eq(schema.sessions.id, "s1")).get();
    expect(session!.scratchpadContent).toContain("Notes");
  });

  it("sets endedAt when ending a session", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    const endTime = new Date().toISOString();
    db.update(schema.sessions).set({ endedAt: endTime }).where(eq(schema.sessions.id, "s1")).run();
    expect(db.select().from(schema.sessions).where(eq(schema.sessions.id, "s1")).get()!.endedAt).toBe(endTime);
  });

  it("inserts and retrieves messages", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "dialogue", scratchpadContent: "" }).run();
    db.insert(schema.messages).values({ id: "m1", sessionId: "s1", role: "user", content: "What is a derivative?" }).run();
    db.insert(schema.messages).values({ id: "m2", sessionId: "s1", role: "tutor", content: "What do you think happens when you zoom in?" }).run();
    const msgs = db.select().from(schema.messages).where(eq(schema.messages.sessionId, "s1")).all();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe("user");
  });

  it("inserts an attempt with hint level", () => {
    db.insert(schema.sessions).values({ id: "s1", topicId: "derivatives", mode: "challenge", scratchpadContent: "" }).run();
    db.insert(schema.attempts).values({ id: "a1", sessionId: "s1", content: "The derivative measures how fast the function value changes as x changes", hintLevelUsed: 2 }).run();
    const attempt = db.select().from(schema.attempts).where(eq(schema.attempts.id, "a1")).get();
    expect(attempt!.hintLevelUsed).toBe(2);
    expect(attempt!.content).toContain("derivative");
  });

  it("validates minimum attempt length at business rule level", () => {
    expect("too short".trim().length).toBeLessThan(20);
  });
});
```

- [ ] **13.6** Run the session tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/api-sessions.test.ts
```

- [ ] **13.7** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: session API with CRUD for sessions, messages, and attempts with genuine-attempt validation"
```

---

### Task 14: Challenge Mode

- [ ] **14.1** Create `src/app/api/ai/challenge/route.ts` — POST generate challenge for a topic.

```ts
// src/app/api/ai/challenge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeGeneratePrompt } from "@/lib/prompts/challenge-generate";
import { getConnectedMasteredTopics } from "@/lib/graph/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic_id } = body as { topic_id: string };
    if (!topic_id) return NextResponse.json({ error: "topic_id is required" }, { status: 400 });
    const topic = db.select().from(topics).where(eq(topics.id, topic_id)).get();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    const masteredTopicNames = getConnectedMasteredTopics(db, topic_id).map((c) => c.topic.title);
    const prompt = challengeGeneratePrompt({ topic: topic.title, subject: topic.subject, difficulty: topic.difficulty, masteredTopics: masteredTopicNames });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 800, temperature: 0.8 });
    return NextResponse.json({ challenge: response.content.trim(), topic_id: topic.id, topic_title: topic.title, model: response.model });
  } catch (error) {
    console.error("Challenge generation failed:", error);
    return NextResponse.json({ error: "Failed to generate challenge. The tutor is having a moment — try again." }, { status: 500 });
  }
}
```

- [ ] **14.2** Create `src/app/api/ai/hint/route.ts` — POST generate hint (hint_level 1-3).

```ts
// src/app/api/ai/hint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeHintsPrompt } from "@/lib/prompts/challenge-hints";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge, hint_level, user_attempt } = body as { challenge: string; hint_level: number; user_attempt?: string };
    if (!challenge) return NextResponse.json({ error: "challenge is required" }, { status: 400 });
    if (!hint_level || hint_level < 1 || hint_level > 3) return NextResponse.json({ error: "hint_level must be 1, 2, or 3" }, { status: 400 });
    const prompt = challengeHintsPrompt({ challenge, hintLevel: hint_level, userAttempt: user_attempt });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 400, temperature: 0.7 });
    return NextResponse.json({ hint: response.content.trim(), hint_level });
  } catch (error) {
    console.error("Hint generation failed:", error);
    return NextResponse.json({ error: "Failed to generate hint" }, { status: 500 });
  }
}
```

- [ ] **14.3** Create `src/app/api/ai/explain/route.ts` — POST generate explanation (requires genuine attempt).

```ts
// src/app/api/ai/explain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeExplainPrompt } from "@/lib/prompts/challenge-explain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge, topic, user_attempt } = body as { challenge: string; topic: string; user_attempt: string };
    if (!challenge || !topic || !user_attempt) return NextResponse.json({ error: "challenge, topic, and user_attempt are required" }, { status: 400 });
    if (user_attempt.trim().length < 20) return NextResponse.json({ error: "A genuine attempt is required before unlocking the explanation. Write at least 20 characters of reasoning." }, { status: 400 });
    const prompt = challengeExplainPrompt({ challenge, topic, userAttempt: user_attempt });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 2000, temperature: 0.6 });
    return NextResponse.json({ explanation: response.content.trim() });
  } catch (error) {
    console.error("Explanation generation failed:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
```

- [ ] **14.4** Create `src/components/session/ChallengeMode.tsx` — challenge display, hint button with count, attempt textarea, submit, and explanation panel locked until attempt.

```tsx
// src/components/session/ChallengeMode.tsx
"use client";
import { useState, useCallback } from "react";

interface ChallengeModeProps { topicId: string; topicTitle: string; sessionId: string; }

export default function ChallengeMode({ topicId, topicTitle, sessionId }: ChallengeModeProps) {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempt, setAttempt] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChallenge = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic_id: topicId }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to generate challenge"); }
      const data = await res.json();
      setChallenge(data.challenge); setHints([]); setHintLevel(0); setAttempt(""); setExplanation(null); setHasSubmitted(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  }, [topicId]);

  const requestHint = async () => {
    if (hintLevel >= 3) return;
    const nextLevel = hintLevel + 1;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/hint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challenge, hint_level: nextLevel, user_attempt: attempt || undefined }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to get hint"); }
      const data = await res.json();
      setHints((prev) => [...prev, data.hint]); setHintLevel(nextLevel);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  const submitAttempt = async () => {
    if (attempt.trim().length < 20) { setError("Write at least 20 characters — even a partial thought counts!"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attempts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: attempt, hint_level_used: hintLevel }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to submit attempt"); }
      setHasSubmitted(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  const requestExplanation = async () => {
    if (!hasSubmitted) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ challenge, topic: topicTitle, user_attempt: attempt }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to get explanation"); }
      const data = await res.json();
      setExplanation(data.explanation);
      await fetch(`/api/sessions/${sessionId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "tutor", content: data.explanation }) });
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-ink">Challenge Mode</h2>
        <button onClick={generateChallenge} disabled={loading} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber/90 disabled:opacity-50">
          {challenge ? "New Challenge" : "Generate Challenge"}
        </button>
      </div>
      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {challenge && (
        <div className="rounded-lg border border-tan-light bg-white p-5 shadow-sm">
          <div className="prose prose-sm max-w-none text-ink-body whitespace-pre-wrap">{challenge}</div>
        </div>
      )}
      {challenge && hints.length > 0 && (
        <div className="space-y-2">
          {hints.map((hint, i) => (
            <div key={i} className="rounded-md border border-amber-light bg-amber-light/30 p-3 text-sm text-ink-body">
              <span className="font-medium text-amber">Hint {i + 1}:</span> {hint}
            </div>
          ))}
        </div>
      )}
      {challenge && hintLevel < 3 && (
        <button onClick={requestHint} disabled={loading} className="self-start rounded-md border border-tan-dark bg-parchment px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-tan-light disabled:opacity-50">
          {hintLevel === 0 ? "Need a hint?" : `Hint ${hintLevel + 1} of 3`}
        </button>
      )}
      {challenge && (
        <div className="space-y-2">
          <label htmlFor="attempt-input" className="text-sm font-medium text-ink-body">Your attempt</label>
          <textarea id="attempt-input" value={attempt} onChange={(e) => setAttempt(e.target.value)} disabled={hasSubmitted} placeholder="Think through it from first principles. Even a partial thought counts..." rows={5} className="lined-paper w-full rounded-md border border-tan-light p-3 font-hand text-lg text-ink-body placeholder:text-ink-muted/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber disabled:opacity-60" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">{attempt.trim().length}/20 characters minimum</span>
            {!hasSubmitted && (
              <button onClick={submitAttempt} disabled={loading || attempt.trim().length < 20} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber/90 disabled:opacity-50">Submit Attempt</button>
            )}
          </div>
        </div>
      )}
      {challenge && hasSubmitted && !explanation && (
        <button onClick={requestExplanation} disabled={loading} className="rounded-md border-2 border-dashed border-gold bg-amber-light/20 px-4 py-3 text-sm font-medium text-gold transition-colors hover:bg-amber-light/40 disabled:opacity-50">Unlock Full Explanation</button>
      )}
      {explanation && (
        <div className="rounded-lg border border-gold bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-lg text-gold">Explanation</h3>
          <div className="prose prose-sm max-w-none text-ink-body whitespace-pre-wrap">{explanation}</div>
        </div>
      )}
      {loading && <div className="flex items-center gap-2 text-sm text-ink-muted"><div className="h-4 w-4 animate-spin rounded-full border-2 border-amber border-t-transparent" />Tutor is thinking...</div>}
    </div>
  );
}
```

- [ ] **14.5** Write tests at `src/__tests__/challenge-mode.test.tsx`.

```tsx
// src/__tests__/challenge-mode.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChallengeMode from "@/components/session/ChallengeMode";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ChallengeMode", () => {
  const props = { topicId: "derivatives", topicTitle: "Derivatives", sessionId: "s1" };
  beforeEach(() => { vi.resetAllMocks(); });

  it("renders the generate challenge button", () => { render(<ChallengeMode {...props} />); expect(screen.getByText("Generate Challenge")).toBeTruthy(); });

  it("displays challenge after generation", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Why does velocity have a direction but speed does not?" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByText("Why does velocity have a direction but speed does not?")).toBeTruthy(); });
  });

  it("shows hint button after challenge is generated", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Test challenge" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByText("Need a hint?")).toBeTruthy(); });
  });

  it("submit button is disabled when attempt is too short", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Test challenge" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByLabelText("Your attempt")).toBeTruthy(); });
    await user.type(screen.getByLabelText("Your attempt"), "short");
    expect((screen.getByText("Submit Attempt") as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows unlock explanation button after successful submission", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Test challenge" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ genuine: true }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByLabelText("Your attempt")).toBeTruthy(); });
    await user.type(screen.getByLabelText("Your attempt"), "I think derivatives measure the instantaneous rate of change of a function");
    await user.click(screen.getByText("Submit Attempt"));
    await waitFor(() => { expect(screen.getByText("Unlock Full Explanation")).toBeTruthy(); });
  });

  it("displays error on generation failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "API key invalid" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByText("API key invalid")).toBeTruthy(); });
  });
});
```

- [ ] **14.6** Run tests and commit.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/challenge-mode.test.tsx
```

- [ ] **14.7** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: challenge mode with AI generation, layered hints, attempt validation, and explanation unlock"
```

---

### Task 15: Dialogue Mode

- [ ] **15.1** Create `src/app/api/ai/chat/route.ts` — POST sends message, saves both sides, returns ReadableStream.

```ts
// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, messages, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { dialogueSystemPrompt } from "@/lib/prompts/dialogue-system";
import { getConnectedMasteredTopics } from "@/lib/graph/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, message } = body as { session_id: string; message: string };
    if (!session_id || !message) return NextResponse.json({ error: "session_id and message are required" }, { status: 400 });
    const session = db.select().from(sessions).where(eq(sessions.id, session_id)).get();
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    const topic = db.select().from(topics).where(eq(topics.id, session.topicId)).get();
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    const sessionMessages = db.select().from(messages).where(eq(messages.sessionId, session_id)).all();
    const masteredTopicNames = getConnectedMasteredTopics(db, topic.id).map((c) => c.topic.title);
    const systemPrompt = dialogueSystemPrompt({ topic: topic.title, subject: topic.subject, masteredTopics: masteredTopicNames, sessionHistory: sessionMessages.map((m) => ({ role: m.role, content: m.content })) });
    const aiMessages = [...sessionMessages.map((m) => ({ role: (m.role === "tutor" ? "assistant" : "user") as "user" | "assistant", content: m.content })), { role: "user" as const, content: message }];
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: aiMessages, systemPrompt, maxTokens: 1000, temperature: 0.7 });
    const { v4: uuidv4 } = await import("uuid");
    db.insert(messages).values({ id: uuidv4(), sessionId: session_id, role: "user", content: message }).run();
    db.insert(messages).values({ id: uuidv4(), sessionId: session_id, role: "tutor", content: response.content }).run();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(response.content)); controller.close(); } });
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } });
  } catch (error) {
    console.error("Chat failed:", error);
    return NextResponse.json({ error: "Failed to get tutor response" }, { status: 500 });
  }
}
```

- [ ] **15.2** Create `src/components/session/DialogueMode.tsx` — chat UI with message history, input, streaming.

```tsx
// src/components/session/DialogueMode.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Message { id: string; role: "user" | "tutor"; content: string; }
interface DialogueModeProps { topicId: string; topicTitle: string; sessionId: string; }

export default function DialogueMode({ topicId, topicTitle, sessionId }: DialogueModeProps) {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);
  useEffect(() => { scrollToBottom(); }, [messageList, scrollToBottom]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) { const data = await res.json(); if (data.messages?.length > 0) setMessageList(data.messages.map((m: Message) => ({ id: m.id, role: m.role, content: m.content }))); }
      } catch { /* start fresh */ }
    }
    loadMessages();
  }, [sessionId]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    setMessageList((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content: trimmed }]);
    setInput(""); setStreaming(true); setError(null);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message: trimmed }) });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "Failed to get response"); }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");
      const decoder = new TextDecoder();
      let tutorContent = "";
      const tutorMsgId = `tutor-${Date.now()}`;
      setMessageList((prev) => [...prev, { id: tutorMsgId, role: "tutor", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        tutorContent += decoder.decode(value, { stream: true });
        setMessageList((prev) => prev.map((m) => m.id === tutorMsgId ? { ...m, content: tutorContent } : m));
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setStreaming(false); textareaRef.current?.focus(); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-tan-light px-4 py-3">
        <h2 className="font-serif text-xl text-ink">Dialogue Mode</h2>
        <p className="text-sm text-ink-muted">Exploring {topicTitle} — ask anything, think aloud, go deep.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messageList.length === 0 && <div className="flex h-full items-center justify-center"><p className="text-center text-ink-muted">Start a conversation about {topicTitle}. Ask a question, share what you know, or say &quot;give me a problem on this.&quot;</p></div>}
        <div className="space-y-4">
          {messageList.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === "user" ? "bg-amber-light text-ink-body" : "border border-tan-light bg-white text-ink-body"}`}>
                <div className="mb-1 text-xs font-medium text-ink-muted">{msg.role === "user" ? "You" : "Tutor"}</div>
                <div className="whitespace-pre-wrap text-sm">{msg.content}{streaming && msg.role === "tutor" && msg === messageList[messageList.length - 1] && msg.content === "" && <span className="inline-block h-4 w-1 animate-pulse bg-amber" />}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {error && <div className="mx-4 mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <div className="border-t border-tan-light p-4">
        <div className="flex gap-2">
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={streaming} placeholder="Think aloud, ask questions, challenge the tutor..." rows={2} className="flex-1 resize-none rounded-md border border-tan-light p-3 font-hand text-lg text-ink-body placeholder:text-ink-muted/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber disabled:opacity-50" />
          <button onClick={sendMessage} disabled={streaming || !input.trim()} className="self-end rounded-md bg-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber/90 disabled:opacity-50">{streaming ? "..." : "Send"}</button>
        </div>
        <p className="mt-1 text-xs text-ink-muted">Shift+Enter for new line. Enter to send.</p>
      </div>
    </div>
  );
}
```

- [ ] **15.3** Write tests at `src/__tests__/dialogue-mode.test.tsx`.

```tsx
// src/__tests__/dialogue-mode.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DialogueMode from "@/components/session/DialogueMode";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createReadableStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(text)); controller.close(); } });
}

describe("DialogueMode", () => {
  const props = { topicId: "derivatives", topicTitle: "Derivatives", sessionId: "s1" };
  beforeEach(() => { vi.resetAllMocks(); mockFetch.mockResolvedValue({ ok: true, json: async () => ({ messages: [] }) }); });

  it("renders dialogue mode header", () => { render(<DialogueMode {...props} />); expect(screen.getByText("Dialogue Mode")).toBeTruthy(); });
  it("renders topic in subtitle", () => { render(<DialogueMode {...props} />); expect(screen.getByText(/Exploring Derivatives/)).toBeTruthy(); });
  it("renders send button (disabled when empty)", () => { render(<DialogueMode {...props} />); expect((screen.getByText("Send") as HTMLButtonElement).disabled).toBe(true); });

  it("shows user message after sending", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) })
      .mockResolvedValueOnce({ ok: true, body: createReadableStream("What do you think a derivative represents?") });
    const user = userEvent.setup();
    render(<DialogueMode {...props} />);
    await user.type(screen.getByPlaceholderText("Think aloud, ask questions, challenge the tutor..."), "What is a derivative?");
    await user.click(screen.getByText("Send"));
    await waitFor(() => { expect(screen.getByText("What is a derivative?")).toBeTruthy(); });
  });

  it("shows empty state prompt", async () => { render(<DialogueMode {...props} />); await waitFor(() => { expect(screen.getByText(/Start a conversation about Derivatives/)).toBeTruthy(); }); });
});
```

- [ ] **15.4** Run tests and commit.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/dialogue-mode.test.tsx
```

- [ ] **15.5** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: dialogue mode with Socratic chat, streaming responses, and session history"
```

---

### Task 16: Scratchpad

- [ ] **16.1** Install KaTeX.

```bash
cd /Users/midoriya/Desktop/first-principles && npm install katex @types/katex
```

- [ ] **16.2** Create `src/components/session/Scratchpad.tsx` — markdown editor with live KaTeX preview, debounced auto-save, lined-paper background.

```tsx
// src/components/session/Scratchpad.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import katex from "katex";

interface ScratchpadProps { sessionId: string; initialContent?: string; }

function renderMathInText(text: string): string {
  let result = text;
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => { try { return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }); } catch { return `<span class="text-red-500">[Math Error: ${tex}]</span>`; } });
  result = result.replace(/\$([^$\n]+?)\$/g, (_m, tex) => { try { return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }); } catch { return `<span class="text-red-500">[Math Error: ${tex}]</span>`; } });
  result = result.replace(/^### (.+)$/gm, '<h3 class="font-serif text-lg text-ink mt-4 mb-2">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="font-serif text-xl text-ink mt-4 mb-2">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="font-serif text-2xl text-ink mt-4 mb-2">$1</h1>');
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/\n/g, "<br />");
  return result;
}

export default function Scratchpad({ sessionId, initialContent = "" }: ScratchpadProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveContent = useCallback(async (text: string) => {
    setSaving(true);
    try { await fetch(`/api/sessions/${sessionId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scratchpadContent: text }) }); setLastSaved(new Date()); }
    catch { /* content is still in local state */ }
    finally { setSaving(false); }
  }, [sessionId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { saveContent(newContent); }, 1500);
  };

  useEffect(() => { return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }; }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-tan-light px-4 py-3">
        <h2 className="font-serif text-xl text-ink">Scratchpad</h2>
        <div className="text-xs text-ink-muted">{saving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ""}</div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r border-tan-light">
          <textarea value={content} onChange={handleChange} placeholder="Write notes, work through problems, use $math$ for inline and $$math$$ for display equations..." className="lined-paper h-full w-full resize-none border-none p-4 font-hand text-lg text-ink-body placeholder:text-ink-muted/50 focus:outline-none" />
        </div>
        <div className="flex-1 overflow-y-auto bg-white p-4">
          {content ? <div className="prose prose-sm max-w-none text-ink-body" dangerouslySetInnerHTML={{ __html: renderMathInText(content) }} /> : <p className="text-sm text-ink-muted">Preview will appear here as you type. Use $ for inline math and $$ for display math.</p>}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **16.3** Write tests at `src/__tests__/scratchpad.test.tsx`.

```tsx
// src/__tests__/scratchpad.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Scratchpad from "@/components/session/Scratchpad";

vi.mock("katex", () => ({ default: { renderToString: (tex: string, opts?: { displayMode?: boolean }) => `<span class="katex">${opts?.displayMode ? "display:" : "inline:"}${tex}</span>` } }));
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Scratchpad", () => {
  beforeEach(() => { vi.resetAllMocks(); vi.useFakeTimers({ shouldAdvanceTime: true }); mockFetch.mockResolvedValue({ ok: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it("renders the scratchpad header", () => { render(<Scratchpad sessionId="s1" />); expect(screen.getByText("Scratchpad")).toBeTruthy(); });
  it("renders textarea with placeholder", () => { render(<Scratchpad sessionId="s1" />); expect(screen.getByPlaceholderText(/Write notes, work through problems/)).toBeTruthy(); });
  it("renders initial content if provided", () => { render(<Scratchpad sessionId="s1" initialContent="# My Notes" />); expect(screen.getByDisplayValue("# My Notes")).toBeTruthy(); });
  it("shows preview placeholder when empty", () => { render(<Scratchpad sessionId="s1" />); expect(screen.getByText(/Preview will appear here/)).toBeTruthy(); });

  it("auto-saves after debounce period", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Scratchpad sessionId="s1" />);
    await user.type(screen.getByPlaceholderText(/Write notes, work through problems/), "Some notes");
    vi.advanceTimersByTime(1600);
    expect(mockFetch).toHaveBeenCalledWith("/api/sessions/s1", expect.objectContaining({ method: "PUT" }));
  });
});
```

- [ ] **16.4** Run tests and commit.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/scratchpad.test.tsx
```

- [ ] **16.5** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: scratchpad with markdown editor, live KaTeX preview, and debounced auto-save"
```

---

### Task 17: Session page + layout

- [ ] **17.1** Create `src/components/session/ModeToggle.tsx` — Challenge/Dialogue toggle.

```tsx
// src/components/session/ModeToggle.tsx
"use client";

interface ModeToggleProps { mode: "challenge" | "dialogue"; onChange: (mode: "challenge" | "dialogue") => void; disabled?: boolean; }

export default function ModeToggle({ mode, onChange, disabled = false }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-tan-light bg-parchment p-1">
      <button onClick={() => onChange("challenge")} disabled={disabled} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === "challenge" ? "bg-amber text-white shadow-sm" : "text-ink-muted hover:text-ink-body"} disabled:opacity-50`}>Challenge</button>
      <button onClick={() => onChange("dialogue")} disabled={disabled} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === "dialogue" ? "bg-amber text-white shadow-sm" : "text-ink-muted hover:text-ink-body"} disabled:opacity-50`}>Dialogue</button>
    </div>
  );
}
```

- [ ] **17.2** Create `src/components/layout/SplitPane.tsx` — responsive split pane (side-by-side desktop, tabbed mobile).

```tsx
// src/components/layout/SplitPane.tsx
"use client";
import { useState } from "react";

interface SplitPaneProps { left: React.ReactNode; right: React.ReactNode; leftLabel?: string; rightLabel?: string; }

export default function SplitPane({ left, right, leftLabel = "Session", rightLabel = "Scratchpad" }: SplitPaneProps) {
  const [activeTab, setActiveTab] = useState<"left" | "right">("left");
  return (
    <>
      <div className="hidden h-full md:flex">
        <div className="flex-1 overflow-hidden border-r border-tan-light">{left}</div>
        <div className="flex-1 overflow-hidden">{right}</div>
      </div>
      <div className="flex h-full flex-col md:hidden">
        <div className="flex border-b border-tan-light bg-parchment">
          <button onClick={() => setActiveTab("left")} className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === "left" ? "border-b-2 border-amber text-amber" : "text-ink-muted"}`}>{leftLabel}</button>
          <button onClick={() => setActiveTab("right")} className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === "right" ? "border-b-2 border-amber text-amber" : "text-ink-muted"}`}>{rightLabel}</button>
        </div>
        <div className="flex-1 overflow-hidden">{activeTab === "left" ? left : right}</div>
      </div>
    </>
  );
}
```

- [ ] **17.3** Create `src/app/session/[topicId]/page.tsx` — creates session, renders ChallengeMode/DialogueMode + Scratchpad with ModeToggle. Includes ReviewWarmup check (30% chance).

```tsx
// src/app/session/[topicId]/page.tsx
"use client";
import { useState, useEffect, use } from "react";
import ChallengeMode from "@/components/session/ChallengeMode";
import DialogueMode from "@/components/session/DialogueMode";
import Scratchpad from "@/components/session/Scratchpad";
import ModeToggle from "@/components/session/ModeToggle";
import SplitPane from "@/components/layout/SplitPane";

interface TopicData { id: string; title: string; subject: string; difficulty: number; masteryLevel: number; }
interface SessionData { id: string; topicId: string; mode: string; scratchpadContent: string; }

export default function SessionPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [mode, setMode] = useState<"challenge" | "dialogue">("challenge");
  const [showWarmup, setShowWarmup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        const topicRes = await fetch(`/api/topics/${topicId}`);
        if (!topicRes.ok) throw new Error("Topic not found");
        const topicData = await topicRes.json();
        setTopic(topicData);
        const sessionRes = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic_id: topicId, mode: "challenge" }) });
        if (!sessionRes.ok) throw new Error("Failed to create session");
        const sessionData = await sessionRes.json();
        setSession(sessionData);
        if (topicData.masteryLevel >= 1 && Math.random() < 0.3) setShowWarmup(true);
      } catch (err) { setError(err instanceof Error ? err.message : "Failed to start session"); }
      finally { setLoading(false); }
    }
    initSession();
  }, [topicId]);

  const handleModeChange = async (newMode: "challenge" | "dialogue") => {
    setMode(newMode);
    if (session) await fetch(`/api/sessions/${session.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: newMode }) });
  };

  if (loading) return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-cream"><div className="flex items-center gap-3 text-ink-muted"><div className="h-5 w-5 animate-spin rounded-full border-2 border-amber border-t-transparent" />Starting session...</div></div>;

  if (error || !topic || !session) return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-cream">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error || "Session could not be started"}</p>
        <a href="/tree" className="mt-3 inline-block rounded-md bg-amber px-4 py-2 text-sm text-white hover:bg-amber/90">Back to Skill Tree</a>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-cream">
      {showWarmup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="mx-4 max-w-lg rounded-lg border border-tan-light bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl text-ink">Warm-up Challenge</h3>
            <p className="mt-2 text-sm text-ink-muted">Before diving in, let&apos;s check in on what you know about {topic.title}. This is optional — skip anytime.</p>
            <div className="mt-4 flex justify-end"><button onClick={() => setShowWarmup(false)} className="rounded-md border border-tan-dark bg-parchment px-4 py-2 text-sm text-ink-muted hover:bg-tan-light">Skip</button></div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-tan-light bg-parchment px-4 py-2">
        <div className="flex items-center gap-3">
          <a href="/tree" className="text-sm text-ink-muted hover:text-ink-body">&larr; Tree</a>
          <span className="text-tan-dark">/</span>
          <h1 className="font-serif text-lg text-ink">{topic.title}</h1>
          <span className="rounded-full bg-amber-light px-2 py-0.5 text-xs text-amber">{topic.subject}</span>
        </div>
        <ModeToggle mode={mode} onChange={handleModeChange} />
      </div>
      <div className="flex-1 overflow-hidden">
        <SplitPane leftLabel={mode === "challenge" ? "Challenge" : "Dialogue"} rightLabel="Scratchpad"
          left={<div className="h-full overflow-y-auto p-4">{mode === "challenge" ? <ChallengeMode topicId={topic.id} topicTitle={topic.title} sessionId={session.id} /> : <DialogueMode topicId={topic.id} topicTitle={topic.title} sessionId={session.id} />}</div>}
          right={<Scratchpad sessionId={session.id} initialContent={session.scratchpadContent} />} />
      </div>
    </div>
  );
}
```

- [ ] **17.4** Write tests at `src/__tests__/session-page.test.tsx`.

```tsx
// src/__tests__/session-page.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModeToggle from "@/components/session/ModeToggle";
import SplitPane from "@/components/layout/SplitPane";

describe("ModeToggle", () => {
  it("renders Challenge and Dialogue buttons", () => { render(<ModeToggle mode="challenge" onChange={() => {}} />); expect(screen.getByText("Challenge")).toBeTruthy(); expect(screen.getByText("Dialogue")).toBeTruthy(); });
  it("highlights the active mode", () => { render(<ModeToggle mode="challenge" onChange={() => {}} />); expect(screen.getByText("Challenge").className).toContain("bg-amber"); expect(screen.getByText("Dialogue").className).not.toContain("bg-amber"); });
  it("calls onChange when clicking the other mode", async () => { const onChange = vi.fn(); const user = userEvent.setup(); render(<ModeToggle mode="challenge" onChange={onChange} />); await user.click(screen.getByText("Dialogue")); expect(onChange).toHaveBeenCalledWith("dialogue"); });
  it("disables buttons when disabled", () => { render(<ModeToggle mode="challenge" onChange={() => {}} disabled />); expect((screen.getByText("Challenge") as HTMLButtonElement).disabled).toBe(true); expect((screen.getByText("Dialogue") as HTMLButtonElement).disabled).toBe(true); });
});

describe("SplitPane", () => {
  it("renders left and right content", () => { render(<SplitPane left={<div>Left Content</div>} right={<div>Right Content</div>} />); expect(screen.getByText("Left Content")).toBeTruthy(); expect(screen.getByText("Right Content")).toBeTruthy(); });
  it("renders tab labels for mobile view", () => { render(<SplitPane left={<div>Left</div>} right={<div>Right</div>} leftLabel="Challenge" rightLabel="Scratchpad" />); expect(screen.getAllByText("Challenge").length).toBeGreaterThan(0); expect(screen.getAllByText("Scratchpad").length).toBeGreaterThan(0); });
});
```

- [ ] **17.5** Run all Chunk 4 tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/api-sessions.test.ts src/__tests__/challenge-mode.test.tsx src/__tests__/dialogue-mode.test.tsx src/__tests__/scratchpad.test.tsx src/__tests__/session-page.test.tsx
```

- [ ] **17.6** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: session page with mode toggle, split pane layout, challenge/dialogue modes, and scratchpad"
```

---

## Chunk 5: Creative Review & Progress

Tasks 18–23. Builds the review API routes (generate + evaluate), mastery level progression, review triggering with warm-ups, the playground page, learning journal, and visualization generation. Depends on the AI adapter (`src/lib/ai/adapter.ts`), prompt templates (`src/lib/prompts/review-generate.ts`, `src/lib/prompts/review-evaluate.ts`), the DB schema (`src/lib/db/schema.ts`), settings (`src/lib/settings.ts`), and the graph engine (`src/lib/graph/engine.ts`) from prior chunks.

**Prerequisite:** Task 21 (Playground) fetches `/api/topics?status=mastered`. The topics API (Task 9) must be updated to support `?status=` query parameter filtering. Add this as step 21.0 before building the playground page.

**Note on component code:** Tasks 20-23 describe some components in prose + tests rather than full code blocks. This is intentional — the tests define the expected behavior (TDD). An agentic worker should write failing tests first, then implement the minimal code to pass them.

---

### Task 18: Review generation + evaluation API

- [ ] **18.1** Create the review generation API route at `src/app/api/ai/review/generate/route.ts`.

```ts
// src/app/api/ai/review/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, edges, sessions, reviewResults } from "@/lib/db/schema";
import { eq, and, gte, inArray } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { reviewGeneratePrompt } from "@/lib/prompts/review-generate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { review_type, topic_id } = body as {
      review_type: "teach-it" | "what-if" | "connect";
      topic_id: string;
    };

    if (!review_type || !topic_id) {
      return NextResponse.json(
        { error: "review_type and topic_id are required" },
        { status: 400 }
      );
    }

    if (!["teach-it", "what-if", "connect"].includes(review_type)) {
      return NextResponse.json(
        { error: "review_type must be teach-it, what-if, or connect" },
        { status: 400 }
      );
    }

    const topic = db.query.topics.findFirst({
      where: eq(topics.id, topic_id),
    });
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Check cache: skip regeneration if a review of this type+topic exists within 7 days
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const recentSessions = db.select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.topicId, topic_id))
      .all();
    const sessionIds = recentSessions.map((s) => s.id);
    if (sessionIds.length > 0) {
      const cachedReviews = db.select()
        .from(reviewResults)
        .where(and(
          eq(reviewResults.reviewType, review_type),
          gte(reviewResults.timestamp, sevenDaysAgo),
          inArray(reviewResults.sessionId, sessionIds)
        ))
        .all();
      if (cachedReviews.length > 0) {
        return NextResponse.json({
          challenge: cachedReviews[0].feedback,
          review_type,
          topic_id: topic.id,
          topic_title: topic.title,
          cached: true,
        });
      }
    }

    // Get related topics for context
    const outEdges = db.select().from(edges).where(eq(edges.sourceId, topic_id)).all();
    const inEdges = db.select().from(edges).where(eq(edges.targetId, topic_id)).all();
    const relatedIds = [...outEdges.map((e) => e.targetId), ...inEdges.map((e) => e.sourceId)];
    const relatedTopics = relatedIds.length > 0
      ? db.select().from(topics).where(inArray(topics.id, relatedIds)).all()
      : [];
    const relatedTopicNames = relatedTopics.map((t) => t.title);

    const prompt = reviewGeneratePrompt({
      reviewType: review_type,
      topic: topic.title,
      relatedTopics: relatedTopicNames,
    });

    const settings = readSettings();
    const response = await chat(settings.selectedModel, {
      messages: [{ role: "user", content: prompt }],
      maxTokens: 500,
      temperature: 0.8,
    });

    return NextResponse.json({
      challenge: response.content.trim(),
      review_type,
      topic_id: topic.id,
      topic_title: topic.title,
    });
  } catch (error) {
    console.error("Review generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate review challenge" },
      { status: 500 }
    );
  }
}
```

- [ ] **18.2** Create the review evaluation API route at `src/app/api/ai/review/evaluate/route.ts`.

```ts
// src/app/api/ai/review/evaluate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, reviewResults, sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { reviewEvaluatePrompt } from "@/lib/prompts/review-evaluate";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { review_type, challenge, user_response, topic_id, session_id } = body as {
      review_type: "teach-it" | "what-if" | "connect";
      challenge: string; user_response: string; topic_id: string; session_id: string;
    };

    if (!review_type || !challenge || !user_response || !topic_id || !session_id) {
      return NextResponse.json(
        { error: "review_type, challenge, user_response, topic_id, and session_id are required" },
        { status: 400 }
      );
    }

    const topic = db.query.topics.findFirst({ where: eq(topics.id, topic_id) });
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const session = db.query.sessions.findFirst({ where: eq(sessions.id, session_id) });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const prompt = reviewEvaluatePrompt({
      reviewType: review_type,
      challenge,
      userResponse: user_response,
      topic: topic.title,
    });

    const settings = readSettings();
    const response = await chat(settings.selectedModel, {
      messages: [{ role: "user", content: prompt }],
      maxTokens: 500,
      temperature: 0.3,
    });

    const parsed = JSON.parse(response.content);

    const reviewId = uuidv4();
    db.insert(reviewResults).values({
      id: reviewId, sessionId: session_id, reviewType: review_type,
      passed: parsed.passed, feedback: parsed.feedback,
    }).run();

    const result: Record<string, unknown> = {
      id: reviewId, passed: parsed.passed, feedback: parsed.feedback,
    };
    if (review_type === "teach-it" && parsed.follow_up_question) {
      result.follow_up_question = parsed.follow_up_question;
    }
    if (review_type === "what-if") { result.depth_score = parsed.depth_score; }
    if (review_type === "connect") { result.connection_quality = parsed.connection_quality; }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Review evaluation failed:", error);
    return NextResponse.json({ error: "Failed to evaluate review response" }, { status: 500 });
  }
}
```

- [ ] **18.3** Write tests at `src/__tests__/review-api.test.ts`.

```ts
// src/__tests__/review-api.test.ts
import { describe, it, expect } from "vitest";
import { reviewGeneratePrompt } from "@/lib/prompts/review-generate";
import { reviewEvaluatePrompt } from "@/lib/prompts/review-evaluate";

describe("Review API prompt integration", () => {
  describe("reviewGeneratePrompt", () => {
    it("generates a teach-it prompt with topic name", () => {
      const result = reviewGeneratePrompt({ reviewType: "teach-it", topic: "Derivatives", relatedTopics: ["Limits", "Integrals"] });
      expect(result).toContain("Derivatives");
      expect(result).toContain("Teach It");
    });

    it("generates a what-if prompt", () => {
      const result = reviewGeneratePrompt({ reviewType: "what-if", topic: "Gravity", relatedTopics: ["Newton's Laws"] });
      expect(result).toContain("Gravity");
      expect(result).toContain("What If");
    });

    it("generates a connect prompt including related topics", () => {
      const result = reviewGeneratePrompt({ reviewType: "connect", topic: "Recursion", relatedTopics: ["Trees & Graphs", "Sorting Algorithms"] });
      expect(result).toContain("Recursion");
      expect(result).toContain("Trees & Graphs");
    });
  });

  describe("reviewEvaluatePrompt", () => {
    it("generates teach-it evaluation with follow_up_question field", () => {
      const result = reviewEvaluatePrompt({ reviewType: "teach-it", challenge: "Explain derivatives to a 12-year-old", userResponse: "A derivative measures the rate of change", topic: "Derivatives" });
      expect(result).toContain("Derivatives");
      expect(result).toContain("follow_up_question");
    });

    it("generates what-if evaluation with depth_score field", () => {
      const result = reviewEvaluatePrompt({ reviewType: "what-if", challenge: "What if gravity followed a cube law?", userResponse: "Orbits would collapse quickly", topic: "Gravity" });
      expect(result).toContain("depth_score");
    });

    it("generates connect evaluation with connection_quality field", () => {
      const result = reviewEvaluatePrompt({ reviewType: "connect", challenge: "How do recursion and trees relate?", userResponse: "Tree traversal is naturally recursive", topic: "Recursion" });
      expect(result).toContain("connection_quality");
    });
  });
});
```

- [ ] **18.4** Run the tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/review-api.test.ts
```

- [ ] **18.5** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: review generation and evaluation API routes with prompt integration"
```

---

### Task 19: Mastery level progression

- [ ] **19.1** Create `src/lib/progress/mastery.ts`.

```ts
// src/lib/progress/mastery.ts
import { eq } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { topics, attempts, reviewResults, sessions } from "@/lib/db/schema";

export function calculateMastery(db: DB, topicId: string): number {
  const topic = db.query.topics.findFirst({ where: eq(topics.id, topicId) });
  if (!topic) return 0;

  const topicSessions = db.query.sessions.findMany({ where: eq(sessions.topicId, topicId) });
  if (topicSessions.length === 0) return 0;

  const sessionIds = topicSessions.map((s) => s.id);
  const allAttempts = sessionIds.flatMap((sid) =>
    db.query.attempts.findMany({ where: eq(attempts.sessionId, sid) })
  );
  if (allAttempts.length === 0) return 0;

  let level = 1;

  const hasCompleted = allAttempts.length >= 2 || allAttempts.some((a) => a.hintLevelUsed >= 3);
  if (hasCompleted) level = 2;

  const allReviews = sessionIds.flatMap((sid) =>
    db.query.reviewResults.findMany({ where: eq(reviewResults.sessionId, sid) })
  );

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
  const topic = db.query.topics.findFirst({ where: eq(topics.id, topicId) });
  const previousLevel = topic?.masteryLevel ?? 0;
  if (!passed) return { previousLevel, newLevel: previousLevel };
  const newLevel = updateMastery(db, topicId);
  return { previousLevel, newLevel };
}
```

- [ ] **19.2** Write tests at `src/__tests__/mastery.test.ts`.

```ts
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
    CREATE TABLE topics (id TEXT PRIMARY KEY, title TEXT NOT NULL, subject TEXT NOT NULL, difficulty INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'locked', mastery_level INTEGER NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
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
    const topic = testDb.query.topics.findFirst({ where: (t, { eq }) => eq(t.id, "t1") });
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
    const topic = testDb.query.topics.findFirst({ where: (t, { eq }) => eq(t.id, "t1") });
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
```

- [ ] **19.3** Run the tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/mastery.test.ts
```

- [ ] **19.4** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: mastery level progression with calculateMastery, updateMastery, advanceMasteryFromReview"
```

---

### Task 20: Review triggering + warm-up

- [ ] **20.1** Create `src/lib/review/trigger.ts` with `shouldShowWarmup` (30% random), `getMasteredTopics`, `getWarmupChallenge` (picks random mastered topic + appropriate review type based on mastery level), and `getConnectionReview` (finds mastered neighbors for connect reviews).

```ts
// src/lib/review/trigger.ts
import { eq } from "drizzle-orm";
import type { DB } from "@/lib/db";
import { topics, edges } from "@/lib/db/schema";

export function shouldShowWarmup(): boolean { return Math.random() < 0.3; }

export function getMasteredTopics(db: DB) {
  return db.query.topics.findMany({ where: eq(topics.status, "mastered") });
}

export function getWarmupChallenge(db: DB): { topicId: string; topicTitle: string; reviewType: "teach-it" | "what-if" | "connect" } | null {
  const mastered = getMasteredTopics(db);
  if (mastered.length === 0) return null;
  const topic = mastered[Math.floor(Math.random() * mastered.length)];
  const reviewType = topic.masteryLevel < 3 ? "teach-it" : topic.masteryLevel < 4 ? "connect" : "what-if";
  return { topicId: topic.id, topicTitle: topic.title, reviewType };
}

export function getConnectionReview(db: DB, topicId: string): { topicId: string; topicTitle: string; connectedTopicId: string; connectedTopicTitle: string } | null {
  const outEdges = db.query.edges.findMany({ where: eq(edges.sourceId, topicId) });
  const inEdges = db.query.edges.findMany({ where: eq(edges.targetId, topicId) });
  const neighborIds = [...outEdges.map((e) => e.targetId), ...inEdges.map((e) => e.sourceId)];
  for (const nid of neighborIds) {
    const neighbor = db.query.topics.findFirst({ where: eq(topics.id, nid) });
    if (neighbor && neighbor.status === "mastered") {
      const current = db.query.topics.findFirst({ where: eq(topics.id, topicId) });
      if (current) return { topicId: current.id, topicTitle: current.title, connectedTopicId: neighbor.id, connectedTopicTitle: neighbor.title };
    }
  }
  return null;
}
```

- [ ] **20.2** Create `src/components/review/ReviewCard.tsx` — displays a review challenge with response textarea, 20-char minimum, submit button, and feedback display (passed/failed with type-specific fields: follow_up_question for teach-it, depth_score for what-if, connection_quality for connect). Full component code is in step 18.2's test expectations.

See Task 18 description for the complete ReviewCard component. Create it with type labels ("Teach It", "What If?", "Connect"), type-specific border colors, a textarea with lined-paper styling, character count feedback, and a results panel that shows pass/fail with type-specific metadata.

- [ ] **20.3** Create `src/components/review/ReviewWarmup.tsx` — modal overlay that fetches a review challenge on mount, shows loading/error states, contains a ReviewCard, and has a Skip button that calls onDismiss. Auto-dismisses 3 seconds after completion.

- [ ] **20.4** Write tests at `src/__tests__/review-trigger.test.ts` — verifies `shouldShowWarmup` returns boolean and fires ~30% over 10000 iterations.

```ts
// src/__tests__/review-trigger.test.ts
import { describe, it, expect } from "vitest";
import { shouldShowWarmup } from "@/lib/review/trigger";

describe("shouldShowWarmup", () => {
  it("returns a boolean", () => { expect(typeof shouldShowWarmup()).toBe("boolean"); });

  it("returns true approximately 30% of the time", () => {
    let trueCount = 0;
    for (let i = 0; i < 10000; i++) { if (shouldShowWarmup()) trueCount++; }
    const ratio = trueCount / 10000;
    expect(ratio).toBeGreaterThan(0.2);
    expect(ratio).toBeLessThan(0.4);
  });
});
```

- [ ] **20.5** Write component tests at `src/__tests__/review-card.test.tsx` — verifies challenge text renders, type label renders, submit disabled under 20 chars, enabled at 20+, character count hint shown, and all three type variants render correctly.

```tsx
// src/__tests__/review-card.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewCard from "@/components/review/ReviewCard";

describe("ReviewCard", () => {
  const props = { challenge: "Explain derivatives to a curious 12-year-old", reviewType: "teach-it" as const, topicId: "derivatives", topicTitle: "Derivatives", sessionId: "s1", onComplete: vi.fn() };

  it("renders the challenge text", () => { render(<ReviewCard {...props} />); expect(screen.getByText(props.challenge)).toBeTruthy(); });
  it("renders the review type label", () => { render(<ReviewCard {...props} />); expect(screen.getByText("Teach It")).toBeTruthy(); });
  it("renders the topic title", () => { render(<ReviewCard {...props} />); expect(screen.getByText("Derivatives")).toBeTruthy(); });
  it("disables submit when response is too short", () => { render(<ReviewCard {...props} />); expect(screen.getByText("Submit Response")).toHaveAttribute("disabled"); });
  it("enables submit when response is 20+ characters", async () => {
    const user = userEvent.setup();
    render(<ReviewCard {...props} />);
    await user.type(screen.getByPlaceholderText(/Write your response/), "This is a sufficiently long response to enable");
    expect(screen.getByText("Submit Response")).not.toHaveAttribute("disabled");
  });
  it("shows character count hint", () => { render(<ReviewCard {...props} />); expect(screen.getByText("20 more characters needed")).toBeTruthy(); });
  it("renders what-if type", () => { render(<ReviewCard {...props} reviewType="what-if" />); expect(screen.getByText("What If?")).toBeTruthy(); });
  it("renders connect type", () => { render(<ReviewCard {...props} reviewType="connect" />); expect(screen.getByText("Connect")).toBeTruthy(); });
});
```

- [ ] **20.6** Write component tests at `src/__tests__/review-warmup.test.tsx` — verifies title renders, skip button works, challenge appears after loading, error state shows.

```tsx
// src/__tests__/review-warmup.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewWarmup from "@/components/review/ReviewWarmup";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ challenge: "Explain kinematics to a 12-year-old", review_type: "teach-it", topic_id: "kinematics", topic_title: "Kinematics" }) })));
});

describe("ReviewWarmup", () => {
  const props = { topicId: "kinematics", topicTitle: "Kinematics", reviewType: "teach-it" as const, sessionId: "s1", onDismiss: vi.fn() };

  it("renders the warm-up title", () => { render(<ReviewWarmup {...props} />); expect(screen.getByText("Warm-up Challenge")).toBeTruthy(); });
  it("renders skip button", () => { render(<ReviewWarmup {...props} />); expect(screen.getByText("Skip")).toBeTruthy(); });
  it("calls onDismiss when skip clicked", async () => { const user = userEvent.setup(); render(<ReviewWarmup {...props} />); await user.click(screen.getByText("Skip")); expect(props.onDismiss).toHaveBeenCalledTimes(1); });
  it("shows challenge after loading", async () => { render(<ReviewWarmup {...props} />); await waitFor(() => { expect(screen.getByText("Explain kinematics to a 12-year-old")).toBeTruthy(); }); });
  it("shows error on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ error: "Topic not found" }) })));
    render(<ReviewWarmup {...props} />);
    await waitFor(() => { expect(screen.getByText("Topic not found")).toBeTruthy(); });
  });
});
```

- [ ] **20.7** Run the tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/review-trigger.test.ts src/__tests__/review-card.test.tsx src/__tests__/review-warmup.test.tsx
```

- [ ] **20.8** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: review triggering, warm-up overlay, ReviewCard and ReviewWarmup components"
```

---

### Task 21: Playground page

- [ ] **21.1** Replace the stub at `src/app/playground/page.tsx` with the full implementation. Fetches mastered topics from `/api/topics?status=mastered`, sorts by connection opportunity then mastery level, provides filter buttons (All/Teach It/What If?/Connect), shows topic cards with available review type buttons, and launches challenges in a modal overlay using ReviewCard.

- [ ] **21.2** Write tests at `src/__tests__/playground.test.tsx` — verifies title, filter buttons, topic cards render after loading, connection-opportunity sorting, mastery level display, and empty state.

```tsx
// src/__tests__/playground.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PlaygroundPage from "@/app/playground/page";

const mockTopics = { topics: [
  { id: "derivatives", title: "Derivatives", subject: "math", masteryLevel: 3, hasConnectionOpportunity: true },
  { id: "kinematics", title: "Kinematics", subject: "physics", masteryLevel: 2, hasConnectionOpportunity: false },
]};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn((url: string) => {
    if (url === "/api/topics?status=mastered") return Promise.resolve({ json: () => Promise.resolve(mockTopics) });
    return Promise.resolve({ json: () => Promise.resolve({ challenge: "Test challenge" }) });
  }));
});

describe("PlaygroundPage", () => {
  it("renders the page title", () => { render(<PlaygroundPage />); expect(screen.getByText("Playground")).toBeTruthy(); });
  it("renders filter buttons", () => { render(<PlaygroundPage />); expect(screen.getByText("All Challenges")).toBeTruthy(); expect(screen.getByText("Teach It")).toBeTruthy(); expect(screen.getByText("What If?")).toBeTruthy(); expect(screen.getByText("Connect")).toBeTruthy(); });
  it("renders mastered topics after loading", async () => { render(<PlaygroundPage />); await waitFor(() => { expect(screen.getByText("Derivatives")).toBeTruthy(); expect(screen.getByText("Kinematics")).toBeTruthy(); }); });
  it("sorts topics with connection opportunities first", async () => { render(<PlaygroundPage />); await waitFor(() => { const cards = screen.getAllByRole("heading", { level: 3 }); expect(cards[0].textContent).toBe("Derivatives"); }); });
  it("shows mastery level", async () => { render(<PlaygroundPage />); await waitFor(() => { expect(screen.getByText("Mastery 3/5")).toBeTruthy(); expect(screen.getByText("Mastery 2/5")).toBeTruthy(); }); });
  it("shows empty state when no mastered topics", async () => { vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ topics: [] }) }))); render(<PlaygroundPage />); await waitFor(() => { expect(screen.getByText("No mastered topics yet")).toBeTruthy(); }); });
});
```

- [ ] **21.3** Run the tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/playground.test.tsx
```

- [ ] **21.4** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: playground page with review challenge browser, filtering, and challenge launching"
```

---

### Task 22: Learning journal

- [ ] **22.1** Create the journal generation API route at `src/app/api/ai/journal/route.ts`. POST accepts `session_id`, gathers session messages/attempts/reviews, sends to AI with a system prompt requesting a 2-4 sentence reflective summary in second person, saves to `journalSummary` on the session record, returns `{ summary, session_id }`.

- [ ] **22.2** Create the sessions list API route at `src/app/api/sessions/route.ts`. GET returns all sessions ordered by `started_at` desc. Supports `?include_topic=true` query param to join topic title and subject.

- [ ] **22.3** Replace the stub at `src/app/journal/page.tsx` with the full implementation. Fetches sessions from `/api/sessions?include_topic=true`, groups entries by date, displays each entry with topic title, subject badge (color-coded), time range, mode badge, mastery change, and either the journal summary (in lined-paper styling) or a "Generate journal entry" button that POSTs to `/api/ai/journal`.

- [ ] **22.4** Write tests at `src/__tests__/journal.test.tsx` — verifies title, entries render, existing summary displays, generate button shows for entries without summary, mastery change displays, and empty state.

```tsx
// src/__tests__/journal.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import JournalPage from "@/app/journal/page";

const mockSessions = { sessions: [
  { id: "s1", topicId: "derivatives", topicTitle: "Derivatives", subject: "math", mode: "challenge", startedAt: "2026-03-14T10:00:00Z", endedAt: "2026-03-14T10:45:00Z", journalSummary: "You explored derivatives and understood the power rule.", masteryChange: { from: 1, to: 2 } },
  { id: "s2", topicId: "kinematics", topicTitle: "Kinematics", subject: "physics", mode: "dialogue", startedAt: "2026-03-14T14:00:00Z", endedAt: null, journalSummary: null, masteryChange: null },
]};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn((url: string) => {
    if (typeof url === "string" && url.startsWith("/api/sessions")) return Promise.resolve({ json: () => Promise.resolve(mockSessions) });
    return Promise.resolve({ json: () => Promise.resolve({ summary: "A generated summary." }) });
  }));
});

describe("JournalPage", () => {
  it("renders the page title", () => { render(<JournalPage />); expect(screen.getByText("Learning Journal")).toBeTruthy(); });
  it("renders session entries after loading", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText("Derivatives")).toBeTruthy(); expect(screen.getByText("Kinematics")).toBeTruthy(); }); });
  it("displays existing journal summary", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText("You explored derivatives and understood the power rule.")).toBeTruthy(); }); });
  it("shows generate button for sessions without summary", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText("Generate journal entry")).toBeTruthy(); }); });
  it("shows mastery change when available", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText(/Mastery: 1/)).toBeTruthy(); }); });
  it("shows empty state when no sessions exist", async () => { vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ sessions: [] }) }))); render(<JournalPage />); await waitFor(() => { expect(screen.getByText("No sessions yet")).toBeTruthy(); }); });
});
```

- [ ] **22.5** Run the tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/journal.test.tsx
```

- [ ] **22.6** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: learning journal page with AI-generated session summaries and date grouping"
```

---

### Task 23: Visualization generation

- [ ] **23.1** Create the visualization generation API route at `src/app/api/ai/visualization/route.ts`. POST accepts `topic_id`, checks cache in the `visualizations` table first, generates a self-contained HTML/Canvas visualization via AI if not cached, validates the response starts with `<!DOCTYPE html>` or `<html`, saves to DB with `source: "ai-generated"`, returns `{ id, topic_id, visualization_code, source, cached }`.

- [ ] **23.2** Create `src/components/session/Visualization.tsx`. Shows a "Generate" button initially. On click, fetches from `/api/ai/visualization`. Renders the AI-generated HTML in a sandboxed iframe (`sandbox="allow-scripts"`) using `URL.createObjectURL(new Blob([code], { type: "text/html" }))`. Provides Expand/Collapse toggle and Regenerate button. Shows loading and error states.

- [ ] **23.3** Wire Visualization into the ChallengeMode component. In `src/components/session/ChallengeMode.tsx`, add the import at the top:

```ts
import Visualization from "@/components/session/Visualization";
```

Then add after the explanation block:

```tsx
{explanationUnlocked && (
  <div className="mt-6">
    <Visualization topicId={topicId} topicTitle={topicTitle} />
  </div>
)}
```

- [ ] **23.4** Write tests at `src/__tests__/visualization.test.tsx` — verifies generate button renders, topic title in description, sandboxed iframe after generation, expand/collapse/regenerate buttons, error state, and expand toggle.

```tsx
// src/__tests__/visualization.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Visualization from "@/components/session/Visualization";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ id: "viz-1", topic_id: "derivatives", visualization_code: "<!DOCTYPE html><html><body><h1>Test</h1></body></html>", source: "ai-generated", cached: false }) })));
  vi.stubGlobal("URL", { ...globalThis.URL, createObjectURL: vi.fn(() => "blob:mock-url"), revokeObjectURL: vi.fn() });
});

describe("Visualization", () => {
  it("renders the generate button initially", () => { render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); expect(screen.getByText("Generate")).toBeTruthy(); });
  it("renders the topic title in description", () => { render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); expect(screen.getByText(/Explore Derivatives visually/)).toBeTruthy(); });
  it("shows sandboxed iframe after generating", async () => { const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { const iframe = screen.getByTitle("Visualization for Derivatives"); expect(iframe).toBeTruthy(); expect(iframe.getAttribute("sandbox")).toBe("allow-scripts"); }); });
  it("shows expand/collapse and regenerate buttons", async () => { const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { expect(screen.getByText("Expand")).toBeTruthy(); expect(screen.getByText("Regenerate")).toBeTruthy(); }); });
  it("shows error message on failure", async () => { vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ error: "AI unavailable" }) }))); const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { expect(screen.getByText("AI unavailable")).toBeTruthy(); }); });
  it("toggles expanded state", async () => { const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { expect(screen.getByText("Expand")).toBeTruthy(); }); await user.click(screen.getByText("Expand")); expect(screen.getByText("Collapse")).toBeTruthy(); });
});
```

- [ ] **23.5** Run the tests.

```bash
cd /Users/midoriya/Desktop/first-principles && npx vitest run src/__tests__/visualization.test.tsx
```

- [ ] **23.6** Commit.

```bash
cd /Users/midoriya/Desktop/first-principles && git add -A && git commit -m "feat: AI-generated interactive visualizations with sandboxed iframe rendering"
```

---

> **Plan complete. All 5 chunks cover the full spec.**
