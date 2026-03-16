// src/__tests__/review-card.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewCard from "@/components/review/ReviewCard";

describe("ReviewCard", () => {
  const props = { challenge: "Explain derivatives to a curious 12-year-old", reviewType: "teach-it" as const, topicId: "derivatives", topicTitle: "Derivatives", sessionId: "s1", onComplete: vi.fn() };

  it("renders the challenge text", () => { render(<ReviewCard {...props} />); expect(screen.getByText(props.challenge)).toBeTruthy(); });
  it("renders the review type label", () => { render(<ReviewCard {...props} />); expect(screen.getByText("Teach It")).toBeTruthy(); });
  it("renders the topic title", () => { render(<ReviewCard {...props} />); expect(screen.getByText("Derivatives")).toBeTruthy(); });
  it("disables submit when response is too short", () => { render(<ReviewCard {...props} />); expect(screen.getByText("Submit Response")).toHaveAttribute("disabled"); });
  it("enables submit when response is 20+ characters", async () => {
    const user = userEvent.setup();
    render(<ReviewCard {...props} />);
    await user.type(screen.getByPlaceholderText(/Write your response/), "This is a sufficiently long response to enable");
    expect(screen.getByText("Submit Response")).not.toHaveAttribute("disabled");
  });
  it("shows character count hint", () => { render(<ReviewCard {...props} />); expect(screen.getByText("20 more characters needed")).toBeTruthy(); });
  it("renders what-if type", () => { render(<ReviewCard {...props} reviewType="what-if" />); expect(screen.getByText("What If?")).toBeTruthy(); });
  it("renders connect type", () => { render(<ReviewCard {...props} reviewType="connect" />); expect(screen.getByText("Connect")).toBeTruthy(); });
});
