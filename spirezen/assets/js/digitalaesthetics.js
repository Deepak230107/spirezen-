(() => {
  const RZP_KEY_ID = 'rzp_test_Ruk0xr51QvmtpE';

  const form = document.getElementById('contact-form');
  const btn = document.getElementById('pay-now-submit-button');
  const msg = document.getElementById('form-message');

  function ui(text) {
    if (msg) {
      msg.style.display = text ? 'block' : 'none';
      msg.textContent = text || '';
    }
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

    // ✅ SAFE NORMALIZATION (IMPORTANT FIX)
    if (!o || !o.id || !o.currency) {
      throw new Error('Invalid order from server');
    }

    o.amount = Number(o.amount);
    if (!Number.isFinite(o.amount) || o.amount <= 0) {
      throw new Error('Invalid order amount');
    }

    o.currency = String(o.currency).toUpperCase();

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

  if (btn && form) {
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
          description: 'Digital Aesthetics Workshop',
          prefill: {
            name: form['your-name'].value,
            email: form['your-email'].value,
            contact: form['your-number'].value
          },
          handler: async resp => {
            try {
              ui('Verifying payment…');
              await verifyPayment(resp);
              ui('Payment successful! Registration confirmed.');
              setTimeout(() => location.reload(), 2500);
            } catch (err) {
              console.error(err);
              ui('Payment successful! Confirmation will be sent shortly.');
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
  }

  /* Hero Parallax Move Effect */
  const heroGrid = document.querySelector('.da-hero__grid');
  const heroVisual = document.querySelector('.vis-main');
  const heroContent = document.querySelector('.da-hero__content');

  if (heroGrid && heroVisual && heroContent) {
    heroGrid.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 40;
      const yPos = (clientY / window.innerHeight - 0.5) * 40;

      gsap.to(heroVisual, {
        duration: 1,
        x: xPos,
        y: yPos,
        ease: 'power2.out'
      });

      gsap.to(heroContent, {
        duration: 1.2,
        x: -xPos * 0.3,
        y: -yPos * 0.3,
        ease: 'power2.out'
      });
    });

    heroGrid.addEventListener('mouseleave', () => {
      gsap.to([heroVisual, heroContent], {
        duration: 1.5,
        x: 0,
        y: 0,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  }

  /* FAQ Logic */
  const faqQuestions = document.querySelectorAll('.dw-faq__q');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isOpen = item.classList.contains('dw-open');

      if (!isOpen) {
        item.classList.add('dw-open');
        q.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('dw-open');
        q.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();
