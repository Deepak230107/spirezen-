// app.js

document.getElementById('internshipForm').addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevents the default form submission behavior

    const formData = {
        intern_name: document.querySelector('input[name="intern_name"]').value,
        intern_email: document.querySelector('input[name="intern_email"]').value,
        intern_message: document.querySelector('textarea[name="intern_message"]').value,
    };

    try {
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Form submitted successfully!');
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
});
