"use client";
import { useEffect, useRef } from "react";

/**
 * A drifting field of nodes. Nodes that come close are joined by a line, and now and then a
 * pulse travels along a line: a claim being passed from source to source and agreed on.
 */
export function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0;
    type Node = { x: number; y: number; vx: number; vy: number };
    type Pulse = { a: number; b: number; t: number };
    let nodes: Node[] = [];
    const pulses: Pulse[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor((w * h) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const LINK = 130;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!reduce) { n.x += n.vx; n.y += n.vy; }
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(139, 120, 255, ${0.28 * (1 - d / LINK)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(190, 180, 255, .65)";
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 1.6, 0, 6.283); ctx.fill(); }

      if (!reduce) {
        if (Math.random() < 0.025 && pulses.length < 6 && nodes.length > 2) {
          const a = Math.floor(Math.random() * nodes.length);
          const near = nodes.map((n, k) => ({ k, d: Math.hypot(n.x - nodes[a].x, n.y - nodes[a].y) }))
            .filter((o) => o.k !== a && o.d < LINK);
          if (near.length) pulses.push({ a, b: near[Math.floor(Math.random() * near.length)].k, t: 0 });
        }
        for (let p = pulses.length - 1; p >= 0; p--) {
          const pu = pulses[p]; pu.t += 0.03;
          if (pu.t >= 1) { pulses.splice(p, 1); continue; }
          const x = nodes[pu.a].x + (nodes[pu.b].x - nodes[pu.a].x) * pu.t;
          const y = nodes[pu.a].y + (nodes[pu.b].y - nodes[pu.a].y) * pu.t;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 12);
          g.addColorStop(0, "rgba(59, 227, 255, .95)"); g.addColorStop(1, "rgba(59, 227, 255, 0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.283); ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="constellation" aria-hidden />;
}
