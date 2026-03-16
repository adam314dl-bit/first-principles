// src/__tests__/dialogue-mode.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DialogueMode from "@/components/session/DialogueMode";

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createReadableStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(text)); controller.close(); } });
}

describe("DialogueMode", () => {
  const props = { topicId: "derivatives", topicTitle: "Derivatives", sessionId: "s1" };
  beforeEach(() => { vi.resetAllMocks(); mockFetch.mockResolvedValue({ ok: true, json: async () => ({ messages: [] }) }); });

  it("renders dialogue mode header", () => { render(<DialogueMode {...props} />); expect(screen.getByText("Dialogue Mode")).toBeTruthy(); });
  it("renders topic in subtitle", () => { render(<DialogueMode {...props} />); expect(screen.getByText(/Exploring Derivatives/)).toBeTruthy(); });
  it("renders send button (disabled when empty)", () => { render(<DialogueMode {...props} />); expect((screen.getByText("Send") as HTMLButtonElement).disabled).toBe(true); });

  it("shows user message after sending", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) })
      .mockResolvedValueOnce({ ok: true, body: createReadableStream("What do you think a derivative represents?") });
    const user = userEvent.setup();
    render(<DialogueMode {...props} />);
    await user.type(screen.getByPlaceholderText("Think aloud, ask questions, challenge the tutor..."), "What is a derivative?");
    await user.click(screen.getByText("Send"));
    await waitFor(() => { expect(screen.getByText("What is a derivative?")).toBeTruthy(); });
  });

  it("shows empty state prompt", async () => { render(<DialogueMode {...props} />); await waitFor(() => { expect(screen.getByText(/Start a conversation about Derivatives/)).toBeTruthy(); }); });
});
