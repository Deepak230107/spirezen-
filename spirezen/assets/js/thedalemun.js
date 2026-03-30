document.addEventListener('DOMContentLoaded', function () {

  // ========================
  // MOBILE MENU (from nav.js)
  // ========================
  const hamburger = document.getElementById('proHamburger');
  const overlay = document.getElementById('proOverlay');
  const drawer = document.getElementById('proDrawer');
  const closeBtn = document.getElementById('proClose');

  if (hamburger && overlay && drawer && closeBtn) {
    const toggleMenu = (open) => {
      hamburger.setAttribute('aria-expanded', open);
      overlay.style.display = open ? 'block' : 'none';
      overlay.classList.toggle('active', open);
      drawer.setAttribute('aria-hidden', !open);
      drawer.style.transform = open ? 'translateY(0)' : 'translateY(100%)';
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => toggleMenu(true));
    closeBtn.addEventListener('click', () => toggleMenu(false));
    overlay.addEventListener('click', () => toggleMenu(false));
  }

  // ========================
  // COUNTDOWN TIMER (new)
  // ========================
  const countdownEl = document.getElementById('countdownTimer');
  if (countdownEl) {
    const targetDate = new Date('November 29, 2025 08:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        countdownEl.innerHTML = '<div class="countdown-label">Event is live!</div>';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      countdownEl.innerHTML = `
        <div class="countdown-label">Registration closes in:</div>
        <div class="countdown-digits">
          <div><span class="num">${String(days).padStart(2, '0')}</span><small>d</small></div>
          <div><span class="num">${String(hours).padStart(2, '0')}</span><small>h</small></div>
          <div><span class="num">${String(minutes).padStart(2, '0')}</span><small>m</small></div>
          <div><span class="num">${String(seconds).padStart(2, '0')}</span><small>s</small></div>
        </div>
      `;
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ========================
  // SCROLL REVEAL (from cardscript.js / announscript.js)
  // ========================
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
  });

  // ========================
  // VERTICAL TIMELINE (REPLACES ITINERARY ACCORDION)
  // ========================
  const timelineContainer = document.getElementById('timeline');
  if (timelineContainer) {
    // Itinerary data matching your original content
    const itinerary = [
      { time: "08:00", event: "Opening Ceremony", day: 1 },
      { time: "09:30", event: "Committee Session 1", day: 1 },
      { time: "11:00", event: "High Tea", day: 1 },
      { time: "11:10", event: "Committee Session 2", day: 1 },
      { time: "14:00", event: "Committee Session 3", day: 1 },
      { time: "16:10", event: "Committee Session 4", day: 1 },
      { time: "18:00", event: "Socials", day: 1 },
      { time: "08:00", event: "Committee Session 5", day: 2 },
      { time: "11:00", event: "High Tea", day: 2 },
      { time: "11:10", event: "Committee Session 6", day: 2 },
      { time: "14:00", event: "Committee Session 7", day: 2 },
      { time: "16:30", event: "Closing Ceremony", day: 2 }
    ];

    itinerary.forEach((item, i) => {
      const node = document.createElement('div');
      node.className = 'timeline-item';
      node.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-time">${item.time} — Day ${item.day}</div>
          <div>${item.event}</div>
        </div>
      `;
      timelineContainer.appendChild(node);
    });

    // Animate timeline nodes on scroll
    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.timeline-item').forEach(item => {
      timelineObserver.observe(item);
    });

    /* ===== TIMELINE SCROLL PROGRESS (NEW) ===== */
    const updateTimelineProgress = () => {
      const rect = timelineContainer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Trigger point: When the section covers the screen
      const triggerPoint = windowHeight * 0.75;

      // Distance from top of timeline to trigger point
      const distanceFromTop = triggerPoint - rect.top;

      // Percentage (clamped 0 to 1)
      let progress = distanceFromTop / rect.height;
      progress = Math.min(Math.max(progress, 0), 1);

      timelineContainer.style.setProperty('--scroll-prog', `${progress * 100}%`);
    };

    window.addEventListener('scroll', updateTimelineProgress, { passive: true });
    window.addEventListener('resize', updateTimelineProgress, { passive: true });
    updateTimelineProgress(); // Initial call
  }

  // ========================
  // REGISTRATION FORM (from script.js)
  // ========================
  const form = document.getElementById('simpleRegisterForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const sel = document.getElementById('amunTicketSelect');
      if (!sel) return;
      const opt = sel.selectedOptions[0];
      const type = opt.value || '';
      const price = opt.dataset.price || '';
      const acco = opt.dataset.acco || 'no';

      try {
        localStorage.setItem('amun_chosen_ticket', JSON.stringify({
          type,
          price_inr: price,
          accommodation: acco
        }));
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }

      let url;
      if (type === 'institutional') {
        url = `contact.html?type=${encodeURIComponent(type)}&price=${encodeURIComponent(price)}&acco=${encodeURIComponent(acco)}`;
      } else {
        url = `thedalemunregistration.html?type=${encodeURIComponent(type)}&price=${encodeURIComponent(price)}&acco=${encodeURIComponent(acco)}`;
      }
      window.location.href = url;
    });
  }


  // YEAR
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // BACK TO TOP BUTTON
  const backToTop = document.querySelector('.back-to-top');

  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 400) {
        backToTop.style.opacity = '1';
        backToTop.style.pointerEvents = 'auto';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.pointerEvents = 'none';
      }
    };

    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop);

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  } // << THIS WAS MISSING !!! ✔


  // FOOTER QUICK LINKS TOGGLE
  const linksToggle = document.querySelector('.links-toggle');
  const quickLinks = document.getElementById('quick-links-list');

  if (linksToggle && quickLinks) {
    linksToggle.addEventListener('click', () => {
      const expanded = linksToggle.getAttribute('aria-expanded') === 'true';
      linksToggle.setAttribute('aria-expanded', !expanded);
      quickLinks.style.display = !expanded ? 'block' : 'none';
      linksToggle.textContent = !expanded ? '▴' : '▾';
    });
  }

}); // Close DOMContentLoaded function
