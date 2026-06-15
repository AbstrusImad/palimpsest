import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

// Live PALIMPSEST contract on GenLayer Bradbury Testnet.
// The parent process replaces these two placeholders at deploy time.
export const CONTRACT_ADDRESS =
  '0xBf42a47665B32180De8d8977f8A9439e919860B9' as const;
export const DEPLOY_TX =
  '0x72278c99cb6a063e8037b6a0e1183b84364825e3492217ffbffb6271a45cb405' as const;
export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';

export const readClient = createClient({ chain: testnetBradbury });

export const makeWalletClient = (account: `0x${string}`) =>
  createClient({ chain: testnetBradbury, account });

export type WalletClient = ReturnType<typeof makeWalletClient>;

const ADDRESS = CONTRACT_ADDRESS as `0x${string}`;

// ---- the canon: kinds and limits mirrored from the contract --------------

export const KINDS = ['FIGURE', 'PLACE', 'AGE', 'ARTIFACT', 'EVENT'] as const;
export type Kind = (typeof KINDS)[number];

export const LIMITS = {
  title: { min: 1, max: 60 },
  body: { min: 20, max: 1000 },
} as const;

export type EntryStatus = 'CANON' | 'APOCRYPHA';
export type Ruling = 'CANONIZE' | 'APOCRYPHA' | 'REJECT';

export interface EntrySummary {
  id: string;
  title: string;
  kind: Kind;
  status: EntryStatus;
  score: number;
  author: string;
  links: string[];
  seq: number;
}

export interface Entry {
  id: string;
  title: string;
  kind: Kind;
  body: string;
  author: string;
  status: EntryStatus;
  score: number;
  note: string;
  links: string[];
  contradicts: string;
  seq: number;
  exists: boolean;
}

export interface ChronicleEntry {
  id: string;
  title: string;
  kind: Kind;
  author: string;
  ruling: Ruling;
  score: number;
  note: string;
  seq: number;
}

export interface Stats {
  entries: number;
  canon: number;
  apocrypha: number;
  submissions: number;
}

// ---- resilient reads -----------------------------------------------------

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (!/rate limit|429|timeout|network|fetch|too many/i.test(String(e))) throw e;
      // backoff: 2.5s, 5s, 10s, 20s
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

function toRecord<T>(value: unknown): T {
  if (value instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of value.entries()) obj[String(k)] = normalize(v);
    return obj as T;
  }
  return value as T;
}

function normalize(value: unknown): unknown {
  if (value instanceof Map) return toRecord(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  const n = Number(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return String(v ?? '');
}

function asKind(v: unknown): Kind {
  const s = str(v).toUpperCase();
  return (KINDS as readonly string[]).includes(s) ? (s as Kind) : 'FIGURE';
}

function asEntryStatus(v: unknown): EntryStatus {
  return str(v).toUpperCase() === 'APOCRYPHA' ? 'APOCRYPHA' : 'CANON';
}

function asRuling(v: unknown): Ruling {
  const s = str(v).toUpperCase();
  if (s === 'CANONIZE' || s === 'APOCRYPHA' || s === 'REJECT') return s;
  return 'REJECT';
}

function asLinks(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => str(x)).filter(Boolean);
  return [];
}

function asSummary(raw: unknown): EntrySummary {
  const r = toRecord<Record<string, unknown>>(raw);
  return {
    id: str(r.id),
    title: str(r.title),
    kind: asKind(r.kind),
    status: asEntryStatus(r.status),
    score: num(r.score),
    author: str(r.author),
    links: asLinks(r.links),
    seq: num(r.seq),
  };
}

function asEntry(raw: unknown): Entry {
  const r = toRecord<Record<string, unknown>>(raw);
  const id = str(r.id);
  return {
    id,
    title: str(r.title),
    kind: asKind(r.kind),
    body: str(r.body),
    author: str(r.author),
    status: asEntryStatus(r.status),
    score: num(r.score),
    note: str(r.note),
    links: asLinks(r.links),
    contradicts: str(r.contradicts),
    seq: num(r.seq),
    exists: id.length > 0,
  };
}

function asChronicle(raw: unknown): ChronicleEntry {
  const r = toRecord<Record<string, unknown>>(raw);
  return {
    id: str(r.id),
    title: str(r.title),
    kind: asKind(r.kind),
    author: str(r.author),
    ruling: asRuling(r.ruling),
    score: num(r.score),
    note: str(r.note),
    seq: num(r.seq),
  };
}

export async function fetchStats(): Promise<Stats> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_stats', args: [] }),
  );
  const r = toRecord<Record<string, unknown>>(normalize(raw));
  return {
    entries: num(r.entries),
    canon: num(r.canon),
    apocrypha: num(r.apocrypha),
    submissions: num(r.submissions),
  };
}

export async function fetchEntries(start = 0): Promise<EntrySummary[]> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_entries', args: [start] }),
  );
  const arr = (normalize(raw) as unknown[]) ?? [];
  return arr.map(asSummary);
}

export async function fetchEntry(id: string): Promise<Entry> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_entry', args: [id] }),
  );
  return asEntry(normalize(raw));
}

export async function fetchChronicle(start = 0): Promise<ChronicleEntry[]> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_chronicle', args: [start] }),
  );
  const arr = (normalize(raw) as unknown[]) ?? [];
  return arr.map(asChronicle);
}

// ---- writes --------------------------------------------------------------

export function scribe(
  client: WalletClient,
  title: string,
  kind: string,
  body: string,
  refs: string,
) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'scribe',
    args: [title, kind, body, refs],
    value: 0n,
  });
}

// ---- transaction polling -------------------------------------------------

const STATUS_NAME: Record<string, string> = {
  '1': 'PENDING',
  '2': 'PROPOSING',
  '3': 'COMMITTING',
  '4': 'REVEALING',
  '5': 'ACCEPTED',
  '6': 'UNDETERMINED',
  '7': 'FINALIZED',
  '8': 'CANCELED',
  '12': 'VALIDATORS_TIMEOUT',
  '13': 'LEADER_TIMEOUT',
};

export const statusName = (s: unknown): string =>
  STATUS_NAME[String(s)] ?? String(s ?? 'PENDING').toUpperCase();

// LEADER_TIMEOUT / VALIDATORS_TIMEOUT are intentionally absent: the network
// rotates the leader and retries, so keep polling through them.
const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED']);

export interface LeaderDraft {
  ruling: Ruling;
  score?: number;
  contradicts?: string;
  note?: string;
}

function pick(obj: unknown, key: string): unknown {
  if (obj instanceof Map) return obj.get(key);
  if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
  return undefined;
}

export function extractLeaderDraft(tx: unknown): LeaderDraft | null {
  try {
    const receipts = pick(pick(tx, 'consensus_data'), 'leader_receipt');
    const first = Array.isArray(receipts) ? receipts[0] : receipts;
    const b64 = pick(pick(first, 'eq_outputs'), '0');
    if (typeof b64 !== 'string' || b64.length === 0) return null;
    const text = atob(b64);
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] !== '{') continue;
      try {
        const obj = JSON.parse(text.slice(i)) as Record<string, unknown>;
        if (obj && typeof obj === 'object' && 'ruling' in obj) {
          return {
            ruling: asRuling(obj.ruling),
            score: obj.score !== undefined ? num(obj.score) : undefined,
            contradicts: obj.contradicts !== undefined ? str(obj.contradicts) : undefined,
            note: obj.note !== undefined ? str(obj.note) : undefined,
          };
        }
      } catch {
        /* keep scanning toward the start for a parseable object */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function pollUntilDecided(
  client: WalletClient,
  hash: `0x${string}`,
  onUpdate?: (status: string, draft: LeaderDraft | null) => void,
): Promise<{ status: string; draft: LeaderDraft | null }> {
  let draft: LeaderDraft | null = null;
  for (let i = 0; i < 150; i++) {
    const tx = await client
      .getTransaction({ hash } as Parameters<typeof client.getTransaction>[0])
      .catch(() => null);
    const status = statusName(tx ? (tx as { status?: unknown }).status : 'PENDING');
    draft = extractLeaderDraft(tx) ?? draft;
    onUpdate?.(status, draft);
    if (TERMINAL.has(status)) return { status, draft };
    await new Promise((r) => setTimeout(r, 8000));
  }
  return { status: 'TIMEOUT', draft };
}
