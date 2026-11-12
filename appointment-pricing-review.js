/* Optional, local-only arithmetic. No requests, tracking, storage or account access. */
(function(){
 'use strict';
 function calculate(values){
  if(!Array.isArray(values)||values.length!==5||values.some(v=>v===null||String(v).trim()===''))return null;
  const n=values.map(Number);if(n.some((v,i)=>!Number.isFinite(v)||v<0||v>(i?100000:100000000)||(i&&!Number.isInteger(v))))return null;
  const[cost,booked,held,accepted,opportunities]=n;if(held>booked||accepted>held||opportunities>accepted)return null;
  return {values:n,costs:[booked,held,accepted,opportunities].map(v=>v?cost/v:null)};
 }
 if(typeof module!=='undefined')module.exports={calculate};
 if(typeof document==='undefined')return;
 const el=document.querySelector('[data-quote-calculator]');if(!el)return;
 const cfg=JSON.parse(document.querySelector('[data-quote-config]').textContent),t=cfg.tool;
 const inputs=[0,1].map(i=>[...el.querySelectorAll('[data-quote="'+i+'"]')]),defaults=inputs.map(a=>a.map(x=>x.value)),currency=el.querySelector('[data-currency]'),error=el.querySelector('[data-error]'),results=el.querySelector('[data-results]');
 let current;
 const fmt=v=>v===null?t.na:new Intl.NumberFormat(cfg.locale,{style:'currency',currency:currency.value,maximumFractionDigits:2}).format(v);
 function update(){
  const data=inputs.map(a=>calculate(a.map(x=>x.value)));const bad=data.some(x=>x===null);error.hidden=!bad;error.textContent=bad?t.invalid:'';results.hidden=bad;el.querySelector('[data-export]').disabled=bad;current=bad?null:data;
  for(const a of inputs)for(const field of a)field.removeAttribute('aria-invalid');
  if(bad){for(let i=0;i<2;i++)if(data[i]===null)for(const field of inputs[i])field.setAttribute('aria-invalid','true');return;}
  results.querySelectorAll('tbody tr').forEach((row,i)=>row.querySelectorAll('td').forEach((cell,q)=>cell.textContent=fmt(data[q].costs[i])));
 }
 el.querySelector('[data-compare]').addEventListener('click',update);
 el.querySelector('[data-reset]').addEventListener('click',()=>{inputs.forEach((a,i)=>a.forEach((x,j)=>x.value=defaults[i][j]));currency.value='USD';update();});
 el.addEventListener('input',update);currency.addEventListener('change',update);
 el.querySelector('[data-export]').addEventListener('click',()=>{
  update();if(!current)return;const cell=s=>'"'+String(s).replaceAll('"','""')+'"';
  const rows=[[t.currency,currency.value],[t.intro],[t.result,...t.quotes],...t.fields.map((s,i)=>[s,...current.map(x=>x.values[i])]),...t.rows.map((s,i)=>[s,...current.map(x=>x.costs[i]===null?t.na:x.costs[i].toFixed(2))])];
  const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='appointment-quote-comparison.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 update();
})();
