'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),asset=require('./asset-version'),quote=require('../data/call-center-quote-calculator');
const root=path.resolve(__dirname,'..'),route='/guides/outbound-call-center-pricing/',date='2026-11-16';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),p=s=>'<p>'+esc(s)+'</p>';
function table(t){return'<div class="table-wrap" role="region" tabindex="0" aria-label="'+esc(t.caption)+'"><table><caption>'+esc(t.caption)+'</caption><thead><tr>'+t.heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+t.rows.map(([h,...cells])=>'<tr><th scope="row">'+esc(h)+'</th>'+cells.map(c=>'<td>'+esc(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function content(c){return(c.paragraphs||[]).map(p).join('')+(c.list?'<ul>'+c.list.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+(c.table?table(c.table):'')+(c.after?p(c.after):'');}
const section=(id,c)=>'<section id="'+id+'" tabindex="-1"><h2>'+esc(c.title)+'</h2>'+content(c)+'</section>';
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=require('../data/call-center-review-20261116/'+lang+'.json'),prefix=lang==='en'?'':'/'+lang,file=path.join(root,(prefix+route).slice(1),'index.html');let h=fs.readFileSync(file,'utf8');assert(!h.includes('class="journal-article call-center-review'));
 const oldLabel=h.match(/<p class="eyebrow">([^]*?)<\/p>/)[1];assert(oldLabel.includes('2026'));assert(h.split(oldLabel).length>=3);h=h.replaceAll(oldLabel,esc(c.label));
 const original=h.match(/<article>([^]*?)<\/article>/)[1],sections=new Map([...original.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<\/section>/g)].map(m=>[m[1],m[0]]));let body=original;
 const ownSection=sections.get('current-service-terms'),worked=sections.get('worked-quote-review');assert(ownSection&&worked);
 const originalIds=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 for(const [id,copy]of Object.entries(c.sections)){
  const old=sections.get(id);assert(old,id);let extra='';
  if(id==='decide-whether-a-call-center-is-the-right-operating-model'){const own=[...old.matchAll(/<p>([^]*?)<\/p>/g)].find(m=>m[1].includes('Beespoke'));assert(own);extra+=own[0];}
  const links=[...old.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>[^]*?<\/a>/g)].map(m=>m[0]);if(links.length)extra+='<p>'+links.join(' ')+'</p>';
  if(id==='decide-whether-a-call-center-is-the-right-operating-model')extra+='<p><a href="'+prefix+'/services/cold-email-lead-generation/">'+esc(c.serviceLink)+'</a></p>';
  body=body.replace(old,old.match(/^<section\b[^>]*>/)[0]+'<h2>'+esc(copy.title)+'</h2>'+content(copy)+extra+'</section>');
 }
 const calcOld=sections.get('call-center-quote-calculator');assert(calcOld);body=body.replace(calcOld,'');
 const scenarioId='use-a-scenario-formula-instead-of-a-generic-market-average',scenario=body.match(new RegExp('<section\\b[^>]*id="'+scenarioId+'"[^>]*>[^]*?<\\/section>'))[0];body=body.replace(scenario,scenario+quote.render(lang));
 body=body.replace(worked,worked+section('minimum-commitment-cash',c.minimum)+section('original-booking-ledger',c.ledger));
 const buyer=body.match(/<section\b[^>]*id="buyer-decision-guide"[^>]*>[^]*?<\/section>/)[0];body=body.replace(buyer,section('same-bidder-brief',c.brief)+buyer);
 const faq=sections.get('frequently-asked-questions'),oldPairs=[...faq.matchAll(/<details><summary>([^]*?)<\/summary><p>([^]*?)<\/p><\/details>/g)];assert.equal(oldPairs.length,4);
 const qhtml=pairs=>pairs.map(([q,a])=>'<details><summary>'+esc(q)+'</summary>'+p(a)+'</details>').join('');
 body=body.replace(faq,faq.match(/^<section\b[^>]*>/)[0]+faq.match(/<h2>[^]*?<\/h2>/)[0]+qhtml(c.faqs.slice(0,3))+oldPairs[3][0]+qhtml(c.faqs.slice(3))+'</section>');
 const sources=sections.get('sources');body=body.replace(sources,sources.replace(/<p>[^]*?<\/p>/,p(c.sourcesIntro)));
 const fixes={en:{},es:{'Horario de precios y límites de servicio de los centros de llamadas públicos de SAS':'Tarifas publicadas por SAS y límites del servicio'},ca:{'Programació de preus del centre de trucades públics de SAS i límits del servei':'Tarifes publicades per SAS i límits del servei'},fr:{'Grille tarifaire des centres d&#39;appels publics SAS et limites des services':'Tarifs publiés par SAS et limites des prestations'}};
 for(const [a,b]of Object.entries(fixes[lang]))body=body.replaceAll(a,b);
 body=body.replace(/Grille tarifaire des centres d(?:&#39;|')appels publics SAS et limites des services/g,'Tarifs publiés par SAS et limites des prestations');
 assert.equal((body.match(/<aside class="inline-cta">/g)||[]).length,2);body=body.replace(/<aside class="inline-cta">[^]*?<\/aside>/g,'');assert(body.includes(ownSection)&&body.includes(worked));
 h=h.replace('<article>'+original+'</article>','<article>'+body+'</article>').replace(/(<p class="answer">)[^]*?(<\/p>)/,(_,a,z)=>a+esc(c.answer)+z).replace('class="journal-article','class="journal-article call-center-review');
 h=h.replace(/<time datetime="2026-11-04">[^<]+<\/time>/,'<time datetime="'+date+'">'+esc(c.updated)+'</time>');
 const plain=s=>s.replace(/<[^>]+>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
 const faqFinal=h.match(/<section\b[^>]*id="frequently-asked-questions"[^>]*>[^]*?<\/section>/)[0],pairs=[...faqFinal.matchAll(/<details><summary>([^]*?)<\/summary><p>([^]*?)<\/p><\/details>/g)].map(m=>[plain(m[1]),plain(m[2])]);assert.equal(pairs.length,7);
 h=h.replace(/<script type="application\/ld\+json">([^]*?)<\/script>/,(_,raw)=>{const d=JSON.parse(raw);for(const n of d['@graph']||[d]){if(['WebPage','Article','TechArticle'].includes(n['@type'])&&n.dateModified)n.dateModified=date+'T00:00:00Z';if(n['@type']==='FAQPage')n.mainEntity=pairs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}));}return'<script type="application/ld+json">'+JSON.stringify(d).replace(/</g,'\\u003c')+'</script>';});
 const toc=[...body.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<h2>([^]*?)<\/h2>/g)].filter(m=>m[1]!=='current-service-terms').map(m=>'<a href="#'+m[1]+'">'+m[2]+'</a>').join('');
 h=h.replace(/(<details class="mobile-toc">[^]*?<nav\b[^>]*>)[^]*?(<\/nav>)/,(_,a,z)=>a+toc+z).replace(/(<aside class="toc">[^]*?<\/div>)[^]*?(<div class="toc-progress">)/,(_,a,z)=>a+toc+z);
 for(const name of ['call-center-quote-calculator.css','call-center-quote-calculator.js'])h=h.replace(new RegExp('/'+name.replaceAll('.','\\.')+'(?:\\?[^"<>]*)?','g'),asset('/'+name));
 for(const id of originalIds)assert(h.includes('id="'+id+'"'),'Lost anchor '+lang+' '+id);fs.writeFileSync(file,h);
 const url='https://outbound-lead-generation.com'+prefix+route;let n=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>[^<]+<\/lastmod><\/url>/g,(m,u)=>u===url?(n++,'<url><loc>'+u+'</loc><lastmod>'+date+'</lastmod></url>'):m);assert.equal(n,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Call-center full review built in four languages; historical references and approved own terms preserved.');
