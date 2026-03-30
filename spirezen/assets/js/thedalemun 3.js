document.addEventListener("DOMContentLoaded", function () {
    const cardContainer = document.querySelector(".committee_card-container");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let index = 0;

    function updateSlider() {
        const cardWidth = document.querySelector(".committee_card").offsetWidth;
        cardContainer.style.transform = `translateX(${-index * cardWidth}px)`;
    }

    nextBtn.addEventListener("click", function () {
        const totalCards = document.querySelectorAll(".committee_card").length;
        if (index < totalCards - 1) {
            index++;
            updateSlider();
        }
    });

    prevBtn.addEventListener("click", function () {
        if (index > 0) {
            index--;
            updateSlider();
        }
    });

    // Ensure correct card width on window resize
    window.addEventListener("resize", updateSlider);
});
