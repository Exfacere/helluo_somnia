import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Helluo_Somnia — Artiste Contemporaine',
    description: 'Portfolio de Helluo_Somnia, artiste contemporaine spécialisée en pyrogravure, peinture, collage et gravure. Découvrez des œuvres originales explorant les frontières entre ombre et lumière.',
    keywords: ['artiste contemporaine', 'pyrogravure', 'peinture', 'collage', 'gravure', 'art contemporain', 'helluo somnia', 'portfolio artiste'],
    authors: [{ name: 'Helluo_Somnia' }],
    creator: 'Helluo_Somnia',
    metadataBase: new URL('https://helluo-somnia-toi9.vercel.app'),
    openGraph: {
        title: 'Helluo_Somnia — Artiste Contemporaine',
        description: 'Portfolio de Helluo_Somnia, artiste contemporaine. Pyrogravures, peintures, collages et gravures.',
        url: 'https://helluo-somnia-toi9.vercel.app',
        siteName: 'Helluo_Somnia',
        locale: 'fr_FR',
        type: 'website',
        images: [
            {
                url: 'https://res.cloudinary.com/duxandnre/image/upload/v1769433418/helluo-somnia/pyro3-hero.webp',
                width: 1200,
                height: 630,
                alt: 'Helluo_Somnia - Artiste Contemporaine',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Helluo_Somnia — Artiste Contemporaine',
        description: 'Portfolio de Helluo_Somnia, artiste contemporaine.',
        images: ['https://res.cloudinary.com/duxandnre/image/upload/v1769433418/helluo-somnia/pyro3-hero.webp'],
    },
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: '/favicon.ico',
    },
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
