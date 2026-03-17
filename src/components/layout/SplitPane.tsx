// src/components/layout/SplitPane.tsx
"use client";
import { useState } from "react";

interface SplitPaneProps { left: React.ReactNode; right: React.ReactNode; leftLabel?: string; rightLabel?: string; }

export default function SplitPane({ left, right, leftLabel = "Session", rightLabel = "Scratchpad" }: SplitPaneProps) {
  const [activeTab, setActiveTab] = useState<"left" | "right">("left");
  return (
    <>
      <div className="hidden h-full md:flex">
        <div className="flex-1 overflow-hidden border-r border-border">{left}</div>
        <div className="flex-1 overflow-hidden">{right}</div>
      </div>
      <div className="flex h-full flex-col md:hidden">
        <div className="flex border-b border-border bg-bg">
          <button onClick={() => setActiveTab("left")} className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === "left" ? "border-b-2 border-accent text-accent" : "text-text-3"}`}>{leftLabel}</button>
          <button onClick={() => setActiveTab("right")} className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${activeTab === "right" ? "border-b-2 border-accent text-accent" : "text-text-3"}`}>{rightLabel}</button>
        </div>
        <div className="flex-1 overflow-hidden">{activeTab === "left" ? left : right}</div>
      </div>
    </>
  );
}
