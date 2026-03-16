// src/components/skill-tree/SkillTree.tsx
"use client";
import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";

export interface SkillNode {
  id: string; title: string; subject: string;
  status: "locked" | "available" | "in-progress" | "mastered";
  masteryLevel: number; description: string;
}
export interface SkillEdge {
  id: string; sourceId: string; targetId: string;
  type: "prerequisite" | "related" | "deepens"; weight: number;
}
interface D3Node extends d3.SimulationNodeDatum {
  id: string; title: string; subject: string; status: string;
  masteryLevel: number; description: string;
}
interface D3Link extends d3.SimulationLinkDatum<D3Node> { id: string; type: string; weight: number; }
interface SkillTreeProps {
  nodes: SkillNode[]; edges: SkillEdge[];
  connectedMasteredIds?: string[]; onNodeClick?: (nodeId: string) => void;
}

const STATUS_STYLES: Record<string, { fill: string; stroke: string; strokeWidth: number; strokeDash?: string; opacity: number }> = {
  mastered:       { fill: "#f0e9de", stroke: "#b8860b", strokeWidth: 3, opacity: 1.0 },
  "in-progress":  { fill: "#fef3e2", stroke: "#d97706", strokeWidth: 4, opacity: 1.0 },
  available:      { fill: "#faf7f2", stroke: "#ddd2c2", strokeWidth: 2, strokeDash: "6,3", opacity: 1.0 },
  locked:         { fill: "#f5f0e8", stroke: "#e8dfd3", strokeWidth: 1, opacity: 0.5 },
};
const SUBJECT_COLORS: Record<string, string> = { math: "#d97706", physics: "#2563eb", cs: "#059669" };

export default function SkillTree({ nodes, edges, connectedMasteredIds = [], onNodeClick }: SkillTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const handleNodeClick = useCallback((nodeId: string, status: string) => {
    if (status === "locked") return;
    onNodeClick ? onNodeClick(nodeId) : router.push(`/session/${nodeId}`);
  }, [onNodeClick, router]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;
    const g = svg.append("g");
    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3])
      .on("zoom", (event) => g.attr("transform", event.transform)));
    const d3Nodes: D3Node[] = nodes.map((n) => ({ ...n }));
    const nodeMap = new Map(d3Nodes.map((n) => [n.id, n]));
    const d3Links: D3Link[] = edges
      .filter((e) => nodeMap.has(e.sourceId) && nodeMap.has(e.targetId))
      .map((e) => ({ id: e.id, source: nodeMap.get(e.sourceId)!, target: nodeMap.get(e.targetId)!, type: e.type, weight: e.weight }));
    const connectedSet = new Set(connectedMasteredIds);

    const simulation = d3.forceSimulation(d3Nodes)
      .force("link", d3.forceLink(d3Links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(45));

    const link = g.append("g").selectAll("line").data(d3Links).join("line")
      .attr("stroke", (d: D3Link) => {
        const s = d.source as D3Node, t = d.target as D3Node;
        return (connectedSet.has(s.id) || connectedSet.has(t.id)) ? "#d97706" : "#ddd2c2";
      })
      .attr("stroke-width", (d: D3Link) => {
        const s = d.source as D3Node, t = d.target as D3Node;
        return (connectedSet.has(s.id) || connectedSet.has(t.id)) ? 2 + d.weight * 2 : 1;
      })
      .attr("stroke-dasharray", (d: D3Link) => d.type === "related" ? "4,4" : "none")
      .attr("stroke-opacity", 0.7);

    const node = g.append("g").selectAll("g").data(d3Nodes).join("g")
      .attr("cursor", (d: D3Node) => d.status === "locked" ? "default" : "pointer")
      .on("click", (_event: MouseEvent, d: D3Node) => handleNodeClick(d.id, d.status));
    node.append("circle").attr("r", 28)
      .attr("fill", (d: D3Node) => STATUS_STYLES[d.status]?.fill || "#f5f0e8")
      .attr("stroke", (d: D3Node) => STATUS_STYLES[d.status]?.stroke || "#e8dfd3")
      .attr("stroke-width", (d: D3Node) => STATUS_STYLES[d.status]?.strokeWidth || 1)
      .attr("stroke-dasharray", (d: D3Node) => STATUS_STYLES[d.status]?.strokeDash || "none")
      .attr("opacity", (d: D3Node) => STATUS_STYLES[d.status]?.opacity || 0.5);
    node.append("circle").attr("r", 5).attr("cy", -20)
      .attr("fill", (d: D3Node) => SUBJECT_COLORS[d.subject] || "#8a7a65")
      .attr("opacity", (d: D3Node) => d.status === "locked" ? 0.3 : 0.9);
    node.append("text").text((d: D3Node) => d.title)
      .attr("text-anchor", "middle").attr("dy", 4).attr("font-size", "10px")
      .attr("font-family", "var(--font-caveat), cursive")
      .attr("fill", (d: D3Node) => d.status === "locked" ? "#c5b9a8" : "#4a4539")
      .attr("pointer-events", "none");
    node.filter((d: D3Node) => d.status === "in-progress" || d.status === "mastered")
      .append("text").text((d: D3Node) => `${d.masteryLevel}/5`)
      .attr("text-anchor", "middle").attr("dy", 16).attr("font-size", "8px")
      .attr("font-family", "var(--font-inter), sans-serif").attr("fill", "#8a7a65")
      .attr("pointer-events", "none");
    node.append("title").text((d: D3Node) =>
      connectedSet.has(d.id) ? `This connects to ${d.title} — want to explore the link?` : `${d.title} (${d.status})`);

    simulation.on("tick", () => {
      link.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
    const drag = d3.drag<SVGGElement, D3Node>()
      .on("start", (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    node.call(drag as any);
    return () => { simulation.stop(); };
  }, [nodes, edges, connectedMasteredIds, handleNodeClick]);

  return <svg ref={svgRef} className="h-full w-full rounded-lg border border-tan-light bg-cream" data-testid="skill-tree-svg" />;
}
