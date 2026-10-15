/* Browser-only proposal completeness check; no storage, network or input analytics. */
(()=>{
 'use strict';
 const summarize=items=>({reviewed:items.filter(i=>i.checked).length,total:items.length,criticalMissing:items.filter(i=>i.critical&&!i.checked).length});
 if(typeof module!=='undefined'&&module.exports)module.exports={summarize};
 if(typeof document==='undefined')return;
 document.querySelectorAll('[data-agency-proposal-checklist]').forEach(root=>{
  const inputs=[...root.querySelectorAll('[data-evidence-item]')];
  const update=()=>{const s=summarize(inputs.map(i=>({checked:i.checked,critical:i.dataset.critical==='true'})));root.querySelector('[data-evidence-count]').textContent=`${s.reviewed} of ${s.total} evidence items reviewed`;root.querySelector('[data-evidence-status]').textContent=s.criticalMissing?`${s.criticalMissing} essential answer${s.criticalMissing===1?' is':'s are'} still missing: tools and access, qualification, incident handling or exit ownership.`:'All essential answers are marked reviewed. Verify their substance before signing; this checklist does not rate an agency or predict results.';};
  inputs.forEach(i=>i.addEventListener('change',update));root.querySelector('[data-evidence-reset]').addEventListener('click',()=>{inputs.forEach(i=>i.checked=false);update()});update();
 });
})();
