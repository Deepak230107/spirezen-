const scriptURL = 'https://script.google.com/macros/s/AKfycbziqaB_nks0cwDlpuKyyesAtTCPrN51ik0nhOFsjxfM420-C7h0LvCzrXI6m6nT-xqA/exec';
const form = document.getElementById('contact-form');
const messageDiv = document.getElementById('form-message');
const payNowSubmitButton = document.getElementById('pay-now-submit-button');

// Track payment status
let paymentCompleted = false;

function initiatePayment() {
    var options = {
        key: "rzp_test_h0W3b4nQoJ74Si", // Replace with your Razorpay Key ID
        amount: 170000, // Amount in paise (170000 = ₹1700)
        currency: "INR",
        name: "Spirezen Enterprises Pvt Ltd",
        description: "Payment for thedalewordweft",
        image: "rzp_test_2yU9WSFw0J62QH", // Your logo URL
        handler: function (response) {
            // This function is called when payment is successful
            console.log(response);
            paymentCompleted = true;

            // Update button text to "Submitting..."
            payNowSubmitButton.textContent = "Submitting...";
            payNowSubmitButton.disabled = true;

            // Show success message
            messageDiv.style.display = "block";
            messageDiv.style.color = "green";
            messageDiv.textContent = "Payment successful! Submitting your form...";

            // Automatically submit the form
            submitForm();
        },
        // On payment failure or cancellation
        modal: {
            ondismiss: function() {
                handlePaymentFailure("Payment was not completed. Please try again.");
            }
        },
        prefill: {
            name: form['your-name'].value,
            email: form['your-email'].value,
            contact: form['your-number'].value
        },
        notes: {
            address: "Please fill in your address"
        },
        theme: {
            color: "#528FF0"
        }
    };

    // Initialize Razorpay instance
    var rzp = new Razorpay(options);

    // Open Razorpay payment modal
    try {
        rzp.open();
    } catch (error) {
        handlePaymentFailure("An unexpected error occurred while opening the payment window.");
    }
}

payNowSubmitButton.addEventListener('click', function () {
    if (!paymentCompleted) {
        // Initiate payment if not completed
        initiatePayment();
    }
});

// Function to handle payment failure or cancellation
function handlePaymentFailure(message) {
    messageDiv.style.display = "block";
    messageDiv.style.color = "red";
    messageDiv.textContent = message;
    payNowSubmitButton.disabled = false;
    payNowSubmitButton.textContent = "Pay Now";
}

// Function to submit the form after payment is completed
function submitForm() {
    // Prevent form submission if payment is not completed
    if (!paymentCompleted) {
        handleError("Payment must be completed before submitting the form.");
        return;
    }

    // Hide previous messages and disable the submit button
    messageDiv.style.display = "none";

    // Submit the form data to Google Script URL
    fetch(scriptURL, { method: 'POST', body: new FormData(form) })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.result === 'success') {
                messageDiv.style.display = "block";
                messageDiv.style.color = "#ffb400";
                messageDiv.textContent = "Thank you! Your registration was successful.";

                // Reload the page after successful submission
                setTimeout(() => {
                    window.location.reload();
                }, 4000);  // Wait for 2 seconds before reloading the page
            } else {
                throw new Error('Error from server: ' + (data.error || 'Unknown error'));
            }
        })
        .catch(error => {
            handleError("Oops! Something went wrong during form submission. Please try again.");
            console.error('Error!', error.message);
        })
        .finally(() => {
            payNowSubmitButton.textContent = "Pay Now"; // Reset button text if needed
            payNowSubmitButton.disabled = false;
        });
}

// Centralized error handler for displaying messages
function handleError(message) {
    messageDiv.style.display = "block";
    messageDiv.style.color = "red";
    messageDiv.textContent = message;
    console.error(message); // Log to console for debugging purposes
}
