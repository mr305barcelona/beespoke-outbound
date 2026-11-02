/* Article navigation and private in-page notes. No collection or persistent storage. */
(() => {
 const root=document.querySelector('#beespoke-plan-full');if(!root)return;
 const {locale,ui:u,keys,gates,numbers,legacy}=JSON.parse(root.querySelector('[data-plan-config]').textContent);
 const planner=root.querySelector('[data-planner]'),one=s=>planner.querySelector(s),field=k=>one('[data-plan="'+k+'"]'),number=k=>one('[data-number="'+k+'"]'),state=k=>one('[data-gate="'+k+'"]'),evidence=k=>one('[data-evidence="'+k+'"]'),owner=k=>one('[data-gate-owner="'+k+'"]');
 const report=one('[data-report]'),status=one('[data-status]'),output=one('[data-plan-output]'),copy=one('[data-copy-text]'),page=root.querySelector('.j-page');
 let fictional=false,pending=null,ready=false;
 const fmt=v=>new Intl.NumberFormat(locale,{maximumFractionDigits:2}).format(v),text=v=>v.trim()||u.unknown;
 const hasNotes=()=>keys.some(k=>field(k).value)||numbers.some(k=>number(k).value)||gates.some(k=>state(k).value!=='unknown'||evidence(k).value||owner(k).value)||one('[data-plan-owner]').value||one('[data-plan-date]').value;
 function capacity(){
  const raw=numbers.map(k=>number(k).value.trim());
  if(raw.some(v=>v===''))return u.calcUnknown;
  const v=raw.map(Number);if(v.some(n=>!Number.isSafeInteger(n)||n<0||n>100000)||v[9]===0||v[10]<1||v[10]>10)return u.calcInvalid;
  const reserved=v.slice(1,9).reduce((a,b)=>a+b,0);if(reserved>v[0])return u.calcOver;
  const remaining=v[0]-reserved,per=v[9]+(v[10]-1)*v[11],accounts=Math.floor(remaining/per),values={available:v[0],reserved,remaining,per,accounts,unused:remaining-accounts*per};
  return u.calcResult.replace(/\{(\w+)\}/g,(_,k)=>fmt(values[k]));
 }
 function decision(){
  if(gates.some(k=>state(k).value==='rejected'))return u.rejected;
  if(gates.some(k=>state(k).value!=='provided'||!evidence(k).value.trim()||!owner(k).value.trim()))return u.hold;
  return u.provided;
 }
 function fullText(){return [u.report,u.warning,...(fictional?[u.fiction]:[]),one('[data-decision]').textContent,'',output.textContent].join('\n');}
 function build(){
  const rows=[u.owner+': '+text(one('[data-plan-owner]').value),u.date+': '+text(one('[data-plan-date]').value)];
  keys.forEach((k,i)=>rows.push('',u.fields[i],text(field(k).value)));
  rows.push('',u.capacity,capacity(),'',u.gateTitle,decision());
  gates.forEach((k,i)=>{rows.push('',u.gateLabels[i]+' — '+u.states[state(k).value],text(evidence(k).value),u.gateOwner+': '+text(owner(k).value));if(state(k).value==='provided'&&(!evidence(k).value.trim()||!owner(k).value.trim()))rows.push(u.missing);});
  output.textContent=rows.join('\n');one('[data-decision]').textContent=decision();copy.value=fullText();one('[data-fiction]').hidden=!fictional;report.hidden=false;one('[data-copy]').disabled=false;one('[data-print]').disabled=false;ready=true;status.textContent=u.warning;
 }
 function changed(){ready=false;report.hidden=true;output.textContent='';copy.value='';one('[data-decision]').textContent='';one('[data-copy]').disabled=true;one('[data-print]').disabled=true;one('[data-copy-output]').hidden=true;status.textContent=u.changed;one('[data-capacity]').textContent=capacity();}
 function clear(){
  output.textContent='';copy.value='';one('[data-decision]').textContent='';one('[data-fiction]').hidden=true;
  planner.querySelectorAll('textarea,input').forEach(e=>e.value='');gates.forEach(k=>state(k).value='unknown');fictional=false;report.hidden=true;one('[data-copy-output]').hidden=true;ready=false;one('[data-copy]').disabled=true;one('[data-print]').disabled=true;one('[data-capacity]').textContent=u.calcUnknown;
 }
 function sample(){
  clear();keys.forEach((k,i)=>field(k).value=u.sampleNotes[i]);one('[data-plan-owner]').value=u.sampleOwner;one('[data-plan-date]').value='2026-11-09';
  [600,60,30,60,30,30,90,30,30,20,1,5].forEach((v,i)=>number(numbers[i]).value=String(v));
  gates.forEach(k=>{state(k).value=k==='copy'?'unresolved':'provided';evidence(k).value=k==='copy'?u.sampleBlock:u.sampleGate;owner(k).value=u.sampleOwner;});
  fictional=true;changed();build();
 }
 function request(action){if(hasNotes()){pending=action;one('[data-confirm]').hidden=false;one('[data-confirm-yes]').focus();}else apply(action);}
 function apply(action){one('[data-confirm]').hidden=true;pending=null;if(action==='sample')sample();else{clear();status.textContent=u.cleared;}one('[data-'+(action==='sample'?'sample':'clear')+']').focus();}
 planner.addEventListener('input',e=>{if(e.target.matches('textarea:not([readonly]),input,select'))changed();});
 planner.addEventListener('change',e=>{if(e.target.matches('select'))changed();});
 one('[data-build]').addEventListener('click',build);
 one('[data-calculate]').addEventListener('click',()=>one('[data-capacity]').textContent=capacity());
 one('[data-sample]').addEventListener('click',()=>request('sample'));
 one('[data-clear]').addEventListener('click',()=>request('clear'));
 one('[data-confirm-yes]').addEventListener('click',()=>{if(pending)apply(pending);});
 one('[data-confirm-no]').addEventListener('click',()=>{const back=pending;pending=null;one('[data-confirm]').hidden=true;one('[data-'+(back==='sample'?'sample':'clear')+']').focus();});
 one('[data-copy]').addEventListener('click',()=>{if(!ready)return;one('[data-copy-output]').hidden=false;copy.value=fullText();copy.focus();copy.select();});
 one('[data-print]').addEventListener('click',()=>{if(!ready)return;page.dataset.print='report';planner.open=true;window.print();});
 addEventListener('afterprint',()=>delete page.dataset.print);
 planner.querySelectorAll('button').forEach(b=>b.disabled=false);one('[data-copy]').disabled=true;one('[data-print]').disabled=true;
 root.querySelectorAll('[data-jump]').forEach(a=>a.addEventListener('click',()=>{if(a.hasAttribute('data-open')||a.dataset.jump==='p-workbook')planner.open=true;const mobile=root.querySelector('.j-mobile-contents');if(mobile?.contains(a))mobile.open=false;}));
 const sections=[...root.querySelectorAll('.j-section')],links=[...root.querySelectorAll('[data-contents] a')];
 let queued=false;const highlight=()=>{queued=false;let current=sections[0];const line=Math.max(140,(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0)+(parseFloat(getComputedStyle(sections[0]).scrollMarginTop)||0)+16);for(const section of sections){if(section.getBoundingClientRect().top<=line)current=section;else break;}if(innerHeight+scrollY>=document.documentElement.scrollHeight-5)current=sections.at(-1);links.forEach(a=>{if(a.getAttribute('href')==='#'+current.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});};const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(highlight);}};addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);root.addEventListener('toggle',schedule,true);const observer=new IntersectionObserver(schedule,{rootMargin:'-110px 0px -55% 0px'});sections.forEach(s=>observer.observe(s));schedule();
 const follow=()=>{let id;try{id=decodeURIComponent(window.location.hash.slice(1));}catch{return;}const target=legacy[id];if(target){if(target==='p-workbook')planner.open=true;root.querySelector('#'+target)?.scrollIntoView({block:'start'});}};addEventListener('hashchange',follow);follow();
})();
