/* =========================================
   SPIREZEN DIMENSION - 3D Interactions (GSAP + ScrollTrigger)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger);

    // =========================================
    // 1. HERO SECTION: "The Quantum Core"
    // Deep space cursor tracking on text & logo
    // =========================================
    const heroContent = document.querySelector('.welcome-section .content');
    const heroText = document.querySelector('.contenth1');
    const heroLogo = document.querySelector('.logowel');

    if (heroContent) {
        // Setup highly performant quickTo setters for mouse tracking
        const xText = gsap.quickTo(heroText, "x", { duration: 0.8, ease: "power2.out" });
        const yText = gsap.quickTo(heroText, "y", { duration: 0.8, ease: "power2.out" });
        const rYText = gsap.quickTo(heroText, "rotationY", { duration: 0.8, ease: "power2.out" });
        const rXText = gsap.quickTo(heroText, "rotationX", { duration: 0.8, ease: "power2.out" });

        const xLogo = gsap.quickTo(heroLogo, "x", { duration: 1.2, ease: "power2.out" });
        const yLogo = gsap.quickTo(heroLogo, "y", { duration: 1.2, ease: "power2.out" });
        const rYLogo = gsap.quickTo(heroLogo, "rotationY", { duration: 1.2, ease: "power2.out" });
        const rXLogo = gsap.quickTo(heroLogo, "rotationX", { duration: 1.2, ease: "power2.out" });

        const rYContent = gsap.quickTo(heroContent, "rotationY", { duration: 1.8, ease: "power1.out" });
        const rXContent = gsap.quickTo(heroContent, "rotationX", { duration: 1.8, ease: "power1.out" });

        let centerX = window.innerWidth / 2;
        let centerY = window.innerHeight / 2;

        window.addEventListener('resize', () => {
            centerX = window.innerWidth / 2;
            centerY = window.innerHeight / 2;
        });

        document.addEventListener('mousemove', (e) => {
            // Using requestAnimationFrame to throttle mousemove slightly could help, but quickTo handles it beautifully
            const x = (e.clientX - centerX) / centerX;
            const y = (e.clientY - centerY) / centerY;

            // Animate Text deeply Inverse
            xText(-x * 40);
            yText(-y * 40);
            rYText(x * 15);
            rXText(-y * 15);

            // Animate Logo Forward
            xLogo(x * 20);
            yLogo(y * 20);
            rYLogo(x * 25);
            rXLogo(-y * 25);

            // Subtle shift on the whole wrapper
            rYContent(x * 5);
            rXContent(-y * 5);
        }, { passive: true }); // passive listener reduces main thread blocking
    }

    // =========================================
    // 2. VIDEO SECTION: "Holographic Projection"
    // Aggressive tilt that flattens out on scroll
    // =========================================
    const videoWrapper = document.querySelector('.video-wrapper');
    if (videoWrapper) {
        // Initial set flat for trigger point
        gsap.set(videoWrapper, { rotationX: 45, scale: 0.8, y: 100, opacity: 0 });

        ScrollTrigger.create({
            trigger: '.video-section',
            start: "top 80%",
            end: "center center",
            scrub: 1, // Smooth scrubbing
            animation: gsap.to(videoWrapper, {
                rotationX: 0,
                scale: 1,
                y: 0,
                opacity: 1,
                boxShadow: "0 30px 60px rgba(0,0,0,0.8), 0 0 0 2px rgba(232,170,86,0.6)",
                ease: "power2.out"
            })
        });
    }

    // =========================================
    // 3. QUOTE SECTION: "Layout Tension"
    // =========================================
    const splitQuoteLeft = document.querySelector('.split-quote-left');
    const splitQuoteRight = document.querySelector('.split-quote-right');
    const accentWords = document.querySelectorAll('.split-quote-section .accent-word');

    if (splitQuoteLeft && splitQuoteRight) {
        const quoteTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.split-quote-section',
                start: "top 70%", // Start animation when 70% of the section is in view
                toggleActions: "play none none none"
            }
        });

        // Step 1: Left block fades in and slides from left
        quoteTl.to(splitQuoteLeft, {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out"
        });

        // Step 2: Right block slides in from right after 0.4s delay
        quoteTl.to(splitQuoteRight, {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out"
        }, "-=0.3"); // Overlap slightly to match the 0.4s delay after left block starts (0.7 - 0.3 = 0.4)

        // Step 3: Accent words highlight after text settles
        if (accentWords.length > 0) {
            quoteTl.add(() => {
                accentWords.forEach(word => word.classList.add('highlight'));
            }, "+=0.5"); // 0.5s delay after the blocks settle
        }
    }

    // =========================================
    // 4. BIO SECTION: "Isometric Split-View"
    // Assembles from off-screen
    // =========================================
    const bioImage = document.querySelector('.indeximagebio_image');
    const bioContent = document.querySelector('.indeximagebio_content');

    if (bioImage && bioContent) {
        const bioTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.indeximagebio_section',
                start: "top 75%",
                end: "center center",
                scrub: 1.5
            }
        });

        // Image flies in from left, isometric angle
        bioTl.fromTo(bioImage,
            { x: -200, opacity: 0, rotationY: -45, scale: 0.8 },
            { x: 0, opacity: 1, rotationY: 0, scale: 1, ease: "power3.out" }
        );

        // Content flies in from right
        bioTl.fromTo(bioContent,
            { x: 200, opacity: 0, rotationY: 45, scale: 0.8 },
            { x: 0, opacity: 1, rotationY: 0, scale: 1, ease: "power3.out" },
            "<" // start at same time
        );
    }

    // =========================================
    // 5. MUNTERRA SECTION: "Golden Monolith"
    // =========================================
    const amunImage = document.querySelector('.amun_image');
    const amunContent = document.querySelector('.amun_content');

    if (amunImage && amunContent) {
        // Metallic rise effect
        gsap.fromTo(amunImage,
            { y: 150, rotationX: 30, opacity: 0, filter: "brightness(0.5) contrast(1.5)" },
            {
                y: 0, rotationX: 0, opacity: 1, filter: "brightness(1) contrast(1)",
                duration: 1.5, ease: "back.out(1.7)",
                scrollTrigger: {
                    trigger: '.amun_intro',
                    start: "top 80%"
                }
            }
        );

        gsap.from(amunContent.children, {
            y: 50, opacity: 0, stagger: 0.2, duration: 1, ease: "power2.out",
            scrollTrigger: {
                trigger: '.amun_intro',
                start: "top 70%"
            }
        });
    }

    // =========================================
    // 6. PRODUCT LINEUP: "Cybernetic Coverflow"
    // =========================================
    const prodContainer = document.querySelector('.prodlineup_container');

    if (prodContainer) {
        gsap.fromTo(prodContainer,
            { z: -800, rotationX: 60, opacity: 0 },
            {
                z: 0, rotationX: 0, opacity: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: '.prodlineup_section',
                    start: "top 85%",
                    end: "center center",
                    scrub: 1
                }
            }
        );
    }

    // =========================================
    // 7. STATS SECTION: "Floating Orbs/Nodes"
    // Animate the entire container to prevent cloning conflicts
    // =========================================
    const statContainer = document.querySelector('.testimun_name-container');
    if (statContainer) {
        gsap.from(statContainer, {
            y: 100,
            z: -200,
            opacity: 0,
            rotationX: -20,
            duration: 1.5,
            ease: "back.out(1.2)",
            scrollTrigger: {
                trigger: '.testimun_name-section',
                start: "top 85%"
            }
        });
    }


    // =========================================
    // 8. TEAM SECTION: "2026 — Carousel Dimension"
    // 3D reveal + hologram lock + neon ring + char stagger
    // =========================================
    const teamSection = document.querySelector('.team-split-section');
    const teamLeft = document.querySelector('.team-split-left');
    const teamOverline = document.querySelector('.team-overline');
    const teamTitle = document.querySelector('.team-title');
    const teamDesc = document.querySelector('.team-description');
    const teamCarousel = document.querySelector('.team-carousel');
    const teamDots = document.querySelector('.team-nav-dots');

    if (teamSection && teamLeft && teamCarousel) {

        // ── Left column: staggered slide-in from left ──
        gsap.set([teamOverline, teamTitle, teamDesc], { x: -80, opacity: 0 });
        gsap.to([teamOverline, teamTitle, teamDesc], {
            x: 0, opacity: 1,
            duration: 0.9, ease: 'power3.out', stagger: 0.18,
            scrollTrigger: {
                trigger: teamSection, start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        // ── (1) 3D Perspective Reveal — scales up from deep Z ──
        gsap.set(teamCarousel, { z: -600, scale: 0.65, opacity: 0, rotationX: 22 });
        gsap.to(teamCarousel, {
            z: 0, scale: 1, opacity: 1, rotationX: 0,
            duration: 1.4, ease: 'back.out(1.5)',
            scrollTrigger: {
                trigger: teamSection, start: 'top 78%',
                toggleActions: 'play none none none'
            },
            onComplete: () => {

                // ── (3) Double Neon Ring — gold inner + white outer pulse ──
                gsap.fromTo(teamCarousel,
                    {
                        boxShadow:
                            '0 0 0 0px rgba(232,170,86,0), ' +
                            '0 0 0 0px rgba(255,255,255,0)'
                    },
                    {
                        boxShadow:
                            '0 0 0 3px rgba(232,170,86,0.9), ' +
                            '0 0 0 6px rgba(255,255,255,0.35), ' +
                            '0 0 50px rgba(232,170,86,0.3)',
                        duration: 0.55, ease: 'power2.out',
                        yoyo: true, repeat: 1,
                        onComplete: () => {
                            // Settle to a thin persistent gold ring
                            gsap.to(teamCarousel, {
                                boxShadow:
                                    '0 0 0 2px rgba(232,170,86,0.5), ' +
                                    '0 0 20px rgba(232,170,86,0.1)',
                                duration: 0.4
                            });
                        }
                    }
                );
            }
        });

        // ── (4) Per-character name stagger ──
        // Utility: split a text node into <span> per character
        function splitToChars(el) {
            if (!el || el.dataset.charSplit) return;
            el.dataset.charSplit = '1';
            const text = el.textContent;
            el.textContent = '';
            text.split('').forEach(ch => {
                const s = document.createElement('span');
                s.className = 'char-s';
                s.textContent = ch === ' ' ? '\u00A0' : ch;
                s.style.display = 'inline-block';
                s.style.opacity = '0';
                s.style.transform = 'translateY(14px)';
                el.appendChild(s);
            });
        }

        // Apply char split to active slide name immediately
        const activeSlide = teamCarousel.querySelector('.team-slide.active, .team-slide');
        const activeName = activeSlide ? activeSlide.querySelector('.team-slide-info h3') : null;
        if (activeName) {
            splitToChars(activeName);
            // Animate chars in after the carousel lands (1.4s delay matches reveal duration)
            gsap.to(activeName.querySelectorAll('.char-s'), {
                opacity: 1, y: 0,
                duration: 0.4, ease: 'power2.out', stagger: 0.03,
                delay: 1.4
            });
        }

        // Hook into slide changes — re-run char stagger on every new slide
        // We observe the carousel for class changes on slides using MutationObserver
        const mo = new MutationObserver(() => {
            const nowActive = teamCarousel.querySelector('.team-slide.active');
            if (!nowActive) return;
            const nameEl = nowActive.querySelector('.team-slide-info h3');
            if (!nameEl) return;
            splitToChars(nameEl);
            gsap.fromTo(nameEl.querySelectorAll('.char-s'),
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.03 }
            );
        });
        mo.observe(teamCarousel, { subtree: true, attributeFilter: ['class'] });

        // ── Dots fade in last ──
        if (teamDots) {
            gsap.set(teamDots, { opacity: 0, y: 20 });
            gsap.to(teamDots, {
                opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.7,
                scrollTrigger: {
                    trigger: teamSection, start: 'top 78%',
                    toggleActions: 'play none none none'
                }
            });
        }

        // ── Hover: live 3D tilt on carousel ──
        const tiltX = gsap.quickTo(teamCarousel, 'rotationY', { duration: 0.5, ease: 'power2.out' });
        const tiltY = gsap.quickTo(teamCarousel, 'rotationX', { duration: 0.5, ease: 'power2.out' });
        teamCarousel.addEventListener('mousemove', (e) => {
            const rect = teamCarousel.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            tiltX(nx * 8);
            tiltY(-ny * 8);
        }, { passive: true });
        teamCarousel.addEventListener('mouseleave', () => { tiltX(0); tiltY(0); });
    }


    // =========================================
    // 9. FEATURES: "Levitating Pillars"
    // =========================================
    const features = document.querySelectorAll('.feature-box');
    if (features.length > 0) {
        features.forEach((feat, i) => {
            gsap.fromTo(feat,
                { y: 150, z: -300, rotationX: -45, opacity: 0 },
                {
                    y: 0, z: 0, rotationX: 0, opacity: 1,
                    duration: 1.2, delay: i * 0.15, ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: '.key-features-section',
                        start: "top 80%"
                    }
                }
            );
        });
    }

    // =========================================
    // 10. ANNOUNCEMENTS: "Hyper-Tunnel"
    // =========================================
    const announcementSlider = document.querySelector('.announcement_slider');
    if (announcementSlider) {
        gsap.fromTo(announcementSlider,
            { scale: 0.2, z: -2000, opacity: 0 },
            {
                scale: 1, z: 0, opacity: 1,
                duration: 1.5, ease: "expo.out",
                scrollTrigger: {
                    trigger: '.announcement_section',
                    start: "top 80%"
                }
            }
        );
    }

    // =========================================
    // 11. FOOTER REVEAL
    // =========================================
    const footer = document.querySelector('.footer-container');
    if (footer) {
        gsap.fromTo(footer,
            { rotationX: -20, y: 100, transformOrigin: "top center", opacity: 0 },
            {
                rotationX: 0, y: 0, opacity: 1,
                scrollTrigger: {
                    trigger: '.footer-container',
                    start: "top 95%",
                    end: "bottom bottom",
                    scrub: 1
                }
            }
        );
    }

});
