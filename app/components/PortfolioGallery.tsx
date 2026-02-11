'use client';

import { useState, useEffect } from 'react';
import PortfolioSkeleton from './PortfolioSkeleton';

interface PortfolioItem {
    id?: string;
    file: string;
    title: string;
    category: string;
    createdAt?: string;
}

interface Category {
    id: string;
    name: string;
    order: number;
}

// Helper to resolve image URL with Cloudinary optimizations
function getImageUrl(file: string, size: 'thumbnail' | 'full' = 'thumbnail'): string {
    if (file.startsWith('http')) {
        // Add Cloudinary transformations for optimization
        if (file.includes('res.cloudinary.com')) {
            // Insert transformations after /upload/
            const transformations = size === 'thumbnail'
                ? 'f_auto,q_auto,w_600,c_fill'  // Optimized thumbnails
                : 'f_auto,q_auto';               // Full size with auto format/quality
            return file.replace('/upload/', `/upload/${transformations}/`);
        }
        return file;
    }
    return `/Images/${file}`;
}

const ITEMS_PER_PAGE = 15;

// Detect auto-generated titles from filenames (IMG_xxx, Snapchat_xxx, etc.)
function isAutoTitle(title: string): boolean {
    return /^(IMG|Snapchat|DSC|DCIM|Photo|Screenshot)/i.test(title.trim());
}

export default function PortfolioGallery() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [modalImage, setModalImage] = useState<PortfolioItem | null>(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // Load both portfolio items and categories in parallel
            const [portfolioRes, categoriesRes] = await Promise.all([
                fetch('/api/portfolio'),
                fetch('/api/categories'),
            ]);

            const portfolioData = await portfolioRes.json();
            const categoriesData = await categoriesRes.json();

            // Sort items by createdAt descending (most recent first)
            const sorted = (portfolioData.items || []).sort((a: PortfolioItem, b: PortfolioItem) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setItems(sorted);
            setCategories(categoriesData.categories || []);
        } catch (err) {
            console.error('Error loading data:', err);
        }
        setLoading(false);
    }

    // Build category names map from dynamic categories
    const categoryNames: Record<string, string> = { all: 'Toutes' };
    categories.forEach(cat => {
        categoryNames[cat.id] = cat.name;
    });

    // Reset visible count when filter changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [filter]);

    const filteredItems = filter === 'all'
        ? items
        : items.filter(item => item.category === filter);

    const visibleItems = filteredItems.slice(0, visibleCount);
    const hasMore = visibleCount < filteredItems.length;

    function handleShowMore() {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }

    if (loading) {
        return <PortfolioSkeleton />;
    }

    return (
        <div>
            {/* Filters */}
            <nav className="portfolio-filters" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center',
                marginBottom: '2rem'
            }}>
                {/* "Toutes" button first, then dynamic categories */}
                {[{ id: 'all', name: 'Toutes' }, ...categories].map((cat) => (
                    <button
                        key={cat.id}
                        className={`portfolio-filter ${filter === cat.id ? 'active' : ''}`}
                        onClick={() => setFilter(cat.id)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            border: filter === cat.id ? '1px solid #C9A962' : '1px solid #333',
                            borderRadius: '999px',
                            background: filter === cat.id ? '#C9A962' : 'transparent',
                            color: filter === cat.id ? '#1A1A1A' : '#fff',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </nav>

            {/* Grid */}
            <div className="portfolio-grid" id="portfolio-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
            }}>
                {visibleItems.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '2rem', gridColumn: '1 / -1' }}>Aucune œuvre dans cette catégorie</p>
                ) : (
                    visibleItems.map((item, i) => (
                        <article
                            key={item.id || i}
                            className="portfolio-item"
                            data-category={item.category}
                            onClick={() => setModalImage(item)}
                            style={{
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '8px',
                                aspectRatio: '1',
                            }}
                        >
                            <img
                                src={getImageUrl(item.file)}
                                alt={item.title}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            <div className="portfolio-item-overlay" style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '1.5rem 1rem 1rem',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                            }}>
                                <span style={{
                                    color: '#C9A962',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {categoryNames[item.category] || item.category}
                                </span>
                                {!isAutoTitle(item.title) && (
                                    <h3 style={{
                                        color: '#fff',
                                        fontSize: '1rem',
                                        fontWeight: 500,
                                        marginTop: '0.25rem'
                                    }}>{item.title}</h3>
                                )}
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* Show More Button */}
            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <button
                        onClick={handleShowMore}
                        style={{
                            padding: '0.875rem 2.5rem',
                            background: 'transparent',
                            border: '1px solid #C9A962',
                            color: '#C9A962',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#C9A962';
                            e.currentTarget.style.color = '#1A1A1A';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#C9A962';
                        }}
                    >
                        Voir plus ({filteredItems.length - visibleCount} restantes)
                    </button>
                </div>
            )}

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
                            src={getImageUrl(modalImage.file, 'full')}
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
        </div>
    );
}
