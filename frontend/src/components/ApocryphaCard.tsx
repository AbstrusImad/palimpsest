'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { EntrySummary, fetchEntry } from '@/lib/contract';
import { kindMeta, shortAddress } from '@/lib/format';
import { KindSigil } from './Sigil';

export interface ApocryphaCardProps {
  entry: EntrySummary;
}

// A shadowed, contested folio. It resolves the full record to surface the canon
// it contradicts and the Loremaster's note, which the summary view omits.
export function ApocryphaCard({ entry }: ApocryphaCardProps) {
  const meta = kindMeta(entry.kind);
  const [contradicts, setContradicts] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    fetchEntry(entry.id)
      .then((full) => {
        if (!alive.current) return;
        if (full.exists) {
          setContradicts(full.contradicts);
          setNote(full.note);
        }
      })
      .catch(() => {
        /* leave the contradiction unresolved; the seal still reads apocrypha */
      });
    return () => {
      alive.current = false;
    };
  }, [entry.id]);

  return (
    <Link
      href={`/entry?id=${encodeURIComponent(entry.id)}`}
      className="group block h-full"
      aria-label={`Read the disputed entry ${entry.title}`}
    >
      <article
        className="filigree relative flex h-full flex-col rounded-lg border border-[rgba(210,96,122,0.28)] p-5 transition-transform duration-300 group-hover:-translate-y-1"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,16,24,0.96), rgba(12,8,14,0.97))',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 16px 38px rgba(0,0,0,0.5)',
        }}
      >
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <KindSigil kind={entry.kind} size={42} />
            <span className="label-caps" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(210,96,122,0.5)] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-apocrypha">
            <AlertTriangle size={11} aria-hidden />
            Apocrypha
          </span>
        </div>

        <h3 className="relative mt-4 font-display text-2xl leading-tight text-parchment transition-colors group-hover:text-apocrypha">
          {entry.title}
        </h3>

        {note && (
          <p className="relative mt-2 line-clamp-3 text-sm italic leading-relaxed text-muted">
            &ldquo;{note}&rdquo;
          </p>
        )}

        <div className="relative mt-auto pt-5">
          {contradicts ? (
            <p className="text-xs text-apocrypha">
              <span className="text-faint">contradicts</span>{' '}
              <span className="font-display text-base text-apocrypha">{contradicts}</span>
            </p>
          ) : (
            <p className="text-xs text-faint">stands in tension with the established canon</p>
          )}
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span className="font-mono">by {shortAddress(entry.author, 4)}</span>
            <span className="font-mono tabular text-apocrypha">{entry.score}/100</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
