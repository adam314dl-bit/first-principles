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
    <div className="fixed bottom-3.5 left-3.5 z-20 bg-[rgba(4,3,12,.88)] border border-[rgba(80,90,140,.08)] rounded px-3.5 py-2.5 min-w-[155px] backdrop-blur-sm">
      <h3 className="font-[family-name:var(--font-cinzel)] text-[9px] text-[rgba(140,150,180,.22)] tracking-[3px] mb-1.5 border-b border-[rgba(80,90,140,.06)] pb-1">
        NAVIGATION
      </h3>
      <div className="flex justify-between text-[11px] text-[rgba(120,130,160,.3)] mb-0.5">
        <span>Stars charted</span>
        <span className="font-[family-name:var(--font-cinzel)] text-[rgba(100,180,140,.35)]">{mastered} / {total}</span>
      </div>
      <div className="flex justify-between text-[11px] text-[rgba(120,130,160,.3)] mb-0.5">
        <span>Reachable</span>
        <span className="font-[family-name:var(--font-cinzel)] text-[rgba(160,170,200,.3)]">{available}</span>
      </div>
      {nextBoss && (
        <div className="flex justify-between text-[11px] text-[rgba(120,130,160,.3)]">
          <span>Next challenge</span>
          <span className="font-[family-name:var(--font-cinzel)] text-[rgba(180,100,90,.3)]">{nextBoss.title}</span>
        </div>
      )}
    </div>
  );
}
