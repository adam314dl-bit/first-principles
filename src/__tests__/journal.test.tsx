// src/__tests__/journal.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import JournalPage from "@/app/journal/page";

const mockSessions = { sessions: [
  { id: "s1", topicId: "derivatives", topicTitle: "Derivatives", subject: "math", mode: "challenge", startedAt: "2026-03-14T10:00:00Z", endedAt: "2026-03-14T10:45:00Z", journalSummary: "You explored derivatives and understood the power rule.", masteryChange: { from: 1, to: 2 } },
  { id: "s2", topicId: "kinematics", topicTitle: "Kinematics", subject: "physics", mode: "dialogue", startedAt: "2026-03-14T14:00:00Z", endedAt: null, journalSummary: null, masteryChange: null },
]};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn((url: string) => {
    if (typeof url === "string" && url.startsWith("/api/sessions")) return Promise.resolve({ json: () => Promise.resolve(mockSessions) });
    return Promise.resolve({ json: () => Promise.resolve({ summary: "A generated summary." }) });
  }));
});

describe("JournalPage", () => {
  it("renders the page title", () => { render(<JournalPage />); expect(screen.getByText("Learning Journal")).toBeTruthy(); });
  it("renders session entries after loading", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText("Derivatives")).toBeTruthy(); expect(screen.getByText("Kinematics")).toBeTruthy(); }); });
  it("displays existing journal summary", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText("You explored derivatives and understood the power rule.")).toBeTruthy(); }); });
  it("shows generate button for sessions without summary", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText("Generate journal entry")).toBeTruthy(); }); });
  it("shows mastery change when available", async () => { render(<JournalPage />); await waitFor(() => { expect(screen.getByText(/Mastery: 1/)).toBeTruthy(); }); });
  it("shows empty state when no sessions exist", async () => { vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ sessions: [] }) }))); render(<JournalPage />); await waitFor(() => { expect(screen.getByText("No sessions yet")).toBeTruthy(); }); });
});
