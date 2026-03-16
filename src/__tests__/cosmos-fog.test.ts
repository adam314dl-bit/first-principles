import { describe, it, expect } from "vitest";
import { computeVisibleSet } from "@/components/cosmos/cosmos-fog";
import type { CosmosNode, CosmosEdge } from "@/components/cosmos/cosmos-types";

const makeNode = (id: string, status: CosmosNode["status"] = "locked"): CosmosNode => ({
  id, title: id, subject: "physics", difficulty: 1, status,
  masteryLevel: status === "mastered" ? 5 : 0,
  description: "", cosmosX: 0, cosmosY: 0, cosmosRadius: 10,
  domain: "core", nodeType: "star",
});

const makeEdge = (sourceId: string, targetId: string): CosmosEdge => ({
  id: `${sourceId}-${targetId}`, sourceId, targetId, type: "prerequisite", weight: 1,
});

describe("computeVisibleSet", () => {
  it("returns mastered nodes as bright", () => {
    const nodes = [makeNode("a", "mastered"), makeNode("b", "locked")];
    const edges = [makeEdge("a", "b")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("a")).toBe("bright");
  });

  it("returns 1-hop neighbors of mastered as frontier", () => {
    const nodes = [makeNode("a", "mastered"), makeNode("b", "locked"), makeNode("c", "locked")];
    const edges = [makeEdge("a", "b"), makeEdge("b", "c")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("b")).toBe("frontier");
  });

  it("returns 2-hop neighbors as dim", () => {
    const nodes = [makeNode("a", "mastered"), makeNode("b", "locked"), makeNode("c", "locked")];
    const edges = [makeEdge("a", "b"), makeEdge("b", "c")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("c")).toBe("dim");
  });

  it("returns 3-hop nodes as fogged", () => {
    const nodes = [
      makeNode("a", "mastered"), makeNode("b", "locked"),
      makeNode("c", "locked"), makeNode("d", "locked"),
    ];
    const edges = [makeEdge("a", "b"), makeEdge("b", "c"), makeEdge("c", "d")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("d")).toBe("fogged");
  });

  it("treats in-progress as BFS origin", () => {
    const nodes = [makeNode("a", "in-progress"), makeNode("b", "locked")];
    const edges = [makeEdge("a", "b")];
    const result = computeVisibleSet(nodes, edges);
    expect(result.get("a")).toBe("bright");
    expect(result.get("b")).toBe("frontier");
  });
});
