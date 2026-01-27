import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin',
        },
        sitemap: 'https://helluo-somnia-toi9.vercel.app/sitemap.xml',
    };
}
