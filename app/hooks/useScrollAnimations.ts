'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export function useScrollAnimations() {
    useEffect(() => {
        // Ensure we're in the browser
        if (typeof window === 'undefined') return;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            // Animate section titles
            gsap.utils.toArray('.section-title').forEach((el) => {
                gsap.fromTo(
                    el as Element,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el as Element,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });

            // Animate about section content
            const aboutContent = document.querySelector('.about-content');
            if (aboutContent) {
                gsap.fromTo(
                    aboutContent,
                    { opacity: 0, x: 50 },
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
                gsap.fromTo(
                    aboutImage,
                    { opacity: 0, x: -50 },
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

            // Animate timeline items with stagger
            gsap.utils.toArray('.timeline-item').forEach((el, index) => {
                gsap.fromTo(
                    el as Element,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el as Element,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            });

            // Animate contact form
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                gsap.fromTo(
                    contactForm,
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
        }, 100);

        // Cleanup
        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);
}
