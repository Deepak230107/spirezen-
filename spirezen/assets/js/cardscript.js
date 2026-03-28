(function () {
  // DOM refs
  const slider = document.getElementById("announcementSlider");
  const container = document.querySelector(".announcement_slider_container");

  if (!slider || !container) return; // Exit if elements not found

  const prevBtn = container.querySelector(".announcement_button.prev");
  const nextBtn = container.querySelector(".announcement_button.next");

  // state
  let cards = Array.from(slider.querySelectorAll(".announcement_card"));
  let currentIndex = 0;     // integer index
  let visible = 3;          // number visible (calcVisible)
  let gapPx = 20;           // will be read from computed style
  let cardWidthPx = 0;      // measured width of one card (excludes gap)
  let stepPx = 0;           // cardWidthPx + gapPx -> px shift per index
  const AUTOPLAY_MS = 4500;
  const SWIPE_THRESHOLD = 50;

  // scrub / drag
  let isScrubbing = false;
  let scrubTarget = 0;      // fractional index target
  let smoothCurrent = 0;    // fractional index for smoothing
  const SMOOTH_FACTOR = 0.12;

  let isDragging = false;
  let startX = 0;
  let deltaX = 0;

  let autoplayTimer = null;

  // calculate visible based on breakpoints
  function calcVisible() {
    const w = window.innerWidth;
    if (w <= 480) return 1;
    if (w <= 768) return 1;
    if (w <= 1024) return 2;
    return 3;
  }

  // measure gap from computed style (fallback to 20)
  function measureGap() {
    const cs = getComputedStyle(slider);
    // computed gap could be something like "20px" or "0px"
    const gapVal = cs.getPropertyValue("gap") || cs.getPropertyValue("column-gap") || "20px";
    gapPx = parseFloat(gapVal) || 20;
  }

  // measure card width and step in pixels — must run after card flex-basis applied
  function measureCardWidth() {
    cards = Array.from(slider.querySelectorAll(".announcement_card"));
    if (!cards.length) {
      cardWidthPx = 0;
      stepPx = gapPx;
      return;
    }
    // ensure layout has been flushed so getBoundingClientRect is accurate
    const rect = cards[0].getBoundingClientRect();
    cardWidthPx = Math.round(rect.width);
    stepPx = cardWidthPx + gapPx;
  }

  // set CSS flex-basis for cards (still use calc(...) to account for gap in visible)
  function setCardWidths() {
    visible = calcVisible();
    measureGap();

    const totalGap = (visible - 1) * gapPx;
    const cardWidthCss = `calc((100% - ${totalGap}px) / ${visible})`;

    cards.forEach((card) => {
      card.style.flex = `0 0 ${cardWidthCss}`;
      card.style.maxWidth = cardWidthCss;
      card.style.boxSizing = "border-box";
    });

    // measure actual pixel widths after DOM changes (use rAF slot)
    requestAnimationFrame(() => {
      measureCardWidth();
      // clamp indices and update position without animation
      currentIndex = clampIndex(currentIndex);
      scrubTarget = clampScrubTarget(scrubTarget);
      smoothCurrent = currentIndex;
      setTransformForFractionalIndex(currentIndex, false);
    });
  }

  function clampIndex(i) {
    const n = cards.length;
    if (n === 0) return 0;
    const maxStart = Math.max(0, n - visible);
    return Math.min(maxStart, Math.max(0, i | 0));
  }

  function clampScrubTarget(t) {
    const n = cards.length;
    if (n === 0) return 0;
    return Math.min(Math.max(0, t), Math.max(0, n - visible));
  }

  // Convert fractional index to pixel translation and apply
  function setTransformForFractionalIndex(frac, animate = true) {
    const translatePx = frac * stepPx;
    if (!animate) slider.classList.add("no-transition");
    else slider.classList.remove("no-transition");
    slider.style.transform = `translateX(-${translatePx}px)`;
    if (!animate) {
      // remove no-transition after a frame so subsequent transforms animate
      requestAnimationFrame(() => requestAnimationFrame(() => slider.classList.remove("no-transition")));
    }
  }

  function goToIndex(i, animate = true) {
    currentIndex = clampIndex(i);
    scrubTarget = currentIndex;
    setTransformForFractionalIndex(currentIndex, animate);
  }
  function next(n = 1) { goToIndex(currentIndex + n); }
  function prev(n = 1) { goToIndex(currentIndex - n); }

  // autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      const maxStart = Math.max(0, cards.length - visible);
      if (currentIndex >= maxStart) goToIndex(0);
      else next(1);
    }, AUTOPLAY_MS);
  }
  function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  // animation smoothing loop (smoothCurrent in index units)
  function rafLoop() {
    const desired = isScrubbing ? scrubTarget : currentIndex;
    smoothCurrent += (desired - smoothCurrent) * SMOOTH_FACTOR;
    // apply transform in px (no CSS transition; smoothing handled here)
    const translatePx = smoothCurrent * stepPx;
    slider.classList.add("no-transition");
    slider.style.transform = `translateX(-${translatePx}px)`;
    requestAnimationFrame(rafLoop);
  }

  // Cursor-scrub removed — mouse movement no longer scrubs the slider

  // Touch/drag handlers (mobile)
  function onTouchStart(e) {
    stopAutoplay();
    isDragging = true;
    isScrubbing = false;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    slider.classList.add("no-transition");
  }
  function onTouchMove(e) {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    deltaX = startX - x;
    // convert deltaX px to fractional index units
    const fracDelta = deltaX / stepPx;
    const target = clampScrubTarget(currentIndex + fracDelta);
    // apply immediate px transform
    slider.style.transform = `translateX(-${target * stepPx}px)`;
  }
  function onTouchEnd() {
    if (!isDragging) return;
    slider.classList.remove("no-transition");
    isDragging = false;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) next(1); else prev(1);
    } else {
      goToIndex(Math.round(currentIndex), true);
    }
    deltaX = 0;
    restartAutoplay();
  }

  // Pointer (desktop drag)
  function onPointerDown(e) {
    if (e.button && e.button !== 0) return;
    stopAutoplay();
    isDragging = true;
    isScrubbing = false;
    startX = e.clientX;
    slider.setPointerCapture && slider.setPointerCapture(e.pointerId);
    slider.classList.add("no-transition");
  }
  function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.clientX;
    deltaX = startX - x;
    const fracDelta = deltaX / stepPx;
    const target = clampScrubTarget(currentIndex + fracDelta);
    slider.style.transform = `translateX(-${target * stepPx}px)`;
  }
  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    slider.releasePointerCapture && slider.releasePointerCapture(e.pointerId);
    slider.classList.remove("no-transition");
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) next(1); else prev(1);
    } else {
      const approxFrac = smoothCurrent;
      goToIndex(Math.round(approxFrac), true);
    }
    deltaX = 0;
    restartAutoplay();
  }

  // Buttons & keyboard
  prevBtn.addEventListener("click", () => { prev(1); restartAutoplay(); });
  nextBtn.addEventListener("click", () => { next(1); restartAutoplay(); });
  container.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { prev(1); restartAutoplay(); }
    if (e.key === "ArrowRight") { next(1); restartAutoplay(); }
  });
  container.tabIndex = 0;

  // hover / focus (mouse-scrub removed)
  container.addEventListener("focusin", stopAutoplay);
  container.addEventListener("focusout", restartAutoplay);

  // touch & pointer listeners
  slider.addEventListener("touchstart", onTouchStart, { passive: true });
  slider.addEventListener("touchmove", onTouchMove, { passive: true });
  slider.addEventListener("touchend", onTouchEnd, { passive: true });
  slider.addEventListener("touchcancel", onTouchEnd, { passive: true });

  slider.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  // resize handling
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setCardWidths();
    }, 80);
  }
  window.addEventListener("resize", onResize);

  // initialization
  function init() {
    cards = Array.from(slider.querySelectorAll(".announcement_card"));
    setCardWidths();
    currentIndex = 0;
    scrubTarget = 0;
    smoothCurrent = 0;
    startAutoplay();
    requestAnimationFrame(rafLoop);
  }

  // expose minimal API
  window.AnnouncementCarousel = {
    next: () => next(1),
    prev: () => prev(1),
    goTo: (i) => goToIndex(i, true),
    start: startAutoplay,
    stop: stopAutoplay
  };

  init();
})();
