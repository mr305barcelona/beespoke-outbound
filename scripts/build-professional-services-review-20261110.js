'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=require('../data/professional-services-review-20261110.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=xs=>(xs||[]).map(s=>'<p>'+esc(s)+'</p>').join('');
const list=(xs,tag)=>(xs||[]).length?'<'+tag+'>'+xs.map(s=>'<li>'+esc(s)+'</li>').join('')+'</'+tag+'>':'';
const definition=xs=>'<dl class="ps-definitions">'+xs.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>';
const refs=[["Online Lead Generation Techniques for Professional Services Firms - Hinge Marketing", "hingemarketing.com/blog/story/top_10_online_lead_generation_techniques_for_professional_services"], ["How to generate leads for a professional service business? | Breakthrough Marketing Secrets", "www.breakthroughmarketingsecrets.com/blog/how-to-generate-leads-for-a-professional-service-business/"], ["How to Boost Lead Generation for Professional Services (9 Ways) - SalesBread | 1 B2B Lead Per Day", "salesbread.com/lead-generation-for-professional-services/"], ["Lead Generation Agencies for Service Businesses: 9 Options", "clicksgeek.com/best-lead-generation-agencies-for-service-business/"], ["Best Lead Generation Strategies For Service Business 2026", "clicksgeek.com/best-lead-generation-strategies-for-service-business/"], ["The 12 best strategies to generate consulting leads in 2026", "www.enginy.ai/blog/generate-consulting-lead"], ["The Ultimate Guide to Lead Generation for Consultants", "www.melisaliberman.com/blog/consulting-lead-generation-guide"], ["The most effective Lead Generation tools for Professional Services Firms", "www.linkedin.com/pulse/most-effective-lead-generation-tools-professional-tobie-van-der-merwe"], ["How to Improve Lead Generation for Professional Services | Walker Sands", "www.walkersands.com/article/how-to-improve-lead-generation-for-professional-services/"], ["Professional Services Lead Generation: The 2026 Guide for Firms That Sell Expertise (AU, NZ, UK) · Involve Digital", "www.involvedigital.com/guides/professional-services-lead-generation"], ["Lead Generation Guide for Professional Services Firms", "www.rattleback.com/insights/ebooks/professional-services-lead-generation-handbook/"], ["Where to Start With Lead Generation for Professional Services Firms | SCG", "www.schmidtconsulting.group/blog/professional-services-lead-generation/"], ["How to Generate Leads for Consulting Firms? Strategies & Tools | Apollo", "www.apollo.io/insights/how-to-generate-leads-for-consulting-firms"], ["Boost Professional Services Client Growth with HubSpot | HubSpot", "www.hubspot.com/increase-contacts-for-professional-services"], ["Lead Generation Systems for Professional Service Firms", "businessaccelerator.institute/blog/lead-generation-systems-for-professional-firms/"], ["Lead Generation for Professional Services | Purple Sales 2026", "mypurplesales.com/lead-generation-for-professional-services/"], ["15 Lead generation channels for business development | The BD School", "www.thebdschool.com/blog/lead-generation-channels"], ["Professional Services Lead Generation | Consulting Sales — JMS Elite", "jmselite.com/industries/professional-services-lead-generation"], ["Lead Generation for Professional Services Firms: Accountancy, Law, and Consultancy | Leadriver", "www.leadriver.io/blog/b2b-lead-generation-professional-services"], ["Lead Generation For Professional Services: 6-Step Guide", "clicksgeek.com/lead-generation-for-professional-services/"]];
const style=`
body.ps-review .ps-anchor{display:block;scroll-margin-top:calc(var(--header) + 24px)}
body.ps-review .article-grid article section{scroll-margin-top:calc(var(--header) + 24px)}
body.ps-review .ps-note{padding:1rem 1.2rem;border-inline-start:3px solid #5a7483;background:#eef3f5;color:#14212b;margin:1.1rem 0}
body.ps-review .ps-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin:1rem 0}
body.ps-review .ps-cards>div{min-width:0;padding:1rem;border:1px solid #cbd6dc;border-radius:.35rem;background:#f6f9fa;color:#14212b}
body.ps-review .article-grid article h3{font:600 1.05rem/1.5 Arial,Helvetica,sans-serif;color:#14212b;letter-spacing:normal;margin:1.2rem 0 .5rem;text-transform:none}
body.ps-review .ps-cards h3{margin-top:0}
body.ps-review .ps-cards p:last-child{margin-bottom:0}
body.ps-review .ps-table{max-width:100%;margin:1.2rem 0;overflow:auto}
body.ps-review .ps-table table{width:100%;min-width:0;table-layout:fixed}
body.ps-review .ps-table :is(th,td){overflow-wrap:break-word;vertical-align:top}
body.ps-review .ps-table th:first-child{width:24%}
body.ps-review .ps-table caption{font:600 .95rem/1.5 Arial,Helvetica,sans-serif;color:#405363;text-align:left;white-space:normal;padding:.6rem .75rem}
body.ps-review .ps-definitions{display:grid;gap:1rem;margin:1.2rem 0}
body.ps-review .ps-definitions>div{padding-bottom:.8rem;border-bottom:1px solid #d4dde1;min-width:0}
body.ps-review .ps-definitions dt{font-weight:600;color:#14212b}
body.ps-review .ps-definitions dd{margin:.35rem 0 0}
body.ps-review blockquote{font:inherit;background:#f6f9fa;color:#14212b;border-inline-start:3px solid #5a7483;margin:1.2rem 0;padding:1rem 1.2rem}
body.ps-review .ps-optional{padding:1rem;border:1px solid #bac8cf;border-radius:.35rem;background:#fff;color:#14212b}
body.ps-review .ps-optional summary,body.ps-review #frequently-asked-questions summary{font:600 1rem/1.5 Arial,Helvetica,sans-serif;cursor:pointer;min-height:44px;display:list-item;align-content:center;padding:.4rem .2rem;color:#14212b}
body.ps-review .ps-optional[open]>summary{margin-bottom:1rem}
body.ps-review #frequently-asked-questions details{border-bottom:1px solid #d4dde1;padding:.5rem 0}
body.ps-review .ps-download{display:inline-flex;align-items:center;min-height:44px;color:#14212b;background:#fff;border:1px solid #748895;padding:.5rem .85rem;border-radius:3px;text-decoration:underline;text-underline-offset:3px;font:500 1rem/1.45 Arial,Helvetica,sans-serif}
body.ps-review :is(summary,.ps-download):focus-visible{outline:3px solid #356781;outline-offset:3px}
body.ps-review .ps-source{overflow-wrap:anywhere}
@media(max-width:600px){body.ps-review .ps-table caption{display:block;width:100%;box-sizing:border-box}body.ps-review .ps-cards{grid-template-columns:1fr}body.ps-review .ps-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}body.ps-review .ps-table :is(table,tbody,tr,td){display:block;width:100%;box-sizing:border-box}body.ps-review .ps-table tr{margin:0 0 1rem;border:1px solid #cbd6dc;border-radius:.3rem}body.ps-review .ps-table td{border:0;padding:.75rem;max-width:100%;overflow-wrap:anywhere}body.ps-review .ps-table td+td{border-top:1px solid #e0e7ea}body.ps-review .ps-table td:before{content:attr(data-label);display:block;font-size:.85rem;font-weight:600;color:#405363;margin-bottom:.25rem}body.ps-review .ps-table td:first-child{font-weight:600;background:#eef3f5}}



body.ps-review #industry-fit-check{padding:0;background:transparent;border:0;box-shadow:none}
body.ps-review #industry-fit-check>h2{color:var(--ink,#14212b)}
body.ps-review #ps-readiness .check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem;margin:1rem 0}
body.ps-review #ps-readiness .check-grid label{display:flex;align-items:flex-start;gap:.65rem;min-width:0;min-height:44px;padding:.75rem;background:#f6f9fa;color:#14212b;border:1px solid #cbd6dc;border-radius:3px;font:400 1rem/1.55 Arial,Helvetica,sans-serif;letter-spacing:normal;text-transform:none}
body.ps-review #ps-readiness input[type=checkbox]{width:20px;height:20px;min-width:20px;min-height:20px;accent-color:#173d50;margin:.15rem 0 0}
body.ps-review #ps-readiness .tool-output{display:block;margin:1rem 0 0;padding:1rem;background:#eef3f5;color:#14212b;border:0;border-radius:3px;box-shadow:none}
body.ps-review #ps-readiness .tool-output :is(span,strong,p){color:#14212b;background:none;-webkit-text-fill-color:#14212b;letter-spacing:normal;text-transform:none}
body.ps-review #ps-readiness .tool-output strong{display:block;font:600 1.5rem/1.6 Arial,Helvetica,sans-serif}
@media(max-width:600px){body.ps-review #ps-readiness .check-grid{grid-template-columns:1fr}}

@media print{body.ps-review .ps-cards{display:block}body.ps-review .ps-cards>div{break-inside:avoid}body.ps-review .ps-download{display:none}}
`;
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=data[lang],prefix=lang==='en'?'':'/'+lang,route=prefix+'/industries/professional-services-lead-generation/',file=path.join(root,route.slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 assert(!h.includes('id="professional-services-review"'));
 h=h.replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*(">)/g,(_,a,z)=>a+esc(c.description)+z);

 if(c.headerH1){h=h.replace(/<h1[^>]*>[\s\S]*?<\/h1>/,'<h1>'+esc(c.headerH1)+'</h1>');}
 if(c.headerEyebrow){const old='Comparaison des fournisseurs sortants';assert.equal(h.split(old).length-1,2);h=h.split(old).join(esc(c.headerEyebrow));}
 if(c.eyebrow){const before=h.match(/<p class="eyebrow">([\s\S]*?)<\/p>/)[1];assert.equal(h.split(before).length-1,2);h=h.split(before).join(esc(c.eyebrow));}
 const oldAnswer=h.match(/<p class="answer">[\s\S]*?<\/p>/);assert(oldAnswer,'answer');
 h=h.replace(oldAnswer[0],'<p class="answer">'+esc(c.answer)+'</p>');
 const ctas=[...h.matchAll(/<aside class="inline-cta">[\s\S]*?<\/aside>/g)].map(m=>m[0]);assert.equal(ctas.length,2);
 function render(s){
  let out='<section'+(s.id==='industry-fit-check'?' class="original-tool checklist-tool"':s.id==='buyer-decision-guide'?' class="competitive-depth"':'')+' id="'+s.id+'">'+(s.aliases||[]).map(id=>'<span class="ps-anchor" id="'+id+'" aria-hidden="true"></span>').join('')+'<h2>'+esc(s.title)+'</h2>'+(s.case?'<div class="ps-note"><h3>'+esc(s.case[0])+'</h3>'+paras([s.case[1]])+'</div>':'')+paras(s.p);
  if(s.id==='turn-a-broad-practice-into-a-buyable-problem')out+='<p class="ps-note">'+esc(c.fiction)+'</p>';
  if(s.readiness){const t=s.readiness;out+='<details class="ps-optional" id="ps-readiness"><summary>'+esc(t.title)+'</summary>'+paras([t.intro])+'<div class="check-grid">'+t.items.map(x=>'<label><input type="checkbox" data-risk>'+esc(x)+'</label>').join('')+'</div><div class="tool-output"><span>'+esc(t.marked)+'</span><strong data-risk-score aria-live="polite">0 '+esc({en:'of',es:'de',ca:'de',fr:'sur'}[lang])+' 8</strong>'+paras([t.note])+'</div></details>';}
  if(s.rows)out+='<div class="ps-table" role="region" aria-labelledby="'+s.id+'-caption" tabindex="0"><table role="table"><caption id="'+s.id+'-caption">'+esc(s.caption||s.title)+'</caption><thead><tr>'+s.headers.map((x,i)=>'<th scope="col" id="'+s.id+'-h'+i+'">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+s.rows.map(row=>'<tr>'+row.map((x,i)=>'<td headers="'+s.id+'-h'+i+'" data-label="'+esc(s.headers[i])+'">'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  out+=list(s.ul,'ul')+list(s.ol,'ol');
  if(s.dl)out+=definition(s.dl);
  if(s.cards)out+='<div class="ps-cards">'+s.cards.map(([a,b])=>'<div><h3>'+esc(a)+'</h3>'+paras([b])+'</div>').join('')+'</div>';
  if(s.samples)out+=s.samples.map(([title,message,reason])=>'<div class="ps-sample"><h3>'+esc(title)+'</h3><blockquote>'+paras(message.split('\n\n'))+'</blockquote>'+paras([reason])+'</div>').join('');
  if(s.quotes)out+=s.quotes.map(x=>'<blockquote>'+paras([x])+'</blockquote>').join('');
  out+=paras(s.after);
  if(s.links)out+='<div class="text-links">'+s.links.map(([url,label])=>'<a href="'+prefix+url+'">'+esc(label)+' →</a>').join('')+'</div>';

  if(s.questions){
   const csv='\ufeff'+s.questions.map(row=>row.map(x=>'"'+x.replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';
   out+='<details class="ps-optional" id="ps-questions"><summary>'+esc(s.downloadTitle)+'</summary>'+paras([s.downloadNote])+definition(s.questions)+'<a class="ps-download" download="beespoke-professional-services-campaign-brief-'+lang+'.csv" href="data:text/csv;charset=utf-8,'+encodeURIComponent(csv)+'">'+esc(s.downloadLabel)+'</a></details>';
  }
  if(s.faqs)out+=s.faqs.map(([q,a])=>'<details><summary>'+esc(q)+'</summary>'+paras([a])+'</details>').join('');
  return out+'</section>';
 }
 let body=c.sections.map(s=>render(s)+(s.id==='use-triggers-as-research-clues-not-private-knowledge'?ctas[0]:s.id==='make-expertise-inspectable'?ctas[1]:'')).join('');
 body+='<section id="sources"><h2>'+esc(c.sourceTitle)+'</h2>'+paras([c.sourceNote])+'<ul>'+refs.map(([name,url])=>'<li class="ps-source">'+esc(name+' — '+url)+'</li>').join('')+'</ul><a href="'+prefix+'/editorial-policy/">'+esc({en:'Editorial policy',es:'Política editorial',ca:'Política editorial',fr:'Politique éditoriale'}[lang])+' →</a></section>';
 let n=0;h=h.replace(/(<article>)[\s\S]*?(<\/article>)/,(_,a,z)=>{n++;return a+body+z;});assert.equal(n,1);
 const nav=c.sections.map(s=>'<a href="#'+s.id+'">'+esc(s.title)+'</a>').join('')+'<a href="#sources">'+esc(c.sourceTitle)+'</a>';
 h=h.replace(/(<aside class="toc">[\s\S]*?<\/div>)[\s\S]*?(<div class="toc-progress">)/,(_,a,z)=>a+nav+z);
 h=h.replace(/(<details class="mobile-toc"[\s\S]*?<nav[^>]*>)[\s\S]*?(<\/nav>)/,(_,a,z)=>a+nav+z);
 h=h.replace(/<div class="hero-actions">/,'<div class="hero-actions"><a class="secondary" href="#ps-worked-account">'+esc(c.jump)+'</a>');
 const updated={en:'Updated ',es:'Actualizado el ',ca:'Actualitzat el ',fr:'Mis à jour le '}[lang];
 h=h.replace(/(<p class="meta">[\s\S]*?· )[^<]+(<\/p>)/,(_,a,z)=>a+updated+c.dateLabel+z);
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,j,z)=>{const g=JSON.parse(j);g['@graph'].find(n=>n['@type']==='Article').dateModified=data.revision;g['@graph'].find(n=>n['@type']==='Article').description=c.description;if(c.headerH1){g['@graph'].find(n=>n['@type']==='Article').name=c.headerH1;g['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement[1].name=c.headerH1;}if(c.eyebrow)g['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement[1].name=c.eyebrow;g['@graph']=g['@graph'].filter(n=>n['@type']!=='FAQPage');g['@graph'].push({'@type':'FAQPage','@id':'https://outbound-lead-generation.com'+route+'#faq',mainEntity:c.sections.find(s=>s.faqs).faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});return a+JSON.stringify(g).replace(/</g,'\\u003c')+z;});
 h=h.replace('class="journal-article"','class="journal-article ps-review"').replace('</head>','<style id="professional-services-review">'+style+'</style></head>');

 fs.writeFileSync(file,h);
 const re=new RegExp('(<loc>https://outbound-lead-generation.com'+route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</loc><lastmod>)[^<]+(</lastmod>)');assert(re.test(sitemap));sitemap=sitemap.replace(re,'$1'+data.date+'$2');
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Applied 24 reviewed professional-services acquisition improvements in four languages.');
