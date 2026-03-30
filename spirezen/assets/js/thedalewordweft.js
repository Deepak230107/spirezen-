document.addEventListener("DOMContentLoaded", () => {
  /* ===== FAQ ACCORDION ===== */
  const faqItems = document.querySelectorAll(".dw-faq__item");

  faqItems.forEach((item) => {
    const button = item.querySelector(".dw-faq__q");
    const answer = item.querySelector(".dw-faq__a");

    if (!button || !answer) return;

    // set big number text attribute once (used for ghost background number)
    const num = button.querySelector(".dw-faq__num");
    if (num && !num.dataset.big) {
      num.dataset.big = num.textContent.trim();
    }

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("dw-open");

      // Close all others (accordion behaviour)
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("dw-open");
          const btn = other.querySelector(".dw-faq__q");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle this one
      item.classList.toggle("dw-open", !isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
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
      if (window.innerWidth <= 768) {
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

  /* ===== WORKSHOP CARD HOVER EFFECT ===== */
  const cards = document.querySelectorAll(".dw-card");
  const ctaBtn = document.querySelector(".dw-center .dw-cta");

  if (cards.length && ctaBtn) {
    // Cache the icon so we don't lose it when updating text
    const icon = ctaBtn.querySelector("svg");
    const iconHTML = icon ? icon.outerHTML : "";

    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        const title = card.querySelector(".dw-card__title");
        const href = card.getAttribute("href");

        if (title && href) {
          // Update button text and link
          // We use innerHTML to prepend text before the icon
          ctaBtn.innerHTML = `View ${title.textContent.trim()} Workshop ${iconHTML}`;
          ctaBtn.setAttribute("href", href);
        }
      });
    });
  }
});
