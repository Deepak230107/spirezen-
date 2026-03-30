document.addEventListener('DOMContentLoaded', () => {
    // --- 1. PARALLAX HERO EFFECT ---
    const heroSection = document.querySelector('.hero');
    const heroLayers = document.querySelectorAll('.parallax-layer');

    if (heroSection && heroLayers.length > 0) {
        heroSection.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;

            heroLayers.forEach((layer) => {
                const speed = layer.getAttribute('data-speed') || 1;
                layer.style.transform = `translateX(${x * speed}px) translateY(${y * speed}px)`;
            });
        });
    }

    // --- 2. SCROLL REVEAL ANIMATIONS ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.fade-up, .fade-up-stagger, .scale-in');
    revealElements.forEach(el => observer.observe(el));


    // --- 3. COUNTDOWN TIMER ---
    // Set deadline to 3 days from now for demo purposes, or a fixed date
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    deadline.setHours(18, 0, 0); // 6 PM

    const timerElement = document.getElementById('countdown-timer');

    if (timerElement) {
        function updateTimer() {
            const now = new Date().getTime();
            const t = deadline - now;

            if (t < 0) {
                timerElement.innerHTML = "Registration Closing!";
                return;
            }

            const days = Math.floor(t / (1000 * 60 * 60 * 24));
            const hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));

            timerElement.innerHTML = `
                <div class="time-block"><span>${days}</span>d</div>
                <div class="sep">:</div>
                <div class="time-block"><span>${hours}</span>h</div>
                <div class="sep">:</div>
                <div class="time-block"><span>${minutes}</span>m</div>
            `;
        }

        setInterval(updateTimer, 1000);
        updateTimer();
    }


    // --- 4. TESTIMONIAL CAROUSEL (Simple) ---
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;

    if (slides.length > 0 && prevBtn && nextBtn) {
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (i === index) slide.classList.add('active');
            });
        }

        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
    }

    // --- 5. FAQ TOGGLE (Enhancement to existing logic if needed) ---
    const faqButtons = document.querySelectorAll('.faq-item button');

    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const expanded = btn.getAttribute('aria-expanded') === 'true' || false;
            // Close all others (optional - accordion style)
            // faqButtons.forEach(b => {
            //     b.setAttribute('aria-expanded', false);
            //     b.parentElement.parentElement.classList.remove('open');
            // });

            btn.setAttribute('aria-expanded', !expanded);
            const parent = btn.parentElement.parentElement;
            parent.classList.toggle('open');
        });
    });
});
