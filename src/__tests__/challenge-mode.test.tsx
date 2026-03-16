// src/__tests__/challenge-mode.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChallengeMode from "@/components/session/ChallengeMode";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("ChallengeMode", () => {
  const props = { topicId: "derivatives", topicTitle: "Derivatives", sessionId: "s1" };
  beforeEach(() => { vi.resetAllMocks(); });

  it("renders the generate challenge button", () => { render(<ChallengeMode {...props} />); expect(screen.getByText("Generate Challenge")).toBeTruthy(); });

  it("displays challenge after generation", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Why does velocity have a direction but speed does not?" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByText("Why does velocity have a direction but speed does not?")).toBeTruthy(); });
  });

  it("shows hint button after challenge is generated", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Test challenge" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByText("Need a hint?")).toBeTruthy(); });
  });

  it("submit button is disabled when attempt is too short", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Test challenge" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByLabelText("Your attempt")).toBeTruthy(); });
    await user.type(screen.getByLabelText("Your attempt"), "short");
    expect((screen.getByText("Submit Attempt") as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows unlock explanation button after successful submission", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ challenge: "Test challenge" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ genuine: true }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByLabelText("Your attempt")).toBeTruthy(); });
    await user.type(screen.getByLabelText("Your attempt"), "I think derivatives measure the instantaneous rate of change of a function");
    await user.click(screen.getByText("Submit Attempt"));
    await waitFor(() => { expect(screen.getByText("Unlock Full Explanation")).toBeTruthy(); });
  });

  it("displays error on generation failure", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "API key invalid" }) });
    const user = userEvent.setup();
    render(<ChallengeMode {...props} />);
    await user.click(screen.getByText("Generate Challenge"));
    await waitFor(() => { expect(screen.getByText("API key invalid")).toBeTruthy(); });
  });
});
