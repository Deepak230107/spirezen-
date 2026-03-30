document.addEventListener('DOMContentLoaded', () => {
  const nav     = document.querySelector('.pro-nav');
  const sheet   = document.getElementById('proDrawer');
  const overlay = document.getElementById('proOverlay');
  const openBtn = document.getElementById('proHamburger');
  const closeBtn = document.getElementById('proClose'); // optional, if you add one later

  if (!nav || !sheet || !overlay || !openBtn) return;

  /* ===== Solid nav on scroll ===== */
  const onScroll = () => (window.scrollY > 10 ? nav.classList.add('is-solid') : nav.classList.remove('is-solid'));
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ===== Active link by URL (desktop + mobile) ===== */
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const markActive = (sel) => {
    document.querySelectorAll(sel).forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href === current) a.classList.add('is-active');
    });
  };
  markActive('.pro-nav__menu .pro-nav__link[href]');
  markActive('.pro-sheet__body a[href]');

  /* ===== Scroll lock helpers (match CSS) ===== */
  let lastFocus = null;
  const lockScroll = (lock) => {
    const m = lock ? 'add' : 'remove';
    document.documentElement.classList[m]('has-sheet-open');
    document.body.classList[m]('has-sheet-open');
  };

  /* ===== Open/Close bottom sheet ===== */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showOverlay() {
    overlay.hidden = false;
    // force reflow so transition applies
    overlay.getBoundingClientRect();
    overlay.classList.add('is-visible');
  }
  function hideOverlay() {
    overlay.classList.remove('is-visible');
    const done = () => { overlay.hidden = true; overlay.removeEventListener('transitionend', done); };
    prefersReduced ? done() : overlay.addEventListener('transitionend', done, { once: true });
  }

  function openSheet() {
    lastFocus = document.activeElement;
    sheet.classList.add('is-open');
    sheet.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    lockScroll(true);
    showOverlay();

    // focus first focusable
    const f = sheet.querySelector('a,button,summary,[tabindex]:not([tabindex="-1"])');
    if (f) f.focus();
  }

  function closeSheet() {
    sheet.classList.remove('is-open');
    sheet.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    lockScroll(false);
    hideOverlay();
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  // Toggle
  openBtn.addEventListener('click', () => {
    const open = openBtn.getAttribute('aria-expanded') === 'true';
    open ? closeSheet() : openSheet();
  });

  // Close affordances
  overlay.addEventListener('click', closeSheet);
  if (closeBtn) closeBtn.addEventListener('click', closeSheet);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.classList.contains('is-open')) closeSheet();
  });

  /* ===== Focus trap inside sheet ===== */
  sheet.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const nodes = sheet.querySelectorAll('a,button,summary,[tabindex]:not([tabindex="-1"])');
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Close the sheet after clicking a link inside it (good for hash links too)
  sheet.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    // Let navigation happen; just close UI immediately
    closeSheet();
  });

  /* ===== Desktop dropdowns (click toggle + click-away + Esc) ===== */
  const ddButtons = Array.from(document.querySelectorAll('.pro-has-dd .pro-nav__btn'));
  const closeAllDropdowns = () => ddButtons.forEach(b => b.setAttribute('aria-expanded', 'false'));

  ddButtons.forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns();
      btn.setAttribute('aria-expanded', String(!isOpen));
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') btn.setAttribute('aria-expanded', 'false');
    });
  });

  // One global click-away (not one per button)
  document.addEventListener('click', (e) => {
    const anyParent = e.target.closest('.pro-has-dd');
    if (!anyParent) closeAllDropdowns();
  });

  /* ===== Drag-to-close (only if handle/head exists) ===== */
  const dragArea = sheet.querySelector('.pro-sheet__head');
  const handle   = sheet.querySelector('.pro-sheet__handle');
  const draggableEls = [dragArea, handle].filter(Boolean);

  let startY = null, currentY = 0, dragging = false;
  const THRESHOLD = 80;

  function onStart(y) {
    if (!sheet.classList.contains('is-open')) return;
    dragging = true; startY = y; currentY = 0;
    sheet.style.transition = 'none';
  }
  function onMove(y) {
    if (!dragging) return;
    currentY = Math.max(0, y - startY);
    sheet.style.transform = `translateY(${currentY}px)`;
    overlay.style.opacity = String(Math.max(0, 1 - currentY / 300));
  }
  function onEnd() {
    if (!dragging) return;
    sheet.style.transition = '';
    overlay.style.opacity = '';
    if (currentY > THRESHOLD) closeSheet();
    else sheet.style.transform = '';
    dragging = false; startY = 0; currentY = 0;
  }

  const bindDrag = (el) => {
    el.addEventListener('pointerdown', (e) => onStart(e.clientY));
    window.addEventListener('pointermove', (e) => onMove(e.clientY));
    window.addEventListener('pointerup', onEnd);

    el.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
    window.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
  };

  draggableEls.forEach(bindDrag);

  /* ===== Reduced motion: skip transforms ===== */
  if (prefersReduced) {
    sheet.style.transition = 'none';
    overlay.style.transition = 'none';
  }
});
