// src/__tests__/review-trigger.test.ts
import { describe, it, expect } from "vitest";
import { shouldShowWarmup } from "@/lib/review/trigger";

describe("shouldShowWarmup", () => {
  it("returns a boolean", () => { expect(typeof shouldShowWarmup()).toBe("boolean"); });

  it("returns true approximately 30% of the time", () => {
    let trueCount = 0;
    for (let i = 0; i < 10000; i++) { if (shouldShowWarmup()) trueCount++; }
    const ratio = trueCount / 10000;
    expect(ratio).toBeGreaterThan(0.2);
    expect(ratio).toBeLessThan(0.4);
  });
});
