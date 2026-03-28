  document.querySelectorAll('.dw-faq__item').forEach(item => {
    const q = item.querySelector('.dw-faq__q');
    const t = item.querySelector('.dw-faq__toggle');
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('dw-open');
      document.querySelectorAll('.dw-faq__item').forEach(i => i.classList.remove('dw-open'));
      document.querySelectorAll('.dw-faq__toggle').forEach(tt => tt.textContent = '+');
      if (!wasOpen) { item.classList.add('dw-open'); t.textContent = '−'; }
    });
  });
