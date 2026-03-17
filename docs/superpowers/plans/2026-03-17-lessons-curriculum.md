# Lessons Curriculum Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `lessons` table with 20 curated Feynman-style lessons (hook + problem + 3 hints + explanation + going deeper) that the challenge/hint/explain APIs serve instead of generating from AI.

**Architecture:** New `lessons` table in SQLite. Three existing API routes (`/api/ai/challenge`, `/api/ai/hint`, `/api/ai/explain`) check the lessons table first and fall back to AI if no lesson exists. A shared `renderMath` utility and `MathText` component render KaTeX in challenge, hints, and explanation panels. `ChallengeMode` adds a hook callout that collapses after the first submission.

**Tech Stack:** Next.js App Router, Drizzle ORM + better-sqlite3, KaTeX, Tailwind v4, Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-17-lessons-curriculum-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/db/schema.ts` | Modify | Add `lessons` table |
| `src/__tests__/schema.test.ts` | Modify | Add `lessons` column assertions |
| `src/lib/renderMath.ts` | Create | Shared KaTeX rendering utility |
| `src/components/MathText.tsx` | Create | React component wrapping renderMath |
| `src/__tests__/render-math.test.ts` | Create | Unit tests for renderMath |
| `src/components/session/Scratchpad.tsx` | Modify | Import renderMath from shared util |
| `src/data/seed-lessons.json` | Create | 20 lesson objects |
| `src/lib/db/seed.ts` | Modify | Add seedLessons(), delete lessons in clear step |
| `src/app/api/ai/challenge/route.ts` | Modify | Check lessons table; return hook + problem |
| `src/app/api/ai/hint/route.ts` | Modify | Accept topic_id; return pre-written hint |
| `src/app/api/ai/explain/route.ts` | Modify | Accept topic_id; return pre-written explanation |
| `src/components/session/ChallengeMode.tsx` | Modify | Hook callout, MathText rendering, pass topic_id |

---

## Task 1: Add `lessons` table to schema

**Files:**
- Modify: `src/lib/db/schema.ts`
- Modify: `src/__tests__/schema.test.ts`

- [ ] **1.1 — Add `lessons` table to schema**

Open `src/lib/db/schema.ts` and add this block after the `visualizations` table (at end of file):

```ts
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
```

- [ ] **1.2 — Update schema test to assert lessons columns**

In `src/__tests__/schema.test.ts`, add the lessons entry to the `cases` array:

```ts
["lessons", schema.lessons, ["id", "topicId", "hook", "problem", "hint1", "hint2", "hint3", "explanation", "goingDeeper"]],
```

- [ ] **1.3 — Run schema test to verify it fails**

```bash
npm test -- schema.test
```

Expected: FAIL — `schema.lessons` is undefined.

- [ ] **1.4 — Run database migration**

```bash
npx drizzle-kit generate && npx drizzle-kit push
```

Expected: generates migration, pushes new `lessons` table to `first-principles.db`.

- [ ] **1.5 — Run schema test to verify it passes**

```bash
npm test -- schema.test
```

Expected: PASS all cases including lessons.

- [ ] **1.6 — Commit**

```bash
git add src/lib/db/schema.ts src/__tests__/schema.test.ts
git commit -m "feat: add lessons table to schema"
```

---

## Task 2: Extract shared `renderMath` utility

**Files:**
- Create: `src/lib/renderMath.ts`
- Create: `src/__tests__/render-math.test.ts`
- Modify: `src/components/session/Scratchpad.tsx`

- [ ] **2.1 — Write the failing test**

Create `src/__tests__/render-math.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { renderMath } from "@/lib/renderMath";

describe("renderMath", () => {
  it("passes plain text through unchanged", () => {
    const result = renderMath("Hello world");
    expect(result).toBe("Hello world");
  });

  it("renders inline math with $ delimiters", () => {
    const result = renderMath("The formula $x^2$ is quadratic");
    expect(result).toContain("katex");
    expect(result).toContain("x^2");
  });

  it("renders display math with $$ delimiters", () => {
    const result = renderMath("$$F = ma$$");
    expect(result).toContain("katex");
    expect(result).toContain("display");
  });

  it("renders bold markdown", () => {
    const result = renderMath("**important**");
    expect(result).toContain("<strong>important</strong>");
  });

  it("renders italic markdown", () => {
    const result = renderMath("*emphasis*");
    expect(result).toContain("<em>emphasis</em>");
  });

  it("converts newlines to <br />", () => {
    const result = renderMath("line one\nline two");
    expect(result).toContain("<br />");
  });

  it("returns error span on invalid LaTeX", () => {
    const result = renderMath("$\\invalidcommand{$");
    // Should not throw; returns text with error indicator
    expect(typeof result).toBe("string");
  });
});
```

- [ ] **2.2 — Run test to confirm it fails**

```bash
npm test -- render-math.test
```

Expected: FAIL — `renderMath` not found.

- [ ] **2.3 — Create `src/lib/renderMath.ts`**

```ts
// src/lib/renderMath.ts
import katex from "katex";

export function renderMath(text: string): string {
  let result = text;
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `<span class="text-danger">[Math Error: ${tex}]</span>`;
    }
  });
  result = result.replace(/\$([^$\n]+?)\$/g, (_m, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="text-danger">[Math Error: ${tex}]</span>`;
    }
  });
  result = result.replace(/^### (.+)$/gm, '<h3 class="font-serif text-lg text-text mt-4 mb-2">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="font-serif text-xl text-text mt-4 mb-2">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="font-serif text-2xl text-text mt-4 mb-2">$1</h1>');
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/\n/g, "<br />");
  return result;
}
```

- [ ] **2.4 — Run test to confirm it passes**

```bash
npm test -- render-math.test
```

Expected: PASS all 7 cases.

- [ ] **2.5 — Update Scratchpad to use shared util**

In `src/components/session/Scratchpad.tsx`, replace the top of the file:

Old:
```ts
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import katex from "katex";

interface ScratchpadProps { sessionId: string; initialContent?: string; }

function renderMathInText(text: string): string {
  let result = text;
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => { try { return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }); } catch { return `<span class="text-danger">[Math Error: ${tex}]</span>`; } });
  result = result.replace(/\$([^$\n]+?)\$/g, (_m, tex) => { try { return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }); } catch { return `<span class="text-danger">[Math Error: ${tex}]</span>`; } });
  result = result.replace(/^### (.+)$/gm, '<h3 class="font-serif text-lg text-text mt-4 mb-2">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="font-serif text-xl text-text mt-4 mb-2">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="font-serif text-2xl text-text mt-4 mb-2">$1</h1>');
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/\n/g, "<br />");
  return result;
}
```

New:
```ts
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { renderMath } from "@/lib/renderMath";

interface ScratchpadProps { sessionId: string; initialContent?: string; }
```

Then find the one usage of `renderMathInText(content)` in the JSX and replace with `renderMath(content)`.

- [ ] **2.6 — Run scratchpad test to confirm nothing broke**

```bash
npm test -- scratchpad.test
```

Expected: PASS.

- [ ] **2.7 — Commit**

```bash
git add src/lib/renderMath.ts src/__tests__/render-math.test.ts src/components/session/Scratchpad.tsx
git commit -m "feat: extract shared renderMath utility, update Scratchpad"
```

---

## Task 3: Create `MathText` component

**Files:**
- Create: `src/components/MathText.tsx`

- [ ] **3.1 — Create `src/components/MathText.tsx`**

```tsx
// src/components/MathText.tsx
"use client";
import { renderMath } from "@/lib/renderMath";

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = "" }: MathTextProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMath(text) }}
    />
  );
}
```

- [ ] **3.2 — Run full test suite to confirm nothing broke**

```bash
npm test
```

Expected: all existing tests pass.

- [ ] **3.3 — Commit**

```bash
git add src/components/MathText.tsx
git commit -m "feat: add MathText component for KaTeX rendering"
```

---

## Task 4: Create `seed-lessons.json`

**Files:**
- Create: `src/data/seed-lessons.json`

- [ ] **4.1 — Create `src/data/seed-lessons.json`**

Create the file with this structure. The full content for all 20 lessons is in the spec at `docs/superpowers/specs/2026-03-17-lessons-curriculum-design.md` — copy each lesson's hook, problem, hint1, hint2, hint3, explanation, and goingDeeper into the corresponding JSON field. Use `\n` for newlines in multi-paragraph text.

```json
[
  {
    "id": "lesson-algebra-basics",
    "topicId": "algebra-basics",
    "hook": "Every time you balance a budget, adjust a recipe, or figure out how fast to drive to arrive on time, you are doing algebra — reasoning backwards. You know the result you want, and you have to find the number that produces it. Algebra is not about memorizing procedures. It is about one simple idea: unknown quantities can be named, and once named, they can be found.",
    "problem": "You have two jars. Together they hold 20 marbles. One jar holds 4 more marbles than the other. Without guessing and checking, can you figure out how many marbles are in each jar — and describe a method that would work for *any* two numbers?",
    "hint1": "What if you gave the unknown quantity a name — say, the number in the smaller jar is $x$. Can you write a sentence about the two jars using only $x$?",
    "hint2": "If the smaller jar holds $x$, the larger holds $x + 4$. Together they hold 20. Can you write that as an equation? What legal moves preserve the balance of an equation?",
    "hint3": "You should have $x + (x + 4) = 20$. Simplify the left side. Then subtract, then divide. Each step keeps both sides equal — like keeping a scale balanced.",
    "explanation": "Think of an equation as a perfectly balanced scale. Whatever you do to one side, you must do to the other to keep it balanced.\n\nName the smaller jar $x$. The larger holds $x + 4$. Together:\n\n$$x + (x + 4) = 20$$\n$$2x + 4 = 20$$\n\nSubtract 4 from both sides:\n\n$$2x = 16$$\n\nDivide both sides by 2:\n\n$$x = 8$$\n\nThe smaller jar holds 8 marbles, the larger holds 12. Check: $8 + 12 = 20$ ✓ and $12 - 8 = 4$ ✓.\n\nThe method works for any two numbers because we never assumed anything specific about 20 or 4 — we just applied legal moves to a balanced scale. That generality is the whole point of naming unknowns.",
    "goingDeeper": "What if the larger jar held *twice* as many as the smaller, instead of 4 more? Write that as an equation and solve it. What changes in your approach — and what stays exactly the same?"
  },
  {
    "id": "lesson-quadratics",
    "topicId": "quadratics",
    "hook": "...",
    "problem": "...",
    "hint1": "...",
    "hint2": "...",
    "hint3": "...",
    "explanation": "...",
    "goingDeeper": "..."
  }
]
```

Populate all 20 entries. The topic IDs to use are:
`algebra-basics`, `quadratics`, `functions`, `trigonometry`, `limits`, `derivatives`, `integrals`, `vectors`, `kinematics`, `newtons-laws`, `energy-work`, `momentum`, `waves`, `gravity`, `arrays-lists`, `recursion`, `sorting-algorithms`, `big-o`, `trees-graphs`, `hash-tables`.

The lesson IDs follow the pattern `lesson-{topicId}`.

Use `\n` for newlines and `\n\n` between paragraphs. LaTeX delimiters `$...$` and `$$...$$` are stored as-is in the JSON strings.

- [ ] **4.2 — Validate JSON parses correctly**

```bash
node -e "const d = require('./src/data/seed-lessons.json'); console.log(d.length, 'lessons loaded');"
```

Expected: `20 lessons loaded`

- [ ] **4.3 — Commit**

```bash
git add src/data/seed-lessons.json
git commit -m "feat: add seed-lessons.json with 20 Feynman-style lesson objects"
```

---

## Task 5: Update seed script

**Files:**
- Modify: `src/lib/db/seed.ts`

- [ ] **5.1 — Update `src/lib/db/seed.ts`**

Replace the entire file with:

```ts
// src/lib/db/seed.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import seedData from "../../data/seed-cosmos.json";
import lessonsData from "../../data/seed-lessons.json";
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
  db.delete(schema.lessons).run();
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

  for (const lesson of lessonsData) {
    db.insert(schema.lessons).values({
      id: lesson.id,
      topicId: lesson.topicId,
      hook: lesson.hook,
      problem: lesson.problem,
      hint1: lesson.hint1,
      hint2: lesson.hint2,
      hint3: lesson.hint3,
      explanation: lesson.explanation,
      goingDeeper: lesson.goingDeeper,
    }).run();
  }
  console.log(`Inserted ${lessonsData.length} lessons.`);

  console.log("Seeding complete.");
  sqlite.close();
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
```

- [ ] **5.2 — Run seed script**

```bash
npm run db:seed
```

Expected output:
```
Seeding database...
Inserted 55 topics.
Inserted 75 edges.
Inserted 20 lessons.
Seeding complete.
```

- [ ] **5.3 — Commit**

```bash
git add src/lib/db/seed.ts
git commit -m "feat: seed lessons table with 20 pre-written lessons"
```

---

## Task 6: Update challenge API

**Files:**
- Modify: `src/app/api/ai/challenge/route.ts`

The challenge API already receives `topic_id`. Add a lesson lookup before the AI call. Return `hook` and `problem` separately when a lesson is found. When no lesson exists, fall back to AI as before (returning `hook: null`).

- [ ] **6.1 — Update `src/app/api/ai/challenge/route.ts`**

```ts
// src/app/api/ai/challenge/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { topics, lessons } from "@/lib/db/schema";
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

    // Check for pre-written lesson first
    const lesson = db.select().from(lessons).where(eq(lessons.topicId, topic_id)).get();
    if (lesson) {
      return NextResponse.json({
        challenge: lesson.problem,
        hook: lesson.hook,
        topic_id: topic.id,
        topic_title: topic.title,
        source: "lesson",
      });
    }

    // Fall back to AI generation
    const masteredTopicNames = getConnectedMasteredTopics(db, topic_id).map((c) => c.topic.title);
    const prompt = challengeGeneratePrompt({ topic: topic.title, subject: topic.subject, difficulty: topic.difficulty, masteredTopics: masteredTopicNames });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 800, temperature: 0.8 });
    return NextResponse.json({
      challenge: response.content.trim(),
      hook: null,
      topic_id: topic.id,
      topic_title: topic.title,
      source: "ai",
      model: response.model,
    });
  } catch (error) {
    console.error("Challenge generation failed:", error);
    return NextResponse.json({ error: "Failed to generate challenge. The tutor is having a moment — try again." }, { status: 500 });
  }
}
```

- [ ] **6.2 — Run full test suite**

```bash
npm test
```

Expected: all existing tests pass (the existing challenge-mode test mocks fetch, so it is unaffected by API changes).

- [ ] **6.3 — Commit**

```bash
git add src/app/api/ai/challenge/route.ts
git commit -m "feat: challenge API returns pre-written lesson when available"
```

---

## Task 7: Update hint API

**Files:**
- Modify: `src/app/api/ai/hint/route.ts`

Add `topic_id` as an optional field in the request body. When present, check the lessons table for a pre-written hint at that level before calling the AI.

- [ ] **7.1 — Update `src/app/api/ai/hint/route.ts`**

```ts
// src/app/api/ai/hint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeHintsPrompt } from "@/lib/prompts/challenge-hints";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge, hint_level, user_attempt, topic_id } = body as {
      challenge: string;
      hint_level: number;
      user_attempt?: string;
      topic_id?: string;
    };

    if (!challenge) return NextResponse.json({ error: "challenge is required" }, { status: 400 });
    if (!hint_level || hint_level < 1 || hint_level > 3) {
      return NextResponse.json({ error: "hint_level must be 1, 2, or 3" }, { status: 400 });
    }

    // Check for pre-written hint
    if (topic_id) {
      const lesson = db.select().from(lessons).where(eq(lessons.topicId, topic_id)).get();
      if (lesson) {
        const hintText = hint_level === 1 ? lesson.hint1 : hint_level === 2 ? lesson.hint2 : lesson.hint3;
        return NextResponse.json({ hint: hintText, hint_level, source: "lesson" });
      }
    }

    // Fall back to AI
    const prompt = challengeHintsPrompt({ challenge, hintLevel: hint_level, userAttempt: user_attempt });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 400, temperature: 0.7 });
    return NextResponse.json({ hint: response.content.trim(), hint_level, source: "ai" });
  } catch (error) {
    console.error("Hint generation failed:", error);
    return NextResponse.json({ error: "Failed to generate hint" }, { status: 500 });
  }
}
```

- [ ] **7.2 — Run tests**

```bash
npm test
```

Expected: all passing.

- [ ] **7.3 — Commit**

```bash
git add src/app/api/ai/hint/route.ts
git commit -m "feat: hint API returns pre-written hints when topic_id matches a lesson"
```

---

## Task 8: Update explain API

**Files:**
- Modify: `src/app/api/ai/explain/route.ts`

Add `topic_id` as an optional field. When present, return the pre-written explanation (still require a minimum-length attempt — the gate keeps the learner honest even with curated content).

- [ ] **8.1 — Update `src/app/api/ai/explain/route.ts`**

```ts
// src/app/api/ai/explain/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { chat } from "@/lib/ai/adapter";
import { readSettings } from "@/lib/settings";
import { challengeExplainPrompt } from "@/lib/prompts/challenge-explain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { challenge, topic, user_attempt, topic_id } = body as {
      challenge: string;
      topic: string;
      user_attempt: string;
      topic_id?: string;
    };

    if (!challenge || !topic || !user_attempt) {
      return NextResponse.json({ error: "challenge, topic, and user_attempt are required" }, { status: 400 });
    }
    if (user_attempt.trim().length < 20) {
      return NextResponse.json({ error: "A genuine attempt is required before unlocking the explanation. Write at least 20 characters of reasoning." }, { status: 400 });
    }

    // Check for pre-written explanation
    if (topic_id) {
      const lesson = db.select().from(lessons).where(eq(lessons.topicId, topic_id)).get();
      if (lesson) {
        const fullText = `${lesson.explanation}\n\n**Going deeper:** ${lesson.goingDeeper}`;
        return NextResponse.json({ explanation: fullText, source: "lesson" });
      }
    }

    // Fall back to AI
    const prompt = challengeExplainPrompt({ challenge, topic, userAttempt: user_attempt });
    const settings = readSettings();
    const response = await chat(settings.selectedModel, { messages: [{ role: "user", content: prompt }], maxTokens: 2000, temperature: 0.6 });
    return NextResponse.json({ explanation: response.content.trim(), source: "ai" });
  } catch (error) {
    console.error("Explanation generation failed:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
```

- [ ] **8.2 — Run tests**

```bash
npm test
```

Expected: all passing.

- [ ] **8.3 — Commit**

```bash
git add src/app/api/ai/explain/route.ts
git commit -m "feat: explain API returns pre-written explanation when topic_id matches a lesson"
```

---

## Task 9: Update ChallengeMode

**Files:**
- Modify: `src/components/session/ChallengeMode.tsx`
- Modify: `src/__tests__/challenge-mode.test.tsx`

Changes:
1. Add `hook` state — populated when API returns a pre-written lesson
2. Display hook callout above challenge; collapse it when `hasSubmitted` is true
3. Pass `topicId` in hint and explain fetch calls
4. Replace plain text rendering of challenge, hints, and explanation with `<MathText>`

- [ ] **9.1 — Add hook callout test**

In `src/__tests__/challenge-mode.test.tsx`, add these two tests:

```ts
it("displays hook callout when lesson returns a hook", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      challenge: "What is speed at an instant?",
      hook: "Your speedometer does not count anything.",
      source: "lesson",
    }),
  });
  const user = userEvent.setup();
  render(<ChallengeMode {...props} />);
  await user.click(screen.getByText("Generate Challenge"));
  await waitFor(() => {
    expect(screen.getByText(/Your speedometer does not count anything/)).toBeTruthy();
  });
});

it("hook callout is hidden after submitting attempt", async () => {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        challenge: "What is speed at an instant?",
        hook: "Your speedometer does not count anything.",
        source: "lesson",
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({}) }); // attempt submit
  const user = userEvent.setup();
  render(<ChallengeMode {...props} />);
  await user.click(screen.getByText("Generate Challenge"));
  await waitFor(() => expect(screen.getByLabelText("Your attempt")).toBeTruthy());
  await user.type(screen.getByLabelText("Your attempt"), "I think derivatives measure instantaneous rate of change");
  await user.click(screen.getByText("Submit Attempt"));
  await waitFor(() => {
    expect(screen.queryByText(/Your speedometer does not count anything/)).toBeNull();
  });
});
```

- [ ] **9.2 — Run the new tests to confirm they fail**

```bash
npm test -- challenge-mode.test
```

Expected: the two new tests FAIL (hook not yet rendered).

- [ ] **9.3 — Replace `ChallengeMode.tsx` with the updated version**

```tsx
// src/components/session/ChallengeMode.tsx
"use client";
import { useState, useCallback } from "react";
import Visualization from "@/components/session/Visualization";
import MathText from "@/components/MathText";

interface ChallengeModeProps { topicId: string; topicTitle: string; sessionId: string; }

export default function ChallengeMode({ topicId, topicTitle, sessionId }: ChallengeModeProps) {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [hook, setHook] = useState<string | null>(null);
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
      const res = await fetch("/api/ai/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_id: topicId }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to generate challenge"); }
      const data = await res.json();
      setChallenge(data.challenge);
      setHook(data.hook ?? null);
      setHints([]); setHintLevel(0); setAttempt(""); setExplanation(null); setHasSubmitted(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  }, [topicId]);

  const requestHint = async () => {
    if (hintLevel >= 3) return;
    const nextLevel = hintLevel + 1;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, hint_level: nextLevel, user_attempt: attempt || undefined, topic_id: topicId }),
      });
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
      const res = await fetch(`/api/sessions/${sessionId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: attempt, hint_level_used: hintLevel }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to submit attempt"); }
      setHasSubmitted(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  const requestExplanation = async () => {
    if (!hasSubmitted) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, topic: topicTitle, user_attempt: attempt, topic_id: topicId }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to get explanation"); }
      const data = await res.json();
      setExplanation(data.explanation);
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "tutor", content: data.explanation }),
      });
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-text">Challenge Mode</h2>
        <button
          onClick={generateChallenge}
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {challenge ? "New Challenge" : "Generate Challenge"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Hook callout — visible before first submission only */}
      {hook && !hasSubmitted && (
        <div className="rounded-md border-l-4 border-accent bg-accent-surface px-4 py-3">
          <MathText text={hook} className="font-study text-base text-text-2 leading-relaxed" />
        </div>
      )}

      {challenge && (
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <MathText text={challenge} className="prose prose-sm max-w-none text-text-2" />
        </div>
      )}

      {challenge && hints.length > 0 && (
        <div className="space-y-2">
          {hints.map((hint, i) => (
            <div key={i} className="rounded-md border border-accent-border bg-accent-surface p-3 text-sm text-text-2">
              <div className="mb-1 font-medium text-accent">Hint {i + 1}</div>
              <MathText text={hint} className="prose prose-sm max-w-none" />
            </div>
          ))}
        </div>
      )}

      {challenge && hintLevel < 3 && (
        <button
          onClick={requestHint}
          disabled={loading}
          className="self-start rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-3 transition-colors hover:bg-surface disabled:opacity-50"
        >
          {hintLevel === 0 ? "Need a hint?" : `Hint ${hintLevel + 1} of 3`}
        </button>
      )}

      {challenge && (
        <div className="space-y-2">
          <label htmlFor="attempt-input" className="text-sm font-medium text-text-2">Your attempt</label>
          <textarea
            id="attempt-input"
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            disabled={hasSubmitted}
            placeholder="Think through it from first principles. Even a partial thought counts..."
            rows={5}
            className="lined-paper w-full rounded-md border border-border p-3 font-study text-lg text-text-2 placeholder:text-text-3/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">{attempt.trim().length}/20 characters minimum</span>
            {!hasSubmitted && (
              <button
                onClick={submitAttempt}
                disabled={loading || attempt.trim().length < 20}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                Submit Attempt
              </button>
            )}
          </div>
        </div>
      )}

      {challenge && hasSubmitted && !explanation && (
        <button
          onClick={requestExplanation}
          disabled={loading}
          className="rounded-md border-2 border-dashed border-gold bg-gold-surface px-4 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold-surface/80 disabled:opacity-50"
        >
          Unlock Full Explanation
        </button>
      )}

      {explanation && (
        <div className="rounded-lg border border-gold bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-lg text-gold">Explanation</h3>
          <MathText text={explanation} className="prose prose-sm max-w-none text-text-2" />
        </div>
      )}

      {explanation && (
        <div className="mt-6">
          <Visualization topicId={topicId} topicTitle={topicTitle} />
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Tutor is thinking...
        </div>
      )}
    </div>
  );
}
```

- [ ] **9.4 — Run all challenge mode tests**

```bash
npm test -- challenge-mode.test
```

Expected: all tests pass including the two new hook tests.

- [ ] **9.5 — Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **9.6 — Commit**

```bash
git add src/components/session/ChallengeMode.tsx src/__tests__/challenge-mode.test.tsx
git commit -m "feat: ChallengeMode — hook callout, MathText rendering, thread topic_id to hint/explain APIs"
```

---

## Task 10: Smoke test end-to-end

- [ ] **10.1 — Run dev server**

```bash
npm run dev
```

- [ ] **10.2 — Verify lesson loads for a seeded topic**

Open `http://localhost:3000`, navigate to Cosmos, click on **Derivatives** (which has a pre-written lesson). Click "Generate Challenge". Verify:
- Hook callout appears above the challenge in an indigo left-border callout
- The problem text is shown with KaTeX math rendered (e.g. $x(t) = t^2$ should render with proper math typography)
- Click "Need a hint?" — verify hint 1 is the pre-written nudge (not AI-generated)
- Type a 20+ character attempt and submit
- Verify hook callout disappears after submission
- Click "Unlock Full Explanation" — verify the explanation renders with full KaTeX (fractions, display equations, etc.)

- [ ] **10.3 — Verify fallback for non-lesson topic**

Navigate to a topic *not* in the 20 (e.g. **Arithmetic**, id `arithmetic`). Click "Generate Challenge". Verify it calls AI and returns a challenge (no hook).

- [ ] **10.4 — Run full build check**

```bash
npx next build
```

Expected: no TypeScript errors, successful build.

- [ ] **10.5 — Final commit**

```bash
git add -A
git commit -m "feat: lessons curriculum — 20 Feynman-style pre-written lessons with KaTeX rendering"
```
