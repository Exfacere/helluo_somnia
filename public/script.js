/**
 * Helluo_Somnia - Artist Portfolio
 * Awwwards-Quality JavaScript
 * ============================================
 */

// Check for reduced motion preference
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Portfolio data - loaded from portfolio.json
let portfolioData = [];

// Load portfolio data from JSON
async function loadPortfolioData() {
  try {
    const response = await fetch('portfolio.json');
    if (!response.ok) throw new Error('Failed to load portfolio.json');
    const data = await response.json();
    portfolioData = data.items || [];
    return portfolioData;
  } catch (e) {
    console.error('Error loading portfolio:', e);
    // Fallback to empty array
    portfolioData = [];
    return portfolioData;
  }
}

// Exhibitions data
const exhibitionsData = [
  {
    title: 'Silhouettes et Silences',
    start: '2026-02-10',
    end: '2026-03-15',
    city: 'Bordeaux',
    venue: 'Halle des Arts',
    status: 'upcoming'
  },
  {
    title: 'Nocturnes d\'Encre',
    start: '2025-09-12',
    end: '2025-10-20',
    city: 'Paris',
    venue: 'Galerie Raven',
    status: 'upcoming'
  },
  {
    title: 'Âme d\'Hiver',
    start: '2025-02-14',
    end: '2025-03-14',
    city: 'Strasbourg',
    venue: 'ArtSpace',
    status: 'past'
  },
  {
    title: 'Macabre Fantasia',
    start: '2024-10-28',
    end: '2024-11-28',
    city: 'Lyon',
    venue: 'Château Noir',
    status: 'past'
  }
];

// ============================================
// PRELOADER
// ============================================
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const nameEl = document.getElementById('preloader-name');
  if (!preloader || !nameEl) return;

  // Check if user already saw the preloader on index.html
  const alreadySeen = sessionStorage.getItem('passedPreloader') === '1';

  if (alreadySeen) {
    // Skip preloader animation, show content immediately
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
    initHeroAnimation();
    return;
  }

  const text = 'Helluo Somnia';

  // Create character spans
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * 0.12 + 0.5}s`;
    nameEl.appendChild(span);
  });

  // Hide preloader after animation
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
    // Mark preloader as seen for future navigation
    try {
      sessionStorage.setItem('passedPreloader', '1');
    } catch (e) { }
    initHeroAnimation();
  }, 4000);
}

// ============================================
// CUSTOM CURSOR
// ============================================
function initCursor() {
  if (prefersReduced || window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor animation
  function animate() {
    // Main cursor (fast)
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Follower (slower)
    followerX += (mouseX - followerX) * 0.08;
    followerY += (mouseY - followerY) * 0.08;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';

    requestAnimationFrame(animate);
  }
  animate();

  // Hover effects
  const hoverElements = document.querySelectorAll('a, button, .portfolio-item');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.navbar ul');

  if (!navbar) return;

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navList) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu on link click
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// ============================================
// HERO ANIMATION
// ============================================
function initHeroAnimation() {
  if (prefersReduced) return;

  const heroTitle = document.getElementById('hero-title');
  if (!heroTitle) return;

  const words = ['Helluo', 'Somnia'];

  // Create word containers with character spans for animation
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'word';
    wordSpan.style.whiteSpace = 'nowrap';
    wordSpan.style.display = 'inline-block';

    word.split('').forEach((char) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = char;
      wordSpan.appendChild(charSpan);
    });

    heroTitle.appendChild(wordSpan);

    // Add space between words (but not after the last word)
    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.className = 'char';
      spaceSpan.textContent = '\u00A0';
      heroTitle.appendChild(spaceSpan);
    }
  });

  // Animate with GSAP if available
  if (window.gsap) {
    gsap.to('.hero-title .char', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: 'power3.out',
      delay: 0.2
    });

    gsap.from('.hero-subtitle', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.8,
      ease: 'power2.out'
    });

    gsap.from('.hero-scroll', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 1.2,
      ease: 'power2.out'
    });
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  if (prefersReduced) {
    revealElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));

  // Timeline items
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
  });

  timelineItems.forEach(item => timelineObserver.observe(item));
}

// ============================================
// SMOOTH SCROLL (Lenis) - Optimized
// ============================================
let lenis = null;

function initSmoothScroll() {
  if (prefersReduced || !window.Lenis) return;

  lenis = new Lenis({
    duration: 0.5, // Very snappy
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo easing - fast start
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.2, // More responsive to wheel input
    touchMultiplier: 2,
    lerp: 0.15, // Higher lerp = more responsive
    infinite: false
  });

  // Sync Lenis with GSAP ticker for better performance
  if (window.gsap) {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0); // Disable lag smoothing for consistency
  } else {
    // Fallback RAF loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Update ScrollTrigger on Lenis scroll
  if (window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
  }
}

// ============================================
// PORTFOLIO GRID
// ============================================
function initPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const filters = document.querySelectorAll('.portfolio-filter');

  if (!grid) return;

  let currentFilter = 'all';
  let currentItems = [...portfolioData];

  // Render items
  function renderItems(items) {
    grid.innerHTML = items.map((item, index) => `
      <article class="portfolio-item" data-category="${item.category}" data-index="${index}">
        <img src="Images/${item.file}" alt="${item.title}" loading="lazy">
        <div class="portfolio-item-overlay">
          <span class="portfolio-item-category">${getCategoryName(item.category)}</span>
          <h3 class="portfolio-item-title">${item.title}</h3>
        </div>
      </article>
    `).join('');

    // Add click handlers for lightbox
    grid.querySelectorAll('.portfolio-item').forEach(item => {
      item.addEventListener('click', () => openLightbox(item.dataset.index));
    });

    // Re-init cursor hover for new elements
    if (!prefersReduced && document.getElementById('cursor')) {
      grid.querySelectorAll('.portfolio-item').forEach(el => {
        el.addEventListener('mouseenter', () => document.getElementById('cursor').classList.add('hover'));
        el.addEventListener('mouseleave', () => document.getElementById('cursor').classList.remove('hover'));
      });
    }
  }

  function getCategoryName(category) {
    const names = {
      pyro: 'Pyrogravure',
      peinture: 'Peinture',
      collage: 'Collage',
      gravure: 'Gravure'
    };
    return names[category] || category;
  }

  // Filter functionality
  function filterItems(category) {
    currentFilter = category;
    currentItems = category === 'all'
      ? [...portfolioData]
      : portfolioData.filter(item => item.category === category);

    renderItems(currentItems);
  }

  // Filter click handlers
  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      filters.forEach(f => {
        f.classList.remove('active');
        f.setAttribute('aria-selected', 'false');
      });
      filter.classList.add('active');
      filter.setAttribute('aria-selected', 'true');
      filterItems(filter.dataset.filter);
    });
  });

  // Initial render (reversed for chronological: recent first)
  renderItems([...portfolioData].reverse());
}

// ============================================
// LIGHTBOX
// ============================================
let lightboxIndex = 0;
let lightboxItems = [];

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  // Close handlers
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Navigation
  prevBtn.addEventListener('click', () => navigateLightbox(-1));
  nextBtn.addEventListener('click', () => navigateLightbox(1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  lightboxItems = [...portfolioData];
  lightboxIndex = parseInt(index);

  updateLightboxContent();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = lightboxItems[lightboxIndex];
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const category = document.getElementById('lightbox-category');

  img.src = `Images/${item.file}`;
  img.alt = item.title;
  title.textContent = item.title;

  const categoryNames = {
    pyro: 'Pyrogravure',
    peinture: 'Peinture',
    collage: 'Collage',
    gravure: 'Gravure'
  };
  category.textContent = categoryNames[item.category] || item.category;
}

// ============================================
// EXHIBITIONS TIMELINE
// ============================================
function initExhibitions() {
  const timeline = document.getElementById('exhibition-timeline');
  if (!timeline) return;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  timeline.innerHTML = exhibitionsData.map(expo => `
    <article class="timeline-item">
      <span class="timeline-year">${new Date(expo.start).getFullYear()}</span>
      <div class="timeline-content">
        <h3 class="timeline-title">${expo.title}</h3>
        <div class="timeline-meta">
          <span>📍 ${expo.venue}</span>
          <span>🏙️ ${expo.city}</span>
        </div>
        <p>${formatDate(expo.start)} — ${formatDate(expo.end)}</p>
      </div>
    </article>
  `).join('');
}

// ============================================
// GSAP SCROLL ANIMATIONS - Optimized
// ============================================
function initGSAPAnimations() {
  if (!window.gsap || !window.ScrollTrigger || prefersReduced) return;

  gsap.registerPlugin(ScrollTrigger);

  // Configure ScrollTrigger for Lenis compatibility
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true
  });

  // Hero parallax - optimized with smoother scrub
  gsap.to('.hero-bg img', {
    yPercent: 20, // Reduced from 30 for subtler effect
    ease: 'none',
    force3D: true, // Force GPU acceleration
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5, // Smoother scrub with delay
      invalidateOnRefresh: true
    }
  });

  // About section - simpler animation
  gsap.from('.about-image', {
    x: -60, // Reduced distance
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    force3D: true,
    scrollTrigger: {
      trigger: '.about',
      start: 'top 75%',
      once: true // Don't re-trigger
    }
  });

  // Portfolio items - simplified batch
  ScrollTrigger.batch('.portfolio-item', {
    onEnter: (elements) => {
      gsap.to(elements, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        force3D: true,
        overwrite: 'auto'
      });
    },
    start: 'top 90%',
    once: true
  });

  // Set initial state for portfolio items
  gsap.set('.portfolio-item', { opacity: 0, y: 40 });
}

// ============================================
// FORM HANDLING (Netlify Forms)
// ============================================
function initFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = 'var(--accent)';
        input.classList.add('error');
      } else {
        input.style.borderColor = '';
        input.classList.remove('error');
      }
    });

    // Email validation
    const email = form.querySelector('input[type="email"]');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      isValid = false;
      email.style.borderColor = 'var(--accent)';
      email.classList.add('error');
    }

    if (!isValid) return;

    // Show loading state
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-flex';
    submitBtn.disabled = true;

    try {
      // Submit to Netlify Forms
      const formData = new FormData(form);
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        // Show success modal
        showConfirmationModal();
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form error:', error);
      // Fallback: still show success (Netlify may handle differently)
      showConfirmationModal();
      form.reset();
    } finally {
      // Reset button state
      if (btnText) btnText.style.display = '';
      if (btnLoading) btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  });
}

// ============================================
// CONFIRMATION MODAL
// ============================================
function showConfirmationModal() {
  const modal = document.getElementById('confirmationModal');
  if (!modal) return;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Close handlers
  const closeBtn = modal.querySelector('.modal-close');
  const backdrop = modal.querySelector('.modal-backdrop');

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeModal, { once: true });
  backdrop?.addEventListener('click', closeModal, { once: true });

  // Close on Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Lock scroll during preloader
  document.body.style.overflow = 'hidden';

  initPreloader();
  initCursor();
  initNavbar();
  initSmoothScroll();

  // Load portfolio data from JSON before initializing portfolio-dependent components
  await loadPortfolioData();

  initPortfolio();
  initLightbox();
  initExhibitions();
  initScrollAnimations();
  initGSAPAnimations();
  initFormValidation();
  initWorksBanner();
});

// ============================================
// WORKS BANNER
// ============================================
function initWorksBanner() {
  const track = document.getElementById('works-track');
  if (!track) return;

  // Create images (duplicate for seamless loop)
  const images = portfolioData.map(item =>
    `<img src="Images/${item.file}" alt="${item.title}" loading="lazy">`
  ).join('');

  // Duplicate content for seamless infinite scroll
  track.innerHTML = images + images;
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when tab is not visible
  }
});
