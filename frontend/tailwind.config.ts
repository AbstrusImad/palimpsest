import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        parchment: 'var(--parchment)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        gold: 'var(--gold)',
        astral: 'var(--astral)',
        canon: 'var(--canon)',
        apocrypha: 'var(--apocrypha)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        codex: '78rem',
      },
    },
  },
  plugins: [],
};

export default config;
