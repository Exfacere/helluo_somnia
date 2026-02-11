'use client';

import { useState, useEffect, useCallback } from 'react';

interface CarnetPage {
    pageNumber: number;
    url: string;
    public_id: string;
}

interface Carnet {
    id: string;
    number: number;
    title: string;
    coverUrl: string;
    pages: CarnetPage[];
    createdAt: string;
    type?: 'cicatrise' | 'suture';
}

function getOptimizedUrl(url: string, size: 'thumbnail' | 'full' = 'thumbnail'): string {
    if (url.includes('res.cloudinary.com')) {
        const transformations = size === 'thumbnail'
            ? 'f_auto,q_auto,w_400,c_fill'
            : 'f_auto,q_auto,w_1200';
        return url.replace('/upload/', `/upload/${transformations}/`);
    }
    return url;
}

type CarnetTab = 'cicatrise' | 'suture';

export default function CarnetsGallery() {
    const [carnets, setCarnets] = useState<Carnet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCarnet, setSelectedCarnet] = useState<Carnet | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
    const [activeTab, setActiveTab] = useState<CarnetTab>('cicatrise');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        function checkMobile() {
            setIsMobile(window.innerWidth < 768);
        }
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        loadCarnets();
    }, []);

    async function loadCarnets() {
        try {
            const res = await fetch('/api/carnets');
            const data = await res.json();
            setCarnets(data.carnets || []);
        } catch (err) {
            console.error('Error loading carnets:', err);
        }
        setLoading(false);
    }

    // Filter carnets by tab
    const filteredCarnets = carnets.filter(c => {
        const type = c.type || 'cicatrise';
        return type === activeTab;
    });

    // Has any carnets of each type
    const hasCicatrise = carnets.some(c => (c.type || 'cicatrise') === 'cicatrise');
    const hasSuture = carnets.some(c => c.type === 'suture');

    function goToPage(targetPage: number) {
        if (!selectedCarnet || isTransitioning) return;
        const totalPages = selectedCarnet.pages.length;
        if (targetPage < 0 || targetPage >= totalPages || targetPage === currentPage) return;

        const direction = targetPage > currentPage ? 'next' : 'prev';
        setSlideDirection(direction);
        setIsTransitioning(true);

        setTimeout(() => {
            setCurrentPage(targetPage);
            setSlideDirection(null);
            setIsTransitioning(false);
        }, 400);
    }

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!selectedCarnet || isTransitioning) return;
        const totalPages = selectedCarnet.pages.length;
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            if (currentPage < totalPages - 1) goToPage(currentPage + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentPage > 0) goToPage(currentPage - 1);
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }, [selectedCarnet, isTransitioning, currentPage]);

    useEffect(() => {
        if (selectedCarnet) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedCarnet, handleKeyDown]);

    function openCarnet(carnet: Carnet) {
        setSelectedCarnet(carnet);
        setCurrentPage(0);
        setIsTransitioning(false);
        setSlideDirection(null);
    }

    function closeModal() {
        setSelectedCarnet(null);
        setCurrentPage(0);
        setIsTransitioning(false);
        setSlideDirection(null);
    }

    // Touch swipe
    const [touchStart, setTouchStart] = useState<number | null>(null);

    function handleTouchStart(e: React.TouchEvent) {
        setTouchStart(e.touches[0].clientX);
    }

    function handleTouchEnd(e: React.TouchEvent) {
        if (!touchStart || !selectedCarnet || isTransitioning) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        const totalPages = selectedCarnet.pages.length;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentPage < totalPages - 1) {
                goToPage(currentPage + 1);
            } else if (diff < 0 && currentPage > 0) {
                goToPage(currentPage - 1);
            }
        }
        setTouchStart(null);
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ width: 160, height: 220, background: '#e8e6e2', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                ))}
            </div>
        );
    }

    if (carnets.length === 0) {
        return <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>Aucun carnet pour le moment</p>;
    }

    const totalPages = selectedCarnet ? selectedCarnet.pages.length : 0;
    const canGoPrev = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1;

    // Responsive page dimensions
    const pageMaxWidth = isMobile ? '92vw' : 'min(70vw, 800px)';
    const pageMaxHeight = isMobile ? '70vh' : '80vh';

    return (
        <>
            <style>{`
                @keyframes slideInRight {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideInLeft {
                    0% { transform: translateX(-100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutLeft {
                    0% { transform: translateX(0); opacity: 1; }
                    100% { transform: translateX(-100%); opacity: 0; }
                }
                @keyframes slideOutRight {
                    0% { transform: translateX(0); opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0; }
                }
                .page-slide-in-right { animation: slideInRight 0.4s ease-out forwards; }
                .page-slide-in-left { animation: slideInLeft 0.4s ease-out forwards; }
                .page-slide-out-left { animation: slideOutLeft 0.4s ease-out forwards; }
                .page-slide-out-right { animation: slideOutRight 0.4s ease-out forwards; }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
            `}</style>

            {/* Tab Toggle: Cicatrisés / Suturés */}
            {(hasCicatrise || hasSuture) && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                }}>
                    <button
                        onClick={() => setActiveTab('cicatrise')}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '999px',
                            border: activeTab === 'cicatrise' ? '1px solid #C9A962' : '1px solid rgba(0,0,0,0.12)',
                            background: activeTab === 'cicatrise' ? 'rgba(201,169,98,0.12)' : 'transparent',
                            color: activeTab === 'cicatrise' ? '#1A1A1A' : '#8A8A8A',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Carnets cicatrisés
                    </button>
                    <button
                        onClick={() => setActiveTab('suture')}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '999px',
                            border: activeTab === 'suture' ? '1px solid #C9A962' : '1px solid rgba(0,0,0,0.12)',
                            background: activeTab === 'suture' ? 'rgba(201,169,98,0.12)' : 'transparent',
                            color: activeTab === 'suture' ? '#1A1A1A' : '#8A8A8A',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Carnets suturés
                    </button>
                </div>
            )}

            {/* Carnets Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem',
                justifyItems: 'center',
                padding: '0 0.5rem',
            }}>
                {filteredCarnets.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', gridColumn: '1 / -1' }}>
                        Aucun carnet dans cette catégorie
                    </p>
                ) : (
                    filteredCarnets.map(carnet => (
                        <article key={carnet.id} onClick={() => openCarnet(carnet)}
                            style={{ cursor: 'pointer', position: 'relative', width: '100%', maxWidth: 180, transition: 'transform 0.3s ease' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '4px 10px 10px 4px', overflow: 'hidden', boxShadow: '3px 3px 12px rgba(0,0,0,0.15)', background: '#f0ede8' }}>
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: 'linear-gradient(90deg, rgba(0,0,0,0.15), transparent)', zIndex: 2 }} />
                                <img src={getOptimizedUrl(carnet.coverUrl)} alt={carnet.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.7)', color: '#C9A962', padding: '3px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 500 }}>
                                    {carnet.pages.length} pages
                                </div>
                            </div>
                            <h3 style={{ marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center', color: '#1A1A1A' }}>{carnet.title}</h3>
                        </article>
                    ))
                )}
            </div>

            {/* Single-Page Viewer Modal */}
            {selectedCarnet && (
                <div
                    onClick={closeModal}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 12, 10, 0.97)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: isMobile ? '0.5rem' : '1rem',
                        touchAction: 'pan-y',
                    }}
                >
                    {/* Close */}
                    <button onClick={closeModal}
                        style={{
                            position: 'absolute',
                            top: isMobile ? '0.5rem' : '1rem',
                            right: isMobile ? '0.5rem' : '1rem',
                            background: 'rgba(0,0,0,0.7)',
                            border: '1px solid #555',
                            color: '#ccc',
                            fontSize: '1.5rem',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            zIndex: 10001,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>×</button>

                    {/* Title */}
                    <h2 style={{
                        color: '#C9A962',
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: isMobile ? '1.1rem' : 'clamp(1.25rem, 3vw, 1.75rem)',
                        marginBottom: isMobile ? '0.5rem' : '1rem',
                        textAlign: 'center',
                        letterSpacing: '0.05em',
                        padding: '0 2rem',
                    }}>{selectedCarnet.title}</h2>

                    {/* Page Viewer */}
                    <div onClick={(e) => e.stopPropagation()} style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '0.5rem' : '1rem',
                    }}>
                        {/* Prev Button */}
                        {!isMobile && (
                            <button onClick={() => goToPage(currentPage - 1)} disabled={!canGoPrev || isTransitioning}
                                style={{
                                    background: canGoPrev && !isTransitioning ? 'rgba(201, 169, 98, 0.15)' : 'transparent',
                                    border: canGoPrev && !isTransitioning ? '1px solid rgba(201, 169, 98, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                    color: canGoPrev && !isTransitioning ? '#C9A962' : '#333',
                                    width: 44, height: 44, borderRadius: '50%',
                                    fontSize: '1.25rem',
                                    cursor: canGoPrev && !isTransitioning ? 'pointer' : 'not-allowed',
                                    flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>←</button>
                        )}

                        {/* Single Page Display */}
                        <div style={{
                            width: pageMaxWidth,
                            maxHeight: pageMaxHeight,
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            background: '#1a1714',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {selectedCarnet.pages[currentPage] && (
                                <img
                                    key={currentPage}
                                    className={slideDirection === 'next' ? 'page-slide-in-right' : slideDirection === 'prev' ? 'page-slide-in-left' : ''}
                                    src={getOptimizedUrl(selectedCarnet.pages[currentPage].url, 'full')}
                                    alt={`Page ${selectedCarnet.pages[currentPage].pageNumber}`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: pageMaxHeight,
                                        objectFit: 'contain',
                                        display: 'block',
                                    }}
                                />
                            )}
                        </div>

                        {/* Next Button */}
                        {!isMobile && (
                            <button onClick={() => goToPage(currentPage + 1)} disabled={!canGoNext || isTransitioning}
                                style={{
                                    background: canGoNext && !isTransitioning ? 'rgba(201, 169, 98, 0.15)' : 'transparent',
                                    border: canGoNext && !isTransitioning ? '1px solid rgba(201, 169, 98, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                                    color: canGoNext && !isTransitioning ? '#C9A962' : '#333',
                                    width: 44, height: 44, borderRadius: '50%',
                                    fontSize: '1.25rem',
                                    cursor: canGoNext && !isTransitioning ? 'pointer' : 'not-allowed',
                                    flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>→</button>
                        )}
                    </div>

                    {/* Page Indicator */}
                    <div style={{ marginTop: isMobile ? '0.75rem' : '1rem', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>{currentPage + 1} / {totalPages}</span>
                        {!isMobile && (
                            <>
                                <span style={{ color: '#444' }}>•</span>
                                <span style={{ color: '#777', fontSize: '0.7rem' }}>← → pour feuilleter</span>
                            </>
                        )}
                        {isMobile && (
                            <span style={{ color: '#555', fontSize: '0.7rem' }}>Swipe pour naviguer</span>
                        )}
                    </div>

                    {/* Thumbnails Strip */}
                    <div style={{
                        display: 'flex',
                        gap: isMobile ? '0.3rem' : '0.4rem',
                        marginTop: '0.75rem',
                        overflowX: 'auto',
                        maxWidth: '95vw',
                        padding: '0.5rem',
                        WebkitOverflowScrolling: 'touch',
                    }}>
                        {selectedCarnet.pages.map((page, idx) => (
                            <button key={idx} onClick={(e) => { e.stopPropagation(); goToPage(idx); }} disabled={isTransitioning}
                                style={{
                                    padding: 2,
                                    background: idx === currentPage ? 'rgba(201, 169, 98, 0.25)' : 'rgba(255,255,255,0.03)',
                                    border: idx === currentPage ? '2px solid #C9A962' : '2px solid transparent',
                                    borderRadius: 3,
                                    cursor: isTransitioning ? 'wait' : 'pointer',
                                    opacity: idx === currentPage ? 1 : 0.5,
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                }}>
                                <div style={{
                                    width: isMobile ? 24 : 30,
                                    height: isMobile ? 16 : 20,
                                    borderRadius: '2px',
                                    overflow: 'hidden',
                                    background: '#252220',
                                }}>
                                    <img src={getOptimizedUrl(page.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
