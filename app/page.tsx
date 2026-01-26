'use client';

import { useEffect, useState } from 'react';
import PortfolioGallery from './components/PortfolioGallery';

export default function HomePage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        // Show content immediately
        setIsLoaded(true);
    }, []);

    // Close menu when clicking a link
    function handleNavClick() {
        setMenuOpen(false);
    }

    return (
        <>
            {/* Navigation */}
            <nav className="navbar" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                <a href="#hero" className="logo">Helluo_Somnia</a>
                <button
                    className="menu-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu"
                >
                    <span style={{ transform: menuOpen ? 'rotate(45deg) translateY(8px)' : 'none' }}></span>
                    <span style={{ opacity: menuOpen ? 0 : 1 }}></span>
                    <span style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-8px)' : 'none' }}></span>
                </button>
                <ul className={menuOpen ? 'open' : ''}>
                    <li><a href="#about" onClick={handleNavClick}>À propos</a></li>
                    <li><a href="#portfolio" onClick={handleNavClick}>Portfolio</a></li>
                    <li><a href="#exhibitions" onClick={handleNavClick}>Expositions</a></li>
                    <li><a href="#contact" onClick={handleNavClick}>Contact</a></li>
                </ul>
            </nav>

            <main id="main-content" style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}>
                {/* Hero Section */}
                <header id="hero" className="hero">
                    <div className="hero-bg">
                        <img
                            src="https://res.cloudinary.com/duxandnre/image/upload/v1769433418/helluo-somnia/pyro3-hero.webp"
                            alt="Œuvre de Helluo_Somnia"
                            width={1920}
                            height={1080}
                        />
                    </div>
                    <div className="hero-content">
                        <h1 className="hero-title">Helluo_Somnia</h1>
                        <p className="hero-subtitle">— Artiste Contemporaine —</p>
                    </div>
                    <div className="hero-scroll">
                        <span>Défiler</span>
                    </div>
                </header>

                {/* About Section */}
                <section id="about" className="about section-alt">
                    <div className="container">
                        <div className="about-image">
                            <img src="https://res.cloudinary.com/duxandnre/image/upload/v1769433419/helluo-somnia/about-profile.webp" alt="Portrait de Helluo_Somnia" width={600} height={800} />
                        </div>
                        <div className="about-content">
                            <h2 className="section-title">À propos</h2>
                            <p>
                                Je crée des images qui respirent l&apos;ombre et la lumière. Mon travail explore
                                les frontières entre le réel et l&apos;imaginaire — silhouettes, matière, silence.
                            </p>
                            <p>
                                Formée en <strong>arts visuels</strong> et en <strong>direction artistique</strong>,
                                je combine procédés analogiques et outils numériques.
                            </p>
                            <a href="#contact" className="btn">Me contacter</a>
                        </div>
                    </div>
                </section>

                {/* Portfolio Section - Dynamic */}
                <section id="portfolio" className="portfolio">
                    <div className="container">
                        <header className="section-header">
                            <h2 className="section-title">Portfolio</h2>
                        </header>
                        <PortfolioGallery />
                    </div>
                </section>

                {/* Exhibitions Section */}
                <section id="exhibitions" className="exhibitions section-alt">
                    <div className="container">
                        <header className="section-header">
                            <h2 className="section-title">Expositions</h2>
                        </header>
                        <div className="timeline" id="exhibition-timeline">
                            <article className="timeline-item visible">
                                <span className="timeline-year">2026</span>
                                <div className="timeline-content">
                                    <h3 className="timeline-title">Silhouettes et Silences</h3>
                                    <div className="timeline-meta">
                                        <span>📍 Halle des Arts</span>
                                        <span>🏙️ Bordeaux</span>
                                    </div>
                                    <p>10 février 2026 — 15 mars 2026</p>
                                </div>
                            </article>
                            <article className="timeline-item visible">
                                <span className="timeline-year">2025</span>
                                <div className="timeline-content">
                                    <h3 className="timeline-title">Nocturnes d&apos;Encre</h3>
                                    <div className="timeline-meta">
                                        <span>📍 Galerie Raven</span>
                                        <span>🏙️ Paris</span>
                                    </div>
                                    <p>12 septembre 2025 — 20 octobre 2025</p>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="contact">
                    <div className="container">
                        <h2 className="section-title">Contact</h2>
                        <p>
                            Pour toute demande de collaboration, commande ou presse, n&apos;hésitez pas à me contacter.
                        </p>
                        <form
                            className="contact-form"
                            action="https://formspree.io/f/xzdrvvvz"
                            method="POST"
                        >
                            <input type="hidden" name="_next" value="https://helluo-somnia-toi9.vercel.app/merci" />
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Nom complet</label>
                                    <input type="text" id="name" name="name" placeholder="Votre nom" required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" name="email" placeholder="votre@email.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea id="message" name="message" placeholder="Votre message..." required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                <span className="btn-text">Envoyer le message</span>
                            </button>
                        </form>
                        <div className="social-links">
                            <a href="https://www.instagram.com/helluo_somnia/" target="_blank" rel="noopener noreferrer" className="social-link">
                                Instagram
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>© 2025 Helluo_Somnia — Tous droits réservés</p>
                </div>
            </footer>
        </>
    );
}
