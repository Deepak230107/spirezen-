(function () {
  const form = document.forms['contact-form'];
  if (!form) return;

  const fields = form.querySelectorAll('.form_group');

  // FLOATING LABEL LOGIC
  fields.forEach(group => {
    const input = group.querySelector('input, textarea');
    const error = group.querySelector('.field_error');

    if (!input) return;

    const checkValue = () => {
      if (input.value.trim() !== '') {
        group.classList.add('active');
      } else {
        group.classList.remove('active');
      }
    };

    input.addEventListener('focus', () => {
      group.classList.add('active');
    });

    input.addEventListener('blur', () => {
      checkValue();
      validateField(input, group, error);
    });

    input.addEventListener('input', () => {
      checkValue();
      if (error) clearError(group, error);
    });

    // Init on load (for autofill)
    checkValue();
  });

  // VALIDATION
  function validateField(input, group, error) {
    if (!input.checkValidity()) {
      group.classList.add('error');
      if (error) {
        error.textContent = input.validationMessage;
      }
      return false;
    }
    return true;
  }

  function clearError(group, error) {
    group.classList.remove('error');
    if (error) error.textContent = '';
  }

  // SUBMIT HANDLER (KEEP BACKEND)
  const message = document.getElementById('form-message');
  const btn = form.querySelector('button');

  // URL from existing contact.js
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzbhpC0PqQQxVMGGQ4jcUMYyIiA8aY9tMfMHF4vicWTvh3oxqMV77NmNxcXO-dV_1Qixw/exec';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    fields.forEach(group => {
      const input = group.querySelector('input, textarea');
      const error = group.querySelector('.field_error');
      if (input && !validateField(input, group, error)) valid = false;
    });

    if (!valid) return;

    btn.disabled = true;
    btn.textContent = 'Submitting…';
    if (message) message.style.display = 'none';

    const data = new FormData(form);

    try {
      // Try fetch
      await fetch(scriptURL, {
        method: 'POST',
        body: data,
        mode: 'no-cors'
      });

      if (message) {
        message.style.display = 'block';
        message.textContent = 'Thank you! Your message has been sent.';
        message.style.color = '#ffffff';
      }
      form.reset();

      fields.forEach(g => g.classList.remove('active'));
    } catch (err) {
      console.error(err);
      if (message) {
        message.style.display = 'block';
        message.textContent = 'Something went wrong. Please try again.';
        message.style.color = '#ffb3b3';
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'SEND MESSAGE';
    }
  });
})();
