"use client";
import { useState } from "react";

interface ReviewCardProps {
  challenge: string;
  reviewType: "teach-it" | "what-if" | "connect";
  topicId: string;
  topicTitle: string;
  sessionId: string;
  onComplete: (result: Record<string, unknown>) => void;
}

const TYPE_LABELS: Record<string, string> = {
  "teach-it": "Teach It",
  "what-if": "What If?",
  "connect": "Connect",
};

const TYPE_COLORS: Record<string, string> = {
  "teach-it": "border-blue-400",
  "what-if": "border-purple-400",
  "connect": "border-green-400",
};

export default function ReviewCard({ challenge, reviewType, topicId, topicTitle, sessionId, onComplete }: ReviewCardProps) {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MIN_CHARS = 20;
  const remaining = Math.max(0, MIN_CHARS - response.length);
  const canSubmit = response.length >= MIN_CHARS;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/review/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_type: reviewType,
          challenge,
          user_response: response,
          topic_id: topicId,
          session_id: sessionId,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        onComplete(data);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-lg border-2 ${TYPE_COLORS[reviewType]} bg-white p-5 shadow-sm`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-parchment px-3 py-1 text-xs font-semibold text-ink-muted">
          {TYPE_LABELS[reviewType]}
        </span>
        <span className="font-serif text-sm text-ink">{topicTitle}</span>
      </div>
      <p className="mb-4 text-ink-body">{challenge}</p>
      {!result && (
        <>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response here..."
            rows={4}
            className="lined-paper w-full rounded-md border border-tan-light p-3 font-hand text-lg text-ink-body placeholder:text-ink-muted/50 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              {remaining > 0 ? `${remaining} more characters needed` : "Ready to submit"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber/90 disabled:opacity-50"
            >
              Submit Response
            </button>
          </div>
        </>
      )}
      {error && <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {result && (
        <div className={`mt-4 rounded-md border p-4 ${result.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <p className="font-medium text-sm mb-1">{result.passed ? "Passed!" : "Not quite"}</p>
          <p className="text-sm text-ink-body">{result.feedback as string}</p>
          {reviewType === "teach-it" && Boolean(result.follow_up_question) && (
            <p className="mt-2 text-sm text-ink-muted italic">Follow-up: {result.follow_up_question as string}</p>
          )}
          {reviewType === "what-if" && result.depth_score !== undefined && (
            <p className="mt-2 text-sm text-ink-muted">Depth score: {result.depth_score as number}/3</p>
          )}
          {reviewType === "connect" && Boolean(result.connection_quality) && (
            <p className="mt-2 text-sm text-ink-muted">Connection quality: {result.connection_quality as string}</p>
          )}
        </div>
      )}
      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber border-t-transparent" />
          Evaluating...
        </div>
      )}
    </div>
  );
}
