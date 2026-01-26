import type { Metadata } from 'next';

export const siteName = 'Label';
export const siteUrl = 'https://example.com/label';
export const siteDescription =
  'Label — un label de musique contemporain. Releases, roster, events et news. Vibe dark, animations subtiles, CTA orange.';

export const metadata: Metadata = {
  title: `${siteName} — Home`,
  description: siteDescription,
  metadataBase: new URL('https://example.com'),
  icons: {
    icon: '/favicon.ico'
  },
  themeColor: '#0B0F14',
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: `${siteName} — Home`,
    description: siteDescription,
    siteName,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: `${siteName} — hero`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Home`,
    description: siteDescription,
    images: [
      'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?q=80&w=1200&auto=format&fit=crop'
    ]
  },
  alternates: {
    canonical: siteUrl
  }
};

export function jsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    genre: ['Electronic', 'Techno', 'Ambient'],
    sameAs: [
      'https://instagram.com/yourlabel',
      'https://twitter.com/yourlabel',
      'https://open.spotify.com/user/yourlabel'
    ]
  };

  return JSON.stringify(data);
}
