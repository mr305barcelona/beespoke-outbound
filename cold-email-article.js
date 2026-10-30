(() => {
  const root = document.getElementById('beespoke-cold-email-full');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const all = selector => [...root.querySelectorAll(selector)];
  const config = JSON.parse($('[data-cold-email-config]').textContent);
  const {ui, samples, locale} = config;
  const page = $('.j-page');
  const sections = all('.j-content > .j-section');
  const workbook = $('[data-workbook]');
  const form = $('.j-review-form');
  const report = $('[data-report]');
  const fields = all('[data-field]');
  const keys = fields.map(field => field.dataset.field);
  const checks = all('[data-review-checks] input');
  let serial = 0, active = 0, pendingClear = false;
  const text = (key, values = {}) => String(ui[key]).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  const element = (tag, value) => {
    const node = document.createElement(tag);
    if (value != null) node.textContent = value;
    return node;
  };
  const resize = () => all('textarea').forEach(field => {
    if (!field.checkVisibility()) return;
    field.style.height = 'auto';
    field.style.height = Math.max(parseFloat(getComputedStyle(field).minHeight) || 90, field.scrollHeight + 2) + 'px';
  });
  const status = (key, values) => { $('[data-workbook-status]').textContent = text(key, values); };
  const blank = () => ({id: ++serial, name: text('yourMessage', {n: serial}), values: Object.fromEntries(keys.map(key => [key, key === 'evidence' ? 'unknown' : ''])), judgments: Array(6).fill(false)});
  const drafts = [blank()];
  const current = () => drafts[active];
  const legacy = {'guide-section-1':'j-context','guide-section-2':'j-context','guide-section-3':'j-examples','guide-section-4':'j-review','guide-section-5':'j-offer','guide-section-6':'j-length','guide-section-7':'j-measure','buyer-worksheet':'j-review','phrase-review':'j-review','buyer-decision-guide':'j-practice','frequently-asked-questions':'j-faq',sources:'j-sources'};
  function navigate(id, {updateHash = true, openTool = false} = {}) {
    if (id && !sections.some(section => section.id === id)) return;
    sections.forEach(section => { section.hidden = !!id && section.id !== id; });
    all('[data-jump]').forEach(link => {
      const on = !!id && link.dataset.jump === id;
      if (on) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    all('[data-show-all]').forEach(button => { button.hidden = !id; });
    if (openTool && id === 'j-review') workbook.open = true;
    const mobile = $('.j-mobile-contents');
    if (mobile.open) { mobile.open = false; mobile.querySelector('summary').focus(); }
    $('[data-section-status]').textContent = id ? text('sectionShown', {section: sections.find(section => section.id === id).dataset.sectionLabel}) : text('fullShown');
    if (updateHash) history.replaceState(null, '', location.pathname + location.search + (id ? '#' + id : ''));
    requestAnimationFrame(resize);
    window.dispatchEvent(new Event('resize'));
  }
  function capture() {
    fields.forEach(field => { current().values[field.dataset.field] = field.value; });
    current().judgments = checks.map(check => check.checked);
  }
  function showDraft() {
    fields.forEach(field => { field.value = current().values[field.dataset.field] ?? ''; });
    checks.forEach((check, index) => { check.checked = !!current().judgments[index]; });
    const picker = $('[data-draft-picker]');
    picker.replaceChildren();
    drafts.forEach((draft, index) => {
      const option = element('option', draft.name); option.value = String(index); picker.append(option);
    });
    picker.value = String(active);
    $('[data-draft-picker-label]').hidden = drafts.length < 2;
    form.hidden = false; report.hidden = true;
    pendingClear = false; $('[data-clear-confirm]').hidden = true;
    $('[data-csv-output]').hidden = true;
    $('[data-workbook-status]').textContent = current().values.evidence === 'fictional' ? text('fictionLoaded') : '';
    requestAnimationFrame(resize);
  }
  function loadExample(id) {
    const sample = samples.find(item => item.id === id);
    if (!sample) return;
    capture();
    const occupied = keys.some(key => key !== 'evidence' && current().values[key].trim());
    if (occupied) {
      if (drafts.length >= 50) { status('limit'); return; }
      drafts.push(blank()); active = drafts.length - 1;
    }
    current().name = sample.name;
    current().values = {context:sample.context,offer:sample.offer,message:ui.subject + ': ' + sample.subject + '\n\n' + sample.message,next:sample.next,unknown:sample.unknown,stop:sample.stop,owner:sample.owner,evidence:'fictional'};
    current().judgments = Array(6).fill(false);
    showDraft(); workbook.open = true;
    navigate('j-review', {openTool:true});
    status(occupied ? 'sampleAdded' : 'sampleLoaded');
    $('[data-field="context"]').focus();
  }
  function buildReview() {
    capture();
    const notes = $('[data-report-notes]'); notes.replaceChildren();
    keys.forEach(key => {
      const value = key === 'evidence' ? ui.evidence[current().values[key]] : current().values[key].trim() || ui.evidence.unknown;
      notes.append(element('dt', ui.fields[key]), element('dd', value));
    });
    form.hidden = true; report.hidden = false;
    status('reviewOpen'); $('[data-edit-review]').focus();
  }
  function cell(value) {
    let result = String(value ?? '');
    if (/^[\s]*[=+\-@\t\r]/.test(result)) result = "'" + result;
    return '"' + result.replaceAll('"', '""') + '"';
  }
  function exportCSV() {
    capture();
    const rows = [[ui.messageColumn, ...keys.map(key => ui.fields[key]), ui.judgments]];
    drafts.forEach(draft => rows.push([draft.name, ...keys.map(key => key === 'evidence' ? ui.evidence[draft.values[key]] : draft.values[key]), draft.judgments.map((checked,index) => (index + 1) + ': ' + (checked ? ui.checked : ui.unchecked)).join('; ')]));
    const csv = '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
    $('[data-csv-text]').value = csv; $('[data-csv-output]').hidden = false;
    const object = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
    const link = element('a'); link.href = object; link.download = 'b2b-cold-email-message-review-' + locale + '.csv'; root.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(object), 1000);
    status('csvReady'); resize();
  }
  function reviewPhrasing() {
    const draft = $('[data-phrase-input]').value.trim();
    const output = $('[data-phrase-results]'); output.replaceChildren();
    if (!draft) { output.append(element('p', text('phraseEmpty'))); return; }
    const hits = [];
    for (const [phrases,note] of [[ui.phraseOpeners,ui.openingNote],[ui.phraseClaims,ui.claimNote]]) {
      for (const phrase of phrases) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(?<![\\p{L}\\p{N}])' + escaped + '(?![\\p{L}\\p{N}])', 'giu');
        for (const match of draft.matchAll(regex)) hits.push({at:match.index,end:match.index+match[0].length,text:match[0],note});
      }
    }
    hits.sort((a,b) => a.at - b.at);
    output.append(element('p', hits.length ? text('phraseFound',{n:hits.length}) : text('phraseNone')));
    for (const hit of hits) {
      const item = element('div'); item.className = 'j-hit';
      item.append(element('strong',hit.text),element('q',(hit.at>55?'…':'')+draft.slice(Math.max(0,hit.at-55),Math.min(draft.length,hit.end+75))+(hit.end+75<draft.length?'…':'')),element('p',hit.note)); output.append(item);
    }
    const manual = element('div'); manual.className = 'j-hit';
    manual.append(element('strong',ui.also),element('p',ui.manual)); output.append(manual);
  }
  root.addEventListener('click', event => {
    const jump = event.target.closest('[data-jump]');
    if (jump) {
      const id=jump.dataset.jump;
      if(jump.tagName==='A') navigate(id,{updateHash:false,openTool:jump.hasAttribute('data-open')});
      else {event.preventDefault();navigate(id,{openTool:jump.hasAttribute('data-open')});requestAnimationFrame(()=>document.getElementById(id).scrollIntoView({block:'start'}));}
      return;
    }
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-show-all')) { navigate(null);requestAnimationFrame(()=>sections[0].scrollIntoView({block:'start'}));return; }
    if (button.hasAttribute('data-load')) { loadExample(button.dataset.load); return; }
    if (button.hasAttribute('data-use-selected')) { const id=$('[data-example-select]').value; if(id)loadExample(id);else status('choose');return; }
    if (button.hasAttribute('data-build-review')) { buildReview(); return; }
    if (button.hasAttribute('data-edit-review')) { delete page.dataset.print;form.hidden=false;report.hidden=true;status('edited');requestAnimationFrame(resize);$('[data-field="message"]').focus();return; }
    if (button.hasAttribute('data-new-draft')) { capture();if(drafts.length>=50){status('limit');return;}drafts.push(blank());active=drafts.length-1;showDraft();status('newReady');$('[data-field="context"]').focus();return; }
    if (button.hasAttribute('data-export')) { exportCSV();return; }
    if (button.hasAttribute('data-close-csv')) { $('[data-csv-output]').hidden=true;return; }
    if (button.hasAttribute('data-clear')) { pendingClear=true;$('[data-clear-confirm]').hidden=false;return; }
    if (button.hasAttribute('data-clear-no')) { pendingClear=false;$('[data-clear-confirm]').hidden=true;return; }
    if (button.hasAttribute('data-clear-yes') && pendingClear) { const id=current().id;drafts[active]=blank();drafts[active].id=id;drafts[active].name=ui.clearedName;showDraft();status('cleared');return; }
    if (button.hasAttribute('data-print')) { page.dataset.print='report';workbook.open=true;status('printReady');window.print();return; }
    if (button.hasAttribute('data-phrase-check')) { reviewPhrasing();return; }
    if (button.hasAttribute('data-phrase-clear')) { $('[data-phrase-input]').value='';$('[data-phrase-results]').replaceChildren(element('p',ui.phraseClear));resize(); }
  });
  $('[data-draft-picker]').addEventListener('change', event => { const next=Number(event.target.value);if(Number.isInteger(next)&&drafts[next]){capture();active=next;showDraft();} });
  fields.forEach(field => field.addEventListener('input',()=>{capture();status('changed');resize();}));
  checks.forEach(check => check.addEventListener('change',capture));
  $('[data-phrase-input]').addEventListener('input',()=>{const output=$('[data-phrase-results]');if(output.childElementCount)output.replaceChildren(element('p',ui.phraseChanged));resize();});
  all('details').forEach(detail=>detail.addEventListener('toggle',resize));
  root.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const menu=$('.j-mobile-contents');if(menu.open&&menu.contains(event.target)){menu.open=false;menu.querySelector('summary').focus();}});
  window.addEventListener('resize',resize);
  window.addEventListener('afterprint',()=>delete page.dataset.print);
  function openHash(){const id=decodeURIComponent(location.hash.slice(1));if(legacy[id]||sections.some(section=>section.id===id)){navigate(legacy[id]||id,{updateHash:false,openTool:id==='buyer-worksheet'});if(id==='phrase-review')$('[data-phrase-tool]').open=true;requestAnimationFrame(()=>document.getElementById(id).scrollIntoView({block:'start'}));}else if(!id)navigate(null,{updateHash:false});}
  window.addEventListener('hashchange',openHash);
  all('button[disabled]').forEach(button=>{button.disabled=false;});
  showDraft();
  const hash=decodeURIComponent(location.hash.slice(1));
  if(legacy[hash]||sections.some(section=>section.id===hash))openHash();
})();
