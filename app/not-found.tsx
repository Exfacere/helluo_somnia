import Link from 'next/link';

export default function NotFound() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
                color: '#fff',
                textAlign: 'center',
                padding: '2rem',
            }}
        >
            <h1
                style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 'clamp(4rem, 15vw, 10rem)',
                    fontWeight: 400,
                    color: '#C9A962',
                    marginBottom: '1rem',
                    lineHeight: 1,
                }}
            >
                404
            </h1>
            <p
                style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '1.25rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '2rem',
                    maxWidth: '400px',
                }}
            >
                Cette page semble s&apos;être évanouie dans l&apos;ombre...
            </p>
            <Link
                href="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #C9A962, #8B7355)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '50px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    letterSpacing: '0.05em',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
            >
                ← Retour à l&apos;accueil
            </Link>

            {/* Decorative element */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1rem',
                    fontStyle: 'italic',
                }}
            >
                Helluo_Somnia
            </div>
        </div>
    );
}
