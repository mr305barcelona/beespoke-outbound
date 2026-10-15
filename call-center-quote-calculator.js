/* Local quote arithmetic only. No network, storage, form submission or input analytics. */
(() => {
  'use strict';
  const calculate = v => {
    const aTotal=v.aHours*v.aRate+v.aExtras+v.aInternal;
    const bTotal=v.bBookings*v.bRate+v.bExtras+v.bInternal;
    return {aTotal,bTotal,aUnit:v.aHeld>0?aTotal/v.aHeld:null,bUnit:v.bHeld>0?bTotal/v.bHeld:null};
  };
  const validate = v => Object.values(v).every(n=>Number.isFinite(n)&&n>=0)
    && ['aHeld','bBookings','bHeld'].every(k=>Number.isSafeInteger(v[k]))&&v.bHeld<=v.bBookings
    && Object.values(calculate(v)).every(n=>n===null||Number.isFinite(n));
  if(typeof module!=='undefined'&&module.exports)module.exports={calculate,validate};
  if(typeof document==='undefined')return;
  const locale={en:'en-US',es:'es-ES',ca:'ca-ES',fr:'fr-FR'}[document.documentElement.lang]||'en-US';
  document.querySelectorAll('[data-quote-model-calculator]').forEach(calc=>{
    const inputs=[...calc.querySelectorAll('[data-quote-input]')],currency=calc.querySelector('[data-quote-currency]');
    const outputs=[...calc.querySelectorAll('[data-quote-output]')],error=calc.querySelector('[data-quote-error]');
    const update=()=>{
      const values=Object.fromEntries(inputs.map(i=>[i.dataset.quoteInput,i.valueAsNumber]));
      const invalid=inputs.filter(i=>i.value.trim()===''||!i.validity.valid||!Number.isFinite(i.valueAsNumber));
      if(values.bHeld>values.bBookings)invalid.push(...inputs.filter(i=>['bHeld','bBookings'].includes(i.dataset.quoteInput)));
      inputs.forEach(i=>i.setAttribute('aria-invalid',String(invalid.includes(i))));
      const valid=!invalid.length&&validate(values);error.hidden=valid;
      const result=valid?calculate(values):{};
      const unit=['USD','EUR','GBP'].includes(currency.value)?currency.value:'USD';
      const money=new Intl.NumberFormat(locale,{style:'currency',currency:unit,maximumFractionDigits:2});
      outputs.forEach(o=>{const n=result[o.dataset.quoteOutput];o.textContent=n==null||!Number.isFinite(n)?'—':money.format(n);});
    };
    inputs.forEach(i=>i.addEventListener('input',update));currency.addEventListener('change',update);update();
  });
})();
