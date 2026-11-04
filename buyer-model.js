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
const messages = {
 es: {reset:'Introduce tus propios costes comparables. Un campo vacío queda pendiente.',unknown:'Completa todos los costes. Introduce 0 solo cuando el coste sea cero.',invalid:'Usa costes finitos, no negativos y de hasta 1.000.000.000 en una moneda.',caption:'Comparación de costes con tus datos',heads:['Periodo','Total gestionado','Total interno'],months:'meses',done:'Cálculo con tus datos. El mismo periodo no implica la misma capacidad ni resultados.',changed:'Los datos cambiaron. Calcula de nuevo.'},
 ca: {reset:'Introdueix els teus costos comparables. Un camp buit queda pendent.',unknown:'Completa tots els costos. Escriu 0 només quan el cost sigui zero.',invalid:'Fes servir costos finits, no negatius i de fins a 1.000.000.000 en una moneda.',caption:'Comparació de costos amb les teves dades',heads:['Període','Total gestionat','Total intern'],months:'mesos',done:'Càlcul amb les teves dades. El mateix període no implica la mateixa capacitat ni resultats.',changed:'Les dades han canviat. Calcula de nou.'},
 fr: {reset:'Saisissez vos coûts comparables. Un champ vide reste à confirmer.',unknown:'Renseignez tous les coûts. Saisissez 0 uniquement si le coût est nul.',invalid:'Utilisez des coûts finis, positifs ou nuls et inférieurs ou égaux à 1 000 000 000 dans une devise.',caption:'Comparaison des coûts selon vos données',heads:['Période','Total géré','Total interne'],months:'mois',done:'Calcul selon vos données. Une durée égale ne prouve ni capacité ni résultats équivalents.',changed:'Les données ont changé. Relancez le calcul.'}
};
const locale = root.document.documentElement.lang.split('-')[0];
const copy = messages[locale] || {};
for(const form of root.document.querySelectorAll('[data-buyer-model]')){
 const output=form.querySelector('[data-model-output]'),status=form.querySelector('[data-model-status]');
 const reset=()=>{output.hidden=true;output.replaceChildren();status.textContent=copy.reset||'Enter your own comparable quotes and costs. A blank is unknown; enter 0 only when the cost is genuinely zero.';};
 if(form.tagName==='FORM')form.addEventListener('submit',e=>e.preventDefault());
 const calculateButton=form.querySelector('[data-model-calculate]')||form.querySelector('button[type=submit]'),resetButton=form.querySelector('[data-model-reset]')||form.querySelector('button[type=reset]');
 if(!calculateButton||!resetButton)continue;calculateButton.type='button';resetButton.type='button';
 calculateButton.addEventListener('click',e=>{e.preventDefault();const data=Object.fromEntries([...form.querySelectorAll('[data-model-input]')].map(n=>[n.name,n.value])),result=compare(data);if(result.error){reset();status.textContent=result.error==='unknown'?(copy.unknown||'Complete every cost field. Unknown inputs cannot be treated as zero.'):(copy.invalid||'Use finite, non-negative costs no greater than 1,000,000,000 in one currency.');return;}
 const currency=form.querySelector('[name=currency]').value,fmt=n=>new Intl.NumberFormat(messages[locale]?locale:'en',{style:'currency',currency,maximumFractionDigits:2}).format(n),table=root.document.createElement('table');
 const caption=root.document.createElement('caption');caption.textContent=copy.caption||'Your input-based cost comparison — no revenue or meeting forecast';table.append(caption);
 const head=root.document.createElement('thead'),hr=root.document.createElement('tr');for(const text of (copy.heads||['Same period','Managed campaign total','Internal operation total'])){const th=root.document.createElement('th');th.scope='col';th.textContent=text;hr.append(th);}head.append(hr);table.append(head);
 const body=root.document.createElement('tbody');for(const row of result.rows){const tr=root.document.createElement('tr');for(const text of [row.months+' '+(copy.months||'months'),fmt(row.agency),fmt(row.internal)]){const td=root.document.createElement('td');td.textContent=text;tr.append(td);}body.append(tr);}table.append(body);output.replaceChildren(table);output.hidden=false;status.textContent=copy.done||'Calculated from your inputs only. Equal time periods do not imply equal capacity, quality, ramp speed or results. Review the scope worksheet below.';});
 resetButton.addEventListener('click',()=>{for(const input of form.querySelectorAll('[data-model-input]'))input.value='';form.querySelector('[name=currency]').value='USD';reset();});calculateButton.disabled=false;resetButton.disabled=false;form.addEventListener('input',()=>{output.hidden=true;status.textContent=copy.changed||'Inputs changed. Calculate again to update the comparison.';});
}
})(typeof window==='object'?window:globalThis);
