(() => {
  const fields = [...document.querySelectorAll('main.shell textarea')];
  if (!fields.length) return;

  function restore() {
    document.querySelectorAll('.worksheet-print-value').forEach(node => node.remove());
    document.documentElement.removeAttribute('data-worksheet-print-ready');
  }

  // A textarea prints only its visible scroll window. Use its complete value
  // in a normal text block so long notes can continue onto the next page.
  window.addEventListener('beforeprint', () => {
    restore();
    fields.forEach(field => {
      const value = document.createElement('div');
      value.className = 'worksheet-print-value';
      value.textContent = field.value;
      field.insertAdjacentElement('afterend', value);
    });
    document.documentElement.setAttribute('data-worksheet-print-ready', '');
  });
  window.addEventListener('afterprint', restore);
})();
