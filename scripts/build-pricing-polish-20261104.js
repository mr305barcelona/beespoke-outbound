const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const copy=require('../data/pricing-polish-20261104.json');
const root=path.join(__dirname,'..');
const titles={
 en:['Six invoice records under one fictional agreement','A meeting is billable in this example when it takes place, matches the written company and buyer-role criteria, and is neither already billed nor covered by the duplicate rule. Pending records stay off the invoice until reviewed.','Open the quote worksheet'],
 es:['Seis líneas de factura con un mismo contrato ficticio','En este ejemplo, la reunión es facturable si se celebra, cumple los criterios escritos de empresa y función, no se ha facturado antes y no es un duplicado según el contrato. Los casos pendientes quedan fuera hasta que se revisen.','Abrir la ficha de presupuestos'],
 ca:['Sis línies de factura amb un mateix contracte fictici','En aquest exemple, la reunió és facturable si se celebra, compleix els criteris escrits d’empresa i de funció, no s’ha facturat abans i no és un duplicat segons el contracte. Els casos pendents queden fora fins que es revisen.','Obre la fitxa de pressupostos'],
 fr:['Six lignes de facture pour un même contrat fictif','Dans cet exemple, un rendez-vous est facturable s’il a eu lieu, respecte les critères écrits d’entreprise et de fonction, n’a pas déjà été facturé et n’entre pas dans la règle sur les doublons. Les cas en attente restent hors facture jusqu’à leur examen.','Ouvrir la grille de comparaison']
};
const specs={sdr:'outsourced-sdr-cost',meeting:'pay-per-meeting-lead-generation',cold:'cold-email-agency-pricing'};
const style=`
/* Scoped to the three pricing guides. Existing page templates are unchanged. */
body.journal-article .article-grid article .buyer-example {scroll-margin-top: calc(var(--header) + 24px); padding: clamp(.75rem, 3.3vw, 2rem); border: 1px solid #dbe2e7; border-radius: .85rem; background: #f8fafb; color: #203145; margin-block: 1.8rem; overflow-wrap: anywhere;}
body .buyer-example h2,body .buyer-example h3,body .buyer-example strong {color:#192d43}
body .buyer-example p,body .buyer-example label,body .buyer-example li {color:inherit}
body .buyer-example h2 {font-family:inherit; font-size:clamp(1.45rem,3.6vw,2.05rem); font-weight:750; letter-spacing:-.025em; margin:.2rem 0 .7rem}
body .buyer-example h3 {font-family:inherit; font-size:1.12rem; font-weight:750; letter-spacing:-.01em; margin:1.35rem 0 .45rem}
body .buyer-example .buyer-kicker {font-size:.83rem; color:#39546d; margin:0; font-weight:650; text-transform:none; letter-spacing:0}
body .buyer-example .buyer-metrics {display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.6rem; margin:1rem 0; padding:0}
body .buyer-example .buyer-metrics div {display:flex; flex-direction:column; justify-content:space-between; gap:.2rem; padding:.65rem .7rem; border:1px solid #dbe2e7; border-radius:.5rem; background:#fff}
body .buyer-example .buyer-metrics dt {font-size:.85rem; line-height:1.35; margin:0}
body .buyer-example .buyer-metrics dd {margin:0; font-size:1.18rem; font-weight:750; font-variant-numeric:tabular-nums}
body .buyer-example .buyer-decision {margin:1.35rem 0 .85rem; padding:.85rem 1rem; border-inline-start:3px solid #426783; background:#eaf1f5; border-radius:0 .45rem .45rem 0}
body .buyer-example .buyer-cases {list-style:none; margin:1rem 0; padding:0; display:grid; gap:.55rem}
body .buyer-example .buyer-cases li {display:grid; grid-template-columns:3.1rem minmax(0,1fr); gap:.15rem .6rem; margin:0; padding:.7rem .8rem; background:#fff; border:1px solid #dbe2e7; border-radius:.5rem}
body .buyer-example .buyer-case-id {font-weight:750; font-variant-numeric:tabular-nums}
body .buyer-example .buyer-case-copy {min-width:0;grid-column:2; grid-row:1 / span 2}
body .buyer-example .buyer-status {grid-column:1/-1; width:fit-content; margin:.25rem 0 0; font-size:.85rem; line-height:1.35}
body .buyer-example .buyer-status[data-state=exclude] {color:#6d2930}
body .buyer-example .buyer-status[data-state=pending] {color:#654600}
body .buyer-example .buyer-status[data-state=bill] {color:#194d39}
body .buyer-example .buyer-case-decision {font-size:.91rem; display:block; margin:.2rem 0 0}
body .buyer-example .buyer-assets {display:grid; gap:.55rem; margin:0; padding:0; list-style:none}
body .buyer-example .buyer-assets li {background:#fff; border:1px solid #dbe2e7; border-radius:.5rem; padding:.75rem; margin:0}
body .buyer-example .buyer-assets dl {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem;margin:.35rem 0 0}
body .buyer-example .buyer-assets dt {font-weight:650; margin:0; font-size:.8rem}
body .buyer-example .buyer-assets dd {margin:.15rem 0 0; line-height:1.45; font-size:.91rem}
body .buyer-example .buyer-record {display:grid; gap:.45rem; margin:1.1rem 0 0}
body .buyer-example .buyer-record label {font-weight:750}
body .buyer-example textarea {box-sizing:border-box;width:100%;max-width:100%;resize:vertical;font:inherit;font-size:.9rem;line-height:1.5;color:#203145;background:#fff;border:1px solid #8194a7;border-radius:.45rem;padding:.6rem}
body .buyer-example :is(a,textarea):focus-visible {outline:3px solid #356786;outline-offset:3px}
body .buyer-example .buyer-worksheet {display:inline-block;color:#225474;text-decoration:underline;text-underline-offset:2px}
body .buyer-required {border-inline-start:3px solid #426783;padding-inline-start:.7rem;font-size:.95em}
@media(max-width:460px){body .buyer-example .buyer-assets dl{grid-template-columns:1fr}body .buyer-example .buyer-metrics{gap:.3rem}body .buyer-example .buyer-metrics div{padding:.45rem .3rem}body .buyer-example .buyer-metrics dt{font-size:.76rem}}
@media print{body .buyer-example{background:#fff;color:#192d43;break-inside:auto}body .buyer-example :is(li,.buyer-metrics){break-inside:avoid}}
`;
const tableStyle=`
body .buyer-example table tbody th[scope=row] {
  min-inline-size: 7.5rem;
  overflow-wrap: normal;
  hyphens: auto;
}
`;
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraph=(s,cls)=>'<p'+(cls?' class="'+cls+'"':'')+'>'+esc(s)+'</p>';
const block=([head,p])=>'<h3>'+esc(head)+'</h3>'+paragraph(p);
const requireReplace=(s,re,rep,label)=>{assert(re.test(s),label||String(re));return s.replace(re,rep);};
const section=(h,id,callback)=>requireReplace(h,new RegExp('(<section\\b[^>]*id="'+id+'"[^>]*>)([\\s\\S]*?)(<\\/section>)'),(_,a,b,c)=>a+callback(b)+c,id);
function run(h,kind,lang){
 const doc=copy[lang][kind],ui=copy[lang].ui,text=titles[lang];
 let html=h;
 if(kind==='sdr'){
  html=section(html,'a-fair-comparison-with-beespoke',s=>requireReplace(s,/<p>[^<]*LinkedIn[^<]*<\/p>/,()=>paragraph(doc.scope),'old LinkedIn-only offer'));
  html=section(html,'published-2026-cost-ranges',s=>requireReplace(s,/(<\/h2>)(\s*<p>[^<]*<\/p>)/,(_,head)=>head+paragraph(doc.evidence)));
 }
 if(kind==='meeting'){
  html=section(html,'meeting-contract-audit',s=>s+paragraph(doc.checklist,'buyer-required'));
 }
 if(kind==='cold')html=section(html,'sources',s=>requireReplace(s,/<\/h2>/,m=>m+paragraph(doc.evidence)));
 html=section(html,'worked-quote-review',raw=>{
  const cut=raw.indexOf('</h2>')+5;assert(cut>4);
  let body=raw.slice(cut);
  let start=raw.slice(0,cut);
  if(kind==='meeting'){
   const table=body.match(/<div class="table-wrap"[^>]*><table>[\s\S]*?<\/table><\/div>/);
   assert(table);
   const rows=[...table[0].matchAll(/<tr><th scope="row">(.*?)<\/th><td>(.*?)<\/td><td>(.*?)<\/td><\/tr>/gs)].map(m=>m.slice(1,4));
   assert.deepEqual(rows.map(x=>x[0]),['M01','M02','M03','M04','M05']);
   rows.push(['M06',esc(doc.duplicate),esc(doc.duplicateDecision)]);
   const records='<ol class="buyer-cases" aria-label="'+esc(text[0])+'">'+rows.map(([id,fact,decision],i)=>'<li><span class="buyer-case-id">'+id+'</span><span class="buyer-case-copy">'+fact+'<span class="buyer-case-decision">'+decision+'</span></span><strong class="buyer-status" data-state="'+['bill','bill','exclude','exclude','pending','exclude'][i]+'">'+esc(doc.status[i])+'</strong></li>').join('')+'</ol>';
   body=requireReplace(body,/<p>[^<]*<\/p>/,()=>paragraph(text[1]));
   body=body.replace(table[0],records);
   body=requireReplace(body,/(<\/ol>)\s*<p>[^<]*<\/p>/,(_,ol)=>ol);
   body=requireReplace(body,/<p>[^<]*<\/p>\s*$/,()=>block(doc.pending));
  }
  if(kind==='sdr'){
   body+=block(doc.invoice)+block(doc.question);
  }
  if(kind==='cold'){
   const [label,,payer,admin,check,rows]=doc.ownership;
   const ownership='<h3>'+esc(label)+'</h3><ul class="buyer-assets">'+rows.map(([name,...values])=>'<li><strong>'+esc(name)+'</strong><dl>'+[payer,admin,check].map((key,i)=>'<div><dt>'+esc(key)+'</dt><dd>'+esc(values[i])+'</dd></div>').join('')+'</dl></li>').join('')+'</ul>';
   body+=block(doc.invoice)+ownership+block(doc.replacement);
  }
  const values=doc.counts||['100','90','10'];
  const metrics='<dl class="buyer-metrics">'+doc.metrics.map((k,i)=>'<div><dt>'+esc(k)+'</dt><dd>'+values[i]+'</dd></div>').join('')+'</dl>';
  const decision='<p class="buyer-decision"><strong>'+esc(ui[2])+'.</strong> '+esc(doc.decision)+'</p>';
  const worksheet=kind==='cold'?'<p><a class="buyer-worksheet" href="#cold-email-quote-normalizer">'+esc(text[2])+'</a></p>':'';
  const record='<div class="buyer-record"><label for="buyer-review-record">'+esc(ui[3])+'</label><textarea id="buyer-review-record" rows="6" readonly spellcheck="false">'+esc(doc.record)+'</textarea></div>';
  return paragraph(ui[0]+' · '+ui[5],'buyer-kicker')+start+metrics+body+decision+worksheet+record;
 });
 html=requireReplace(html,/<section id="worked-quote-review" tabindex="-1">/,()=>'<section id="worked-quote-review" class="buyer-example" tabindex="-1">');
 html=requireReplace(html,/<div class="hero-actions"[^>]*>/,m=>m+'<a class="secondary" href="#worked-quote-review">'+esc(ui[1])+'</a>');
 html=requireReplace(html,/"dateModified":"2026-11-04T16:44:23\+01:00"/,()=>'"dateModified":"2026-11-04T17:54:00+01:00"','prior article revision');
 html=requireReplace(html,/<\/head>/,m=>'<style id="pricing-polish">'+style+(kind==='meeting'?'':tableStyle)+'</style>'+m);
 return html;
}
for(const [lang] of Object.entries(copy)){
 for(const [kind,slug] of Object.entries(specs)){
  const file=path.join(root,lang==='en'?'':lang,'guides',slug,'index.html');
  fs.writeFileSync(file,run(fs.readFileSync(file,'utf8'),kind,lang));
 }
}
console.log('Applied complete pricing guide refinements to twelve localized pages.');
