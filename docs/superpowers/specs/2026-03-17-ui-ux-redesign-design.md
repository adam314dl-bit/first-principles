# UI/UX Redesign — Dark Fantasy RPG + Minimal Scholar

**Date:** 2026-03-17
**Status:** Approved

## Overview

Redesign First Principles into a dual-mode interface: an immersive Dark Fantasy RPG aesthetic for exploration (cosmos, navigation, overlays, journal, playground) and a distraction-free Minimal Scholar mode for study sessions (challenge + dialogue). The transition between modes uses an "airlock" pattern — the zoom overlay acts as a decompression chamber from game to study.

## Design Principles

1. **Immersion when exploring, invisibility when studying** — the UI should feel like a game when browsing the cosmos, then strip away completely when learning.
2. **Warm palette throughout** — no cold blues in the game UI. Gold, amber, crimson, ember orange.
3. **Scholarly readability** — study mode uses editorial-grade serif typography with research-backed spacing for sustained reading comfort.
4. **Progressive disclosure** — tools and controls appear only when needed, reducing cognitive load.

## Color System

### Game Palette (Cosmos, Nav, Overlays, Journal, Playground)

| Token | Value | Usage |
|-------|-------|-------|
| `--game-bg` | `#080604` | Primary background |
| `--game-surface` | `rgba(20,14,8,.95)` | Nav, card surfaces |
| `--game-surface-alt` | `rgba(12,8,6,.95)` | Gradient endpoint |
| `--gold` | `rgba(200,160,60,1)` | Primary accent |
| `--gold-bright` | `rgba(220,180,80,1)` | Highlights, active states |
| `--gold-muted` | `rgba(180,140,40,1)` | Subtle borders, inactive |
| `--gold-glow` | `rgba(200,140,40,.15)` | Box-shadow glow |
| `--crimson` | `rgba(180,60,40,1)` | Boss nodes, danger |
| `--ember` | `rgba(220,120,20,.3)` | Particle effects |
| `--green-avail` | `rgba(120,200,80,1)` | Available nodes |
| `--text-gold` | `rgba(200,160,60,.5)` | Primary text on dark |
| `--text-muted-game` | `rgba(200,160,60,.15)` | Muted labels |

### Study Palette — Light Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--study-bg-light` | `#fdfdfc` | Page background |
| `--study-surface-light` | `#fafaf8` | Header, card backgrounds |
| `--study-text-light` | `#2a2a2a` | Body text |
| `--study-text-muted-light` | `rgba(0,0,0,.25)` | Labels, back link |
| `--study-border-light` | `rgba(0,0,0,.06)` | Card borders |
| `--study-accent` | `#5b7bb5` | Hint accent, active indicators |
| `--study-btn-bg-light` | `#2a2a2a` | Button fill |

### Study Palette — Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--study-bg-dark` | `#111118` | Page background |
| `--study-surface-dark` | `rgba(255,255,255,.02)` | Card backgrounds |
| `--study-text-dark` | `rgba(220,215,235,.6)` | Body text |
| `--study-text-muted-dark` | `rgba(255,255,255,.15)` | Labels |
| `--study-border-dark` | `rgba(255,255,255,.04)` | Card borders |
| `--study-accent-dark` | `rgba(91,123,181,.5)` | Hint accent muted |
| `--study-btn-bg-dark` | `rgba(255,255,255,.08)` | Button fill |

## Typography

| Context | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Game titles / cosmos headings | Cinzel | 10-14px | 600-700 | 1.2 |
| Game nav links | Cinzel | 10px | 600 | 1.0 |
| Node labels (PixiJS) | Cinzel (bitmap) | 6-8px | 600 | — |
| Cosmos descriptions / flavor | Cormorant Garamond italic | 10-13px | 400 | 1.4 |
| Zoom overlay title | Cinzel | 22px | 700 | 1.2 |
| Zoom overlay description | Cormorant Garamond | 14px | 400 | 1.8 |
| Study body text | EB Garamond | 17px | 400 | 1.85 |
| Study headings | EB Garamond | 18px | 500 | 1.3 |
| Study UI labels / buttons | Inter | 11-12px | 500 | 1.0 |
| Study chat role labels | Inter | 10px | 600 | 1.0 |

**New font to add:** EB Garamond (Google Fonts) — loaded in `layout.tsx` alongside existing fonts, registered as `--font-eb-garamond` in `globals.css`.

**Line length target:** 65-75 characters for study body text. Achieved via `max-width: ~680px` on challenge cards and chat bubbles.

## Components

### 1. TopBar — Dark Fantasy HUD

**Current:** Light cream bar with amber accents, Inter font.
**New:** Dark gradient bar with gold ornamental styling.

```
┌─────────────────────────────────────────────────────┐
│ ◆  First Principles    Cosmos · Playground · Journal    Oracle: [Claude Sonnet] ◆ │
└─────────────────────────────────────────────────────┘
```

- Background: linear-gradient `--game-surface` → `--game-surface-alt`
- Border: `1px solid rgba(180,140,60,.12)` with `inset` top highlight
- Logo: Cinzel 14px 700, `--text-gold` with `text-shadow: 0 0 20px var(--gold-glow)`
- Nav links: Cinzel 10px 600, letter-spacing 3px, uppercase
- Active link: gold text + bottom glow line (`box-shadow: 0 0 6px`)
- Dot separator `·` between nav links
- Corner ornaments: `◆` pseudo-elements at left/right edges
- Model selector: labeled "Oracle", gold-bordered dropdown
- Height: 52px

**Conditional behavior:** When on `/session/*` route, TopBar transforms to the simplified study bar (see Study Session section).

### 2. Cosmos Skill Tree — PixiJS Changes

**File:** `src/components/cosmos/CosmosTree.tsx` + layer files

#### Background & Atmosphere
- Canvas background: `0x080604` (warm dark) instead of `0x020108`
- Nebulae colors shift to warm: amber `rgba(180,100,20,.06)`, crimson `rgba(120,40,40,.05)`, burnt orange `rgba(100,60,20,.04)`
- Star field: tint to `rgba(200,160,80)` warm tones
- Vignette: warm-tinted `rgba(8,6,4,.7)`

#### Ornamental Frame (new layer)
- Four corner brackets rendered as PixiJS Graphics: L-shaped gold lines in each corner
- Inner border: thin gold line 6px from edge, `rgba(180,140,60,.05)`

#### Node Rendering — Shield Shape
- Replace circle rendering with shield polygon path:
  ```
  polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)
  ```
- In PixiJS: draw via `Graphics.poly()` with the 6-point shield vertices
- Node sizes: Galaxy 56px, Mastered 36px, Available 28px, Locked 20px, Boss 48px

#### Node Colors by Status
- **Mastered:** Gold fill `rgba(200,160,60,.08)`, gold border `rgba(200,160,60,.2)`, gold glow
- **Available:** Green fill `rgba(120,200,80,.06)`, green border `rgba(120,200,80,.15)`, float animation
- **Boss:** Crimson fill `rgba(180,40,40,.06)`, crimson border `rgba(180,60,40,.15)`, double border
- **Locked:** Near-invisible `rgba(200,160,60,.02)` fill, `rgba(200,160,60,.03)` border
- **Galaxy:** Largest shield, gold with pulsing glow animation

#### Connection Lines
- Color: warm gold `rgba(200,160,60,.06)` for visible, near-invisible for locked
- Style: solid (not dashed) for mastered connections, subtle for frontier

#### Ember Particles (new)
- Add 8-12 small ember particles (2px, orange/amber) that drift upward near the center
- Slow vertical movement with sine-wave horizontal drift
- Alpha: 0.15-0.3, warm orange color

#### Labels
- Cinzel font rendered as bitmap text in PixiJS
- Gold tint matching node status
- Letter-spacing 2px, uppercase, 6-8px

### 3. ZoomOverlay — Fantasy Panel

**File:** `src/components/cosmos/ZoomOverlay.tsx`

**Structure:**
```
[Dark warm backdrop rgba(12,8,6,.98)]
  [Gold radial glow behind panel]
    [Shield-shaped orb — node status color]
      [Inner border detail]
    [Title — Cinzel 22px 700, gold text-shadow]
    [Status — Cormorant Garamond italic, status color]
    [Description — Cormorant Garamond 14px, muted gold]
    [Mastery label — Cinzel 8px, letter-spacing 3px]
    [Mastery bar — gold gradient fill]
    [Buttons row]
      [◁ RETURN — gold outline]
      [⚔ BEGIN SESSION — green outline (available)]
      [★ BOSS CHALLENGE — crimson outline (boss)]
```

**Status-specific styles:**
- Available: green status text, green primary button
- Mastered: gold status, "REVIEW →" button text
- Boss: crimson orb, crimson "★ BOSS CHALLENGE" button
- Locked: dim everything, no action button

### 4. Study Session — Minimal Scholar

**File:** `src/app/session/[topicId]/page.tsx` + session components

#### Study TopBar (replaces game TopBar on session pages)
- Simplified thin bar (44px height)
- Light mode: `#fafaf8` background, thin bottom border
- Dark mode: `rgba(255,255,255,.015)` background
- Content: `← Cosmos · [Topic Name] · [Challenge | Dialogue] · [☀/☾ toggle] · [End Session]`
- EB Garamond for topic name, Inter for everything else
- No ornaments, no gold, no game styling

#### Dark/Light Toggle
- Small sun/moon icon button in the study topbar
- Persisted per-session (or use system preference)
- Toggles CSS variables on the study container

#### Challenge Mode
- **Challenge card:** EB Garamond 17px, 1.85 line height, max-width 680px
  - Light: white bg, `rgba(0,0,0,.06)` border, `#2a2a2a` text
  - Dark: `rgba(255,255,255,.02)` bg, `rgba(255,255,255,.04)` border, `rgba(220,215,235,.6)` text
- **Hint cards:** Left blue border accent (`#5b7bb5`), EB Garamond 15px
- **Attempt textarea:** EB Garamond 16px, 1.8 line height, subtle border
- **Submit button:** Dark fill (light mode), outline (dark mode), Inter 12px

#### Dialogue Mode
- **Chat bubbles:** Rounded corners (12px), EB Garamond 16px, 1.75 line height
  - Tutor: left-aligned, light card
  - User: right-aligned, slightly different shade
- **Role labels:** Inter 10px 600, uppercase, letter-spacing 1px, very muted
- **Input bar:** Bottom-fixed, EB Garamond textarea, subtle border, Send button

#### Scratchpad
- Keeps current lined-paper aesthetic but uses EB Garamond
- Adapts to dark/light mode

### 5. Journal Page — Fantasy Themed

**File:** `src/app/journal/page.tsx`

- Dark warm background matching cosmos
- Session history cards with gold ornamental borders
- Cinzel headings, Cormorant Garamond for summaries
- Date labels in muted gold
- Mastery indicators using shield-shaped progress markers

### 6. Playground Page — Fantasy Themed

**File:** `src/app/playground/page.tsx`

- Dark warm background
- Review challenge cards framed with fantasy gold borders
- Challenge type labels (teach-it, what-if, connect) as ornamental badges
- Cinzel headings, warm color coding

### 7. Transition Animation

**From Cosmos → Study:**
1. User clicks shield node → ZoomOverlay appears (fantasy styled)
2. User clicks "⚔ BEGIN SESSION" → 400ms cross-dissolve:
   - Fantasy overlay fades out
   - Background shifts from warm dark to study bg (light or dark)
   - TopBar morphs from fantasy to study bar
3. Study session renders with clean scholarly UI

**From Study → Cosmos:**
1. User clicks "← Cosmos" or "End Session"
2. 300ms fade back to cosmos view
3. If mastered, trigger celebration animation on the node

## Files to Create

| File | Purpose |
|------|---------|
| `src/styles/game-theme.css` | Game UI CSS variables and base styles |
| `src/styles/study-theme.css` | Study mode CSS variables (light + dark) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add new color tokens, import theme files |
| `src/app/layout.tsx` | Add EB Garamond font import |
| `src/components/TopBar.tsx` | Dark fantasy restyle, conditional study bar |
| `src/components/cosmos/CosmosTree.tsx` | Background color, vignette warmth |
| `src/components/cosmos/cosmos-layers.ts` | Shield nodes, warm colors, ember particles, ornamental frame |
| `src/components/cosmos/cosmos-fog.ts` | Adjust alpha values for warm palette |
| `src/components/cosmos/ZoomOverlay.tsx` | Full fantasy restyle |
| `src/components/cosmos/StatsPanel.tsx` | Fantasy-styled stats HUD |
| `src/app/session/[topicId]/page.tsx` | Minimal Scholar layout, dark/light toggle |
| `src/components/session/ChallengeMode.tsx` | Scholar typography, themed cards |
| `src/components/session/DialogueMode.tsx` | Scholar chat bubbles |
| `src/components/session/Scratchpad.tsx` | Adapt to dark/light |
| `src/components/session/ModeToggle.tsx` | Restyle for study bar |
| `src/app/journal/page.tsx` | Fantasy theme |
| `src/app/playground/page.tsx` | Fantasy theme |

## Testing Considerations

- Existing PixiJS mocks in `cosmos-tree.test.tsx` remain valid (shape changes are visual only)
- Add visual regression snapshots if feasible
- Test dark/light toggle persistence
- Test TopBar conditional rendering (game vs study mode)
- Ensure EB Garamond loads correctly (add to font mock if needed)
- Test transition animations don't break session state

## Out of Scope

- Mobile responsiveness (separate initiative)
- Spaced repetition / mastery decay
- Search functionality
- New PixiJS shaders (keep current Graphics-based rendering)
- Sound effects
