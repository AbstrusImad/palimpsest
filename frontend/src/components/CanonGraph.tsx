'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { EntrySummary } from '@/lib/contract';
import { kindMeta } from '@/lib/format';

export interface CanonGraphProps {
  entries: EntrySummary[];
}

interface Node {
  id: string;
  title: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Edge {
  a: number;
  b: number;
}

// A canvas 2D spring/force layout of the canon cross-link graph. RAF driven,
// devicePixelRatio aware, paused when the tab is hidden, and frozen under
// prefers-reduced-motion (the layout is solved once, then painted static).
export function CanonGraph({ entries }: CanonGraphProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const hoverRef = useRef<number>(-1);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const index = new Map<string, number>();
    entries.forEach((e, i) => index.set(e.id, i));

    const nodes: Node[] = entries.map((e) => {
      const meta = kindMeta(e.kind);
      return {
        id: e.id,
        title: e.title,
        color: meta.color,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 6 + Math.min(6, e.links.length * 1.4),
      };
    });

    const edges: Edge[] = [];
    const seen = new Set<string>();
    entries.forEach((e, i) => {
      for (const lid of e.links) {
        const j = index.get(lid);
        if (j === undefined) continue;
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ a: i, b: j });
      }
    });

    const seed = () => {
      const cx = w / 2;
      const cy = h / 2;
      const rad = Math.min(w, h) * 0.32;
      nodes.forEach((n, i) => {
        const a = (i / Math.max(1, nodes.length)) * Math.PI * 2;
        n.x = cx + Math.cos(a) * rad * (0.6 + Math.random() * 0.5);
        n.y = cy + Math.sin(a) * rad * (0.6 + Math.random() * 0.5);
        n.vx = 0;
        n.vy = 0;
      });
    };

    const step = () => {
      const cx = w / 2;
      const cy = h / 2;
      // repulsion
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.01) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            d2 = 1;
          }
          const force = 1800 / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }
      // springs
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const k = (d - 96) * 0.012;
        const fx = (dx / d) * k;
        const fy = (dy / d) * k;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
      // gravity to center + integrate
      for (const n of nodes) {
        n.vx += (cx - n.x) * 0.004;
        n.vy += (cy - n.y) * 0.004;
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += Math.max(-6, Math.min(6, n.vx));
        n.y += Math.max(-6, Math.min(6, n.vy));
        n.x = Math.max(n.r + 4, Math.min(w - n.r - 4, n.x));
        n.y = Math.max(n.r + 4, Math.min(h - n.r - 4, n.y));
      }
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      // edges
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const active = hoverRef.current === e.a || hoverRef.current === e.b;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = active ? 'rgba(216,178,90,0.55)' : 'rgba(216,178,90,0.18)';
        ctx.lineWidth = active ? 1.4 : 0.8;
        ctx.stroke();
      }
      // nodes
      nodes.forEach((n, i) => {
        const active = hoverRef.current === i;
        ctx.beginPath();
        ctx.arc(n.x, n.y, active ? n.r + 2 : n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = active ? 16 : 8;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (active) {
          ctx.font = '14px "IM Fell English SC", Georgia, serif';
          ctx.fillStyle = '#ece3d0';
          ctx.textAlign = 'center';
          const label = n.title.length > 32 ? n.title.slice(0, 31) + '...' : n.title;
          const tw = ctx.measureText(label).width;
          const lx = Math.max(tw / 2 + 6, Math.min(w - tw / 2 - 6, n.x));
          ctx.fillStyle = 'rgba(12,10,20,0.82)';
          ctx.fillRect(lx - tw / 2 - 6, n.y - n.r - 26, tw + 12, 20);
          ctx.fillStyle = '#ece3d0';
          ctx.fillText(label, lx, n.y - n.r - 11);
        }
      });
    };

    const tick = () => {
      step();
      paint();
      raf = window.requestAnimationFrame(tick);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : 480;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reduce) {
        for (let k = 0; k < 240; k++) step();
        paint();
      }
    };

    const start = () => {
      if (!reduce && !raf) raf = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const hitTest = (mx: number, my: number): number => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = mx - n.x;
        const dy = my - n.y;
        if (dx * dx + dy * dy <= (n.r + 6) * (n.r + 6)) return i;
      }
      return -1;
    };

    const pos = (ev: MouseEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [ev.clientX - rect.left, ev.clientY - rect.top];
    };

    const onMove = (ev: MouseEvent) => {
      const [mx, my] = pos(ev);
      const hit = hitTest(mx, my);
      hoverRef.current = hit;
      canvas.style.cursor = hit >= 0 ? 'pointer' : 'default';
      setHovered(hit >= 0 ? nodes[hit].id : null);
      if (reduce) paint();
    };
    const onLeave = () => {
      hoverRef.current = -1;
      setHovered(null);
      if (reduce) paint();
    };
    const onClick = (ev: MouseEvent) => {
      const [mx, my] = pos(ev);
      const hit = hitTest(mx, my);
      if (hit >= 0) router.push(`/entry?id=${encodeURIComponent(nodes[hit].id)}`);
    };

    resize();
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
    };
  }, [entries, router]);

  return (
    <div className="relative h-[clamp(420px,64vh,720px)] w-full">
      <canvas ref={ref} className="relative z-[2] h-full w-full" />
      <span className="sr-only" aria-live="polite">
        {hovered ? `Focused entry ready to open` : ''}
      </span>
    </div>
  );
}
