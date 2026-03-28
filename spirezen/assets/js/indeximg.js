document.addEventListener("DOMContentLoaded", () => {
  const slides = [...document.querySelectorAll(".team-slide")];
  const dots = [...document.querySelectorAll(".team-dot")];
  const carousel = document.querySelector(".team-carousel");
  if (!slides.length || !carousel) return;

  let current = 0;
  let timer = null;
  let isAnimating = false;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTOPLAY_DELAY = 4500;

  // ---------- Core show/hide ----------
  function show(n, { immediate = false } = {}) {
    const next = (n + slides.length) % slides.length;
    if (next === current) return;

    const from = slides[current];
    const to = slides[next];

    // clear active from all dots first to prevent multiple active dots
    dots.forEach(d => d.classList.remove("active"));
    dots[next]?.classList.add("active");

    // If we want an instant, zero-lag jump (used when user clicks during animation)
    if (immediate || prefersReduced) {
      // reset classes on all slides
      slides.forEach(s => s.classList.remove("active", "exiting"));
      to.classList.add("active");
      current = next;
      isAnimating = false;
      return;
    }

    // if already animating, don't start another animated transition
    if (isAnimating) return;

    isAnimating = true;

    // CSS will handle the smoothness based on your transitions
    from.classList.remove("active");
    from.classList.add("exiting");
    to.classList.add("active");

    const onEnd = (e) => {
      // Only care about opacity finishing on the old slide
      if (e.target !== from || e.propertyName !== "opacity") return;
      from.classList.remove("exiting");
      from.removeEventListener("transitionend", onEnd);
      current = next;
      isAnimating = false;
    };

    from.addEventListener("transitionend", onEnd);
  }

  // ---------- Autoplay ----------
  function start() {
    if (prefersReduced || slides.length <= 1) return;
    stop();
    timer = setInterval(() => show(current + 1), AUTOPLAY_DELAY);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // ---------- Dots (buttons) ----------
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      // user interaction always stops autoplay
      stop();

      // If an animation is already running, jump instantly (no lag)
      // If idle, run the normal smooth transition
      show(i, { immediate: isAnimating });

      // optional: restart autoplay after user click
      start();
    });
  });

  // ---------- Pause on tab hide ----------
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  // ---------- Light hover/focus pause ----------
  ["mouseenter", "focusin"].forEach(ev =>
    carousel.addEventListener(ev, stop, { passive: true })
  );
  ["mouseleave", "focusout"].forEach(ev =>
    carousel.addEventListener(ev, start, { passive: true })
  );

  // ---------- Swipe (kept simple) ----------
  let dragging = false;
  let startX = 0;
  let deltaX = 0;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    dragging = true;
    deltaX = 0;
    startX = e.touches[0].clientX;
    stop();
  }

  function onTouchMove(e) {
    if (!dragging) return;
    deltaX = e.touches[0].clientX - startX;
  }

  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;

    const threshold = Math.max(30, carousel.clientWidth * 0.12);
    if (deltaX < -threshold) show(current + 1);
    else if (deltaX > threshold) show(current - 1);

    start();
  }

  carousel.addEventListener("touchstart", onTouchStart, { passive: true });
  carousel.addEventListener("touchmove", onTouchMove, { passive: true });
  carousel.addEventListener("touchend", onTouchEnd, { passive: true });

  // ---------- Keyboard (arrow keys) ----------
  carousel.tabIndex = 0;
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { stop(); show(current - 1); start(); }
    if (e.key === "ArrowRight") { stop(); show(current + 1); start(); }
  });

  // ---------- Init ----------
  slides.forEach((s, i) => {
    s.classList.toggle("active", i === 0);
    s.classList.remove("exiting");
  });
  dots[0]?.classList.add("active");
  start();
});
