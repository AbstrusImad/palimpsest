'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { EmptyState, ErrorState, LoadingNotice, Skeleton } from '@/components/States';
import { Copyable } from '@/components/Copyable';
import { KindSigil } from '@/components/Sigil';
import { Stagger, StaggerItem } from '@/components/Reveal';
import { useChronicleData } from '@/hooks/useContractData';
import { ChronicleEntry } from '@/lib/contract';
import { kindMeta, rulingMeta, shortAddress } from '@/lib/format';

export default function ChroniclePage() {
  return (
    <DataErrorBoundary>
      <Chronicle />
    </DataErrorBoundary>
  );
}

function Chronicle() {
  const { rulings, loading, loadingMore, hasMore, error, diagnostic, refresh, loadMore } =
    useChronicleData();

  return (
    <div>
      <PageHeader
        art="/art/loremaster.jpg"
        kicker="The record of judgement"
        title="The Chronicle"
        subtitle="Every ruling the Loremaster has handed down, newest first. Canonized leaves, contested apocrypha, and those struck from the record alike."
      />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {error ? (
          <ErrorState message={error} diagnostic={diagnostic} onRetry={refresh} />
        ) : loading ? (
          <div>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <div className="mt-6">
              <LoadingNotice label="Reading the record of rulings" />
            </div>
          </div>
        ) : rulings.length === 0 ? (
          <EmptyState
            title="No ruling has been handed down"
            body="The Loremaster has weighed nothing yet. Once the first entry is scribed, its judgement will be recorded here for all to read."
          />
        ) : (
          <>
            <Stagger className="space-y-4">
              {rulings.map((r) => (
                <StaggerItem key={`${r.seq}-${r.id || 'struck'}`}>
                  <ChronicleRow row={r} />
                </StaggerItem>
              ))}
            </Stagger>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-7 text-sm font-semibold text-gold transition-colors hover:bg-[rgba(216,178,90,0.1)] disabled:opacity-60"
                >
                  {loadingMore && <Loader2 size={16} className="animate-spin" aria-hidden />}
                  {loadingMore ? 'Reading on' : 'Read earlier rulings'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function ChronicleRow({ row }: { row: ChronicleEntry }) {
  const meta = rulingMeta(row.ruling);
  const kMeta = kindMeta(row.kind);
  const struck = row.ruling === 'REJECT';
  const linkable = !struck && row.id;

  const inner = (
    <article
      className={`vellum gilt filigree relative flex items-start gap-4 rounded-lg p-5 transition-transform ${
        linkable ? 'group-hover:-translate-y-0.5' : ''
      }`}
      style={struck ? { background: 'linear-gradient(180deg, rgba(18,15,24,0.92), rgba(10,8,14,0.95))' } : undefined}
    >
      <span
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ background: meta.color }}
        aria-hidden
      />
      <KindSigil kind={row.kind} size={44} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]"
            style={{ color: meta.color, borderColor: meta.color }}
          >
            {row.ruling}
          </span>
          <span className="label-caps" style={{ color: kMeta.color, letterSpacing: '0.12em' }}>
            {kMeta.label}
          </span>
          <span className="font-mono tabular text-xs text-muted">{row.score}/100</span>
        </div>

        <h3
          className={`mt-2 font-display text-2xl leading-tight ${
            struck ? 'text-muted line-through decoration-[rgba(179,164,138,0.5)]' : 'text-parchment'
          } ${linkable ? 'group-hover:text-gold' : ''}`}
        >
          {row.title}
        </h3>

        {row.note && (
          <p className="mt-1.5 text-sm italic leading-relaxed text-muted">&ldquo;{row.note}&rdquo;</p>
        )}

        <div className="mt-3" onClick={(e) => e.preventDefault()}>
          <Copyable
            value={row.author}
            display={`scribed by ${shortAddress(row.author, 4)}`}
            label="Copy scribe address"
          />
        </div>
      </div>
    </article>
  );

  if (linkable) {
    return (
      <Link href={`/entry?id=${encodeURIComponent(row.id)}`} className="group block">
        {inner}
      </Link>
    );
  }
  return inner;
}
