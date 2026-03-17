# UI/UX Redesign — Dark Fantasy RPG + Minimal Scholar

**Date:** 2026-03-17
**Status:** Approved

## Overview

Redesign First Principles into a dual-mode interface: an immersive Dark Fantasy RPG aesthetic for exploration (cosmos, navigation, overlays, journal, playground) and a distraction-free Minimal Scholar mode for study sessions (challenge + dialogue). The transition between modes uses an "airlock" pattern — the zoom overlay acts as a decompression chamber from game to study.

## Design Principles

1. **Immersion when exploring, invisibility when studying** — the UI should feel like a game when browsing the cosmos, then strip away completely when learning.
2. **Warm palette for game UI** — no cold blues in cosmos, navigation, overlays. Gold, amber, crimson, ember orange. Study mode is intentionally neutral (cool blue hint accent `#5b7bb5` is permitted for readability contrast against warm-free scholarly backgrounds).
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
| `--text-gold` | `rgba(200,160,60,.75)` | Primary readable text on dark (≥4.5:1 contrast) |
| `--text-gold-decorative` | `rgba(200,160,60,.4)` | Decorative labels, non-essential text |
| `--text-muted-game` | `rgba(200,160,60,.2)` | Very muted labels, ornamental |

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
- Replace circle rendering with shield polygon path.
- CSS equivalent: `polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)`
- **PixiJS implementation:** Given a node with half-width `hw` and half-height `hh` (where `hh = hw * 1.2` for the shield aspect ratio), centered at `(cx, cy)`, compute the 6 vertices:
  ```
  const shieldPath = [
    cx,        cy - hh,       // top center
    cx + hw,   cy - hh * 0.6, // top-right
    cx + hw,   cy + hh * 0.4, // bottom-right
    cx,        cy + hh,       // bottom center
    cx - hw,   cy + hh * 0.4, // bottom-left
    cx - hw,   cy - hh * 0.6, // top-left
  ];
  graphics.poly(shieldPath);
  graphics.fill({ color, alpha });
  graphics.stroke({ color: borderColor, width: borderWidth, alpha: borderAlpha });
  ```
- Node sizes (width × height): Galaxy 56×67px, Mastered 36×43px, Available 28×34px, Locked 20×24px, Boss 48×58px

#### Node Colors by Status
- **Mastered:** Gold fill `rgba(200,160,60,.08)`, gold border `rgba(200,160,60,.2)`, gold glow `0 0 20px rgba(200,140,40,.1)`
- **In-progress:** Amber fill `rgba(200,160,60,.05)`, amber border `rgba(200,160,60,.15)`, subtle pulse animation (alpha 0.6-0.9)
- **Available:** Green fill `rgba(120,200,80,.06)`, green border `rgba(120,200,80,.15)`, float animation (translateY ±4px, 3s)
- **Boss:** Crimson fill `rgba(180,40,40,.06)`, crimson border `rgba(180,60,40,.15)`, double border (outer ring 4px offset)
- **Locked:** Near-invisible `rgba(200,160,60,.02)` fill, `rgba(200,160,60,.03)` border, no label
- **Galaxy:** Largest shield, gold with pulsing glow animation (box-shadow oscillates 8-20px spread)

#### Connection Lines
- Color: warm gold `rgba(200,160,60,.06)` for visible, near-invisible for locked
- Style: solid (not dashed) for mastered connections, subtle for frontier

#### Ember Particles (new)
- Add 8-12 small ember particles (2px, orange/amber) that drift upward near the center
- Slow vertical movement with sine-wave horizontal drift
- Alpha: 0.15-0.3, warm orange color

#### Labels
- Use PixiJS `Text` with standard web fonts (Cinzel loaded via Google Fonts in the page). PixiJS 8 `Text` renders web fonts onto canvas — no bitmap font atlas needed. The fonts are already loaded by `layout.tsx` so they are available when PixiJS renders.
- Gold tint matching node status
- Style: `fontFamily: 'Cinzel'`, `fontSize: 6-8`, `fill: statusColor`, `letterSpacing: 2`, `textTransform` applied manually (`.toUpperCase()`)

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
- **Available:** green status text `rgba(120,200,80,.3)`, green primary button border, orb glow green
- **In-progress:** amber status text `rgba(200,160,60,.3)`, "CONTINUE SESSION →" button, orb glow amber
- **Mastered:** gold status text, "REVIEW →" button text, orb glow gold
- **Boss:** crimson status text `rgba(200,80,60,.3)`, crimson "★ BOSS CHALLENGE" button, orb glow crimson
- **Locked:** dim everything (all elements at 30% opacity), no action button, status text "Prerequisites required"

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
- **Persistence:** `localStorage` key `study-theme` with values `"light"` or `"dark"`. Falls back to `"light"` if no preference stored. Checked on mount via `useEffect` to avoid hydration mismatch.
- **Implementation:** Toggles a `data-study-theme="dark"` attribute on the session page container. CSS variables are scoped under `[data-study-theme="dark"]` selector in `study-theme.css`.

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

**Layout:**
```
[Full-page bg: --game-bg]
  [Page header]
    [Cinzel 14px 600, "JOURNAL OF DISCOVERY", --text-gold-decorative]
    [Cormorant italic 12px, "A record of your journey", --text-muted-game]
  [Session list — vertical stack, 12px gap]
    [Session card — for each completed session]
```

**Session Card Structure:**
- Background: `--game-surface` with `1px solid rgba(180,140,60,.08)` border
- Padding: 20px 24px
- **Header row:** Topic name (Cinzel 13px 600, `--text-gold`), date (Cormorant italic 11px, `--text-muted-game`), mastery shield icon (tiny 16×19px shield filled to mastery level)
- **Summary:** Cormorant Garamond 14px 400, `--text-gold-decorative`, line-height 1.7, max 3 lines with overflow ellipsis
- **Footer row:** Session duration (Cormorant italic 11px), mode badge ("Challenge" or "Dialogue" in Cinzel 8px, letter-spacing 2px, gold outline pill)
- **Date group headers:** When sessions span multiple days, group with a thin divider and date label (Cinzel 9px, letter-spacing 3px, `--text-muted-game`)

### 6. Playground Page — Fantasy Themed

**File:** `src/app/playground/page.tsx`

**Layout:**
```
[Full-page bg: --game-bg]
  [Page header]
    [Cinzel 14px 600, "THE PROVING GROUNDS", --text-gold-decorative]
    [Cormorant italic 12px, "Test your mastery", --text-muted-game]
  [Available topics grid — 2 columns, 16px gap]
    [Topic card — for each mastered topic]
```

**Topic Card Structure:**
- Background: `--game-surface` with `1px solid rgba(180,140,60,.08)` border
- Padding: 24px
- **Topic name:** Cinzel 14px 600, `--text-gold`
- **Mastery level:** Row of 5 small shields (12×14px each), filled shields for earned levels, outline for remaining
- **Challenge type buttons** (shown based on mastery level):
  - Mastery ≥2: "TEACH IT" — Cinzel 9px, letter-spacing 2px, gold outline button
  - Mastery ≥3: "WHAT IF?" — same style, amber tint
  - Mastery ≥4: "CONNECT" — same style, green tint
  - Each button: `padding: 8px 20px`, `border: 1px solid` with status color at `.12` alpha
- **Locked challenges:** Same button shape but dimmed (opacity .3), tooltip "Reach mastery level X"

### 7. Transition Animation

**Mechanism:** The current flow uses `<a href>` for full page navigation. We keep full page navigation (no client-side router hacks needed). The transition effect is achieved by:
1. Each page applies its own background immediately on mount (game pages set `--game-bg`, study pages set their study bg).
2. A CSS `animation: fadeIn 300ms ease-out` on the main content container provides a subtle entrance.
3. The ZoomOverlay "airlock" creates the psychological transition — users see topic info in fantasy style, then consciously choose to enter study mode.

**From Cosmos → Study:**
1. User clicks shield node → ZoomOverlay appears with 500ms zoom-in animation (fantasy styled)
2. User clicks "⚔ BEGIN SESSION" → standard `<a href="/session/[id]">` navigation
3. Session page mounts with `animation: fadeIn 300ms ease-out` — clean study UI appears
4. Body background is set by the session page layout (not inherited from cosmos)

**From Study → Cosmos:**
1. User clicks "← Cosmos" or "End Session" → standard `<a href>` or `window.location` navigation
2. Cosmos page mounts, PixiJS initializes (existing loading state: "CHARTING THE COSMOS...")
3. If `?mastered=topicId` param present, auto-select that node and show celebration

**No View Transitions API or shared layout transitions needed.** The "airlock" pattern (ZoomOverlay) provides the mental transition. The actual page navigation is instant.

## Error & Loading States

### Game Mode (Cosmos, Journal, Playground)
- **Loading spinners:** Gold-colored ring spinner (`border: 2px solid rgba(200,160,60,.1)`, `border-top-color: rgba(200,160,60,.5)`), with Cormorant italic loading text in `--text-gold-decorative`
- **Error messages:** Crimson-tinted card (`background: rgba(180,60,40,.06)`, `border: 1px solid rgba(180,60,40,.12)`, `color: rgba(220,100,80,.6)`)
- **Empty states:** Cormorant Garamond italic, centered, `--text-muted-game`

### Study Mode (Challenge, Dialogue)
- **Loading spinners:** `--study-accent` colored ring spinner (light mode) or `--study-accent-dark` (dark mode), with Inter loading text
- **Error messages:** Light mode: `background: #fef2f2`, `border: 1px solid rgba(220,60,60,.15)`, `color: #b91c1c`. Dark mode: `background: rgba(220,60,60,.04)`, `border: 1px solid rgba(220,60,60,.1)`, `color: rgba(220,120,120,.6)`
- **Empty states:** EB Garamond italic, centered, muted text

## Body Background Strategy

The `body` background in `globals.css` is removed. Instead, each page/layout sets its own background:

- **Cosmos page (`/tree`):** Sets `bg-[#080604]` on its root container (already does `bg-[#020108]`, just changes the color)
- **Session page (`/session/*`):** Sets study background via `data-study-theme` attribute — light `#fdfdfc` or dark `#111118`
- **Journal page (`/journal`):** Sets `bg-[#080604]` (game theme)
- **Playground page (`/playground`):** Sets `bg-[#080604]` (game theme)
- **Root layout:** `body` gets `bg-[#080604]` as the default (game theme), so any unthemed pages default to dark

## Cosmos Overlay Text Colors

The existing HTML overlays in `CosmosTree.tsx` (title, subtitle, loading text) shift from cool blue-grey to warm gold:

| Element | Current Color | New Color |
|---------|--------------|-----------|
| Title "THE PHYSICS COSMOS" | `rgba(160,170,200,.35)` | `rgba(200,160,60,.25)` |
| Subtitle "scroll to zoom..." | `rgba(120,130,160,.2)` | `rgba(200,160,60,.12)` |
| Loading "CHARTING THE COSMOS..." | `rgba(140,150,180,.25)` | `rgba(200,160,60,.2)` |

## TopBar Ornament Positioning

- Corner diamond `◆`: `font-size: 8px`, `color: rgba(180,140,60,.2)`, positioned via `::before` (left) and `::after` (right) pseudo-elements
- Left diamond: `position: absolute; left: 10px; top: 50%; transform: translateY(-50%)`
- Right diamond: `position: absolute; right: 10px; top: 50%; transform: translateY(-50%)`
- Inner top highlight: `box-shadow: inset 0 1px 0 rgba(180,140,60,.08)` on the nav container

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
| `src/components/layout/SplitPane.tsx` | Adapt borders/backgrounds to study theme (light + dark) |
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
