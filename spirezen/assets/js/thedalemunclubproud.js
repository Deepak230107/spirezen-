// thedalemun.js
// Accessible accordion behavior for the syllabus modules.
// - toggles aria-expanded
// - animates height via max-height (measured from scrollHeight)
// - supports multiple open items (change behavior easily if you want single-open)

document.addEventListener('DOMContentLoaded', function () {
  const accButtons = Array.from(document.querySelectorAll('.tdm-acc-btn'));

  function openPanel(btn, panel) {
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    // allow measurement
    const height = panel.scrollHeight;
    panel.style.maxHeight = height + 'px';
    btn.parentElement.classList.add('open');
  }

  function closePanel(btn, panel) {
    btn.setAttribute('aria-expanded', 'false');
    // animate to zero height
    panel.style.maxHeight = panel.scrollHeight + 'px'; // reset to current height
    // next frame -> close
    requestAnimationFrame(() => {
      panel.style.maxHeight = '0px';
    });
    btn.parentElement.classList.remove('open');
    // remove hidden after transition to keep DOM accessible for screen readers
    panel.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName === 'max-height' && panel.style.maxHeight === '0px') {
        panel.hidden = true;
      }
      panel.removeEventListener('transitionend', onEnd);
    });
  }

  accButtons.forEach(btn => {
    const panelId = btn.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (!panel) return;

    // ensure panels start hidden and have no maxHeight inline set
    if (btn.getAttribute('aria-expanded') === 'true') {
      panel.hidden = false;
      panel.style.maxHeight = panel.scrollHeight + 'px';
      btn.parentElement.classList.add('open');
    } else {
      panel.hidden = true;
      panel.style.maxHeight = '0px';
    }

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closePanel(btn, panel);
      } else {
        openPanel(btn, panel);
      }
    });

    // allow keyboard toggling via Enter/Space by default (button already handles it),
    // but we also add Home/End navigation inside the accordion column
    btn.addEventListener('keydown', (ev) => {
      const all = Array.from(btn.closest('.tdm-accordion-col').querySelectorAll('.tdm-acc-btn'));
      const idx = all.indexOf(btn);
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        const next = all[(idx + 1) % all.length];
        next.focus();
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        const prev = all[(idx - 1 + all.length) % all.length];
        prev.focus();
      } else if (ev.key === 'Home') {
        ev.preventDefault(); all[0].focus();
      } else if (ev.key === 'End') {
        ev.preventDefault(); all[all.length - 1].focus();
      }
    });
  });

  // Optional: close panels when clicking outside (commented out — enable if desired)
  // document.addEventListener('click', (e) => {
  //   if (!e.target.closest('.tdm-accordion-grid')) {
  //     accButtons.forEach(btn => {
  //       if (btn.getAttribute('aria-expanded') === 'true') {
  //         const panel = document.getElementById(btn.getAttribute('aria-controls'));
  //         closePanel(btn, panel);
  //       }
  //     });
  //   }
  // });
});




// thedalemun-stats.js
// Animate counters + circular progress charts when .tdm-stats enters viewport.

(function () {
  // utility: format integer with commas
  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // animate integer from 0 -> target over duration (ms)
  function animateNumber(el, target, duration) {
    const start = performance.now();
    const from = 0;
    const to = Number(target);
    if (to === 0) { el.textContent = "0"; return; }

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; // easeInOutQuad-ish
      const val = Math.round(from + (to - from) * eased);
      el.textContent = formatNumber(val);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(to);
    }
    requestAnimationFrame(step);
  }

  // animate percentage text from 0 -> pct and circle stroke
  function animateCircle(metricEl, duration) {
    const pct = Number(metricEl.getAttribute('data-percentage')) || 0;
    const svg = metricEl.querySelector('.tdm-circle');
    const fg = metricEl.querySelector('.tdm-circle-fg');
    const text = metricEl.querySelector('.tdm-circle-value');

    if (!fg || !text) return;

    const radius = 45;
    const circumference = 2 * Math.PI * radius; // ~283
    // ensure dasharray matches computed circle (in case r changes)
    fg.style.strokeDasharray = `${circumference}`;
    // animate via requestAnimationFrame for text; set CSS transition for stroke-dashoffset
    const targetOffset = circumference * (1 - pct / 100);
    // set up initial state
    fg.style.strokeDashoffset = `${circumference}`;
    // animate text number
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
      const currentPct = Math.round(eased * pct);
      text.textContent = currentPct + '%';
      if (t < 1) requestAnimationFrame(step);
      else text.textContent = pct + '%';
    }
    requestAnimationFrame(step);
    // animate stroke (CSS transition handles smoothness)
    // small timeout to ensure browser registered initial dashoffset
    requestAnimationFrame(() => {
      fg.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.2,.9,.2,1)`;
      fg.style.strokeDashoffset = `${targetOffset}`;
    });
  }

  // when .tdm-stats intersects, run once
  function initWhenVisible() {
    const statsSection = document.querySelector('.tdm-stats');
    if (!statsSection) return;

    const options = { root: null, rootMargin: '0px', threshold: 0.18 };
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // animate top numbers
          const nums = statsSection.querySelectorAll('.tdm-stat-num[data-target]');
          nums.forEach(el => {
            const target = Number(el.getAttribute('data-target')) || 0;
            // longer duration for big numbers
            const duration = target > 10000 ? 1600 : 1000;
            animateNumber(el, target, duration);
          });

          // animate circle metrics
          const metrics = statsSection.querySelectorAll('.tdm-metric--circle');
          metrics.forEach(el => animateCircle(el, 1200));

          observer.disconnect(); // run only once
        }
      });
    }, options);

    obs.observe(statsSection);
  }

  // init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenVisible);
  } else {
    initWhenVisible();
  }
})();

