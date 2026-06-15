'use client';

import { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CopyableProps {
  value: string;
  display?: string;
  className?: string;
  label?: string;
}

export function Copyable({ value, display, className, label }: CopyableProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard may be blocked */
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={label ?? `Copy ${value}`}
      className={`group relative inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-parchment ${className ?? ''}`}
    >
      <span className="tabular break-all">{display ?? value}</span>
      {copied ? (
        <Check size={13} className="shrink-0 text-canon" aria-hidden />
      ) : (
        <Copy size={13} className="shrink-0 opacity-60 group-hover:opacity-100" aria-hidden />
      )}
      {copied && (
        <span
          role="status"
          className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-[var(--hairline)] bg-surface-2 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold"
        >
          Copied
        </span>
      )}
    </button>
  );
}
