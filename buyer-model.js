(function(root){'use strict';
function compare(values){
 const keys=['agencySetup','agencyMonthly','agencyTools','agencyOwner','internalHire','internalMonthly','internalTools','internalOwner'];
 if(keys.some(k=>String(values[k]??'').trim()===''))return {error:'unknown'};
 const v=Object.fromEntries(keys.map(k=>[k,Number(values[k])]));
 if(keys.some(k=>!Number.isFinite(v[k])||v[k]<0||v[k]>1e9))return {error:'invalid'};
 const a=v.agencyMonthly+v.agencyTools+v.agencyOwner,b=v.internalMonthly+v.internalTools+v.internalOwner;
 return {rows:[3,6,12].map(months=>({months,agency:v.agencySetup+months*a,internal:v.internalHire+months*b})),monthly:{agency:a,internal:b}};
}
if(typeof module==='object'&&module.exports)module.exports={compare};
if(!root.document)return;
for(const form of root.document.querySelectorAll('[data-buyer-model]')){
 const output=form.querySelector('[data-model-output]'),status=form.querySelector('[data-model-status]');
 const reset=()=>{output.hidden=true;output.replaceChildren();status.textContent='Enter your own comparable quotes and costs. A blank is unknown; enter 0 only when the cost is genuinely zero.';};
 form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries([...form.querySelectorAll('[data-model-input]')].map(n=>[n.name,n.value])),result=compare(data);if(result.error){reset();status.textContent=result.error==='unknown'?'Complete every cost field. Unknown inputs cannot be treated as zero.':'Use finite, non-negative costs no greater than 1,000,000,000 in one currency.';return;}
 const currency=form.querySelector('[name=currency]').value,fmt=n=>new Intl.NumberFormat('en',{style:'currency',currency,maximumFractionDigits:2}).format(n),table=root.document.createElement('table');
 const caption=root.document.createElement('caption');caption.textContent='Your input-based cost comparison — no revenue or meeting forecast';table.append(caption);
 const head=root.document.createElement('thead'),hr=root.document.createElement('tr');for(const text of ['Same period','Managed campaign total','Internal operation total']){const th=root.document.createElement('th');th.scope='col';th.textContent=text;hr.append(th);}head.append(hr);table.append(head);
 const body=root.document.createElement('tbody');for(const row of result.rows){const tr=root.document.createElement('tr');for(const text of [row.months+' months',fmt(row.agency),fmt(row.internal)]){const td=root.document.createElement('td');td.textContent=text;tr.append(td);}body.append(tr);}table.append(body);output.replaceChildren(table);output.hidden=false;status.textContent='Calculated from your inputs only. Equal time periods do not imply equal capacity, quality, ramp speed or results. Review the scope worksheet below.';});
 form.addEventListener('reset',()=>{root.setTimeout(reset,0);});form.addEventListener('input',()=>{output.hidden=true;status.textContent='Inputs changed. Calculate again to update the comparison.';});
}
})(typeof window==='object'?window:globalThis);
