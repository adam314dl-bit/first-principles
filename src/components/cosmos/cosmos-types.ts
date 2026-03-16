export interface CosmosNode {
  id: string;
  title: string;
  subject: string;
  difficulty: number;
  status: "locked" | "available" | "in-progress" | "mastered";
  masteryLevel: number;
  description: string;
  cosmosX: number;
  cosmosY: number;
  cosmosRadius: number;
  domain: string;
  nodeType: "galaxy" | "star" | "boss";
}

export interface CosmosEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: "prerequisite" | "related" | "deepens";
  weight: number;
}

export type VisibilityState = "bright" | "frontier" | "dim" | "fogged";
