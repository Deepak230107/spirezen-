(function () {
  // Wait until DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz4Bb-Uh7kRYC76lEc-aViOmNMDG4kCmmX_1gB937C-msfLvd5KzIYctrsHwFztXNt0/exec';
    const form = document.querySelector('form[name="contact-form"]');
    if (!form) { console.warn('contact-form not found'); return; }

    const messageDiv = document.getElementById('form-message') || createMessageDiv(form);
    const submitBtn  = form.querySelector('[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // UI: disable
      setMsg(messageDiv, '', true, false);
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      const data = new FormData(form);

      try {
        // Try normal POST first (best if your Apps Script has CORS headers)
        const res = await fetch(scriptURL, { method: 'POST', body: data });

        // If opaque (no CORS), we can't read response but the request went through.
        if (res.type === 'opaque') {
          onSuccess();
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // If server sent JSON, respect it; otherwise treat 2xx as success.
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/json')) {
          const json = await res.json();
          if (json.ok === true || json.result === 'success') onSuccess();
          else throw new Error(json.error || 'Server returned an error.');
        } else {
          onSuccess();
        }
      } catch (err) {
        // Fallback for strict CORS environments
        try {
          await fetch(scriptURL, { method: 'POST', body: data, mode: 'no-cors' });
          onSuccess();
        } catch (err2) {
          console.error('Submit failed:', err2);
          setMsg(messageDiv, 'Oops! Something went wrong. Please try again.', false, true);
        }
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Application'; }
      }

      function onSuccess() {
        setMsg(messageDiv, 'Thanks! Your application was submitted.', true, true);
        form.reset();
      }
    });
  }

  function setMsg(node, text, ok, show) {
    node.textContent = text || '';
    node.style.display = show ? 'block' : 'none';
    node.style.color = ok ? '#d9cfb0' : '#ffb3b3'; // subtle gold vs soft red
  }

  function createMessageDiv(form) {
    const div = document.createElement('div');
    div.id = 'form-message';
    div.style.marginTop = '6px';
    div.style.fontSize  = '.92rem';
    div.style.display   = 'none';
    form.appendChild(div);
    return div;
  }
})();
