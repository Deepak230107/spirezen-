/************ CLIENT-SIDE JS FOR AGARAM MUN PAYMENT FORM ************/
/* Paste as a single <script> or in your JS file. Ensure your page
   contains:
   - <form id="contact-form"> ... </form>
   - <button id="pay-now-submit-button">Pay Now</button>
   - <div id="form-message"></div>
   - <p id="form-subtitle">...initial text...</p>
   - radio inputs: input[name="accommodation"] with values 'with'|'without'
   - Razorpay checkout script must be loaded:
     <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
*/

/** ===== CONFIG ===== **/
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby2ACZwfKKQTSfNmYZUVAwxt-jvFY1xNuUCs0wIiG1ujC8iioEFBcTw-bG_0g-JhqV-TQ/exec'; // Standardized URL
const RZP_KEY_ID = 'rzp_live_RevIomkBaPi91z'; // public key id (safe client-side)

// Prices (rupees)
const PRICE_RUPEES_WITHOUT_ACCOM = 2753; // ₹2,753
const PRICE_RUPEES_WITH_ACCOM = 4080; // ₹4,080

/** ===== ELEMENTS ===== **/
const form = document.getElementById('contact-form');
const msg = document.getElementById('form-message');
const btn = document.getElementById('pay-now-submit-button');
const subtitleEl = document.getElementById('form-subtitle');

/** UI helper **/
function ui(state, text) {
  if (text) { msg.textContent = text; msg.style.display = 'block'; }
  else { msg.style.display = 'none'; }
  btn.disabled = (state === 'busy');
  btn.textContent = (state === 'busy') ? 'Please wait…' : 'Pay Now';
}

/** Helper: timeout wrapper **/
function withTimeout(promise, ms = 15000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout after ${ms / 1000}s`)), ms);
    promise.then(v => { clearTimeout(t); resolve(v); },
      e => { clearTimeout(t); reject(e); });
  });
}

/** Read current accommodation selection and return amount in paise **/
function getCurrentPricePaise() {
  try {
    const fd = new FormData(form);
    const accom = (fd.get('accommodation') || 'without').toString().trim().toLowerCase();
    const rupees = (accom === 'with') ? PRICE_RUPEES_WITH_ACCOM : PRICE_RUPEES_WITHOUT_ACCOM;
    return Math.round(rupees * 100); // paise
  } catch (e) {
    // fallback to without accommodation
    return Math.round(PRICE_RUPEES_WITHOUT_ACCOM * 100);
  }
}

/** Update subtitle text to reflect selected option **/
function refreshDisplayedPrice() {
  if (!subtitleEl) return;
  const fd = new FormData(form);
  const accom = (fd.get('accommodation') || 'without').toString().trim().toLowerCase();
  const rupees = (accom === 'with') ? PRICE_RUPEES_WITH_ACCOM : PRICE_RUPEES_WITHOUT_ACCOM;
  subtitleEl.textContent = `Pay ₹${rupees.toLocaleString()} (+2% payment gateway charges)`;
}

/** Ping server using GET (robust: hits doGet) **/
async function pingServer() {
  const url = WEBAPP_URL + '?t=' + Date.now();
  const r = await withTimeout(fetch(url, { method: 'GET', cache: 'no-store' }), 8000);
  const t = await r.text();
  let j;
  try { j = JSON.parse(t); } catch { throw new Error('Ping non-JSON: ' + t.slice(0, 200)); }
  if (j.result !== 'ok') throw new Error('Ping failed: ' + JSON.stringify(j));
  if (!String(j.build || '').startsWith('mun-')) {
    // not fatal, but warn if build name changed
    console.warn('Ping build unexpected:', j.build);
  }
  return j.build;
}

/** Create Order via backend (FormData to avoid CORS preflight) **/
async function createOrder() {
  const fd = new FormData(form);

  fd.append('action', 'createOrder');

  // dynamic amount (paise) based on accommodation field
  const amountPaise = getCurrentPricePaise();
  fd.append('amount', String(amountPaise)); // paise
  fd.append('currency', 'INR');
  fd.append('receipt', 'mun-' + Date.now());

  // Append notes[...] for important fields so they appear in Razorpay order metadata & backend parse
  const noteFields = [
    'your-name', 'your-email', 'your-number', 'your-city', 'your-school', 'session-date',
    'your-dob', 'parents-name', 'parents-contact', 'committee-preference-1',
    'committee-preference-2', 'committee-preference-3', 'portfolio-preference', 'food-preference',
    'accommodation', 'event_name' // ensure we send this
  ];
  noteFields.forEach(k => {
    try {
      const v = fd.get(k) || '';
      fd.append('notes[' + k + ']', v);
    } catch (e) { }
  });

  // If you want to test locally you can uncomment:
  // fd.append('mock','1');

  try {
    const r = await withTimeout(fetch(WEBAPP_URL + '?t=' + Date.now(), { method: 'POST', body: fd, cache: 'no-store', redirect: 'follow' }));
    const t = await r.text();
    let j; try { j = JSON.parse(t); } catch { throw new Error('Endpoint returned non-JSON. First 200 chars: ' + t.slice(0, 200)); }
    if (j.result !== 'success') {
      throw new Error(j.error || 'Order create failed (server-side). Raw: ' + JSON.stringify(j).slice(0, 300));
    }

    const order = j.order && j.order.id ? j.order : null;
    if (!order) throw new Error('Server returned success but no order.id. Raw: ' + JSON.stringify(j).slice(0, 300));

    // Validate server/client key env hint if server provided meta
    if (j.meta) {
      const envOk = (j.meta.key_env === (RZP_KEY_ID.startsWith('rzp_test_') ? 'test' : 'live'));
      const hintOk = j.meta.key_hint && RZP_KEY_ID.endsWith(j.meta.key_hint);
      if (!envOk || !hintOk) {
        console.warn(`Key mismatch warning: server is ${j.meta.key_env} (…${j.meta.key_hint}), client is ${(RZP_KEY_ID.startsWith('rzp_test_') ? 'test' : 'live')} (…${RZP_KEY_ID.slice(-6)})`);
      }
    }

    return order;
  } catch (err) {
    console.warn('Backend unavailable/failed, using client-side fallback:', err);
    // Fallback: Return object ensuring openCheckout can still proceed (Direct mode)
    // We calculate standard price here again for safety or pass it down
    return { id: null, amount: Number(amountPaise), currency: 'INR' };
  }
}

/** Open Razorpay Checkout **/
function openCheckout(order) {
  if (typeof Razorpay === 'undefined') {
    throw new Error('Razorpay checkout script not loaded. Ensure <script src="https://checkout.razorpay.com/v1/checkout.js"></script> appears before this script.');
  }

  const fd = new FormData(form);
  const options = {
    key: RZP_KEY_ID,
    ...(order.id && { order_id: order.id }),
    amount: order.amount,
    currency: order.currency,
    name: 'Spirezen Enterprises Pvt Ltd',
    description: 'Payment for thedalewordweft MUN workshop',
    image: 'https://www.spirezenenterprises.com/logo.png',
    prefill: {
      name: fd.get('your-name') || '',
      email: fd.get('your-email') || '',
      contact: fd.get('your-number') || ''
    },
    theme: { color: '#101010ff' },
    handler: async (resp) => {
      ui('busy', 'Verifying payment…');
      const post = new FormData();
      post.append('action', 'verifyAndRegister');
      post.append('razorpay_payment_id', resp.razorpay_payment_id);
      post.append('razorpay_order_id', resp.razorpay_order_id);
      post.append('razorpay_signature', resp.razorpay_signature);

      // append all form entries so server gets everything to write to sheet
      for (const [k, v] of fd.entries()) post.append(k, v);

      try {
        const r = await withTimeout(fetch(WEBAPP_URL + '?t=' + Date.now(), { method: 'POST', body: post, cache: 'no-store' }));
        const t = await r.text();
        const j = JSON.parse(t);
        if (j.result !== 'success') throw new Error(j.error || 'Verification failed');
        ui('idle', 'Thank you! Your registration was successful.');
        setTimeout(() => window.location.reload(), 2000);
      } catch (e) {
        console.error(e);
        ui('idle', 'Payment verification failed on server. Please contact support.');
      }
    },
    modal: { ondismiss() { ui('idle', 'Payment was not completed. Please try again.'); } }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function (resp) {
    const e = resp.error || {};
    const meta = e.metadata || {};
    alert(
      'Payment Failed\n' +
      `code: ${e.code || '-'}\n` +
      `desc: ${e.description || '-'}\n` +
      `step: ${e.step || '-'}\n` +
      `reason: ${e.reason || '-'}\n` +
      `order_id: ${meta.order_id || '-'}\n` +
      `payment_id: ${meta.payment_id || '-'}`
    );
    ui('idle', 'Payment failed. Please try again.');
  });

  rzp.open();
}

/** Single click handler **/
btn.addEventListener('click', async (e) => {
  e.preventDefault();

  // Basic client-side validation
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  ui('busy', 'Connecting to server…');
  try {
    await pingServer();               // verifies correct backend via GET
    ui('busy', 'Creating your order…');
    const order = await createOrder();
    openCheckout(order);
  } catch (err) {
    console.error(err);
    ui('idle', 'Could not create order: ' + (err.message || err));
  }
});

/** Prevent normal form submit **/
form.addEventListener('submit', (e) => { e.preventDefault(); ui('idle', 'Please click Pay Now to continue.'); });

/** Listen for accommodation changes and refresh displayed price immediately **/
function wireAccommodationListeners() {
  const nodes = document.querySelectorAll('input[name="accommodation"]');
  if (!nodes || nodes.length === 0) return;
  nodes.forEach(el => {
    el.addEventListener('change', refreshDisplayedPrice);
  });
}

// initialize displayed price + wiring on page load
document.addEventListener('DOMContentLoaded', () => {
  wireAccommodationListeners();
  refreshDisplayedPrice();
});
