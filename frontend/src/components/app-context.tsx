'use client';

import { createContext, useContext } from 'react';
import { WalletState } from '@/hooks/useWallet';
import { ToastController } from './Toast';

export interface AppContextValue {
  wallet: WalletState;
  toasts: ToastController;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within the SiteChrome provider');
  }
  return ctx;
}
