# First Principles — Pre-Written Lessons Curriculum

**Date:** 2026-03-17
**Status:** Approved

---

## Overview

Add a curated, pre-written lesson curriculum of 20 topics stored in the database. Each lesson replaces AI-generated challenge content with a hand-crafted, Feynman-style experience: real-world hook → interesting problem → nudging hints (no spoilers) → first-principles explanation → going deeper. KaTeX renders all math. No AI calls at lesson load time.

---

## Pedagogical Principles

1. **Analogy before abstraction** — every concept is introduced through a concrete, everyday experience before any formula or notation appears.
2. **Construct, don't state** — definitions emerge from need, not declaration. The learner feels like they're discovering the idea, not being handed it.
3. **Hints nudge, never spoil** — three escalating hints. Hint 1 redirects thinking. Hint 2 names a useful concept without applying it. Hint 3 gives the first concrete step — never the answer.
4. **Explanation derives from scratch** — the full explanation starts from what the learner already knows and builds upward. No "it is well-known that..."
5. **Going deeper opens a door** — the final question extends the concept into something surprising, connecting forward to the next topic.

---

## Schema

New table added to `src/lib/db/schema.ts`:

```ts
export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),              // e.g. "lesson-functions"
  topicId: text("topic_id").notNull().references(() => topics.id),
  hook: text("hook").notNull(),             // paragraph — why this topic is surprising
  problem: text("problem").notNull(),       // the opening challenge
  hint1: text("hint1").notNull(),           // gentle redirect
  hint2: text("hint2").notNull(),           // names a concept, no answer
  hint3: text("hint3").notNull(),           // concrete first step
  explanation: text("explanation").notNull(), // full Feynman derivation
  goingDeeper: text("going_deeper").notNull(), // one follow-up question
});
```

Lesson text fields use LaTeX delimiters for math:
- Inline: `$...$`
- Display block: `$$...$$`

---

## Math Rendering

**Component:** `src/components/MathText.tsx`

Shared React component that accepts a string and renders it with KaTeX via `dangerouslySetInnerHTML`. Extracts the rendering logic already present in `Scratchpad.tsx`. Applied to all lesson text fields in `ChallengeMode.tsx`.

```ts
// src/lib/renderMath.ts
import katex from "katex";

export function renderMath(text: string): string {
  let result = text;
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => {
    try { return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `<span class="text-danger">[Math Error]</span>`; }
  });
  result = result.replace(/\$([^$\n]+?)\$/g, (_m, tex) => {
    try { return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `<span class="text-danger">[Math Error]</span>`; }
  });
  return result;
}
```

---

## API Changes

All three challenge APIs check the `lessons` table first, then fall back to AI:

| API Route | Pre-written path | Fallback |
|-----------|-----------------|----------|
| `POST /api/challenge/generate` | Return `lesson.hook` + `lesson.problem` | Existing AI prompt |
| `POST /api/challenge/hint` | Return `lesson.hint1/2/3` by level | Existing AI prompt |
| `POST /api/challenge/explain` | Return `lesson.explanation` | Existing AI prompt |

---

## UI Change

`ChallengeMode.tsx` displays `lesson.hook` in a styled callout above the problem when a pre-written lesson is loaded. The callout uses EB Garamond, indigo left-border, `--color-accent-surface` background. It collapses after the learner submits their first attempt (it is a "why this matters" moment, not permanent scaffolding).

---

## Seed File

`src/data/seed-lessons.json` — 20 lesson objects. Populated by `seedLessons()` in `src/lib/db/seed.ts`, which runs after `seedTopics()`.

---

## The 20 Topics

Topics selected for being foundational *and* genuinely interesting — skipping the five that are too elementary for a rich Feynman lesson (Arithmetic, Fractions, Linear Equations, Variables & Types, Control Flow).

| # | Topic ID | Title | Subject |
|---|----------|-------|---------|
| 1 | `algebra-basics` | Algebra Basics | Math |
| 2 | `quadratics` | Quadratic Equations | Math |
| 3 | `functions` | Functions | Math |
| 4 | `trigonometry` | Trigonometry | Math |
| 5 | `limits` | Limits | Math |
| 6 | `derivatives` | Derivatives | Math |
| 7 | `integrals` | Integrals | Math |
| 8 | `vectors` | Vectors | Math |
| 9 | `kinematics` | Kinematics | Physics |
| 10 | `newtons-laws` | Newton's Laws | Physics |
| 11 | `energy-work` | Energy & Work | Physics |
| 12 | `momentum` | Momentum | Physics |
| 13 | `waves` | Waves | Physics |
| 14 | `gravity` | Gravity | Physics |
| 15 | `arrays-lists` | Arrays & Lists | CS |
| 16 | `recursion` | Recursion | CS |
| 17 | `sorting-algorithms` | Sorting Algorithms | CS |
| 18 | `big-o` | Big-O Notation | CS |
| 19 | `trees-graphs` | Trees & Graphs | CS |
| 20 | `hash-tables` | Hash Tables | CS |

---

## Lesson Content

### 1. Algebra Basics

**Hook:** Every time you balance a budget, adjust a recipe, or figure out how fast to drive to arrive on time, you are doing algebra — reasoning backwards. You know the result you want, and you have to find the number that produces it. Algebra is not about memorizing procedures. It is about one simple idea: unknown quantities can be named, and once named, they can be found.

**Problem:** You have two jars. Together they hold 20 marbles. One jar holds 4 more marbles than the other. Without guessing and checking, can you figure out how many marbles are in each jar — and describe a method that would work for *any* two numbers?

**Hint 1:** What if you gave the unknown quantity a name — say, the number in the smaller jar is $x$. Can you write a sentence about the two jars using only $x$?

**Hint 2:** If the smaller jar holds $x$, the larger holds $x + 4$. Together they hold 20. Can you write that as an equation? What legal moves preserve the balance of an equation?

**Hint 3:** You should have $x + (x + 4) = 20$. Simplify the left side. Then subtract, then divide. Each step keeps both sides equal — like keeping a scale balanced.

**Explanation:** Think of an equation as a perfectly balanced scale. Whatever you do to one side, you must do to the other to keep it balanced. That constraint — preserve equality — is the entire engine of algebra.

Name the smaller jar $x$. The larger holds $x + 4$. Together:

$$x + (x + 4) = 20$$
$$2x + 4 = 20$$

Subtract 4 from both sides (the scale stays balanced):

$$2x = 16$$

Divide both sides by 2:

$$x = 8$$

The smaller jar holds 8 marbles, the larger holds 12. Check: $8 + 12 = 20$ ✓ and $12 - 8 = 4$ ✓.

The method works for any two numbers because we never assumed anything specific about 20 or 4 — we just applied legal moves to a balanced scale. That generality is the whole point of naming unknowns.

**Going Deeper:** What if the larger jar held *twice* as many as the smaller, instead of 4 more? Write that as an equation and solve it. What changes in your approach — and what stays exactly the same?

---

### 2. Quadratic Equations

**Hook:** Throw a ball. The arc it traces is not a circle. It is not a straight line. It is a parabola — described by a quadratic equation. Quadratics appear everywhere that two things multiply together: area, acceleration, the path of anything that falls. They are the first equations where the answer is not unique, and that ambiguity turns out to be deeply meaningful.

**Problem:** A ball is thrown straight upward from the ground. Its height in meters at time $t$ seconds is $h(t) = 20t - 5t^2$. When does it hit the ground again? When does it reach its maximum height? Try to reason through this without the quadratic formula — think about what $h(t) = 0$ means physically.

**Hint 1:** $h(t) = 0$ means the ball is at ground level. It starts there and returns there. Can you factor $20t - 5t^2$? Look for something both terms share.

**Hint 2:** Factor out $5t$: you get $5t(4 - t) = 0$. A product of two things equals zero when either one is zero. What are the two values of $t$?

**Hint 3:** $t = 0$ is the launch, $t = 4$ is the landing. The maximum height is at the midpoint of the flight — by symmetry of the parabola. What is $h(2)$?

**Explanation:** A parabola is symmetric. It rises to a peak and falls the same way it rose. So if the ball leaves the ground at $t = 0$ and lands at $t = 4$, it peaks exactly halfway: at $t = 2$.

Finding the landing time by factoring:

$$20t - 5t^2 = 0$$
$$5t(4 - t) = 0$$

Either $5t = 0$ (launch: $t = 0$) or $4 - t = 0$ (landing: $t = 4$).

Maximum height at $t = 2$:

$$h(2) = 20(2) - 5(4) = 40 - 20 = 20 \text{ m}$$

The quadratic formula $t = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ is just a pre-solved version of this process — it comes directly from completing the square on $at^2 + bt + c = 0$. The $\pm$ reflects the symmetry: two solutions, mirrored around the peak. The quantity under the square root, $b^2 - 4ac$, tells you whether the parabola crosses the ground at all (positive: twice, zero: once, negative: never).

**Going Deeper:** The discriminant $b^2 - 4ac < 0$ means no real solutions. In the ball problem, what would that mean physically? Can you construct a height equation where the ball never comes back down — and explain what is physically wrong with it?

---

### 3. Functions

**Hook:** A function is one of the most powerful ideas in mathematics, and it is disarmingly simple. It is a promise: give me an input and I will give you back exactly one output. No surprises. That single constraint — one output per input — is what makes calculus possible, what makes programming predictable, and what makes cryptography work. Every function in every programming language is named after this mathematical idea.

**Problem:** A coffee machine in your office always gives espresso when you press the espresso button — every single time. A magic 8-ball gives you a different answer every time you ask the same question. Which one is a function? Use these two examples to figure out exactly what the essential property of a function must be, then state a definition in your own words.

**Hint 1:** What does the coffee machine *promise* you that the magic 8-ball does not?

**Hint 2:** The critical property is called being "well-defined." What would go wrong mathematically if a function could return two different values for the same input? Think about what a graph of such a thing would look like.

**Hint 3:** Try completing this sentence: "A function assigns to each input exactly ______." Now think about the vertical line test — why does it detect whether something is a function?

**Explanation:** Imagine drawing every possible input-output pair on a graph. A function is a rule where every vertical line (every fixed input) hits the graph at *exactly one point*. The coffee machine passes this test — button B7 always maps to one output. The magic 8-ball fails it — the same question maps to many outputs.

Formally: a function $f: A \to B$ assigns to **every** element of $A$ exactly **one** element of $B$. The set $A$ is the domain (all valid inputs), $B$ is the codomain (all possible outputs), and the actual outputs produced form the range.

Composition $g(f(x))$ means: pipe the output of $f$ directly into $g$ as input. This is the mathematical version of chaining operations — if $f$ doubles a number and $g$ adds 3, then $g(f(2)) = g(4) = 7$. Programming's function composition works identically.

The reason this matters: when you take the derivative, you are asking for the slope at each point. If a "function" gave two different $y$-values at the same $x$, which slope would you compute? The well-definedness constraint is what makes derivatives meaningful.

**Going Deeper:** $f(x) = x^2$ is not invertible over all real numbers — there is no function that perfectly undoes it. Why not? (Hint: what does $f(3)$ equal, and what does $f(-3)$ equal?) How does restricting the domain to $x \geq 0$ fix this, and why is that the reason $\sqrt{x}$ is only defined for non-negative inputs?

---

### 4. Trigonometry

**Hook:** The ancient Greeks noticed something remarkable: the *ratio* of a triangle's sides depends only on its angles, not on how big the triangle is. A tiny right triangle with a 30° angle and a giant one have the same ratios. That scale-independence means you can measure the height of a mountain by standing far away with a protractor — no climbing required. This observation turned out to be one of the most productive ideas in all of science.

**Problem:** You stand 100 meters from the base of a building and look up at its top. The angle from the ground to your line of sight is 60°. Without a measuring tape, how tall is the building? Think about what the angle tells you about the relationship between the sides of the triangle you are standing in.

**Hint 1:** Draw the situation. You have a right triangle. You know one angle (60°) and the side *adjacent* to it (100 m). You want the side *opposite* to it (the building height). What ratio connects "opposite" to "adjacent"?

**Hint 2:** The tangent of an angle is $\tan\theta = \dfrac{\text{opposite}}{\text{adjacent}}$. So $\tan(60°) = \dfrac{\text{height}}{100}$. You need to know $\tan(60°)$ — can you figure it out from a 30-60-90 triangle without memorising it?

**Hint 3:** In a 30-60-90 triangle with hypotenuse 2, the sides are 1 (opposite 30°) and $\sqrt{3}$ (opposite 60°). So $\tan(60°) = \sqrt{3}$. Multiply both sides of the equation by 100.

**Explanation:** In a right triangle, three ratios depend only on the angle $\theta$:

$$\sin\theta = \frac{\text{opposite}}{\text{hypotenuse}}, \quad \cos\theta = \frac{\text{adjacent}}{\text{hypotenuse}}, \quad \tan\theta = \frac{\text{opposite}}{\text{adjacent}}$$

For the building: $\tan(60°) = \dfrac{h}{100}$, so $h = 100\sqrt{3} \approx 173$ m.

But the deeper picture comes from the unit circle. Imagine a circle of radius 1 centred at the origin. Draw a radius at angle $\theta$ from the horizontal. The endpoint lands at coordinates $(\cos\theta,\, \sin\theta)$ — that is their definition. This extends trig beyond triangles to all angles, even past 360°, which is why $\sin\theta$ and $\cos\theta$ repeat — they cycle around the circle indefinitely.

The most important identity falls straight out of the Pythagorean theorem applied to that circle:

$$\sin^2\theta + \cos^2\theta = 1$$

because any point on a unit circle satisfies $x^2 + y^2 = 1$.

**Going Deeper:** Sine and cosine are periodic — they repeat every $360°$. This makes them the natural language for anything that cycles: sound waves, light, alternating current, pendulums. Why does a repeating physical phenomenon produce a *sine wave* specifically, rather than some other repeating shape?

---

### 5. Limits

**Hook:** For most of history, mathematicians were terrified of two things: infinity and zero. You cannot divide by zero — it breaks arithmetic. You cannot add infinitely many things — the sum might never settle. Yet calculus, the most powerful tool in mathematics, is built entirely on both. The concept that makes this safe is the limit: a way of asking "what value does this approach?" without ever having to arrive there.

**Problem:** The sequence $\frac{1}{2}, \frac{1}{4}, \frac{1}{8}, \frac{1}{16}, \ldots$ never reaches 0 — every term is positive. Yet the sum $\frac{1}{2} + \frac{1}{4} + \frac{1}{8} + \cdots$ seems to approach exactly 1. Does it actually reach 1, or only get close? And what is the difference between "approaching" and "reaching"? Think carefully — this is not a trick question, but the answer requires precision.

**Hint 1:** Plot the partial sums on a number line: $\frac{1}{2}$, then $\frac{3}{4}$, then $\frac{7}{8}$, then $\frac{15}{16}$. Can you see a pattern? What is the gap between each partial sum and 1?

**Hint 2:** The gap after $n$ terms is $\frac{1}{2^n}$. Can you make this gap smaller than any number you choose — say, smaller than $\frac{1}{1{,}000{,}000}$ — just by taking enough terms?

**Hint 3:** If you can always get closer than any target distance, no matter how tiny, then the sum *converges to* 1. This is different from saying it equals 1 in finitely many steps. Is that distinction meaningful?

**Explanation:** The partial sum after $n$ terms is:

$$S_n = \frac{1}{2} + \frac{1}{4} + \cdots + \frac{1}{2^n} = 1 - \frac{1}{2^n}$$

As $n \to \infty$, the term $\frac{1}{2^n} \to 0$, so $S_n \to 1$. We write $\displaystyle\lim_{n \to \infty} S_n = 1$.

The formal meaning: for any tiny $\varepsilon > 0$ you name, there exists an $N$ such that for all $n > N$, the partial sum is within $\varepsilon$ of 1. You can get arbitrarily close. That is what "the limit is 1" means — not that you get there in finite steps.

This resolves Zeno's paradox: Achilles runs half the distance, then half the remaining distance, forever. Does he ever finish? The total time is $\frac{1}{2} + \frac{1}{4} + \cdots = 1$. He finishes in exactly 1 unit of time. The infinite process has a finite result.

The same idea underlies derivatives: $f'(x)$ is the limit of $\dfrac{f(x+h)-f(x)}{h}$ as $h \to 0$. We never divide by zero — we ask what the ratio *approaches* as $h$ shrinks.

**Going Deeper:** Consider $\sin(1/x)$ as $x \to 0$. It oscillates between −1 and 1 faster and faster, never settling. Its limit does not exist. What is the difference between a limit not existing and a function simply being undefined at a point? Can you construct an example of each?

---

### 6. Derivatives

**Hook:** Your speedometer does not count anything. It does not measure total distance driven. It answers a stranger question: how fast are you moving *right now* — not over the last minute, not over the last mile, but at this exact instant. That seems impossible, because speed is distance divided by time, and "right now" has no duration. The derivative is the mathematical trick that makes instantaneous speed — and instantaneous rates of anything — precise and computable.

**Problem:** A car's position in meters at time $t$ seconds is $x(t) = t^2$. At exactly $t = 3$ seconds, what is the car's speed? You can easily find the *average* speed between $t = 3$ and $t = 4$: just compute $\frac{x(4) - x(3)}{1}$. But average speed is not the same as speed at an instant. Figure out a way to get the instantaneous speed.

**Hint 1:** Compute the average speed between $t = 3$ and $t = 3.1$. Then between $t = 3$ and $t = 3.01$. Then $t = 3$ and $t = 3.001$. What number are all these approaching?

**Hint 2:** The pattern is the difference quotient: $\dfrac{x(3+h) - x(3)}{h}$. Expand $(3+h)^2$, subtract 9, then divide by $h$. Simplify. What is left?

**Hint 3:** You should get $6 + h$. As $h \to 0$, this approaches 6. That is the instantaneous speed at $t = 3$. Can you repeat this process for a general time $t$ — not just $t = 3$ — to find the speed function?

**Explanation:** Imagine zooming in on the graph of $x = t^2$ around the point $t = 3$. Zoomed out, the curve bends. Zoom in close enough, and any smooth curve looks like a straight line. That line's slope *is* the derivative — the instantaneous rate of change.

Average speed from $t$ to $t + h$:

$$\frac{(t+h)^2 - t^2}{h} = \frac{t^2 + 2th + h^2 - t^2}{h} = \frac{2th + h^2}{h} = 2t + h$$

As $h \to 0$:

$$\frac{dx}{dt} = 2t$$

At $t = 3$: speed $= 2(3) = 6$ m/s. At $t = 5$: speed $= 10$ m/s. The derivative $2t$ is itself a function — it gives the slope of $x = t^2$ at every moment.

The general rule (power rule): $\dfrac{d}{dt}(t^n) = n\,t^{n-1}$. It falls out of the same algebra every time, for any $n$.

The derivative tells you three things about a function: where it is increasing ($f' > 0$), decreasing ($f' < 0$), and at a peak or trough ($f' = 0$).

**Going Deeper:** The derivative of position is velocity. The derivative of velocity is acceleration. For $x(t) = t^2$, what is $x''(t)$? It is constant — what does that tell you about how this car is moving?

---

### 7. Integrals

**Hook:** The derivative answers "how fast is this changing right now?" The integral answers the reverse: "how much has accumulated in total?" These look like completely unrelated questions. The most surprising theorem in calculus — the Fundamental Theorem — says they are perfectly inverse to each other. To find total accumulation, find a function whose derivative is what you are accumulating. That connection between rate and total is the engine of physics, economics, and engineering.

**Problem:** A car accelerates steadily so that its velocity at time $t$ is $v(t) = 2t$ m/s. How far does it travel between $t = 0$ and $t = 5$ seconds? You cannot just multiply speed by time because the speed keeps changing. Think geometrically: what does the area under the velocity curve represent?

**Hint 1:** During a tiny slice of time $dt$ at moment $t$, the car is moving at roughly $v(t) = 2t$ m/s. How far does it travel in that tiny slice?

**Hint 2:** The distance during the slice is $v(t)\,dt = 2t\,dt$. To find total distance, you sum all these slices from $t = 0$ to $t = 5$. Sketch $v(t) = 2t$ from 0 to 5 — what geometric shape is the region underneath it?

**Hint 3:** The region is a right triangle with base 5 and height $v(5) = 10$. Area $= \frac{1}{2} \times 5 \times 10$. Also try: find a function $F(t)$ whose derivative is $2t$, then compute $F(5) - F(0)$.

**Explanation:** The area under $v(t) = 2t$ from 0 to 5 is a triangle:

$$\text{Area} = \frac{1}{2} \times 5 \times 10 = 25 \text{ m}$$

The Fundamental Theorem of Calculus says:

$$\int_0^5 2t\, dt = F(5) - F(0)$$

where $F'(t) = 2t$. The function $F(t) = t^2$ satisfies this (since $\frac{d}{dt}(t^2) = 2t$). So:

$$F(5) - F(0) = 25 - 0 = 25 \text{ m} \checkmark$$

Two ways to think about an integral:
- **Geometric**: signed area under the curve (negative when the curve dips below zero)
- **Anti-derivative**: find $F$ such that $F' = f$, then $\int_a^b f(x)\,dx = F(b) - F(a)$

The anti-derivative power rule (reverse of differentiation):

$$\int x^n\,dx = \frac{x^{n+1}}{n+1} + C$$

The Fundamental Theorem is non-obvious: the way to compute an infinite sum of infinitesimal slices is to find a completely different function and evaluate it at two points. That this works at all is the miracle of calculus.

**Going Deeper:** The constant $C$ appears in indefinite integrals: $\int f(x)\,dx = F(x) + C$. Why must it be there? And why does it disappear when you compute a definite integral $\int_a^b f(x)\,dx = F(b) - F(a)$?

---

### 8. Vectors

**Hook:** The number 5 tells you a magnitude. But "5 meters northeast" tells you something richer — a magnitude *and* a direction. That is a vector. Vectors are the language of the physical world because forces, velocities, and fields all have direction. Without vectors, you cannot write Newton's laws, describe electromagnetic fields, or render a 3D scene. Every game engine and physics simulator runs on vector arithmetic.

**Problem:** Two people push a box. Person A pushes with force 3 N to the east. Person B pushes with force 4 N to the north. What is the total force on the box — its magnitude and direction? Try solving this purely from the geometry of right triangles, before touching any formula.

**Hint 1:** Forces add as vectors, not as plain numbers. Draw both forces as arrows starting from the same point. To add them, place the tail of one arrow at the head of the other. Where do you end up?

**Hint 2:** The two force arrows form the legs of a right triangle. The combined force is the hypotenuse. What theorem gives you its length?

**Hint 3:** The magnitude is $\sqrt{3^2 + 4^2}$. Once you have that, the direction is the angle whose tangent is $\frac{4}{3}$ (north component over east component). You have seen this triangle before.

**Explanation:** Force A points east: $\vec{A} = (3, 0)$. Force B points north: $\vec{B} = (0, 4)$. Add component by component:

$$\vec{A} + \vec{B} = (3 + 0,\; 0 + 4) = (3, 4)$$

Magnitude: $|\vec{F}| = \sqrt{3^2 + 4^2} = \sqrt{25} = 5$ N.

Direction: $\theta = \arctan\!\left(\dfrac{4}{3}\right) \approx 53.1°$ north of east.

The 3-4-5 Pythagorean triple appears naturally. This is vector addition — the parallelogram law.

Key vector operations:
- **Dot product**: $\vec{a} \cdot \vec{b} = a_1 b_1 + a_2 b_2 = |\vec{a}||\vec{b}|\cos\theta$ — gives a scalar; zero means the vectors are perpendicular.
- **Cross product** (3D): gives a vector perpendicular to both, with magnitude $|\vec{a}||\vec{b}|\sin\theta$.

The dot product's $\cos\theta$ is the key: it measures how much two vectors *agree* in direction. In machine learning, cosine similarity between two high-dimensional vectors measures how "similar" two things are — same idea, thousands of dimensions.

**Going Deeper:** The dot product $\vec{a} \cdot \vec{b} = 0$ means the vectors are perpendicular. In 3D computer graphics, the dot product between a surface's normal vector and a light direction determines how bright that surface appears. Can you explain geometrically why a surface perpendicular to the light source would be brightest?

---

### 9. Kinematics

**Hook:** Before asking *why* things move, we need a precise language for *how* they move. This seems obvious — use distance and speed — but the moment you allow changing speed, subtleties emerge. A falling object speeds up continuously. A car braking slows down. A ball thrown upward decelerates, stops, and then accelerates back down. Kinematics gives you the exact equations to describe all of this, and they are the gateway to all of mechanics.

**Problem:** You drop a ball from a building. A friend times the fall with a stopwatch: it takes exactly 4 seconds to hit the ground. How tall is the building? (Use $g = 10$ m/s².) Reason from scratch — do not just plug into a formula. Think about how the ball's velocity changes moment by moment, and what that implies about distance.

**Hint 1:** The ball starts at rest and gains 10 m/s of speed every second due to gravity. After 1 second it moves at 10 m/s; after 2 seconds, 20 m/s; after 3 seconds, 30 m/s. What is the velocity at any time $t$?

**Hint 2:** Velocity increases linearly: $v = gt$. On a velocity-time graph, this is a straight line through the origin. The distance fallen is the area under that graph — a triangle with base $t$ and height $gt$. What is the area?

**Hint 3:** Distance $= \frac{1}{2}gt^2$. This is the integral of velocity. Plug in $t = 4$ and $g = 10$.

**Explanation:** Under constant acceleration $g$ from rest, velocity grows linearly: $v(t) = gt$.

Distance is the area under the $v$-$t$ graph — a right triangle with base $t$ and height $gt$:

$$h = \frac{1}{2}gt^2$$

Building height: $h = \frac{1}{2}(10)(4^2) = \frac{1}{2}(10)(16) = 80$ m.

The four kinematic equations (constant acceleration, general initial velocity $v_0$):

$$v = v_0 + at$$
$$x = v_0 t + \frac{1}{2}at^2$$
$$v^2 = v_0^2 + 2ax$$
$$x = \frac{v_0 + v}{2}\,t$$

Each equation connects a different combination of the five quantities $\{v_0, v, a, x, t\}$ — knowing any three lets you find the other two. The displacement formula $x = v_0 t + \frac{1}{2}at^2$ is just the integral of $v = v_0 + at$, which is why calculus and kinematics are the same subject viewed from different angles.

**Going Deeper:** These equations assume constant acceleration. But real gravitational acceleration changes with altitude — it is proportional to $\frac{1}{r^2}$ where $r$ is the distance from Earth's centre. What mathematical tool would you need to find distance fallen under *varying* acceleration? What would replace $\frac{1}{2}gt^2$?

---

### 10. Newton's Laws

**Hook:** Before Newton, motion was explained with vague philosophy: "natural motion," "violent motion," Aristotle's ideas about things seeking their proper place. Newton replaced all of that with three sentences. Three laws. They explained the motion of planets, pendulums, cannonballs, and tides from identical first principles. The achievement was so complete it went unrevised for over 200 years — and even Einstein only needed to modify it at speeds approaching light.

**Problem:** A 2 kg book sits on a table. You push it with 10 N — it stays still. You push with 20 N — it slides, accelerating at 5 m/s². What is the friction force in each case, and what is the minimum force needed to start it moving? Think carefully about what "staying still" implies about the forces acting on the book.

**Hint 1:** If the book does not accelerate, the net force on it must be zero — Newton's 1st Law. When you push with 10 N and nothing moves, what must the friction force equal?

**Hint 2:** When the book slides with 20 N applied and accelerates at 5 m/s², use Newton's 2nd Law: $F_\text{net} = ma$. Compute the net force. From that, compute the friction force during sliding.

**Hint 3:** Static friction adjusts to match the applied force up to a maximum. Kinetic friction (while sliding) is constant at the value you just calculated. The book started sliding somewhere between 10 N and 20 N — that upper limit is the maximum static friction.

**Explanation:** Newton's three laws:

1. **Inertia**: an object maintains constant velocity unless a net force acts on it.
2. **$F = ma$**: net force equals mass times acceleration.
3. **Action-reaction**: for every force on object A from B, there is an equal and opposite force on B from A.

At 10 N (no acceleration): $F_\text{net} = 0$, so friction $= 10$ N exactly — static friction matches the push.

At 20 N (acceleration $= 5$ m/s²):
$$F_\text{net} = ma = 2 \times 5 = 10 \text{ N}$$
$$\text{Friction} = 20 - 10 = 10 \text{ N (kinetic)}$$

The most common confusion about Newton's 3rd Law: if every force has an equal opposing force, why does anything accelerate? The answer is that action-reaction pairs act on *different* objects. The table pushes the book up with a normal force; the book pushes the table down with an equal force — these act on different objects and never cancel each other. Only forces on the *same* object cancel.

**Going Deeper:** If you push a wall, it pushes back on you with the same force. So why do you accelerate backward and the wall does not? What does Newton's 2nd Law say about the role of mass here?

---

### 11. Energy & Work

**Hook:** Energy is the most conserved quantity in the universe. It is never created, never destroyed — only transformed. A falling rock converts gravitational potential energy into kinetic energy. A battery converts chemical energy to electrical. A light bulb converts electrical energy to heat and light. Tracking these transformations often lets you predict outcomes without ever knowing the complicated forces involved — which is usually much easier than solving Newton's laws directly.

**Problem:** A 1 kg ball is dropped from a height of 10 m. What is its speed just before it hits the ground? Try to solve this *without* kinematics equations — use energy instead. Think about what the ball has at the top and what form it takes at the bottom.

**Hint 1:** At the top, the ball is stationary. It has gravitational potential energy and no kinetic energy. What is the formula for gravitational potential energy?

**Hint 2:** At the bottom (just before impact), the ball is at ground level — no potential energy — and moving fast. All the energy has converted to kinetic. What is the formula for kinetic energy?

**Hint 3:** Set initial potential energy equal to final kinetic energy: $mgh = \frac{1}{2}mv^2$. Notice the mass $m$ appears on both sides. What does that tell you about the answer?

**Explanation:** At the top: $KE = 0$, $PE = mgh = 1 \times 10 \times 10 = 100$ J.

At the bottom: $PE = 0$, $KE = \frac{1}{2}mv^2$.

Conservation of energy:

$$mgh = \frac{1}{2}mv^2$$
$$gh = \frac{1}{2}v^2$$
$$v = \sqrt{2gh} = \sqrt{2 \times 10 \times 10} = \sqrt{200} \approx 14.1 \text{ m/s}$$

The mass cancelled — every object falls to the same speed from the same height regardless of its mass. Galileo observed this from the Tower of Pisa; energy conservation explains why.

Work is the transfer of energy through force: $W = F \cdot d \cdot \cos\theta$. Only the component of force *along* the direction of motion does work. The work-energy theorem: net work done on an object equals its change in kinetic energy.

The power of energy methods: they bypass the complicated details of forces. A pendulum string changes direction constantly — its tension is difficult to track at every point. But you can still find the pendulum's speed at the bottom by noting that $PE_\text{top} = KE_\text{bottom}$.

**Going Deeper:** Real pendulums stop oscillating. A perfectly elastic ball dropped repeatedly would bounce forever. Neither happens. Where does the energy go — and why can't you recover it to make the pendulum keep swinging?

---

### 12. Momentum

**Hook:** When two billiard balls collide, you might think the outcome depends on everything — the exact forces involved, the duration of contact, the squishing of the balls. But there is a quantity that comes out unchanged regardless of all those messy details: momentum. It is the hidden invariant of collisions. Discover it, and you can predict the outcome of any collision without ever knowing a single force.

**Problem:** A 3 kg cart moving at 4 m/s to the right collides with a 1 kg cart at rest. After the collision they stick together. What is their combined velocity? Now consider an alternative: the 3 kg cart stops completely after the collision. How fast would the 1 kg cart move then? One of these scenarios is physically impossible — which one, and how can you tell?

**Hint 1:** Total momentum before the collision equals total momentum after (if there are no external forces). Write down the total momentum before the collision: $p = m_1 v_1 + m_2 v_2$.

**Hint 2:** For the stick-together case: $(m_1 + m_2)v_f = p_\text{total}$. For the stop-completely case: $m_2 v_2' = p_\text{total}$. Solve both for the final velocity.

**Hint 3:** Momentum is conserved in both. But kinetic energy cannot increase on its own. Compute the total kinetic energy before and after each scenario. Which scenario has more energy after the collision than before?

**Explanation:** Initial momentum: $p = 3(4) + 1(0) = 12$ kg·m/s.

**Scenario A** (stick together): $(3+1)v_f = 12$, so $v_f = 3$ m/s.
- $KE_\text{before} = \frac{1}{2}(3)(16) = 24$ J
- $KE_\text{after} = \frac{1}{2}(4)(9) = 18$ J — energy lost to heat and sound ✓

**Scenario B** (3 kg stops): $1 \cdot v_2' = 12$, so $v_2' = 12$ m/s.
- $KE_\text{after} = \frac{1}{2}(1)(144) = 72$ J > 24 J — energy created from nothing ✗

Scenario B violates conservation of energy — impossible.

Momentum is always conserved in collisions (no external horizontal forces). Kinetic energy is only conserved in *elastic* collisions (like nearly-ideal billiard balls). Real collisions lose energy to heat, sound, and deformation — they are *inelastic*.

Impulse connects force and momentum: $J = F \cdot \Delta t = \Delta p$. A long collision time (a car's crumple zone) reduces the peak force for the same change in momentum — this is why cars are designed to crumple rather than stay rigid.

**Going Deeper:** In Newton's cradle (equal-mass balls), when one ball swings in, exactly one ball swings out at the same speed. Can you prove this is the only outcome that simultaneously conserves both momentum and kinetic energy?

---

### 13. Waves

**Hook:** Waves are not things — they are patterns of motion. When an ocean wave passes under a boat, the water molecules move in circles and return to where they started. The pattern travels, but the material does not. This matters enormously: sound is a pressure wave (air molecules do not travel from speaker to ear — the disturbance does), and light is an electromagnetic wave that needs no material medium at all. Waves are how the universe transmits information without moving matter.

**Problem:** Two loudspeakers sit side by side, both playing the same pure tone at 340 Hz. You walk in front of them and discover that some spots are extremely loud and others are completely silent — even though both speakers are working perfectly. What is happening? Can you predict where the silent spots will be?

**Hint 1:** The silent spots occur where the two waves cancel each other exactly. What has to be true about the two waves at those points for them to cancel — what is the relationship between their peaks and troughs?

**Hint 2:** Cancellation (destructive interference) happens when one wave's crest arrives with the other's trough — when the path difference from the two speakers is exactly half a wavelength. What is the wavelength of a 340 Hz sound wave if sound travels at 340 m/s?

**Hint 3:** $\lambda = \frac{v}{f} = \frac{340}{340} = 1$ m. Destructive interference occurs wherever the path difference is $0.5\,\text{m},\, 1.5\,\text{m},\, 2.5\,\text{m}\ldots$ Constructive interference (loud) occurs at $0\,\text{m},\, 1\,\text{m},\, 2\,\text{m}\ldots$ Can you sketch this pattern?

**Explanation:** Wave properties:

$$v = f\lambda \quad \Rightarrow \quad \lambda = \frac{v}{f} = \frac{340}{340} = 1 \text{ m}$$

Superposition principle: waves add. Two crests together make a bigger crest (constructive). A crest and a trough together cancel (destructive).

The interference pattern is determined by path length difference $\Delta d$ from the two speakers:
- $\Delta d = 0,\, \lambda,\, 2\lambda,\ldots$ → loud (constructive)
- $\Delta d = \frac{\lambda}{2},\, \frac{3\lambda}{2},\ldots$ → silent (destructive)

This is not unique to sound. Young's double-slit experiment uses the same setup with light, producing the same alternating bright and dark bands — proving light is a wave. The same mathematics describes water ripples, quantum probability amplitudes, and radio antenna design.

The key insight is that the pattern is fixed in space. Walk to the right place and you will always find silence. Walk one step further and you will find full volume.

**Going Deeper:** If two waves can cancel (destructive interference), where does the energy go? Does it disappear? Think about a standing wave between two reflecting walls, where the pattern appears frozen in place, and what energy conservation demands.

---

### 14. Gravity

**Hook:** Newton's great insight was that the force pulling an apple down is the same force keeping the Moon in orbit. Not similar — literally the same. Before Newton, celestial and earthly motion were considered fundamentally different. Newton unified them with one equation. It correctly predicts the orbit of every planet, the path of every comet, the timing of every tide — from a single formula derived by watching things fall.

**Problem:** The Moon orbits Earth once every 27.3 days at a distance of 384,400 km. Using only this data, estimate the mass of the Earth. (Use $G = 6.67 \times 10^{-11}$ N·m²/kg².) Think about what provides the force that keeps the Moon moving in a circle rather than flying off in a straight line.

**Hint 1:** For a circular orbit, gravity provides the centripetal force. Write an equation setting Newton's law of gravitation equal to the centripetal force formula. You should notice that the Moon's mass cancels immediately.

**Hint 2:** The orbital speed is the circumference divided by the period: $v = \dfrac{2\pi r}{T}$. Compute $v$ in m/s. Then solve $\dfrac{GM}{r} = v^2$ for $M$.

**Hint 3:** $M = \dfrac{v^2 r}{G}$. You have all three quantities. Crunch the numbers — you should get something close to $6 \times 10^{24}$ kg.

**Explanation:** Orbital speed:

$$v = \frac{2\pi r}{T} = \frac{2\pi (3.844 \times 10^8)}{27.3 \times 24 \times 3600} \approx 1{,}023 \text{ m/s}$$

Gravity = centripetal force:

$$\frac{GMm}{r^2} = \frac{mv^2}{r}$$

The Moon's mass $m$ cancels (satellites of all masses orbit at the same speed at the same altitude):

$$\frac{GM}{r} = v^2 \quad \Rightarrow \quad M = \frac{v^2 r}{G}$$

$$M = \frac{(1{,}023)^2 \times 3.844 \times 10^8}{6.67 \times 10^{-11}} \approx 6.0 \times 10^{24} \text{ kg} \checkmark$$

You just weighed the Earth without touching it. That is the power of Newton's law.

Universal gravitation: $F = \dfrac{GMm}{r^2}$. The $\frac{1}{r^2}$ dependence (inverse square law) arises from 3D geometry — gravity spreads over a sphere of surface area $4\pi r^2$, just as light does, which is why both follow the same inverse square law.

**Going Deeper:** Geostationary satellites appear to hover over a fixed point on Earth. They must orbit at exactly one specific altitude. Could you use the same method to calculate that altitude? What determines it?

---

### 15. Arrays & Lists

**Hook:** Almost every program ever written needs to store a collection of things — a list of users, a history of actions, a sequence of pixels. The most fundamental structure for this is the array: a contiguous block of memory where you can reach any element instantly by its position. Understanding why arrays are fast — and what they trade away to achieve that speed — is the beginning of thinking algorithmically.

**Problem:** You have an array of 1 million numbers. You want to find whether a specific number is in the array. How many operations might this take — and does it matter whether the array is sorted? Think through both cases carefully and compare them.

**Hint 1:** For an unsorted array, how many elements might you need to check in the worst case? What if the number is not there at all?

**Hint 2:** For a sorted array, you can do much better than checking every element. Imagine a phone book — how do you find a name efficiently without reading every page?

**Hint 3:** Binary search works by repeatedly cutting the search space in half. For 1 million elements, how many times can you halve 1,000,000 before reaching 1? That is your answer.

**Explanation:** **Unsorted**: must check every element in the worst case — up to 1,000,000 comparisons. This is linear search.

**Sorted — binary search**: check the middle element, determine which half contains the target, discard the other half, repeat.

After $k$ steps, $\frac{n}{2^k}$ elements remain. Stop when $\frac{n}{2^k} = 1$, so $k = \log_2 n$.

$$\log_2(1{,}000{,}000) \approx 20 \text{ comparisons}$$

From 1,000,000 steps to 20. That is the power of sorted order.

Array fundamentals — all follow from the fact that address $=$ base $+$ (index $\times$ element size):
- **Access by index**: $O(1)$ — instant
- **Search (unsorted)**: $O(n)$; **sorted**: $O(\log n)$
- **Append to end**: $O(1)$ amortized
- **Insert at position $i$**: $O(n)$ — must shift every subsequent element

Arrays are fast for reading by position, slow for inserting in the middle. Linked lists invert this — cheap insertion anywhere, but $O(n)$ to find an element by position. Every more complex data structure is built by choosing which of these trade-offs to accept.

**Going Deeper:** Binary search requires a sorted array. Sorting costs $O(n \log n)$. So if you need to search only once, is it worth sorting first? At what point does the extra cost of sorting pay off?

---

### 16. Recursion

**Hook:** A function that calls itself sounds like a recipe for disaster — infinite loops, crashes, chaos. And it will be, if you write it carelessly. But with one crucial safeguard — a base case — recursion becomes the most natural language for problems that have self-similar structure. Trees, file systems, parsers, divide-and-conquer algorithms: all of them are recursion hiding in plain sight. The key mental shift is learning to trust the recursion: do not trace every call, just define what it should do and let it do it.

**Problem:** Compute $5! = 5 \times 4 \times 3 \times 2 \times 1 = 120$. Easy with a loop. Now write a function that computes $n!$ for any $n$, but using only this one observation: "the factorial of $n$ is $n$ times the factorial of something smaller than $n$." What is that something smaller, and when do you stop?

**Hint 1:** $5! = 5 \times 4!$. And $4! = 4 \times 3!$. In general, what is $n!$ in terms of $(n-1)!$?

**Hint 2:** The recursive rule is $n! = n \times (n-1)!$. But this keeps going forever unless you define a stopping point. What is $0!$ by definition — and why is that your base case?

**Hint 3:** Write it out: `factorial(0) = 1` (base case) and `factorial(n) = n × factorial(n-1)` (recursive case). Trace `factorial(3)` step by step, drawing each function call as a box waiting for the one below it to return a value.

**Explanation:** The call stack for `factorial(3)`:

```
factorial(3) waits for factorial(2)
  factorial(2) waits for factorial(1)
    factorial(1) waits for factorial(0)
      factorial(0) returns 1   ← base case, no more waiting
    factorial(1) gets 1, returns 1 × 1 = 1
  factorial(2) gets 1, returns 2 × 1 = 2
factorial(3) gets 2, returns 3 × 2 = 6
```

Two requirements for correct recursion:
1. **Base case**: a version so small you know the answer directly (here: $0! = 1$)
2. **Progress**: every recursive call moves *toward* the base case

Recursion is the natural language for self-similar structures. A directory's subdirectories are smaller directories. A binary tree's subtrees are smaller binary trees. A sentence's sub-clauses are smaller sentences. Whenever a problem has this shape, recursion expresses it directly.

**Going Deeper:** Naive recursive Fibonacci — $F(n) = F(n-1) + F(n-2)$ — is catastrophically slow. Computing $F(50)$ takes longer than the age of the universe on a modern computer. Why? Draw the call tree for $F(5)$ and count how many times $F(2)$ gets recomputed. What simple technique eliminates this redundancy?

---

### 17. Sorting Algorithms

**Hook:** Sorting is one of the most studied problems in computer science — not because programmers love tidiness, but because sorting is a perfect microcosm of algorithmic thinking. Small changes in strategy produce enormous differences in performance. Proving an algorithm correct is as important as making it fast. And sorting reveals a beautiful result: there is a theoretical minimum number of comparisons any sorting algorithm must make, and the best algorithms achieve it exactly.

**Problem:** You have 8 cards face-down, each with a different number, and you can only compare two at a time. What is the minimum number of comparisons you need, in the worst case, to guarantee the cards are in order? Try to reason from first principles about how much *information* each comparison gives you.

**Hint 1:** How many possible orderings exist for 8 cards? (8 choices for first, 7 for second...) Each comparison gives you one bit of information: which card is larger. How many bits do you need to distinguish all orderings?

**Hint 2:** To distinguish $N$ possibilities, you need at least $\log_2 N$ yes/no questions. With $8! = 40{,}320$ possible orderings, the theoretical minimum is $\lceil \log_2(40{,}320) \rceil$. Calculate this.

**Hint 3:** $\log_2(40{,}320) \approx 15.3$, so at minimum 16 comparisons. This is a theoretical floor — no comparison-based sorting algorithm can do better. How close do good algorithms get?

**Explanation:** **Bubble sort**: compare adjacent pairs, swap if needed, repeat passes. Worst case $O(n^2)$ comparisons — slow.

**Merge sort** (divide and conquer):
1. Split the array in half
2. Sort each half recursively
3. Merge the two sorted halves

Merging two sorted halves of total size $n$ takes at most $n-1$ comparisons. There are $\log_2 n$ levels of splitting. Total:

$$O(n \log n)$$

**Quicksort**: pick a pivot element, partition (all smaller left, all larger right), recurse on each partition. Average $O(n \log n)$, but worst case $O(n^2)$ with a bad pivot. Typically fastest in practice because of memory access patterns.

**The lower bound**: any comparison-based sort needs $\Omega(n \log n)$ comparisons in the worst case — this follows from the information-theoretic argument above. Merge sort and heapsort achieve this exactly; they are *optimal*.

**Going Deeper:** Radix sort and counting sort break the $O(n \log n)$ barrier by not using comparisons at all — they exploit the structure of the keys. What assumption do they make about the data, and why does that assumption let them beat the theoretical minimum for comparison-based sorting?

---

### 18. Big-O Notation

**Hook:** How do you compare two algorithms when you do not know what computer they will run on, what language they are written in, or how large the input will be? You need a way to capture the essential growth behaviour and ignore everything else. Big-O notation is that language. It is not about exact speed — it is about how speed *scales*. The difference between $O(n)$ and $O(n^2)$ is the difference between a program that takes 1 second on 1 million items and one that takes 11 days.

**Problem:** Function A does 1,000 operations for 10 inputs and 2,000 for 20 inputs. Function B does 100 operations for 10 inputs and 400 for 20 inputs. Function B is currently faster. Will it always be faster for large inputs? Think about *how* each function grows as the input size doubles.

**Hint 1:** When the input doubled (10 → 20), how did each function's operation count change? What does "doubling the input doubles the operations" imply about growth rate — and what does "doubling the input quadruples the operations" imply?

**Hint 2:** A doubling means $O(n)$ (linear). A quadrupling means $O(n^2)$ (quadratic). Even if $B$ is faster *now*, what happens when $n$ is very large?

**Hint 3:** Find the crossover. If $A$ does roughly $100n$ operations and $B$ does $n^2$, when does $n^2 > 100n$? Solve: $n > 100$. What does this tell you about which function to choose?

**Explanation:** Big-O describes growth rate, ignoring constants and lower-order terms:

| Class | Name | Example |
|-------|------|---------|
| $O(1)$ | Constant | Hash table lookup |
| $O(\log n)$ | Logarithmic | Binary search |
| $O(n)$ | Linear | Linear search |
| $O(n \log n)$ | Linearithmic | Merge sort |
| $O(n^2)$ | Quadratic | Bubble sort |
| $O(2^n)$ | Exponential | Naive Fibonacci |

Function A is $O(n)$, Function B is $O(n^2)$. They cross at $n = 100$. For all $n > 100$, A wins — and as $n$ grows, A becomes increasingly dominant. At $n = 1{,}000$: A does $100{,}000$ operations, B does $1{,}000{,}000$.

Formal definition: $f(n) = O(g(n))$ means there exist constants $c$ and $n_0$ such that $f(n) \leq c \cdot g(n)$ for all $n > n_0$. Big-O is an upper bound on growth rate.

The crossover insight is critical: a constant factor never matters asymptotically. $O(n)$ beats $O(n^2)$ for large enough $n$, regardless of the constants.

**Going Deeper:** Space complexity uses the same Big-O framework. Merge sort is $O(n \log n)$ time but requires $O(n)$ extra space. Quicksort uses $O(\log n)$ space. Can you think of a data structure or algorithm where you deliberately use *more* space to gain speed — trading one resource for another?

---

### 19. Trees & Graphs

**Hook:** Hierarchies are everywhere: your family tree, the file system on your computer, the structure of a web page, the classification of species. Networks are everywhere: road maps, social connections, the internet, power grids. Trees and graphs are the mathematical structures that capture these two shapes. Traversing them efficiently is one of the most practically important skills in all of computer science — underlying GPS navigation, web crawling, social network analysis, and compiler design.

**Problem:** You have a maze represented as a grid. Each cell is either a wall or open space. You start at the top-left and want to reach the bottom-right. Model this as a graph and design an algorithm to find a path — making sure you never visit the same cell twice.

**Hint 1:** Each open cell is a node. Two adjacent open cells are connected by an edge. The problem is now: find a path from start to end in this graph. What graph traversal strategies do you know of?

**Hint 2:** Depth-First Search (DFS) dives as deep as possible before backtracking. Breadth-First Search (BFS) explores all cells at distance 1, then distance 2, and so on. Which one is guaranteed to find the *shortest* path?

**Hint 3:** BFS guarantees the shortest path. Use a queue and a visited set. As you process each cell, add its unvisited neighbours to the queue. When you reach the end, how do you reconstruct the path you took?

**Explanation:** **Graph terms**: nodes (vertices) connected by edges. Directed vs. undirected. Weighted vs. unweighted.

**Tree**: a connected graph with no cycles. $n$ nodes, exactly $n-1$ edges.

**BFS** (queue-based):
1. Enqueue start node, mark visited
2. Dequeue a node, add its unvisited neighbours to the queue, mark them visited
3. Record the parent of each node when first discovered
4. Repeat until the goal is dequeued
5. Reconstruct path by following parent pointers backward from goal to start

BFS explores in rings radiating from the start — like ripples on water. The first time it reaches the goal, it has found the shortest path.

**DFS** (stack or recursion): explores as far as possible in one direction before backtracking. Good for cycle detection, topological ordering, and finding connected components — but does not guarantee shortest paths.

Dijkstra's algorithm: BFS generalised to weighted graphs (edges have different costs). Used in GPS navigation. A* adds a heuristic estimate of remaining distance, finding the shortest path faster when you have that estimate.

**Going Deeper:** What is a topological sort, and what kind of graph does it apply to? Describe one real-world situation where topological ordering is the natural solution to a problem.

---

### 20. Hash Tables

**Hook:** Arrays give you instant access by position — $O(1)$. But what if you want instant access by an arbitrary key, like a username or a word? Sorted arrays with binary search give $O(\log n)$ — good, but not instant. Hash tables achieve amortised $O(1)$ lookup, insertion, and deletion for any key, by converting keys into array indices using a hash function. This single trick underlies Python dictionaries, JavaScript objects, database indexes, and most caches in existence.

**Problem:** You need to check whether a username exists in a database of 1 million users, thousands of times per second. Binary search gives about 20 comparisons per lookup. Can you design a structure that reduces this to roughly 1 or 2 operations? What would you need to do to a username string to turn it into an array index?

**Hint 1:** What if you had a function that converted any string to an integer? If "alice" always mapped to 42 and "bob" always mapped to 107, you could store users at those positions and look them up instantly. What property must this function have to be useful?

**Hint 2:** A simple hash: sum the ASCII values of the characters. "alice" $= 97+108+105+99+101 = 510$. Your array has a fixed size — how do you turn 510 into a valid index? (Hint: modulo.)

**Hint 3:** $510 \bmod \text{array\_size}$ gives a slot. But "alice" and "ecila" have the same character sum and map to the same slot — a collision. How do you handle two keys mapping to the same slot?

**Explanation:** A hash table = array + hash function + collision strategy.

**Hash function**: maps keys to integers to array indices. A good hash distributes keys uniformly — no clumping in certain buckets.

**Collision handling**:
- **Chaining**: each bucket holds a linked list. Colliding keys join the same list. $O(1)$ average, $O(n)$ worst case if everything hashes to one bucket.
- **Open addressing**: if a slot is taken, try the next one (linear probing) or jump by a computed offset (quadratic probing). Better cache behaviour than chaining.

**Load factor** $\alpha = n/k$ (items stored / total buckets). As $\alpha$ increases, collisions become more likely. Hash tables resize (rehash into a larger array) when $\alpha$ exceeds a threshold — typically 0.75. Resizing is $O(n)$ but happens infrequently enough that average insertion is still $O(1)$.

**Performance**: $O(1)$ average for get, set, delete. $O(n)$ worst case (pathological input or terrible hash function). With a good hash and reasonable load factor, collisions are rare and the constant is tiny.

Python `dict`, JavaScript `{}`, Java `HashMap` — all hash tables. The most-used complex data structure in everyday programming.

**Going Deeper:** Hash tables give $O(1)$ average but $O(n)$ worst case. Balanced binary search trees give $O(\log n)$ guaranteed for all operations. Yet hash tables dominate in practice. In what specific situations would you prefer a BST — and what can a BST do that a hash table cannot?

---

## Files to Create / Modify

| File | Change |
|------|--------|
| `src/lib/db/schema.ts` | Add `lessons` table |
| `src/lib/renderMath.ts` | Extract KaTeX rendering from Scratchpad into shared util |
| `src/components/MathText.tsx` | New component — renders a string with KaTeX |
| `src/data/seed-lessons.json` | 20 lesson objects |
| `src/lib/db/seed.ts` | Add `seedLessons()` function |
| `src/app/api/challenge/generate/route.ts` | Check lessons table first, fall back to AI |
| `src/app/api/challenge/hint/route.ts` | Return pre-written hints by level |
| `src/app/api/challenge/explain/route.ts` | Return pre-written explanation |
| `src/components/session/ChallengeMode.tsx` | Display hook callout; use MathText for all lesson fields |
| `src/components/session/Scratchpad.tsx` | Use shared `renderMath` from new util (dedup) |

---

## Migration

```bash
npx drizzle-kit generate && npx drizzle-kit push
npm run db:seed
```

No routing changes. No new pages. Session flow is identical.

---

## Out of Scope

- Lessons for the 5 skipped topics (Arithmetic, Fractions, Linear Equations, Variables & Types, Control Flow)
- Multiple lessons per topic
- Per-lesson analytics or progress tracking
- Dark mode for lesson content
- Audio or interactive visualisations
