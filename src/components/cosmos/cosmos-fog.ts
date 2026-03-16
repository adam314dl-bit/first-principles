import type { CosmosNode, CosmosEdge, VisibilityState } from "./cosmos-types";

export function computeVisibleSet(
  nodes: CosmosNode[],
  edges: CosmosEdge[],
): Map<string, VisibilityState> {
  const result = new Map<string, VisibilityState>();
  const adjacency = new Map<string, string[]>();

  for (const e of edges) {
    if (!adjacency.has(e.sourceId)) adjacency.set(e.sourceId, []);
    if (!adjacency.has(e.targetId)) adjacency.set(e.targetId, []);
    adjacency.get(e.sourceId)!.push(e.targetId);
    adjacency.get(e.targetId)!.push(e.sourceId);
  }

  const origins = nodes.filter(
    (n) => n.status === "mastered" || n.status === "in-progress"
  );

  for (const n of nodes) result.set(n.id, "fogged");

  const queue: Array<{ id: string; depth: number }> = [];
  for (const o of origins) {
    result.set(o.id, "bright");
    queue.push({ id: o.id, depth: 0 });
  }

  const visited = new Set(origins.map((o) => o.id));
  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depth >= 2) continue;

    for (const neighborId of adjacency.get(id) ?? []) {
      if (visited.has(neighborId)) continue;
      visited.add(neighborId);

      const nextDepth = depth + 1;
      if (nextDepth === 1 && result.get(neighborId) === "fogged") {
        result.set(neighborId, "frontier");
      } else if (nextDepth === 2 && result.get(neighborId) === "fogged") {
        result.set(neighborId, "dim");
      }

      queue.push({ id: neighborId, depth: nextDepth });
    }
  }

  return result;
}
