"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { CosmosNode, CosmosEdge } from "@/components/cosmos/cosmos-types";

const CosmosTree = dynamic(() => import("@/components/cosmos/CosmosTree"), { ssr: false });

function TreeContent() {
  const [nodes, setNodes] = useState<CosmosNode[]>([]);
  const [edges, setEdges] = useState<CosmosEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const newlyMasteredId = searchParams.get("mastered") ?? undefined;

  useEffect(() => {
    async function fetchData() {
      const [topicsRes, edgesRes] = await Promise.all([
        fetch("/api/topics"),
        fetch("/api/edges"),
      ]);
      const topicsData = await topicsRes.json();
      const edgesData = await edgesRes.json();
      setNodes(topicsData.topics ?? []);
      setEdges(edgesData ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return null;

  return <CosmosTree nodes={nodes} edges={edges} newlyMasteredId={newlyMasteredId} />;
}

export default function TreePage() {
  return (
    <Suspense fallback={null}>
      <TreeContent />
    </Suspense>
  );
}
