'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
}

function getOptimizedUrl(url: string, size: 'thumbnail' | 'full' = 'thumbnail'): string {
    if (url.includes('res.cloudinary.com')) {
        const transformations = size === 'thumbnail'
            ? 'f_auto,q_auto,w_400,c_fill'
            : 'f_auto,q_auto,w_800';
        return url.replace('/upload/', `/upload/${transformations}/`);
    }
    return url;
}

export default function CarnetsGallery() {
    const [carnets, setCarnets] = useState<Carnet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCarnet, setSelectedCarnet] = useState<Carnet | null>(null);
    const [spreadIndex, setSpreadIndex] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
    const [targetSpreadIndex, setTargetSpreadIndex] = useState(0);
    // For prev animation, we need to keep track of the "from" spread
    const [fromSpreadIndex, setFromSpreadIndex] = useState(0);

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

    function getSpreads(carnet: Carnet): (CarnetPage | null)[][] {
        const pages = carnet.pages;
        const spreads: (CarnetPage | null)[][] = [];
        if (pages.length > 0) spreads.push([null, pages[0]]);
        for (let i = 1; i < pages.length; i += 2) {
            spreads.push([pages[i] || null, pages[i + 1] || null]);
        }
        return spreads;
    }

    function flipToSpread(targetIndex: number) {
        if (!selectedCarnet || isFlipping) return;
        const spreads = getSpreads(selectedCarnet);
        if (targetIndex < 0 || targetIndex >= spreads.length || targetIndex === spreadIndex) return;

        const direction = targetIndex > spreadIndex ? 'next' : 'prev';
        setFlipDirection(direction);
        setTargetSpreadIndex(targetIndex);
        setFromSpreadIndex(spreadIndex);
        setIsFlipping(true);

        if (direction === 'next') {
            // Forward: page flips from right to left
            // Update content at midpoint (when page is at 90°)
            setTimeout(() => {
                setSpreadIndex(targetIndex);
            }, 280);
            setTimeout(() => {
                setIsFlipping(false);
                setFlipDirection(null);
            }, 550);
        } else {
            // Backward: page flips from left to right
            // Update content at midpoint
            setTimeout(() => {
                setSpreadIndex(targetIndex);
            }, 280);
            setTimeout(() => {
                setIsFlipping(false);
                setFlipDirection(null);
            }, 550);
        }
    }

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!selectedCarnet || isFlipping) return;
        const spreads = getSpreads(selectedCarnet);
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            if (spreadIndex < spreads.length - 1) flipToSpread(spreadIndex + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (spreadIndex > 0) flipToSpread(spreadIndex - 1);
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }, [selectedCarnet, isFlipping, spreadIndex]);

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
        setSpreadIndex(0);
        setTargetSpreadIndex(0);
        setFromSpreadIndex(0);
        setIsFlipping(false);
        setFlipDirection(null);
    }

    function closeModal() {
        setSelectedCarnet(null);
        setSpreadIndex(0);
        setIsFlipping(false);
        setFlipDirection(null);
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ width: 200, height: 280, background: '#2a2a2a', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                ))}
            </div>
        );
    }

    if (carnets.length === 0) {
        return <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>Aucun carnet pour le moment</p>;
    }

    const currentSpreads = selectedCarnet ? getSpreads(selectedCarnet) : [];
    const displaySpread = currentSpreads[spreadIndex] || [null, null];
    const targetSpread = currentSpreads[targetSpreadIndex] || [null, null];
    const fromSpread = currentSpreads[fromSpreadIndex] || [null, null];
    const canGoBack = spreadIndex > 0 || (isFlipping && fromSpreadIndex > 0);
    const canGoForward = spreadIndex < currentSpreads.length - 1 || (isFlipping && fromSpreadIndex < currentSpreads.length - 1);

    const pageWidth = 'min(35vw, 350px)';
    const pageHeight = 'min(47vw, 470px)';

    const renderPage = (page: CarnetPage | null, side: 'left' | 'right', showEnd = false) => {
        if (page) {
            return (
                <>
                    <img src={getOptimizedUrl(page.url, 'full')} alt={`Page ${page.pageNumber}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: 10, [side === 'left' ? 'left' : 'right']: 10, color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontStyle: 'italic' }}>
                        {page.pageNumber}
                    </span>
                </>
            );
        }
        return (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1714 0%, #252220 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontStyle: 'italic', fontSize: '0.875rem' }}>
                {showEnd ? 'Fin du carnet' : ''}
            </div>
        );
    };

    return (
        <>
            <style>{`
                @keyframes flipNext {
                    0% { transform: perspective(1500px) rotateY(0deg); }
                    100% { transform: perspective(1500px) rotateY(-180deg); }
                }
                @keyframes flipPrev {
                    0% { transform: perspective(1500px) rotateY(0deg); }
                    100% { transform: perspective(1500px) rotateY(180deg); }
                }
                .flip-next { animation: flipNext 0.55s ease-in-out forwards; transform-origin: left center; }
                .flip-prev { animation: flipPrev 0.55s ease-in-out forwards; transform-origin: right center; }
            `}</style>

            {/* Carnets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', justifyItems: 'center' }}>
                {carnets.map(carnet => (
                    <article key={carnet.id} onClick={() => openCarnet(carnet)} style={{ cursor: 'pointer', position: 'relative', width: '100%', maxWidth: 220, transition: 'transform 0.3s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '4px 12px 12px 4px', overflow: 'hidden', boxShadow: '4px 4px 15px rgba(0,0,0,0.4), -2px 0 10px rgba(0,0,0,0.2)', background: '#1a1a1a' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 12, background: 'linear-gradient(90deg, rgba(0,0,0,0.4), transparent)', zIndex: 2 }} />
                            <img src={getOptimizedUrl(carnet.coverUrl)} alt={carnet.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.8)', color: '#C9A962', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 500 }}>
                                {carnet.pages.length} pages
                            </div>
                        </div>
                        <h3 style={{ marginTop: '0.75rem', fontSize: '1rem', fontWeight: 500, textAlign: 'center', color: '#fff' }}>{carnet.title}</h3>
                    </article>
                ))}
            </div>

            {/* Book Modal */}
            {selectedCarnet && (
                <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 12, 10, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>

                    {/* Close */}
                    <button onClick={closeModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', border: '1px solid #444', color: '#aaa', fontSize: '1.5rem', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#C9A962'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#444'; }}>×</button>

                    {/* Title */}
                    <h2 style={{ color: '#C9A962', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', marginBottom: '1rem', textAlign: 'center', letterSpacing: '0.05em' }}>{selectedCarnet.title}</h2>

                    {/* Book */}
                    <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', position: 'relative', perspective: '1500px' }}>

                        {/* Nav Left */}
                        <button onClick={() => flipToSpread(spreadIndex - 1)} disabled={!canGoBack || isFlipping}
                            style={{ position: 'absolute', left: '-60px', top: '50%', transform: 'translateY(-50%)', background: canGoBack && !isFlipping ? 'rgba(201, 169, 98, 0.15)' : 'transparent', border: canGoBack && !isFlipping ? '1px solid rgba(201, 169, 98, 0.4)' : '1px solid rgba(255,255,255,0.1)', color: canGoBack && !isFlipping ? '#C9A962' : '#333', width: 44, height: 44, borderRadius: '50%', fontSize: '1.25rem', cursor: canGoBack && !isFlipping ? 'pointer' : 'not-allowed', zIndex: 10 }}>←</button>

                        {/* Left Page Area */}
                        <div style={{ width: pageWidth, height: pageHeight, position: 'relative', transformStyle: 'preserve-3d' }}>

                            {/* Base left page */}
                            <div style={{ width: '100%', height: '100%', background: '#1a1714', borderRadius: '8px 0 0 8px', overflow: 'hidden', boxShadow: '-4px 4px 20px rgba(0,0,0,0.5)', position: 'absolute' }}>
                                {/* During prev flip, show target left page underneath */}
                                {isFlipping && flipDirection === 'prev'
                                    ? renderPage(targetSpread[0], 'left')
                                    : renderPage(displaySpread[0], 'left')}
                                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.25))', pointerEvents: 'none' }} />
                            </div>

                            {/* Flipping page for PREV (flips from left, revealing new left page) */}
                            {isFlipping && flipDirection === 'prev' && (
                                <div className="flip-prev" style={{ width: '100%', height: '100%', position: 'absolute', transformStyle: 'preserve-3d', zIndex: 10 }}>
                                    {/* Front: old left page (fromSpread[0]) */}
                                    <div style={{ width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', background: '#1a1714', borderRadius: '8px 0 0 8px', overflow: 'hidden', boxShadow: '-2px 0 15px rgba(0,0,0,0.3)' }}>
                                        {renderPage(fromSpread[0], 'left')}
                                    </div>
                                    {/* Back: old right page (becomes visible, showing what's "behind" the flipping page) */}
                                    <div style={{ width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#1a1714', borderRadius: '0 8px 8px 0', overflow: 'hidden' }}>
                                        {renderPage(fromSpread[1], 'right')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Spine */}
                        <div style={{ width: 6, background: 'linear-gradient(90deg, #15120f, #252220, #15120f)', boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)', zIndex: 5 }} />

                        {/* Right Page Area */}
                        <div style={{ width: pageWidth, height: pageHeight, position: 'relative', transformStyle: 'preserve-3d' }}>

                            {/* Base right page (shows target during forward flip, current otherwise) */}
                            <div style={{ width: '100%', height: '100%', background: '#1a1714', borderRadius: '0 8px 8px 0', overflow: 'hidden', boxShadow: '4px 4px 20px rgba(0,0,0,0.5)', position: 'absolute' }}>
                                {/* During forward flip, show target right page underneath */}
                                {isFlipping && flipDirection === 'next'
                                    ? renderPage(targetSpread[1], 'right', !targetSpread[1])
                                    : renderPage(displaySpread[1], 'right', !displaySpread[1])}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30, background: 'linear-gradient(-90deg, transparent, rgba(0,0,0,0.25))', pointerEvents: 'none' }} />
                            </div>

                            {/* Flipping page for NEXT */}
                            {isFlipping && flipDirection === 'next' && (
                                <div className="flip-next" style={{ width: '100%', height: '100%', position: 'absolute', transformStyle: 'preserve-3d', zIndex: 10 }}>
                                    {/* Front: old right page (fromSpread[1]) */}
                                    <div style={{ width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', background: '#1a1714', borderRadius: '0 8px 8px 0', overflow: 'hidden', boxShadow: '2px 0 15px rgba(0,0,0,0.3)' }}>
                                        {renderPage(fromSpread[1], 'right')}
                                    </div>
                                    {/* Back: new left page */}
                                    <div style={{ width: '100%', height: '100%', position: 'absolute', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: '#1a1714', borderRadius: '8px 0 0 8px', overflow: 'hidden' }}>
                                        {renderPage(targetSpread[0], 'left')}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nav Right */}
                        <button onClick={() => flipToSpread(spreadIndex + 1)} disabled={!canGoForward || isFlipping}
                            style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', background: canGoForward && !isFlipping ? 'rgba(201, 169, 98, 0.15)' : 'transparent', border: canGoForward && !isFlipping ? '1px solid rgba(201, 169, 98, 0.4)' : '1px solid rgba(255,255,255,0.1)', color: canGoForward && !isFlipping ? '#C9A962' : '#333', width: 44, height: 44, borderRadius: '50%', fontSize: '1.25rem', cursor: canGoForward && !isFlipping ? 'pointer' : 'not-allowed', zIndex: 10 }}>→</button>
                    </div>

                    {/* Indicator */}
                    <div style={{ marginTop: '1.25rem', color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>{spreadIndex + 1} / {currentSpreads.length}</span>
                        <span style={{ color: '#444' }}>•</span>
                        <span style={{ color: '#777', fontSize: '0.7rem' }}>← → pour feuilleter</span>
                    </div>

                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', overflowX: 'auto', maxWidth: '85vw', padding: '0.5rem' }}>
                        {currentSpreads.map((spread, idx) => (
                            <button key={idx} onClick={(e) => { e.stopPropagation(); flipToSpread(idx); }} disabled={isFlipping}
                                style={{ display: 'flex', gap: 1, padding: 2, background: idx === spreadIndex ? 'rgba(201, 169, 98, 0.25)' : 'rgba(255,255,255,0.03)', border: idx === spreadIndex ? '2px solid #C9A962' : '2px solid transparent', borderRadius: 3, cursor: isFlipping ? 'wait' : 'pointer', opacity: idx === spreadIndex ? 1 : 0.5, transition: 'all 0.2s ease', flexShrink: 0 }}>
                                <div style={{ width: 20, height: 28, background: spread[0] ? 'transparent' : '#252220', borderRadius: '2px 0 0 2px', overflow: 'hidden' }}>
                                    {spread[0] && <img src={getOptimizedUrl(spread[0].url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ width: 20, height: 28, background: spread[1] ? 'transparent' : '#252220', borderRadius: '0 2px 2px 0', overflow: 'hidden' }}>
                                    {spread[1] && <img src={getOptimizedUrl(spread[1].url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
