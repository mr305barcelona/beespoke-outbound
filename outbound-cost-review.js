(function(root){
 'use strict';
 function calculate(v){
  const keys=['cost','meetings','oppRate','winRate','revenue','margin'];
  if(keys.some(k=>v[k]===null||v[k]===undefined||String(v[k]).trim()===''||!Number.isFinite(Number(v[k]))||Number(v[k])<0))return{error:'invalid'};
  const n=Object.fromEntries(keys.map(k=>[k,Number(v[k])]));
  if(!Number.isSafeInteger(n.meetings)||['oppRate','winRate','margin'].some(k=>n[k]>100))return{error:'invalid'};
  const customers=n.meetings*n.oppRate/100*n.winRate/100;
  const profitPerMeeting=n.oppRate/100*n.winRate/100*n.revenue*n.margin/100;
  const profit=customers*n.revenue*n.margin/100,surplus=profit-n.cost;
  const multiple=n.cost>0?profit/n.cost:null,ratio=n.cost>0?surplus/n.cost*100:null;
  const required=profitPerMeeting>0?Math.ceil(n.cost/profitPerMeeting):null;
  if([customers,profitPerMeeting,profit,surplus,multiple,ratio,required].some(x=>x!==null&&!Number.isFinite(x)))return{error:'overflow'};
  return{customers,profit,surplus,multiple,ratio,required};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={calculate};
 if(!root.document)return;
 const box=root.document.querySelector('[data-cost-model]');if(!box)return;
 const copy=JSON.parse(box.querySelector('[data-cost-copy]').textContent),lang=root.document.documentElement.lang;
 const fields=[...box.querySelectorAll('[data-cost-input]')],outputs=[...box.querySelectorAll('[data-cost-output]')],unit=box.querySelector('[data-cost-currency]'),error=box.querySelector('[data-cost-error]');
 function render(){
  const values=Object.fromEntries(fields.map(el=>[el.dataset.costInput,el.value]));
  const empty=fields.every(el=>el.value.trim()==='');const result=calculate(values);
  fields.forEach(el=>{const bad=el.value!==''&&!el.validity.valid;el.setAttribute('aria-invalid',String(bad));});
  error.textContent=result.error?(empty?copy.empty:copy[result.error]):copy.valid;
  const money=new Intl.NumberFormat(lang,{style:'currency',currency:unit.value,maximumFractionDigits:2}),number=new Intl.NumberFormat(lang,{maximumFractionDigits:2,minimumFractionDigits:2});
  outputs.forEach(el=>{const key=el.dataset.costOutput,v=result[key];el.textContent=result.error?'—':v===null?copy.undefined:['profit','surplus'].includes(key)?money.format(v):key==='multiple'?number.format(v)+'×':key==='ratio'?number.format(v)+'%':key==='required'?new Intl.NumberFormat(lang).format(v):number.format(v);});
 }
 const blank=()=>{fields.forEach(el=>el.value='');render();};
 fields.forEach(el=>el.addEventListener('input',render));unit.addEventListener('change',render);
 box.querySelector('[data-cost-example]').addEventListener('click',()=>{const v={cost:3000,meetings:12,oppRate:25,winRate:20,revenue:20000,margin:60};fields.forEach(el=>el.value=v[el.dataset.costInput]);render();});
 box.querySelector('[data-cost-reset]').addEventListener('click',blank);
 blank();
})(typeof window!=='undefined'?window:globalThis);
