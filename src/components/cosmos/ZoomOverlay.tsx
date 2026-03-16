"use client";
import type { CosmosNode } from "./cosmos-types";

interface ZoomOverlayProps {
  node: CosmosNode | null;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; border: string; label: string; btnClass: string }> = {
  mastered: { bg: "rgba(20,22,40,.9)", border: "rgba(160,170,210,.25)", label: "Mastered", btnClass: "border-blue-400/20 text-blue-300/50 hover:bg-blue-400/10" },
  available: { bg: "rgba(12,20,14,.9)", border: "rgba(90,180,120,.25)", label: "Available — Ready to learn", btnClass: "border-green-400/20 text-green-300/50 hover:bg-green-400/10" },
  "in-progress": { bg: "rgba(20,16,10,.9)", border: "rgba(200,160,80,.25)", label: "In Progress", btnClass: "border-amber-400/20 text-amber-300/50 hover:bg-amber-400/10" },
  locked: { bg: "rgba(10,10,18,.9)", border: "rgba(80,85,120,.15)", label: "Locked", btnClass: "" },
};

const BOSS_STYLE = { bg: "rgba(25,10,8,.9)", border: "rgba(180,60,40,.25)", label: "★ Boss Challenge", btnClass: "border-red-400/20 text-red-300/50 hover:bg-red-400/10" };

export default function ZoomOverlay({ node, onClose }: ZoomOverlayProps) {
  if (!node) return null;

  const style = node.nodeType === "boss" ? BOSS_STYLE : (TYPE_STYLES[node.status] ?? TYPE_STYLES.locked);
  const mastery = node.masteryLevel * 20; // 0-5 → 0-100%

  const actionLabel = node.nodeType === "boss" ? "⚔  ACCEPT CHALLENGE" : node.status === "mastered" ? "REVIEW →" : "BEGIN SESSION →";

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center transition-all duration-500 ${node ? "bg-[rgba(2,1,8,.88)]" : "bg-transparent pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className="text-center p-10 max-w-[500px] animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Star orb */}
        <div
          className="w-[90px] h-[90px] rounded-full mx-auto mb-5 relative"
          style={{ background: style.bg, border: `2px solid ${style.border}`, boxShadow: `0 0 50px ${style.border}` }}
        >
          <div className="absolute -inset-2 rounded-full border animate-pulse" style={{ borderColor: "rgba(80,90,140,.1)" }} />
          <div className="absolute -inset-[18px] rounded-full border animate-pulse" style={{ borderColor: "rgba(80,90,140,.06)", animationDelay: "0.4s" }} />
          <div className="absolute -inset-[30px] rounded-full border animate-pulse" style={{ borderColor: "rgba(80,90,140,.03)", animationDelay: "0.8s" }} />
        </div>

        <h2 className="font-[family-name:var(--font-cinzel)] text-[22px] text-[rgba(200,210,240,.55)] tracking-[3px] mb-1.5">{node.title}</h2>
        <p className="font-[family-name:var(--font-cormorant)] italic text-[13px] text-[rgba(140,150,180,.3)] tracking-wide mb-4">{style.label}</p>
        <p className="font-[family-name:var(--font-cormorant)] text-sm text-[rgba(160,170,200,.3)] leading-relaxed mb-6">{node.description}</p>

        {/* Mastery bar */}
        <div className="mb-5">
          <div className="font-[family-name:var(--font-cinzel)] text-[9px] text-[rgba(120,130,160,.2)] tracking-[2px] mb-1.5">MASTERY</div>
          <div className="h-[3px] bg-[rgba(80,90,140,.06)] rounded max-w-[300px] mx-auto overflow-hidden">
            <div className="h-full rounded transition-all duration-600" style={{ width: `${mastery}%`, background: style.border }} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 border border-[rgba(80,90,140,.12)] rounded bg-[rgba(80,90,140,.04)] text-[rgba(180,190,220,.4)] font-[family-name:var(--font-cinzel)] text-[11px] tracking-[2px] cursor-pointer hover:bg-[rgba(80,90,140,.1)] transition-all">
            BACK TO COSMOS
          </button>
          {node.status !== "locked" && (
            <a href={`/session/${node.id}`} className={`px-5 py-2.5 border rounded bg-transparent font-[family-name:var(--font-cinzel)] text-[11px] tracking-[2px] cursor-pointer transition-all no-underline ${style.btnClass}`}>
              {actionLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
