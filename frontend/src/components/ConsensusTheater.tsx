'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { LeaderDraft } from '@/lib/contract';
import { rulingMeta, scoreBand } from '@/lib/format';
import { ConstellationCanvas } from './ConstellationCanvas';

export interface ConsensusTheaterProps {
  open: boolean;
  liveStatus: string;
  draft: LeaderDraft | null;
}

interface Stage {
  title: string;
  subtitle: string;
}

// Map the real on-chain status into the staged deliberation of the Loremaster.
function stageFor(status: string): Stage {
  switch (status) {
    case '':
    case 'PENDING':
    case 'SUBMITTED':
      return {
        title: 'Your entry reaches the lectern',
        subtitle: 'The submission is staged. The Loremaster takes up the quill.',
      };
    case 'PROPOSING':
      return {
        title: 'The Loremaster drafts a ruling',
        subtitle: 'Your entry is weighed against the established canon, line by line.',
      };
    case 'COMMITTING':
    case 'REVEALING':
      return {
        title: 'The validators re-read the judgement',
        subtitle: 'Each independently re-runs the ruling and seals it under consensus.',
      };
    case 'LEADER_TIMEOUT':
      return {
        title: 'The Loremaster consults the elder texts',
        subtitle: 'A fresh hand takes up the ruling. Nothing is lost.',
      };
    case 'VALIDATORS_TIMEOUT':
      return {
        title: 'The council reconvenes',
        subtitle: 'The validators gather again to weigh your entry. Hold a moment.',
      };
    case 'ACCEPTED':
    case 'FINALIZED':
      return {
        title: 'The ruling is sealed',
        subtitle: 'The canon settles to its new shape.',
      };
    default:
      return {
        title: 'The entry is weighed',
        subtitle: 'Awaiting the sealed ruling from the chain.',
      };
  }
}

export function ConsensusTheater({ open, liveStatus, draft }: ConsensusTheaterProps) {
  const stage = stageFor(liveStatus);
  const draftMeta = draft ? rulingMeta(draft.ruling) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[140] flex items-center justify-center overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-[rgba(6,5,12,0.88)] backdrop-blur-md" aria-hidden />
          <ConstellationCanvas density={1.4} />

          <div className="relative z-10 mx-auto max-w-lg px-6 text-center">
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(216,178,90,0.4)] bg-[rgba(216,178,90,0.06)]">
              <Loader2 size={34} className="animate-spin text-gold" aria-hidden />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="font-display text-3xl text-parchment text-shadow-deep sm:text-4xl">
                  {stage.title}
                </h2>
                <p className="measure mx-auto mt-3 text-sm leading-relaxed text-muted">
                  {stage.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
              Live status: <span className="text-gold">{liveStatus || 'PENDING'}</span>
            </p>

            {draftMeta && draft && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="vellum mx-auto mt-6 max-w-sm rounded-lg border px-5 py-4"
                style={{ borderColor: draftMeta.color }}
              >
                <span className="block text-[10px] uppercase tracking-[0.2em] text-muted">
                  the Loremaster&apos;s draft, sealing under consensus
                </span>
                <span
                  className="mt-1 block font-display text-3xl uppercase tracking-wide"
                  style={{ color: draftMeta.color, textShadow: `0 0 18px ${draftMeta.color}55` }}
                >
                  {draft.ruling}
                </span>
                {typeof draft.score === 'number' && (
                  <span className="mt-1 block font-mono tabular text-sm" style={{ color: draftMeta.color }}>
                    consistency {draft.score} of 100, {scoreBand(draft.score)}
                  </span>
                )}
                {draft.note && (
                  <p className="mt-2 text-sm italic leading-relaxed text-parchment">
                    &ldquo;{draft.note}&rdquo;
                  </p>
                )}
              </motion.div>
            )}

            <p className="mt-7 text-xs text-muted">
              An AI ruling under consensus can take one to five minutes. Keep this page open.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
