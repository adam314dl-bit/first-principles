// src/__tests__/session-page.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModeToggle from "@/components/session/ModeToggle";
import SplitPane from "@/components/layout/SplitPane";

describe("ModeToggle", () => {
  it("renders Challenge and Dialogue buttons", () => { render(<ModeToggle mode="challenge" onChange={() => {}} />); expect(screen.getByText("Challenge")).toBeTruthy(); expect(screen.getByText("Dialogue")).toBeTruthy(); });
  it("highlights the active mode", () => { render(<ModeToggle mode="challenge" onChange={() => {}} />); expect(screen.getByText("Challenge").className).toContain("bg-accent"); expect(screen.getByText("Dialogue").className).not.toContain("bg-accent"); });
  it("calls onChange when clicking the other mode", async () => { const onChange = vi.fn(); const user = userEvent.setup(); render(<ModeToggle mode="challenge" onChange={onChange} />); await user.click(screen.getByText("Dialogue")); expect(onChange).toHaveBeenCalledWith("dialogue"); });
  it("disables buttons when disabled", () => { render(<ModeToggle mode="challenge" onChange={() => {}} disabled />); expect((screen.getByText("Challenge") as HTMLButtonElement).disabled).toBe(true); expect((screen.getByText("Dialogue") as HTMLButtonElement).disabled).toBe(true); });
});

describe("SplitPane", () => {
  it("renders left and right content", () => { render(<SplitPane left={<div>Left Content</div>} right={<div>Right Content</div>} />); expect(screen.getAllByText("Left Content").length).toBeGreaterThan(0); expect(screen.getByText("Right Content")).toBeTruthy(); });
  it("renders tab labels for mobile view", () => { render(<SplitPane left={<div>Left</div>} right={<div>Right</div>} leftLabel="Challenge" rightLabel="Scratchpad" />); expect(screen.getAllByText("Challenge").length).toBeGreaterThan(0); expect(screen.getAllByText("Scratchpad").length).toBeGreaterThan(0); });
});
