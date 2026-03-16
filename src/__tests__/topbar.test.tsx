// src/__tests__/topbar.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TopBar from "@/components/TopBar";

vi.mock("next/navigation", () => ({ usePathname: () => "/tree" }));
vi.mock("next/link", () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

describe("TopBar", () => {
  it("renders the logo text", () => {
    render(<TopBar />);
    expect(screen.getByText("First Principles")).toBeTruthy();
  });

  it("renders all three navigation tabs", () => {
    render(<TopBar />);
    expect(screen.getByText("Skill Tree")).toBeTruthy();
    expect(screen.getByText("Playground")).toBeTruthy();
    expect(screen.getByText("Journal")).toBeTruthy();
  });

  it("renders the model select dropdown with options", () => {
    render(<TopBar />);
    const select = screen.getByLabelText("Model:");
    expect(select).toBeTruthy();
    expect(screen.getByText("Claude Sonnet")).toBeTruthy();
    expect(screen.getByText("Claude Opus")).toBeTruthy();
    expect(screen.getByText("GPT-4o")).toBeTruthy();
  });

  it("highlights the active nav tab", () => {
    render(<TopBar />);
    const skillTreeLink = screen.getByText("Skill Tree");
    expect(skillTreeLink.className).toContain("text-amber");
  });
});
