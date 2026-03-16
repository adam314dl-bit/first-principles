// src/__tests__/scratchpad.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Scratchpad from "@/components/session/Scratchpad";

vi.mock("katex", () => ({ default: { renderToString: (tex: string, opts?: { displayMode?: boolean }) => `<span class="katex">${opts?.displayMode ? "display:" : "inline:"}${tex}</span>` } }));
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Scratchpad", () => {
  beforeEach(() => { vi.resetAllMocks(); vi.useFakeTimers({ shouldAdvanceTime: true }); mockFetch.mockResolvedValue({ ok: true }); });
  afterEach(() => { vi.useRealTimers(); });

  it("renders the scratchpad header", () => { render(<Scratchpad sessionId="s1" />); expect(screen.getByText("Scratchpad")).toBeTruthy(); });
  it("renders textarea with placeholder", () => { render(<Scratchpad sessionId="s1" />); expect(screen.getByPlaceholderText(/Write notes, work through problems/)).toBeTruthy(); });
  it("renders initial content if provided", () => { render(<Scratchpad sessionId="s1" initialContent="# My Notes" />); expect(screen.getByDisplayValue("# My Notes")).toBeTruthy(); });
  it("shows preview placeholder when empty", () => { render(<Scratchpad sessionId="s1" />); expect(screen.getByText(/Preview will appear here/)).toBeTruthy(); });

  it("auto-saves after debounce period", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Scratchpad sessionId="s1" />);
    await user.type(screen.getByPlaceholderText(/Write notes, work through problems/), "Some notes");
    vi.advanceTimersByTime(1600);
    expect(mockFetch).toHaveBeenCalledWith("/api/sessions/s1", expect.objectContaining({ method: "PUT" }));
  });
});
