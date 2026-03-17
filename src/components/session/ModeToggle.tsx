// src/components/session/ModeToggle.tsx
"use client";

interface ModeToggleProps { mode: "challenge" | "dialogue"; onChange: (mode: "challenge" | "dialogue") => void; disabled?: boolean; }

export default function ModeToggle({ mode, onChange, disabled = false }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-border bg-surface-alt p-1">
      <button
        onClick={() => onChange("challenge")}
        disabled={disabled}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === "challenge" ? "bg-accent text-white shadow-sm" : "text-text-2 hover:text-text"} disabled:opacity-50`}
      >
        Challenge
      </button>
      <button
        onClick={() => onChange("dialogue")}
        disabled={disabled}
        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${mode === "dialogue" ? "bg-accent text-white shadow-sm" : "text-text-2 hover:text-text"} disabled:opacity-50`}
      >
        Dialogue
      </button>
    </div>
  );
}
