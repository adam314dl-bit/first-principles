// src/app/session/[topicId]/page.tsx
"use client";
import { useState, useEffect, use } from "react";
import ChallengeMode from "@/components/session/ChallengeMode";
import DialogueMode from "@/components/session/DialogueMode";
import Scratchpad from "@/components/session/Scratchpad";
import ModeToggle from "@/components/session/ModeToggle";
import SplitPane from "@/components/layout/SplitPane";

interface TopicData { id: string; title: string; subject: string; difficulty: number; masteryLevel: number; }
interface SessionData { id: string; topicId: string; mode: string; scratchpadContent: string; }

export default function SessionPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = use(params);
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [mode, setMode] = useState<"challenge" | "dialogue">("challenge");
  const [showWarmup, setShowWarmup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        const topicRes = await fetch(`/api/topics/${topicId}`);
        if (!topicRes.ok) throw new Error("Topic not found");
        const topicData = await topicRes.json();
        setTopic(topicData);
        const sessionRes = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic_id: topicId, mode: "challenge" }) });
        if (!sessionRes.ok) throw new Error("Failed to create session");
        const sessionData = await sessionRes.json();
        setSession(sessionData);
        if (topicData.masteryLevel >= 1 && Math.random() < 0.3) setShowWarmup(true);
      } catch (err) { setError(err instanceof Error ? err.message : "Failed to start session"); }
      finally { setLoading(false); }
    }
    initSession();
  }, [topicId]);

  const handleModeChange = async (newMode: "challenge" | "dialogue") => {
    setMode(newMode);
    if (session) await fetch(`/api/sessions/${session.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: newMode }) });
  };

  if (loading) return <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-bg"><div className="flex items-center gap-3 text-text-3"><div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />Starting session...</div></div>;

  if (error || !topic || !session) return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-bg">
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error || "Session could not be started"}</p>
        <a href="/tree" className="mt-3 inline-block rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">Back to Skill Tree</a>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-bg">
      {showWarmup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="mx-4 max-w-lg rounded-lg border border-border bg-white p-6 shadow-xl">
            <h3 className="font-serif text-xl text-text">Warm-up Challenge</h3>
            <p className="mt-2 text-sm text-text-3">Before diving in, let&apos;s check in on what you know about {topic.title}. This is optional — skip anytime.</p>
            <div className="mt-4 flex justify-end"><button onClick={() => setShowWarmup(false)} className="rounded-md border border-border bg-bg px-4 py-2 text-sm text-text-3 hover:bg-surface">Skip</button></div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-2">
        <div className="flex items-center gap-3">
          <a href="/tree" className="text-sm text-text-3 hover:text-text-2">&larr; Tree</a>
          <span className="text-text-3">/</span>
          <h1 className="font-serif text-lg text-text">{topic.title}</h1>
          <span className="rounded-full bg-accent-surface px-2 py-0.5 text-xs text-accent">{topic.subject}</span>
        </div>
        <ModeToggle mode={mode} onChange={handleModeChange} />
        <button onClick={async () => { await fetch(`/api/sessions/${session.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endSession: true }) }); window.location.href = `/tree?mastered=${topicId}`; }} className="rounded-md border border-border bg-bg px-3 py-1.5 text-sm text-text-3 hover:bg-surface">End Session</button>
      </div>
      <div className="flex-1 overflow-hidden">
        <SplitPane leftLabel={mode === "challenge" ? "Challenge" : "Dialogue"} rightLabel="Scratchpad"
          left={<div className="h-full overflow-y-auto p-4">{mode === "challenge" ? <ChallengeMode topicId={topic.id} topicTitle={topic.title} sessionId={session.id} /> : <DialogueMode topicId={topic.id} topicTitle={topic.title} sessionId={session.id} />}</div>}
          right={<Scratchpad sessionId={session.id} initialContent={session.scratchpadContent} />} />
      </div>
    </div>
  );
}
