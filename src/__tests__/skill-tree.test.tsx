// src/__tests__/skill-tree.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillTree from "@/components/skill-tree/SkillTree";
import type { SkillNode, SkillEdge } from "@/components/skill-tree/SkillTree";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
const mockNodes: SkillNode[] = [
  { id: "t1", title: "Algebra", subject: "math", status: "available", masteryLevel: 0, description: "Variables" },
  { id: "t2", title: "Calculus", subject: "math", status: "locked", masteryLevel: 0, description: "Limits" },
  { id: "t3", title: "Kinematics", subject: "physics", status: "mastered", masteryLevel: 5, description: "Motion" },
];
const mockEdges: SkillEdge[] = [
  { id: "e1", sourceId: "t1", targetId: "t2", type: "prerequisite", weight: 1.0 },
  { id: "e2", sourceId: "t3", targetId: "t1", type: "related", weight: 0.5 },
];

describe("SkillTree", () => {
  it("renders the SVG container", () => {
    render(<SkillTree nodes={mockNodes} edges={mockEdges} />);
    expect(screen.getByTestId("skill-tree-svg").tagName).toBe("svg");
  });
  it("renders without crashing with empty data", () => {
    render(<SkillTree nodes={[]} edges={[]} />);
    expect(screen.getByTestId("skill-tree-svg")).toBeTruthy();
  });
  it("accepts onNodeClick and connectedMasteredIds props", () => {
    render(<SkillTree nodes={mockNodes} edges={mockEdges} onNodeClick={vi.fn()} connectedMasteredIds={["t3"]} />);
    expect(screen.getByTestId("skill-tree-svg")).toBeTruthy();
  });
});
