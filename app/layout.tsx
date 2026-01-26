import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Helluo_Somnia — Artiste Contemporaine',
    description: 'Portfolio de Helluo_Somnia, artiste contemporaine. Pyrogravures, peintures, collages et gravures.',
    openGraph: {
        title: 'Helluo_Somnia — Artiste Contemporaine',
        description: 'Portfolio de Helluo_Somnia, artiste contemporaine.',
        url: 'https://helluosomnia.com',
        siteName: 'Helluo_Somnia',
        locale: 'fr_FR',
        type: 'website',
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
            <body>{children}</body>
        </html>
    );
}
