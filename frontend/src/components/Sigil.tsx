'use client';

import { Kind } from '@/lib/contract';
import { kindMeta } from '@/lib/format';

export interface KindSigilProps {
  kind: Kind;
  size?: number;
  className?: string;
}

// An illuminated kind-sigil: a gilded roundel bearing the kind's display letter.
export function KindSigil({ kind, size = 40, className }: KindSigilProps) {
  const meta = kindMeta(kind);
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        border: `1px solid ${meta.color}`,
        background: `radial-gradient(circle at 50% 35%, ${meta.color}22, transparent 70%)`,
        boxShadow: `inset 0 0 12px ${meta.color}22`,
      }}
      aria-hidden
    >
      <span
        className="font-display leading-none"
        style={{ color: meta.color, fontSize: size * 0.5 }}
      >
        {meta.sigil}
      </span>
    </span>
  );
}

// The wax-seal wordmark mark used in the nav and the colophon.
export function WaxSeal({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 40% 30%, #8c2f45, #5e1d2e 70%, #3c1320)',
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.6)',
      }}
      aria-hidden
    >
      <span
        className="font-display leading-none text-parchment"
        style={{ fontSize: size * 0.46, opacity: 0.92 }}
      >
        P
      </span>
    </span>
  );
}
