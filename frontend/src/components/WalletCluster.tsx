'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, LogOut, PenLine } from 'lucide-react';
import { WalletState } from '@/hooks/useWallet';
import { EXPLORER, FAUCET } from '@/lib/contract';
import { shortAddress } from '@/lib/format';
import { Copyable } from './Copyable';

export interface WalletClusterProps {
  wallet: WalletState;
}

export function WalletCluster({ wallet }: WalletClusterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!wallet.address) {
    return (
      <button
        type="button"
        onClick={wallet.connect}
        disabled={wallet.connecting}
        className="glow-gold inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[rgba(216,178,90,0.4)] bg-[rgba(216,178,90,0.08)] px-4 text-sm font-semibold text-gold transition-colors hover:bg-[rgba(216,178,90,0.16)] disabled:opacity-60"
      >
        <PenLine size={16} aria-hidden />
        {wallet.connecting ? 'Opening' : 'Connect'}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-[var(--hairline-strong)] bg-surface-2/80 px-3 text-sm text-parchment transition-colors hover:border-[rgba(216,178,90,0.5)]"
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: wallet.onChain ? 'var(--canon)' : 'var(--apocrypha)' }}
          aria-hidden
        />
        <span className="font-mono tabular">{shortAddress(wallet.address)}</span>
        <ChevronDown
          size={15}
          aria-hidden
          className={open ? 'rotate-180 transition' : 'transition'}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="vellum gilt absolute right-0 z-[90] mt-2 w-72 rounded-lg p-4"
          >
            <p className="label-caps">Your hand</p>
            <div className="mt-1.5">
              <Copyable value={wallet.address} display={wallet.address} label="Copy your address" />
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[var(--hairline)] pt-3">
              <span className="text-xs text-muted">Balance</span>
              <span className="font-mono tabular text-sm text-gold">
                {wallet.balance ?? '0'} GEN
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted">Network</span>
              <span
                className="text-xs"
                style={{ color: wallet.onChain ? 'var(--canon)' : 'var(--apocrypha)' }}
              >
                {wallet.onChain ? 'Bradbury Testnet' : 'Wrong network'}
              </span>
            </div>

            <a
              href={FAUCET}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-astral hover:underline"
            >
              Claim test GEN at the faucet
              <ExternalLink size={11} aria-hidden />
            </a>

            <a
              href={`${EXPLORER}/address/${wallet.address}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-muted hover:text-parchment"
            >
              View on explorer
              <ExternalLink size={11} aria-hidden />
            </a>

            <button
              type="button"
              onClick={() => {
                wallet.disconnect();
                setOpen(false);
              }}
              className="mt-4 inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-md border border-[var(--hairline-strong)] text-sm text-muted transition-colors hover:border-[rgba(210,96,122,0.5)] hover:text-apocrypha"
            >
              <LogOut size={15} aria-hidden />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
