# Cosmic Physics Skill Tree — Design Spec

## Overview

Replace the current D3 force-directed skill tree with a game-inspired **cosmic skill tree** powered by PixiJS WebGL. The tree visualizes physics knowledge as celestial objects in deep space — stars, galaxies, nebulae — creating an immersive, addictive progression system that makes learning feel like exploring the universe.

## Motivation

Learning physics is hard. The current force-directed graph is functional but feels like a diagram, not an experience. Game skill trees (Path of Exile, Mandragora, Skyrim) prove that spatial progression systems with visual rewards create dopamine loops that keep players engaged for hundreds of hours. This redesign brings that energy to learning:

- **Every mastered concept** becomes a bright star you lit up
- **Every boss challenge** is a red giant you must defeat to advance
- **Every new branch revealed** is a nebula clearing to show unknown stars
- **The tree grows asymmetrically** — dense where knowledge is deep, sparse where it's new

## Visual Identity

### Atmosphere

- **Background**: Deep space (#020108) with GPU-rendered nebula clouds that drift slowly
- **Stars**: 300-400 background stars across 3 depth layers, twinkling at independent rates
- **Nebulae**: Colored blur-filtered regions marking physics domains:
  - Blue-purple: Mechanics
  - Red-tinted: Electromagnetism
  - Teal: Waves & Optics
  - Amber: Thermodynamics
  - Faint green: Modern Physics / Quantum (mostly fogged)
- **Typography**: Cinzel (titles, labels), Cormorant Garamond italic (descriptions, constellation names)
- **No UI chrome on the map** — the cosmos IS the interface. Minimal frosted-glass overlays for stats/legend.

### Color Palette

| Element | Color | Opacity |
|---------|-------|---------|
| Deep space bg | `#020108` | 1.0 |
| Mastered star border | `#8ab0d0` to `#d0c090` (varies) | 0.25–0.35 |
| Available star border | `#60b880` | 0.25–0.30 |
| Boss star border | `#c04030` | 0.25–0.30 |
| Locked star border | `#5060a0` | 0.06–0.10 |
| Ghost star border | `#303850` | 0.02–0.04 |
| Connection lines | `#8090c0` | 0.03–0.10 |
| Nebula (Mechanics) | `#2a1050` | 0.06–0.08 |
| Nebula (E&M) | `#401520` | 0.04 |

## Node Types — Celestial Objects

### Root: Spiral Galaxy

- Largest node (r=22+), positioned at bottom-center
- Slowly rotating spiral arms (CSS/ticker animation)
- Golden core with atom orbit icon inside
- Represents "Physics" — the foundation of all knowledge
- Radiates a warm golden glow

### Learn Nodes (Stars)

- **Mastered**: Bright stars with colored borders matching their domain. Double ring (outer border + inner decorative ring). Physics icon inside (ruler, vector arrows, dx/dt, graph curve, etc.). Soft glow filter. Energy particles flow along connections between mastered nodes.
- **Available**: Green-pulsing stars. Same structure but with green border color. Pulse animation (opacity oscillates). These are the player's "frontier."
- **Locked (visible)**: Dim ghost stars. Very low opacity (0.06–0.10). No glow, no particles. Within the visible zone (2 hops from mastered).
- **Locked (fogged)**: Not rendered. Hidden behind nebula clouds.

Star sizes vary by importance: foundational concepts are larger (r=14-16), niche topics are smaller (r=7-9).

### Boss Nodes (Red Giants)

- Larger than regular stars (r=18-22)
- Red color with corona rays radiating outward (8 faint lines)
- Breathing pulse animation (slower, more dramatic than available nodes)
- Defeating a boss clears major fog sections, revealing entire new branches
- Two bosses in the physics tree:
  - **Newton's Laws** — gates the Mechanics branch
  - **Maxwell's Equations** — gates the E&M branch (far future)

### Mastery Gates

- Appear as a visual threshold between major branches
- Not a separate node — implied by the boss node blocking the path
- Defeating the boss IS the mastery gate

### Node Icons

Every node contains a physics-themed icon rendered in the star's border color at reduced opacity:

| Node | Icon Description |
|------|-----------------|
| Physics (root) | Atom with 3 orbit ellipses |
| Units | Horizontal ruler with tick marks |
| Vectors | Arrow with arrowhead + smaller component arrow |
| Calculus | dx/dt fraction |
| Graphs | Axes with curved plot line |
| Kinematics | Ball with parabolic dotted arc + velocity arrow |
| Forces | Block with push/pull arrows from both sides |
| Oscillations | Sine wave |
| Newton (boss) | Apple with stem + downward gravity arrow |
| Energy | Integral symbol ∫F |
| Momentum | Two circles approaching with arrows |
| Charge | Plus and minus symbols |
| Waves | Wave with wavelength marker λ |
| Circuits | Resistor zigzag in rectangle |
| Gravity | Planet with elliptical orbit |
| Torque | Tau symbol τ |
| Thermodynamics | PV diagram |
| Maxwell (boss) | ∇×B curl notation |

## Connections — Gravitational Lanes

- Faint translucent lines between connected nodes
- **Active connections** (mastered↔mastered): brighter (alpha 0.08–0.10), with animated energy particles flowing along them. 2 particles per active edge, moving at slightly different speeds.
- **Frontier connections** (mastered→available): medium opacity (0.06–0.08), no particles
- **Locked connections**: very faint (0.02–0.04)
- **Fogged connections**: not rendered
- Lines are straight (not curved) — keeps it clean and game-like

## Interaction Model

### Pan & Zoom

- **Scroll wheel**: Smooth eased zoom (0.3x to 3x range)
- **Click + drag**: Pan across the cosmos
- **Touch**: Pinch to zoom, drag to pan
- Zoom target smoothly interpolates (not instant snap)
- World container transforms via scale + translate

### Cinematic Zoom (Node Click)

When the player clicks an interactive star:

1. **Overlay fades in** — cosmos dims to ~12% visibility (0.5s transition)
2. **Detail card scales up** from 85% to 100% with spring easing
3. **Expanding rings** — 3 concentric ring borders pulse outward around the star orb
4. **Content reveals**:
   - Star orb (colored based on node type)
   - Node name (Cinzel, large)
   - Type badge ("Mastered", "Available — Ready to learn", "★ Boss Challenge")
   - Description (Cormorant Garamond italic)
   - Mastery bar (thin, colored by type)
   - Prerequisites list (if applicable)
   - Action buttons
5. **Actions**:
   - "BEGIN SESSION →" (available nodes) — navigates to `/session/[topicId]`
   - "⚔ ACCEPT CHALLENGE" (boss nodes) — navigates to `/session/[topicId]`
   - "REVIEW →" (mastered nodes) — navigates to `/session/[topicId]`
   - "BACK TO COSMOS" — reverse animation, returns to map
6. **Click overlay** to dismiss (same as "Back to Cosmos")

### Hover Effects

- Interactive stars scale up to 1.12x on hover
- Cursor changes to pointer
- Locked/ghost stars have no hover effect and default cursor

## Progression & Fog of War

### Hybrid Visibility System

- **Bright zone**: All mastered nodes — fully visible, glowing, particles flowing
- **Frontier zone**: Nodes within 1 hop of mastered — available nodes (green pulsing)
- **Visible locked zone**: Nodes within 2 hops of mastered — dim ghost stars, visible but not interactive
- **Fog zone**: Everything beyond 2 hops — hidden behind nebula clouds, not rendered
- Fog boundary is soft (nebula blur), not a hard edge

### Fog Reveal Animation

When a node is mastered:
1. Check if any previously fogged nodes now fall within the 2-hop visible zone
2. New nodes fade in from zero opacity over 1-2 seconds
3. Nebula in that region thins slightly (reduced alpha)
4. If a boss is defeated, a larger fog section clears dramatically

### Progression Flow

```
Foundations (mastered) →
  Learn nodes (available, green) →
    Complete sessions to master →
      New nodes revealed from fog →
        Boss node becomes reachable →
          Defeat boss (challenge mode) →
            Major branch unlocks →
              Deeper fog clears
```

## Layout — Asymmetric World Tree

The tree grows upward from the root galaxy. Branches are asymmetric — reflecting the actual prerequisite structure of physics:

- **Mechanics** (left, dense): ~20 nodes. Deepest branch. Kinematics → Forces → Newton (boss) → Projectile/Friction/Torque/Gravity → Rotational Dynamics → Fluids → Conservation Laws
- **Electromagnetism** (right, sparse): ~12 nodes. Charge → Coulomb → Circuits → Magnetism → Maxwell (boss) → EM Waves → Induction
- **Waves & Optics** (center-right): ~8 nodes. Oscillations → Wave Mechanics → Sound → Optics → Interference → Diffraction
- **Thermodynamics** (far right): ~8 nodes. Heat → Thermo Laws → Entropy → Carnot → Statistical Mechanics
- **Modern Physics** (crown, mostly fogged): ~6 nodes. Relativity → Quantum → Nuclear. Only revealed after deep progress.

Total: ~52-60 nodes. Node positions are pre-computed and stored in the database (not force-simulated).

Cross-domain connections exist (e.g., Waves ↔ Optics ↔ E&M, Energy ↔ Thermo) creating the web-like feel of real physics.

## Technical Architecture

### Technology Stack

- **PixiJS 8** — WebGL 2D renderer, used imperatively via `useEffect`/`useRef` (NOT `@pixi/react`, which lacks a stable v8 release)
- **PixiJS Filters** — BlurFilter for glow effects on nodes
- **PixiJS ParticleContainer** — efficient rendering of 400+ background stars
- **Custom ticker animations** — star twinkling, node pulsing, particle flow, nebula drift
- **CSS transitions** — zoom overlay, detail card animations
- **No D3** — completely replaced. Remove `d3` and `@types/d3` from `package.json`.

### SSR Strategy

PixiJS accesses browser globals (`window`, `WebGLRenderingContext`, `document.createElement("canvas")`) at module evaluation time. The CosmosTree component MUST be loaded with SSR disabled:

```tsx
// src/app/tree/page.tsx
import dynamic from "next/dynamic";
const CosmosTree = dynamic(() => import("@/components/cosmos/CosmosTree"), { ssr: false });
```

The component itself uses `"use client"` and initializes PixiJS inside a `useEffect` with an async IIFE:

```tsx
useEffect(() => {
  let app: Application;
  (async () => {
    app = new Application();
    await app.init({ resizeTo: containerRef.current!, background: 0x020108, antialias: true });
    containerRef.current?.appendChild(app.canvas);
    setCanvasReady(true);
    // ... build scene
  })();
  return () => { app?.destroy(true); };
}, []);
```

A loading state is shown until `canvasReady` is true.

### Font Loading

Add Cinzel and Cormorant Garamond to `src/app/layout.tsx`:

```tsx
import { Cinzel, Cormorant_Garamond } from "next/font/google";
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", display: "swap" });
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"],
  variable: "--font-cormorant", display: "swap"
});
```

Register `--font-cinzel` and `--font-cormorant` in `globals.css` `@theme {}` block.

### Component Architecture

```
CosmosTree ("use client", dynamic import ssr:false)
├── Loading state (shown while PixiJS initializes)
├── Canvas container (ref, PixiJS appends canvas here)
├── PixiJS Application (WebGL, imperative via useEffect)
│   ├── Background Stars Layer (ParticleContainer, 400 stars)
│   ├── Nebula Layer (Container — pre-baked RenderTexture sprites, NOT live BlurFilter)
│   ├── Connection Layer (Graphics lines)
│   ├── Particle Layer (energy flow dots)
│   └── Node Layer (interactive star containers)
│       ├── Glow circle (BlurFilter on individual nodes only)
│       ├── Main circle (border + fill, separate Graphics for stroke alpha)
│       ├── Inner ring
│       ├── Physics icon (Graphics)
│       └── Corona rays (boss only)
├── Zoom Overlay (React/HTML, CSS transitions)
│   ├── Star Orb with expanding rings
│   ├── Node details (name, type, description)
│   ├── Mastery bar
│   └── Action buttons
└── Stats Panel (React/HTML, frosted glass)
```

### Data Model Changes

Update `src/lib/db/schema.ts` to add new columns to the `topics` table:

```typescript
cosmosX: real("cosmos_x"),
cosmosY: real("cosmos_y"),
cosmosRadius: real("cosmos_radius").default(10),
domain: text("domain").default("core"),
nodeType: text("node_type").default("star"), // 'galaxy' | 'star' | 'boss'
```

The `nodeType` column drives visual rendering and interaction rules:
- `galaxy` — the root node (spiral galaxy visual)
- `star` — standard learn nodes
- `boss` — boss challenge nodes (red giant visual, corona rays)

Apply migration via: `npx drizzle-kit generate && npx drizzle-kit push`

### Seed Data & Migration Plan

1. **Schema update**: Add 5 new nullable columns to `topics` table in `schema.ts`
2. **Seed data**: Create a new `src/data/seed-cosmos.json` file containing the 52-60 physics topics with pre-computed `cosmos_x`, `cosmos_y`, `cosmos_radius`, `domain`, and `node_type` values. This replaces the physics topics in the existing `seed-topics.json`.
3. **Existing topic IDs**: Preserve IDs that overlap (e.g., `kinematics`, `newtons-laws`). Existing user sessions tied to these IDs remain valid.
4. **Seed script**: Update `src/lib/db/seed.ts` to read from `seed-cosmos.json` and populate all new columns. The `npm run db:seed` command rebuilds the full graph.
5. **AddTopicModal**: When a user adds a custom topic via the modal, auto-place it at a computed position offset from an existing connected node (e.g., +50px x, +30px y from the nearest prerequisite). The POST route `/api/topics` sets default `cosmos_radius=10`, `domain='core'`, `nodeType='star'`.

### In-Progress Node Status

The existing schema has 4 statuses: `locked`, `available`, `in-progress`, `mastered`. The cosmos renders them as:

| Status | Visual | BFS Origin? |
|--------|--------|-------------|
| `mastered` | Bright star, full glow, particles | Yes |
| `in-progress` | Bright star with amber/warm tint (distinct from mastered blue/white) | Yes (counts as explored) |
| `available` | Green pulsing star | No |
| `locked` | Dim ghost or fogged | No |

Both `mastered` and `in-progress` nodes serve as BFS origins for fog clearing, since the player has actively engaged with them.

### Pan & Zoom Implementation

- World container uses `scale` and `position` transforms
- Scroll wheel adjusts `targetScale`, ticker interpolates `scale` toward target (ease factor 0.1)
- Pointer drag updates `panX`/`panY` offsets applied to world container
- **Touch/pinch zoom**: Track multiple `pointerId` values via `pointerdown`/`pointermove`. Compute distance between two active pointers; delta maps to scale change. This is a distinct implementation task.

### Fog of War Implementation

- On data load, compute "visible set" using BFS from mastered + in-progress nodes (depth ≤ 2)
- Only render nodes in the visible set
- Nebula opacity varies inversely with nearby mastered node density
- When a node is mastered, recompute visible set and animate newly visible nodes

### Fog Reveal on Return from Session

When a player masters a topic in `/session/[topicId]` and returns to the cosmos:

1. Session page navigates to `/tree?mastered=topicId` (query param)
2. CosmosTree reads `mastered` param on mount
3. Computes the "old visible set" (excluding the newly mastered node) and "new visible set" (including it)
4. Diff the two sets — any nodes in new but not old get a fade-in animation (0→1 opacity over 1.5s)
5. If the mastered node was a boss, trigger a dramatic nebula-clearing animation (wider area, slower reveal)
6. Clear the query param from the URL via `router.replace("/tree")` after animation completes

### Performance Budget

- Background stars: single ParticleContainer (very cheap)
- **Nebulae: pre-baked RenderTexture sprites** — each nebula is rendered ONCE at startup with BlurFilter applied to a RenderTexture, then displayed as a simple Sprite. Drifting the sprite changes only its position (no re-blur per frame). This avoids the 10-20ms/frame cost of live BlurFilter on large areas.
- Individual node glow: small BlurFilter per active node (small radius, cheap)
- Interactive nodes: 50-60 Graphics objects (trivial for WebGL)
- Particles: ~20-40 small circles animating along paths
- Target: 60fps on integrated GPUs, <50MB memory

## Integration with Existing App

### What Changes

- `/tree` page: completely rewritten with CosmosTree component (dynamic import, ssr:false)
- `SkillTree` D3 component: deleted
- `AddTopicModal`: kept, auto-places new topics at computed positions
- TopBar: "Skill Tree" tab label renamed to "Cosmos" (route stays `/tree` to avoid breaking links)
- Database: topics table gets 5 new columns
- Layout: add Cinzel + Cormorant Garamond fonts
- Dependencies: add `pixi.js`, remove `d3` and `@types/d3`

### What Stays the Same

- All `/session/[topicId]` pages (challenge mode, dialogue mode, scratchpad)
- All API routes (`/api/topics`, `/api/sessions`, `/api/ai/*`)
- Playground and Journal pages
- AI adapter, prompts, review system
- Graph engine algorithms (unlocking, bridge detection)
- Database tables (topics, edges, sessions, messages, attempts, reviewResults, visualizations)
- Route path `/tree` (only the display label changes to "Cosmos")

### Test Updates

- Delete `src/__tests__/skill-tree.test.tsx` (tests deleted SkillTree component)
- Add `src/__tests__/cosmos-tree.test.tsx` with smoke tests: canvas container renders, zoom overlay toggles on node click, data-testid for the canvas wrapper
- Update `src/__tests__/topbar.test.tsx`: change assertion from `"Skill Tree"` to `"Cosmos"`

### Navigation Flow

```
Cosmos (pan/zoom/explore) →
  Click star → Zoom overlay →
    "Begin Session" → /session/[topicId] (existing page) →
      Complete session → navigates to /tree?mastered=topicId →
        CosmosTree animates fog reveal → new stars appear
```

## Success Criteria

1. The cosmic tree renders at 60fps with all animations on a mid-range laptop
2. Clicking a star triggers the cinematic zoom in <500ms
3. Fog correctly hides nodes beyond 2 hops and reveals them on mastery
4. Fog reveal animation plays when returning from a completed session
5. All existing session/review/AI functionality works unchanged
6. The experience feels like a game — users want to "light up" more stars
7. Pan/zoom is smooth and responsive on both desktop and mobile
8. In-progress topics render distinctly from mastered and available
9. Boss nodes are visually distinct and their defeat triggers dramatic fog clearing
10. New topics added via AddTopicModal appear at valid positions
