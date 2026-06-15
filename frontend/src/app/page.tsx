'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BookOpen, PenLine } from 'lucide-react';
import { ConstellationCanvas } from '@/components/ConstellationCanvas';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { ErrorState, FolioSkeleton, LoadingNotice } from '@/components/States';
import { FolioCard } from '@/components/FolioCard';
import { Reveal, Stagger, StaggerItem } from '@/components/Reveal';
import { useStatsData } from '@/hooks/useContractData';
import { formatFigure } from '@/lib/format';

export default function HomePage() {
  return (
    <DataErrorBoundary>
      <Home />
    </DataErrorBoundary>
  );
}

function Home() {
  const reduce = useReducedMotion();
  const { stats, featured, loading, error, diagnostic, refresh } = useStatsData();

  return (
    <div>
      {/* frontispiece */}
      <section className="relative flex min-h-[88vh] w-full items-center overflow-hidden border-b border-[var(--hairline)]">
        {reduce ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/palimpsest/art/cover.jpg" alt="" className="backdrop-img opacity-90" />
        ) : (
          <motion.img
            src="/palimpsest/art/cover.jpg"
            alt=""
            className="backdrop-img opacity-90"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          />
        )}
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              'radial-gradient(115% 85% at 50% 20%, transparent 38%, rgba(12,10,20,0.5) 100%), linear-gradient(180deg, rgba(12,10,20,0.25), rgba(12,10,20,0.82))',
          }}
          aria-hidden
        />
        <ConstellationCanvas density={1.2} />

        <div className="relative z-[3] mx-auto w-full max-w-codex px-4 py-20 text-center sm:px-6">
          <motion.p
            className="label-caps"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            A shared world, kept whole by an on-chain Loremaster
          </motion.p>
          <motion.h1
            className="mx-auto mt-4 font-display text-6xl leading-[0.95] text-parchment text-shadow-deep sm:text-7xl md:text-8xl"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            PALIMPSEST
          </motion.h1>
          <motion.p
            className="measure mx-auto mt-5 text-lg italic leading-relaxed text-muted sm:text-xl"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Many hands write one world. Scribe a figure, a place, an age, an artifact, an event, and
            the Loremaster rules whether it holds the canon whole.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center justify-center gap-4"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link
              href="/codex"
              className="glow-gold inline-flex min-h-[48px] items-center gap-2 rounded-md bg-gold px-7 text-base font-semibold text-void transition-transform hover:scale-[1.03]"
            >
              <BookOpen size={18} aria-hidden />
              Read the Codex
            </Link>
            <Link
              href="/scribe"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] px-7 text-base font-semibold text-parchment transition-colors hover:bg-[rgba(216,178,90,0.08)]"
            >
              <PenLine size={18} aria-hidden />
              Scribe an entry
            </Link>
          </motion.div>
        </div>
      </section>

      {/* state of the canon */}
      <section className="mx-auto max-w-codex px-4 py-16 sm:px-6">
        <Reveal>
          <p className="label-caps text-center">The state of the canon</p>
          <div className="hairline-rule mx-auto my-4 w-48" />
        </Reveal>

        {error ? (
          <div className="mt-6">
            <ErrorState message={error} diagnostic={diagnostic} onRetry={refresh} />
          </div>
        ) : loading ? (
          <div className="mt-8">
            <LoadingNotice label="Counting the leaves of the codex" />
          </div>
        ) : (
          <Stagger className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatPlate label="Entries set down" value={stats?.entries ?? 0} accent="var(--gold)" />
            <StatPlate label="Held as canon" value={stats?.canon ?? 0} accent="var(--canon)" />
            <StatPlate
              label="Filed apocrypha"
              value={stats?.apocrypha ?? 0}
              accent="var(--apocrypha)"
            />
            <StatPlate
              label="Rulings weighed"
              value={stats?.submissions ?? 0}
              accent="var(--astral)"
            />
          </Stagger>
        )}
      </section>

      {/* featured recent canon */}
      <section className="mx-auto max-w-codex px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label-caps">Lately canonized</p>
              <h2 className="mt-1 font-display text-3xl text-parchment sm:text-4xl">
                Newest leaves of the world
              </h2>
            </div>
            <Link
              href="/codex"
              className="hidden items-center gap-1 text-sm text-astral hover:underline sm:inline-flex"
            >
              The full Codex
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </Reveal>

        {error ? null : loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FolioSkeleton />
            <FolioSkeleton />
            <FolioSkeleton />
          </div>
        ) : featured.length === 0 ? (
          <div className="vellum gilt filigree mt-8 rounded-xl p-10 text-center">
            <h3 className="font-display text-2xl text-parchment">The vellum is blank</h3>
            <p className="measure mx-auto mt-2 text-muted">
              No lore has yet been set down. Be the first hand to write the world, and the Loremaster
              will judge whether it stands as canon.
            </p>
            <Link
              href="/scribe"
              className="glow-gold mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-md bg-gold px-6 font-semibold text-void"
            >
              <PenLine size={16} aria-hidden />
              Open the scriptorium
            </Link>
          </div>
        ) : (
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <StaggerItem key={e.id}>
                <FolioCard entry={e} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  );
}

function StatPlate({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <StaggerItem>
      <div className="vellum gilt filigree relative rounded-lg p-5 text-center">
        <div
          className="font-display text-4xl tabular sm:text-5xl"
          style={{ color: accent, textShadow: `0 0 18px ${accent}33` }}
        >
          {formatFigure(value)}
        </div>
        <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">{label}</div>
      </div>
    </StaggerItem>
  );
}
