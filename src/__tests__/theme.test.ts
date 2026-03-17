// src/__tests__/theme.test.ts
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Theme", () => {
  it("globals.css contains all required CSS variables", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf-8");
    const vars = ["--color-bg", "--color-surface", "--color-surface-alt", "--color-border", "--color-border-strong",
      "--color-text", "--color-text-2", "--color-text-3", "--color-accent", "--color-accent-hover",
      "--color-accent-surface", "--color-accent-border", "--color-success", "--color-success-surface",
      "--color-gold", "--color-gold-surface", "--color-danger"];
    for (const v of vars) { expect(css).toContain(v); }
  });

  it("globals.css contains lined-paper class", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf-8");
    expect(css).toContain(".lined-paper");
  });

  it("tailwind.config.ts defines custom font families", () => {
    const config = fs.readFileSync(path.resolve(__dirname, "../../tailwind.config.ts"), "utf-8");
    for (const f of ["font-instrument-serif", "font-nunito", "font-inter", "font-jetbrains-mono"]) {
      expect(config).toContain(f);
    }
  });
});
