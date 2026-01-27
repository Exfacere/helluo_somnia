'use client';

import { useEffect, useState } from 'react';

interface Exhibition {
    id: string;
    title: string;
    location: string;
    city: string;
    startDate: string;
    endDate?: string;
    description?: string;
    image?: string;
    createdAt: string;
}

// Format date for display
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Get year from date string
function getYear(dateStr: string): number {
    return new Date(dateStr).getFullYear();
}

export default function ExhibitionsTimeline() {
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadExhibitions() {
            try {
                const res = await fetch('/api/exhibitions');
                const data = await res.json();
                // Sort by startDate descending (most recent first)
                const sorted = (data.items || []).sort((a: Exhibition, b: Exhibition) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );
                setExhibitions(sorted);
            } catch (err) {
                console.error('Error loading exhibitions:', err);
            }
            setLoading(false);
        }
        loadExhibitions();
    }, []);

    if (loading) {
        return (
            <div className="timeline" id="exhibition-timeline">
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Chargement des expositions...
                </div>
            </div>
        );
    }

    if (exhibitions.length === 0) {
        return (
            <div className="timeline" id="exhibition-timeline">
                <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                    Aucune exposition pour le moment.
                </p>
            </div>
        );
    }

    // Group exhibitions by year
    const exhibitionsByYear: Record<number, Exhibition[]> = {};
    exhibitions.forEach(exh => {
        const year = getYear(exh.startDate);
        if (!exhibitionsByYear[year]) {
            exhibitionsByYear[year] = [];
        }
        exhibitionsByYear[year].push(exh);
    });

    // Get years sorted descending
    const years = Object.keys(exhibitionsByYear)
        .map(Number)
        .sort((a, b) => b - a);

    return (
        <div className="timeline" id="exhibition-timeline">
            {years.map(year => (
                exhibitionsByYear[year].map((exh, index) => (
                    <article key={exh.id} className="timeline-item visible">
                        {index === 0 && (
                            <span className="timeline-year">{year}</span>
                        )}
                        <div className="timeline-content">
                            <h3 className="timeline-title">{exh.title}</h3>
                            <div className="timeline-meta">
                                <span>📍 {exh.location}</span>
                                <span>🏙️ {exh.city}</span>
                            </div>
                            <p>
                                {formatDate(exh.startDate)}
                                {exh.endDate && ` — ${formatDate(exh.endDate)}`}
                            </p>
                            {exh.description && (
                                <p className="timeline-description">{exh.description}</p>
                            )}
                        </div>
                    </article>
                ))
            ))}
        </div>
    );
}
