"use client";
import { useState, useEffect } from "react";

interface SessionEntry {
  id: string;
  topicId: string;
  topicTitle: string | null;
  subject: string | null;
  mode: "challenge" | "dialogue";
  startedAt: string;
  endedAt: string | null;
  journalSummary: string | null;
  masteryChange: { from: number; to: number } | null;
}

const SUBJECT_COLORS: Record<string, string> = {
  math: "bg-blue-100 text-blue-700",
  physics: "bg-purple-100 text-purple-700",
  cs: "bg-green-100 text-green-700",
  chemistry: "bg-yellow-100 text-yellow-700",
  biology: "bg-pink-100 text-pink-700",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function groupByDate(sessions: SessionEntry[]): Record<string, SessionEntry[]> {
  const groups: Record<string, SessionEntry[]> = {};
  for (const s of sessions) {
    const date = new Date(s.startedAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(s);
  }
  return groups;
}

export default function JournalPage() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/sessions?include_topic=true");
        const data = await res.json();
        setSessions(data.sessions ?? []);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleGenerateSummary = async (sessionId: string) => {
    setGeneratingSummary(sessionId);
    try {
      const res = await fetch("/api/ai/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (data.summary) {
        setSessions((prev) =>
          prev.map((s) => s.id === sessionId ? { ...s, journalSummary: data.summary } : s)
        );
      }
    } catch {
      // ignore
    } finally {
      setGeneratingSummary(null);
    }
  };

  const groups = groupByDate(sessions);
  const dates = Object.keys(groups);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Learning Journal</h1>
      <p className="mt-2 text-ink-muted">Your session history, auto-generated summaries, and reflections on what clicked.</p>

      {loading && (
        <div className="mt-8 flex h-48 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber border-t-transparent" />
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="mt-8 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-tan-dark bg-parchment">
          <p className="font-hand text-xl text-ink-muted">No sessions yet</p>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="mt-8 space-y-10">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="mb-4 font-serif text-lg text-ink-muted">{formatDate(groups[date][0].startedAt)}</h2>
              <div className="space-y-4">
                {groups[date].map((session) => (
                  <div key={session.id} className="rounded-lg border border-tan-light bg-white p-5 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg text-ink">{session.topicTitle ?? "Unknown Topic"}</h3>
                      {session.subject && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SUBJECT_COLORS[session.subject] ?? "bg-gray-100 text-gray-700"}`}>
                          {session.subject}
                        </span>
                      )}
                      <span className="rounded-full border border-tan-dark px-2 py-0.5 text-xs text-ink-muted">
                        {session.mode}
                      </span>
                      <span className="ml-auto text-xs text-ink-muted">
                        {formatTime(session.startedAt)}{session.endedAt ? ` – ${formatTime(session.endedAt)}` : ""}
                      </span>
                    </div>

                    {session.masteryChange && (
                      <p className="mb-2 text-sm text-ink-muted">
                        Mastery: {session.masteryChange.from} → {session.masteryChange.to}
                      </p>
                    )}

                    {session.journalSummary ? (
                      <div className="lined-paper rounded-md border border-tan-light p-4">
                        <p className="font-hand text-lg text-ink-body">{session.journalSummary}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateSummary(session.id)}
                        disabled={generatingSummary === session.id}
                        className="rounded-md border border-dashed border-amber bg-amber-light/20 px-4 py-2 text-sm text-gold hover:bg-amber-light/40 disabled:opacity-50"
                      >
                        {generatingSummary === session.id ? "Generating..." : "Generate journal entry"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
