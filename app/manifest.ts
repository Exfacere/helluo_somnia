import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Helluo_Somnia — Artiste Contemporaine',
        short_name: 'Helluo_Somnia',
        description: 'Portfolio de Helluo_Somnia, artiste contemporaine spécialisée en pyrogravure, peinture, collage et gravure.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#C9A962',
        orientation: 'portrait-primary',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
