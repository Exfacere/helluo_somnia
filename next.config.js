/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // Serve static files from public folder
    async rewrites() {
        return [
            // Legacy routes support
            {
                source: '/accueil.html',
                destination: '/',
            },
        ];
    },
};

module.exports = nextConfig;
