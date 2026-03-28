// Subtle motion for the glowing logo – desktop / pointer devices only
const glowLogo = document.querySelector('.tdn-hero-logo-glow');
const hero = document.querySelector('.tdn-hero');

if (glowLogo && hero && window.matchMedia('(pointer:fine)').matches) {
  let resetTimeout;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const centerX = rect.right - rect.width * 0.2;  // focus on right side
    const centerY = rect.top + rect.height * 0.4;

    const dx = (e.clientX - centerX) / rect.width;
    const dy = (e.clientY - centerY) / rect.height;

    const moveX = dx * 18;
    const moveY = dy * 12;

    glowLogo.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.04)`;
    glowLogo.style.opacity = '0.85';
    glowLogo.style.filter = 'blur(0.6px) brightness(1.6)';

    // slightly shift the gradient center for a live glow feel
    glowLogo.style.background = `
      radial-gradient(
        circle at ${30 + dx * 12}% ${20 + dy * 12}%,
        rgba(255,255,255,0.75) 0%,
        rgba(255,255,255,0.35) 30%,
        rgba(255,255,255,0.12) 60%,
        rgba(255,255,255,0) 100%
      ),
      #181818
    `;

    clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      glowLogo.style.transform = 'translate(0,0) scale(1)';
      glowLogo.style.opacity = '0.55';
      glowLogo.style.filter = 'blur(1px) brightness(1.3)';
      glowLogo.style.background = `
        radial-gradient(
          circle at 30% 20%,
          rgba(255,255,255,0.65) 0%,
          rgba(255,255,255,0.3) 32%,
          rgba(255,255,255,0.08) 60%,
          rgba(255,255,255,0) 100%
        ),
        #181818
      `;
    }, 900);
  });

  hero.addEventListener('mouseleave', () => {
    glowLogo.style.transform = 'translate(0,0) scale(1)';
    glowLogo.style.opacity = '0.55';
    glowLogo.style.filter = 'blur(1px) brightness(1.3)';
    glowLogo.style.background = `
      radial-gradient(
        circle at 30% 20%,
        rgba(255,255,255,0.65) 0%,
        rgba(255,255,255,0.3) 32%,
        rgba(255,255,255,0.08) 60%,
        rgba(255,255,255,0) 100%
      ),
      #181818
    `;
  });
}
