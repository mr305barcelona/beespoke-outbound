'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=require('../data/appointment-pricing-review-20261112.json'),asset=require('./asset-version');
const origin='https://outbound-lead-generation.com',route='/guides/appointment-setting-pricing/';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=s=>'<p>'+e(s)+'</p>',ul=items=>'<ul>'+items.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul>';
const table=(caption,heads,rows)=>'<div class="table-wrap" tabindex="0" role="region" aria-label="'+e(caption)+'"><table><caption>'+e(caption)+'</caption><thead><tr>'+heads.map(s=>'<th scope="col">'+e(s)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(([first,...rest])=>'<tr><th scope="row">'+e(first)+'</th>'+rest.map(s=>'<td>'+e(s)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const section=(id,title,body,cls='')=>'<section id="'+id+'"'+(cls?' class="'+cls+'"':'')+' tabindex="-1"><h2>'+e(title)+'</h2>'+body+'</section>';
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=data[lang],prefix=lang==='en'?'':'/'+lang,file=path.join(root,(prefix+route).slice(1),'index.html');let h=fs.readFileSync(file,'utf8');assert(!h.includes('appointment-pricing-review.css'));
 const original=h,ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),article=h.match(/<article>([\s\S]*?)<\/article>/)?.[1];assert(article);
 const old=new Map([...article.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[\s\S]*?<\/section>/g)].map(m=>[m[1],m[0]]));
 const terms=old.get('current-service-terms');assert(terms);const worked=old.get('worked-example');assert(worked);
 const ctas=[...article.matchAll(/<aside class="inline-cta">[\s\S]*?<\/aside>/g)].map(m=>m[0]);
 const modelId=lang==='es'?'modelos-de-precios':'appointment-setting-pricing-models',driverId=lang==='es'?'pricing-cost-drivers':'why-published-prices-vary-so-widely',commitId=lang==='es'?'minimum-commitment':'normalize-every-quote-before-comparing',econId=lang==='es'?'meeting-economics':'model-the-economics-from-the-sale-backward',ownId=lang==='es'?'alcance-beespoke':'where-beespoke-pricing-fits',sourceId=lang==='es'?'fuentes-y-metodo':'sources',faqId=lang==='es'?'preguntas-frecuentes':'pricing-questions';
 let body=section(modelId,c.models[0],p(c.models[1])+table(c.models[0],c.models[2],c.models[3]));
 // Keep the earlier price reference as dated context, never as a newly checked average.
 if(lang!=='es'){const oldAnswer=h.match(/<p class="answer">([\s\S]*?)<\/p>/)?.[1];assert(oldAnswer);const history={ca:'Els exemples de proveïdors publicats el 2026 que recollia aquesta guia anaven aproximadament de 3.000 a 15.000 USD al mes i de 150 a 1.500 USD per cita. Són referències històriques, no una mitjana actual ni pressupostos equivalents. Cal alinear els criteris de qualificació, l’assistència, els canals i la feina inclosa abans de comparar-los.',fr:'Les exemples de prestataires publiés en 2026 que recensait ce guide allaient approximativement de 3 000 à 15 000 USD par mois et de 150 à 1 500 USD par rendez-vous. Ce sont des repères historiques, pas une moyenne actuelle ni des devis équivalents. Alignez les critères de qualification, la présence, les canaux et le travail inclus avant de les comparer.'};body+=section('historical-price-context',c.historical,'<p>'+(history[lang]?e(history[lang]):oldAnswer)+'</p><p class="pricing-source-date">'+e(c.sourcesNote)+'</p>');}
 body+=section(driverId,c.drivers[0],p(c.drivers[1])+ul(c.drivers[2]));
 body+=worked+(ctas[0]||'');
 body+=section('quote-budget',c.budget[0],'<p class="pricing-fiction">'+e(c.budget[1])+'</p>'+table(c.budget[0],c.budget[2],c.budget[3])+p(c.budget[4])+p(c.budget[5]));
 const t=c.tool,fields=['cost','booked','held','accepted','opportunities'],defaults=[[8190,24,16,12,4],[7290,24,18,9,3]];
 const calc='<details class="pricing-calculator" data-quote-calculator><summary>'+e(t.open)+'</summary>'+p(t.intro)+'<label for="quote-currency">'+e(t.currency)+'</label><select id="quote-currency" data-currency><option value="USD">USD</option><option value="EUR">EUR</option></select><div class="quote-inputs">'+defaults.map((values,i)=>'<fieldset><legend>'+e(t.quotes[i])+'</legend>'+fields.map((key,n)=>'<div class="quote-field"><label for="quote-'+i+'-'+key+'">'+e(t.fields[n])+'</label><input id="quote-'+i+'-'+key+'" data-quote="'+i+'" data-key="'+key+'" type="number" inputmode="'+(n?'numeric':'decimal')+'" min="0" max="'+(n?'100000':'100000000')+'" step="'+(n?'1':'any')+'" value="'+values[n]+'"></div>').join('')+'</fieldset>').join('')+'</div><div class="quote-actions"><button type="button" data-compare>'+e(t.compute)+'</button><button type="button" data-reset>'+e(t.reset)+'</button><button type="button" data-export>'+e(t.export)+'</button></div><p class="quote-error" role="alert" data-error hidden></p><div data-results aria-live="polite" aria-atomic="true"><h3>'+e(t.result)+'</h3>'+table(t.result,[t.result,...t.quotes],t.rows.map((label,i)=>[label,...defaults.map(v=>(v[0]/v[i+1]).toFixed(2)+' USD')]))+'</div>'+p(t.note)+'<p class="quote-privacy">'+e(t.privacy)+'</p><noscript>'+p(t.intro)+'</noscript></details>';
 body+=section('quote-normalizer',t.title,calc,'original-tool quote-tool');
 body+=section(commitId,c.commitment[0],c.commitment.slice(1).map(p).join(''));
 body+=section('weak-period',c.stress[0],c.stress.slice(1).map(p).join(''));
 body+=section(econId,c.economics[0],c.economics.slice(1).map(p).join('')+'<p><a href="'+prefix+'/guides/outbound-lead-generation-cost/">'+e({en:'Use the outbound break-even guide',es:'Consultar la guía de rentabilidad outbound',ca:'Consulta la guia de rendibilitat outbound',fr:'Consulter le guide de rentabilité outbound'}[lang])+' →</a></p>');
 body+=section('buyer-decision-guide',c.decision[0],p(c.decision[1])+ul(c.decision[2]),'competitive-depth');
 body+=section('quote-brief',c.briefTitle,p(c.briefIntro)+'<label for="pricing-brief">'+e(c.briefTitle)+'</label><textarea id="pricing-brief" rows="12" readonly spellcheck="false">'+e(c.brief)+'</textarea>');
 if(lang==='es')body+=old.get('criterios-de-aceptacion')+old.get('checklist-presupuesto');
 body+=(ctas[1]||'')+section(ownId,c.own[0],c.own.slice(1).map(p).join('')+'<p><a href="'+prefix+'/pricing/">'+e(c.routes[3][1])+' →</a></p>');
 body+=section('pricing-next-step',c.routeTitle,'<ul>'+c.routes.map(([url,label])=>'<li><a href="'+prefix+url+'">'+e(label)+' →</a></li>').join('')+'</ul>');
 if(lang==='es'){
  // Retain the approved dated third-party row and earlier fictional arithmetic intact.
  let dated=old.get('precios-publicados');assert(dated);dated=dated.replace('Beespoke — outbound centrado en LinkedIn','Beespoke — cold email y/o LinkedIn');
  body+=dated+old.get('ejemplo-presupuesto')+old.get('presupuesto-y-siguiente-paso');
 }
 body+=section(faqId,c.faqTitle,c.faqs.map(([q,a])=>'<details><summary>'+e(q)+'</summary>'+p(a)+'</details>').join(''));
 let sources=old.get(sourceId);assert(sources);sources=sources.replace(/(<\/h2>)/,'$1'+p(c.sourcesNote));if(lang==='ca')sources=sources.replace('Punts de referència per a la concertació de reunions de Leader 2026','Leadriver, guia de costos de concertació de reunions de 2026').replace('ViaMetric ha publicat els preus de les cites','ViaMetric, preus publicats');if(lang==='fr')sources=sources.replace('Référentiels de fixation des rendez-vous Leadriver 2026','Leadriver, guide des coûts de prise de rendez-vous de 2026');sources=sources.replace('</section>',c.references.map(p).join('')+'</section>');body+=sources+terms;
 h=h.replace('<article>'+article+'</article>','<article>'+body+'</article>');
 h=h.replace(/(<p class="answer">)[\s\S]*?(<\/p>)/,(_,a,z)=>a+e(c.answer)+z);
 h=h.replace(/<time datetime="2026-11-04">[^<]+<\/time>/,'<time datetime="'+data.date+'">'+e(c.updated)+'</time>');
 // Cite external providers as readable text, with no outbound competitor links.
 h=h.replace(/<article>[\s\S]*?<\/article>/,a=>a.replace(/<a\b[^>]*href="(https?:\/\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/g,(m,url,label)=>{const u=new URL(url.replaceAll('&amp;','&'));if(u.hostname==='outbound-lead-generation.com'||/(^|\.)(calendly\.com|wa\.me)$/.test(u.hostname))return m;return '<span class="pricing-source-reference">'+label+' · '+e(u.hostname.replace(/^www\./,'')+u.pathname)+'</span>';}));
 h=h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,j)=>{const d=JSON.parse(j),g=d['@graph']||[d];for(const n of g){if(['Article','WebPage','TechArticle'].includes(n['@type'])&&n.dateModified)n.dateModified=data.revision;if(n['@type']==='FAQPage')n.mainEntity=c.faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}));}if(!g.some(n=>n['@type']==='FAQPage'))g.push({'@type':'FAQPage','@id':origin+prefix+route+'#faq',inLanguage:lang,mainEntity:c.faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});return '<script type="application/ld+json">'+JSON.stringify(d).replace(/</g,'\\u003c')+'</script>';});
 // Rebuild both contents controls from the final section order; every target remains stable.
 const labels=[...body.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>\s*<h2>([\s\S]*?)<\/h2>/g)].filter(m=>m[1]!=='current-service-terms');
 const toc=labels.map(m=>'<a href="#'+m[1]+'">'+m[2]+'</a>').join('');
 h=h.replace(/(<details class="mobile-toc">[\s\S]*?<nav\b[^>]*>)[\s\S]*?(<\/nav>)/,(_,a,z)=>a+toc+z).replace(/(<aside class="toc">[\s\S]*?<\/div>)[\s\S]*?(<\/aside>)/,(_,a,z)=>a+toc+z);
 h=h.replace('<div class="hero-actions">','<div class="hero-actions"><a class="secondary" href="#quote-budget">'+e(c.jump)+'</a>');
 h=h.replace('class="journal-article','class="journal-article appointment-pricing-review').replace('</head>','<link rel="stylesheet" href="'+asset('/appointment-pricing-review.css')+'"></head>');
 h=h.replace('</body>','<script type="application/json" data-quote-config>'+JSON.stringify({locale:lang,tool:t}).replace(/</g,'\\u003c')+'</script><script src="'+asset('/appointment-pricing-review.js')+'" defer></script></body>');
 for(const id of ids)assert(h.includes('id="'+id+'"'),'Missing old anchor '+lang+' '+id);
 assert(h.includes(terms),'Current approved terms changed');assert(h.includes(worked),'Original reconciliation example lost');
 assert(h!==original&&h.includes(data.date));fs.writeFileSync(file,h);
 const url=origin+prefix+route;let n=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g,(m,u)=>u===url?(n++,'<url><loc>'+u+'</loc><lastmod>'+data.date+'</lastmod></url>'):m);assert.equal(n,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Appointment pricing: complete quote comparison, optional calculator and buyer decisions in four languages; historical provider rates preserved.');
