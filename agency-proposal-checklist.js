/* Browser-only proposal completeness check; no storage, network or input analytics. */
(()=>{
 'use strict';
 const summarize=items=>({reviewed:items.filter(i=>i.checked).length,total:items.length,criticalMissing:items.filter(i=>i.critical&&!i.checked).length});
 if(typeof module!=='undefined'&&module.exports)module.exports={summarize};
 if(typeof document==='undefined')return;
 document.querySelectorAll('[data-agency-proposal-checklist]').forEach(root=>{
  const inputs=[...root.querySelectorAll('[data-evidence-item]')];
  inputs.forEach(i=>i.checked=false);
  const copy=JSON.parse(root.querySelector('[data-checklist-copy]')?.textContent||'null');
  const update=()=>{const s=summarize(inputs.map(i=>({checked:i.checked,critical:i.dataset.critical==='true'})));const fill=v=>v.replace('{n}',String(s.criticalMissing)).replace('{total}',String(s.total));root.querySelector('[data-evidence-count]').textContent=copy?copy.count.replace('{n}',String(s.reviewed)).replace('{total}',String(s.total)):`${s.reviewed} of ${s.total} evidence items reviewed`;root.querySelector('[data-evidence-status]').textContent=copy?(s.criticalMissing?fill(copy.missing):copy.complete):(s.criticalMissing?`${s.criticalMissing} essential answers still missing: tools and access, qualification, incident handling or exit ownership.`:'All essential answers are marked reviewed. Verify their substance before signing; this checklist does not rate an agency or predict results.');};
  inputs.forEach(i=>i.addEventListener('change',update));root.querySelector('[data-evidence-reset]').addEventListener('click',()=>{inputs.forEach(i=>i.checked=false);update()});update();
 });
})();
