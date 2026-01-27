'use client';

export default function PortfolioSkeleton() {
    return (
        <div>
            {/* Skeleton for filters */}
            <nav style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '2rem'
            }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        style={{
                            width: '100px',
                            height: '36px',
                            borderRadius: '999px',
                            background: 'linear-gradient(90deg, #2A2A2A 25%, #3A3A3A 50%, #2A2A2A 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                        }}
                    />
                ))}
            </nav>

            {/* Skeleton for grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div
                        key={i}
                        style={{
                            aspectRatio: '1',
                            borderRadius: '8px',
                            background: 'linear-gradient(90deg, #2A2A2A 25%, #3A3A3A 50%, #2A2A2A 75%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}
