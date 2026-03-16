# Cosmic Physics Skill Tree Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the D3 force-directed skill tree with a PixiJS WebGL cosmic skill tree featuring stars, galaxies, nebulae, fog of war, and cinematic zoom interaction.

**Architecture:** PixiJS 8 renders the cosmic scene imperatively via `useEffect`/`useRef` inside a `"use client"` component loaded with `next/dynamic` (ssr:false). React handles the zoom overlay, stats panel, and data fetching. Fog of war uses BFS from mastered/in-progress nodes (depth ≤ 2). Pre-baked RenderTexture sprites for nebulae avoid per-frame blur cost.

**Tech Stack:** PixiJS 8, Next.js 16 (App Router), TypeScript, Drizzle ORM + better-sqlite3, Tailwind v4

**Spec:** `docs/superpowers/specs/2026-03-16-cosmic-skill-tree-design.md`

---

## File Structure

### New Files
- `src/data/seed-cosmos.json` — 55 physics topics + 70 edges with cosmos coordinates
- `src/components/cosmos/CosmosTree.tsx` — Main PixiJS cosmos component ("use client")
- `src/components/cosmos/cosmos-types.ts` — TypeScript interfaces for cosmos nodes/edges
- `src/components/cosmos/cosmos-layers.ts` — Pure functions: createStarField, createNebulae, createConnections, createNodes
- `src/components/cosmos/cosmos-icons.ts` — Pure functions: draw physics icons on PixiJS Graphics
- `src/components/cosmos/cosmos-fog.ts` — BFS fog-of-war computation
- `src/components/cosmos/ZoomOverlay.tsx` — React zoom detail panel
- `src/components/cosmos/StatsPanel.tsx` — React stats overlay
- `src/__tests__/cosmos-tree.test.tsx` — Smoke tests for CosmosTree
- `src/__tests__/cosmos-fog.test.ts` — Unit tests for fog computation

### Modified Files
- `src/lib/db/schema.ts:5-15` — Add 5 columns to topics table
- `src/lib/db/seed.ts:1-50` — Read from seed-cosmos.json, populate new columns
- `src/app/tree/page.tsx:1-70` — Replace with dynamic import of CosmosTree
- `src/app/session/[topicId]/page.tsx:76` — Change navigation to `/tree?mastered=topicId`
- `src/app/layout.tsx:3-11` — Add Cinzel + Cormorant Garamond fonts
- `src/app/globals.css:4-21` — Add cosmic font variables to @theme
- `src/components/TopBar.tsx:9` — Rename "Skill Tree" → "Cosmos"
- `src/app/api/topics/route.ts:20-41` — Accept new cosmos fields in POST
- `src/__tests__/topbar.test.tsx:21` — Update assertion to "Cosmos"
- `package.json:14-25` — Add pixi.js, remove d3/@types/d3

### Deleted Files
- `src/components/skill-tree/SkillTree.tsx`
- `src/__tests__/skill-tree.test.tsx`

---

## Chunk 1: Data Layer

### Task 1: Update schema with cosmos columns

**Files:**
- Modify: `src/lib/db/schema.ts:5-15`
- Test: `src/__tests__/schema.test.ts` (existing, verify it still passes)

- [ ] **Step 1: Add 5 new columns to topics table in schema.ts**

After the `updatedAt` column (line ~14), add:

```typescript
cosmosX: real("cosmos_x"),
cosmosY: real("cosmos_y"),
cosmosRadius: real("cosmos_radius").default(10),
domain: text("domain").default("core"),
nodeType: text("node_type").default("star"),
```

- [ ] **Step 2: Run existing schema tests**

Run: `npm test -- --run src/__tests__/schema.test.ts`
Expected: PASS (new columns are nullable, existing tests unaffected)

- [ ] **Step 3: Generate and apply migration**

Run: `npx drizzle-kit generate && npx drizzle-kit push`
Expected: Migration generated and applied. If DB doesn't exist yet, that's fine — seed will create it.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add cosmos columns to topics schema (x, y, radius, domain, nodeType)"
```

---

### Task 2: Create cosmos seed data

**Files:**
- Create: `src/data/seed-cosmos.json`

- [ ] **Step 1: Create seed-cosmos.json with 55 physics topics and 70 edges**

The JSON has two top-level arrays: `topics` and `edges`. Each topic has all existing fields plus `cosmosX`, `cosmosY`, `cosmosRadius`, `domain`, `nodeType`. Coordinates use a cartesian system where (0,0) is the root galaxy at bottom-center; Y goes negative upward.

```json
{
  "topics": [
    {"id":"physics-root","title":"Physics","subject":"physics","difficulty":1,"status":"mastered","masteryLevel":5,"description":"The foundation of all physical knowledge.","cosmosX":0,"cosmosY":0,"cosmosRadius":22,"domain":"core","nodeType":"galaxy"},
    {"id":"units","title":"Units & Measurement","subject":"physics","difficulty":1,"status":"mastered","masteryLevel":5,"description":"The language of physics. SI units, dimensional analysis, significant figures.","cosmosX":-220,"cosmosY":-180,"cosmosRadius":14,"domain":"mechanics","nodeType":"star"},
    {"id":"vectors","title":"Vectors","subject":"physics","difficulty":1,"status":"mastered","masteryLevel":5,"description":"Direction meets magnitude. Vector addition, components, dot and cross products.","cosmosX":-80,"cosmosY":-200,"cosmosRadius":16,"domain":"mechanics","nodeType":"star"},
    {"id":"calculus-primer","title":"Calculus Primer","subject":"physics","difficulty":2,"status":"mastered","masteryLevel":4,"description":"The mathematics of change. Derivatives, integrals, differential equations.","cosmosX":80,"cosmosY":-190,"cosmosRadius":14,"domain":"core","nodeType":"star"},
    {"id":"graphs","title":"Graphs & Analysis","subject":"physics","difficulty":1,"status":"mastered","masteryLevel":3,"description":"Reading the story in data. Position-time, velocity-time graphs.","cosmosX":230,"cosmosY":-170,"cosmosRadius":12,"domain":"core","nodeType":"star"},
    {"id":"kinematics","title":"Kinematics","subject":"physics","difficulty":2,"status":"available","masteryLevel":0,"description":"The geometry of motion. Displacement, velocity, acceleration — without asking why.","cosmosX":-260,"cosmosY":-380,"cosmosRadius":15,"domain":"mechanics","nodeType":"star"},
    {"id":"forces","title":"Forces","subject":"physics","difficulty":2,"status":"available","masteryLevel":0,"description":"Push and pull — the agents of change. Contact forces, field forces, free body diagrams.","cosmosX":-100,"cosmosY":-400,"cosmosRadius":13,"domain":"mechanics","nodeType":"star"},
    {"id":"oscillations","title":"Oscillations","subject":"physics","difficulty":2,"status":"available","masteryLevel":0,"description":"Back and forth — the heartbeat of physics. Simple harmonic motion, pendulums, springs.","cosmosX":60,"cosmosY":-390,"cosmosRadius":11,"domain":"waves","nodeType":"star"},
    {"id":"acceleration","title":"Acceleration","subject":"physics","difficulty":2,"status":"locked","masteryLevel":0,"description":"The rate of change of velocity. Uniform and non-uniform acceleration.","cosmosX":200,"cosmosY":-380,"cosmosRadius":9,"domain":"mechanics","nodeType":"star"},
    {"id":"circular-motion","title":"Circular Motion","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Motion in circles — centripetal acceleration and force.","cosmosX":320,"cosmosY":-360,"cosmosRadius":8,"domain":"mechanics","nodeType":"star"},
    {"id":"newtons-laws","title":"Newton's Laws","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"The three pillars of classical mechanics. Inertia, F=ma, action-reaction.","cosmosX":-350,"cosmosY":-560,"cosmosRadius":20,"domain":"mechanics","nodeType":"boss"},
    {"id":"energy-work","title":"Energy & Work","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"The currency of physics. Kinetic, potential, conservation.","cosmosX":-180,"cosmosY":-560,"cosmosRadius":10,"domain":"mechanics","nodeType":"star"},
    {"id":"momentum","title":"Momentum","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Mass in motion. Impulse, conservation, collisions.","cosmosX":-40,"cosmosY":-570,"cosmosRadius":9,"domain":"mechanics","nodeType":"star"},
    {"id":"electric-charge","title":"Electric Charge","subject":"physics","difficulty":2,"status":"locked","masteryLevel":0,"description":"The source of electromagnetic force. Positive, negative, conservation.","cosmosX":350,"cosmosY":-400,"cosmosRadius":9,"domain":"em","nodeType":"star"},
    {"id":"wave-mechanics","title":"Wave Mechanics","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Propagation of disturbances through media.","cosmosX":160,"cosmosY":-550,"cosmosRadius":9,"domain":"waves","nodeType":"star"},
    {"id":"projectile-motion","title":"Projectile Motion","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Motion under gravity. Parabolic trajectories, range, max height.","cosmosX":-300,"cosmosY":-720,"cosmosRadius":8,"domain":"mechanics","nodeType":"star"},
    {"id":"friction","title":"Friction","subject":"physics","difficulty":2,"status":"locked","masteryLevel":0,"description":"The force that opposes motion. Static vs kinetic, coefficients.","cosmosX":-150,"cosmosY":-730,"cosmosRadius":7,"domain":"mechanics","nodeType":"star"},
    {"id":"torque","title":"Torque","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"The rotational analogue of force. Moment arms, equilibrium.","cosmosX":-440,"cosmosY":-720,"cosmosRadius":7,"domain":"mechanics","nodeType":"star"},
    {"id":"gravity","title":"Gravity","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"The universal attraction. Newton's law of gravitation, orbits.","cosmosX":-500,"cosmosY":-700,"cosmosRadius":8,"domain":"mechanics","nodeType":"star"},
    {"id":"coulombs-law","title":"Coulomb's Law","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"The force between charges. Inverse square law, superposition.","cosmosX":300,"cosmosY":-560,"cosmosRadius":7,"domain":"em","nodeType":"star"},
    {"id":"sound","title":"Sound","subject":"physics","difficulty":2,"status":"locked","masteryLevel":0,"description":"Longitudinal waves in matter. Frequency, pitch, resonance.","cosmosX":80,"cosmosY":-700,"cosmosRadius":7,"domain":"waves","nodeType":"star"},
    {"id":"thermodynamics","title":"Thermodynamics","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Heat, temperature, and the laws governing energy transfer.","cosmosX":220,"cosmosY":-700,"cosmosRadius":8,"domain":"thermo","nodeType":"star"},
    {"id":"circuits","title":"Circuits","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Current, voltage, resistance. Ohm's law, series and parallel.","cosmosX":400,"cosmosY":-550,"cosmosRadius":7,"domain":"em","nodeType":"star"},
    {"id":"rotational-dynamics","title":"Rotational Dynamics","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Rotation in full — angular momentum, moment of inertia, rolling.","cosmosX":-380,"cosmosY":-870,"cosmosRadius":6,"domain":"mechanics","nodeType":"star"},
    {"id":"fluids","title":"Fluids","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Pressure, buoyancy, Bernoulli's principle, viscosity.","cosmosX":-200,"cosmosY":-880,"cosmosRadius":6,"domain":"mechanics","nodeType":"star"},
    {"id":"conservation-laws","title":"Conservation Laws","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Energy, momentum, angular momentum — the deepest symmetries.","cosmosX":-60,"cosmosY":-860,"cosmosRadius":7,"domain":"mechanics","nodeType":"star"},
    {"id":"magnetism","title":"Magnetism","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Magnetic fields, forces on charges, Biot-Savart law.","cosmosX":350,"cosmosY":-720,"cosmosRadius":6,"domain":"em","nodeType":"star"},
    {"id":"optics","title":"Optics","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Light as rays and waves. Reflection, refraction, lenses.","cosmosX":150,"cosmosY":-850,"cosmosRadius":6,"domain":"waves","nodeType":"star"},
    {"id":"entropy","title":"Entropy","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Disorder and the arrow of time. The second law.","cosmosX":280,"cosmosY":-850,"cosmosRadius":5,"domain":"thermo","nodeType":"star"},
    {"id":"electric-fields","title":"Electric Fields","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"The force field around charges. Field lines, flux, Gauss's law.","cosmosX":420,"cosmosY":-700,"cosmosRadius":7,"domain":"em","nodeType":"star"},
    {"id":"collisions","title":"Collisions","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Elastic and inelastic. Conservation applied to real impacts.","cosmosX":-100,"cosmosY":-740,"cosmosRadius":6,"domain":"mechanics","nodeType":"star"},
    {"id":"heat-transfer","title":"Heat Transfer","subject":"physics","difficulty":2,"status":"locked","masteryLevel":0,"description":"Conduction, convection, radiation. How heat moves.","cosmosX":300,"cosmosY":-640,"cosmosRadius":7,"domain":"thermo","nodeType":"star"},
    {"id":"free-body-diagrams","title":"Free Body Diagrams","subject":"physics","difficulty":2,"status":"locked","masteryLevel":0,"description":"The art of force analysis. Drawing and solving FBDs.","cosmosX":-200,"cosmosY":-440,"cosmosRadius":10,"domain":"mechanics","nodeType":"star"},
    {"id":"elasticity","title":"Elasticity","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Stress, strain, Hooke's law, Young's modulus.","cosmosX":-280,"cosmosY":-810,"cosmosRadius":5,"domain":"mechanics","nodeType":"star"},
    {"id":"potential-energy","title":"Potential Energy","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Stored energy from position. Gravitational, elastic, electric.","cosmosX":-100,"cosmosY":-640,"cosmosRadius":7,"domain":"mechanics","nodeType":"star"},
    {"id":"impulse","title":"Impulse","subject":"physics","difficulty":2,"status":"locked","masteryLevel":0,"description":"Force over time. The bridge between force and momentum.","cosmosX":40,"cosmosY":-640,"cosmosRadius":6,"domain":"mechanics","nodeType":"star"},
    {"id":"interference","title":"Interference","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"When waves meet. Constructive, destructive, standing waves.","cosmosX":100,"cosmosY":-780,"cosmosRadius":5,"domain":"waves","nodeType":"star"},
    {"id":"diffraction","title":"Diffraction","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Waves bending around obstacles. Single slit, double slit.","cosmosX":50,"cosmosY":-870,"cosmosRadius":5,"domain":"waves","nodeType":"star"},
    {"id":"doppler-effect","title":"Doppler Effect","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Frequency shift from relative motion. Sound and light.","cosmosX":180,"cosmosY":-780,"cosmosRadius":5,"domain":"waves","nodeType":"star"},
    {"id":"carnot-cycle","title":"Carnot Cycle","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"The ideal heat engine. Maximum efficiency, reversibility.","cosmosX":340,"cosmosY":-850,"cosmosRadius":5,"domain":"thermo","nodeType":"star"},
    {"id":"induction","title":"Electromagnetic Induction","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Changing magnetic fields create electric fields. Faraday's law.","cosmosX":450,"cosmosY":-780,"cosmosRadius":6,"domain":"em","nodeType":"star"},
    {"id":"maxwells-equations","title":"Maxwell's Equations","subject":"physics","difficulty":5,"status":"locked","masteryLevel":0,"description":"The four equations that unify electricity, magnetism, and light.","cosmosX":500,"cosmosY":-900,"cosmosRadius":18,"domain":"em","nodeType":"boss"},
    {"id":"ac-circuits","title":"AC Circuits","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Alternating current, impedance, RLC circuits, resonance.","cosmosX":480,"cosmosY":-650,"cosmosRadius":5,"domain":"em","nodeType":"star"},
    {"id":"em-waves","title":"Electromagnetic Waves","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Light as an electromagnetic wave. Spectrum, polarization.","cosmosX":500,"cosmosY":-830,"cosmosRadius":6,"domain":"em","nodeType":"star"},
    {"id":"gauss-law","title":"Gauss's Law","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Electric flux through closed surfaces. Symmetry in E&M.","cosmosX":460,"cosmosY":-750,"cosmosRadius":5,"domain":"em","nodeType":"star"},
    {"id":"stat-mech","title":"Statistical Mechanics","subject":"physics","difficulty":5,"status":"locked","masteryLevel":0,"description":"Bridging microscopic and macroscopic. Boltzmann, partition functions.","cosmosX":250,"cosmosY":-940,"cosmosRadius":5,"domain":"thermo","nodeType":"star"},
    {"id":"special-relativity","title":"Special Relativity","subject":"physics","difficulty":5,"status":"locked","masteryLevel":0,"description":"Time dilation, length contraction, E=mc². The speed of light as the cosmic speed limit.","cosmosX":0,"cosmosY":-1020,"cosmosRadius":7,"domain":"modern","nodeType":"star"},
    {"id":"quantum-intro","title":"Quantum Mechanics","subject":"physics","difficulty":5,"status":"locked","masteryLevel":0,"description":"Wave functions, uncertainty, superposition. The strange rules at the smallest scales.","cosmosX":-100,"cosmosY":-1050,"cosmosRadius":7,"domain":"modern","nodeType":"star"},
    {"id":"nuclear","title":"Nuclear Physics","subject":"physics","difficulty":5,"status":"locked","masteryLevel":0,"description":"The atomic nucleus. Fission, fusion, radioactivity, binding energy.","cosmosX":100,"cosmosY":-1040,"cosmosRadius":6,"domain":"modern","nodeType":"star"},
    {"id":"photoelectric","title":"Photoelectric Effect","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Light as particles. Einstein's explanation, work function, stopping voltage.","cosmosX":-50,"cosmosY":-960,"cosmosRadius":5,"domain":"modern","nodeType":"star"},
    {"id":"wave-particle","title":"Wave-Particle Duality","subject":"physics","difficulty":5,"status":"locked","masteryLevel":0,"description":"Matter and light as both waves and particles. De Broglie, double slit.","cosmosX":50,"cosmosY":-970,"cosmosRadius":5,"domain":"modern","nodeType":"star"},
    {"id":"orbital-mechanics","title":"Orbital Mechanics","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Kepler's laws, escape velocity, satellite motion.","cosmosX":-460,"cosmosY":-830,"cosmosRadius":5,"domain":"mechanics","nodeType":"star"},
    {"id":"angular-momentum","title":"Angular Momentum","subject":"physics","difficulty":4,"status":"locked","masteryLevel":0,"description":"Rotational momentum and its conservation. Gyroscopes, spinning.","cosmosX":-320,"cosmosY":-860,"cosmosRadius":5,"domain":"mechanics","nodeType":"star"},
    {"id":"bernoulli","title":"Bernoulli's Principle","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Fluid speed and pressure. Airplane wings, venturi effect.","cosmosX":-140,"cosmosY":-870,"cosmosRadius":5,"domain":"mechanics","nodeType":"star"},
    {"id":"shm-detail","title":"SHM Deep Dive","subject":"physics","difficulty":3,"status":"locked","masteryLevel":0,"description":"Energy in oscillations, damping, driven oscillations, resonance.","cosmosX":120,"cosmosY":-550,"cosmosRadius":6,"domain":"waves","nodeType":"star"}
  ],
  "edges": [
    {"sourceId":"physics-root","targetId":"units","type":"prerequisite","weight":1.0},
    {"sourceId":"physics-root","targetId":"vectors","type":"prerequisite","weight":1.0},
    {"sourceId":"physics-root","targetId":"calculus-primer","type":"prerequisite","weight":1.0},
    {"sourceId":"physics-root","targetId":"graphs","type":"prerequisite","weight":1.0},
    {"sourceId":"units","targetId":"kinematics","type":"prerequisite","weight":1.0},
    {"sourceId":"vectors","targetId":"kinematics","type":"prerequisite","weight":1.0},
    {"sourceId":"vectors","targetId":"forces","type":"prerequisite","weight":1.0},
    {"sourceId":"vectors","targetId":"free-body-diagrams","type":"prerequisite","weight":0.9},
    {"sourceId":"calculus-primer","targetId":"kinematics","type":"prerequisite","weight":0.9},
    {"sourceId":"calculus-primer","targetId":"oscillations","type":"prerequisite","weight":1.0},
    {"sourceId":"graphs","targetId":"acceleration","type":"prerequisite","weight":0.8},
    {"sourceId":"graphs","targetId":"circular-motion","type":"prerequisite","weight":0.7},
    {"sourceId":"kinematics","targetId":"newtons-laws","type":"prerequisite","weight":1.0},
    {"sourceId":"forces","targetId":"newtons-laws","type":"prerequisite","weight":1.0},
    {"sourceId":"free-body-diagrams","targetId":"newtons-laws","type":"prerequisite","weight":0.9},
    {"sourceId":"kinematics","targetId":"energy-work","type":"prerequisite","weight":0.8},
    {"sourceId":"forces","targetId":"energy-work","type":"prerequisite","weight":0.9},
    {"sourceId":"forces","targetId":"momentum","type":"prerequisite","weight":0.8},
    {"sourceId":"kinematics","targetId":"momentum","type":"prerequisite","weight":0.7},
    {"sourceId":"oscillations","targetId":"wave-mechanics","type":"prerequisite","weight":1.0},
    {"sourceId":"oscillations","targetId":"shm-detail","type":"deepens","weight":0.8},
    {"sourceId":"acceleration","targetId":"circular-motion","type":"prerequisite","weight":0.9},
    {"sourceId":"circular-motion","targetId":"electric-charge","type":"related","weight":0.6},
    {"sourceId":"electric-charge","targetId":"coulombs-law","type":"prerequisite","weight":1.0},
    {"sourceId":"electric-charge","targetId":"circuits","type":"prerequisite","weight":0.8},
    {"sourceId":"electric-charge","targetId":"electric-fields","type":"prerequisite","weight":0.9},
    {"sourceId":"newtons-laws","targetId":"projectile-motion","type":"prerequisite","weight":1.0},
    {"sourceId":"newtons-laws","targetId":"friction","type":"prerequisite","weight":1.0},
    {"sourceId":"newtons-laws","targetId":"torque","type":"prerequisite","weight":0.9},
    {"sourceId":"newtons-laws","targetId":"gravity","type":"prerequisite","weight":1.0},
    {"sourceId":"energy-work","targetId":"potential-energy","type":"prerequisite","weight":1.0},
    {"sourceId":"energy-work","targetId":"conservation-laws","type":"prerequisite","weight":0.9},
    {"sourceId":"energy-work","targetId":"heat-transfer","type":"related","weight":0.7},
    {"sourceId":"momentum","targetId":"collisions","type":"prerequisite","weight":1.0},
    {"sourceId":"momentum","targetId":"impulse","type":"prerequisite","weight":0.9},
    {"sourceId":"momentum","targetId":"conservation-laws","type":"prerequisite","weight":0.8},
    {"sourceId":"wave-mechanics","targetId":"sound","type":"prerequisite","weight":1.0},
    {"sourceId":"wave-mechanics","targetId":"interference","type":"prerequisite","weight":0.9},
    {"sourceId":"wave-mechanics","targetId":"doppler-effect","type":"prerequisite","weight":0.8},
    {"sourceId":"sound","targetId":"doppler-effect","type":"related","weight":0.7},
    {"sourceId":"interference","targetId":"diffraction","type":"prerequisite","weight":1.0},
    {"sourceId":"heat-transfer","targetId":"thermodynamics","type":"prerequisite","weight":1.0},
    {"sourceId":"thermodynamics","targetId":"entropy","type":"prerequisite","weight":1.0},
    {"sourceId":"thermodynamics","targetId":"carnot-cycle","type":"prerequisite","weight":0.9},
    {"sourceId":"entropy","targetId":"stat-mech","type":"prerequisite","weight":1.0},
    {"sourceId":"carnot-cycle","targetId":"stat-mech","type":"related","weight":0.7},
    {"sourceId":"torque","targetId":"rotational-dynamics","type":"prerequisite","weight":1.0},
    {"sourceId":"torque","targetId":"angular-momentum","type":"prerequisite","weight":0.9},
    {"sourceId":"gravity","targetId":"orbital-mechanics","type":"prerequisite","weight":1.0},
    {"sourceId":"projectile-motion","targetId":"fluids","type":"related","weight":0.5},
    {"sourceId":"friction","targetId":"elasticity","type":"related","weight":0.7},
    {"sourceId":"fluids","targetId":"bernoulli","type":"prerequisite","weight":1.0},
    {"sourceId":"rotational-dynamics","targetId":"angular-momentum","type":"prerequisite","weight":0.8},
    {"sourceId":"coulombs-law","targetId":"electric-fields","type":"prerequisite","weight":0.9},
    {"sourceId":"coulombs-law","targetId":"magnetism","type":"related","weight":0.7},
    {"sourceId":"electric-fields","targetId":"gauss-law","type":"prerequisite","weight":1.0},
    {"sourceId":"circuits","targetId":"ac-circuits","type":"prerequisite","weight":1.0},
    {"sourceId":"magnetism","targetId":"induction","type":"prerequisite","weight":1.0},
    {"sourceId":"induction","targetId":"maxwells-equations","type":"prerequisite","weight":1.0},
    {"sourceId":"gauss-law","targetId":"maxwells-equations","type":"prerequisite","weight":1.0},
    {"sourceId":"ac-circuits","targetId":"maxwells-equations","type":"related","weight":0.7},
    {"sourceId":"magnetism","targetId":"em-waves","type":"prerequisite","weight":0.8},
    {"sourceId":"electric-fields","targetId":"em-waves","type":"prerequisite","weight":0.8},
    {"sourceId":"em-waves","targetId":"maxwells-equations","type":"prerequisite","weight":0.9},
    {"sourceId":"optics","targetId":"diffraction","type":"related","weight":0.8},
    {"sourceId":"interference","targetId":"optics","type":"prerequisite","weight":0.9},
    {"sourceId":"doppler-effect","targetId":"optics","type":"related","weight":0.6},
    {"sourceId":"optics","targetId":"photoelectric","type":"prerequisite","weight":0.8},
    {"sourceId":"em-waves","targetId":"photoelectric","type":"prerequisite","weight":0.7},
    {"sourceId":"photoelectric","targetId":"wave-particle","type":"prerequisite","weight":1.0},
    {"sourceId":"wave-particle","targetId":"quantum-intro","type":"prerequisite","weight":1.0},
    {"sourceId":"conservation-laws","targetId":"special-relativity","type":"prerequisite","weight":0.8},
    {"sourceId":"em-waves","targetId":"special-relativity","type":"related","weight":0.7},
    {"sourceId":"quantum-intro","targetId":"nuclear","type":"prerequisite","weight":0.9},
    {"sourceId":"special-relativity","targetId":"nuclear","type":"related","weight":0.7}
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/data/seed-cosmos.json','utf8')); console.log('Valid')"`
Expected: `Valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/seed-cosmos.json
git commit -m "feat: add seed-cosmos.json with 55 physics topics and 75 edges"
```

---

### Task 3: Update seed script

**Files:**
- Modify: `src/lib/db/seed.ts`

- [ ] **Step 1: Update seed.ts to read from seed-cosmos.json and populate new columns**

Replace the import path on line 5 to read from `seed-cosmos.json`. Update the topic insert loop to include the new fields: `cosmosX`, `cosmosY`, `cosmosRadius`, `domain`, `nodeType`.

The seed script currently reads `seedData.topics` and inserts with `db.insert(topics).values({...})`. Add the 5 new fields to each insert call, reading them from the JSON.

- [ ] **Step 2: Run seed**

Run: `npm run db:seed`
Expected: Seeding completes without errors. "Seeded X topics and Y edges" printed.

- [ ] **Step 3: Verify cosmos columns populated**

Run: `node -e "const db=require('./src/lib/db').db;const{topics}=require('./src/lib/db/schema');const r=db.select().from(topics).all();console.log(r[0].cosmosX, r[0].nodeType)"`
Expected: Should print numeric cosmosX value and a nodeType string (not null).

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/seed.ts
git commit -m "feat: update seed script to populate cosmos coordinates"
```

---

### Task 4: Update dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install PixiJS, remove D3**

Run: `npm install pixi.js && npm uninstall d3 @types/d3`

- [ ] **Step 2: Verify no build errors from D3 removal**

Run: `npx next build 2>&1 | head -30`
Expected: Build may fail because `SkillTree.tsx` imports D3 — that's expected. We'll delete it in Chunk 5.

Note: If the build fails here, that's OK. We'll fix it when we delete SkillTree.tsx. For now just confirm pixi.js is in `node_modules`.

Run: `ls node_modules/pixi.js/package.json`
Expected: File exists.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add pixi.js, remove d3 dependencies"
```

---

### Task 5: Add fonts and update layout

**Files:**
- Modify: `src/app/layout.tsx:3-11`
- Modify: `src/app/globals.css:17-20`

- [ ] **Step 1: Add Cinzel and Cormorant Garamond to layout.tsx**

After the existing font imports (around line 3-4), add:

```typescript
import { Cinzel, Cormorant_Garamond } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600", "700"],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
```

Add `${cinzel.variable} ${cormorantGaramond.variable}` to the `<body>` className.

- [ ] **Step 2: Register font variables in globals.css @theme block**

In the `@theme {}` block (around lines 17-20), add after the existing font-family entries:

```css
--font-cinzel: var(--font-cinzel), 'Cinzel', serif;
--font-cormorant: var(--font-cormorant), 'Cormorant Garamond', serif;
```

- [ ] **Step 3: Verify fonts load**

Run: `npm run dev` and check the browser — no font loading errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add Cinzel and Cormorant Garamond fonts for cosmos UI"
```

---

## Chunk 2: Cosmos Renderer Core

### Task 6: Create type definitions and fog computation

**Files:**
- Create: `src/components/cosmos/cosmos-types.ts`
- Create: `src/components/cosmos/cosmos-fog.ts`
- Create: `src/__tests__/cosmos-fog.test.ts`

- [ ] **Step 1: Write cosmos-types.ts**

```typescript
export interface CosmosNode {
  id: string;
  title: string;
  subject: string;
  difficulty: number;
  status: "locked" | "available" | "in-progress" | "mastered";
  masteryLevel: number;
  description: string;
  cosmosX: number;
  cosmosY: number;
  cosmosRadius: number;
  domain: string;
  nodeType: "galaxy" | "star" | "boss";
}

export interface CosmosEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: "prerequisite" | "related" | "deepens";
  weight: number;
}

export type VisibilityState = "bright" | "frontier" | "dim" | "fogged";
```

- [ ] **Step 2: Write failing test for fog computation**

```typescript
// src/__tests__/cosmos-fog.test.ts
import { describe, it, expect } from "vitest";
import { computeVisibleSet } from "@/components/cosmos/cosmos-fog";
import type { CosmosNode, CosmosEdge } from "@/components/cosmos/cosmos-types";

const makeNode = (id: string, status: CosmosNode["status"] = "locked"): CosmosNode => ({
  id, title: id, subject: "physics", difficulty: 1, status,
  masteryLevel: status === "mastered" ? 5 : 0,
  description: "", cosmosX: 0, cosmosY: 0, cosmosRadius: 10,
  domain: "core", nodeType: "star",
});

const makeEdge = (sourceId: string, targetId: string): CosmosEdge => ({
  id: `${sourceId}-${targetId}`, sourceId, targetId, type: "prerequisite", weight: 1,
});

describe("computeVisibleSet", () => {
  it("returns mastered nodes as bright", () => {
    const nodes = [makeNode("a", "mastered"), makeNode("b", "locked")];
    const edges = [makeEdge("a", "b")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("a")).toBe("bright");
  });

  it("returns 1-hop neighbors of mastered as frontier", () => {
    const nodes = [makeNode("a", "mastered"), makeNode("b", "locked"), makeNode("c", "locked")];
    const edges = [makeEdge("a", "b"), makeEdge("b", "c")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("b")).toBe("frontier");
  });

  it("returns 2-hop neighbors as dim", () => {
    const nodes = [makeNode("a", "mastered"), makeNode("b", "locked"), makeNode("c", "locked")];
    const edges = [makeEdge("a", "b"), makeEdge("b", "c")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("c")).toBe("dim");
  });

  it("returns 3-hop nodes as fogged", () => {
    const nodes = [
      makeNode("a", "mastered"), makeNode("b", "locked"),
      makeNode("c", "locked"), makeNode("d", "locked"),
    ];
    const edges = [makeEdge("a", "b"), makeEdge("b", "c"), makeEdge("c", "d")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("d")).toBe("fogged");
  });

  it("treats in-progress as BFS origin", () => {
    const nodes = [makeNode("a", "in-progress"), makeNode("b", "locked")];
    const edges = [makeEdge("a", "b")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("a")).toBe("bright");
    expect(result.get("b")).toBe("frontier");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --run src/__tests__/cosmos-fog.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Write cosmos-fog.ts implementation**

```typescript
import type { CosmosNode, CosmosEdge, VisibilityState } from "./cosmos-types";

export function computeVisibleSet(
  nodes: CosmosNode[],
  edges: CosmosEdge[],
): Map<string, VisibilityState> {
  const result = new Map<string, VisibilityState>();
  const adjacency = new Map<string, string[]>();

  // Build undirected adjacency list
  for (const e of edges) {
    if (!adjacency.has(e.sourceId)) adjacency.set(e.sourceId, []);
    if (!adjacency.has(e.targetId)) adjacency.set(e.targetId, []);
    adjacency.get(e.sourceId)!.push(e.targetId);
    adjacency.get(e.targetId)!.push(e.sourceId);
  }

  // BFS from mastered + in-progress nodes
  const origins = nodes.filter(
    (n) => n.status === "mastered" || n.status === "in-progress"
  );

  // Initialize all as fogged
  for (const n of nodes) result.set(n.id, "fogged");

  // Mark origins as bright
  const queue: Array<{ id: string; depth: number }> = [];
  for (const o of origins) {
    result.set(o.id, "bright");
    queue.push({ id: o.id, depth: 0 });
  }

  // BFS with max depth 2
  const visited = new Set(origins.map((o) => o.id));
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depth >= 2) continue;

    for (const neighborId of adjacency.get(id) ?? []) {
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);

      const nextDepth = depth + 1;
      if (nextDepth === 1 && result.get(neighborId) === "fogged") {
        result.set(neighborId, "frontier");
      } else if (nextDepth === 2 && result.get(neighborId) === "fogged") {
        result.set(neighborId, "dim");
      }

      queue.push({ id: neighborId, depth: nextDepth });
    }
  }

  return result;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --run src/__tests__/cosmos-fog.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/cosmos/cosmos-types.ts src/components/cosmos/cosmos-fog.ts src/__tests__/cosmos-fog.test.ts
git commit -m "feat: cosmos type definitions and fog-of-war BFS computation"
```

---

### Task 7: Create physics icon drawing functions

**Files:**
- Create: `src/components/cosmos/cosmos-icons.ts`

- [ ] **Step 1: Write cosmos-icons.ts with icon functions for each physics topic**

Each function takes a PixiJS `Graphics` object, radius, and color, and draws the icon centered at (0,0). Keep this file as pure drawing functions — no state, no side effects.

```typescript
import type { Graphics } from "pixi.js";

type IconFn = (g: Graphics, r: number, color: number, alpha: number) => void;

const icons: Record<string, IconFn> = {
  "physics-root": (g, r, color, alpha) => {
    // Atom with 3 orbit ellipses
    for (const angle of [0, 60, -60]) {
      const rad = (angle * Math.PI) / 180;
      g.save();
      g.rotation = rad;
      g.ellipse(0, 0, r * 0.7, r * 0.28).stroke({ width: 1.2, color, alpha: alpha * 0.7 });
      g.restore();
    }
    g.circle(0, 0, r * 0.14).fill({ color, alpha: alpha * 0.8 });
  },
  units: (g, r, color, alpha) => {
    // Ruler with tick marks
    g.moveTo(-r * 0.5, 0).lineTo(r * 0.5, 0).stroke({ width: 1.5, color, alpha });
    for (const p of [-0.3, 0, 0.3]) {
      g.moveTo(p * r, -r * 0.25).lineTo(p * r, r * 0.25).stroke({ width: 0.8, color, alpha: alpha * 0.7 });
    }
  },
  vectors: (g, r, color, alpha) => {
    // Arrow with arrowhead
    g.moveTo(-r * 0.4, r * 0.3).lineTo(r * 0.35, -r * 0.35).stroke({ width: 1.5, color, alpha });
    g.poly([r * 0.35, -r * 0.35, r * 0.15, -r * 0.25, r * 0.2, -r * 0.05]).fill({ color, alpha: alpha * 0.7 });
  },
  "calculus-primer": (g, r, color, alpha) => {
    // dx/dt line
    g.moveTo(-r * 0.3, 0).lineTo(r * 0.3, 0).stroke({ width: 0.6, color, alpha: alpha * 0.5 });
  },
  graphs: (g, r, color, alpha) => {
    // Axes + curve
    g.moveTo(-r * 0.4, r * 0.4).lineTo(-r * 0.4, -r * 0.3).stroke({ width: 1, color, alpha });
    g.moveTo(-r * 0.4, r * 0.4).lineTo(r * 0.4, r * 0.4).stroke({ width: 1, color, alpha });
    g.moveTo(-r * 0.3, r * 0.2).quadraticCurveTo(0, -r * 0.3, r * 0.3, -r * 0.25).stroke({ width: 1.2, color, alpha });
  },
  kinematics: (g, r, color, alpha) => {
    // Ball + parabolic arc
    g.circle(-r * 0.25, r * 0.15, r * 0.15).fill({ color, alpha: alpha * 0.4 });
    g.moveTo(-r * 0.25, r * 0.15).quadraticCurveTo(0, -r * 0.4, r * 0.3, r * 0.15).stroke({ width: 1, color, alpha: alpha * 0.6 });
  },
  forces: (g, r, color, alpha) => {
    // Block + push/pull arrows
    g.rect(-r * 0.25, -r * 0.2, r * 0.5, r * 0.4).stroke({ width: 1, color, alpha });
    g.moveTo(-r * 0.55, 0).lineTo(-r * 0.25, 0).stroke({ width: 1.5, color, alpha });
    g.moveTo(r * 0.25, 0).lineTo(r * 0.55, 0).stroke({ width: 1.5, color, alpha });
  },
  oscillations: (g, r, color, alpha) => {
    // Sine wave
    g.moveTo(-r * 0.5, 0).quadraticCurveTo(-r * 0.25, -r * 0.4, 0, 0).quadraticCurveTo(r * 0.25, r * 0.4, r * 0.5, 0).stroke({ width: 1, color, alpha });
  },
  "newtons-laws": (g, r, color, alpha) => {
    // Apple + gravity arrow
    g.circle(0, -r * 0.2, r * 0.22).stroke({ width: 1.3, color, alpha: alpha * 0.7 });
    g.moveTo(0, r * 0.05).lineTo(0, r * 0.4).stroke({ width: 1.5, color, alpha: alpha * 0.6 });
    g.poly([0, r * 0.4, -r * 0.1, r * 0.25, r * 0.1, r * 0.25]).fill({ color, alpha: alpha * 0.4 });
  },
  "electric-charge": (g, r, color, alpha) => {
    // + and -
    g.moveTo(-r * 0.15, 0).lineTo(r * 0.15, 0).stroke({ width: 1, color, alpha });
    g.moveTo(0, -r * 0.15).lineTo(0, r * 0.15).stroke({ width: 1, color, alpha });
  },
  "maxwells-equations": (g, r, color, alpha) => {
    // ∇× symbol placeholder — simple cross
    g.moveTo(-r * 0.3, -r * 0.3).lineTo(r * 0.3, r * 0.3).stroke({ width: 1.2, color, alpha });
    g.moveTo(r * 0.3, -r * 0.3).lineTo(-r * 0.3, r * 0.3).stroke({ width: 1.2, color, alpha });
    g.circle(0, 0, r * 0.15).stroke({ width: 0.8, color, alpha: alpha * 0.5 });
  },
};

// Fallback: draw a small dot
const fallbackIcon: IconFn = (g, r, color, alpha) => {
  g.circle(0, 0, r * 0.12).fill({ color, alpha: alpha * 0.4 });
};

export function drawNodeIcon(g: Graphics, nodeId: string, r: number, color: number, alpha: number): void {
  const fn = icons[nodeId] || fallbackIcon;
  fn(g, r, color, alpha);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cosmos/cosmos-icons.ts
git commit -m "feat: physics icon drawing functions for cosmos nodes"
```

---

### Task 8: Create PixiJS layer builders

**Files:**
- Create: `src/components/cosmos/cosmos-layers.ts`

- [ ] **Step 1: Write cosmos-layers.ts with functions to build each PixiJS layer**

This file exports pure functions that create PixiJS containers. Each function takes the PixiJS `Application` (for RenderTexture creation) and data, returns a `Container`. No React, no state — just PixiJS scene graph construction.

```typescript
import {
  Application, Container, Graphics, ParticleContainer, Particle,
  Texture, RenderTexture, BlurFilter, Sprite,
} from "pixi.js";
import type { CosmosNode, CosmosEdge, VisibilityState } from "./cosmos-types";
import { drawNodeIcon } from "./cosmos-icons";

// ═══ COLOR CONSTANTS ═══
const DOMAIN_COLORS: Record<string, number> = {
  core: 0xc4a55a,
  mechanics: 0x8ab0d0,
  em: 0xc04848,
  waves: 0x50a0a0,
  thermo: 0xc09050,
  modern: 0x6080a0,
};

const STATUS_COLORS: Record<string, number> = {
  mastered: 0x8ab0d0,
  "in-progress": 0xd0a060,
  available: 0x60b880,
  locked: 0x5060a0,
};

const NEBULA_CONFIGS: Array<{ x: number; y: number; r: number; color: number; alpha: number }> = [
  { x: -200, y: -400, r: 250, color: 0x2a1050, alpha: 0.08 },
  { x: 250, y: -350, r: 200, color: 0x152540, alpha: 0.06 },
  { x: 350, y: -600, r: 180, color: 0x401520, alpha: 0.04 },
  { x: -100, y: -800, r: 150, color: 0x104030, alpha: 0.03 },
  { x: 0, y: -100, r: 300, color: 0x180a30, alpha: 0.05 },
];

// ═══ BACKGROUND STARS ═══
export interface StarData {
  graphics: Graphics;
  baseAlpha: number;
  speed: number;
  offset: number;
}

export function createStarField(cx: number, cy: number): { container: Container; stars: StarData[] } {
  const container = new Container();
  const stars: StarData[] = [];

  for (let i = 0; i < 400; i++) {
    const g = new Graphics();
    const sz = Math.random() * 1.2 + 0.2;
    const bAlpha = Math.random() * 0.3 + 0.05;
    g.circle(0, 0, sz).fill({ color: 0xccccee, alpha: bAlpha });
    g.x = cx + (Math.random() - 0.5) * 3000;
    g.y = cy + (Math.random() - 0.5) * 2500;
    container.addChild(g);
    stars.push({ graphics: g, baseAlpha: bAlpha, speed: 0.5 + Math.random() * 2, offset: Math.random() * Math.PI * 2 });
  }

  return { container, stars };
}

// ═══ NEBULAE (pre-baked) ═══
export function createNebulae(app: Application, cx: number, cy: number): Container {
  const container = new Container();

  for (const cfg of NEBULA_CONFIGS) {
    const g = new Graphics();
    g.circle(0, 0, cfg.r).fill({ color: cfg.color, alpha: cfg.alpha });

    // Bake to RenderTexture with blur
    const rt = RenderTexture.create({ width: cfg.r * 2 + 120, height: cfg.r * 2 + 120 });
    g.x = cfg.r + 60;
    g.y = cfg.r + 60;
    g.filters = [new BlurFilter({ strength: 50, quality: 3 })];
    app.renderer.render({ container: g, target: rt });

    const sprite = new Sprite(rt);
    sprite.anchor.set(0.5);
    sprite.x = cx + cfg.x;
    sprite.y = cy + cfg.y;
    container.addChild(sprite);
  }

  return container;
}

// ═══ CONNECTIONS ═══
export function createConnections(
  nodes: CosmosNode[],
  edges: CosmosEdge[],
  visibility: Map<string, VisibilityState>,
  cx: number,
  cy: number,
): Container {
  const container = new Container();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const edge of edges) {
    const a = nodeMap.get(edge.sourceId);
    const b = nodeMap.get(edge.targetId);
    if (!a || !b) continue;

    const va = visibility.get(a.id) ?? "fogged";
    const vb = visibility.get(b.id) ?? "fogged";
    if (va === "fogged" && vb === "fogged") continue;

    let alpha = 0.03;
    let width = 0.7;
    if (va === "bright" && vb === "bright") { alpha = 0.1; width = 1.5; }
    else if ((va === "bright" && vb === "frontier") || (va === "frontier" && vb === "bright")) { alpha = 0.07; width = 1.2; }
    else if (va === "dim" || vb === "dim") { alpha = 0.025; width = 0.5; }

    const g = new Graphics();
    g.moveTo(cx + a.cosmosX, cy + a.cosmosY).lineTo(cx + b.cosmosX, cy + b.cosmosY).stroke({ width, color: 0x8090c0, alpha });
    container.addChild(g);
  }

  return container;
}

// ═══ ENERGY PARTICLES ═══
export interface ParticleData {
  graphics: Graphics;
  ax: number; ay: number; bx: number; by: number;
  t: number; speed: number;
}

export function createParticles(
  nodes: CosmosNode[],
  edges: CosmosEdge[],
  visibility: Map<string, VisibilityState>,
  cx: number,
  cy: number,
): { container: Container; particles: ParticleData[] } {
  const container = new Container();
  const particles: ParticleData[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const edge of edges) {
    const a = nodeMap.get(edge.sourceId);
    const b = nodeMap.get(edge.targetId);
    if (!a || !b) continue;
    if (visibility.get(a.id) !== "bright" || visibility.get(b.id) !== "bright") continue;

    for (let i = 0; i < 2; i++) {
      const g = new Graphics();
      g.circle(0, 0, 1).fill({ color: 0xa0b0e0, alpha: 0.3 });
      container.addChild(g);
      particles.push({
        graphics: g,
        ax: cx + a.cosmosX, ay: cy + a.cosmosY,
        bx: cx + b.cosmosX, by: cy + b.cosmosY,
        t: Math.random(), speed: 0.002 + Math.random() * 0.003,
      });
    }
  }

  return { container, particles };
}

// ═══ NODES ═══
export interface NodeSprite {
  container: Container;
  node: CosmosNode;
  visibility: VisibilityState;
}

export function createNodes(
  nodes: CosmosNode[],
  visibility: Map<string, VisibilityState>,
  cx: number,
  cy: number,
  onNodeClick: (node: CosmosNode) => void,
): { container: Container; nodeSprites: NodeSprite[] } {
  const container = new Container();
  const nodeSprites: NodeSprite[] = [];

  for (const node of nodes) {
    const vis = visibility.get(node.id) ?? "fogged";
    if (vis === "fogged") continue;

    const nc = new Container();
    nc.x = cx + node.cosmosX;
    nc.y = cy + node.cosmosY;

    const r = node.cosmosRadius;
    const isInteractive = vis === "bright" || vis === "frontier";
    const color = vis === "bright"
      ? (node.nodeType === "boss" ? 0xc04030 : (DOMAIN_COLORS[node.domain] ?? 0x8ab0d0))
      : vis === "frontier"
        ? 0x60b880
        : 0x5060a0;

    const alphaMap: Record<VisibilityState, number> = { bright: 1, frontier: 0.8, dim: 0.15, fogged: 0 };
    const baseAlpha = alphaMap[vis];

    // Outer glow (only for bright/frontier)
    if (vis !== "dim") {
      const glow = new Graphics();
      glow.circle(0, 0, r * 2).fill({ color, alpha: node.nodeType === "boss" ? 0.04 : 0.025 });
      glow.filters = [new BlurFilter({ strength: 10, quality: 2 })];
      nc.addChild(glow);
    }

    // Main circle
    const main = new Graphics();
    main.circle(0, 0, r).fill({ color: 0x060410, alpha: 0.9 });
    main.circle(0, 0, r).stroke({ width: node.nodeType === "boss" ? 2.5 : 1.8, color, alpha: baseAlpha * 0.8 });
    nc.addChild(main);

    // Inner ring (not for dim)
    if (vis !== "dim") {
      const inner = new Graphics();
      inner.circle(0, 0, r * 0.7).stroke({ width: 0.5, color, alpha: baseAlpha * 0.3 });
      nc.addChild(inner);
    }

    // Physics icon
    const icon = new Graphics();
    drawNodeIcon(icon, node.id, r, color, baseAlpha * (vis === "dim" ? 0.4 : 0.6));
    nc.addChild(icon);

    // Boss corona rays
    if (node.nodeType === "boss" && vis !== "dim") {
      const corona = new Graphics();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        corona.moveTo(0, 0).lineTo(Math.cos(angle) * r * 1.8, Math.sin(angle) * r * 1.8).stroke({ width: 0.4, color, alpha: 0.05 });
      }
      nc.addChild(corona);
    }

    // Interactivity
    if (isInteractive) {
      nc.eventMode = "static";
      nc.cursor = "pointer";
      nc.on("pointerdown", () => onNodeClick(node));
      nc.on("pointerover", () => nc.scale.set(1.12));
      nc.on("pointerout", () => nc.scale.set(1));
    }

    container.addChild(nc);
    nodeSprites.push({ container: nc, node, visibility: vis });
  }

  return { container, nodeSprites };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cosmos/cosmos-layers.ts
git commit -m "feat: PixiJS layer builders for stars, nebulae, connections, particles, nodes"
```

---

### Task 9: Create React overlay components

**Files:**
- Create: `src/components/cosmos/ZoomOverlay.tsx`
- Create: `src/components/cosmos/StatsPanel.tsx`

- [ ] **Step 1: Write ZoomOverlay.tsx**

React component for the cinematic zoom detail panel. Pure presentational — receives node data and callbacks as props.

```typescript
"use client";
import type { CosmosNode } from "./cosmos-types";

interface ZoomOverlayProps {
  node: CosmosNode | null;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; border: string; label: string; btnClass: string }> = {
  mastered: { bg: "rgba(20,22,40,.9)", border: "rgba(160,170,210,.25)", label: "Mastered", btnClass: "border-blue-400/20 text-blue-300/50 hover:bg-blue-400/10" },
  available: { bg: "rgba(12,20,14,.9)", border: "rgba(90,180,120,.25)", label: "Available — Ready to learn", btnClass: "border-green-400/20 text-green-300/50 hover:bg-green-400/10" },
  "in-progress": { bg: "rgba(20,16,10,.9)", border: "rgba(200,160,80,.25)", label: "In Progress", btnClass: "border-amber-400/20 text-amber-300/50 hover:bg-amber-400/10" },
  locked: { bg: "rgba(10,10,18,.9)", border: "rgba(80,85,120,.15)", label: "Locked", btnClass: "" },
};

const BOSS_STYLE = { bg: "rgba(25,10,8,.9)", border: "rgba(180,60,40,.25)", label: "★ Boss Challenge", btnClass: "border-red-400/20 text-red-300/50 hover:bg-red-400/10" };

export default function ZoomOverlay({ node, onClose }: ZoomOverlayProps) {
  if (!node) return null;

  const style = node.nodeType === "boss" ? BOSS_STYLE : (TYPE_STYLES[node.status] ?? TYPE_STYLES.locked);
  const mastery = node.masteryLevel * 20; // 0-5 → 0-100%

  const actionLabel = node.nodeType === "boss" ? "⚔  ACCEPT CHALLENGE" : node.status === "mastered" ? "REVIEW →" : "BEGIN SESSION →";

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center transition-all duration-500 ${node ? "bg-[rgba(2,1,8,.88)]" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className="text-center p-10 max-w-[500px] animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Star orb */}
        <div
          className="w-[90px] h-[90px] rounded-full mx-auto mb-5 relative"
          style={{ background: style.bg, border: `2px solid ${style.border}`, boxShadow: `0 0 50px ${style.border}` }}
        >
          <div className="absolute -inset-2 rounded-full border animate-pulse" style={{ borderColor: "rgba(80,90,140,.1)" }} />
          <div className="absolute -inset-[18px] rounded-full border animate-pulse" style={{ borderColor: "rgba(80,90,140,.06)", animationDelay: "0.4s" }} />
          <div className="absolute -inset-[30px] rounded-full border animate-pulse" style={{ borderColor: "rgba(80,90,140,.03)", animationDelay: "0.8s" }} />
        </div>

        <h2 className="font-[family-name:var(--font-cinzel)] text-[22px] text-[rgba(200,210,240,.55)] tracking-[3px] mb-1.5">{node.title}</h2>
        <p className="font-[family-name:var(--font-cormorant)] italic text-[13px] text-[rgba(140,150,180,.3)] tracking-wide mb-4">{style.label}</p>
        <p className="font-[family-name:var(--font-cormorant)] text-sm text-[rgba(160,170,200,.3)] leading-relaxed mb-6">{node.description}</p>

        {/* Mastery bar */}
        <div className="mb-5">
          <div className="font-[family-name:var(--font-cinzel)] text-[9px] text-[rgba(120,130,160,.2)] tracking-[2px] mb-1.5">MASTERY</div>
          <div className="h-[3px] bg-[rgba(80,90,140,.06)] rounded max-w-[300px] mx-auto overflow-hidden">
            <div className="h-full rounded transition-all duration-600" style={{ width: `${mastery}%`, background: style.border }} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 border border-[rgba(80,90,140,.12)] rounded bg-[rgba(80,90,140,.04)] text-[rgba(180,190,220,.4)] font-[family-name:var(--font-cinzel)] text-[11px] tracking-[2px] cursor-pointer hover:bg-[rgba(80,90,140,.1)] transition-all">
            BACK TO COSMOS
          </button>
          {node.status !== "locked" && (
            <a href={`/session/${node.id}`} className={`px-5 py-2.5 border rounded bg-transparent font-[family-name:var(--font-cinzel)] text-[11px] tracking-[2px] cursor-pointer transition-all no-underline ${style.btnClass}`}>
              {actionLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write StatsPanel.tsx**

```typescript
"use client";
import type { CosmosNode } from "./cosmos-types";

interface StatsPanelProps {
  nodes: CosmosNode[];
}

export default function StatsPanel({ nodes }: StatsPanelProps) {
  const mastered = nodes.filter((n) => n.status === "mastered").length;
  const total = nodes.length;
  const available = nodes.filter((n) => n.status === "available").length;
  const nextBoss = nodes.find((n) => n.nodeType === "boss" && n.status !== "mastered");

  return (
    <div className="fixed bottom-3.5 left-3.5 z-20 bg-[rgba(4,3,12,.88)] border border-[rgba(80,90,140,.08)] rounded px-3.5 py-2.5 min-w-[155px] backdrop-blur-sm">
      <h3 className="font-[family-name:var(--font-cinzel)] text-[9px] text-[rgba(140,150,180,.22)] tracking-[3px] mb-1.5 border-b border-[rgba(80,90,140,.06)] pb-1">
        NAVIGATION
      </h3>
      <div className="flex justify-between text-[11px] text-[rgba(120,130,160,.3)] mb-0.5">
        <span>Stars charted</span>
        <span className="font-[family-name:var(--font-cinzel)] text-[rgba(100,180,140,.35)]">{mastered} / {total}</span>
      </div>
      <div className="flex justify-between text-[11px] text-[rgba(120,130,160,.3)] mb-0.5">
        <span>Reachable</span>
        <span className="font-[family-name:var(--font-cinzel)] text-[rgba(160,170,200,.3)]">{available}</span>
      </div>
      {nextBoss && (
        <div className="flex justify-between text-[11px] text-[rgba(120,130,160,.3)]">
          <span>Next challenge</span>
          <span className="font-[family-name:var(--font-cinzel)] text-[rgba(180,100,90,.3)]">{nextBoss.title}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/cosmos/ZoomOverlay.tsx src/components/cosmos/StatsPanel.tsx
git commit -m "feat: ZoomOverlay and StatsPanel React components for cosmos UI"
```

---

### Task 10: Create main CosmosTree component

**Files:**
- Create: `src/components/cosmos/CosmosTree.tsx`

- [ ] **Step 1: Write CosmosTree.tsx — the main PixiJS + React component**

```typescript
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Application } from "pixi.js";
import type { CosmosNode, CosmosEdge } from "./cosmos-types";
import { computeVisibleSet } from "./cosmos-fog";
import { createStarField, createNebulae, createConnections, createParticles, createNodes } from "./cosmos-layers";
import type { StarData, ParticleData, NodeSprite } from "./cosmos-layers";
import ZoomOverlay from "./ZoomOverlay";
import StatsPanel from "./StatsPanel";

interface CosmosTreeProps {
  nodes: CosmosNode[];
  edges: CosmosEdge[];
  newlyMasteredId?: string;
}

export default function CosmosTree({ nodes, edges, newlyMasteredId }: CosmosTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CosmosNode | null>(null);

  const handleNodeClick = useCallback((node: CosmosNode) => {
    setSelectedNode(node);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let app: Application;
    let destroyed = false;

    (async () => {
      app = new Application();
      await app.init({
        resizeTo: containerRef.current!,
        background: 0x020108,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (destroyed) { app.destroy(true); return; }
      containerRef.current?.appendChild(app.canvas);
      setCanvasReady(true);

      // World container for pan/zoom
      const world = new PIXI.Container();
      app.stage.addChild(world);

      const cx = app.screen.width / 2;
      const cy = app.screen.height * 0.75;

      // Compute fog visibility
      const visibility = computeVisibleSet(nodes, edges);

      // Build layers
      const { container: starsContainer, stars } = createStarField(cx, cy);
      world.addChild(starsContainer);

      const nebulaContainer = createNebulae(app, cx, cy);
      world.addChild(nebulaContainer);

      const connectionsContainer = createConnections(nodes, edges, visibility, cx, cy);
      world.addChild(connectionsContainer);

      const { container: particlesContainer, particles } = createParticles(nodes, edges, visibility, cx, cy);
      world.addChild(particlesContainer);

      const { container: nodesContainer, nodeSprites } = createNodes(nodes, visibility, cx, cy, handleNodeClick);
      world.addChild(nodesContainer);

      // Animation loop
      let time = 0;
      app.ticker.add((ticker) => {
        time += ticker.deltaTime * 0.02;

        // Twinkle stars
        for (const s of stars) {
          s.graphics.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.speed + s.offset));
        }

        // Pulse available/boss nodes
        for (const ns of nodeSprites) {
          if (ns.node.status === "available") {
            ns.container.alpha = 0.7 + 0.3 * Math.sin(time * 1.5 + ns.node.cosmosX * 0.01);
          } else if (ns.node.nodeType === "boss" && ns.visibility !== "dim") {
            ns.container.alpha = 0.65 + 0.35 * Math.sin(time * 1.2);
          }
        }

        // Animate particles
        for (const p of particles) {
          p.t += p.speed;
          if (p.t > 1) p.t -= 1;
          p.graphics.x = p.ax + (p.bx - p.ax) * p.t;
          p.graphics.y = p.ay + (p.by - p.ay) * p.t;
          p.graphics.alpha = 0.15 + 0.15 * Math.sin(p.t * Math.PI);
        }

        // Drift nebulae
        for (let i = 0; i < nebulaContainer.children.length; i++) {
          const n = nebulaContainer.children[i];
          n.x += Math.sin(time * 0.3 + i) * 0.05;
          n.y += Math.cos(time * 0.25 + i * 1.5) * 0.03;
        }
      });

      // Pan & Zoom
      let scale = 1, targetScale = 1;
      let panX = 0, panY = 0;
      let dragging = false, lastX = 0, lastY = 0;

      const canvas = app.canvas;
      canvas.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault();
        targetScale *= e.deltaY > 0 ? 0.92 : 1.08;
        targetScale = Math.max(0.3, Math.min(3, targetScale));
      }, { passive: false });

      canvas.addEventListener("pointerdown", (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      });

      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        panX += e.clientX - lastX;
        panY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
      };

      const onUp = () => { dragging = false; };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      app.ticker.add(() => {
        scale += (targetScale - scale) * 0.1;
        world.scale.set(scale);
        world.x = panX;
        world.y = panY;
      });
    })();

    return () => {
      destroyed = true;
      if (app) app.destroy(true);
    };
  }, [nodes, edges, handleNodeClick]);

  return (
    <div className="w-full h-screen relative bg-[#020108]">
      {/* Loading state */}
      {!canvasReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-[family-name:var(--font-cinzel)] text-[rgba(140,150,180,.25)] text-sm tracking-[4px] animate-pulse">
            CHARTING THE COSMOS...
          </p>
        </div>
      )}

      {/* PixiJS canvas container */}
      <div ref={containerRef} data-testid="cosmos-canvas" className="w-full h-full" />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse at center, transparent 15%, rgba(2,1,8,.65) 100%)" }} />

      {/* Title */}
      <div className="fixed top-3.5 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1 className="font-[family-name:var(--font-cinzel)] text-sm text-[rgba(160,170,200,.35)] tracking-[8px]">
          THE PHYSICS COSMOS
        </h1>
        <p className="font-[family-name:var(--font-cormorant)] italic text-[11px] text-[rgba(120,130,160,.2)] tracking-wider mt-0.5">
          scroll to zoom · drag to pan · click stars to explore
        </p>
      </div>

      {/* Stats */}
      <StatsPanel nodes={nodes} />

      {/* Zoom overlay */}
      {selectedNode && (
        <ZoomOverlay node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cosmos/CosmosTree.tsx
git commit -m "feat: main CosmosTree component with PixiJS rendering and React overlays"
```

---

## Chunk 3: Integration & Wiring

### Task 11: Update tree page with dynamic import

**Files:**
- Modify: `src/app/tree/page.tsx`

- [ ] **Step 1: Rewrite tree/page.tsx**

Replace the entire file with:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { CosmosNode, CosmosEdge } from "@/components/cosmos/cosmos-types";

const CosmosTree = dynamic(() => import("@/components/cosmos/CosmosTree"), { ssr: false });

export default function TreePage() {
  const [nodes, setNodes] = useState<CosmosNode[]>([]);
  const [edges, setEdges] = useState<CosmosEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const newlyMasteredId = searchParams.get("mastered") ?? undefined;

  useEffect(() => {
    async function fetchData() {
      const [topicsRes, edgesRes] = await Promise.all([
        fetch("/api/topics"),
        fetch("/api/edges"),
      ]);
      const topicsData = await topicsRes.json();
      const edgesData = await edgesRes.json();
      setNodes(topicsData.topics ?? []);
      setEdges(edgesData ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return null;

  return <CosmosTree nodes={nodes} edges={edges} newlyMasteredId={newlyMasteredId} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/tree/page.tsx
git commit -m "feat: wire tree page to CosmosTree with dynamic import (ssr:false)"
```

---

### Task 12: Update TopBar and session navigation

**Files:**
- Modify: `src/components/TopBar.tsx:9`
- Modify: `src/app/session/[topicId]/page.tsx:76`
- Modify: `src/app/api/topics/route.ts:20-41`

- [ ] **Step 1: Rename "Skill Tree" to "Cosmos" in TopBar.tsx**

Change line 9 from:
```typescript
{ label: "Skill Tree", href: "/tree" },
```
to:
```typescript
{ label: "Cosmos", href: "/tree" },
```

- [ ] **Step 2: Update session page "End Session" navigation**

In `src/app/session/[topicId]/page.tsx`, change line 76 from:
```javascript
window.location.href = "/tree"
```
to:
```javascript
window.location.href = `/tree?mastered=${topicId}`
```

(The `topicId` variable is already available in scope from the page params.)

- [ ] **Step 3: Update POST /api/topics to accept cosmos fields**

In the POST handler of `src/app/api/topics/route.ts`, add the new fields to the insert:

```typescript
const { title, subject, difficulty, description, status, id, cosmosX, cosmosY, cosmosRadius, domain, nodeType } = await req.json();
// ... existing validation ...
// In the insert call, add:
cosmosX: cosmosX ?? null,
cosmosY: cosmosY ?? null,
cosmosRadius: cosmosRadius ?? 10,
domain: domain ?? "core",
nodeType: nodeType ?? "star",
```

- [ ] **Step 4: Commit**

```bash
git add src/components/TopBar.tsx src/app/session/*/page.tsx src/app/api/topics/route.ts
git commit -m "feat: rename Skill Tree to Cosmos, update session navigation with mastered param"
```

---

### Task 13: Delete old D3 skill tree and update tests

**Files:**
- Delete: `src/components/skill-tree/SkillTree.tsx`
- Delete: `src/__tests__/skill-tree.test.tsx`
- Modify: `src/__tests__/topbar.test.tsx:21`
- Create: `src/__tests__/cosmos-tree.test.tsx`

- [ ] **Step 1: Delete SkillTree.tsx and its test**

```bash
rm src/components/skill-tree/SkillTree.tsx
rm src/__tests__/skill-tree.test.tsx
```

- [ ] **Step 2: Update topbar test**

In `src/__tests__/topbar.test.tsx`, change line 21 from:
```typescript
expect(screen.getByText("Skill Tree")).toBeTruthy();
```
to:
```typescript
expect(screen.getByText("Cosmos")).toBeTruthy();
```

- [ ] **Step 3: Create cosmos-tree smoke test**

```typescript
// src/__tests__/cosmos-tree.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock PixiJS (it requires WebGL which jsdom doesn't have)
vi.mock("pixi.js", () => ({
  Application: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    canvas: document.createElement("canvas"),
    stage: { addChild: vi.fn() },
    ticker: { add: vi.fn() },
    screen: { width: 800, height: 600 },
    renderer: { render: vi.fn() },
    destroy: vi.fn(),
  })),
  Container: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    children: [],
    scale: { set: vi.fn() },
    x: 0, y: 0,
  })),
  Graphics: vi.fn().mockImplementation(() => ({
    circle: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    moveTo: vi.fn().mockReturnThis(),
    lineTo: vi.fn().mockReturnThis(),
    quadraticCurveTo: vi.fn().mockReturnThis(),
    rect: vi.fn().mockReturnThis(),
    ellipse: vi.fn().mockReturnThis(),
    poly: vi.fn().mockReturnThis(),
    save: vi.fn().mockReturnThis(),
    restore: vi.fn().mockReturnThis(),
    rotation: 0,
    x: 0, y: 0, alpha: 1,
    filters: [],
    eventMode: "auto",
    cursor: "default",
    on: vi.fn(),
  })),
  Sprite: vi.fn().mockImplementation(() => ({ anchor: { set: vi.fn() }, x: 0, y: 0 })),
  BlurFilter: vi.fn().mockImplementation(() => ({})),
  RenderTexture: { create: vi.fn().mockReturnValue({}) },
  ParticleContainer: vi.fn().mockImplementation(() => ({ addChild: vi.fn() })),
  Particle: vi.fn(),
  Texture: { from: vi.fn(), WHITE: {} },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => null) })),
  useRouter: vi.fn(() => ({ replace: vi.fn(), push: vi.fn() })),
  usePathname: vi.fn(() => "/tree"),
}));

import CosmosTree from "@/components/cosmos/CosmosTree";

describe("CosmosTree", () => {
  it("renders canvas container", () => {
    render(<CosmosTree nodes={[]} edges={[]} />);
    expect(screen.getByTestId("cosmos-canvas")).toBeTruthy();
  });

  it("shows loading state initially", () => {
    render(<CosmosTree nodes={[]} edges={[]} />);
    expect(screen.getByText("CHARTING THE COSMOS...")).toBeTruthy();
  });

  it("shows title", () => {
    render(<CosmosTree nodes={[]} edges={[]} />);
    expect(screen.getByText("THE PHYSICS COSMOS")).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run all tests**

Run: `npm test -- --run`
Expected: All tests pass including new cosmos tests. Old skill-tree tests removed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: delete D3 SkillTree, add cosmos tests, update topbar test"
```

---

### Task 14: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npm test -- --run`
Expected: All tests pass.

- [ ] **Step 2: Run production build**

Run: `npx next build`
Expected: Build succeeds with no type errors.

- [ ] **Step 3: Seed and test locally**

Run: `npm run db:seed && npm run dev`
Expected: Open http://localhost:3000/tree — cosmic tree renders with stars, nebulae, nodes. Click a node to see zoom overlay.

- [ ] **Step 4: Commit any fixes needed**

If any issues found during verification, fix and commit with descriptive message.

---

## Post-Implementation Notes

### Future Enhancements (not in this plan)
- Touch/pinch zoom (track multiple pointerId values)
- Fog reveal animation when returning with `?mastered=` param
- AddTopicModal auto-placement at computed offset from nearest prerequisite
- More detailed physics icons for all 55 nodes
- Galaxy root spiral arm animation
- Sound effects on node interactions
