'use client';

import { useState, useEffect } from 'react';

interface PortfolioItem {
    id?: string;
    file: string;
    title: string;
    category: string;
    createdAt?: string;
}

const categoryNames: Record<string, string> = {
    all: 'Toutes',
    pyro: 'Pyrogravures',
    peinture: 'Peintures',
    collage: 'Collages',
    gravure: 'Gravures',
    divers: 'Divers',
};

// Helper to resolve image URL
function getImageUrl(file: string): string {
    if (file.startsWith('http')) return file;
    return `/Images/${file}`;
}

export default function PortfolioGallery() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [modalImage, setModalImage] = useState<PortfolioItem | null>(null);

    useEffect(() => {
        loadPortfolio();
    }, []);

    async function loadPortfolio() {
        try {
            const res = await fetch('/api/portfolio');
            const data = await res.json();
            // Sort by createdAt descending (most recent first)
            const sorted = (data.items || []).sort((a: PortfolioItem, b: PortfolioItem) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            setItems(sorted);
        } catch (err) {
            console.error('Error loading portfolio:', err);
        }
        setLoading(false);
    }

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.category === filter);

    return (
        <>
            {/* Filters */}
            <nav className="portfolio-filters">
                {Object.entries(categoryNames).map(([key, name]) => (
                    <button
                        key={key}
                        className={`portfolio-filter ${filter === key ? 'active' : ''}`}
                        onClick={() => setFilter(key)}
                    >
                        {name}
                    </button>
                ))}
            </nav>

            {/* Grid */}
            <div className="portfolio-grid" id="portfolio-grid">
                {loading ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
                ) : filteredItems.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem' }}>Aucune œuvre dans cette catégorie</p>
                ) : (
                    filteredItems.map((item, i) => (
                        <article
                            key={item.id || i}
                            className="portfolio-item"
                            data-category={item.category}
                            onClick={() => setModalImage(item)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img
                                src={getImageUrl(item.file)}
                                alt={item.title}
                                loading="lazy"
                            />
                            <div className="portfolio-item-overlay">
                                <span className="portfolio-item-category">
                                    {categoryNames[item.category] || item.category}
                                </span>
                                <h3 className="portfolio-item-title">{item.title}</h3>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Modal */}
            {modalImage && (
                <div
                    className="modal-overlay"
                    onClick={() => setModalImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'zoom-out',
                        animation: 'fadeIn 0.3s ease',
                    }}
                >
                    <button
                        onClick={() => setModalImage(null)}
                        style={{
                            position: 'absolute',
                            top: '2rem',
                            right: '2rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '2rem',
                            cursor: 'pointer',
                            zIndex: 10000,
                        }}
                    >
                        ×
                    </button>
                    <div
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={getImageUrl(modalImage.file)}
                            alt={modalImage.title}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: '4px',
                            }}
                        />
                        <div style={{
                            marginTop: '1.5rem',
                            textAlign: 'center',
                            color: '#fff',
                        }}>
                            <h2 style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: '1.5rem',
                                fontWeight: 500,
                                marginBottom: '0.5rem',
                            }}>
                                {modalImage.title}
                            </h2>
                            <span style={{
                                color: '#C9A962',
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                            }}>
                                {categoryNames[modalImage.category] || modalImage.category}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
}
