import { Kind, Ruling } from './contract';

export function shortAddress(addr: string | null | undefined, size = 4): string {
  if (!addr) return '';
  const a = String(addr);
  if (a.length <= size * 2 + 2) return a;
  return `${a.slice(0, size + 2)}...${a.slice(-size)}`;
}

export function formatFigure(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function sameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export interface KindMeta {
  label: string;
  color: string;
  // a CSS-drawable sigil glyph kept emoji-free, set in IM Fell small caps
  sigil: string;
  gloss: string;
}

// Each kind carries its own illuminated sigil letter and accent hue.
export const KIND_META: Record<Kind, KindMeta> = {
  FIGURE: { label: 'Figure', color: 'var(--gold)', sigil: 'F', gloss: 'a person of the world' },
  PLACE: { label: 'Place', color: 'var(--astral)', sigil: 'P', gloss: 'a location set down' },
  AGE: { label: 'Age', color: 'var(--canon)', sigil: 'A', gloss: 'an era of the chronicle' },
  ARTIFACT: {
    label: 'Artifact',
    color: '#c98fd0',
    sigil: 'R',
    gloss: 'an object of consequence',
  },
  EVENT: { label: 'Event', color: '#e0915a', sigil: 'E', gloss: 'a happening of record' },
};

export function kindMeta(kind: Kind): KindMeta {
  return KIND_META[kind] ?? KIND_META.FIGURE;
}

export interface RulingMeta {
  label: string;
  color: string;
  verb: string;
}

export const RULING_META: Record<Ruling, RulingMeta> = {
  CANONIZE: { label: 'Canonized', color: 'var(--canon)', verb: 'entered the canon' },
  APOCRYPHA: { label: 'Apocrypha', color: 'var(--apocrypha)', verb: 'filed as disputed' },
  REJECT: { label: 'Struck', color: 'var(--muted)', verb: 'struck from the record' },
};

export function rulingMeta(ruling: Ruling): RulingMeta {
  return RULING_META[ruling] ?? RULING_META.REJECT;
}

// A measured score band in the Loremaster's voice.
export function scoreBand(score: number): string {
  if (score >= 85) return 'in firm accord with the canon';
  if (score >= 65) return 'broadly consonant with the canon';
  if (score >= 45) return 'in uneasy tension with the canon';
  if (score >= 20) return 'at odds with established lore';
  return 'in open contradiction';
}
