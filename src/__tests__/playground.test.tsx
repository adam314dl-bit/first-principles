// src/__tests__/playground.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PlaygroundPage from "@/app/playground/page";

const mockTopics = { topics: [
  { id: "derivatives", title: "Derivatives", subject: "math", masteryLevel: 3, hasConnectionOpportunity: true },
  { id: "kinematics", title: "Kinematics", subject: "physics", masteryLevel: 2, hasConnectionOpportunity: false },
]};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn((url: string) => {
    if (url === "/api/topics?status=mastered") return Promise.resolve({ json: () => Promise.resolve(mockTopics) });
    return Promise.resolve({ json: () => Promise.resolve({ challenge: "Test challenge" }) });
  }));
});

describe("PlaygroundPage", () => {
  it("renders the page title", () => { render(<PlaygroundPage />); expect(screen.getByText("Playground")).toBeTruthy(); });
  it("renders filter buttons", () => { render(<PlaygroundPage />); expect(screen.getByText("All Challenges")).toBeTruthy(); expect(screen.getByText("Teach It")).toBeTruthy(); expect(screen.getByText("What If?")).toBeTruthy(); expect(screen.getByText("Connect")).toBeTruthy(); });
  it("renders mastered topics after loading", async () => { render(<PlaygroundPage />); await waitFor(() => { expect(screen.getByText("Derivatives")).toBeTruthy(); expect(screen.getByText("Kinematics")).toBeTruthy(); }); });
  it("sorts topics with connection opportunities first", async () => { render(<PlaygroundPage />); await waitFor(() => { const cards = screen.getAllByRole("heading", { level: 3 }); expect(cards[0].textContent).toBe("Derivatives"); }); });
  it("shows mastery level", async () => { render(<PlaygroundPage />); await waitFor(() => { expect(screen.getByText("Mastery 3/5")).toBeTruthy(); expect(screen.getByText("Mastery 2/5")).toBeTruthy(); }); });
  it("shows empty state when no mastered topics", async () => { vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ topics: [] }) }))); render(<PlaygroundPage />); await waitFor(() => { expect(screen.getByText("No mastered topics yet")).toBeTruthy(); }); });
});
