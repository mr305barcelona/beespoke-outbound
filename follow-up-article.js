(() => {
 const root=document.getElementById('beespoke-follow-up-full');if(!root)return;
 const $=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],config=JSON.parse($('[data-followup-config]').textContent),{ui,samples,locale}=config;
 const page=$('.j-page'),workbook=$('[data-workbook]'),form=$('.j-review-form'),report=$('[data-report]'),fields=all('[data-followup-field]'),keys=fields.map(e=>e.dataset.followupField),checks=all('[data-review-checks] input');
 const el=(tag,value)=>{const n=document.createElement(tag);if(value!=null)n.textContent=value;return n;};
 const text=(key,args={})=>String(ui[key]).replace(/\{(\w+)\}/g,(m,k)=>args[k]??m),status=(key,args)=>{$('[data-workbook-status]').textContent=text(key,args);};
 let serial=0,active=0,pending=false;const blank=()=>({id:++serial,name:text('yourMessage',{n:serial}),values:Object.fromEntries(keys.map(k=>[k,['state','evidence'].includes(k)?'unknown':''])),judgments:Array(checks.length).fill(false)}),drafts=[blank()],current=()=>drafts[active];
 function resize(){all('textarea').forEach(e=>{if(!e.checkVisibility())return;e.style.height='auto';e.style.height=Math.max(parseFloat(getComputedStyle(e).minHeight)||90,e.scrollHeight+2)+'px';});}
 function capture(){fields.forEach(e=>current().values[e.dataset.followupField]=e.value);current().judgments=checks.map(e=>e.checked);}
 function show(){fields.forEach(e=>e.value=current().values[e.dataset.followupField]??'');checks.forEach((e,i)=>e.checked=!!current().judgments[i]);const picker=$('[data-draft-picker]');picker.replaceChildren();drafts.forEach((d,i)=>{const o=el('option',d.name);o.value=String(i);picker.append(o);});picker.value=String(active);$('[data-draft-picker-label]').hidden=drafts.length<2;$('[data-remove]').hidden=drafts.length<2;form.hidden=false;report.hidden=true;pending=false;$('[data-clear-confirm]').hidden=true;$('[data-csv-output]').hidden=true;status(current().values.evidence==='fictional'?'fictionLoaded':'fullShown');requestAnimationFrame(resize);}
 function load(id){const s=samples.find(s=>s.id===id);if(!s){status('choose');return;}capture();if(keys.some(k=>!['state','evidence'].includes(k)&&current().values[k].trim())){if(drafts.length>=50){status('limit');return;}drafts.push(blank());active=drafts.length-1;}current().name=s.name;current().values={...s.values};current().judgments=Array(checks.length).fill(false);show();workbook.open=true;status('sampleLoaded');$('[data-followup-field="context"]').focus();}
 function build(){capture();const dl=$('[data-report-notes]');dl.replaceChildren();for(const k of keys){let v=current().values[k];v=k==='state'?ui.states[v]:k==='evidence'?ui.evidence[v]:v.trim()||ui.evidence.unknown;dl.append(el('dt',ui.fields[k]),el('dd',v));}$('[data-decision]').textContent=ui.decisions[current().values.state]||ui.decisions.unknown;form.hidden=true;report.hidden=false;status('reviewOpen');$('[data-edit-review]').focus();}
 function cell(v){let s=String(v??'');if(/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
 function exportCSV(){capture();const rows=[[ui.messageColumn,...keys.map(k=>ui.fields[k]),ui.result,ui.judgments]];for(const d of drafts)rows.push([d.name,...keys.map(k=>k==='state'?ui.states[d.values[k]]:k==='evidence'?ui.evidence[d.values[k]]:d.values[k]),ui.decisions[d.values.state]||ui.decisions.unknown,d.judgments.map((x,i)=>(i+1)+': '+(x?ui.checked:ui.unchecked)).join('; ')]);const csv='\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n');$('[data-csv-text]').value=csv;$('[data-csv-output]').hidden=false;const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=el('a');a.href=u;a.download='cold-email-follow-up-review-'+locale+'.csv';root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);status('csvReady');resize();}
 function mark(id){all('[data-jump]').forEach(a=>{if(a.dataset.jump===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 root.addEventListener('click',e=>{const jump=e.target.closest('[data-jump]');if(jump){mark(jump.dataset.jump);if(jump.hasAttribute('data-open'))workbook.open=true;const mobile=$('.j-mobile-contents');if(mobile.open){mobile.open=false;mobile.querySelector('summary').focus();}requestAnimationFrame(resize);return;}const b=e.target.closest('button');if(!b)return;
 if(b.hasAttribute('data-use-selected'))return load($('[data-example-select]').value);
 if(b.hasAttribute('data-build-review'))return build();
 if(b.hasAttribute('data-edit-review')){delete page.dataset.print;form.hidden=false;report.hidden=true;status('edited');requestAnimationFrame(resize);$('[data-followup-field="next"]').focus();return;}
 if(b.hasAttribute('data-new-draft')){capture();if(drafts.length>=50){status('limit');return;}drafts.push(blank());active=drafts.length-1;show();status('newReady');$('[data-followup-field="context"]').focus();return;}
 if(b.hasAttribute('data-remove')&&drafts.length>1){drafts.splice(active,1);active=Math.max(0,active-1);show();status('removed');return;}
 if(b.hasAttribute('data-export'))return exportCSV();
 if(b.hasAttribute('data-close-csv')){$('[data-csv-output]').hidden=true;return;}
 if(b.hasAttribute('data-clear')){pending=true;$('[data-clear-confirm]').hidden=false;return;}
 if(b.hasAttribute('data-clear-no')){pending=false;$('[data-clear-confirm]').hidden=true;return;}
 if(b.hasAttribute('data-clear-yes')&&pending){drafts[active]=blank();show();status('cleared');return;}
 if(b.hasAttribute('data-print')){page.dataset.print='report';workbook.open=true;status('printReady');window.print();}
 });
 $('[data-draft-picker]').addEventListener('change',e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&drafts[n]){capture();active=n;show();}});
 fields.forEach(e=>e.addEventListener(e.tagName==='SELECT'?'change':'input',()=>{capture();status('changed');resize();}));checks.forEach(e=>e.addEventListener('change',capture));
 all('details').forEach(d=>d.addEventListener('toggle',resize));root.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const m=$('.j-mobile-contents');if(m.open&&m.contains(e.target)){m.open=false;m.querySelector('summary').focus();}});
 window.addEventListener('afterprint',()=>delete page.dataset.print);window.addEventListener('resize',resize);
 const aliases=config.legacy;
 function hash(){const id=decodeURIComponent(location.hash.slice(1)),target=aliases[id]||id;mark(target);if(target==='f-review'&&id)workbook.open=true;}
 window.addEventListener('hashchange',hash);
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0])mark(visible[0].target.id);},{rootMargin:'-110px 0px -60% 0px'});all('.j-content>.j-section').forEach(s=>observer.observe(s));
 all('button[disabled]').forEach(b=>b.disabled=false);show();hash();
})();
