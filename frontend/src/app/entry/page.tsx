'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Link2, ScrollText } from 'lucide-react';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { EmptyState, ErrorState, LoadingNotice, Skeleton } from '@/components/States';
import { Copyable } from '@/components/Copyable';
import { KindSigil } from '@/components/Sigil';
import { Reveal } from '@/components/Reveal';
import { useEntryData } from '@/hooks/useContractData';
import { EXPLORER } from '@/lib/contract';
import { kindMeta, scoreBand, shortAddress } from '@/lib/format';

export default function EntryPage() {
  return (
    <Suspense fallback={<EntryFallback />}>
      <DataErrorBoundary>
        <EntryReader />
      </DataErrorBoundary>
    </Suspense>
  );
}

function EntryFallback() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-6 h-10 w-3/4" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <div className="mt-8">
        <LoadingNotice label="Unrolling the leaf" />
      </div>
    </div>
  );
}

function EntryReader() {
  const params = useSearchParams();
  const id = params.get('id');
  const { entry, resolved, loading, error, diagnostic, refresh } = useEntryData(id);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackLink />
        <div className="mt-8">
          <ErrorState message={error} diagnostic={diagnostic} onRetry={refresh} />
        </div>
      </div>
    );
  }

  if (loading) return <EntryFallback />;

  if (!id || !entry || !entry.exists) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <BackLink />
        <div className="mt-8">
          <EmptyState
            title="Not found in the canon"
            body="No leaf bears this mark. The entry may never have been set down, or its mark has been mistranscribed. Return to the Codex and choose a folio that stands."
          >
            <Link
              href="/codex"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-6 text-sm font-semibold text-gold transition-colors hover:bg-[rgba(216,178,90,0.1)]"
            >
              <ScrollText size={16} aria-hidden />
              Back to the Codex
            </Link>
          </EmptyState>
        </div>
      </div>
    );
  }

  const meta = kindMeta(entry.kind);
  const isCanon = entry.status === 'CANON';
  const seal = isCanon ? 'var(--canon)' : 'var(--apocrypha)';

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <BackLink />

      <Reveal>
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-4">
            <KindSigil kind={entry.kind} size={56} />
            <div>
              <span className="label-caps" style={{ color: meta.color }}>
                {meta.label}
              </span>
              <p className="font-mono text-xs text-faint">{meta.gloss}</p>
            </div>
            <span
              className="ml-auto inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em]"
              style={{ color: seal, borderColor: seal }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: seal }} aria-hidden />
              {isCanon ? 'Held as canon' : 'Filed apocrypha'}
            </span>
          </div>

          <h1 className="mt-5 font-display text-4xl leading-tight text-parchment text-shadow-deep sm:text-5xl">
            {entry.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-faint">scribed by</span>
              <Copyable
                value={entry.author}
                display={shortAddress(entry.author, 5)}
                label="Copy author address"
              />
            </span>
            <span className="font-mono tabular" style={{ color: meta.color }}>
              consistency {entry.score}/100
            </span>
          </div>
        </header>
      </Reveal>

      <div className="hairline-rule my-8" />

      {/* the illuminated body */}
      <Reveal delay={0.1}>
        <div className="dropcap measure text-lg leading-[1.85] text-parchment">
          {entry.body.split(/\n{2,}/).map((para, i) => (
            <p key={i} className={i === 0 ? '' : 'mt-5'}>
              {para}
            </p>
          ))}
        </div>
      </Reveal>

      {/* the Loremaster's note */}
      {entry.note && (
        <Reveal delay={0.15}>
          <aside className="vellum vellum-tex gilt filigree relative mt-10 rounded-lg p-6">
            <p className="label-caps" style={{ color: 'var(--gold)' }}>
              The Loremaster&apos;s note
            </p>
            <p className="relative mt-2 text-base italic leading-relaxed text-parchment">
              &ldquo;{entry.note}&rdquo;
            </p>
            <p className="relative mt-3 text-sm text-muted">
              Judged {scoreBand(entry.score)}, at {entry.score} of 100.
            </p>
          </aside>
        </Reveal>
      )}

      {/* contradiction notice for apocrypha */}
      {!isCanon && entry.contradicts && (
        <Reveal delay={0.18}>
          <aside className="mt-6 rounded-lg border border-[rgba(210,96,122,0.4)] bg-[rgba(210,96,122,0.07)] p-6">
            <p className="label-caps" style={{ color: 'var(--apocrypha)' }}>
              Why it is contested
            </p>
            <p className="mt-2 text-base leading-relaxed text-parchment">
              This entry stands at odds with the established canon. The Loremaster names its
              contradiction:
            </p>
            <p className="mt-2 font-display text-xl text-apocrypha">
              {entry.contradicts}
            </p>
          </aside>
        </Reveal>
      )}

      {/* cross-links */}
      {entry.links.length > 0 && (
        <Reveal delay={0.2}>
          <section className="mt-10">
            <p className="label-caps">Cross-linked in the canon</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {entry.links.map((lid) => (
                <Link
                  key={lid}
                  href={`/entry?id=${encodeURIComponent(lid)}`}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-4 py-2 text-sm text-parchment transition-colors hover:bg-[rgba(216,178,90,0.08)] hover:text-gold"
                >
                  <Link2 size={14} aria-hidden style={{ color: 'var(--astral)' }} />
                  {resolved[lid] ?? lid}
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hairline)] pt-6">
        <Link href="/codex" className="text-sm text-astral hover:underline">
          Return to the Codex
        </Link>
        <a
          href={`${EXPLORER}/address/${entry.author}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-parchment"
        >
          The scribe on the explorer
          <ExternalLink size={13} aria-hidden />
        </a>
      </div>
    </article>
  );
}

function BackLink() {
  return (
    <Link
      href="/codex"
      className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-parchment"
    >
      <ArrowLeft size={15} aria-hidden />
      The Codex
    </Link>
  );
}
