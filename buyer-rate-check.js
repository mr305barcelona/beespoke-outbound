(() => {
 'use strict';
 document.querySelectorAll('[data-buyer-rate-check]').forEach(root=>{
  const c=JSON.parse(root.querySelector('[data-rate-config]').textContent),inputs=[...root.querySelectorAll('[data-rate-value]')],confirmed=root.querySelector('[data-rate-cohort]'),outputs=[...root.querySelectorAll('[data-rate-output]')],status=root.querySelector('[data-rate-status]'),format=new Intl.NumberFormat(c.locale,{minimumFractionDigits:1,maximumFractionDigits:1});let fictional=false;
  const unavailable=()=>outputs.forEach(o=>{o.textContent=c.unavailable;});
  const resetState=()=>{unavailable();inputs.forEach(i=>i.removeAttribute('aria-invalid'));status.textContent=c.changed;fictional=false;};
  const calculate=()=>{
   unavailable();inputs.forEach(i=>i.removeAttribute('aria-invalid'));
   if(!confirmed.checked){status.textContent=c.empty;return;}
   let invalid=false;
   const values=inputs.map(i=>{const raw=i.value.trim();if(!raw)return null;const n=/^\d+$/.test(raw)?Number(raw):NaN;if(!Number.isSafeInteger(n)||n<0){invalid=true;i.setAttribute('aria-invalid','true');return null;}return n;});
   for(let j=0;j<4;j+=2)if(values[j]!==null&&values[j+1]!==null&&values[j+1]>values[j]){invalid=true;inputs[j+1].setAttribute('aria-invalid','true');}
   if(invalid){status.textContent=c.invalid;return;}
   const rate=j=>values[j]!==null&&values[j]>0&&values[j+1]!==null?values[j+1]/values[j]*100:null;
   const a=rate(0),b=rate(2);if(a!==null)outputs[0].textContent=format.format(a)+'%';if(b!==null)outputs[1].textContent=format.format(b)+'%';if(a!==null&&b!==null)outputs[2].textContent=format.format(b-a);
   status.textContent=(fictional?c.fiction+' ':'')+c.result;
  };
  root.querySelector('[data-rate-calculate]').addEventListener('click',calculate);
  root.querySelector('[data-rate-example]').addEventListener('click',()=>{[40,2,60,3].forEach((n,i)=>inputs[i].value=String(n));confirmed.checked=true;fictional=true;calculate();});
  root.querySelector('[data-rate-clear]').addEventListener('click',()=>{inputs.forEach(i=>{i.value='';i.removeAttribute('aria-invalid');});confirmed.checked=false;fictional=false;unavailable();status.textContent=c.empty;});
  inputs.forEach(i=>i.addEventListener('input',resetState));confirmed.addEventListener('change',resetState);root.querySelectorAll('button').forEach(b=>b.disabled=false);
 });
})();
