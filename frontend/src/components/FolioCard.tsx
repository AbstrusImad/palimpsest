'use client';

import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { EntrySummary } from '@/lib/contract';
import { kindMeta, shortAddress } from '@/lib/format';
import { KindSigil } from './Sigil';

export interface FolioCardProps {
  entry: EntrySummary;
  shadowed?: boolean;
}

// A single manuscript folio card. The shadowed variant is used in the Apocrypha
// where the canon is contested.
export function FolioCard({ entry, shadowed }: FolioCardProps) {
  const meta = kindMeta(entry.kind);
  const seal = entry.status === 'CANON' ? 'var(--canon)' : 'var(--apocrypha)';
  const sealLabel = entry.status === 'CANON' ? 'Canon' : 'Apocrypha';

  return (
    <Link
      href={`/entry?id=${encodeURIComponent(entry.id)}`}
      className="group block h-full"
      aria-label={`Read ${entry.title}`}
    >
      <article
        className={`vellum vellum-tex gilt filigree relative flex h-full flex-col rounded-lg p-5 transition-transform duration-300 group-hover:-translate-y-1 ${
          shadowed ? 'opacity-95' : ''
        }`}
        style={shadowed ? { background: 'linear-gradient(180deg, rgba(20,16,28,0.95), rgba(10,8,16,0.96))' } : undefined}
      >
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <KindSigil kind={entry.kind} size={42} />
            <div>
              <span className="label-caps" style={{ color: meta.color }}>
                {meta.label}
              </span>
              <p className="font-mono text-[11px] text-faint">{meta.gloss}</p>
            </div>
          </div>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]"
            style={{ color: seal, borderColor: seal }}
          >
            {sealLabel}
          </span>
        </div>

        <h3 className="relative mt-4 font-display text-2xl leading-tight text-parchment transition-colors group-hover:text-gold">
          {entry.title}
        </h3>

        <div className="relative mt-auto flex items-center justify-between pt-5 text-xs text-muted">
          <span className="font-mono">by {shortAddress(entry.author, 4)}</span>
          <span className="flex items-center gap-3">
            {entry.links.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Link2 size={12} aria-hidden />
                {entry.links.length}
              </span>
            )}
            <span className="font-mono tabular" style={{ color: meta.color }}>
              {entry.score}/100
            </span>
          </span>
        </div>
      </article>
    </Link>
  );
}
