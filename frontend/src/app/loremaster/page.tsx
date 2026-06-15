'use client';

import Link from 'next/link';
import { ExternalLink, PenLine, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { KindSigil } from '@/components/Sigil';
import { Reveal, Stagger, StaggerItem } from '@/components/Reveal';
import { FAUCET, KINDS } from '@/lib/contract';
import { kindMeta } from '@/lib/format';

export default function LoremasterPage() {
  return (
    <div>
      <PageHeader
        art="/art/loremaster.jpg"
        kicker="The keeper of the canon"
        title="The Loremaster"
        subtitle="An on-chain artificial intelligence that reads every new entry against the whole of the established world, then rules whether the canon can hold it. No mortal hand decides; the ruling is sealed by consensus."
        height="h-[clamp(260px,44vh,420px)]"
      />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        {/* doctrine opening */}
        <Reveal>
          <p className="label-caps">The doctrine</p>
          <div className="hairline-rule my-4 w-40" />
          <div className="dropcap measure text-lg leading-[1.9] text-parchment">
            <p>
              A palimpsest is a page written over many times, each hand leaving its mark beneath the
              next. So it is here. Many authors write one world, and a single keeper holds it whole.
              When you scribe an entry, the Loremaster does not judge your prose for beauty. It reads
              your entry as untrusted authorship, never as instruction, and asks one question only:
              can this stand without breaking what is already true?
            </p>
            <p className="mt-5">
              From that question come three rulings. An entry coherent with the world is
              <span className="text-canon"> canonized</span> and enters the encyclopedia. An entry
              that plausibly belongs yet contradicts an existing leaf is filed as
              <span className="text-apocrypha"> apocrypha</span>, kept but contested, named against
              the canon it opposes. An entry that is incoherent, empty of lore, or an attempt to
              subvert the keeper is <span className="text-muted">struck from the record</span>.
            </p>
          </div>
        </Reveal>

        {/* how consensus works */}
        <Reveal delay={0.05}>
          <section className="mt-14">
            <p className="label-caps">How the ruling is sealed</p>
            <h2 className="mt-2 font-display text-3xl text-parchment">No single hand decides</h2>
            <div className="measure mt-4 space-y-4 text-base leading-relaxed text-muted">
              <p>
                A leader drafts the ruling first, weighing your entry against a digest of the most
                recent canon. That draft is not the verdict. Other validators independently re-run
                the very same judgement, and the network compares their results.
              </p>
              <p>
                The comparison is deliberate, not literal. Validators agree when they reach the same
                ruling and a consistency score within tolerance of one another. The scores are never
                required to match exactly, because two honest readings of the same lore will differ
                by a little. The keeper is never compared by strict equality; it is compared by
                meaning and by a margin. Only when enough validators concur is the ruling sealed on
                chain.
              </p>
            </div>
          </section>
        </Reveal>

        {/* three principles as illuminated rows */}
        <Reveal delay={0.08}>
          <Stagger className="mt-10 space-y-4">
            <StaggerItem>
              <Principle
                icon={<Sparkles size={20} aria-hidden />}
                title="It judges consistency, not taste"
                body="The Loremaster cares whether your entry holds with the world, not whether it is finely written. A plain truth stands; a beautiful contradiction does not."
              />
            </StaggerItem>
            <StaggerItem>
              <Principle
                icon={<Scale size={20} aria-hidden />}
                title="It compares by ruling and margin"
                body="Validators must reach the same ruling and a score within tolerance. Agreement is measured by meaning, never by strict equality, so honest variance does not break consensus."
              />
            </StaggerItem>
            <StaggerItem>
              <Principle
                icon={<ShieldCheck size={20} aria-hidden />}
                title="Your words are authorship, never command"
                body="An entry that tries to rewrite the keeper's rules or impersonate it is struck. The lore you set down is read as lore, and nothing more."
              />
            </StaggerItem>
          </Stagger>
        </Reveal>

        {/* the five kinds */}
        <Reveal delay={0.1}>
          <section className="mt-14">
            <p className="label-caps">The five kinds of entry</p>
            <h2 className="mt-2 font-display text-3xl text-parchment">What may be set down</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {KINDS.map((k) => {
                const meta = kindMeta(k);
                return (
                  <div
                    key={k}
                    className="vellum gilt filigree flex items-center gap-4 rounded-lg p-4"
                  >
                    <KindSigil kind={k} size={44} />
                    <div>
                      <p className="font-display text-xl" style={{ color: meta.color }}>
                        {meta.label}
                      </p>
                      <p className="text-sm text-muted">{meta.gloss}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        {/* fees */}
        <Reveal delay={0.12}>
          <section className="vellum vellum-tex gilt filigree relative mt-14 rounded-xl p-7 text-center">
            <p className="label-caps">The cost of scribing</p>
            <h2 className="mt-2 font-display text-3xl text-parchment">Only network fees</h2>
            <p className="measure mx-auto mt-3 text-base leading-relaxed text-muted">
              Scribing an entry pays only the network fee for an AI transaction, and most of that
              reserve is refunded once the ruling settles. There is no charge to read the Codex, the
              Chronicle, or the Canon Map. If your wallet sits below the fee reserve, claim test GEN
              from the faucet.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/scribe"
                className="glow-gold inline-flex min-h-[44px] items-center gap-2 rounded-md bg-gold px-6 text-sm font-semibold text-void transition-transform hover:scale-[1.02]"
              >
                <PenLine size={16} aria-hidden />
                Scribe an entry
              </Link>
              <a
                href={FAUCET}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-[var(--hairline-strong)] px-6 text-sm font-semibold text-astral transition-colors hover:bg-[rgba(107,140,255,0.08)]"
              >
                Open the faucet
                <ExternalLink size={13} aria-hidden />
              </a>
            </div>
          </section>
        </Reveal>
      </article>
    </div>
  );
}

function Principle({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="vellum gilt flex items-start gap-4 rounded-lg p-5">
      <span className="mt-0.5 text-gold">{icon}</span>
      <div>
        <h3 className="font-display text-xl text-parchment">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </div>
  );
}
