(() => {
 const root=document.getElementById('beespoke-logistics-full');if(!root)return;
 const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],config=JSON.parse($('[data-logistics-config]').textContent),{ui,samples,locale,legacy}=config;
 const fields=all('[data-account-field]'),keys=fields.map(e=>e.dataset.accountField),workbook=$('[data-workbook]'),page=$('.j-page');let pending=false;
 const el=(tag,value)=>{const n=document.createElement(tag);if(value!=null)n.textContent=value;return n;};
 const blank=()=>Object.fromEntries(keys.map(k=>[k,ui.options[k]?'unknown':'']));let values=blank();
 function capture(){fields.forEach(e=>values[e.dataset.accountField]=e.value);}
 function resize(){all('textarea').forEach(e=>{if(!e.checkVisibility())return;e.style.height='auto';e.style.height=Math.max(90,e.scrollHeight+2)+'px';});}
 function status(s){$('[data-workbook-status]').textContent=s;}
 function show(){fields.forEach(e=>e.value=values[e.dataset.accountField]);$('[data-report]').hidden=true;$('[data-csv-output]').hidden=true;$('[data-clear-confirm]').hidden=true;pending=false;$('[data-report-notes]').replaceChildren();$('[data-decision]').textContent='';delete $('[data-decision]').dataset.decisionKey;$('[data-csv-text]').value='';status(values.evidence==='fictional'?ui.fiction:ui.ready);requestAnimationFrame(resize);}
 function decisionKey(v){if(v.relationship==='excluded'||v.response==='decline'||v.fit==='no'||v.approval==='no')return 'stop';if(v.relationship!=='clear')return 'relationship';if(v.fit!=='yes')return 'research';if(v.approval!=='yes')return 'approve';if(!v.owner.trim())return 'owner';if(v.evidence==='unknown'||!v.source.trim())return 'research';if(v.response==='later')return 'later';if(v.response==='rfq')return 'rfq';if(v.response==='meeting')return v.booking==='verified'&&v.evidence!=='unknown'?'verified':'booking';return v.response==='unanswered'?'unanswered':'unknown';}
 function decision(v){const key=decisionKey(v);return (v.evidence==='fictional'?ui.fictionPrefix:'')+ui.decisions[key]+(key==='later'?' '+(v.date?ui.dated+v.date:ui.noDate):'');}
 function display(k,v){return ui.options[k]?.[v]||v.trim()||ui.blank;}
 function build(){capture();$('[data-decision]').textContent=decision(values);$('[data-decision]').dataset.decisionKey=decisionKey(values);const dl=$('[data-report-notes]');dl.replaceChildren();keys.forEach(k=>dl.append(el('dt',ui.fields[k]),el('dd',display(k,values[k]))));$('[data-report]').hidden=false;status(ui.warning);$('[data-edit-review]').focus();}
 function cell(v){let s=String(v??'');if(/^\s*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
 function exportCSV(){capture();const rows=[keys.map(k=>ui.fields[k]).concat(ui.result),keys.map(k=>display(k,values[k])).concat(decision(values))],csv='\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n');$('[data-csv-text]').value=csv;$('[data-csv-output]').hidden=false;const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=el('a');a.href=url;a.download='logistics-account-review-'+locale+'.csv';root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status(ui.csvReady);resize();}
 function mark(id){all('[data-jump]').forEach(a=>a.dataset.jump===id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));}
 root.addEventListener('click',e=>{const a=e.target.closest('[data-jump]');if(a){mark(a.dataset.jump);if(a.hasAttribute('data-open'))workbook.open=true;const mobile=$('.j-mobile-contents');if(mobile.open){mobile.open=false;mobile.querySelector('summary').focus();}return;}const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-build-review'))return build();
 if(b.hasAttribute('data-edit-review')){delete page.dataset.print;$('[data-account-field="fit"]').focus();return;}
 if(b.hasAttribute('data-use-selected')){const sample=samples.find(s=>s.id===$('[data-example-select]').value);if(!sample){status(ui.selectFirst);return;}values={...sample.values};show();status(ui.fiction);return;}
 if(b.hasAttribute('data-export'))return exportCSV();
 if(b.hasAttribute('data-close-csv')){$('[data-csv-output]').hidden=true;return;}
 if(b.hasAttribute('data-clear')){pending=true;$('[data-clear-confirm]').hidden=false;$('[data-clear-no]').focus();return;}
 if(b.hasAttribute('data-clear-no')){pending=false;$('[data-clear-confirm]').hidden=true;return;}
 if(b.hasAttribute('data-clear-yes')&&pending){values=blank();show();status(ui.cleared);return;}
 if(b.hasAttribute('data-print')){build();page.dataset.print='report';status(ui.printReady);window.print();}
 });
 fields.forEach(e=>e.addEventListener(e.tagName==='SELECT'||e.type==='date'?'change':'input',()=>{capture();$('[data-report]').hidden=true;$('[data-csv-output]').hidden=true;status(ui.changed);resize();}));
 all('details').forEach(d=>d.addEventListener('toggle',resize));root.addEventListener('keydown',e=>{const m=$('.j-mobile-contents');if(e.key==='Escape'&&m.open&&m.contains(e.target)){m.open=false;m.querySelector('summary').focus();}});
 function hash(){const id=decodeURIComponent(location.hash.slice(1)),target=legacy[id]||id;mark(target);if(target==='g-review'&&id)workbook.open=true;}
 window.addEventListener('hashchange',hash);window.addEventListener('afterprint',()=>delete page.dataset.print);window.addEventListener('resize',resize);
 let queued=false;const reading=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;let chosen;for(const s of all('.j-content>.j-section')){if(!chosen||s.getBoundingClientRect().top<=135)chosen=s;else break;}if(chosen)mark(chosen.id);});};window.addEventListener('scroll',reading,{passive:true});window.addEventListener('resize',reading);
 all('button[disabled]').forEach(b=>b.disabled=false);show();hash();
})();
