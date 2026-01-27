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
}

export default function ExhibitionsTimeline() {
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchExhibitions() {
            try {
                const res = await fetch('/api/exhibitions');
                const data = await res.json();
                // Sort by startDate descending (most recent first)
                const sorted = (data.items || []).sort((a: Exhibition, b: Exhibition) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                );
                setExhibitions(sorted);
            } catch (err) {
                console.error('Failed to load exhibitions:', err);
            }
            setLoading(false);
        }

        fetchExhibitions();
    }, []);

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function getYear(dateString: string): number {
        return new Date(dateString).getFullYear();
    }

    if (loading) {
        return (
            <div className="timeline">
                <article className="timeline-item visible">
                    <span className="timeline-year">...</span>
                    <div className="timeline-content">
                        <p style={{ color: '#666', fontStyle: 'italic' }}>Chargement des expositions...</p>
                    </div>
                </article>
            </div>
        );
    }

    if (exhibitions.length === 0) {
        return (
            <div className="timeline">
                <article className="timeline-item visible">
                    <div className="timeline-content">
                        <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune exposition pour le moment. Revenez bientôt !</p>
                    </div>
                </article>
            </div>
        );
    }

    return (
        <div className="timeline" id="exhibition-timeline">
            {exhibitions.map((exh) => (
                <article key={exh.id} className="timeline-item visible">
                    <span className="timeline-year">{getYear(exh.startDate)}</span>
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
            ))}
        </div>
    );
}
