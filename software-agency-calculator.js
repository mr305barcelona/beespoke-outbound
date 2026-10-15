/* Local calculation only: no network, storage, form submission or input analytics. */
(() => {
  'use strict';
  const calculate = v => {
    const softwareTotal = 3 * (v.softwareTools + v.softwareHours * v.rate) + v.softwareSetup;
    const agencyTotal = 3 * (v.agencyFee + v.agencyExtras + v.agencyHours * v.rate) + v.agencySetup;
    const softwareUnit = v.softwareOpportunities > 0 ? softwareTotal / v.softwareOpportunities : null;
    const agencyUnit = v.agencyOpportunities > 0 ? agencyTotal / v.agencyOpportunities : null;
    const agencyMatch = softwareUnit > 0 ? Math.max(1, Math.ceil(agencyTotal / softwareUnit)) : null;
    return {softwareTotal, agencyTotal, softwareUnit, agencyUnit, agencyMatch};
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = {calculate};
  if (typeof document === 'undefined') return;
  const locale = {en:'en-US',es:'es-ES',ca:'ca-ES',fr:'fr-FR'}[document.documentElement.lang] || 'en-US';
  const money = new Intl.NumberFormat(locale, {style:'currency',currency:'USD',maximumFractionDigits:2});
  const count = new Intl.NumberFormat(locale, {maximumFractionDigits:0});
  document.querySelectorAll('[data-software-agency-calculator]').forEach(calc => {
    const inputs = [...calc.querySelectorAll('[data-comparison-input]')];
    const outputs = [...calc.querySelectorAll('[data-comparison-output]')];
    const update = () => {
      const invalid = inputs.filter(input => input.value.trim() === '' || !input.validity.valid || !Number.isFinite(input.valueAsNumber));
      inputs.forEach(input => input.setAttribute('aria-invalid', String(invalid.includes(input))));
      calc.querySelector('[data-comparison-error]').hidden = invalid.length === 0;
      const result = invalid.length ? {} : calculate(Object.fromEntries(inputs.map(input => [input.dataset.comparisonInput,input.valueAsNumber])));
      outputs.forEach(output => {
        const key = output.dataset.comparisonOutput;
        const value = result[key];
        output.textContent = value == null || !Number.isFinite(value) ? '—' : key === 'agencyMatch' ? count.format(value) : money.format(value);
      });
    };
    inputs.forEach(input => input.addEventListener('input',update));
    update();
  });
})();
