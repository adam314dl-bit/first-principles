"use client";
import type { CosmosNode } from "./cosmos-types";

interface StatsPanelProps {
  nodes: CosmosNode[];
}

export default function StatsPanel({ nodes }: StatsPanelProps) {
  const mastered = nodes.filter((n) => n.status === "mastered").length;
  const total = nodes.length;
  const available = nodes.filter((n) => n.status === "available").length;
  const nextBoss = nodes.find((n) => n.nodeType === "boss" && n.status !== "mastered");

  return (
    <div
      className="fixed bottom-3.5 left-3.5 z-20 rounded-lg px-3.5 py-2.5 min-w-[155px] backdrop-blur-sm"
      style={{ background: "rgba(255,255,255,0.95)", border: "1px solid var(--color-border)", boxShadow: "0 4px 16px rgba(15,23,42,0.1)" }}
    >
      <h3 className="text-[9px] font-semibold text-text-3 tracking-[3px] uppercase mb-1.5 border-b border-border pb-1">
        Navigation
      </h3>
      <div className="flex justify-between text-[11px] text-text-3 mb-0.5">
        <span>Stars charted</span>
        <span className="font-medium text-success">{mastered} / {total}</span>
      </div>
      <div className="flex justify-between text-[11px] text-text-3 mb-0.5">
        <span>Reachable</span>
        <span className="font-medium text-accent">{available}</span>
      </div>
      {nextBoss && (
        <div className="flex justify-between text-[11px] text-text-3">
          <span>Next challenge</span>
          <span className="font-medium text-gold">{nextBoss.title}</span>
        </div>
      )}
    </div>
  );
}
