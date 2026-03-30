(() => {
  const RZP_KEY_ID = 'rzp_test_Ruk0xr51QvmtpE';

  const form = document.getElementById('contact-form');
  const btn = document.getElementById('pay-now-submit-button');
  const msg = document.getElementById('form-message');

  function ui(text) {
    if (msg) msg.textContent = text || '';
  }

  async function createOrder() {
    const fd = new FormData(form);
    fd.append('action', 'createOrder');

    const res = await fetch(form.action, {
      method: 'POST',
      body: fd
    });

    const data = await res.json();

    if (data.result !== 'success') {
      throw new Error(data.error || 'Order creation failed');
    }

    const o = data.order;
    if (!o || !o.id || typeof o.amount !== 'number' || !o.currency) {
      throw new Error('Invalid order object from server');
    }

    return o;
  }

  async function verifyPayment(resp) {
    const fd = new FormData(form);
    fd.append('action', 'verifyPayment');
    fd.append('razorpay_order_id', resp.razorpay_order_id);
    fd.append('razorpay_payment_id', resp.razorpay_payment_id);
    fd.append('razorpay_signature', resp.razorpay_signature);

    const res = await fetch(form.action, {
      method: 'POST',
      body: fd
    });

    const data = await res.json();

    if (data.result !== 'success') {
      throw new Error(data.error || 'Verification failed');
    }
  }

  btn.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      ui('Creating order…');

      const order = await createOrder();

      const rzp = new Razorpay({
        key: RZP_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: 'Spirezen Enterprises Pvt Ltd',
        description: 'Munterra Workshop',
        handler: async resp => {
          try {
            ui('Verifying payment…');
            await verifyPayment(resp);
            ui('Payment successful! Registration confirmed.');
            setTimeout(() => location.reload(), 2000);
          } catch (err) {
            console.error(err);
            ui('Payment successful! We will confirm via email.');
          }
        },
        modal: {
          ondismiss: () => ui('Payment cancelled')
        }
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      ui(err.message);
    }
  });
})();
