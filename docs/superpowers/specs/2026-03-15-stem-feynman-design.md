# Stem Feynman — Design Spec

## Vision

A personal, curiosity-driven STEM learning platform that combines:
- **Feynman's teaching philosophy** — understand by explaining simply
- **AoPS problem-first approach** — struggle before reading
- **Brilliant.org interactivity** — learn by manipulating, not just watching
- **RPG skill tree progression** — visual, game-like knowledge graph
- **Creative review** — deepen understanding through play, not routine

Built for one user first (personal tool), designed for eventual multi-user extensibility.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Skill Tree | D3.js (force-directed / dagre layout) |
| Math Rendering | KaTeX |
| Interactive Sims | Canvas / Three.js (per-topic) |
| AI Layer | Model-agnostic adapter (Claude, OpenAI, others — switchable) |
| Database | SQLite via Drizzle ORM (local-first, migratable to Postgres) |
| Auth | None initially. NextAuth when opening to others |

**Key principle:** Local-first. Everything runs on your machine. No external dependencies except AI API calls.

## Architecture

```
┌─────────────────────────────────────────────┐
│              Next.js Frontend               │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Skill    │ │ Learning │ │ Review      │ │
│  │ Tree     │ │ Session  │ │ Challenges  │ │
│  │ (D3)     │ │ (Dialog) │ │ (Creative)  │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
├─────────────────────────────────────────────┤
│              API Layer (Next.js Routes)      │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ Graph    │ │ AI Tutor │ │ Progress    │ │
│  │ Engine   │ │ Adapter  │ │ Tracker     │ │
│  └──────────┘ └──────────┘ └─────────────┘ │
├─────────────────────────────────────────────┤
│          SQLite (Drizzle ORM)               │
│  topics, edges, sessions, progress, reviews │
└─────────────────────────────────────────────┘
```

## Module 1: Knowledge Graph & Skill Tree

### Data Model

**Topic Node:**
- `id` — unique identifier
- `title` — concept name (e.g., "Derivative," "Newton's Second Law")
- `subject` — tag (math, physics, CS, chemistry, biology, etc.)
- `difficulty` — tier (1–5)
- `status` — locked / available / in-progress / mastered
- `mastery_level` — 0–5 (see Progress section)
- `description` — brief concept overview
- `created_at`, `updated_at`

**Edge:**
- `source_id`, `target_id` — directed relationship
- `type` — `prerequisite` | `related` | `deepens`
- `weight` — connection strength (affects glow intensity)

### Skill Tree UI

- **Locked nodes** — dim, slightly visible at edges (peek at what's coming)
- **Available nodes** — bright, clickable, gentle pulse animation
- **In-progress** — glowing border, mastery level indicator
- **Mastered** — solid fill, color-coded by subject
- **Connection glow** — when working on a topic, edges to mastered topics light up amber. Glow intensity reflects edge weight. Label appears: "This connects to [X] — want to explore the link?"

### Graph Growth

1. Start with a few seed topics (user's choice or suggested by interest)
2. Completing a topic unlocks adjacent nodes via `prerequisite` edges
3. AI tutor suggests new nodes when it detects related concepts in dialogue — user approves before they're added
4. User can manually add any topic at any time

### Seeding Content

- **Starter set:** ~20–30 hand-curated topics across math (algebra → calculus), physics (mechanics → waves), and CS (algorithms → data structures) with prerequisite edges between them. Stored as a JSON seed file loaded on first run.
- AI-generated suggestions during exploration (user approves before adding to graph)
- Manual user additions via an "Add Topic" form

## Module 2: Learning Session (Problem-First Flow)

Clicking a topic node enters a learning session. Two modes, freely switchable:

### Challenge Mode (AoPS-style)

```
Provocative Question / Puzzle
        ↓
Your workspace (scratchpad, notes, attempts)
        ↓
Hint Layer 1 → "Think about..."
        ↓
Hint Layer 2 → "What if you considered..."
        ↓
Hint Layer 3 → Concrete nudge
        ↓
Full derivation / explanation (unlocked after genuine attempt)
        ↓
Interactive visualization of the concept
```

- Hints are layered — each reveals a bit more, never the full answer
- **"Genuine attempt" rule:** any non-trivial submission unlocks the explanation. The bar is low on purpose — a few sentences of reasoning, a partial equation, a diagram description. The system checks that the submission is non-empty and >20 characters. No AI grading of "effort" — the honor system is the point.
- Post-explanation interactive visualization lets you play with the concept (adjust parameters, see what changes)

### Dialogue Mode (Feynman/Socratic)

- Open-ended conversation with the AI tutor
- Socratic style: tutor asks you to explain, pokes holes in reasoning, suggests thought experiments
- Follow curiosity as deep as you want
- If dialogue reveals a gap, tutor can spin up a Challenge on the spot
- All dialogues are saved and revisitable

### Mode Switching

A toggle in the session UI. Mid-dialogue: "give me a problem on this" → Challenge. Mid-challenge: "let me talk this through" → Dialogue.

### Workspace Layout

Split-pane:
- **Left:** Challenge or dialogue
- **Right:** Scratchpad — markdown notes, LaTeX math input (live-rendered via KaTeX), interactive visualizations for the current topic

### Scratchpad Data Model

- Scratchpad content is stored **per-session** (each time you enter a topic, a new session starts)
- Schema: `session_id`, `topic_id`, `content` (markdown string), `created_at`, `updated_at`
- Previous session scratchpads are viewable from the session history but don't carry over — each session starts fresh
- On mobile/narrow screens, the split-pane collapses to a tabbed layout (Challenge | Scratchpad)

### Interactive Visualizations

Visualizations are **not** a pre-built content library. They are generated per-topic in two ways:
- **AI-generated code:** When a topic has a visualization opportunity (e.g., function graphs, physics simulations), the AI tutor generates a small self-contained HTML/Canvas snippet that runs in a sandboxed iframe. The generated code is cached per topic so it doesn't regenerate every session.
- **Future:** Hand-curated visualizations can be added as static files per topic, overriding the AI-generated version.
- Schema: `topic_id`, `visualization_code` (HTML string), `source` (ai-generated | curated), `created_at`

## Module 3: Creative Review System

Reviews feel like bonus content in a game — side quests, not mandatory grinding.

### Three Challenge Types

**1. "Teach It" Challenges**
- "Explain [concept] to a curious 12-year-old"
- "Your friend says 'derivatives are just slopes.' Are they right? What's missing?"
- "Create an analogy for [eigenvalues] using something from everyday life"
- AI evaluates explanation and returns structured feedback: `{ passed: boolean, feedback: string, follow_up_question?: string }`. "Passed" means the core concept is accurately conveyed. If not passed, the AI explains what's missing and optionally asks a follow-up. Passing a "Teach It" review advances mastery to level 3.

**2. "What If?" Challenges**
- "What would happen to planetary orbits if gravity followed a cube law instead of square?"
- "If there were no concept of zero, how would calculus be different?"
- "Remove one axiom from group theory. What breaks?"
- Counterfactual thinking — forces understanding of *why*, not just *what*
- AI evaluation returns: `{ passed: boolean, feedback: string, depth_score: 1-3 }`. Depth score reflects how far the reasoning went. Passing advances mastery toward level 5.

**3. "Connect" Challenges**
- "You know [thermodynamic entropy] and [information entropy]. What's the actual relationship?"
- "Find a real-world system that demonstrates [concept] — something not in any textbook"
- "Here's a problem that requires combining [topic A] and [topic B]..."
- Fire when skill tree detects nearby mastered nodes — boss fights bridging knowledge
- AI evaluation returns: `{ passed: boolean, feedback: string, connection_quality: string }`. Passing advances mastery toward level 4.

### How Reviews Are Triggered

**Not scheduled. No "review due" notifications or guilt.**

Reviews are woven into the flow:
- **Warm-ups:** ~30% chance a review challenge appears when starting a new session. Skippable but enticing.
- **Connection-triggered:** When skill tree detects a link to prior knowledge, it offers a Connect challenge.
- **Playground tab:** Browse available review challenges like a game menu — sorted by fun factor, not urgency.

Completing reviews increases mastery on the original topic, which can unlock deeper skill tree branches.

## Module 4: Progress & Connection Detection

### Mastery Levels (0–5)

| Level | Meaning | How to reach |
|-------|---------|-------------|
| 0 | Locked / untouched | — |
| 1 | Attempted first challenge | Submit an attempt |
| 2 | Completed core challenges | Solve the main problems |
| 3 | Can explain it | Pass a "Teach It" review |
| 4 | Can apply across domains | Pass "Connect" reviews |
| 5 | Deep mastery | Pass "What If?" counterfactuals, create novel connections |

### Session History

**Session schema:**
- `id`, `topic_id`, `mode` (challenge | dialogue), `started_at`, `ended_at`
- `messages[]` — array of `{ role: user | tutor, content: string, timestamp }`
- `attempts[]` — array of `{ content: string, hint_level_used: number, timestamp }`
- `review_results[]` — array of `{ review_type, passed, feedback, timestamp }`
- `scratchpad_content` — markdown string

All sessions are saved automatically and searchable by topic, date, or content.

**Learning journal:** Auto-generated summary (via AI) at session end — what you explored, what clicked, what you struggled with. Stored as `journal_summary` on the session record. Viewable per session or aggregated over time.

### Review Challenge Generation

All review challenges are **generated on-the-fly by the AI** when triggered. There is no pre-built pool. The generation prompt includes the topic, the user's mastery level, and related topics from the graph. Generated challenges are cached so the same topic doesn't produce duplicate challenges within a short window (7 days).

### Connection Detection Engine

- **During sessions:** AI tutor is prompted with skill tree context (list of mastered topics + current topic). When discussing a new topic that relates to a mastered one, the tutor surfaces it: "This is like [thing you know] — see the parallel?"
- **In the skill tree:** Hovering over a topic causes edges to mastered topics to glow amber. Intensity reflects edge `weight` value. This is purely graph-based (follows existing edges), no AI involved.
- **Bridge suggestions:** Uses graph distance — when two mastered nodes in different branches share a common neighbor within 2 hops that is not yet in the user's graph, the system suggests it as a bridge topic. The AI generates the suggestion text, but the detection is algorithmic (graph traversal), not LLM-based.

### No Gamification Traps

- No streaks, no daily goals, no "you missed a day" guilt
- The skill tree IS the reward — watching it grow and glow is intrinsically satisfying
- Mastery levels unlock deeper content, not score you

## AI Tutor Adapter

### Model-Agnostic Design

```
User selects model → Adapter resolves provider → Sends structured prompt → Returns response
```

- Configuration: API keys per provider stored in local `.env`
- Model switching: dropdown in the UI, persists per session or globally
- Supported providers: Claude (Anthropic), GPT (OpenAI), extensible to others

### Prompt Architecture

The tutor uses a **template-per-mode** system. Each mode has a system prompt template with variable injection:

**Templates (stored as TypeScript string templates in `lib/prompts/`):**
- `challenge-generate.ts` — generates a challenge for a topic. Injected: `{topic, subject, difficulty, mastered_topics[]}`
- `challenge-hints.ts` — generates layered hints. Injected: `{challenge, hint_level, user_attempt?}`
- `challenge-explain.ts` — generates full explanation. Injected: `{challenge, topic, user_attempt}`
- `dialogue-system.ts` — Socratic tutor system prompt. Injected: `{topic, subject, mastered_topics[], session_history[]}`
- `review-evaluate.ts` — evaluates a review response. Injected: `{review_type, challenge, user_response, topic}`
- `review-generate.ts` — generates review challenges. Injected: `{review_type, topic, related_topics[]}`

All templates follow Socratic/Feynman style by default. Subject-specific instructions (e.g., "for math proofs, insist on rigor" vs. "for physics, lead with intuition") are embedded in each template based on the `subject` tag.

### Error Handling

- **API failure:** Show a friendly inline message ("Tutor is thinking... taking longer than usual"). Retry once after 3 seconds. If still failing, offer to switch models or continue with scratchpad-only mode.
- **Rate limits:** Queue requests, show a countdown. No silent failures.
- **Invalid API key:** Detected on first call, surface a settings link to fix it.
- **Offline:** The skill tree, session history, scratchpad, and progress all work offline. Only AI dialogue/challenge generation requires connectivity. Show a clear "offline — AI features unavailable" banner.
- **Response caching:** Challenge questions and explanations are cached per topic + difficulty. Dialogue is never cached (it's conversational). Visualizations are cached per topic.

## Visual Style: Warm Notebook

The platform uses a warm, inviting aesthetic inspired by a personal workshop or notebook.

**Color Palette:**
- Background: cream/parchment (`#faf7f2`)
- Borders/dividers: warm tan (`#e8dfd3`, `#ddd2c2`)
- Primary accent: amber/gold (`#d97706`) — used for in-progress states, CTAs, highlights
- Mastered accent: dark gold (`#b8860b`)
- Text: warm dark brown (`#2d2a24` primary, `#4a4539` body, `#8a7a65` muted)
- Surfaces: warm white (`#f0e9de` cards, `white` session panel)

**Typography:**
- Headings/logo: `Instrument Serif` — elegant, approachable
- Labels/handwritten elements: `Caveat` — gives a personal, hand-drawn quality to workspace, graph labels, challenge labels
- Body: `Inter` — clean and readable
- Code/math workspace: `JetBrains Mono`

**Node States (Skill Tree):**
- Mastered: solid warm fill (`#f0e9de`), gold border (`#b8860b`)
- In-progress: light amber fill (`#fef3e2`), amber border (`#d97706`), thicker stroke
- Available: cream fill, tan dashed border — inviting but not yet started
- Locked: pale fill (`#f5f0e8`), very faint border — barely visible

**Connection glow:** amber dashed lines between related nodes, with Caveat-font label

**Workspace:** Lined-paper effect (subtle repeating horizontal lines), Caveat font for user input — feels like writing in a notebook

**Overall vibe:** Like walking into a warm, well-lit personal study — books, notebooks, a chalkboard. Not sterile, not flashy. A place where you *want* to sit and think.

## Design Principles

1. **Curiosity over curriculum** — the user's interest drives everything
2. **Struggle is the point** — problems before answers, always
3. **Understanding over memorization** — if you can't explain it simply, you don't understand it
4. **Play over routine** — review should feel recreational, not obligatory
5. **Growth is visible** — the skill tree makes learning tangible
6. **Local-first** — you own your data, your progress, your learning journey
