'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, PenLine } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ConsensusTheater } from '@/components/ConsensusTheater';
import { KindSigil } from '@/components/Sigil';
import { useApp } from '@/components/app-context';
import { useTransaction } from '@/hooks/useTransaction';
import { KINDS, Kind, LIMITS, LeaderDraft, scribe, EXPLORER } from '@/lib/contract';
import { kindMeta, rulingMeta, scoreBand } from '@/lib/format';

interface Outcome {
  ruling: LeaderDraft['ruling'];
  score?: number;
  note?: string;
  contradicts?: string;
  newId: string | null;
}

export default function ScribePage() {
  const { wallet, toasts } = useApp();
  const tx = useTransaction();

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<Kind>('FIGURE');
  const [body, setBody] = useState('');
  const [refs, setRefs] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const titleLen = title.trim().length;
  const bodyLen = body.trim().length;
  const titleOk = titleLen >= LIMITS.title.min && titleLen <= LIMITS.title.max;
  const bodyOk = bodyLen >= LIMITS.body.min && bodyLen <= LIMITS.body.max;
  const formValid = titleOk && bodyOk;

  const busy =
    tx.state.phase === 'wallet' ||
    tx.state.phase === 'submitted' ||
    tx.state.phase === 'consensus';
  const theaterOpen = tx.state.phase === 'consensus' || tx.state.phase === 'submitted';

  const submit = () => {
    if (!wallet.address) {
      toasts.push({ kind: 'info', title: 'Connect your hand', message: 'A wallet is needed to scribe an entry.' });
      wallet.connect();
      return;
    }
    if (!formValid) return;
    setConfirmOpen(true);
  };

  const confirmScribe = () => {
    setConfirmOpen(false);
    if (!wallet.address) return;
    setOutcome(null);
    const loadingId = toasts.push({
      kind: 'loading',
      title: 'The Loremaster reads',
      message: 'Your entry is staged for judgement under consensus.',
    });

    tx.run({
      account: wallet.address,
      send: (client) => scribe(client, title.trim(), kind, body.trim(), refs.trim()),
      onConfirmed: (_status, draft) => {
        const ruling = draft?.ruling ?? 'CANONIZE';
        const meta = rulingMeta(ruling);
        // A canonized or apocryphal entry is stored; rejects are not.
        const stored = ruling !== 'REJECT';
        setOutcome({
          ruling,
          score: draft?.score,
          note: draft?.note,
          contradicts: draft?.contradicts,
          newId: null,
        });
        toasts.update(loadingId, {
          kind: ruling === 'REJECT' ? 'info' : 'success',
          title: meta.label,
          message:
            ruling === 'CANONIZE'
              ? 'Your entry has entered the canon.'
              : ruling === 'APOCRYPHA'
                ? 'Your entry is filed among the apocrypha.'
                : 'The Loremaster struck the entry from the record.',
          hash: tx.state.hash ?? undefined,
        });
        if (stored) {
          setTitle('');
          setBody('');
          setRefs('');
        }
      },
    }).catch(() => {
      /* errors surfaced via tx.state */
    });
  };

  // surface a transaction error as a toast, once per failure
  const lastError = useRef<string | null>(null);
  useEffect(() => {
    if (tx.state.phase === 'error' && tx.state.error && lastError.current !== tx.state.error) {
      lastError.current = tx.state.error;
      toasts.push({
        kind: 'error',
        title: 'The scribing faltered',
        message: tx.state.error,
        onRetry: () => {
          tx.reset();
          lastError.current = null;
          setConfirmOpen(true);
        },
      });
    }
    if (tx.state.phase !== 'error') lastError.current = null;
  }, [tx.state.phase, tx.state.error, toasts, tx]);

  return (
    <div>
      <PageHeader
        art="/art/scriptorium.jpg"
        kicker="The scriptorium"
        title="Scribe an entry"
        subtitle="Set down a new thread of the world. The Loremaster will weigh it against the canon and rule it canon, apocrypha, or struck. Only network fees are paid, and those are mostly refunded."
      />

      <ConsensusTheater open={theaterOpen} liveStatus={tx.state.liveStatus} draft={tx.state.draft} />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <AnimatePresence mode="wait">
          {outcome ? (
            <RulingReveal
              key="ruling"
              outcome={outcome}
              onAgain={() => {
                setOutcome(null);
                tx.reset();
              }}
            />
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="vellum vellum-tex gilt filigree relative rounded-xl p-6 sm:p-8"
            >
              {/* title */}
              <label htmlFor="title" className="label-caps block">
                Title of the entry
              </label>
              <input
                id="title"
                type="text"
                value={title}
                maxLength={LIMITS.title.max}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Drowned Library of Vael"
                className="mt-2 w-full rounded-md border border-[var(--hairline)] bg-[rgba(12,10,20,0.6)] px-4 py-3 font-display text-xl text-parchment outline-none transition-colors focus:border-[var(--gold)]"
              />
              <div className="mt-1.5 flex items-center justify-between text-xs">
                <span className="text-faint">
                  A title must be unique across the whole canon.
                </span>
                <span className={titleLen > LIMITS.title.max ? 'text-apocrypha' : 'text-muted'}>
                  {titleLen}/{LIMITS.title.max}
                </span>
              </div>

              {/* kind */}
              <div className="mt-7">
                <span className="label-caps block">Kind of entry</span>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {KINDS.map((k) => {
                    const meta = kindMeta(k);
                    const active = kind === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        aria-pressed={active}
                        className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                          active
                            ? 'bg-[rgba(216,178,90,0.08)]'
                            : 'border-[var(--hairline)] hover:bg-[rgba(216,178,90,0.04)]'
                        }`}
                        style={active ? { borderColor: meta.color } : undefined}
                      >
                        <KindSigil kind={k} size={34} />
                        <span
                          className="text-xs uppercase tracking-[0.12em]"
                          style={{ color: active ? meta.color : 'var(--muted)' }}
                        >
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* body */}
              <div className="mt-7">
                <label htmlFor="body" className="label-caps block">
                  The entry, set down
                </label>
                <textarea
                  id="body"
                  value={body}
                  maxLength={LIMITS.body.max}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  placeholder="Write the lore as it should be remembered. The Loremaster reads it as authorship, never as instruction, and judges only whether it holds with the established world."
                  className="mt-2 w-full resize-y rounded-md border border-[var(--hairline)] bg-[rgba(236,227,208,0.04)] px-4 py-3 text-base leading-relaxed text-parchment outline-none transition-colors focus:border-[var(--gold)]"
                  style={{ fontFamily: 'var(--font-body), serif' }}
                />
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className={bodyOk || bodyLen === 0 ? 'text-faint' : 'text-apocrypha'}>
                    {bodyLen < LIMITS.body.min
                      ? `At least ${LIMITS.body.min} characters of true lore.`
                      : 'The measure is good.'}
                  </span>
                  <span className={bodyLen > LIMITS.body.max ? 'text-apocrypha' : 'text-muted'}>
                    {bodyLen}/{LIMITS.body.max}
                  </span>
                </div>
              </div>

              {/* refs */}
              <div className="mt-7">
                <label htmlFor="refs" className="label-caps block">
                  Cross-link to existing entries
                  <span className="ml-2 lowercase tracking-normal text-faint">optional</span>
                </label>
                <input
                  id="refs"
                  type="text"
                  value={refs}
                  onChange={(e) => setRefs(e.target.value)}
                  placeholder="Titles, comma separated, e.g. The Drowned Library of Vael, The Age of Salt"
                  className="mt-2 w-full rounded-md border border-[var(--hairline)] bg-[rgba(12,10,20,0.6)] px-4 py-3 text-base text-parchment outline-none transition-colors focus:border-[var(--gold)]"
                />
                <p className="mt-1.5 text-xs text-faint">
                  Name the titles of canon entries this thread should be woven into. Unknown titles
                  are quietly ignored.
                </p>
              </div>

              {/* submit */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted">
                  {wallet.address
                    ? wallet.onChain
                      ? 'Your hand is ready on Bradbury Testnet.'
                      : 'Connect to Bradbury Testnet to scribe.'
                    : 'Connect a wallet to set down your entry.'}
                </p>
                <button
                  type="submit"
                  disabled={busy || !formValid}
                  className="glow-gold inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-gold px-7 text-base font-semibold text-void transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PenLine size={18} aria-hidden />
                  {busy ? 'The Loremaster reads' : 'Submit to the Loremaster'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Submit to the Loremaster"
        message="This submits a transaction on Bradbury Testnet. Network fees apply. Continue?"
        confirmLabel="Submit the entry"
        onConfirm={confirmScribe}
        onCancel={() => setConfirmOpen(false)}
        showFaucet
      />
    </div>
  );
}

function RulingReveal({ outcome, onAgain }: { outcome: Outcome; onAgain: () => void }) {
  const meta = rulingMeta(outcome.ruling);
  const stored = outcome.ruling !== 'REJECT';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="vellum vellum-tex gilt filigree relative rounded-xl p-8 text-center"
    >
      <p className="label-caps">The Loremaster has ruled</p>
      <div
        className="mx-auto mt-5 inline-flex h-24 w-24 items-center justify-center rounded-full border-2"
        style={{ borderColor: meta.color, boxShadow: `0 0 40px ${meta.color}44` }}
      >
        <span
          className="font-display text-3xl uppercase"
          style={{ color: meta.color }}
        >
          {outcome.ruling[0]}
        </span>
      </div>
      <h2
        className="mt-6 font-display text-4xl uppercase tracking-wide"
        style={{ color: meta.color, textShadow: `0 0 22px ${meta.color}44` }}
      >
        {outcome.ruling}
      </h2>
      <p className="mt-2 text-base text-muted">Your entry {meta.verb}.</p>

      {typeof outcome.score === 'number' && (
        <p className="mt-1 font-mono tabular text-sm" style={{ color: meta.color }}>
          consistency {outcome.score} of 100, {scoreBand(outcome.score)}
        </p>
      )}

      {outcome.note && (
        <p className="measure mx-auto mt-5 text-base italic leading-relaxed text-parchment">
          &ldquo;{outcome.note}&rdquo;
        </p>
      )}

      {outcome.ruling === 'APOCRYPHA' && outcome.contradicts && (
        <p className="mt-4 text-sm text-apocrypha">
          It contradicts: <span className="font-display text-lg">{outcome.contradicts}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {stored ? (
          <Link
            href="/codex"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-6 text-sm font-semibold text-gold transition-colors hover:bg-[rgba(216,178,90,0.1)]"
          >
            See it in the Codex
          </Link>
        ) : (
          <Link
            href="/chronicle"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-6 text-sm font-semibold text-gold transition-colors hover:bg-[rgba(216,178,90,0.1)]"
          >
            Read the Chronicle
          </Link>
        )}
        <button
          type="button"
          onClick={onAgain}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-gold px-6 text-sm font-semibold text-void transition-transform hover:scale-[1.02]"
        >
          <PenLine size={16} aria-hidden />
          Scribe another
        </button>
      </div>

      <p className="mt-5 text-xs text-faint">
        The full ruling is recorded in the Chronicle and on the{' '}
        <a href={EXPLORER} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-astral hover:underline">
          explorer <ExternalLink size={11} aria-hidden />
        </a>
        .
      </p>
    </motion.div>
  );
}
