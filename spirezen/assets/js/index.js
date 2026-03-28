const prodlineupData = {
  thedalemun: {
    title: "thedalemun.",
    price: "Empowering Future-Ready Minds",
    desc: "TheDaleMUN is a transformative Model United Nations platform designed to develop confident communicators, strategic thinkers, and emerging leaders. Through immersive real-world simulations, structured debate, and hands-on leadership training, students gain global awareness and the skills required to thrive in an increasingly interconnected world.",
    img: "assets/img/thedalemun.svg",
    buttonText: "Explore thedalemun",
    link: "thedalemunclub"
  },
  thedalewordweft: {
    title: "thedalewordweft.",
    price: "Skill Development, Reimagined",
    desc: "TheDaleWordweft is our online learning platform delivering structured, high-impact workshops including Munterra and a growing series of future-ready programs. Designed to strengthen foundational skills and refine advanced competencies, each experience blends real-world challenges with practical insight preparing participants to become confident, industry-ready individuals",
    img: "assets/img/thedalewordweft.svg",
    buttonText: "Explore thedalewordweft",
    link: "thedalewordweft"
  },
  thedalediginova: {
    title: "TheDaleDigiNova.",
    price: "Master the Digital Economy",
    desc: "TheDaleDigiNova is a results-driven digital growth platform offering branding, website development, marketing strategy, systems, and automation solutions. Designed for entrepreneurs, institutions, and forward-thinking businesses, we build strong digital foundations that help brands scale, compete, and thrive in today’s fast-evolving digital economy",
    img: "assets/img/thedalediginova.svg",
    buttonText: "Explore thedalediginova",
    link: "digitalservices"
  }
};

// DOM refs
const prodlineupOptions = document.querySelectorAll('.prodlineup_filter-option');
const prodlineupContainer = document.querySelector('.prodlineup_container');
const prodlineupTitle = document.getElementById('car-title');
const prodlineupPrice = document.getElementById('car-price');
const prodlineupDesc = document.getElementById('car-desc');
const prodlineupImg = document.getElementById('car-img');
const prodlineupBtn = document.getElementById('car-button');

// Timing must match CSS transition
const PRODLINEUP_TRANSITION_MS = 320;

// Attach click handlers
prodlineupOptions.forEach(option => {
  option.addEventListener('click', () => {
    if (option.classList.contains('active')) return;

    // Update active state
    prodlineupOptions.forEach(opt => {
      opt.classList.remove('active');
      opt.setAttribute('aria-selected', 'false');
    });
    option.classList.add('active');
    option.setAttribute('aria-selected', 'true');

    const model = option.dataset.model;
    const data = prodlineupData[model];
    if (!data) return;

    // Remove old simple fade logic and use GSAP
    const tl = gsap.timeline();

    // 1. Animate out the current content (faster)
    tl.to([prodlineupImg, prodlineupTitle, prodlineupPrice, prodlineupDesc, prodlineupBtn], {
      y: 10,
      opacity: 0,
      duration: 0.15,
      stagger: 0.02,
      ease: "power2.inOut",
      onComplete: () => {
        // 2. Update content when invisible
        prodlineupTitle.textContent = data.title;
        prodlineupPrice.textContent = data.price;
        prodlineupDesc.textContent = data.desc;
        prodlineupImg.src = data.img;
        prodlineupBtn.textContent = data.buttonText;
        prodlineupBtn.href = data.link;
      }
    })
      // 3. Animate the new content back in (faster)
      .fromTo([prodlineupImg, prodlineupTitle, prodlineupPrice, prodlineupDesc, prodlineupBtn],
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.2, stagger: 0.02, ease: "power2.out" }
      );
  });
});
