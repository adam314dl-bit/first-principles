// src/__tests__/visualization.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Visualization from "@/components/session/Visualization";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ id: "viz-1", topic_id: "derivatives", visualization_code: "<!DOCTYPE html><html><body><h1>Test</h1></body></html>", source: "ai-generated", cached: false }) })));
  vi.stubGlobal("URL", { ...globalThis.URL, createObjectURL: vi.fn(() => "blob:mock-url"), revokeObjectURL: vi.fn() });
});

describe("Visualization", () => {
  it("renders the generate button initially", () => { render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); expect(screen.getByText("Generate")).toBeTruthy(); });
  it("renders the topic title in description", () => { render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); expect(screen.getByText(/Explore Derivatives visually/)).toBeTruthy(); });
  it("shows sandboxed iframe after generating", async () => { const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { const iframe = screen.getByTitle("Visualization for Derivatives"); expect(iframe).toBeTruthy(); expect(iframe.getAttribute("sandbox")).toBe("allow-scripts"); }); });
  it("shows expand/collapse and regenerate buttons", async () => { const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { expect(screen.getByText("Expand")).toBeTruthy(); expect(screen.getByText("Regenerate")).toBeTruthy(); }); });
  it("shows error message on failure", async () => { vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ error: "AI unavailable" }) }))); const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { expect(screen.getByText("AI unavailable")).toBeTruthy(); }); });
  it("toggles expanded state", async () => { const user = userEvent.setup(); render(<Visualization topicId="derivatives" topicTitle="Derivatives" />); await user.click(screen.getByText("Generate")); await waitFor(() => { expect(screen.getByText("Expand")).toBeTruthy(); }); await user.click(screen.getByText("Expand")); expect(screen.getByText("Collapse")).toBeTruthy(); });
});
