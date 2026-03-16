import type { Graphics } from "pixi.js";

type IconFn = (g: Graphics, r: number, color: number, alpha: number) => void;

const icons: Record<string, IconFn> = {
  "physics-root": (g, r, color, alpha) => {
    // Atom with 3 orbit ellipses at different angles
    // PixiJS 8 Graphics doesn't have save/restore, so we draw
    // each ellipse using the unrotated API: one horizontal, two
    // manually approximated with quadratic curves for the tilted orbits.
    const rx = r * 0.7;
    const ry = r * 0.28;

    // Horizontal orbit (0 degrees)
    g.ellipse(0, 0, rx, ry).stroke({ width: 1.2, color, alpha: alpha * 0.7 });

    // +60 degree orbit — approximate with quadratic curves
    const cos60 = Math.cos(Math.PI / 3);
    const sin60 = Math.sin(Math.PI / 3);
    // Top-right and bottom-left points of a rotated ellipse
    const points60: Array<[number, number]> = [];
    const steps = 32;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const ex = rx * Math.cos(t);
      const ey = ry * Math.sin(t);
      points60.push([ex * cos60 - ey * sin60, ex * sin60 + ey * cos60]);
    }
    g.moveTo(points60[0][0], points60[0][1]);
    for (let i = 1; i <= steps; i++) {
      g.lineTo(points60[i][0], points60[i][1]);
    }
    g.stroke({ width: 1.2, color, alpha: alpha * 0.7 });

    // -60 degree orbit
    const cosN60 = Math.cos(-Math.PI / 3);
    const sinN60 = Math.sin(-Math.PI / 3);
    const pointsN60: Array<[number, number]> = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const ex = rx * Math.cos(t);
      const ey = ry * Math.sin(t);
      pointsN60.push([ex * cosN60 - ey * sinN60, ex * sinN60 + ey * cosN60]);
    }
    g.moveTo(pointsN60[0][0], pointsN60[0][1]);
    for (let i = 1; i <= steps; i++) {
      g.lineTo(pointsN60[i][0], pointsN60[i][1]);
    }
    g.stroke({ width: 1.2, color, alpha: alpha * 0.7 });

    // Nucleus dot
    g.circle(0, 0, r * 0.14).fill({ color, alpha: alpha * 0.8 });
  },
  units: (g, r, color, alpha) => {
    // Ruler with tick marks
    g.moveTo(-r * 0.5, 0).lineTo(r * 0.5, 0).stroke({ width: 1.5, color, alpha });
    for (const p of [-0.3, 0, 0.3]) {
      g.moveTo(p * r, -r * 0.25).lineTo(p * r, r * 0.25).stroke({ width: 0.8, color, alpha: alpha * 0.7 });
    }
  },
  vectors: (g, r, color, alpha) => {
    // Arrow with arrowhead
    g.moveTo(-r * 0.4, r * 0.3).lineTo(r * 0.35, -r * 0.35).stroke({ width: 1.5, color, alpha });
    g.poly([r * 0.35, -r * 0.35, r * 0.15, -r * 0.25, r * 0.2, -r * 0.05]).fill({ color, alpha: alpha * 0.7 });
  },
  "calculus-primer": (g, r, color, alpha) => {
    // dx/dt line
    g.moveTo(-r * 0.3, 0).lineTo(r * 0.3, 0).stroke({ width: 0.6, color, alpha: alpha * 0.5 });
  },
  graphs: (g, r, color, alpha) => {
    // Axes + curve
    g.moveTo(-r * 0.4, r * 0.4).lineTo(-r * 0.4, -r * 0.3).stroke({ width: 1, color, alpha });
    g.moveTo(-r * 0.4, r * 0.4).lineTo(r * 0.4, r * 0.4).stroke({ width: 1, color, alpha });
    g.moveTo(-r * 0.3, r * 0.2).quadraticCurveTo(0, -r * 0.3, r * 0.3, -r * 0.25).stroke({ width: 1.2, color, alpha });
  },
  kinematics: (g, r, color, alpha) => {
    // Ball + parabolic arc
    g.circle(-r * 0.25, r * 0.15, r * 0.15).fill({ color, alpha: alpha * 0.4 });
    g.moveTo(-r * 0.25, r * 0.15).quadraticCurveTo(0, -r * 0.4, r * 0.3, r * 0.15).stroke({ width: 1, color, alpha: alpha * 0.6 });
  },
  forces: (g, r, color, alpha) => {
    // Block + push/pull arrows
    g.rect(-r * 0.25, -r * 0.2, r * 0.5, r * 0.4).stroke({ width: 1, color, alpha });
    g.moveTo(-r * 0.55, 0).lineTo(-r * 0.25, 0).stroke({ width: 1.5, color, alpha });
    g.moveTo(r * 0.25, 0).lineTo(r * 0.55, 0).stroke({ width: 1.5, color, alpha });
  },
  oscillations: (g, r, color, alpha) => {
    // Sine wave
    g.moveTo(-r * 0.5, 0).quadraticCurveTo(-r * 0.25, -r * 0.4, 0, 0).quadraticCurveTo(r * 0.25, r * 0.4, r * 0.5, 0).stroke({ width: 1, color, alpha });
  },
  "newtons-laws": (g, r, color, alpha) => {
    // Apple + gravity arrow
    g.circle(0, -r * 0.2, r * 0.22).stroke({ width: 1.3, color, alpha: alpha * 0.7 });
    g.moveTo(0, r * 0.05).lineTo(0, r * 0.4).stroke({ width: 1.5, color, alpha: alpha * 0.6 });
    g.poly([0, r * 0.4, -r * 0.1, r * 0.25, r * 0.1, r * 0.25]).fill({ color, alpha: alpha * 0.4 });
  },
  "electric-charge": (g, r, color, alpha) => {
    // + and -
    g.moveTo(-r * 0.15, 0).lineTo(r * 0.15, 0).stroke({ width: 1, color, alpha });
    g.moveTo(0, -r * 0.15).lineTo(0, r * 0.15).stroke({ width: 1, color, alpha });
  },
  "maxwells-equations": (g, r, color, alpha) => {
    // Nabla cross symbol placeholder — simple cross + circle
    g.moveTo(-r * 0.3, -r * 0.3).lineTo(r * 0.3, r * 0.3).stroke({ width: 1.2, color, alpha });
    g.moveTo(r * 0.3, -r * 0.3).lineTo(-r * 0.3, r * 0.3).stroke({ width: 1.2, color, alpha });
    g.circle(0, 0, r * 0.15).stroke({ width: 0.8, color, alpha: alpha * 0.5 });
  },
};

// Fallback: draw a small dot
const fallbackIcon: IconFn = (g, r, color, alpha) => {
  g.circle(0, 0, r * 0.12).fill({ color, alpha: alpha * 0.4 });
};

export function drawNodeIcon(g: Graphics, nodeId: string, r: number, color: number, alpha: number): void {
  const fn = icons[nodeId] || fallbackIcon;
  fn(g, r, color, alpha);
}
