'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

export interface PageHeaderProps {
  art: string;
  kicker: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
  height?: string;
}

// An illuminated route header: the generated plate framed with gold corners and
// an aged edge, the title set as a manuscript heading over a darkened crop.
export function PageHeader({
  art,
  kicker,
  title,
  subtitle,
  children,
  height = 'h-[clamp(220px,38vh,360px)]',
}: PageHeaderProps) {
  const reduce = useReducedMotion();
  return (
    <section className={`relative ${height} w-full overflow-hidden border-b border-[var(--hairline)]`}>
      {reduce ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/palimpsest${art}`} alt="" className="backdrop-img opacity-85" />
      ) : (
        <motion.img
          src={`/palimpsest${art}`}
          alt=""
          className="backdrop-img opacity-85"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      )}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 12%, transparent 48%, rgba(12,10,20,0.4) 100%), linear-gradient(180deg, rgba(12,10,20,0.12), rgba(12,10,20,0.88))',
        }}
        aria-hidden
      />
      <div className="relative z-[3] mx-auto flex h-full max-w-codex flex-col justify-end px-4 pb-8 sm:px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <p className="label-caps">{kicker}</p>
          <h1 className="mt-2 font-display text-4xl text-parchment text-shadow-deep sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="measure mt-3 text-base leading-relaxed text-muted sm:text-lg">{subtitle}</p>
          {children && <div className="mt-5">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}
