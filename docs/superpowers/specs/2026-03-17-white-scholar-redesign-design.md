# First Principles — White Scholar Redesign

**Date:** 2026-03-17
**Status:** Approved
**Supersedes:** `2026-03-17-ui-ux-redesign-design.md` (Dark Fantasy RPG + Minimal Scholar)
**Visual Reference:** `/demos/demo-2-white-scholar.html`

---

## Overview

Replace the current warm parchment/amber aesthetic with a clean, scholarly white interface. The PixiJS cosmos canvas remains dark (space is dark), creating an intentional contrast: the scholar's desk is white and orderly; the cosmos they study is deep and dark. All chrome surrounding the canvas (TopBar, ZoomOverlay, session pages, journal, playground) uses the White Scholar palette.

---

## Design Principles

1. **White as foundation** — backgrounds are white or near-white. No warm tints, no parchment, no amber.
2. **Indigo as the single accent** — `#6366f1` for active states, unlocked nodes, interactive elements.
3. **Type hierarchy through weight** — Lora for headings, Inter for UI chrome, EB Garamond for study body text.
4. **Contrast first** — all body text meets WCAG AA (4.5:1). Primary text targets 7:1+.
5. **Shadows over borders** — cards use `box-shadow` for elevation.
6. **8px spacing grid** — all padding, margins, and gaps are multiples of 4 or 8px.

---

## Color System

### New Tokens (add to `@theme {}` in `globals.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#ffffff` | Page background |
| `--color-surface` | `#f8fafc` | Card/panel backgrounds, canvas area |
| `--color-surface-alt` | `#f1f5f9` | Hover states, tab bars, input fills |
| `--color-border` | `#e2e8f0` | Default borders |
| `--color-border-strong` | `#cbd5e1` | Hover borders, dividers |
| `--color-text` | `#0f172a` | Primary text (19:1 on white) |
| `--color-text-2` | `#475569` | Secondary text (5.9:1 on white) |
| `--color-text-3` | `#94a3b8` | Tertiary — labels/decorative only, never body |
| `--color-accent` | `#6366f1` | Indigo — active, unlocked, interactive |
| `--color-accent-hover` | `#4f46e5` | Hover state of accent |
| `--color-accent-surface` | `rgba(99,102,241,0.08)` | Accent tint on surfaces |
| `--color-accent-border` | `rgba(99,102,241,0.2)` | Accent-tinted borders |
| `--color-success` | `#16a34a` | Mastered/done states |
| `--color-success-surface` | `rgba(34,197,94,0.07)` | Success tint |
| `--color-gold` | `#d97706` | Boss nodes, special highlights (**overwrites** existing `#b8860b`) |
| `--color-gold-surface` | `rgba(217,119,6,0.07)` | Gold tint |
| `--color-danger` | `#dc2626` | Error states |

### Removed Tokens

Remove from **both** the `@theme {}` block and the `:root {}` block in `globals.css` (both currently define the same tokens — the `:root {}` block must be deleted entirely after migration):

`--color-cream`, `--color-parchment`, `--color-tan-light`, `--color-tan-dark`, `--color-amber`, `--color-amber-light`, `--color-ink`, `--color-ink-body`, `--color-ink-muted`

**Replacement mapping** (wherever old tokens are used in components, substitute these):

| Old token | Replace with |
|-----------|-------------|
| `cream` / `parchment` / `tan-light` / `tan-dark` | `--color-bg` or `--color-surface` |
| `amber` (accent) | `--color-accent` |
| `amber-light` (tint) | `--color-accent-surface` |
| `ink` / `ink-body` | `--color-text` |
| `ink-muted` | `--color-text-2` |
| `locked-bg` | `--color-surface-alt` |

---

## Typography

### Fonts

| Token | Font | Load via | CSS Variable Strategy |
|-------|------|----------|-----------------------|
| `--font-sans` | Inter | `next/font/google` (existing) | `variable: "--font-inter"` → `@theme { --font-sans: var(--font-inter), system-ui, sans-serif }` |
| `--font-serif` | Lora | `next/font/google` (new) | `variable: "--font-lora-var"` → `@theme { --font-lora: var(--font-lora-var), Georgia, serif }` |
| `--font-study` | EB Garamond | `next/font/google` (new) | `variable: "--font-eb-garamond-var"` → `@theme { --font-study: var(--font-eb-garamond-var), Georgia, serif }` |
| `--font-mono` | JetBrains Mono | `next/font/google` (existing) | unchanged |

**Lora config:** `Lora({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-lora-var' })`

**EB Garamond config:** `EB_Garamond({ subsets: ['latin'], weight: ['400','500'], style: ['normal','italic'], variable: '--font-eb-garamond-var' })`

**Removed:** Nunito, Cinzel, Cormorant Garamond, Instrument Serif. Remove their `import` statements and remove their variable names from the `<body className>` string in `layout.tsx`. Add `lora.variable` and `ebGaramond.variable` to the body className.

### Scale

| Use | Font | Size | Weight | Line Height |
|-----|------|------|--------|-------------|
| Page title, h1 (journal, playground) | Lora | 22px | 700 | 1.3 |
| Section heading, h2 | Lora | 18px | 600 | 1.35 |
| ZoomOverlay node title | Lora | 20px | 700 | 1.2 |
| Study body text (challenge, dialogue) | EB Garamond | 17px | 400 | 1.85 |
| Study hint text | EB Garamond | 15px | 400 | 1.75 |
| General card content, node detail | Inter | 13px | 400 | 1.7 |
| Navigation labels | Inter | 13px | 500 | 1 |
| Section labels (uppercase) | Inter | 10–11px | 600 | 1 |
| Button labels, tab labels | Inter | 13px | 500–600 | 1 |
| Formulas (mono) | JetBrains Mono | 14px | 400 | 1.5 |

**Line length target:** 65–75 chars for study body text. Achieved via `max-width: ~680px` on session cards.

---

## Components

### 1. TopBar

**File:** `src/components/TopBar.tsx`

- **Background:** `#ffffff`, `border-bottom: 1px solid var(--color-border)`
- **Logo:** Lora 15px 700, `--color-text`, no letter-spacing changes
- **Nav links:** Inter 13px 500, `--color-text-3` inactive → `--color-text` active
- **Active indicator:** `2px solid var(--color-accent)` absolute bottom border on active tab
- **Model selector:** Inter 13px, `--color-surface-alt` bg, `--color-border` border, `--color-text-2` text
- **Height:** 56px (keep `h-14` — do not change; session layout computes `calc(100vh - 3.5rem)` against this)
- **No ornaments, no diamonds, no gold, no glows**
- Remove all warm-palette class references (`amber`, `cream`, `parchment`, `ink`, `tan`)

**Study mode bar** (on `/session/*` routes): already uses conditional rendering. Keep the simplified bar. Replace `border-tan-light bg-parchment` with `border-border bg-bg`. Replace amber-colored elements with `--color-accent`.

### 2. Cosmos Skill Tree — PixiJS Node Colors

**Files:** `src/components/cosmos/CosmosTree.tsx`, `src/components/cosmos/cosmos-layers.ts`

The PixiJS canvas background stays `0x0a0a0f` (dark space). Only node and edge colors change:

**Node colors (PixiJS, passed as hex integers):**
- **Mastered:** Fill `rgba(99,102,241,0.1)` → `0x6366f1` at alpha 0.1, border `0x6366f1` at alpha 0.4
- **Available:** Fill `0x6366f1` at alpha 0.05, border `0x6366f1` at alpha 0.25, pulse animation (alpha 0.6–0.9)
- **In-progress:** Fill `0x6366f1` at alpha 0.08, border `0x6366f1` at alpha 0.3
- **Locked:** Fill `0xffffff` at alpha 0.02, border `0xffffff` at alpha 0.04 (near invisible)
- **Boss:** Fill `0xd97706` at alpha 0.07, border `0xd97706` at alpha 0.3, double border ring (outer ring 4px offset)
- **Galaxy (domain root):** Fill `0x6366f1` at alpha 0.12, border `0x6366f1` at alpha 0.5, pulsing glow

**Connection lines:**
- Mastered connections: `0x6366f1` at alpha 0.3
- Available/frontier: `0xffffff` at alpha 0.04
- Locked: `0xffffff` at alpha 0.02

**Node shape:** Nodes are already rendered as circles — no shape change needed. (The shield polygon was only in the previous superseded spec and was never implemented.)

**Particles:** Keep existing particle system. Shift particle tint from warm ember to cool: `0x8b9cf6` (soft indigo-white) at low alpha (0.15–0.25).

**Cosmos overlay text** (HTML elements in CosmosTree.tsx): replace `rgba(160,170,200,...)` and similar warm/cool-grey tones with `rgba(99,102,241,...)` indigo variants at same opacity levels.

### 3. ZoomOverlay

**File:** `src/components/cosmos/ZoomOverlay.tsx`

Full restyle — replace the animated cosmic orb with a simple status icon:

- **Backdrop:** `rgba(15,23,42,0.65)` + `backdrop-filter: blur(8px)`
- **Card:** `background: #fff`, `border: 1px solid var(--color-border)`, `border-radius: 16px`, `box-shadow: 0 20px 60px rgba(15,23,42,0.25)`, `max-width: 440px`
- **Status icon** (replaces the 90px animated orb): 40px circle, filled with status color at 0.12 alpha, border at 0.3 alpha. Mastered = green, available = indigo, boss = gold, locked = gray. No pulse rings — a single clean circle.
- **Title:** Lora 700 20px, `--color-text`
- **Subtitle / domain name:** Inter 13px, `--color-text-3`
- **Description:** Inter 14px 400, `--color-text-2`, line-height 1.7
- **Mastery bar:** `--color-accent` fill on `--color-surface-alt` track
- **Status pill** (above title): `--color-success-surface` + green text for mastered; `--color-accent-surface` + indigo text for available; gray for locked; gold-surface + gold text for boss
- **Primary button:** `--color-accent` bg, white text, hover `--color-accent-hover`
- **Secondary button:** white bg, `--color-border` border, `--color-text` text
- **Close button:** `×` top-right, `--color-text-3`, no border

Remove: all Cinzel/Cormorant font classes, all crimson/ember/warm-gold styles, pulse ring animations, orb glow effects.

### 4. Study Session

**Files:** `src/app/session/[topicId]/page.tsx`, `src/components/session/ChallengeMode.tsx`, `src/components/session/DialogueMode.tsx`

**Session sub-header** (topic breadcrumb bar, currently `bg-parchment border-tan-light`):
- Background: `--color-bg`, border-bottom `--color-border`
- Topic title: Inter 14px 500, `--color-text`
- Subject badge: keep subject-specific colors (blue/purple/green etc.) — they convey domain identity. Just update border/bg opacity to match clean aesthetic: `bg-opacity-10 border-opacity-20`, round pill shape.
- End Session button: white bg, `--color-border` border, `--color-text-2` text, hover border-strong

**Challenge card:**
- `background: #fff`, `border: 1px solid var(--color-border)`, `border-radius: 8px`
- `box-shadow: 0 1px 4px rgba(15,23,42,0.07)`
- Body: EB Garamond 17px, `--color-text`, line-height 1.85

**Hint cards:** left border `2px solid var(--color-accent)`, `--color-accent-surface` tint bg

**Attempt textarea:** `border: 1px solid var(--color-border)`, focus `outline: none; border-color: var(--color-accent)`, EB Garamond 16px

**Submit button:** `background: var(--color-text)` (near black), white text, `border-radius: 6px` — high-contrast CTA on white page

**Dark/light toggle:** The session page does not currently have a dark/light toggle. This feature is **out of scope** for this spec. Session pages use light mode only. A future spec can add the toggle.

**Chat bubbles (Dialogue mode):**
- Tutor bubble: `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: 12px`
- User bubble: `background: var(--color-accent-surface)`, `border: 1px solid var(--color-accent-border)`, `border-radius: 12px`
- Role labels: Inter 10px 600 uppercase, `--color-text-3`, letter-spacing 0.06em
- Body: EB Garamond 16px, line-height 1.75

### 5. Journal Page

**File:** `src/app/journal/page.tsx`

- Page bg: `--color-bg`
- h1: Lora 22px 700, `--color-text`, "Journal"
- Subtitle: Inter 13px 400, `--color-text-2`

**Session card:**
- `background: #fff`, `border: 1px solid var(--color-border)`, `border-radius: 8px`
- `box-shadow: 0 1px 3px rgba(15,23,42,0.06)`
- Topic name: Inter 14px 600, `--color-text`
- Date: Inter 12px, `--color-text-3`
- Summary: Inter 13px 400, `--color-text-2`, line-height 1.7
- **Subject color badge** (the per-domain colored badge): keep existing subject colors (`bg-blue-100 text-blue-700` etc.) — subject identity should be visually distinct.
- **Mode badge** (Challenge / Dialogue): Inter 11px 600 uppercase, `--color-accent-surface` bg, `--color-accent` text, `--color-accent-border` border, `border-radius: 100px` pill. This replaces the old `border-tan-dark` style.
- Date group headers: Inter 11px 600 uppercase, `--color-text-3`, letter-spacing 0.06em

### 6. Playground Page

**File:** `src/app/playground/page.tsx`

- Page bg: `--color-bg`
- h1: Lora 22px 700, `--color-text`, "Playground"
- Subtitle: Inter 13px 400, `--color-text-2`

**Filter buttons** (at top of page):
- Active: `background: var(--color-accent)`, white text, `border-radius: 6px`
- Inactive: `background: var(--color-surface-alt)`, `--color-text-2` text, `--color-border` border, `border-radius: 6px`
- Hover inactive: `border-color: var(--color-border-strong)`

**Topic card:**
- `background: #fff`, `border: 1px solid var(--color-border)`, `border-radius: 8px`
- `box-shadow: 0 1px 3px rgba(15,23,42,0.06)`
- Hover: `box-shadow: 0 4px 12px rgba(15,23,42,0.1)`, `border-color: var(--color-border-strong)`
- Topic name: Lora 15px 600, `--color-text`
- Mastery dots: 5 × 8px circles. Filled = `--color-accent`, empty = `--color-surface-alt`

**Challenge buttons** (Teach It, What If?, Connect):
- Default: Inter 12px 600, `--color-accent` text, `--color-accent-border` border, `--color-accent-surface` bg on hover
- Locked: Inter 12px, `--color-text-3` text, `--color-surface-alt` bg, `cursor: not-allowed`

### 7. StatsPanel

**File:** `src/components/cosmos/StatsPanel.tsx`

- `background: rgba(255,255,255,0.95)`, `backdrop-filter: blur(8px)`
- `border: 1px solid var(--color-border)`, `border-radius: 8px`
- `box-shadow: 0 4px 16px rgba(15,23,42,0.1)`
- Text: `--color-text` / `--color-text-2`
- Progress bars: `--color-accent` fill on `--color-surface-alt` track
- Remove all warm/amber token references

### 8. ModeToggle

**File:** `src/components/session/ModeToggle.tsx`

- Replace `bg-amber`, `border-tan-light`, `bg-parchment`, `text-ink-muted` with White Scholar tokens
- Active tab: `background: var(--color-accent)`, white text
- Inactive tab: `background: var(--color-surface-alt)`, `--color-text-2` text
- Container border: `--color-border`

### 9. SplitPane

**File:** `src/components/layout/SplitPane.tsx`

- Replace `bg-parchment`, `border-amber`, `border-tan-light` with `--color-bg`, `--color-border`
- Mobile tab bar: `background: var(--color-bg)`, `border-top: 1px solid var(--color-border)`
- Active mobile tab: `--color-accent` text/indicator

### 10. Scratchpad

**File:** `src/components/session/Scratchpad.tsx`

- Replace warm-palette class references with White Scholar tokens
- "Lined paper" background: if implemented as repeating CSS gradient, update the line color from warm tan to `rgba(15,23,42,0.06)` (very subtle cool gray)
- Text: `--color-text`, monospace font `--font-mono`

### 11. ReviewCard

**File:** `src/components/review/ReviewCard.tsx` (or similar path)

- Replace `bg-parchment`, `border-tan-light`, `font-hand`, `text-ink-body`, `border-amber`, `font-serif` with White Scholar tokens
- Card: white bg, `--color-border`, subtle shadow
- Body: Inter 14px, `--color-text-2`
- Headings: Lora

---

## Global CSS Changes (`src/app/globals.css`)

### Step 1 — Delete the entire `:root {}` block (lines ~36–47)

The `:root {}` block duplicates the `@theme {}` tokens. With the new tokens, it will cause conflicts. Delete it entirely.

### Step 2 — Update `@theme {}` block

Replace the existing warm-palette tokens and add new ones:

```css
@theme {
  /* White Scholar core */
  --color-bg:             #ffffff;
  --color-surface:        #f8fafc;
  --color-surface-alt:    #f1f5f9;
  --color-border:         #e2e8f0;
  --color-border-strong:  #cbd5e1;
  --color-text:           #0f172a;
  --color-text-2:         #475569;
  --color-text-3:         #94a3b8;
  --color-accent:         #6366f1;
  --color-accent-hover:   #4f46e5;
  --color-accent-surface: rgba(99,102,241,0.08);
  --color-accent-border:  rgba(99,102,241,0.2);
  --color-success:        #16a34a;
  --color-success-surface: rgba(34,197,94,0.07);
  --color-gold:           #d97706;
  --color-gold-surface:   rgba(217,119,6,0.07);
  --color-danger:         #dc2626;

  /* Fonts */
  --font-sans:    var(--font-inter), system-ui, -apple-system, sans-serif;
  --font-serif:   var(--font-lora-var), Georgia, serif;
  --font-study:   var(--font-eb-garamond-var), Georgia, serif;
  --font-mono:    var(--font-jetbrains-mono), monospace;
  /* --font-cinzel, --font-cormorant, --font-hand: REMOVED */
}
```

### Step 3 — Update body

```css
body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}
```

---

## `layout.tsx` Changes

1. Add Lora and EB Garamond imports, remove Cinzel / Cormorant / Nunito / Instrument Serif:

```ts
import { Inter, JetBrains_Mono, Lora, EB_Garamond } from "next/font/google";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });
const lora = Lora({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-lora-var' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400','500'], style: ['normal','italic'], variable: '--font-eb-garamond-var' });
```

2. Update `<body className>`:
```tsx
<body className={`${inter.variable} ${jetbrainsMono.variable} ${lora.variable} ${ebGaramond.variable}`}>
```

---

## Files to Modify

| File | Key Changes |
|------|-------------|
| `src/app/globals.css` | Delete `:root {}` block, replace `@theme {}` tokens, update body |
| `src/app/layout.tsx` | Add Lora + EB Garamond; remove Cinzel/Cormorant/Nunito/Instrument Serif; update body className |
| `src/components/TopBar.tsx` | Remove warm tokens; apply white/indigo scheme; keep h-14 height |
| `src/components/cosmos/CosmosTree.tsx` | Update overlay text colors, container chrome |
| `src/components/cosmos/cosmos-layers.ts` | Indigo node colors; remove amber/crimson/ember |
| `src/components/cosmos/ZoomOverlay.tsx` | Replace orb with status icon; full white card restyle |
| `src/components/cosmos/StatsPanel.tsx` | White bg, indigo accents; remove warm tokens |
| `src/app/session/[topicId]/page.tsx` | Update sub-header bar; remove warm tokens |
| `src/components/session/ChallengeMode.tsx` | White Scholar cards; EB Garamond body |
| `src/components/session/DialogueMode.tsx` | White Scholar bubbles; EB Garamond body |
| `src/components/session/Scratchpad.tsx` | Remove warm tokens; update lined-paper color |
| `src/components/session/ModeToggle.tsx` | Remove warm tokens; indigo active state |
| `src/components/layout/SplitPane.tsx` | Remove warm tokens; white/border chrome |
| `src/app/journal/page.tsx` | Lora headings; white cards; update mode badge only |
| `src/app/playground/page.tsx` | Lora headings; white cards; update filter buttons |
| `src/components/review/ReviewCard.tsx` | Remove warm tokens; white card; Lora heading |

---

## Testing Considerations

- Contrast ratios: `--color-text` (#0f172a) on `--color-bg` (#fff) = 19:1 ✓; `--color-text-2` (#475569) on (#fff) = 5.9:1 ✓
- `--color-text-3` (#94a3b8) on (#fff) = 2.5:1 — only for decorative labels, not body text ✓
- PixiJS canvas correct with indigo node colors on dark background
- ZoomOverlay card readable over dark cosmos backdrop
- Confirm session layout `calc(100vh - 3.5rem)` still correct (TopBar height unchanged at 56px)
- Confirm Lora and EB Garamond load correctly; add to font mock in tests if referenced in component tests
- Existing test suite should pass — changes are visual only (CSS class names + colors)
- No DB schema changes, no API changes, no routing changes

---

## Out of Scope

- Mobile responsiveness (separate initiative)
- Session dark/light toggle (not currently implemented; future spec)
- PixiJS dark mode (the canvas stays dark — intentional)
- New PixiJS shader effects
- Changing layout structure (panes, routing, session flow)
- Sound effects
- New features of any kind
