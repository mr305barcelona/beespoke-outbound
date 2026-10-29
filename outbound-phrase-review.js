(() => {
  'use strict';
  document.querySelectorAll('[data-phrase-review]').forEach(root => {
    const cfg = JSON.parse(root.querySelector('[data-phrase-config]').textContent);
    const input = root.querySelector('textarea'), status = root.querySelector('[role="status"]'), list = root.querySelector('[data-phrase-results]');
    const normalize = value => value.normalize('NFKC').toLocaleLowerCase(cfg.locale).replace(/[’‘]/g, "'");
    const clearResults = () => { list.replaceChildren(); list.hidden = true; };
    root.querySelectorAll('button').forEach(button => { button.disabled = false; });
    root.querySelector('[data-phrase-check]').addEventListener('click', () => {
      clearResults();
      if (!input.value.trim()) { status.textContent = cfg.empty; return; }
      const text = normalize(input.value), found = cfg.phrases.filter(phrase => text.includes(normalize(phrase)));
      if (!found.length) { status.textContent = cfg.none; return; }
      for (const phrase of found) { const item = document.createElement('li'); item.textContent = phrase; list.append(item); }
      list.hidden = false; status.textContent = cfg.found.replace('{count}', String(found.length));
    });
    root.querySelector('[data-phrase-clear]').addEventListener('click', () => { input.value = ''; clearResults(); status.textContent = cfg.empty; input.focus(); });
    input.addEventListener('input', () => { clearResults(); status.textContent = cfg.changed; });
  });
})();
