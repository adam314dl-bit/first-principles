// src/components/TopBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navTabs = [
  { label: "Cosmos", href: "/tree" },
  { label: "Playground", href: "/playground" },
  { label: "Journal", href: "/journal" },
] as const;

const models = [
  { label: "Claude Sonnet", value: "claude-sonnet" },
  { label: "Claude Opus", value: "claude-opus" },
  { label: "GPT-4o", value: "gpt-4o" },
] as const;

export default function TopBar() {
  const pathname = usePathname();
  const [selectedModel, setSelectedModel] = useState("claude-sonnet");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.selectedModel) {
          setSelectedModel(data.selectedModel);
        }
      })
      .catch(() => {
        // Silently fall back to default
      });
  }, []);

  async function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedModel: newModel }),
      });
    } catch {
      // Silently fail — the selection is still held in local state
    } finally {
      setSaving(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/tree" className="flex items-center gap-2">
          <span className="font-serif text-[15px] font-bold text-text">First Principles</span>
        </Link>
        <nav className="flex h-full items-center gap-1">
          {navTabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex h-full items-center px-3 text-sm font-medium transition-colors ${
                  isActive ? "text-text" : "text-text-3 hover:text-text-2"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <label htmlFor="model-select" className="text-xs text-text-3">Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={handleModelChange}
            disabled={saving}
            className="rounded-md border border-border bg-surface-alt px-2 py-1 text-xs text-text-2 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          >
            {models.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          {saving && <span className="text-xs text-text-3">saving...</span>}
        </div>
      </div>
    </header>
  );
}
