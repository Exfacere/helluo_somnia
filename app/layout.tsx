import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

export const metadata: Metadata = {
    title: 'Helluo_Somnia — Artiste Contemporaine',
    description: 'Portfolio d\'Aurore Piesset (Helluo_Somnia), artiste contemporaine. Pyrogravures, peintures et carnets.',
    keywords: ['artiste contemporaine', 'Aurore Piesset', 'pyrogravure', 'art contemporain', 'peinture', 'carnets', 'Helluo_Somnia', 'portfolio art'],
    authors: [{ name: 'Helluo_Somnia' }],
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Helluo_Somnia — Artiste Contemporaine',
        description: 'Portfolio d\'Aurore Piesset (Helluo_Somnia), artiste contemporaine. Pyrogravures, peintures et carnets.',
        url: 'https://helluosomnia.com',
        siteName: 'Helluo_Somnia',
        images: [
            {
                url: 'https://res.cloudinary.com/duxandnre/image/upload/f_auto,q_auto,w_1200/v1769433418/helluo-somnia/pyro3-hero.webp',
                width: 1200,
                height: 630,
                alt: 'Œuvre de Helluo_Somnia - Artiste Contemporaine',
            },
        ],
        locale: 'fr_FR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Helluo_Somnia — Artiste Contemporaine',
        description: 'Portfolio d\'Aurore Piesset (Helluo_Somnia), artiste contemporaine. Pyrogravures, peintures et carnets.',
        images: ['https://res.cloudinary.com/duxandnre/image/upload/f_auto,q_auto,w_1200/v1769433418/helluo-somnia/pyro3-hero.webp'],
    },
    metadataBase: new URL('https://helluosomnia.com'),
    alternates: {
        canonical: '/',
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
            </body>
        </html>
    );
}
