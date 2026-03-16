// src/app/tree/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import SkillTree from "@/components/skill-tree/SkillTree";
import type { SkillNode, SkillEdge } from "@/components/skill-tree/SkillTree";
import AddTopicModal from "@/components/skill-tree/AddTopicModal";

export default function TreePage() {
  const [nodes, setNodes] = useState<SkillNode[]>([]);
  const [edges, setEdges] = useState<SkillEdge[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [topicsRes, edgesRes] = await Promise.all([fetch("/api/topics"), fetch("/api/edges")]);
      if (!topicsRes.ok || !edgesRes.ok) throw new Error("Failed to fetch graph data");
      const topicsData = await topicsRes.json();
      setNodes(topicsData.topics ?? topicsData);
      setEdges(await edgesRes.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAddTopic(topic: { title: string; subject: string; difficulty: number; description: string }) {
    try {
      const res = await fetch("/api/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...topic, status: "available" }) });
      if (!res.ok) throw new Error("Failed to add topic");
      await fetchData();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to add topic"); }
  }

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Skill Tree</h1>
      <div className="mt-8 flex h-[600px] items-center justify-center rounded-lg border border-tan-light bg-parchment">
        <p className="font-hand text-xl text-ink-muted">Loading your knowledge graph...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-ink">Skill Tree</h1>
      <div className="mt-8 flex h-[600px] items-center justify-center rounded-lg border border-tan-light bg-parchment">
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink">Skill Tree</h1>
          <p className="mt-1 text-sm text-ink-muted">{nodes.length} topics &middot; {edges.length} connections</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-white hover:bg-amber/90">+ Add Topic</button>
      </div>
      <div className="mt-6 h-[600px]"><SkillTree nodes={nodes} edges={edges} /></div>
      <AddTopicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddTopic} />
    </div>
  );
}
