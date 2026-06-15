'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { EmptyState, ErrorState, FolioSkeleton, LoadingNotice } from '@/components/States';
import { FolioCard } from '@/components/FolioCard';
import { Stagger, StaggerItem } from '@/components/Reveal';
import { useLibraryData } from '@/hooks/useContractData';
import { KINDS, Kind } from '@/lib/contract';
import { kindMeta } from '@/lib/format';

type Filter = 'ALL' | Kind;

export default function CodexPage() {
  return (
    <DataErrorBoundary>
      <Codex />
    </DataErrorBoundary>
  );
}

function Codex() {
  const { entries, loading, loadingMore, hasMore, error, diagnostic, refresh, loadMore } =
    useLibraryData();
  const [filter, setFilter] = useState<Filter>('ALL');

  const canon = useMemo(() => entries.filter((e) => e.status === 'CANON'), [entries]);
  const shown = useMemo(
    () => (filter === 'ALL' ? canon : canon.filter((e) => e.kind === filter)),
    [canon, filter],
  );

  return (
    <div>
      <PageHeader
        art="/art/cover.jpg"
        kicker="The illuminated library"
        title="The Codex"
        subtitle="Every entry the Loremaster has held as canon, cross-linked into one evolving world. Filter the shelves by kind, then open a folio to read it whole."
      />

      <section className="mx-auto max-w-codex px-4 py-12 sm:px-6">
        {/* filter rail */}
        <div className="mb-8 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by kind">
          <FilterTab active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All kinds" />
          {KINDS.map((k) => (
            <FilterTab
              key={k}
              active={filter === k}
              onClick={() => setFilter(k)}
              label={kindMeta(k).label}
              color={kindMeta(k).color}
            />
          ))}
        </div>

        {error ? (
          <ErrorState message={error} diagnostic={diagnostic} onRetry={refresh} />
        ) : loading ? (
          <div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FolioSkeleton />
              <FolioSkeleton />
              <FolioSkeleton />
              <FolioSkeleton />
              <FolioSkeleton />
              <FolioSkeleton />
            </div>
            <div className="mt-6">
              <LoadingNotice label="Drawing the folios from the shelves" />
            </div>
          </div>
        ) : shown.length === 0 ? (
          filter === 'ALL' ? (
            <EmptyState
              title="The vellum is blank"
              body="No lore has yet been set down. No entry has been canonized, so the shelves stand empty, awaiting the first true hand."
            />
          ) : (
            <EmptyState
              title={`No ${kindMeta(filter as Kind).label.toLowerCase()} stands in canon`}
              body="The Loremaster has canonized nothing of this kind yet. Choose another shelf, or scribe one into being."
            />
          )
        ) : (
          <>
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((e) => (
                <StaggerItem key={e.id}>
                  <FolioCard entry={e} />
                </StaggerItem>
              ))}
            </Stagger>

            {hasMore && filter === 'ALL' && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-7 text-sm font-semibold text-gold transition-colors hover:bg-[rgba(216,178,90,0.1)] disabled:opacity-60"
                >
                  {loadingMore && <Loader2 size={16} className="animate-spin" aria-hidden />}
                  {loadingMore ? 'Turning the leaves' : 'Load more folios'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] rounded-full border px-4 text-xs uppercase tracking-[0.16em] transition-colors ${
        active
          ? 'border-[var(--hairline-strong)] bg-[rgba(216,178,90,0.12)] text-gold'
          : 'border-[var(--hairline)] text-muted hover:text-parchment'
      }`}
      style={active && color ? { color, borderColor: color } : undefined}
    >
      {label}
    </button>
  );
}
