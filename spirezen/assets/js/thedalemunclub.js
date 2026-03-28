document.addEventListener("DOMContentLoaded", function () {
    const sliderWrapper = document.querySelector(".trusterp_name-wrapper");
    if (!sliderWrapper) return; // Exit if element doesn't exist

    const logos = Array.from(document.querySelectorAll(".trusterp_name-logo"));

    // Duplicate logos to create a seamless effect
    logos.forEach(logo => {
        let clone = logo.cloneNode(true);
        sliderWrapper.appendChild(clone);
    });
});
