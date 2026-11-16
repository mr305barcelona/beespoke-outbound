/* Quote arithmetic stays on this page. No requests, storage or input analytics. */
(() => {
  'use strict';
  const keys=['aHours','aRate','aExtras','aInternal','aHeld','bBookings','bRate','bExtras','bInternal','bHeld'];
  const calculate=v=>{const aTotal=v.aHours*v.aRate+v.aExtras+v.aInternal,bTotal=v.bBookings*v.bRate+v.bExtras+v.bInternal;return{aTotal,bTotal,aUnit:v.aHeld>0?aTotal/v.aHeld:null,bUnit:v.bHeld>0?bTotal/v.bHeld:null};};
  const validate=v=>keys.every(k=>Number.isFinite(v[k])&&v[k]>=0&&v[k]<=Number.MAX_SAFE_INTEGER)&&['aHeld','bBookings','bHeld'].every(k=>Number.isSafeInteger(v[k]))&&v.bHeld<=v.bBookings&&Object.values(calculate(v)).every(n=>n===null||(Number.isFinite(n)&&n<=Number.MAX_SAFE_INTEGER));
  if(typeof module!=='undefined'&&module.exports)module.exports={calculate,validate};
  if(typeof document==='undefined')return;
  const locale={en:'en-US',es:'es-ES',ca:'ca-ES',fr:'fr-FR'}[document.documentElement.lang]||'en-US';
  document.querySelectorAll('[data-quote-model-calculator]').forEach(calc=>{
    const inputs=[...calc.querySelectorAll('[data-quote-input]')],currency=calc.querySelector('[data-quote-currency]'),outputs=[...calc.querySelectorAll('[data-quote-output]')],error=calc.querySelector('[data-quote-error]'),state=calc.querySelector('[data-quote-state]');let example=false;
    const update=()=>{
      const values=Object.fromEntries(inputs.map(i=>[i.dataset.quoteInput,i.valueAsNumber])),incomplete=inputs.some(i=>i.value.trim()==='');
      const invalid=inputs.filter(i=>i.validity.badInput||(i.value.trim()!==''&&(!i.validity.valid||!Number.isFinite(i.valueAsNumber))));
      if(Number.isFinite(values.bHeld)&&Number.isFinite(values.bBookings)&&values.bHeld>values.bBookings)invalid.push(...inputs.filter(i=>['bHeld','bBookings'].includes(i.dataset.quoteInput)));
      const valid=!incomplete&&!invalid.length&&validate(values),unsafe=!incomplete&&!invalid.length&&!valid;
      inputs.forEach(i=>i.setAttribute('aria-invalid',String(invalid.includes(i)||unsafe)));error.hidden=!invalid.length&&!unsafe;
      state.textContent=valid?(example?calc.dataset.quoteExample:calc.dataset.quoteReady):calc.dataset.quoteEmpty;
      const result=valid?calculate(values):{},unit=['USD','EUR','GBP'].includes(currency.value)?currency.value:'USD',money=new Intl.NumberFormat(locale,{style:'currency',currency:unit,maximumFractionDigits:2});
      outputs.forEach(o=>{const n=result[o.dataset.quoteOutput];o.textContent=valid&&n===null?calc.dataset.quoteUndefined:!Number.isFinite(n)?'—':money.format(n);});
    };
    inputs.forEach(i=>i.addEventListener('input',()=>{example=false;update();}));currency.addEventListener('change',update);
    calc.querySelector('[data-quote-load]').addEventListener('click',()=>{inputs.forEach(i=>{i.value=i.dataset.quoteExampleValue;});currency.value='USD';example=true;update();});
    calc.querySelector('[data-quote-clear]').addEventListener('click',()=>{inputs.forEach(i=>{i.value='';});example=false;update();});update();
  });
})();
