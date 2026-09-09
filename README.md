# First Principles

**A STEM learning platform that refuses to just tell you the answer.**

First Principles teaches physics, math, and computer science the way Feynman taught: start with a concrete puzzle, let the learner struggle productively, hand out hints only when they're earned, and explain the idea in plain language before reaching for the formalism. Progress is a cosmic skill tree — 69 topics laid out as galaxies, stars, and bosses across a WebGL starfield, unlocking as you demonstrate mastery.

It runs entirely on your machine. SQLite for data, your own API key for the AI, no accounts, no server, no telemetry.

---

## Table of contents

- [What's in it](#whats-in-it)
- [Quickstart](#quickstart)
- [How it teaches](#how-it-teaches)
- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [API routes](#api-routes)
- [Development](#development)
- [Gotchas](#gotchas)

---

## What's in it

| Route | What it is |
|---|---|
| `/` | Home — entry point and current progress |
| `/tree` | **The Cosmos** — a PixiJS 8 WebGL skill tree. Pan, zoom, fog-of-war reveal. 69 topics, 93 prerequisite edges |
| `/session/[topicId]` | A learning session for one topic: challenge, hints, dialogue, scratchpad |
| `/playground` | Freeform space to work problems with KaTeX math rendering |
| `/journal` | History of everything you've attempted, with AI-written reflections |

### The skill tree

Topics are positioned on a pre-computed 2D map (no force simulation — positions are authored, so the layout is stable across sessions) and grouped into eight domains:

`core` · `math` · `mechanics` · `em` · `thermo` · `waves` · `modern` · `cs`

Each node is one of three types:

- **galaxy** — a domain hub
- **star** — a normal topic
- **boss** — a synthesis topic that requires several prerequisites at once

Visibility uses breadth-first fog: you see what you've unlocked plus one ring beyond it. The map stays legible early and reveals scope as you earn it.

### Lessons

20 hand-written Feynman-style lessons ship with the app, covering math, physics, and CS. Each has a structured shape:

```
hook → problem → hint1 → hint2 → hint3 → explanation → goingDeeper
```

The challenge, hint, and explain APIs check the `lessons` table **first** and only fall back to a live AI call when a topic has no pre-written lesson. That means the best content is deterministic, fast, free, and identical for every learner — the AI fills gaps rather than being the primary source.

Lesson text carries LaTeX inline (`$...$`) and display (`$$...$$`), rendered by KaTeX at display time.

---

## Quickstart

**Prerequisites:** Node 20+, and an Anthropic or OpenAI API key.

```bash
git clone <your-remote> first-principles
cd first-principles
npm install

# Add your key — at least one is required for AI features
cp .env.local.example .env.local
# edit .env.local

# Create and populate the local database
npx drizzle-kit push
npm run db:seed

npm run dev
```

Open http://localhost:3000.

> **The database is gitignored.** `first-principles.db` never leaves your machine, which also means a fresh clone starts empty. Run `db:seed` or the tree will be blank — that's the number-one "is it broken?" moment, and it isn't.

Seeding loads 69 topics, 93 edges, and 20 lessons.

---

## How it teaches

The pedagogy is the product, so it's worth being explicit about the rules the code enforces.

**Hints are staged, not dumped.** Three levels per problem, released one at a time. Level 1 reframes the question, level 2 points at the relevant principle, level 3 sets up the first step. You never receive the answer as a hint.

**Explanation comes after the attempt.** `/api/ai/explain` rejects any request whose `user_attempt` is under 20 characters of reasoning, with a 400 and a message saying so. It's a deliberately low bar — enough to stop a reflexive click through to the answer, not enough to be a chore. Reading a worked solution before struggling with the problem feels like learning and isn't.

**Dialogue, not lecture.** The session view runs a Socratic exchange: the AI asks what you think happens and why, then works from your answer. The prompt in `src/lib/prompts/dialogue-system.ts` is where that behavior is specified.

**Spaced review, triggered by decay.** `src/lib/review/trigger.ts` decides when a topic is due again based on mastery score and elapsed time. `src/lib/progress/mastery.ts` holds the scoring model. Review problems are generated fresh, then evaluated — you can't pass by memorizing the answer key.

**Prerequisites are a real graph.** `src/lib/graph/engine.ts` computes reachability over the 93 edges. Boss topics genuinely gate on multiple parents; unlocking is not a linear counter.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components for data-heavy pages, route handlers for the AI proxy |
| Language | TypeScript 5 | |
| Styling | Tailwind v4 (CSS-first) | Theme tokens live in `globals.css` `@theme {}` — **not** `tailwind.config.ts` |
| Database | Drizzle ORM + better-sqlite3 | Synchronous queries, zero-config, file-local |
| Graphics | PixiJS 8 | WebGL for the cosmos tree — stars, nebulae, particles, pan/zoom |
| Math | KaTeX | Faster than MathJax, good enough for everything here |
| AI | `@anthropic-ai/sdk` + `openai` behind one adapter | Swap providers without touching feature code |
| Tests | Vitest + React Testing Library | 26 test modules |

**Schema:** `topics` · `edges` · `sessions` · `messages` · `attempts` · `review_results` · `visualizations` · `lessons`

---

## Project layout

```
src/
├── app/
│   ├── page.tsx                 # Home
│   ├── tree/                    # Cosmos skill tree
│   ├── session/[topicId]/       # Learning session
│   ├── playground/              # Freeform math scratchpad
│   ├── journal/                 # Attempt history
│   └── api/
│       ├── ai/                  # challenge · hint · explain · chat
│       │                        # journal · visualization · review/*
│       ├── topics/  edges/      # Graph CRUD
│       ├── sessions/            # Sessions, messages, attempts
│       └── settings/            # Model selection
│
├── components/
│   └── cosmos/                  # CosmosTree (main)
│                                # cosmos-layers  — PixiJS scene builders
│                                # cosmos-fog     — BFS visibility
│                                # cosmos-icons   — physics glyphs
│                                # ZoomOverlay, StatsPanel — React overlays
│
├── lib/
│   ├── ai/adapter.ts            # chat(modelId, options) — provider-agnostic
│   ├── ai/providers/            # Anthropic + OpenAI implementations
│   ├── db/                      # schema.ts, seed.ts
│   ├── graph/engine.ts          # Prerequisite reachability
│   ├── progress/mastery.ts      # Mastery scoring
│   ├── review/trigger.ts        # Spaced-repetition scheduling
│   ├── prompts/                 # One file per AI behavior
│   ├── renderMath.ts            # Shared KaTeX helper
│   └── settings.ts              # readSettings() → { selectedModel }
│
├── data/
│   ├── seed-cosmos.json         # 69 topics + 93 edges, positions pre-computed
│   └── seed-lessons.json        # 20 hand-written lessons with LaTeX
│
└── __tests__/                   # 26 modules, setup.ts
```

Path alias: `@/*` → `src/*`.

---

## API routes

### AI

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/ai/challenge` | Generate a problem for a topic (lessons table first) |
| `POST` | `/api/ai/hint` | Next staged hint |
| `POST` | `/api/ai/explain` | Post-attempt explanation |
| `POST` | `/api/ai/chat` | Socratic dialogue turn |
| `POST` | `/api/ai/journal` | Reflection on an attempt |
| `POST` | `/api/ai/visualization` | Generate a visual aid |
| `POST` | `/api/ai/review/generate` | Fresh spaced-review problem |
| `POST` | `/api/ai/review/evaluate` | Grade a review answer |

### Data

| Method | Route | Purpose |
|---|---|---|
| `GET` `POST` | `/api/topics` · `/api/topics/[id]` | Topic CRUD |
| `GET` `POST` | `/api/edges` · `/api/edges/[id]` | Prerequisite edges |
| `GET` `POST` | `/api/sessions` · `/api/sessions/[id]` | Sessions |
| `GET` `POST` | `/api/sessions/[id]/messages` | Dialogue transcript |
| `GET` `POST` | `/api/sessions/[id]/attempts` | Attempt records |
| `GET` `POST` | `/api/settings` | Selected model |

---

## Development

```bash
npm run dev            # dev server on :3000
npm test               # vitest, single run
npm run test:watch     # watch mode
npm run lint           # eslint
npx next build         # type-check + production build
npm run db:seed        # reseed topics, edges, lessons

# after editing src/lib/db/schema.ts
npx drizzle-kit generate && npx drizzle-kit push
```

**Testing notes.** jsdom environment, global setup in `src/__tests__/setup.ts`. DB tests use `new Database(":memory:")`. `next/navigation` and `next/link` are mocked. PixiJS is mocked in cosmos tests — jsdom has no WebGL; see `src/__tests__/cosmos-tree.test.tsx` for the pattern.

---

## Gotchas

Hard-won, in rough order of how much time they cost.

**Drizzle queries must be synchronous.** Use `.select().from().where().get()` / `.all()`. Do **not** use `db.query.xxx.findFirst()` — that path is async in Drizzle 0.45.x with better-sqlite3 and will silently hand you a Promise where you expected a row.

**Route params are a Promise.** Next.js 15+ made dynamic params async: `params: Promise<{ id: string }>`, and you must `await` it.

**PixiJS cannot be server-rendered.** It crashes during SSR. The cosmos tree is a `"use client"` component loaded with `dynamic(() => import(...), { ssr: false })`. Keep it that way.

**PixiJS colors are hex integers, not CSS strings.** Pass `0x6366f1` plus a separate `alpha` float to `.fill()` / `.stroke()`. An `rgba()` string will not throw — it will just render wrong.

**Tailwind v4 keeps its theme in CSS.** Tokens live in the `@theme {}` block in `globals.css`. `tailwind.config.ts` still exists for backwards compatibility but is **not** the source of truth. When you rename a token, the old name is *deleted* rather than remapped, so every component class referencing it must be updated in the same change.

**Font variables use a `-var` suffix.** Inter, JetBrains Mono, Lora, and EB Garamond load in `layout.tsx` as e.g. `--font-lora-var`, deliberately avoiding a collision with `@theme { --font-serif: var(--font-lora-var) }`.

**PixiJS canvas events bypass the DOM.** Playwright can't reach tree nodes through the accessibility tree. Use `page.mouse.click(x, y)` at literal pixel coordinates, or mock PixiJS and test in unit-land.

**D3 is gone.** Do not import `d3` anywhere. The old `SkillTree` component was deleted when the cosmos tree replaced it.

**`seed-topics.json` is dead.** The seed script reads `seed-cosmos.json` and `seed-lessons.json`. The old file is a leftover.

---

## Configuration

API keys go in `.env.local`, which is gitignored. At least one is required for AI features:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

`.env.local.example` is the committed template and contains placeholders only. Model selection is stored per-install via `/api/settings` and read through `readSettings()`.

---

## License

No license file is present. Add one before sharing publicly — without it, default copyright applies and nobody can legally reuse the code.
