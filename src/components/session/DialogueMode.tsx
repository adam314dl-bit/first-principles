// src/components/session/DialogueMode.tsx
"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Message { id: string; role: "user" | "tutor"; content: string; }
interface DialogueModeProps { topicId: string; topicTitle: string; sessionId: string; }

export default function DialogueMode({ topicId, topicTitle, sessionId }: DialogueModeProps) {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);
  useEffect(() => { scrollToBottom(); }, [messageList, scrollToBottom]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) { const data = await res.json(); if (data.messages?.length > 0) setMessageList(data.messages.map((m: Message) => ({ id: m.id, role: m.role, content: m.content }))); }
      } catch { /* start fresh */ }
    }
    loadMessages();
  }, [sessionId]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;
    setMessageList((prev) => [...prev, { id: `local-${Date.now()}`, role: "user", content: trimmed }]);
    setInput(""); setStreaming(true); setError(null);
    try {
      const res = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, message: trimmed }) });
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error || "Failed to get response"); }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");
      const decoder = new TextDecoder();
      let tutorContent = "";
      const tutorMsgId = `tutor-${Date.now()}`;
      setMessageList((prev) => [...prev, { id: tutorMsgId, role: "tutor", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        tutorContent += decoder.decode(value, { stream: true });
        setMessageList((prev) => prev.map((m) => m.id === tutorMsgId ? { ...m, content: tutorContent } : m));
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setStreaming(false); textareaRef.current?.focus(); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-serif text-xl text-text">Dialogue Mode</h2>
        <p className="text-sm text-text-3">Exploring {topicTitle} — ask anything, think aloud, go deep.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messageList.length === 0 && <div className="flex h-full items-center justify-center"><p className="text-center text-text-3">Start a conversation about {topicTitle}. Ask a question, share what you know, or say &quot;give me a problem on this.&quot;</p></div>}
        <div className="space-y-4">
          {messageList.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === "user" ? "bg-accent-surface text-text-2" : "border border-border bg-surface text-text-2"}`}>
                <div className="mb-1 text-xs font-medium text-text-3">{msg.role === "user" ? "You" : "Tutor"}</div>
                <div className="whitespace-pre-wrap text-sm">{msg.content}{streaming && msg.role === "tutor" && msg === messageList[messageList.length - 1] && msg.content === "" && <span className="inline-block h-4 w-1 animate-pulse bg-accent" />}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {error && <div className="mx-4 mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={streaming} placeholder="Think aloud, ask questions, challenge the tutor..." rows={2} className="flex-1 resize-none rounded-md border border-border p-3 font-study text-lg text-text-2 placeholder:text-text-3/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50" />
          <button onClick={sendMessage} disabled={streaming || !input.trim()} className="self-end rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50">{streaming ? "..." : "Send"}</button>
        </div>
        <p className="mt-1 text-xs text-text-3">Shift+Enter for new line. Enter to send.</p>
      </div>
    </div>
  );
}
