"use client";
import { useState, useEffect, useRef } from "react";

interface VisualizationProps {
  topicId: string;
  topicTitle: string;
}

export default function Visualization({ topicId, topicTitle }: VisualizationProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/visualization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_id: topicId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setCode(data.visualization_code);
      }
    } catch {
      setError("Failed to generate visualization");
    } finally {
      setLoading(false);
    }
  };

  const getBlobUrl = (htmlCode: string): string => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    return url;
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg text-text">Visualization</h3>
          <p className="text-sm text-text-3">Explore {topicTitle} visually</p>
        </div>
        {!code && (
          <button
            onClick={generate}
            disabled={loading}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        )}
        {code && (
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="rounded-md border border-border bg-surface-alt px-3 py-1 text-sm text-text-3 hover:bg-surface-alt"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="rounded-md border border-border bg-surface-alt px-3 py-1 text-sm text-text-3 hover:bg-surface-alt disabled:opacity-50"
            >
              Regenerate
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading && !code && (
        <div className="flex items-center gap-2 text-sm text-text-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          Generating interactive visualization...
        </div>
      )}

      {code && (
        <div className={`mt-3 overflow-hidden rounded-md border border-border ${expanded ? "h-[600px]" : "h-64"} transition-all duration-300`}>
          <iframe
            src={getBlobUrl(code)}
            title={`Visualization for ${topicTitle}`}
            sandbox="allow-scripts"
            className="h-full w-full border-0"
          />
        </div>
      )}
    </div>
  );
}
