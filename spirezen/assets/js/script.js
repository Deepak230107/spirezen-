document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector(".hamburger"); 
  const menubar = document.querySelector(".menubar");

  if (hamburger && menubar) {
    hamburger.addEventListener("click", function () {
      menubar.classList.toggle("active");
    });
  }
});


/* Scroll Fade-up Logic */
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


/* FAQ Accordion Logic */
document.querySelectorAll('.faq-item').forEach(item => {
  const toggle = item.querySelector('button');
  // Make the entire header clickable, not just the button
  const header = item.firstElementChild;

  header.addEventListener('click', () => {
    const expanded = item.getAttribute('aria-expanded') === 'true';
    
    // Optional: Close others
    document.querySelectorAll('.faq-item').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.classList.remove('open');
      const btn = other.querySelector('button');
      if(btn) btn.setAttribute('aria-expanded', 'false');
    });

    // Toggle current
    if (!expanded) {
      item.setAttribute('aria-expanded', 'true');
      item.classList.add('open');
      if(toggle) toggle.setAttribute('aria-expanded', 'true');
    }
  });
});
