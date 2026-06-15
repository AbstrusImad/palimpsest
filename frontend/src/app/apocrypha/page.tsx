'use client';

import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { EmptyState, ErrorState, FolioSkeleton, LoadingNotice } from '@/components/States';
import { ApocryphaCard } from '@/components/ApocryphaCard';
import { Stagger, StaggerItem } from '@/components/Reveal';
import { useLibraryData } from '@/hooks/useContractData';

export default function ApocryphaPage() {
  return (
    <DataErrorBoundary>
      <Apocrypha />
    </DataErrorBoundary>
  );
}

function Apocrypha() {
  const { entries, loading, loadingMore, hasMore, error, diagnostic, refresh, loadMore } =
    useLibraryData();
  const disputed = useMemo(() => entries.filter((e) => e.status === 'APOCRYPHA'), [entries]);

  return (
    <div>
      <PageHeader
        art="/art/atlas.jpg"
        kicker="The contested leaves"
        title="The Apocrypha"
        subtitle="Entries that plausibly belong to the world yet contradict what is already written. They are kept, not erased, each marked with the canon it stands against."
      />

      <section className="mx-auto max-w-codex px-4 py-12 sm:px-6">
        {error ? (
          <ErrorState message={error} diagnostic={diagnostic} onRetry={refresh} />
        ) : loading ? (
          <div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FolioSkeleton />
              <FolioSkeleton />
              <FolioSkeleton />
            </div>
            <div className="mt-6">
              <LoadingNotice label="Gathering the disputed leaves" />
            </div>
          </div>
        ) : disputed.length === 0 ? (
          <EmptyState
            title="The canon holds, undisputed"
            body="No entry has yet been filed among the apocrypha. Every leaf set down so far sits in accord with the world, or was struck before it could take root."
          />
        ) : (
          <>
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {disputed.map((e) => (
                <StaggerItem key={e.id}>
                  <ApocryphaCard entry={e} />
                </StaggerItem>
              ))}
            </Stagger>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-7 text-sm font-semibold text-apocrypha transition-colors hover:bg-[rgba(210,96,122,0.1)] disabled:opacity-60"
                >
                  {loadingMore && <Loader2 size={16} className="animate-spin" aria-hidden />}
                  {loadingMore ? 'Turning the leaves' : 'Load more disputed leaves'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
