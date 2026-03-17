"use client";
import { useState, useEffect } from "react";
import ReviewCard from "./ReviewCard";

interface ReviewWarmupProps {
  topicId: string;
  topicTitle: string;
  reviewType: "teach-it" | "what-if" | "connect";
  sessionId: string;
  onDismiss: () => void;
}

export default function ReviewWarmup({ topicId, topicTitle, reviewType, sessionId, onDismiss }: ReviewWarmupProps) {
  const [challenge, setChallenge] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch("/api/ai/review/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ review_type: reviewType, topic_id: topicId }),
        });
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setChallenge(data.challenge);
        }
      } catch {
        setError("Failed to load warm-up challenge");
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [topicId, reviewType]);

  const handleComplete = () => {
    setTimeout(onDismiss, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl text-text">Warm-up Challenge</h2>
          <button
            onClick={onDismiss}
            className="rounded-md border border-border bg-surface-alt px-3 py-1 text-sm text-text-3 hover:bg-surface-alt"
          >
            Skip
          </button>
        </div>
        <p className="mb-4 text-sm text-text-3">
          Before your session, here&apos;s a quick review from a topic you&apos;ve mastered.
        </p>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-text-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Loading challenge...
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        {challenge && !error && (
          <ReviewCard
            challenge={challenge}
            reviewType={reviewType}
            topicId={topicId}
            topicTitle={topicTitle}
            sessionId={sessionId}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
