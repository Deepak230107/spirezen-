document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto-fill Date ID with Today's Date
    const dateInput = document.getElementById('standup-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // 2. Character Count Validation
    const MIN_LENGTH = 50;
    const textareas = document.querySelectorAll('textarea[minlength]');

    textareas.forEach(textarea => {
        // Create counter element
        const counter = document.createElement('span');
        counter.className = 'char-count';
        counter.textContent = `0 / ${MIN_LENGTH} min chars`;
        textarea.parentElement.appendChild(counter);

        // Update counter on input
        textarea.addEventListener('input', () => {
            const currentLength = textarea.value.length;
            counter.textContent = `${currentLength} / ${MIN_LENGTH} min chars`;

            if (currentLength < MIN_LENGTH) {
                counter.style.color = '#ff6b6b'; // Light Red for warning
                textarea.style.borderColor = 'rgba(255, 107, 107, 0.4)';
            } else {
                counter.style.color = '#4cd137'; // Green for success
                textarea.style.borderColor = 'rgba(76, 209, 55, 0.4)';
            }
        });
    });

    // 3. Form Submit Validation
    const form = document.querySelector('.standup-form');
    form.addEventListener('submit', (e) => {
        let valid = true;
        textareas.forEach(textarea => {
            if (textarea.value.length < MIN_LENGTH) {
                valid = false;
                textarea.style.borderColor = '#ff4757';
                textarea.focus(); // Focus the first invalid
            }
        });

        if (!valid) {
            e.preventDefault();
            alert(`Please ensure all detailed answers are at least ${MIN_LENGTH} characters long.`);
        }
    });
});
