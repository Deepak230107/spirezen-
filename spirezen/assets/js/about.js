// Carousel logic (class-only selectors, no IDs)
(function () {
  const carousel = document.querySelector('.section-team .carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const prevBtn = carousel.querySelector('.btn-prev');
  const nextBtn = carousel.querySelector('.btn-next');

  const step = 260; // scroll amount per click (matches card width)

  function scrollNext() {
    track.scrollBy({ left: step, behavior: 'smooth' });
  }

  function scrollPrev() {
    track.scrollBy({ left: -step, behavior: 'smooth' });
  }

  nextBtn.addEventListener('click', scrollNext);
  prevBtn.addEventListener('click', scrollPrev);

  // Auto slide (pause on hover / focus)
  let auto = setInterval(scrollNext, 1500);

  function pause() { clearInterval(auto); }
  function resume() { auto = setInterval(scrollNext, 1500); }

  track.addEventListener('mouseenter', pause);
  track.addEventListener('mouseleave', resume);
  track.addEventListener('focusin', pause);
  track.addEventListener('focusout', resume);

  // Keyboard support on buttons
  [prevBtn, nextBtn].forEach(btn => {
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn === nextBtn ? scrollNext() : scrollPrev();
      }
    });
  });
})();
