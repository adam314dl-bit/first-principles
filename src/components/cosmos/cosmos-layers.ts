import {
  Application, Container, Graphics,
  RenderTexture, BlurFilter, Sprite,
} from "pixi.js";
import type { CosmosNode, CosmosEdge, VisibilityState } from "./cosmos-types";
import { drawNodeIcon } from "./cosmos-icons";

// ═══ COLOR CONSTANTS ═══
const DOMAIN_COLORS: Record<string, number> = {
  core: 0xc4a55a,
  mechanics: 0x8ab0d0,
  em: 0xc04848,
  waves: 0x50a0a0,
  thermo: 0xc09050,
  modern: 0x6080a0,
};

const STATUS_COLORS: Record<string, number> = {
  mastered: 0x8ab0d0,
  "in-progress": 0xd0a060,
  available: 0x60b880,
  locked: 0x5060a0,
};

const NEBULA_CONFIGS: Array<{ x: number; y: number; r: number; color: number; alpha: number }> = [
  { x: -200, y: -400, r: 250, color: 0x2a1050, alpha: 0.08 },
  { x: 250, y: -350, r: 200, color: 0x152540, alpha: 0.06 },
  { x: 350, y: -600, r: 180, color: 0x401520, alpha: 0.04 },
  { x: -100, y: -800, r: 150, color: 0x104030, alpha: 0.03 },
  { x: 0, y: -100, r: 300, color: 0x180a30, alpha: 0.05 },
];

// ═══ BACKGROUND STARS ═══
export interface StarData {
  graphics: Graphics;
  baseAlpha: number;
  speed: number;
  offset: number;
}

export function createStarField(cx: number, cy: number): { container: Container; stars: StarData[] } {
  const container = new Container();
  const stars: StarData[] = [];

  for (let i = 0; i < 400; i++) {
    const g = new Graphics();
    const sz = Math.random() * 1.2 + 0.2;
    const bAlpha = Math.random() * 0.3 + 0.05;
    g.circle(0, 0, sz).fill({ color: 0xccccee, alpha: bAlpha });
    g.x = cx + (Math.random() - 0.5) * 3000;
    g.y = cy + (Math.random() - 0.5) * 2500;
    container.addChild(g);
    stars.push({ graphics: g, baseAlpha: bAlpha, speed: 0.5 + Math.random() * 2, offset: Math.random() * Math.PI * 2 });
  }

  return { container, stars };
}

// ═══ NEBULAE (pre-baked) ═══
export function createNebulae(app: Application, cx: number, cy: number): Container {
  const container = new Container();

  for (const cfg of NEBULA_CONFIGS) {
    const g = new Graphics();
    g.circle(0, 0, cfg.r).fill({ color: cfg.color, alpha: cfg.alpha });

    // Bake to RenderTexture with blur
    const rt = RenderTexture.create({ width: cfg.r * 2 + 120, height: cfg.r * 2 + 120 });
    g.x = cfg.r + 60;
    g.y = cfg.r + 60;
    g.filters = [new BlurFilter({ strength: 50, quality: 3 })];
    app.renderer.render({ container: g, target: rt });

    const sprite = new Sprite(rt);
    sprite.anchor.set(0.5);
    sprite.x = cx + cfg.x;
    sprite.y = cy + cfg.y;
    container.addChild(sprite);
  }

  return container;
}

// ═══ CONNECTIONS ═══
export function createConnections(
  nodes: CosmosNode[],
  edges: CosmosEdge[],
  visibility: Map<string, VisibilityState>,
  cx: number,
  cy: number,
): Container {
  const container = new Container();
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const edge of edges) {
    const a = nodeMap.get(edge.sourceId);
    const b = nodeMap.get(edge.targetId);
    if (!a || !b) continue;

    const va = visibility.get(a.id) ?? "fogged";
    const vb = visibility.get(b.id) ?? "fogged";
    if (va === "fogged" && vb === "fogged") continue;

    let alpha = 0.03;
    let width = 0.7;
    if (va === "bright" && vb === "bright") { alpha = 0.1; width = 1.5; }
    else if ((va === "bright" && vb === "frontier") || (va === "frontier" && vb === "bright")) { alpha = 0.07; width = 1.2; }
    else if (va === "dim" || vb === "dim") { alpha = 0.025; width = 0.5; }

    const g = new Graphics();
    g.moveTo(cx + a.cosmosX, cy + a.cosmosY).lineTo(cx + b.cosmosX, cy + b.cosmosY).stroke({ width, color: 0x8090c0, alpha });
    container.addChild(g);
  }

  return container;
}

// ═══ ENERGY PARTICLES ═══
export interface ParticleData {
  graphics: Graphics;
  ax: number; ay: number; bx: number; by: number;
  t: number; speed: number;
}

export function createParticles(
  nodes: CosmosNode[],
  edges: CosmosEdge[],
  visibility: Map<string, VisibilityState>,
  cx: number,
  cy: number,
): { container: Container; particles: ParticleData[] } {
  const container = new Container();
  const particles: ParticleData[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const edge of edges) {
    const a = nodeMap.get(edge.sourceId);
    const b = nodeMap.get(edge.targetId);
    if (!a || !b) continue;
    if (visibility.get(a.id) !== "bright" || visibility.get(b.id) !== "bright") continue;

    for (let i = 0; i < 2; i++) {
      const g = new Graphics();
      g.circle(0, 0, 1).fill({ color: 0xa0b0e0, alpha: 0.3 });
      container.addChild(g);
      particles.push({
        graphics: g,
        ax: cx + a.cosmosX, ay: cy + a.cosmosY,
        bx: cx + b.cosmosX, by: cy + b.cosmosY,
        t: Math.random(), speed: 0.002 + Math.random() * 0.003,
      });
    }
  }

  return { container, particles };
}

// ═══ NODES ═══
export interface NodeSprite {
  container: Container;
  node: CosmosNode;
  visibility: VisibilityState;
}

export function createNodes(
  nodes: CosmosNode[],
  visibility: Map<string, VisibilityState>,
  cx: number,
  cy: number,
  onNodeClick: (node: CosmosNode) => void,
): { container: Container; nodeSprites: NodeSprite[] } {
  const container = new Container();
  const nodeSprites: NodeSprite[] = [];

  for (const node of nodes) {
    const vis = visibility.get(node.id) ?? "fogged";
    if (vis === "fogged") continue;

    const nc = new Container();
    nc.x = cx + node.cosmosX;
    nc.y = cy + node.cosmosY;

    const r = node.cosmosRadius;
    const isInteractive = vis === "bright" || vis === "frontier";
    const color = vis === "bright"
      ? (node.nodeType === "boss" ? 0xc04030 : (DOMAIN_COLORS[node.domain] ?? 0x8ab0d0))
      : vis === "frontier"
        ? 0x60b880
        : 0x5060a0;

    const alphaMap: Record<VisibilityState, number> = { bright: 1, frontier: 0.8, dim: 0.15, fogged: 0 };
    const baseAlpha = alphaMap[vis];

    // Outer glow (only for bright/frontier)
    if (vis !== "dim") {
      const glow = new Graphics();
      glow.circle(0, 0, r * 2).fill({ color, alpha: node.nodeType === "boss" ? 0.04 : 0.025 });
      glow.filters = [new BlurFilter({ strength: 10, quality: 2 })];
      nc.addChild(glow);
    }

    // Main circle
    const main = new Graphics();
    main.circle(0, 0, r).fill({ color: 0x060410, alpha: 0.9 });
    main.circle(0, 0, r).stroke({ width: node.nodeType === "boss" ? 2.5 : 1.8, color, alpha: baseAlpha * 0.8 });
    nc.addChild(main);

    // Inner ring (not for dim)
    if (vis !== "dim") {
      const inner = new Graphics();
      inner.circle(0, 0, r * 0.7).stroke({ width: 0.5, color, alpha: baseAlpha * 0.3 });
      nc.addChild(inner);
    }

    // Physics icon
    const icon = new Graphics();
    drawNodeIcon(icon, node.id, r, color, baseAlpha * (vis === "dim" ? 0.4 : 0.6));
    nc.addChild(icon);

    // Boss corona rays
    if (node.nodeType === "boss" && vis !== "dim") {
      const corona = new Graphics();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        corona.moveTo(0, 0).lineTo(Math.cos(angle) * r * 1.8, Math.sin(angle) * r * 1.8).stroke({ width: 0.4, color, alpha: 0.05 });
      }
      nc.addChild(corona);
    }

    // Interactivity
    if (isInteractive) {
      nc.eventMode = "static";
      nc.cursor = "pointer";
      nc.on("pointerdown", () => onNodeClick(node));
      nc.on("pointerover", () => nc.scale.set(1.12));
      nc.on("pointerout", () => nc.scale.set(1));
    }

    container.addChild(nc);
    nodeSprites.push({ container: nc, node, visibility: vis });
  }

  return { container, nodeSprites };
}
