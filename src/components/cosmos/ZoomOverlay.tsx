"use client";
import type { CosmosNode } from "./cosmos-types";

interface ZoomOverlayProps {
  node: CosmosNode | null;
  onClose: () => void;
}

interface StatusConfig {
  label: string;
  pillBg: string;
  pillText: string;
  circleBg: string;
  circleBorder: string;
  actionLabel: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  mastered: {
    label: "Mastered",
    pillBg: "bg-success-surface", pillText: "text-success",
    circleBg: "rgba(22,163,74,0.12)", circleBorder: "rgba(22,163,74,0.3)",
    actionLabel: "Review →",
  },
  available: {
    label: "Available — Ready to learn",
    pillBg: "bg-accent-surface", pillText: "text-accent",
    circleBg: "rgba(99,102,241,0.12)", circleBorder: "rgba(99,102,241,0.3)",
    actionLabel: "Begin Session →",
  },
  "in-progress": {
    label: "In Progress",
    pillBg: "bg-accent-surface", pillText: "text-accent",
    circleBg: "rgba(99,102,241,0.12)", circleBorder: "rgba(99,102,241,0.3)",
    actionLabel: "Continue →",
  },
  locked: {
    label: "Locked",
    pillBg: "bg-surface-alt", pillText: "text-text-3",
    circleBg: "rgba(148,163,184,0.12)", circleBorder: "rgba(148,163,184,0.3)",
    actionLabel: "",
  },
};

const BOSS_CONFIG: StatusConfig = {
  label: "★ Boss Challenge",
  pillBg: "bg-gold-surface", pillText: "text-gold",
  circleBg: "rgba(217,119,6,0.12)", circleBorder: "rgba(217,119,6,0.3)",
  actionLabel: "Accept Challenge →",
};

export default function ZoomOverlay({ node, onClose }: ZoomOverlayProps) {
  if (!node) return null;

  const cfg = node.nodeType === "boss" ? BOSS_CONFIG : (STATUS_CONFIG[node.status] ?? STATUS_CONFIG.locked);
  const mastery = node.masteryLevel * 20; // 0–5 → 0–100%
  const showAction = node.status !== "locked";

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full mx-4 bg-white rounded-2xl p-8"
        style={{ maxWidth: 440, border: "1px solid var(--color-border)", boxShadow: "0 20px 60px rgba(15,23,42,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* × close button — top right */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-text-3 text-xl leading-none hover:text-text-2 cursor-pointer border-none bg-transparent"
          aria-label="Close"
        >
          ×
        </button>

        {/* Status icon — replaces the 90px animated orb */}
        <div className="flex justify-center mb-6">
          <div
            className="w-10 h-10 rounded-full"
            style={{ background: cfg.circleBg, border: `1.5px solid ${cfg.circleBorder}` }}
          />
        </div>

        {/* Status pill */}
        <div className="flex justify-center mb-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest ${cfg.pillBg} ${cfg.pillText}`}>
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif text-[20px] font-bold text-text leading-tight text-center mb-1">{node.title}</h2>

        {/* Domain */}
        {node.domain && (
          <p className="text-[13px] text-text-3 text-center mb-4">{node.domain}</p>
        )}

        {/* Description */}
        <p className="text-[14px] text-text-2 leading-relaxed mb-6">{node.description}</p>

        {/* Mastery bar */}
        <div className="mb-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-3 mb-1.5">Mastery</div>
          <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-md border border-border bg-white text-[13px] font-medium text-text hover:bg-surface transition-colors cursor-pointer"
          >
            Close
          </button>
          {showAction && (
            <a
              href={`/session/${node.id}`}
              className="flex-1 px-4 py-2.5 rounded-md bg-accent text-[13px] font-medium text-white text-center hover:bg-accent-hover transition-colors no-underline"
            >
              {cfg.actionLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
