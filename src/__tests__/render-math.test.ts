import { describe, it, expect } from "vitest";
import { renderMath } from "@/lib/renderMath";

describe("renderMath", () => {
  it("passes plain text through unchanged", () => {
    const result = renderMath("Hello world");
    expect(result).toBe("Hello world");
  });

  it("renders inline math with $ delimiters", () => {
    const result = renderMath("The formula $x^2$ is quadratic");
    expect(result).toContain("katex");
    expect(result).toContain("x");
  });

  it("renders display math with $$ delimiters", () => {
    const result = renderMath("$$F = ma$$");
    expect(result).toContain("katex");
    expect(result).toContain("display");
  });

  it("renders bold markdown", () => {
    const result = renderMath("**important**");
    expect(result).toContain("<strong>important</strong>");
  });

  it("renders italic markdown", () => {
    const result = renderMath("*emphasis*");
    expect(result).toContain("<em>emphasis</em>");
  });

  it("converts newlines to <br />", () => {
    const result = renderMath("line one\nline two");
    expect(result).toContain("<br />");
  });

  it("returns error span on invalid LaTeX", () => {
    const result = renderMath("$\\invalidcommand{$");
    expect(typeof result).toBe("string");
  });
});
