(function () {
  const container = document.querySelector('.testimun_name-container');
  if (!container) return;

  const wrapper = container.querySelector('.testimun_name-wrapper');
  if (!wrapper) return;

  // clone children to allow seamless loop
  function ensureClones() {
    const items = Array.from(wrapper.children);
    // if already cloned (items > original*1.5) skip
    if (items.length >= 8) return; // guard for multiple runs
    const frag = document.createDocumentFragment();
    items.forEach(node => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true'); // clones are decorative
      frag.appendChild(clone);
    });
    wrapper.appendChild(frag);
  }

  // measure width of the scrolling region (one full sequence)
  function measureWidths() {
    // use the bounding rect of the first half to determine distance to scroll
    const children = Array.from(wrapper.children);
    const half = Math.floor(children.length / 2);
    if (half === 0) return { scrollWidth: wrapper.scrollWidth, singleWidth: wrapper.scrollWidth };
    // width of first half
    let width = 0;
    for (let i = 0; i < half; i++) {
      const r = children[i].getBoundingClientRect();
      width += Math.round(r.width);
      // add gap — estimate from computed style
    }
    // compute actual gap from computed style
    const cs = getComputedStyle(wrapper);
    const gapVal = cs.getPropertyValue('gap') || '40px';
    const gapPx = parseFloat(gapVal) || 40;
    width += gapPx * (half - 1);
    return { scrollWidth: wrapper.scrollWidth, singleWidth: width };
  }

  // create CSS keyframes dynamically and set animation on wrapper
  function createAnimation(distancePx, speed = 0.06) {
    // speed = px per ms (smaller = slower). default makes 1px -> 0.06ms -> 60px/s
    const pxPerSec = 60; // you can tune this value for faster/slower
    const durationSec = Math.max(10, distancePx / pxPerSec); // at least 10s
    const name = 'testimun-scroll-' + Math.round(distancePx);

    // remove existing style tag for this name
    const existing = document.getElementById('testimun-scroll-style');
    if (existing) existing.remove();

    const style = document.createElement('style');
    style.id = 'testimun-scroll-style';
    style.textContent = `
      @keyframes ${name} {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${distancePx}px); }
      }
      .testimun_name-wrapper {
        animation: ${name} ${durationSec}s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }

  // main setup
  function setup() {
    // ensure we have at least two copies for seamless looping
    ensureClones();

    // allow layout to settle
    requestAnimationFrame(() => {
      const { singleWidth } = measureWidths();
      // if measured width is 0, abort
      if (!singleWidth || singleWidth <= 0) return;
      // apply animation using measured width
      createAnimation(singleWidth);
      // pause on hover/focus handled by CSS, but ensure wrapper respects it
      container.addEventListener('mouseenter', () => {
        wrapper.style.animationPlayState = 'paused';
      });
      container.addEventListener('mouseleave', () => {
        wrapper.style.animationPlayState = '';
      });
      container.addEventListener('focusin', () => {
        wrapper.style.animationPlayState = 'paused';
      });
      container.addEventListener('focusout', () => {
        wrapper.style.animationPlayState = '';
      });
    });
  }

  // re-run on resize because measurements change
  let t;
  window.addEventListener('resize', () => {
    clearTimeout(t); t = setTimeout(setup, 150);
  });

  // init
  setup();
})();
