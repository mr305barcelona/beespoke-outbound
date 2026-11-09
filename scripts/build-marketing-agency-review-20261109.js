'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=require('../data/marketing-agency-review-20261109.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=xs=>(xs||[]).map(s=>'<p>'+esc(s)+'</p>').join('');
const list=(xs,tag)=>(xs||[]).length?'<'+tag+'>'+xs.map(s=>'<li>'+esc(s)+'</li>').join('')+'</'+tag+'>':'';
const definition=xs=>'<dl class="ma-definitions">'+xs.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>';
const refs=[["LeadsBridge", "leadsbridge.com/blog/lead-generation-for-digital-marketing-agencies/"], ["Saleshandy", "saleshandy.com/blog/lead-generation-for-agencies/"], ["Driftrock", "driftrock.com/blog/lead-generation-for-agencies"], ["Salesflare", "blog.salesflare.com/lead-gen-for-agency"], ["Belkins", "belkins.io/industries/agencies"], ["GigRadar", "gigradar.io/blog/digital-marketing-agency-lead-generation"], ["Involve.me", "involve.me/blog/lead-generation-for-marketing-agencies-7-ideas-and-templates"], ["Enginy", "enginy.ai/blog/generate-marketing-agency-leads"]];
const style=`
body.ma-review .ma-anchor{display:block;scroll-margin-top:calc(var(--header) + 24px)}
body.ma-review .article-grid article section{scroll-margin-top:calc(var(--header) + 24px)}
body.ma-review .ma-note{padding:1rem 1.2rem;border-inline-start:3px solid #5a7483;background:#eef3f5;color:#14212b;margin:1.1rem 0}
body.ma-review .ma-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin:1rem 0}
body.ma-review .ma-cards>div{min-width:0;padding:1rem;border:1px solid #cbd6dc;border-radius:.35rem;background:#f6f9fa;color:#14212b}
body.ma-review .article-grid article h3{font:600 1.05rem/1.5 Arial,Helvetica,sans-serif;color:#14212b;letter-spacing:normal;margin:1.2rem 0 .5rem;text-transform:none}
body.ma-review .ma-cards h3{margin-top:0}
body.ma-review .ma-cards p:last-child{margin-bottom:0}
body.ma-review .ma-table{max-width:100%;margin:1.2rem 0;overflow:auto}
body.ma-review .ma-table table{width:100%;min-width:0;table-layout:fixed}
body.ma-review .ma-table :is(th,td){overflow-wrap:break-word;vertical-align:top}
body.ma-review .ma-table th:first-child{width:24%}
body.ma-review .ma-definitions{display:grid;gap:1rem;margin:1.2rem 0}
body.ma-review .ma-definitions>div{padding-bottom:.8rem;border-bottom:1px solid #d4dde1;min-width:0}
body.ma-review .ma-definitions dt{font-weight:600;color:#14212b}
body.ma-review .ma-definitions dd{margin:.35rem 0 0}
body.ma-review blockquote{font:inherit;background:#f6f9fa;color:#14212b;border-inline-start:3px solid #5a7483;margin:1.2rem 0;padding:1rem 1.2rem}
body.ma-review .ma-optional{padding:1rem;border:1px solid #bac8cf;border-radius:.35rem;background:#fff;color:#14212b}
body.ma-review .ma-optional summary,body.ma-review #frequently-asked-questions summary{font:600 1rem/1.5 Arial,Helvetica,sans-serif;cursor:pointer;min-height:44px;display:list-item;align-content:center;padding:.4rem .2rem;color:#14212b}
body.ma-review .ma-optional[open]>summary{margin-bottom:1rem}
body.ma-review #frequently-asked-questions details{border-bottom:1px solid #d4dde1;padding:.5rem 0}
body.ma-review .ma-download{display:inline-flex;align-items:center;min-height:44px;color:#14212b;background:#fff;border:1px solid #748895;padding:.5rem .85rem;border-radius:3px;text-decoration:underline;text-underline-offset:3px;font:500 1rem/1.45 Arial,Helvetica,sans-serif}
body.ma-review :is(summary,.ma-download):focus-visible{outline:3px solid #356781;outline-offset:3px}
body.ma-review .ma-source{overflow-wrap:anywhere}
@media(max-width:600px){body.ma-review .ma-cards{grid-template-columns:1fr}body.ma-review .ma-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}body.ma-review .ma-table :is(table,tbody,tr,td){display:block;width:100%;box-sizing:border-box}body.ma-review .ma-table tr{margin:0 0 1rem;border:1px solid #cbd6dc;border-radius:.3rem}body.ma-review .ma-table td{border:0;padding:.75rem;max-width:100%;overflow-wrap:anywhere}body.ma-review .ma-table td+td{border-top:1px solid #e0e7ea}body.ma-review .ma-table td:before{content:attr(data-label);display:block;font-size:.85rem;font-weight:600;color:#405363;margin-bottom:.25rem}body.ma-review .ma-table td:first-child{font-weight:600;background:#eef3f5}}

body.ma-review .ma-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin:1rem 0}
body.ma-review .ma-field{display:block;min-width:0;color:#14212b;font:500 1rem/1.5 Arial,Helvetica,sans-serif}
body.ma-review .ma-field span{display:block;margin-bottom:.4rem;min-height:3em}
body.ma-review .ma-field input{display:block;width:100%;min-width:0;box-sizing:border-box;min-height:44px;border:1px solid #748895;border-radius:3px;padding:.5rem;color:#14212b;background:#fff;font:inherit}
body.ma-review .ma-checkline{display:flex;align-items:flex-start;gap:.6rem;min-height:44px;padding:.5rem 0;color:#14212b;font:400 1rem/1.5 Arial,Helvetica,sans-serif}
body.ma-review .ma-checkline input{flex:0 0 20px;width:20px;height:20px;margin:.15rem 0 0;accent-color:#14212b}
body.ma-review .ma-cost-actions{display:flex;flex-wrap:wrap;gap:.6rem;margin:1rem 0}
body.ma-review .ma-cost-actions button{min-height:44px;max-width:100%;border:1px solid #748895;border-radius:3px;padding:.5rem .85rem;color:#14212b;background:#fff;font:500 1rem/1.45 Arial,Helvetica,sans-serif;cursor:pointer}
body.ma-review #ma-cost-calculate{background:#14212b;color:#fff;border-color:#14212b}
body.ma-review .ma-cost-output:not([hidden]){display:block;white-space:pre-line;overflow-wrap:anywhere;padding:1rem;background:#eef3f5;color:#14212b;line-height:1.7}
body.ma-review :is(input,button):focus-visible{outline:3px solid #356781;outline-offset:3px}
body.ma-review input[aria-invalid=true]{border:2px solid #8b2c27}
@media(max-width:600px){body.ma-review .ma-fields{grid-template-columns:1fr}body.ma-review .ma-field span{min-height:0}}

@media print{body.ma-review .ma-cards{display:block}body.ma-review .ma-cards>div{break-inside:avoid}body.ma-review .ma-download{display:none}}
`;
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=data[lang],prefix=lang==='en'?'':'/'+lang,route=prefix+'/industries/marketing-agency-lead-generation/',file=path.join(root,route.slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 assert(!h.includes('id="marketing-agency-review"'));
 if(c.headerH1){h=h.replace(/<h1[^>]*>[\s\S]*?<\/h1>/,'<h1>'+esc(c.headerH1)+'</h1>');}
 if(c.headerEyebrow){const old='Comparaison des fournisseurs sortants';assert.equal(h.split(old).length-1,2);h=h.split(old).join(esc(c.headerEyebrow));}
 const oldAnswer=h.match(/<p class="answer">[\s\S]*?<\/p>/);assert(oldAnswer,'answer');
 h=h.replace(oldAnswer[0],'<p class="answer">'+esc(c.answer)+'</p>');
 const ctas=[...h.matchAll(/<aside class="inline-cta">[\s\S]*?<\/aside>/g)].map(m=>m[0]);assert.equal(ctas.length,2);
 function render(s){
  let out='<section'+(s.id==='agency-wedge-test'?' class="original-tool"':s.id==='buyer-decision-guide'?' class="competitive-depth"':'')+' id="'+s.id+'">'+(s.aliases||[]).map(id=>'<span class="ma-anchor" id="'+id+'" aria-hidden="true"></span>').join('')+'<h2>'+esc(s.title)+'</h2>'+(s.case?'<div class="ma-note"><h3>'+esc(s.case[0])+'</h3>'+paras([s.case[1]])+'</div>':'')+paras(s.p);
  if(s.id==='choose-a-client-situation-not-a-list-of-services')out+='<p class="ma-note">'+esc(c.fiction)+'</p>';
  if(s.rows)out+='<div class="ma-table" role="region" aria-labelledby="'+s.id+'-caption" tabindex="0"><table role="table"><caption id="'+s.id+'-caption">'+esc(s.caption||s.title)+'</caption><thead><tr>'+s.headers.map((x,i)=>'<th scope="col" id="'+s.id+'-h'+i+'">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+s.rows.map(row=>'<tr>'+row.map((x,i)=>'<td headers="'+s.id+'-h'+i+'" data-label="'+esc(s.headers[i])+'">'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  out+=list(s.ul,'ul')+list(s.ol,'ol');
  if(s.dl)out+=definition(s.dl);
  if(s.cards)out+='<div class="ma-cards">'+s.cards.map(([a,b])=>'<div><h3>'+esc(a)+'</h3>'+paras([b])+'</div>').join('')+'</div>';
  if(s.samples)out+=s.samples.map(([title,message,reason])=>'<div class="ma-sample"><h3>'+esc(title)+'</h3><blockquote>'+paras(message.split('\n\n'))+'</blockquote>'+paras([reason])+'</div>').join('');
  if(s.quotes)out+=s.quotes.map(x=>'<blockquote>'+paras([x])+'</blockquote>').join('');
  out+=paras(s.after);
  if(s.links)out+='<div class="text-links">'+s.links.map(([url,label])=>'<a href="'+prefix+url+'">'+esc(label)+' →</a>').join('')+'</div>';

  if(s.cost){const t=c.cost;out+='<details class="ma-optional" id="ma-cost-check"><summary>'+esc(t.title)+'</summary><p id="ma-cost-note">'+esc(t.note)+'</p><div class="ma-fields">'+t.labels.map((label,i)=>'<label class="ma-field" for="ma-cost-'+i+'"><span>'+esc(label)+'</span><input id="ma-cost-'+i+'" type="number" min="0" step="'+(i===0?'any':'1')+'" inputmode="decimal" aria-describedby="ma-cost-note"></label>').join('')+'</div><label class="ma-checkline" for="ma-cost-complete"><input type="checkbox" id="ma-cost-complete"><span>'+esc(t.complete)+'</span></label><div class="ma-cost-actions"><button type="button" id="ma-cost-calculate">'+esc(t.calculate)+'</button><button type="button" id="ma-cost-reset">'+esc(t.reset)+'</button></div><output class="ma-cost-output" id="ma-cost-result" role="status" aria-live="polite" hidden></output></details>';}
  if(s.questions){
   const csv='\ufeff'+s.questions.map(row=>row.map(x=>'"'+x.replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';
   out+='<details class="ma-optional" id="ma-questions"><summary>'+esc(s.downloadTitle)+'</summary>'+paras([s.downloadNote])+definition(s.questions)+'<a class="ma-download" download="beespoke-agency-campaign-brief-'+lang+'.csv" href="data:text/csv;charset=utf-8,'+encodeURIComponent(csv)+'">'+esc(s.downloadLabel)+'</a></details>';
  }
  if(s.faqs)out+=s.faqs.map(([q,a])=>'<details><summary>'+esc(q)+'</summary>'+paras([a])+'</details>').join('');
  return out+'</section>';
 }
 let body=c.sections.map(s=>render(s)+(s.id==='research-change-signals-carefully'?ctas[0]:s.id==='show-work-in-the-buyer-s-context'?ctas[1]:'')).join('');
 body+='<section id="sources"><h2>'+esc(c.sourceTitle)+'</h2>'+paras([c.sourceNote])+'<ul>'+refs.map(([name,url])=>'<li class="ma-source">'+esc(name+' — '+url)+'</li>').join('')+'</ul><a href="'+prefix+'/editorial-policy/">'+esc({en:'Editorial policy',es:'Política editorial',ca:'Política editorial',fr:'Politique éditoriale'}[lang])+' →</a></section>';
 let n=0;h=h.replace(/(<article>)[\s\S]*?(<\/article>)/,(_,a,z)=>{n++;return a+body+z;});assert.equal(n,1);
 const nav=c.sections.map(s=>'<a href="#'+s.id+'">'+esc(s.title)+'</a>').join('')+'<a href="#sources">'+esc(c.sourceTitle)+'</a>';
 h=h.replace(/(<aside class="toc">[\s\S]*?<\/div>)[\s\S]*?(<div class="toc-progress">)/,(_,a,z)=>a+nav+z);
 h=h.replace(/(<details class="mobile-toc"[\s\S]*?<nav[^>]*>)[\s\S]*?(<\/nav>)/,(_,a,z)=>a+nav+z);
 h=h.replace(/<div class="hero-actions">/,'<div class="hero-actions"><a class="secondary" href="#ma-worked-segments">'+esc(c.jump)+'</a>');
 const updated={en:'Updated ',es:'Actualizado el ',ca:'Actualitzat el ',fr:'Mis à jour le '}[lang];
 h=h.replace(/(<p class="meta">[\s\S]*?· )[^<]+(<\/p>)/,(_,a,z)=>a+updated+c.dateLabel+z);
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,j,z)=>{const g=JSON.parse(j);g['@graph'].find(n=>n['@type']==='Article').dateModified=data.revision;if(c.headerH1){g['@graph'].find(n=>n['@type']==='Article').name=c.headerH1;g['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement[1].name=c.headerH1;}g['@graph']=g['@graph'].filter(n=>n['@type']!=='FAQPage');g['@graph'].push({'@type':'FAQPage','@id':'https://outbound-lead-generation.com'+route+'#faq',mainEntity:c.sections.find(s=>s.faqs).faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});return a+JSON.stringify(g).replace(/</g,'\\u003c')+z;});
 h=h.replace('class="journal-article"','class="journal-article ma-review"').replace('</head>','<style id="marketing-agency-review">'+style+'</style></head>');

 const costScript='(function(){"use strict";const t='+JSON.stringify(c.cost).replace(/</g,'\\u003c')+',lang='+JSON.stringify(lang)+';const f=[0,1,2].map(i=>document.getElementById("ma-cost-"+i)),check=document.getElementById("ma-cost-complete"),out=document.getElementById("ma-cost-result");function show(text,bad){out.hidden=false;out.textContent=text;if(bad){bad.setAttribute("aria-invalid","true");bad.focus();}}document.getElementById("ma-cost-calculate").addEventListener("click",()=>{f.forEach(n=>n.removeAttribute("aria-invalid"));check.removeAttribute("aria-invalid");if(f[0].validity.badInput){show(t.invalidCost,f[0]);return;}const badInput=f.slice(1).find(n=>n.validity.badInput);if(badInput){show(t.invalidCount,badInput);return;}const v=f.map(n=>n.value.trim());if(v[0]===""){show(t.missingCost,f[0]);return;}const total=Number(v[0]);if(!Number.isFinite(total)||total<0){show(t.invalidCost,f[0]);return;}const counts=v.slice(1).map(s=>s===""?null:Number(s));const invalid=counts.findIndex(n=>n!==null&&(!Number.isFinite(n)||n<0||!Number.isSafeInteger(n)));if(invalid>=0){show(t.invalidCount,f[invalid+1]);return;}if(!check.checked){show(t.incomplete,check);return;}const number=new Intl.NumberFormat(lang,{maximumFractionDigits:2});const value=n=>n===null?t.unknown:n===0?t.zero:number.format(total/n)+" "+t.unit;show(t.callLabel+": "+value(counts[0])+"\\n\\n"+t.clientLabel+": "+value(counts[1])+"\\n\\n"+t.basis);});document.getElementById("ma-cost-reset").addEventListener("click",()=>{f.forEach(n=>{n.value="";n.removeAttribute("aria-invalid");});check.checked=false;check.removeAttribute("aria-invalid");out.hidden=true;out.textContent="";});})();';
 h=h.replace('</body>','<script id="marketing-agency-cost-check">'+costScript+'</script></body>');
 fs.writeFileSync(file,h);
 const re=new RegExp('(<loc>https://outbound-lead-generation.com'+route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</loc><lastmod>)[^<]+(</lastmod>)');assert(re.test(sitemap));sitemap=sitemap.replace(re,'$1'+data.date+'$2');
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Applied 22 reviewed marketing-agency client-acquisition improvements in four languages.');
