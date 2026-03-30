document.addEventListener("DOMContentLoaded", () => {
    /* ===== PURE JS SCROLL ANIMATOR ===== */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll(".fade-up");
    fadeElements.forEach((el) => {
        observer.observe(el);
    });

    /* ===== TABS LOGIC (Content Switcher) ===== */
    /* Expose function globally or attach via listeners */
    window.switchTab = function (tabName) {
        // Buttons
        document.querySelectorAll('.ds-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(tabName) || btn.getAttribute('onclick').includes(tabName)) {
                btn.classList.add('active'); // Simple approximation or rely on clicked element
            }
        });

        // Content
        document.querySelectorAll('.ds-tab-content').forEach(content => {
            content.style.display = 'none';
        });

        const target = document.getElementById(tabName + '-content');
        if (target) {
            target.style.display = 'grid'; // Restore grid layout
            // Trigger animation mismatch fix? Just display block/grid
        }
    };

    // Event listeners are handled via inline onclick in HTML which calls switchTab()
    // No additional JS listeners needed for tabs to avoid conflicts.

    /* ===== FAQ ACCORDION LOGIC ===== */
    const faqQuestions = document.querySelectorAll('.ds-faq-q');
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            // Close others if desired (optional, keeping multi-open for now)
            item.classList.toggle('open');
        });
    });

    /* ===== FOOTER YEAR & BACK TO TOP ===== */
    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const backToTopBtn = document.querySelector(".back-to-top");
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ===== FOOTER QUICK LINKS COLLAPSE (MOBILE) ===== */
    const linksToggle = document.querySelector(".links-toggle");
    const quickLinks = document.getElementById("quick-links-list");

    if (linksToggle && quickLinks) {
        linksToggle.addEventListener("click", () => {
            const expanded = linksToggle.getAttribute("aria-expanded") === "true";
            linksToggle.setAttribute("aria-expanded", String(!expanded));
            quickLinks.style.display = expanded ? "none" : "flex";
            quickLinks.style.flexDirection = "column";
            quickLinks.style.alignItems = "flex-start";
        });

        // default collapsed on small screens
        const handleResize = () => {
            if (window.innerWidth <= 880) { // Using 880px from style.css media query
                quickLinks.style.display = "none";
                linksToggle.setAttribute("aria-expanded", "false");
            } else {
                quickLinks.style.display = "flex";
                quickLinks.style.flexDirection = "column";
                quickLinks.style.alignItems = "flex-start";
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
    }
});
