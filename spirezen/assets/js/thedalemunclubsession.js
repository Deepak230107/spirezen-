// Handles submission to Google Apps Script and shows visual states
(function () {
  const section = document.querySelector('#book');
  if (!section) return;

  const form = section.querySelector('form.tdm-form');
  const btn = section.querySelector('.tdm-btn');
  const btnText = btn?.querySelector('.tdm-btn-text');
  const status = section.querySelector('.tdm-book-status');
  const statusClose = section.querySelector('.tdm-status-close');

  if (!form || !btn) return;

  function showStatus(show) {
    if (!status) return;
    status.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) status.removeAttribute('hidden');
    else status.setAttribute('hidden', '');
    status.style.display = show ? 'flex' : 'none';
  }

  function resetForm() {
    form.reset();
    showStatus(false);
    btn.disabled = false;
    if (btnText) btnText.textContent = 'Book now';
  }

  if (statusClose) {
    statusClose.addEventListener('click', (e) => {
      e.preventDefault();
      resetForm();
    });
  }

  function isValidEmail(v) {
    return /\S+@\S+\.\S+/.test(v);
  }

  function isValidPhone(v) {
    return (v.match(/\d/g) || []).length >= 6;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    btn.disabled = true;
    if (btnText) btnText.textContent = 'Submitting...';

    const emailEl = form.querySelector('[name="email"]');
    const phoneEl = form.querySelector('[name="phone"]');
    const email = emailEl?.value.trim() || '';
    const phone = phoneEl?.value.trim() || '';

    if (!email || !isValidEmail(email)) {
      btn.disabled = false;
      if (btnText) btnText.textContent = 'Book now';
      emailEl?.focus();
      return;
    }
    if (!phone || !isValidPhone(phone)) {
      btn.disabled = false;
      if (btnText) btnText.textContent = 'Book now';
      phoneEl?.focus();
      return;
    }

    const payload = new URLSearchParams();
    payload.append('email', email);
    payload.append('phone', phone);

    const action = (form.getAttribute('action') || '').trim();
    if (!action || action === '#') {
      setTimeout(() => {
        showStatus(true);
        setTimeout(resetForm, 4000);
      }, 400);
      return;
    }

    fetch(action, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: payload.toString(),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json().catch(() => ({}));
      })
      .then(() => {
        if (btnText) btnText.textContent = 'Submitted!';
        showStatus(true);
        setTimeout(resetForm, 4000);
      })
      .catch((err) => {
        console.error('Submission failed:', err);
        if (btnText) btnText.textContent = 'Try again';
        btn.disabled = false;
        setTimeout(() => (btnText.textContent = 'Book now'), 1800);
      });
  });

  // Initial hide
  showStatus(false);
})();
