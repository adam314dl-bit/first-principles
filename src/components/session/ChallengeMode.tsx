// src/components/session/ChallengeMode.tsx
"use client";
import { useState, useCallback } from "react";
import Visualization from "@/components/session/Visualization";
import MathText from "@/components/MathText";

interface ChallengeModeProps { topicId: string; topicTitle: string; sessionId: string; }

export default function ChallengeMode({ topicId, topicTitle, sessionId }: ChallengeModeProps) {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [hook, setHook] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempt, setAttempt] = useState("");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChallenge = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_id: topicId }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to generate challenge"); }
      const data = await res.json();
      setChallenge(data.challenge);
      setHook(data.hook ?? null);
      setHints([]); setHintLevel(0); setAttempt(""); setExplanation(null); setHasSubmitted(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  }, [topicId]);

  const requestHint = async () => {
    if (hintLevel >= 3) return;
    const nextLevel = hintLevel + 1;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, hint_level: nextLevel, user_attempt: attempt || undefined, topic_id: topicId }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to get hint"); }
      const data = await res.json();
      setHints((prev) => [...prev, data.hint]); setHintLevel(nextLevel);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  const submitAttempt = async () => {
    if (attempt.trim().length < 20) { setError("Write at least 20 characters — even a partial thought counts!"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: attempt, hint_level_used: hintLevel }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to submit attempt"); }
      setHasSubmitted(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  const requestExplanation = async () => {
    if (!hasSubmitted) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge, topic: topicTitle, user_attempt: attempt, topic_id: topicId }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to get explanation"); }
      const data = await res.json();
      setExplanation(data.explanation);
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "tutor", content: data.explanation }),
      });
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-text">Challenge Mode</h2>
        <button
          onClick={generateChallenge}
          disabled={loading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {challenge ? "New Challenge" : "Generate Challenge"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {hook && !hasSubmitted && (
        <div className="rounded-md border-l-4 border-accent bg-accent-surface px-4 py-3">
          <MathText text={hook} className="font-study text-base text-text-2 leading-relaxed" />
        </div>
      )}

      {challenge && (
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <MathText text={challenge} className="prose prose-sm max-w-none text-text-2" />
        </div>
      )}

      {challenge && hints.length > 0 && (
        <div className="space-y-2">
          {hints.map((hint, i) => (
            <div key={i} className="rounded-md border border-accent-border bg-accent-surface p-3 text-sm text-text-2">
              <div className="mb-1 font-medium text-accent">Hint {i + 1}</div>
              <MathText text={hint} className="prose prose-sm max-w-none" />
            </div>
          ))}
        </div>
      )}

      {challenge && hintLevel < 3 && (
        <button
          onClick={requestHint}
          disabled={loading}
          className="self-start rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-3 transition-colors hover:bg-surface disabled:opacity-50"
        >
          {hintLevel === 0 ? "Need a hint?" : `Hint ${hintLevel + 1} of 3`}
        </button>
      )}

      {challenge && (
        <div className="space-y-2">
          <label htmlFor="attempt-input" className="text-sm font-medium text-text-2">Your attempt</label>
          <textarea
            id="attempt-input"
            value={attempt}
            onChange={(e) => setAttempt(e.target.value)}
            disabled={hasSubmitted}
            placeholder="Think through it from first principles. Even a partial thought counts..."
            rows={5}
            className="lined-paper w-full rounded-md border border-border p-3 font-study text-lg text-text-2 placeholder:text-text-3/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-3">{attempt.trim().length}/20 characters minimum</span>
            {!hasSubmitted && (
              <button
                onClick={submitAttempt}
                disabled={loading || attempt.trim().length < 20}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                Submit Attempt
              </button>
            )}
          </div>
        </div>
      )}

      {challenge && hasSubmitted && !explanation && (
        <button
          onClick={requestExplanation}
          disabled={loading}
          className="rounded-md border-2 border-dashed border-gold bg-gold-surface px-4 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold-surface/80 disabled:opacity-50"
        >
          Unlock Full Explanation
        </button>
      )}

      {explanation && (
        <div className="rounded-lg border border-gold bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-serif text-lg text-gold">Explanation</h3>
          <MathText text={explanation} className="prose prose-sm max-w-none text-text-2" />
        </div>
      )}

      {explanation && (
        <div className="mt-6">
          <Visualization topicId={topicId} topicTitle={topicTitle} />
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Tutor is thinking...
        </div>
      )}
    </div>
  );
}
