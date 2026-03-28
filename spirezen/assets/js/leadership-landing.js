// document.querySelectorAll(".accordion-header").forEach(button => {
//   button.addEventListener("click", () => {
//     const item = button.parentElement;
//     item.classList.toggle("active");
//   });
// });
// document.addEventListener("DOMContentLoaded", () => {
//   // Scroll reveal
//   const revealItems = document.querySelectorAll(
//     ".card, .section, .lap-header, .hero-visual"
//   );

//   const revealOnScroll = () => {
//     const trigger = window.innerHeight * 0.85;

//     revealItems.forEach(el => {
//       if (el.getBoundingClientRect().top < trigger) {
//         el.classList.add("show");
//       }
//     });
//   };

//   revealItems.forEach(el => el.classList.add("reveal"));

//   window.addEventListener("scroll", revealOnScroll);
//   revealOnScroll();

//   // Accordion interaction (clean & isolated)
//   document.querySelectorAll(".accordion-header").forEach(btn => {
//     btn.addEventListener("click", () => {
//       const item = btn.parentElement;
//       item.classList.toggle("active");
//     });
//   });
// });


// document.addEventListener("DOMContentLoaded", () => {
//   const items = document.querySelectorAll(".accordion-item");

//   items.forEach(item => {
//     const header = item.querySelector(".accordion-header");

//     header.addEventListener("click", () => {
//       const openItem = document.querySelector(".accordion-item.active");

//       // Close other open accordion
//       if (openItem && openItem !== item) {
//         openItem.classList.remove("active");
//       }

//       // Toggle current
//       item.classList.toggle("active");
//     });
//   });
// });

// document.querySelectorAll(".rail-item").forEach(btn => {
//   btn.addEventListener("click", () => {
//     document.querySelectorAll(".rail-item").forEach(b => b.classList.remove("active"));
//     document.querySelectorAll(".focus-panel").forEach(p => p.classList.remove("active"));

//     btn.classList.add("active");
//     document.getElementById(btn.dataset.focus).classList.add("active");
//   });
// });


document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach(el => observer.observe(el));
});
