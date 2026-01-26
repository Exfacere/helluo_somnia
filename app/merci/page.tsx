'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to home after 5 seconds
        const timer = setTimeout(() => {
            router.push('/');
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FAFAF8',
            padding: '2rem',
            textAlign: 'center',
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(201, 169, 98, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
            }}>
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C9A962"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h1 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.5rem',
                fontWeight: 500,
                color: '#1A1A1A',
                marginBottom: '1rem',
            }}>
                Message envoyé !
            </h1>
            <p style={{
                fontSize: '1.1rem',
                color: '#5A5A5A',
                maxWidth: '400px',
                marginBottom: '2rem',
            }}>
                Merci pour votre message. Je vous répondrai dans les plus brefs délais.
            </p>
            <a
                href="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #1A1A1A',
                    borderRadius: '4px',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                }}
            >
                ← Retour à l&apos;accueil
            </a>
            <p style={{
                marginTop: '2rem',
                fontSize: '0.875rem',
                color: '#8A8A8A',
            }}>
                Redirection automatique dans 5 secondes...
            </p>
        </div>
    );
}
