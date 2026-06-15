'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, RotateCcw, Unplug } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER } from '@/lib/contract';

// ---- skeletons -----------------------------------------------------------

export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton rounded ${className ?? ''}`} aria-hidden />;
}

export function FolioSkeleton() {
  return (
    <div className="vellum gilt rounded-lg p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-5 h-3 w-28" />
    </div>
  );
}

export interface LoadingNoticeProps {
  label?: string;
}

// Shows a "still loading" hint after 5 seconds for slow networks.
export function LoadingNotice({ label }: LoadingNoticeProps) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 5000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <p className="text-center text-sm text-muted" role="status">
      {label ?? 'Turning the leaves'}
      {slow && (
        <span className="mt-1 block text-xs text-faint">
          Still loading, the network may be slow.
        </span>
      )}
    </p>
  );
}

// ---- error state ---------------------------------------------------------

export interface ErrorStateProps {
  message: string;
  diagnostic?: boolean;
  onRetry: () => void;
}

export function ErrorState({ message, diagnostic, onRetry }: ErrorStateProps) {
  return (
    <div className="vellum gilt mx-auto max-w-lg rounded-xl p-8 text-center" role="alert">
      <Unplug size={28} className="mx-auto text-apocrypha" aria-hidden />
      <h2 className="mt-4 font-display text-2xl text-parchment">The scriptorium is unreachable</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
      {diagnostic && (
        <p className="mt-3 break-all rounded-md border border-[rgba(210,96,122,0.3)] bg-[rgba(210,96,122,0.08)] px-3 py-2 font-mono text-xs text-apocrypha">
          Configured address: {CONTRACT_ADDRESS}
        </p>
      )}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-5 text-sm font-semibold text-gold transition-colors hover:bg-[rgba(216,178,90,0.1)]"
        >
          <RotateCcw size={15} aria-hidden />
          Retry
        </button>
        <a
          href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-astral hover:underline"
        >
          Explorer
          <ExternalLink size={13} aria-hidden />
        </a>
      </div>
    </div>
  );
}

// ---- empty state ---------------------------------------------------------

export interface EmptyStateProps {
  title: string;
  body: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, body, children }: EmptyStateProps) {
  return (
    <div className="vellum gilt filigree mx-auto max-w-xl rounded-xl p-10 text-center">
      <p className="label-caps">An unwritten leaf</p>
      <h2 className="mt-3 font-display text-3xl text-parchment text-shadow-deep">{title}</h2>
      <p className="measure mx-auto mt-3 text-base leading-relaxed text-muted">{body}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
