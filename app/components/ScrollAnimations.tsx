'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugin
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function useScrollAnimations() {
    const initialized = useRef(false);

    useEffect(() => {
        // Prevent double initialization
        if (initialized.current) return;
        initialized.current = true;

        // Wait for DOM to be ready
        const timer = setTimeout(() => {
            // Animate section titles
            gsap.utils.toArray('.section-title').forEach((el: any) => {
                gsap.fromTo(el,
                    {
                        opacity: 0,
                        y: 30
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });

            // Animate about section content
            const aboutContent = document.querySelector('.about-content');
            if (aboutContent) {
                gsap.fromTo(aboutContent,
                    { opacity: 0, x: 30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: aboutContent,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // Animate about image
            const aboutImage = document.querySelector('.about-image');
            if (aboutImage) {
                gsap.fromTo(aboutImage,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: aboutImage,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // Animate timeline items
            gsap.utils.toArray('.timeline-item').forEach((el: any, i: number) => {
                gsap.fromTo(el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        delay: i * 0.1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });

            // Animate contact form
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                gsap.fromTo(contactForm,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: contactForm,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // Hero parallax effect
            const heroBg = document.querySelector('.hero-bg img');
            if (heroBg) {
                gsap.to(heroBg, {
                    y: 100,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);
}

export default function ScrollAnimations() {
    useScrollAnimations();
    return null;
}
