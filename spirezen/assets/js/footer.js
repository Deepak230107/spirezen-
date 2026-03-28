/* footer-enhancements.js */
document.addEventListener("DOMContentLoaded", () => {
  // 1) Set current year
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ========== Helpers ==========
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smoothScrollTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  // 2) Back to top (smooth + reveal on scroll)
  // 2) Back to top (smooth + reveal on scroll + sheet-aware + focus restore)
  const backBtn = document.querySelector(".back-to-top");
  const headerTarget = document.querySelector(".pro-nav") || document.body;

  if (backBtn) {
    // start hidden & not focusable until visible
    backBtn.setAttribute("aria-hidden", "true");
    backBtn.tabIndex = -1;
    // ensure it's not a submit button if inside a form
    try { backBtn.type = "button"; } catch { }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smoothScrollTop = () => {
      try {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      } catch { window.scrollTo(0, 0); }
      // return focus after scroll for keyboard users
      if (prefersReduced) {
        if (headerTarget?.focus) headerTarget.focus({ preventScroll: true });
      } else {
        setTimeout(() => { if (headerTarget?.focus) headerTarget.focus({ preventScroll: true }); }, 350);
      }
    };

    backBtn.addEventListener("click", (e) => { e.preventDefault(); smoothScrollTop(); });
    backBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); smoothScrollTop(); }
    });

    // rAF-throttled scroll listener for visibility
    let ticking = false;
    const threshold = 320; // px scrolled before showing button
    const updateVisibility = () => {
      const sheetOpen = document.documentElement.classList.contains("has-sheet-open"); // from your sheet code
      const show = window.scrollY > threshold && !sheetOpen;
      if (show && !backBtn.classList.contains("is-visible")) {
        backBtn.classList.add("is-visible");
        backBtn.setAttribute("aria-hidden", "false");
        backBtn.tabIndex = 0;
      } else if (!show && backBtn.classList.contains("is-visible")) {
        backBtn.classList.remove("is-visible");
        backBtn.setAttribute("aria-hidden", "true");
        backBtn.tabIndex = -1;
      }
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { updateVisibility(); ticking = false; });
        ticking = true;
      }
    };

    // init + bind
    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });

    // also react when the bottom sheet opens/closes
    const mo = new MutationObserver(updateVisibility);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  }


  // 3) Quick Links toggle (mobile only) + persistence + click-outside
  const linksToggle = document.querySelector(".links-toggle");
  const quickLinksList = document.getElementById("quick-links-list");
  const STORAGE_KEY = "footer_quick_links_expanded";

  function setQuickLinksState(expanded) {
    if (!linksToggle || !quickLinksList) return;
    linksToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    quickLinksList.setAttribute("aria-hidden", expanded ? "false" : "true");
    linksToggle.textContent = expanded ? "▴" : "▾";
    sessionStorage.setItem(STORAGE_KEY, expanded ? "1" : "0");
  }

  function applyQuickLinksResponsive() {
    if (!linksToggle || !quickLinksList) return;
    const isMobile = window.innerWidth <= 880;

    if (isMobile) {
      const persisted = sessionStorage.getItem(STORAGE_KEY);
      const expanded = persisted === "1" ? true : false;
      setQuickLinksState(expanded);
      linksToggle.style.display = "";
    } else {
      setQuickLinksState(true);   // always expanded on larger screens
      linksToggle.style.display = "none";
      linksToggle.textContent = "";
    }
  }

  if (linksToggle && quickLinksList) {
    applyQuickLinksResponsive();
    window.addEventListener("resize", applyQuickLinksResponsive);

    linksToggle.addEventListener("click", () => {
      const expanded = linksToggle.getAttribute("aria-expanded") === "true";
      setQuickLinksState(!expanded);
    });

    linksToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); linksToggle.click(); }
    });

    // Click outside to close (mobile only)
    document.addEventListener("click", (e) => {
      if (window.innerWidth > 880) return;
      const expanded = linksToggle.getAttribute("aria-expanded") === "true";
      if (!expanded) return;
      const within = e.target.closest(".footer-links");
      if (!within) setQuickLinksState(false);
    });
  }

  // 4) Lazy-load social icons + reveal animation
  const footer = document.querySelector(".footer-container");
  const socialImgs = Array.from(document.querySelectorAll(".social-icon[data-src]"));

  function loadSocialIcons() {
    socialImgs.forEach(img => {
      const data = img.getAttribute("data-src");
      if (data && !img.src) img.src = data;
    });
    if (footer) footer.classList.add("revealed");
  }

  if ("IntersectionObserver" in window && footer && socialImgs.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { loadSocialIcons(); obs.disconnect(); }
      });
    }, { threshold: 0.06 });
    io.observe(footer);
  } else {
    loadSocialIcons(); // fallback
  }

  // 5) Input method tracking: show focus styles only for keyboard users
  (function trackInputMethod() {
    window.addEventListener("keydown", () => {
      document.documentElement.classList.add("using-keyboard");
    });
    window.addEventListener("mousedown", () => {
      document.documentElement.classList.remove("using-keyboard");
    });
  })();
});
// Back to Top — robust
(function () {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  // make sure it's a button, not a submit
  try { btn.type = "button"; } catch { }

  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // collect potential scrollable targets (body/root + common wrappers)
  const targets = [];
  targets.push(document.scrollingElement || document.documentElement);
  document.querySelectorAll("[data-scrollable], .scrollable, .scroll, main, .page-wrapper").forEach(el => {
    const cs = getComputedStyle(el);
    if (/auto|scroll/i.test(cs.overflow + cs.overflowY)) targets.push(el);
  });

  function scrollTopAll() {
    let used = false;
    for (const el of targets) {
      try {
        el.scrollTo({ top: 0, left: 0, behavior: prefersReduced ? "auto" : "smooth" });
        used = true;
      } catch {
        el.scrollTop = 0;
        used = true;
      }
    }
    if (!used) {
      // ultimate fallback
      try {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    scrollTopAll();
  });

  // Show/hide after scroll (pairs with floating CSS; harmless otherwise)
  const threshold = 200;
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {
      const root = document.scrollingElement || document.documentElement;
      const y = window.scrollY ?? root.scrollTop ?? 0;
      const show = y > threshold;
      btn.classList.toggle("is-visible", show);
      btn.setAttribute("aria-hidden", show ? "false" : "true");
      btn.tabIndex = show ? 0 : -1;
      ticking = false;
    });
    ticking = true;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();
