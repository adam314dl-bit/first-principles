# CLAUDE.md

## Project
First Principles — a curiosity-driven STEM learning platform with Feynman-style teaching, cosmic skill tree, and creative review.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind v4 (CSS-first: `@import "tailwindcss"` + `@theme {}` in globals.css, NOT `@tailwind` directives)
- Drizzle ORM + better-sqlite3 (SQLite, local-first)
- PixiJS 8 (WebGL cosmic skill tree — stars, nebulae, particles, pan/zoom)
- KaTeX (math rendering in scratchpad + lesson content via `MathText` component)
- Vitest + React Testing Library

## Commands
- `npm run dev` — start dev server
- `npm test` — run all tests (vitest)
- `npm run test:watch` — watch mode
- `npm run db:seed` — seed database with 69 topics (physics + math + CS) + 93 edges + 20 lessons
- `npx next build` — type-check + production build
- `npx drizzle-kit generate && npx drizzle-kit push` — apply schema changes

## Code Patterns
- DB queries: use synchronous `.select().from().where().get()/.all()` — NOT `db.query.xxx.findFirst()` (async in Drizzle 0.45.x with better-sqlite3)
- API route params: `params: Promise<{ id: string }>` (Next.js 15+ async params, must await)
- AI calls: `import { chat } from "@/lib/ai/adapter"` → `chat(modelId, options)`
- Settings: `import { readSettings } from "@/lib/settings"` → `{ selectedModel }`
- All source under `src/`, path alias `@/*` → `src/*`
- Cosmos tree: PixiJS 8 used imperatively via `useEffect`/`useRef` in `"use client"` component, loaded with `dynamic(() => import(...), { ssr: false })` — PixiJS crashes during SSR
- Cosmos components in `src/components/cosmos/`: CosmosTree (main), cosmos-layers (PixiJS builders), cosmos-fog (BFS visibility), cosmos-icons (physics icons), ZoomOverlay + StatsPanel (React overlays)
- Topics table has cosmos columns: `cosmosX`, `cosmosY`, `cosmosRadius`, `domain`, `nodeType` (`'galaxy'` | `'star'` | `'boss'`)
- Lessons table: `lessons` stores pre-written Feynman-style content (hook, problem, hint1/2/3, explanation, goingDeeper) linked to topics via `topicId`. 20 lessons cover math, physics, and CS.
- Challenge/hint/explain APIs check `lessons` table first, fall back to AI if no pre-written lesson exists for the topic
- Math rendering: `renderMath()` in `src/lib/renderMath.ts` (shared util), `<MathText>` component wraps it for React. Uses `$...$` inline and `$$...$$` display KaTeX delimiters in lesson text fields
- Lesson content uses LaTeX in JSON strings — `$` and `$$` delimiters stored as-is, rendered by KaTeX at display time

## Testing
- jsdom environment, setup at `src/__tests__/setup.ts`
- `scrollIntoView` mocked globally (jsdom doesn't implement it)
- DB tests use in-memory SQLite: `new Database(":memory:")`
- Next.js mocks: `next/navigation` (usePathname, useRouter, useSearchParams), `next/link`
- PixiJS mocked in cosmos-tree tests (jsdom has no WebGL) — see `src/__tests__/cosmos-tree.test.tsx` for mock pattern

## Gotchas
- Tailwind v4: theme values defined in `globals.css` `@theme {}` block, not `tailwind.config.ts`
- `tailwind.config.ts` exists for backwards compat but is NOT the source of truth for Tailwind v4
- SQLite DB file (`first-principles.db`) is gitignored — run `db:seed` after fresh clone
- API keys go in `.env.local` (see `.env.local.example`)
- D3.js was removed — do NOT import d3 anywhere. The old SkillTree component is deleted.
- Fonts: Inter + JetBrains Mono + Lora + EB Garamond loaded in layout.tsx; next/font variables use `-var` suffix (e.g. `--font-lora-var`) to avoid collision with `@theme { --font-serif: var(--font-lora-var) }`
- PixiJS colors: pass hex integers (`0x6366f1`) + separate `alpha` float to `.fill()`/`.stroke()` — NOT CSS rgba strings
- Tailwind v4 theme migration: token names are DELETED and NEW names added (not value-remapped) — all component class references must be updated when renaming tokens
- PixiJS canvas events bypass React/DOM — Playwright can't trigger node clicks via accessibility tree; use `page.mouse.click(x, y)` at exact pixel coords, or mock PixiJS in unit tests
- Cosmos seed data in `src/data/seed-cosmos.json` — positions are pre-computed, NOT force-simulated
- Lesson seed data in `src/data/seed-lessons.json` — 20 hand-crafted lessons with LaTeX math. `seed-topics.json` is an old file, NOT used by the seed script
