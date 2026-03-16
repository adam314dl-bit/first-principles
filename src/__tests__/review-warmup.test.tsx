// src/__tests__/review-warmup.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewWarmup from "@/components/review/ReviewWarmup";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ challenge: "Explain kinematics to a 12-year-old", review_type: "teach-it", topic_id: "kinematics", topic_title: "Kinematics" }) })));
});

describe("ReviewWarmup", () => {
  const props = { topicId: "kinematics", topicTitle: "Kinematics", reviewType: "teach-it" as const, sessionId: "s1", onDismiss: vi.fn() };

  it("renders the warm-up title", () => { render(<ReviewWarmup {...props} />); expect(screen.getByText("Warm-up Challenge")).toBeTruthy(); });
  it("renders skip button", () => { render(<ReviewWarmup {...props} />); expect(screen.getByText("Skip")).toBeTruthy(); });
  it("calls onDismiss when skip clicked", async () => { const user = userEvent.setup(); render(<ReviewWarmup {...props} />); await user.click(screen.getByText("Skip")); expect(props.onDismiss).toHaveBeenCalledTimes(1); });
  it("shows challenge after loading", async () => { render(<ReviewWarmup {...props} />); await waitFor(() => { expect(screen.getByText("Explain kinematics to a 12-year-old")).toBeTruthy(); }); });
  it("shows error on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ error: "Topic not found" }) })));
    render(<ReviewWarmup {...props} />);
    await waitFor(() => { expect(screen.getByText("Topic not found")).toBeTruthy(); });
  });
});
