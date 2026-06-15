'use client';

import { useEffect, useRef } from 'react';

export interface ConstellationCanvasProps {
  // Density multiplier; the hero uses a touch more than section bands.
  density?: number;
  className?: string;
}

interface Mote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  twinkle: number;
  tw: number;
}

// A slow drifting constellation of ink-motes with faint gold filaments between
// near neighbours. RAF driven, devicePixelRatio aware, paused when the tab is
// hidden, and frozen entirely under prefers-reduced-motion (a single static
// frame is painted instead).
export function ConstellationCanvas({ density = 1, className }: ConstellationCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const densityRef = useRef(density);
  densityRef.current = density;

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
    let motes: Mote[] = [];

    const build = () => {
      const count = Math.max(28, Math.floor((w * h) / 26000) * densityRef.current);
      motes = [];
      for (let i = 0; i < count; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.7,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          twinkle: Math.random() * Math.PI * 2,
          tw: 0.004 + Math.random() * 0.01,
        });
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const paint = (animate: boolean) => {
      ctx.clearRect(0, 0, w, h);

      // gold filaments between near neighbours
      for (let i = 0; i < motes.length; i++) {
        const a = motes[i];
        for (let j = i + 1; j < motes.length; j++) {
          const b = motes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 13000) {
            const alpha = (1 - d2 / 13000) * 0.16;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(216, 178, 90, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // motes
      for (const p of motes) {
        if (animate) {
          p.x += p.vx;
          p.y += p.vy;
          p.twinkle += p.tw;
          if (p.x < -5) p.x = w + 5;
          if (p.x > w + 5) p.x = -5;
          if (p.y < -5) p.y = h + 5;
          if (p.y > h + 5) p.y = -5;
        }
        const a = 0.35 + Math.sin(p.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 227, 208, ${Math.max(0.08, a).toFixed(3)})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(216, 178, 90, 0.5)';
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const tick = () => {
      paint(true);
      raf = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf) raf = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduce) start();
    };

    resize();
    if (reduce) {
      paint(false);
    } else {
      start();
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-[1] ${className ?? ''}`}
    />
  );
}
