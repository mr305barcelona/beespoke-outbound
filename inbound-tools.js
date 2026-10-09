/* Local-only calculators: no network calls, storage or input-value analytics. */
(() => {
  'use strict';
  const locale = {en:'en-US',es:'es-ES',ca:'ca-ES',fr:'fr-FR'}[document.documentElement.lang] || 'en-US';
  const money = new Intl.NumberFormat(locale, {style:'currency',currency:'USD',maximumFractionDigits:2});
  const ratio = new Intl.NumberFormat(locale, {maximumFractionDigits:2});
  document.querySelectorAll('[data-inbound-calc]').forEach(calc => {
    const inputs = [...calc.querySelectorAll('input[data-input]')];
    const outputs = [...calc.querySelectorAll('[data-output]')];
    const update = () => {
      const values = Object.fromEntries(inputs.map(input => [input.dataset.input,input.valueAsNumber]));
      let valid = inputs.every(input => input.value.trim() !== '' && input.validity.valid && Number.isFinite(input.valueAsNumber));
      if (calc.dataset.inboundCalc === 'acquisition') valid = valid && values.opportunities <= values.inquiries && values.customers <= values.opportunities;
      calc.querySelector('[data-error]').hidden = valid;
      inputs.forEach(input => input.setAttribute('aria-invalid', String(!valid)));
      if (!valid) { outputs.forEach(output => { output.textContent = '—'; }); return; }
      let result;
      if (calc.dataset.inboundCalc === 'fees') {
        const percentFee = Math.max(values.spend * values.percent / 100, values.minimum);
        result = [values.spend + values.fixed + values.setup, values.spend + percentFee + values.setup, values.spend + values.fixed, values.spend + percentFee];
      } else if (calc.dataset.inboundCalc === 'scope') {
        const fee = values.hours * 99;
        result = [fee, fee + values.tools + values.implementation];
      } else {
        const total = values.media + values.management + values.other;
        result = [total, values.opportunities ? total / values.opportunities : null, values.customers ? total / values.customers : null, total ? values.customers * values.profit / total : null];
      }
      outputs.forEach((output,i) => { output.textContent = result[i] === null || !Number.isFinite(result[i]) ? '—' : calc.dataset.inboundCalc === 'acquisition' && i === 3 ? ratio.format(result[i]) + '×' : money.format(result[i]); });
    };
    inputs.forEach(input => input.addEventListener('input',update));
    update();
  });
})();
