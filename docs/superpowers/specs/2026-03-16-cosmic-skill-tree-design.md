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

- **PixiJS 8** via `@pixi/react` — WebGL 2D renderer
- **PixiJS Filters** — BlurFilter for nebulae, glow effects
- **PixiJS ParticleContainer** — efficient rendering of 400+ background stars
- **Custom ticker animations** — star twinkling, node pulsing, particle flow, nebula drift
- **CSS transitions** — zoom overlay, detail card animations
- **No D3** — completely replaced

### Component Architecture

```
CosmosTree (React wrapper)
├── PixiJS Application (WebGL canvas)
│   ├── Background Stars Layer (ParticleContainer, 400 stars)
│   ├── Nebula Layer (Container with BlurFilter)
│   ├── Connection Layer (Graphics lines)
│   ├── Particle Layer (energy flow dots)
│   └── Node Layer (interactive star containers)
│       ├── Glow circle (BlurFilter)
│       ├── Main circle (border + fill)
│       ├── Inner ring
│       ├── Physics icon (Graphics)
│       └── Corona rays (boss only)
├── Zoom Overlay (React/HTML)
│   ├── Star Orb with rings
│   ├── Node details
│   ├── Mastery bar
│   └── Action buttons
└── Stats Panel (React/HTML)
```

### Data Model Changes

Add columns to `topics` table:

```sql
ALTER TABLE topics ADD COLUMN cosmos_x REAL;
ALTER TABLE topics ADD COLUMN cosmos_y REAL;
ALTER TABLE topics ADD COLUMN cosmos_radius REAL DEFAULT 10;
ALTER TABLE topics ADD COLUMN domain TEXT DEFAULT 'core';
```

Seed positions are pre-computed to create the asymmetric layout described above. The `domain` field determines nebula region coloring.

### Pan & Zoom Implementation

- World container uses `scale` and `position` transforms
- Scroll wheel adjusts `targetScale`, ticker interpolates `scale` toward target (ease factor 0.1)
- Pointer drag updates `panX`/`panY` offsets applied to world container
- Touch events: same logic with pointer events API

### Fog of War Implementation

- On data load, compute "visible set" using BFS from mastered nodes (depth ≤ 2)
- Only render nodes in the visible set + mastered set
- Nebula opacity varies inversely with nearby mastered node density
- When a node is mastered, recompute visible set and animate newly visible nodes

### Performance Budget

- Background stars: single ParticleContainer (very cheap)
- Nebulae: 5-6 blurred circles (computed once, drifted via position)
- Interactive nodes: 50-60 Graphics objects (trivial for WebGL)
- Particles: ~20-40 small circles animating along paths
- Target: 60fps on integrated GPUs, <50MB memory

## Integration with Existing App

### What Changes

- `/tree` page: completely rewritten with CosmosTree component
- `SkillTree` D3 component: deleted
- `AddTopicModal`: kept, triggered from cosmos UI (floating action button)
- TopBar: "Skill Tree" tab renamed to "Cosmos"
- Database: topics table gets 4 new columns

### What Stays the Same

- All `/session/[topicId]` pages (challenge mode, dialogue mode, scratchpad)
- All API routes (`/api/topics`, `/api/sessions`, `/api/ai/*`)
- Playground and Journal pages
- AI adapter, prompts, review system
- Graph engine algorithms (unlocking, bridge detection)
- Database tables (topics, edges, sessions, messages, attempts, reviewResults, visualizations)

### Navigation Flow

```
Cosmos (pan/zoom/explore) →
  Click star → Zoom overlay →
    "Begin Session" → /session/[topicId] (existing page) →
      Complete session → Back to Cosmos (node now mastered, fog recedes)
```

## Success Criteria

1. The cosmic tree renders at 60fps with all animations on a mid-range laptop
2. Clicking a star triggers the cinematic zoom in <500ms
3. Fog correctly hides nodes beyond 2 hops and reveals them on mastery
4. All existing session/review/AI functionality works unchanged
5. The experience feels like a game — users want to "light up" more stars
6. Pan/zoom is smooth and responsive on both desktop and mobile
