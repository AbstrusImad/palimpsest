'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { EmptyState, ErrorState, LoadingNotice } from '@/components/States';
import { CanonGraph } from '@/components/CanonGraph';
import { useLibraryData } from '@/hooks/useContractData';
import { KINDS } from '@/lib/contract';
import { kindMeta } from '@/lib/format';

export default function CanonMapPage() {
  return (
    <DataErrorBoundary>
      <CanonMap />
    </DataErrorBoundary>
  );
}

function CanonMap() {
  const { entries, loading, error, diagnostic, refresh } = useLibraryData();
  const canon = useMemo(() => entries.filter((e) => e.status === 'CANON'), [entries]);
  const linkCount = useMemo(
    () => canon.reduce((acc, e) => acc + e.links.filter((l) => canon.some((c) => c.id === l)).length, 0),
    [canon],
  );

  return (
    <div>
      <PageHeader
        art="/art/atlas.jpg"
        kicker="The living atlas"
        title="The Canon Map"
        subtitle="Every canon entry as a star, every cross-link as a filament. Trace how the world coheres, then touch a node to read the leaf it marks."
      />

      <section className="mx-auto max-w-codex px-4 py-12 sm:px-6">
        {/* legend */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {KINDS.map((k) => {
              const meta = kindMeta(k);
              return (
                <span key={k} className="inline-flex items-center gap-2 text-xs text-muted">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                    aria-hidden
                  />
                  {meta.label}
                </span>
              );
            })}
          </div>
          {!loading && !error && canon.length > 0 && (
            <p className="font-mono text-xs text-faint">
              {canon.length} nodes, {linkCount} filaments
            </p>
          )}
        </div>

        <div className="vellum gilt relative overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/palimpsest/art/atlas.jpg" alt="" className="backdrop-img opacity-20" />
          <div
            className="absolute inset-0 z-[1]"
            style={{ background: 'linear-gradient(180deg, rgba(12,10,20,0.7), rgba(12,10,20,0.86))' }}
            aria-hidden
          />

          <div className="relative z-[3] p-2 sm:p-4">
            {error ? (
              <div className="py-16">
                <ErrorState message={error} diagnostic={diagnostic} onRetry={refresh} />
              </div>
            ) : loading ? (
              <div className="flex h-[clamp(420px,64vh,720px)] items-center justify-center">
                <LoadingNotice label="Charting the constellations of canon" />
              </div>
            ) : canon.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title="No constellation has formed"
                  body="The atlas is dark. Once entries are canonized and cross-linked, their threads will appear here as a living map of the world."
                />
              </div>
            ) : (
              <CanonGraph entries={canon} />
            )}
          </div>
        </div>

        {!loading && !error && canon.length > 0 && (
          <p className="mt-4 text-center text-sm text-muted">
            Larger stars are woven into more of the world. Touch any to open its folio.
          </p>
        )}
      </section>
    </div>
  );
}
