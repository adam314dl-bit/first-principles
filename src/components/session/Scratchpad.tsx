// src/components/session/Scratchpad.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { renderMath } from "@/lib/renderMath";

interface ScratchpadProps { sessionId: string; initialContent?: string; }

export default function Scratchpad({ sessionId, initialContent = "" }: ScratchpadProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveContent = useCallback(async (text: string) => {
    setSaving(true);
    try { await fetch(`/api/sessions/${sessionId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scratchpadContent: text }) }); setLastSaved(new Date()); }
    catch { /* content is still in local state */ }
    finally { setSaving(false); }
  }, [sessionId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { saveContent(newContent); }, 1500);
  };

  useEffect(() => { return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); }; }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-serif text-xl text-text">Scratchpad</h2>
        <div className="text-xs text-text-3">{saving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ""}</div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r border-border">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Write notes, work through problems, use $math$ for inline and $$math$$ for display equations..."
            className="lined-paper h-full w-full resize-none border-none p-4 font-study text-lg text-text placeholder:text-text-3/50 focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-white p-4">
          {content
            ? <div className="prose prose-sm max-w-none text-text-2" dangerouslySetInnerHTML={{ __html: renderMath(content) }} />
            : <p className="text-sm text-text-3">Preview will appear here as you type. Use $ for inline math and $$ for display math.</p>
          }
        </div>
      </div>
    </div>
  );
}
