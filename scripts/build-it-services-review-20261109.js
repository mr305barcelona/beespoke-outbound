'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=require('../data/it-services-review-20261109.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=xs=>(xs||[]).map(s=>'<p>'+esc(s)+'</p>').join('');
const list=(xs,tag)=>(xs||[]).length?'<'+tag+'>'+xs.map(s=>'<li>'+esc(s)+'</li>').join('')+'</'+tag+'>':'';
const definition=xs=>'<dl class="it-definitions">'+xs.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>';
const refs=[["Callbox IT", "callboxinc.com/industries-we-serve/it-lead-generation/"], ["Ironpaper", "ironpaper.com/it-lead-generation/"], ["Growleads", "growleads.io/blog/lead-generation-for-it-services-guide-from-zero-to-1m/"], ["Cleverly", "cleverly.co/blog/lead-generation-for-it-services"], ["memoryBlue", "memoryblue.com/it-lead-generation/"], ["Martal IT", "martal.ca/information-technology-lead-generation/"], ["Headley Media", "headleymedia.com/resources/the-ultimate-guide-to-it-lead-generation/"], ["Pangolin", "pangolinmarketing.com/insights/lead-generation-strategy-for-it-services-companies"], ["Lead Express", "leadgeneration.com.au/industry-specific-solutions/it-managed-services/"], ["Martal MSP", "martal.ca/msp-lead-generation/"], ["Callbox MSP", "callboxinc.com/lead-generation/msp-lead-generation/"], ["Apollo", "apollo.io/insights/lead-generation-for-msps"], ["Volume Nine", "v9digital.com/insights/10-tips-for-it-service-companies-how-to-generate-more-leads/"], ["Belkins", "belkins.io/blog/lead-generation-for-technology-companies"]];
const style=`
body.it-review .it-anchor{display:block;scroll-margin-top:calc(var(--header) + 24px)}
body.it-review .article-grid article section{scroll-margin-top:calc(var(--header) + 24px)}
body.it-review .it-note{padding:1rem 1.2rem;border-inline-start:3px solid #5a7483;background:#eef3f5;color:#14212b;margin:1.1rem 0}
body.it-review .it-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;margin:1rem 0}
body.it-review .it-cards>div{min-width:0;padding:1rem;border:1px solid #cbd6dc;border-radius:.35rem;background:#f6f9fa;color:#14212b}
body.it-review .article-grid article h3{font:600 1.05rem/1.5 Arial,Helvetica,sans-serif;color:#14212b;letter-spacing:normal;margin:1.2rem 0 .5rem;text-transform:none}
body.it-review .it-cards h3{margin-top:0}
body.it-review .it-cards p:last-child{margin-bottom:0}
body.it-review .it-table{max-width:100%;margin:1.2rem 0;overflow:auto}
body.it-review .it-table table{width:100%;min-width:0;table-layout:fixed}
body.it-review .it-table :is(th,td){overflow-wrap:break-word;vertical-align:top}
body.it-review .it-table th:first-child{width:24%}
body.it-review .it-table caption{font:600 .95rem/1.5 Arial,Helvetica,sans-serif;color:#405363;text-align:left;white-space:normal;padding:.6rem .75rem}
body.it-review .it-definitions{display:grid;gap:1rem;margin:1.2rem 0}
body.it-review .it-definitions>div{padding-bottom:.8rem;border-bottom:1px solid #d4dde1;min-width:0}
body.it-review .it-definitions dt{font-weight:600;color:#14212b}
body.it-review .it-definitions dd{margin:.35rem 0 0}
body.it-review blockquote{font:inherit;background:#f6f9fa;color:#14212b;border-inline-start:3px solid #5a7483;margin:1.2rem 0;padding:1rem 1.2rem}
body.it-review .it-optional{padding:1rem;border:1px solid #bac8cf;border-radius:.35rem;background:#fff;color:#14212b}
body.it-review .it-optional summary,body.it-review #frequently-asked-questions summary{font:600 1rem/1.5 Arial,Helvetica,sans-serif;cursor:pointer;min-height:44px;display:list-item;align-content:center;padding:.4rem .2rem;color:#14212b}
body.it-review .it-optional[open]>summary{margin-bottom:1rem}
body.it-review #frequently-asked-questions details{border-bottom:1px solid #d4dde1;padding:.5rem 0}
body.it-review .it-download{display:inline-flex;align-items:center;min-height:44px;color:#14212b;background:#fff;border:1px solid #748895;padding:.5rem .85rem;border-radius:3px;text-decoration:underline;text-underline-offset:3px;font:500 1rem/1.45 Arial,Helvetica,sans-serif}
body.it-review :is(summary,.it-download):focus-visible{outline:3px solid #356781;outline-offset:3px}
body.it-review .it-source{overflow-wrap:anywhere}
@media(max-width:600px){body.it-review .it-table caption{display:block;width:100%;box-sizing:border-box}body.it-review .it-cards{grid-template-columns:1fr}body.it-review .it-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}body.it-review .it-table :is(table,tbody,tr,td){display:block;width:100%;box-sizing:border-box}body.it-review .it-table tr{margin:0 0 1rem;border:1px solid #cbd6dc;border-radius:.3rem}body.it-review .it-table td{border:0;padding:.75rem;max-width:100%;overflow-wrap:anywhere}body.it-review .it-table td+td{border-top:1px solid #e0e7ea}body.it-review .it-table td:before{content:attr(data-label);display:block;font-size:.85rem;font-weight:600;color:#405363;margin-bottom:.25rem}body.it-review .it-table td:first-child{font-weight:600;background:#eef3f5}}


@media print{body.it-review .it-cards{display:block}body.it-review .it-cards>div{break-inside:avoid}body.it-review .it-download{display:none}}
`;
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=data[lang],prefix=lang==='en'?'':'/'+lang,route=prefix+'/industries/it-services-lead-generation/',file=path.join(root,route.slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 assert(!h.includes('id="it-services-review"'));
 h=h.replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*(">)/g,(_,a,z)=>a+esc(c.description)+z);

 if(c.headerH1){h=h.replace(/<h1[^>]*>[\s\S]*?<\/h1>/,'<h1>'+esc(c.headerH1)+'</h1>');}
 if(c.headerEyebrow){const old='Comparaison des fournisseurs sortants';assert.equal(h.split(old).length-1,2);h=h.split(old).join(esc(c.headerEyebrow));}
 const oldAnswer=h.match(/<p class="answer">[\s\S]*?<\/p>/);assert(oldAnswer,'answer');
 h=h.replace(oldAnswer[0],'<p class="answer">'+esc(c.answer)+'</p>');
 const ctas=[...h.matchAll(/<aside class="inline-cta">[\s\S]*?<\/aside>/g)].map(m=>m[0]);assert.equal(ctas.length,2);
 function render(s){
  let out='<section'+(s.id==='it-services-change-map'?' class="original-tool"':s.id==='buyer-decision-guide'?' class="competitive-depth"':'')+' id="'+s.id+'">'+(s.aliases||[]).map(id=>'<span class="it-anchor" id="'+id+'" aria-hidden="true"></span>').join('')+'<h2>'+esc(s.title)+'</h2>'+(s.case?'<div class="it-note"><h3>'+esc(s.case[0])+'</h3>'+paras([s.case[1]])+'</div>':'')+paras(s.p);
  if(s.id==='define-the-it-service-and-commercial-wedge')out+='<p class="it-note">'+esc(c.fiction)+'</p>';
  if(s.rows)out+='<div class="it-table" role="region" aria-labelledby="'+s.id+'-caption" tabindex="0"><table role="table"><caption id="'+s.id+'-caption">'+esc(s.caption||s.title)+'</caption><thead><tr>'+s.headers.map((x,i)=>'<th scope="col" id="'+s.id+'-h'+i+'">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+s.rows.map(row=>'<tr>'+row.map((x,i)=>'<td headers="'+s.id+'-h'+i+'" data-label="'+esc(s.headers[i])+'">'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  out+=list(s.ul,'ul')+list(s.ol,'ol');
  if(s.dl)out+=definition(s.dl);
  if(s.cards)out+='<div class="it-cards">'+s.cards.map(([a,b])=>'<div><h3>'+esc(a)+'</h3>'+paras([b])+'</div>').join('')+'</div>';
  if(s.samples)out+=s.samples.map(([title,message,reason])=>'<div class="it-sample"><h3>'+esc(title)+'</h3><blockquote>'+paras(message.split('\n\n'))+'</blockquote>'+paras([reason])+'</div>').join('');
  if(s.quotes)out+=s.quotes.map(x=>'<blockquote>'+paras([x])+'</blockquote>').join('');
  out+=paras(s.after);
  if(s.links)out+='<div class="text-links">'+s.links.map(([url,label])=>'<a href="'+prefix+url+'">'+esc(label)+' →</a>').join('')+'</div>';

  if(s.questions){
   const csv='\ufeff'+s.questions.map(row=>row.map(x=>'"'+x.replace(/"/g,'""')+'"').join(',')).join('\r\n')+'\r\n';
   out+='<details class="it-optional" id="it-questions"><summary>'+esc(s.downloadTitle)+'</summary>'+paras([s.downloadNote])+definition(s.questions)+'<a class="it-download" download="beespoke-it-services-campaign-brief-'+lang+'.csv" href="data:text/csv;charset=utf-8,'+encodeURIComponent(csv)+'">'+esc(s.downloadLabel)+'</a></details>';
  }
  if(s.faqs)out+=s.faqs.map(([q,a])=>'<details><summary>'+esc(q)+'</summary>'+paras([a])+'</details>').join('');
  return out+'</section>';
 }
 let body=c.sections.map(s=>render(s)+(s.id==='use-change-signals-as-hypotheses'?ctas[0]:s.id==='replace-broad-capability-claims-with-inspectable-proof'?ctas[1]:'')).join('');
 body+='<section id="sources"><h2>'+esc(c.sourceTitle)+'</h2>'+paras([c.sourceNote])+'<ul>'+refs.map(([name,url])=>'<li class="it-source">'+esc(name+' — '+url)+'</li>').join('')+'</ul><a href="'+prefix+'/editorial-policy/">'+esc({en:'Editorial policy',es:'Política editorial',ca:'Política editorial',fr:'Politique éditoriale'}[lang])+' →</a></section>';
 let n=0;h=h.replace(/(<article>)[\s\S]*?(<\/article>)/,(_,a,z)=>{n++;return a+body+z;});assert.equal(n,1);
 const nav=c.sections.map(s=>'<a href="#'+s.id+'">'+esc(s.title)+'</a>').join('')+'<a href="#sources">'+esc(c.sourceTitle)+'</a>';
 h=h.replace(/(<aside class="toc">[\s\S]*?<\/div>)[\s\S]*?(<div class="toc-progress">)/,(_,a,z)=>a+nav+z);
 h=h.replace(/(<details class="mobile-toc"[\s\S]*?<nav[^>]*>)[\s\S]*?(<\/nav>)/,(_,a,z)=>a+nav+z);
 h=h.replace(/<div class="hero-actions">/,'<div class="hero-actions"><a class="secondary" href="#managed-service-provider-prospecting">'+esc(c.jump)+'</a>');
 const updated={en:'Updated ',es:'Actualizado el ',ca:'Actualitzat el ',fr:'Mis à jour le '}[lang];
 h=h.replace(/(<p class="meta">[\s\S]*?· )[^<]+(<\/p>)/,(_,a,z)=>a+updated+c.dateLabel+z);
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,j,z)=>{const g=JSON.parse(j);g['@graph'].find(n=>n['@type']==='Article').dateModified=data.revision;g['@graph'].find(n=>n['@type']==='Article').description=c.description;if(c.headerH1){g['@graph'].find(n=>n['@type']==='Article').name=c.headerH1;g['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement[1].name=c.headerH1;}g['@graph']=g['@graph'].filter(n=>n['@type']!=='FAQPage');g['@graph'].push({'@type':'FAQPage','@id':'https://outbound-lead-generation.com'+route+'#faq',mainEntity:c.sections.find(s=>s.faqs).faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});return a+JSON.stringify(g).replace(/</g,'\\u003c')+z;});
 h=h.replace('class="journal-article"','class="journal-article it-review"').replace('</head>','<style id="it-services-review">'+style+'</style></head>');

 fs.writeFileSync(file,h);
 const re=new RegExp('(<loc>https://outbound-lead-generation.com'+route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</loc><lastmod>)[^<]+(</lastmod>)');assert(re.test(sitemap));sitemap=sitemap.replace(re,'$1'+data.date+'$2');
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Applied 24 reviewed IT services acquisition improvements in four languages.');
