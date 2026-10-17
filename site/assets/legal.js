document.querySelectorAll('[data-print]').forEach(button => {
  button.addEventListener('click', () => window.print());
});

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copy);
    const status = document.querySelector('[data-copy-status]');
    if (!source || !status) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(source.textContent);
      status.textContent = 'Реквизиты скопированы.';
    } catch {
      source.classList.remove('sr-only');
      source.classList.add('legal-copy-fallback');
      source.style.whiteSpace = 'pre-wrap';
      source.style.overflowWrap = 'anywhere';
      status.textContent = 'Выделите реквизиты ниже и скопируйте вручную.';
    }
  });
});
