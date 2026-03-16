"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Application, Container } from "pixi.js";
import type { CosmosNode, CosmosEdge } from "./cosmos-types";
import { computeVisibleSet } from "./cosmos-fog";
import { createStarField, createNebulae, createConnections, createParticles, createNodes } from "./cosmos-layers";
import type { StarData, ParticleData, NodeSprite } from "./cosmos-layers";
import ZoomOverlay from "./ZoomOverlay";
import StatsPanel from "./StatsPanel";

interface CosmosTreeProps {
  nodes: CosmosNode[];
  edges: CosmosEdge[];
  newlyMasteredId?: string;
}

export default function CosmosTree({ nodes, edges, newlyMasteredId }: CosmosTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [selectedNode, setSelectedNode] = useState<CosmosNode | null>(null);

  const handleNodeClick = useCallback((node: CosmosNode) => {
    setSelectedNode(node);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let app: Application;
    let destroyed = false;

    // Store references for cleanup
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onUp: (() => void) | null = null;

    (async () => {
      app = new Application();
      await app.init({
        resizeTo: containerRef.current!,
        background: 0x020108,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (destroyed) { app.destroy(true); return; }
      containerRef.current?.appendChild(app.canvas);
      setCanvasReady(true);

      // World container for pan/zoom
      const world = new Container();
      app.stage.addChild(world);

      const cx = app.screen.width / 2;
      const cy = app.screen.height * 0.75;

      // Compute fog visibility
      const visibility = computeVisibleSet(nodes, edges);

      // Build layers
      const { container: starsContainer, stars } = createStarField(cx, cy);
      world.addChild(starsContainer);

      const nebulaContainer = createNebulae(app, cx, cy);
      world.addChild(nebulaContainer);

      const connectionsContainer = createConnections(nodes, edges, visibility, cx, cy);
      world.addChild(connectionsContainer);

      const { container: particlesContainer, particles } = createParticles(nodes, edges, visibility, cx, cy);
      world.addChild(particlesContainer);

      const { container: nodesContainer, nodeSprites } = createNodes(nodes, visibility, cx, cy, handleNodeClick);
      world.addChild(nodesContainer);

      // Animation loop
      let time = 0;
      app.ticker.add((ticker) => {
        time += ticker.deltaTime * 0.02;

        // Twinkle stars
        for (const s of stars) {
          s.graphics.alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.speed + s.offset));
        }

        // Pulse available/boss nodes
        for (const ns of nodeSprites) {
          if (ns.node.status === "available") {
            ns.container.alpha = 0.7 + 0.3 * Math.sin(time * 1.5 + ns.node.cosmosX * 0.01);
          } else if (ns.node.nodeType === "boss" && ns.visibility !== "dim") {
            ns.container.alpha = 0.65 + 0.35 * Math.sin(time * 1.2);
          }
        }

        // Animate particles
        for (const p of particles) {
          p.t += p.speed;
          if (p.t > 1) p.t -= 1;
          p.graphics.x = p.ax + (p.bx - p.ax) * p.t;
          p.graphics.y = p.ay + (p.by - p.ay) * p.t;
          p.graphics.alpha = 0.15 + 0.15 * Math.sin(p.t * Math.PI);
        }

        // Drift nebulae
        for (let i = 0; i < nebulaContainer.children.length; i++) {
          const n = nebulaContainer.children[i];
          n.x += Math.sin(time * 0.3 + i) * 0.05;
          n.y += Math.cos(time * 0.25 + i * 1.5) * 0.03;
        }
      });

      // Pan & Zoom
      let scale = 1, targetScale = 1;
      let panX = 0, panY = 0;
      let dragging = false, lastX = 0, lastY = 0;

      const canvas = app.canvas;
      canvas.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault();
        targetScale *= e.deltaY > 0 ? 0.92 : 1.08;
        targetScale = Math.max(0.3, Math.min(3, targetScale));
      }, { passive: false });

      canvas.addEventListener("pointerdown", (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      });

      onMove = (e: PointerEvent) => {
        if (!dragging) return;
        panX += e.clientX - lastX;
        panY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
      };

      onUp = () => { dragging = false; };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      app.ticker.add(() => {
        scale += (targetScale - scale) * 0.1;
        world.scale.set(scale);
        world.x = panX;
        world.y = panY;
      });
    })();

    return () => {
      destroyed = true;
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onUp) window.removeEventListener("pointerup", onUp);
      if (app) app.destroy(true);
    };
  }, [nodes, edges, handleNodeClick]);

  return (
    <div className="w-full h-screen relative bg-[#020108]">
      {/* Loading state */}
      {!canvasReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-[family-name:var(--font-cinzel)] text-[rgba(140,150,180,.25)] text-sm tracking-[4px] animate-pulse">
            CHARTING THE COSMOS...
          </p>
        </div>
      )}

      {/* PixiJS canvas container */}
      <div ref={containerRef} data-testid="cosmos-canvas" className="w-full h-full" />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[5]" style={{ background: "radial-gradient(ellipse at center, transparent 15%, rgba(2,1,8,.65) 100%)" }} />

      {/* Title */}
      <div className="fixed top-3.5 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1 className="font-[family-name:var(--font-cinzel)] text-sm text-[rgba(160,170,200,.35)] tracking-[8px]">
          THE PHYSICS COSMOS
        </h1>
        <p className="font-[family-name:var(--font-cormorant)] italic text-[11px] text-[rgba(120,130,160,.2)] tracking-wider mt-0.5">
          scroll to zoom · drag to pan · click stars to explore
        </p>
      </div>

      {/* Stats */}
      <StatsPanel nodes={nodes} />

      {/* Zoom overlay */}
      {selectedNode && (
        <ZoomOverlay node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
