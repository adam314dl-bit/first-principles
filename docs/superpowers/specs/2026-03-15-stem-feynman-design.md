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

- Small hand-curated starter set for common STEM paths
- AI-generated suggestions during exploration (user approves)
- Manual user additions

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
- Full explanation unlocks after submitting an attempt (even if wrong — genuine effort is the point)
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

## Module 3: Creative Review System

Reviews feel like bonus content in a game — side quests, not mandatory grinding.

### Three Challenge Types

**1. "Teach It" Challenges**
- "Explain [concept] to a curious 12-year-old"
- "Your friend says 'derivatives are just slopes.' Are they right? What's missing?"
- "Create an analogy for [eigenvalues] using something from everyday life"
- AI evaluates explanation for accuracy and clarity, pushes back on hand-waving

**2. "What If?" Challenges**
- "What would happen to planetary orbits if gravity followed a cube law instead of square?"
- "If there were no concept of zero, how would calculus be different?"
- "Remove one axiom from group theory. What breaks?"
- Counterfactual thinking — forces understanding of *why*, not just *what*

**3. "Connect" Challenges**
- "You know [thermodynamic entropy] and [information entropy]. What's the actual relationship?"
- "Find a real-world system that demonstrates [concept] — something not in any textbook"
- "Here's a problem that requires combining [topic A] and [topic B]..."
- Fire when skill tree detects nearby mastered nodes — boss fights bridging knowledge

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

- Every dialogue, attempt, and review is saved and searchable
- Learning journal — auto-generated summary of what you explored, what clicked, what you struggled with
- Viewable per session or over time

### Connection Detection Engine

- **During sessions:** AI tutor is prompted with skill tree context. When discussing a new topic that relates to a mastered one, the tutor surfaces it: "This is like [thing you know] — see the parallel?"
- **In the skill tree:** Hovering over a topic causes edges to mastered topics to glow amber. Intensity reflects connection strength.
- **Bridge suggestions:** When two separate branches grow close conceptually, the system suggests a bridge topic: "You're close to seeing how [linear algebra] and [quantum mechanics] connect. Want to explore [Hilbert Spaces]?"

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

### Prompt Engineering

The tutor's behavior is controlled by system prompts that encode:
- Socratic questioning style
- Hint layering logic
- Skill tree context (what the user knows, what they're learning)
- Subject-specific guidelines (proofs for math, intuition-first for physics, etc.)

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
