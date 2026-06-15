import type { Metadata } from 'next';
import { IM_Fell_English_SC, EB_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SiteChrome } from '@/components/SiteChrome';

const display = IM_Fell_English_SC({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = EB_Garamond({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://abstrusimad.github.io'),
  title: 'PALIMPSEST - one world, many hands, kept whole by an on-chain Loremaster',
  description:
    'PALIMPSEST is a shared fictional world written by many authors and kept internally consistent by an on-chain AI Loremaster. Scribe a figure, place, age, artifact, or event; the Loremaster rules it canon, apocrypha, or struck, under validator consensus on GenLayer Bradbury Testnet.',
  openGraph: {
    title: 'PALIMPSEST',
    description:
      'A shared illuminated world, judged into canon by an on-chain AI Loremaster under validator consensus. Scribe an entry and watch the canon hold or fracture.',
    type: 'website',
    images: ['/palimpsest/art/og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PALIMPSEST',
    description:
      'One world, many hands. An on-chain AI Loremaster keeps the canon whole under validator consensus on GenLayer.',
    images: ['/palimpsest/art/og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
