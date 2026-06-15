'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { CONTRACT_ADDRESS, DEPLOY_TX, EXPLORER, FAUCET } from '@/lib/contract';
import { shortAddress } from '@/lib/format';
import { AppContext } from './app-context';
import { ToastStack, useToasts } from './Toast';
import { WalletCluster } from './WalletCluster';
import { WaxSeal } from './Sigil';

const NAV = [
  { href: '/codex', label: 'Codex' },
  { href: '/scribe', label: 'Scribe' },
  { href: '/canon-map', label: 'Canon Map' },
  { href: '/apocrypha', label: 'Apocrypha' },
  { href: '/chronicle', label: 'Chronicle' },
  { href: '/loremaster', label: 'Loremaster' },
];

function NavTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative px-1 py-1 text-sm transition-colors ${
        active ? 'text-gold' : 'text-muted hover:text-parchment'
      }`}
    >
      <span className="label-caps" style={{ letterSpacing: '0.18em', fontSize: '0.78rem' }}>
        {label}
      </span>
      {active && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 right-0 h-px"
          style={{ background: 'var(--gold)' }}
        />
      )}
    </Link>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const toasts = useToasts();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <AppContext.Provider value={{ wallet, toasts }}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-surface-2 focus:px-3 focus:py-2 focus:text-sm focus:text-gold"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-[100] border-b border-[var(--hairline)] bg-[rgba(12,10,20,0.82)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-codex items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="PALIMPSEST home">
            <WaxSeal size={32} />
            <span className="font-display text-xl tracking-[0.2em] text-parchment transition-colors group-hover:text-gold">
              PALIMPSEST
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <NavTab key={n.href} href={n.href} label={n.label} active={isActive(n.href)} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <WalletCluster wallet={wallet} />
            </div>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="Open navigation"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--hairline-strong)] text-parchment lg:hidden"
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            className="fixed inset-0 z-[140] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-[rgba(6,5,12,0.8)] backdrop-blur-sm"
              onClick={() => setDrawer(false)}
              aria-hidden
            />
            <motion.nav
              aria-label="Primary mobile"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="vellum vellum-tex absolute right-0 top-0 flex h-full w-[min(86vw,360px)] flex-col gap-1 border-l border-[var(--hairline)] p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg tracking-[0.2em] text-gold">PALIMPSEST</span>
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Close navigation"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--hairline-strong)] text-parchment"
                >
                  <X size={20} aria-hidden />
                </button>
              </div>
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`rounded-md px-3 py-3 font-display text-lg tracking-wide transition-colors ${
                    isActive(n.href)
                      ? 'bg-[rgba(216,178,90,0.1)] text-gold'
                      : 'text-parchment hover:bg-[rgba(216,178,90,0.06)]'
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-6 border-t border-[var(--hairline)] pt-5">
                <WalletCluster wallet={wallet} />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main id="main" className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      <Colophon />

      <ToastStack toasts={toasts.toasts} onDismiss={toasts.dismiss} />
    </AppContext.Provider>
  );
}

function Colophon() {
  return (
    <footer className="relative border-t border-[var(--hairline)] bg-[rgba(12,10,20,0.7)] px-4 py-10 text-center">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
        <WaxSeal size={30} />
        <p className="label-caps">Set down on GenLayer Bradbury Testnet</p>
        <div className="hairline-rule my-1 w-40" />
        <p className="text-sm italic text-muted">
          One world, many hands. The canon is kept whole by the Loremaster, sealed by consensus.
        </p>
        <div className="mt-2 flex flex-col items-center gap-1 font-mono text-[11px] text-faint">
          <span>GenLayer Bradbury Testnet</span>
          <a
            href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-parchment"
          >
            contract {shortAddress(CONTRACT_ADDRESS, 6)}
          </a>
          <a
            href={`${EXPLORER}/tx/${DEPLOY_TX}`}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-parchment"
          >
            deploy {shortAddress(DEPLOY_TX, 6)}
          </a>
          <a
            href={FAUCET}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-parchment"
          >
            faucet
          </a>
        </div>
      </div>
    </footer>
  );
}
