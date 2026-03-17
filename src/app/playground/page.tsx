"use client";
import { useState, useEffect } from "react";
import ReviewCard from "@/components/review/ReviewCard";

interface MasteredTopic {
  id: string;
  title: string;
  subject: string;
  masteryLevel: number;
  hasConnectionOpportunity?: boolean;
}

type FilterType = "all" | "teach-it" | "what-if" | "connect";
type ReviewType = "teach-it" | "what-if" | "connect";

const FILTER_LABELS: Record<FilterType, string> = {
  "all": "All Challenges",
  "teach-it": "Teach It",
  "what-if": "What If?",
  "connect": "Connect",
};

const REVIEW_TYPES: ReviewType[] = ["teach-it", "what-if", "connect"];

function getAvailableReviewTypes(masteryLevel: number): ReviewType[] {
  const types: ReviewType[] = ["teach-it"];
  if (masteryLevel >= 3) types.push("connect");
  if (masteryLevel >= 4) types.push("what-if");
  return types;
}

export default function PlaygroundPage() {
  const [topics, setTopics] = useState<MasteredTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [activeChallenge, setActiveChallenge] = useState<{
    topic: MasteredTopic;
    reviewType: ReviewType;
    challenge: string;
  } | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics?status=mastered");
        const data = await res.json();
        const fetched: MasteredTopic[] = data.topics ?? [];
        // Sort: connection opportunity first, then by mastery level desc
        fetched.sort((a, b) => {
          if (a.hasConnectionOpportunity && !b.hasConnectionOpportunity) return -1;
          if (!a.hasConnectionOpportunity && b.hasConnectionOpportunity) return 1;
          return b.masteryLevel - a.masteryLevel;
        });
        setTopics(fetched);
      } catch {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const filteredTopics = topics.filter((t) => {
    if (filter === "all") return true;
    return getAvailableReviewTypes(t.masteryLevel).includes(filter as ReviewType);
  });

  const handleLaunchChallenge = async (topic: MasteredTopic, reviewType: ReviewType) => {
    setChallengeLoading(true);
    try {
      const res = await fetch("/api/ai/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_type: reviewType, topic_id: topic.id }),
      });
      const data = await res.json();
      if (!data.error) {
        setActiveChallenge({ topic, reviewType, challenge: data.challenge });
      }
    } catch {
      // ignore
    } finally {
      setChallengeLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-text">Playground</h1>
      <p className="mt-2 text-text-3">Browse review challenges like a game menu — sorted by fun, not urgency.</p>

      {/* Filter buttons */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-accent text-white"
                : "border border-border bg-surface-alt text-text-2 hover:border-border-strong"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-8 flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {!loading && filteredTopics.length === 0 && (
        <div className="mt-8 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface">
          <p className="text-xl text-text-3">No mastered topics yet</p>
        </div>
      )}

      {!loading && filteredTopics.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => {
            const availableTypes = getAvailableReviewTypes(topic.masteryLevel);
            return (
              <div key={topic.id} className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-serif text-lg text-text">{topic.title}</h3>
                  {topic.hasConnectionOpportunity && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Connect</span>
                  )}
                </div>
                <p className="mb-3 text-xs text-text-3">Mastery {topic.masteryLevel}/5</p>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TYPES.filter((rt) => {
                    if (filter !== "all") return rt === filter && availableTypes.includes(rt);
                    return availableTypes.includes(rt);
                  }).map((rt) => (
                    <button
                      key={rt}
                      onClick={() => handleLaunchChallenge(topic, rt)}
                      disabled={challengeLoading}
                      className="rounded-md border border-accent-border bg-transparent px-3 py-1 text-xs font-medium text-accent hover:bg-accent-surface disabled:opacity-50"
                    >
                      {rt === "teach-it" ? "Teach It" : rt === "what-if" ? "What If?" : "Connect"}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Challenge modal */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setActiveChallenge(null)}
                className="rounded-md border border-border bg-surface px-3 py-1 text-sm text-text-3 hover:bg-surface-alt"
              >
                Close
              </button>
            </div>
            <ReviewCard
              challenge={activeChallenge.challenge}
              reviewType={activeChallenge.reviewType}
              topicId={activeChallenge.topic.id}
              topicTitle={activeChallenge.topic.title}
              sessionId=""
              onComplete={() => setTimeout(() => setActiveChallenge(null), 3000)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
