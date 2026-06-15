'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChronicleEntry,
  Entry,
  EntrySummary,
  fetchChronicle,
  fetchEntries,
  fetchEntry,
  fetchStats,
  Stats,
} from '@/lib/contract';

const POLL_MS = 90_000;

interface Classified {
  message: string;
  diagnostic: boolean;
}

function classifyError(e: unknown): Classified {
  const msg = String(e);
  if (/contract not found|execution reverted|no contract|not found/i.test(msg)) {
    return {
      message:
        'No codex exists at the configured address on Bradbury, the deployment must be repaired.',
      diagnostic: true,
    };
  }
  if (/rate limit|429|too many/i.test(msg)) {
    return { message: 'The network is rate limiting reads. Retrying shortly.', diagnostic: false };
  }
  return {
    message: 'The scriptorium is unreachable. Check your connection and retry.',
    diagnostic: false,
  };
}

// ---- stats only (home frontispiece) --------------------------------------

export interface StatsData {
  stats: Stats | null;
  featured: EntrySummary[];
  loading: boolean;
  error: string | null;
  diagnostic: boolean;
  refresh: () => Promise<void>;
  setBusy: (busy: boolean) => void;
}

export function useStatsData(): StatsData {
  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<EntrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);

  const alive = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async () => {
    try {
      const [st, entries] = await Promise.all([fetchStats(), fetchEntries(0)]);
      if (!alive.current) return;
      setStats(st);
      const canon = entries.filter((e) => e.status === 'CANON');
      setFeatured(canon.slice(-3).reverse());
      setError(null);
      setDiagnostic(false);
    } catch (e) {
      if (!alive.current) return;
      const c = classifyError(e);
      setError(c.message);
      setDiagnostic(c.diagnostic);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);
  const setBusy = useCallback((b: boolean) => {
    busy.current = b;
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(() => {
      if (busy.current) return;
      load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  return { stats, featured, loading, error, diagnostic, refresh, setBusy };
}

// ---- full library (codex / canon-map / apocrypha) ------------------------

export interface LibraryData {
  entries: EntrySummary[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  diagnostic: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setBusy: (busy: boolean) => void;
}

export function useLibraryData(): LibraryData {
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);

  const alive = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async () => {
    try {
      const first = await fetchEntries(0);
      if (!alive.current) return;
      setEntries(first);
      setHasMore(first.length >= 20);
      setError(null);
      setDiagnostic(false);
    } catch (e) {
      if (!alive.current) return;
      const c = classifyError(e);
      setError(c.message);
      setDiagnostic(c.diagnostic);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const start = entries.length;
      const next = await fetchEntries(start);
      if (!alive.current) return;
      setEntries((prev) => {
        const seen = new Set(prev.map((e) => e.id));
        return [...prev, ...next.filter((e) => !seen.has(e.id))];
      });
      setHasMore(next.length >= 20);
    } catch {
      /* keep what we have; toast handled by caller pages if needed */
    } finally {
      if (alive.current) setLoadingMore(false);
    }
  }, [entries.length, loadingMore]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);
  const setBusy = useCallback((b: boolean) => {
    busy.current = b;
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(() => {
      if (busy.current) return;
      load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  return {
    entries,
    loading,
    loadingMore,
    hasMore,
    error,
    diagnostic,
    refresh,
    loadMore,
    setBusy,
  };
}

// ---- single entry (reading page) -----------------------------------------

export interface EntryData {
  entry: Entry | null;
  resolved: Record<string, string>;
  loading: boolean;
  error: string | null;
  diagnostic: boolean;
  refresh: () => Promise<void>;
}

export function useEntryData(id: string | null): EntryData {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);

  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!id) {
      setEntry(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const e = await fetchEntry(id);
      if (!alive.current) return;
      setEntry(e);
      setError(null);
      setDiagnostic(false);
      // resolve linked titles and the contradicted entry for readable cross-links
      if (e.exists) {
        const ids = Array.from(new Set(e.links.filter(Boolean)));
        const map: Record<string, string> = {};
        await Promise.all(
          ids.map(async (lid) => {
            try {
              const le = await fetchEntry(lid);
              if (le.exists) map[lid] = le.title;
            } catch {
              /* leave unresolved */
            }
          }),
        );
        if (alive.current) setResolved(map);
      }
    } catch (e) {
      if (!alive.current) return;
      const c = classifyError(e);
      setError(c.message);
      setDiagnostic(c.diagnostic);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [id]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);

  return { entry, resolved, loading, error, diagnostic, refresh };
}

// ---- chronicle (recent rulings) ------------------------------------------

export interface ChronicleData {
  rulings: ChronicleEntry[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  diagnostic: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setBusy: (busy: boolean) => void;
}

export function useChronicleData(): ChronicleData {
  const [rulings, setRulings] = useState<ChronicleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);

  const alive = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async () => {
    try {
      const first = await fetchChronicle(0);
      if (!alive.current) return;
      setRulings(first);
      setHasMore(first.length >= 20);
      setError(null);
      setDiagnostic(false);
    } catch (e) {
      if (!alive.current) return;
      const c = classifyError(e);
      setError(c.message);
      setDiagnostic(c.diagnostic);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const start = rulings.length;
      const next = await fetchChronicle(start);
      if (!alive.current) return;
      setRulings((prev) => [...prev, ...next]);
      setHasMore(next.length >= 20);
    } catch {
      /* keep what we have */
    } finally {
      if (alive.current) setLoadingMore(false);
    }
  }, [rulings.length, loadingMore]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);
  const setBusy = useCallback((b: boolean) => {
    busy.current = b;
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(() => {
      if (busy.current) return;
      load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  return {
    rulings,
    loading,
    loadingMore,
    hasMore,
    error,
    diagnostic,
    refresh,
    loadMore,
    setBusy,
  };
}
