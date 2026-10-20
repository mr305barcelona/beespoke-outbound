(() => {
  'use strict';
  const key='beespoke-pricing-market-v1';
  const valid=market=>market==='europe'||market==='other';
  const suggested=()=>{
    try{
      const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
      return /^Europe\//.test(zone)||['Atlantic/Canary','Atlantic/Faroe','Atlantic/Madeira','Atlantic/Azores','Asia/Nicosia','Asia/Famagusta','Asia/Istanbul'].includes(zone)?'europe':'other';
    }catch{return 'other';}
  };
  let market=suggested();
  try{const saved=localStorage.getItem(key);if(valid(saved))market=saved;}catch{}
  const locale=['en','es','ca','fr'].includes(document.documentElement.lang)?document.documentElement.lang:'en';
  document.querySelectorAll('[data-commercial-locale]').forEach(block=>{block.hidden=block.dataset.commercialLocale!==locale;});
  function render(){
    const currency=market==='europe'?'EUR':'USD';
    document.querySelectorAll('[data-own-price]').forEach(node=>{
      const amount=Number(node.dataset.ownAmount);
      if(!Number.isFinite(amount)||amount<0)return;
      node.textContent=new Intl.NumberFormat(locale,{style:'currency',currency,currencyDisplay:'code',maximumFractionDigits:0}).format(amount);
    });
    document.querySelectorAll('[data-pricing-market]').forEach(select=>{select.value=market;select.disabled=false;});
  }
  document.querySelectorAll('[data-pricing-market]').forEach(select=>select.addEventListener('change',()=>{
    if(!valid(select.value))return;
    market=select.value;
    try{localStorage.setItem(key,market);}catch{}
    render();
  }));
  window.addEventListener('storage',event=>{if(event.key===key){market=valid(event.newValue)?event.newValue:suggested();render();}});
  render();
})();
