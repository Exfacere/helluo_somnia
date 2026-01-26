import { promises as fs } from 'fs';
import path from 'path';

interface PortfolioItem {
    id?: string;
    file: string;
    title: string;
    category: string;
}

async function getPortfolio(): Promise<PortfolioItem[]> {
    try {
        const filePath = path.join(process.cwd(), 'data', 'portfolio.json');
        const data = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(data);
        return json.items || [];
    } catch {
        return [];
    }
}

export default async function HomePage() {
    const items = await getPortfolio();

    return (
        <>
            {/* Preloader */}
            <div id="preloader" className="preloader">
                <div className="preloader-content">
                    <h1 className="preloader-name" id="preloader-name"></h1>
                    <div className="preloader-line"></div>
                </div>
            </div>

            {/* Custom Cursor */}
            <div className="cursor" id="cursor"></div>
            <div className="cursor-follower" id="cursor-follower"></div>

            {/* Navigation */}
            <nav className="navbar">
                <a href="#hero" className="logo">Helluo_Somnia</a>
                <ul>
                    <li><a href="#about">À propos</a></li>
                    <li><a href="#portfolio">Portfolio</a></li>
                    <li><a href="#exhibitions">Expositions</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>

            <main id="main-content">
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
                        <h1 className="hero-title" id="hero-title"></h1>
                        <p className="hero-subtitle">— Artiste Contemporaine —</p>
                    </div>
                    <div className="hero-scroll">
                        <span>Défiler</span>
                    </div>
                </header>

                {/* Works Banner */}
                <section className="works-banner">
                    <div className="works-track" id="works-track">
                        {items.slice(0, 10).map((item, i) => (
                            <img key={i} src={item.file} alt={item.title} loading="lazy" />
                        ))}
                        {items.slice(0, 10).map((item, i) => (
                            <img key={`dup-${i}`} src={item.file} alt={item.title} loading="lazy" />
                        ))}
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="about section-alt">
                    <div className="container">
                        <div className="about-image reveal">
                            <img src="https://res.cloudinary.com/duxandnre/image/upload/v1769433419/helluo-somnia/about-profile.webp" alt="Portrait de Helluo_Somnia" width={600} height={800} />
                        </div>
                        <div className="about-content">
                            <h2 className="section-title reveal">À propos</h2>
                            <p className="reveal reveal-delay-1">
                                Je crée des images qui respirent l&apos;ombre et la lumière. Mon travail explore
                                les frontières entre le réel et l&apos;imaginaire — silhouettes, matière, silence.
                            </p>
                            <p className="reveal reveal-delay-2">
                                Formée en <strong>arts visuels</strong> et en <strong>direction artistique</strong>,
                                je combine procédés analogiques et outils numériques.
                            </p>
                            <a href="#contact" className="btn reveal reveal-delay-4">Me contacter</a>
                        </div>
                    </div>
                </section>

                {/* Portfolio Section */}
                <section id="portfolio" className="portfolio">
                    <div className="container">
                        <header className="section-header">
                            <h2 className="section-title reveal">Portfolio</h2>
                            <nav className="portfolio-filters reveal">
                                <button className="portfolio-filter active" data-filter="all">Toutes</button>
                                <button className="portfolio-filter" data-filter="pyro">Pyrogravures</button>
                                <button className="portfolio-filter" data-filter="peinture">Peintures</button>
                                <button className="portfolio-filter" data-filter="collage">Collages</button>
                                <button className="portfolio-filter" data-filter="gravure">Gravures</button>
                            </nav>
                        </header>
                        <div className="portfolio-grid" id="portfolio-grid">
                            {items.map((item, i) => (
                                <article
                                    key={item.id || i}
                                    className="portfolio-item"
                                    data-category={item.category}
                                >
                                    <img src={item.file} alt={item.title} loading="lazy" />
                                    <div className="portfolio-item-overlay">
                                        <span className="portfolio-item-category">
                                            {item.category === 'pyro' ? 'Pyrogravure' :
                                                item.category === 'peinture' ? 'Peinture' :
                                                    item.category === 'collage' ? 'Collage' :
                                                        item.category === 'gravure' ? 'Gravure' : item.category}
                                        </span>
                                        <h3 className="portfolio-item-title">{item.title}</h3>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Exhibitions Section */}
                <section id="exhibitions" className="exhibitions section-alt">
                    <div className="container">
                        <header className="section-header">
                            <h2 className="section-title reveal">Expositions</h2>
                        </header>
                        <div className="timeline" id="exhibition-timeline">
                            <article className="timeline-item">
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
                            <article className="timeline-item">
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
                        <h2 className="section-title reveal">Contact</h2>
                        <p className="reveal reveal-delay-1">
                            Pour toute demande de collaboration, commande ou presse, n&apos;hésitez pas à me contacter.
                        </p>
                        <form className="contact-form reveal reveal-delay-2" name="contact" method="POST" data-netlify="true">
                            <input type="hidden" name="form-name" value="contact" />
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
                        <div className="social-links reveal reveal-delay-3">
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

            {/* Scripts */}
            <script defer src="/vendor/gsap/gsap.min.js"></script>
            <script defer src="/vendor/gsap/ScrollTrigger.min.js"></script>
            <script defer src="/vendor/lenis/lenis.min.js"></script>
            <script defer src="/script.js"></script>
        </>
    );
}
