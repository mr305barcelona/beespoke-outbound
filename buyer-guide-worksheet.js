(() => {
  'use strict';
  document.querySelectorAll('[data-buyer-worksheet]').forEach(root => {
    const config = JSON.parse(root.querySelector('[data-worksheet-config]').textContent);
    const rows = [...root.querySelectorAll('[data-worksheet-row]')];
    const status = root.querySelector('[data-worksheet-status]');
    const controls = [...root.querySelectorAll('button')];
    const write = message => { status.textContent = message; };
    const clear = () => {
      rows.forEach(row => {row.querySelectorAll('textarea').forEach(field => {field.value = '';});row.querySelector('select').value = 'unknown';});
      write(config.empty);
    };
    root.querySelector('[data-worksheet-summary]').addEventListener('click', () => {
      const populated = rows.filter(row => [...row.querySelectorAll('textarea')].some(field => field.value.trim()));
      if (!populated.length) {write(config.empty);return;}
      const counts = {observed:0, inferred:0, unknown:0};
      populated.forEach(row => {counts[row.querySelector('select').value]++;});
      write(config.summary.replace('{rows}',String(populated.length)).replace('{observed}',String(counts.observed)).replace('{inferred}',String(counts.inferred)).replace('{unknown}',String(counts.unknown)));
    });
    root.querySelector('[data-worksheet-sample]').addEventListener('click', () => {
      clear();
      rows[0].querySelectorAll('textarea').forEach((field,i) => {field.value = config.sample[i];});
      rows[0].querySelector('select').value = 'inferred';
      write(config.fiction);
    });
    root.querySelector('[data-worksheet-reset]').addEventListener('click',clear);
    root.addEventListener('input', () => write(config.changed));
    root.addEventListener('change', () => write(config.changed));
    controls.forEach(control => {control.disabled = false;});
  });
})();
