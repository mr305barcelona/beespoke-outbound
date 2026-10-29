/* Navigation and local resource filtering only. No collection, storage or booking logic. */
(() => {
  const header = document.querySelector('.journal-site-header');
  if (!header) return;
  document.body.dataset.journalEnhanced = 'true';
  const toggle = header.querySelector('.journal-menu-toggle');
  const links = header.querySelector('.journal-menu-links');
  const language = header.querySelector('.journal-language');
  const closeMenu = (focus = false) => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (focus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = !links.classList.contains('is-open');
    if (language) language.open = false;
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  header.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (language?.open) {
      event.preventDefault(); language.open = false; language.querySelector('summary').focus();
    } else if (links.classList.contains('is-open')) { event.preventDefault(); closeMenu(true); }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) { closeMenu(); if (language) language.open = false; }
    else if (language?.open && !language.contains(event.target)) language.open = false;
  });
  language?.addEventListener('toggle', () => {
    language.querySelector('summary').setAttribute('aria-expanded', String(language.open));
    if (language.open) closeMenu();
  });
  language?.addEventListener('focusout', event => { if (!language.contains(event.relatedTarget)) language.open = false; });
  const narrow = matchMedia('(max-width: 980px)');
  narrow.addEventListener('change', () => { closeMenu(); if (language) language.open = false; });

  const library = document.querySelector('[data-journal-library]');
  if (!library) return;
  const config = JSON.parse(library.querySelector('[data-resource-config]').textContent);
  const controls = library.querySelector('[data-resource-controls]');
  const search = library.querySelector('[data-resource-search]');
  const filters = [...library.querySelectorAll('[data-resource-filter]')];
  const rows = [...library.querySelectorAll('[data-resource-topics]')];
  const status = library.querySelector('[data-resource-status]');
  const empty = library.querySelector('[data-resource-empty]');
  const fold = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const texts = new Map(rows.map(row => [row, fold(row.textContent)]));
  let topic = 'all';
  const update = () => {
    const words = fold(search.value).trim().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const row of rows) {
      const matchesTopic = topic === 'all' || row.dataset.resourceTopics.split(' ').includes(topic);
      const matchesText = words.every(word => texts.get(row).includes(word));
      row.hidden = !(matchesTopic && matchesText);
      if (!row.hidden) count++;
    }
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.resourceFilter === topic)));
    status.textContent = config.count.replace('{count}', count);
    empty.hidden = count > 0;
  };
  filters.forEach(button => button.addEventListener('click', () => { topic = button.dataset.resourceFilter; update(); }));
  search.addEventListener('input', update);
  controls.hidden = false;
  update();
  const followFragment = () => {
    const key = location.hash.slice(1);
    if (!Object.prototype.hasOwnProperty.call(config.fragments, key)) return;
    const destination = config.fragments[key];
    topic = destination; search.value = ''; update();
    const target = library.querySelector('[data-resource-group="' + key + '"]') || library.querySelector('#resource-list');
    target.scrollIntoView({block: 'start'});
  };
  addEventListener('hashchange', followFragment);
  followFragment();
})();
