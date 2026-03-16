// src/components/session/Scratchpad.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import katex from "katex";

interface ScratchpadProps { sessionId: string; initialContent?: string; }

function renderMathInText(text: string): string {
  let result = text;
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_m, tex) => { try { return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }); } catch { return `<span class="text-red-500">[Math Error: ${tex}]</span>`; } });
  result = result.replace(/\$([^$\n]+?)\$/g, (_m, tex) => { try { return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }); } catch { return `<span class="text-red-500">[Math Error: ${tex}]</span>`; } });
  result = result.replace(/^### (.+)$/gm, '<h3 class="font-serif text-lg text-ink mt-4 mb-2">$1</h3>');
  result = result.replace(/^## (.+)$/gm, '<h2 class="font-serif text-xl text-ink mt-4 mb-2">$1</h2>');
  result = result.replace(/^# (.+)$/gm, '<h1 class="font-serif text-2xl text-ink mt-4 mb-2">$1</h1>');
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  result = result.replace(/\n/g, "<br />");
  return result;
}

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
      <div className="flex items-center justify-between border-b border-tan-light px-4 py-3">
        <h2 className="font-serif text-xl text-ink">Scratchpad</h2>
        <div className="text-xs text-ink-muted">{saving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ""}</div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r border-tan-light">
          <textarea value={content} onChange={handleChange} placeholder="Write notes, work through problems, use $math$ for inline and $$math$$ for display equations..." className="lined-paper h-full w-full resize-none border-none p-4 font-hand text-lg text-ink-body placeholder:text-ink-muted/50 focus:outline-none" />
        </div>
        <div className="flex-1 overflow-y-auto bg-white p-4">
          {content ? <div className="prose prose-sm max-w-none text-ink-body" dangerouslySetInnerHTML={{ __html: renderMathInText(content) }} /> : <p className="text-sm text-ink-muted">Preview will appear here as you type. Use $ for inline math and $$ for display math.</p>}
        </div>
      </div>
    </div>
  );
}
