// Define constants and variables
const scriptURL = 'https://script.google.com/macros/s/AKfycbxMVlcq4K6gjhBGjk5UCrusuiAGYsHQmR4yuNeBBjDqQgyVwRiNyv6XaH7sXB-DZ3xX2g/exec';
const form = document.getElementById('contact-form');
const messageDiv = document.getElementById('form-message');
const payNowSubmitButton = document.getElementById('pay-now-submit-button');

// Track payment status
let paymentCompleted = false;

function initiatePayment() {
    // Debug log to check if payment initiation is called
    console.log("Initiating payment...");

    // Razorpay payment options
    var options = {
        key: "rzp_live_HOsL5eKHAeygtY", // Replace with your Razorpay Key ID
        amount: 152800, // Amount in paise (370000 = ₹3700)
        currency: "INR",
        name: "Spirezen Enterprises Pvt Ltd",
        description: "Payment for thedalemun",
        image: "https://www.spirezenenterprises.com/logo.svg", // Your logo URL
        handler: function(response) {
            // Handle successful payment
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
        modal: {
            ondismiss: function() {
                // If payment modal is dismissed
                messageDiv.style.display = "block";
                messageDiv.style.color = "red";
                messageDiv.textContent = "Payment was not completed. Please try again.";
                payNowSubmitButton.disabled = false;
                payNowSubmitButton.textContent = "Pay Now";
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

    // Debug log to check if Razorpay modal opens
    console.log("Opening Razorpay payment modal...");
    rzp.open();

    // Debugging: Log any failed payment attempts
    rzp.on('payment.failed', function (response) {
        console.log("Payment failed: ", response.error);
        messageDiv.style.display = "block";
        messageDiv.style.color = "red";
        messageDiv.textContent = "Payment failed. Please try again.";
    });
}

// Event listener for the "Pay Now" button
payNowSubmitButton.addEventListener('click', function () {
    console.log("Pay Now button clicked!");  // Check if button click is being detected
    if (!paymentCompleted) {
        // If payment isn't completed, initiate payment
        initiatePayment();
    }
});

// Function to submit the form after payment is completed
function submitForm() {
    // Prevent form submission if payment is not completed
    if (!paymentCompleted) {
        messageDiv.style.display = "block";
        messageDiv.style.color = "red";
        messageDiv.textContent = "Please complete the payment before submitting the form.";
        return; // Prevent form submission
    }

    // Hide previous messages and disable the submit button
    messageDiv.style.display = "none";

    // Submit the form data to Google Script URL
    const formData = new FormData(form);
    fetch(scriptURL, { 
        method: 'POST', 
        body: formData 
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === 'success') {
            messageDiv.style.display = "block";
            messageDiv.style.color = "#ffb400";
            messageDiv.textContent = "Thank you! Your registration was successful.";

            // Reload the page after successful submission
            setTimeout(() => {
                window.location.reload();
            }, 4000);  // Wait for 4 seconds before reloading the page
        } else {
            throw new Error('Error from server: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        messageDiv.style.display = "block";
        messageDiv.style.color = "red";
        messageDiv.textContent = "Oops! Something went wrong. Please try again.";
        console.error('Error!', error.message);
    })
    .finally(() => {
        payNowSubmitButton.textContent = "Pay Now"; // Reset button text if needed
        payNowSubmitButton.disabled = false;
    });
}

// Ensure that the form is not submitted before payment
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission by default
    if (!paymentCompleted) {
        messageDiv.style.display = "block";
        messageDiv.style.color = "red";
        messageDiv.textContent = "Please complete the payment before submitting the form.";
    } else {
        // Call submitForm to handle the actual submission after payment
        submitForm();
    }
});
