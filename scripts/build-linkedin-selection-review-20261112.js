'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),asset=require('./asset-version');
const root=path.resolve(__dirname,'..'),data=require('../data/linkedin-selection-review-20261112'),terms=require('../data/buyer-clarity-20261027').priceAnswers;
const route='/guides/best-linkedin-lead-generation-agencies/',origin='https://outbound-lead-generation.com';
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=s=>'<p>'+e(s)+'</p>',ul=a=>'<ul>'+a.map(s=>'<li>'+e(s)+'</li>').join('')+'</ul>';
const table=(title,heads,rows)=>'<div class="table-wrap" role="region" tabindex="0" aria-label="'+e(title)+'"><table><caption>'+e(title)+'</caption><thead><tr>'+heads.map(s=>'<th scope="col">'+e(s)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(([a,...b])=>'<tr><th scope="row">'+e(a)+'</th>'+b.map(s=>'<td>'+e(s)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const section=(id,title,body)=>'<section id="'+id+'" tabindex="-1"><h2>'+e(title)+'</h2>'+body+'</section>';
const fromTable=(id,c)=>section(id,c[0],table(c[0],c[1],c[2]));
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=lang==='en'?data.en:require('../data/linkedin-selection-review-'+lang+'-20261112');assert.deepEqual(Object.keys(c).sort(),Object.keys(data.en).sort());
 const prefix=lang==='en'?'':'/'+lang,file=path.join(root,(prefix+route).slice(1),'index.html');let h=fs.readFileSync(file,'utf8');assert(!h.includes('linkedin-selection-review.css'));
 const oldArticle=h.match(/<article>([\s\S]*?)<\/article>/)?.[1];assert(oldArticle);const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const old=new Map([...oldArticle.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[\s\S]*?<\/section>/g)].map(m=>[m[1],m[0]]));
 const worked=old.get('worked-example');assert(worked);const ctas=[...oldArticle.matchAll(/<aside class="inline-cta">[\s\S]*?<\/aside>/g)].map(m=>m[0]);
 let shortlist=old.get('linkedin-lead-generation-agency-shortlist');assert(shortlist);let row=0;
 shortlist=shortlist.replace(/<tbody>[\s\S]*?<\/tbody>/,body=>body.replace(/<tr>([\s\S]*?)<\/tr>/g,(all,inside)=>{const cells=[...inside.matchAll(/<(td|th)\b[^>]*>[\s\S]*?<\/\1>/g)].map(m=>m[0]);assert.equal(cells.length,3);cells[1]='<td>'+e(c.scope[row++])+'</td>';return '<tr>'+cells.join('')+'</tr>';}));assert.equal(row,7);
 shortlist=shortlist.replace(/(<h2>[\s\S]*?<\/h2>)[\s\S]*?(<div class="table-wrap")/,(_,a,z)=>a+p(c.historical)+z);
 // Remove any redundant sentence that describes the historical snapshot as current.
 shortlist=shortlist.replace(/<p>Current first-party positioning[\s\S]*?<\/p>/,'');
 let body=fromTable('selection-model',c.model)+shortlist+section('selection-fit',c.fit[0],ul(c.fit[1]))+section('sender-readiness',c.readiness[0],p(c.readiness[1]));
 body+=old.get('choose-the-linkedin-job-before-the-agency')+worked+fromTable('reply-tests',c.replies)+section('contact-coordination',c.coordination[0],p(c.coordination[1]))+fromTable('handoff-record',c.handoff)+(ctas[0]||'');
 body+=old.get('audit-platform-and-account-risk')+old.get('compare-personalization-and-reply-handling');
 body+=section('from-shortlist-to-scope',c.roles[0],table(c.roles[0],c.roles[1],c.roles[2])+'<label for="selection-brief">'+e(c.briefTitle)+'</label><textarea id="selection-brief" rows="12" readonly spellcheck="false">'+e(c.brief)+'</textarea>');
 body+=section('cohort-review',c.pilot[0],ul(c.pilot[1]));
 body+=section('selection-economics',c.economics[0],p(c.economics[1])+table(c.economics[0],c.economics[2][0],c.economics[2].slice(1))+p(c.economics[3])+p(c.economics[4]));
 body+=section('meeting-dispute',c.dispute[0],p(c.dispute[1]));
 let normalize=old.get('normalize-price-qualification-and-ownership');assert(normalize);if(lang==='en')normalize=normalize.replace(/<p>[\s\S]*?<\/p>/,p(terms[lang]));else normalize=normalize.replace('</h2>','</h2>'+p(terms[lang]));body+=normalize+old.get('buyer-decision-guide');
 const t=c.checklist,critical=new Set([7,8,10,11]);assert.equal(t[5].length,12);
 const checklist='<details class="selection-checklist"><summary>'+e(t[0])+'</summary><div data-agency-proposal-checklist><p>'+e(t[1])+'</p><div class="proposal-groups">'+[0,1,2].map(g=>'<fieldset><legend>'+e(t[g+2])+'</legend>'+t[5].slice(g*4,g*4+4).map((label,n)=>{const i=g*4+n;return'<label for="agency-evidence-'+i+'"><input id="agency-evidence-'+i+'" type="checkbox" data-evidence-item data-critical="'+critical.has(i)+'">'+e(label)+'</label>';}).join('')+'</fieldset>').join('')+'</div><div class="proposal-result" aria-live="polite" aria-atomic="true"><strong data-evidence-count>'+e(t[9].replace('{n}','0').replace('{total}','12'))+'</strong><p data-evidence-status>'+e(t[10].replace('{n}','4'))+'</p>'+'</div><button type="button" data-evidence-reset>'+e(t[6])+'</button>'+p(t[7])+'<noscript>'+p(t[8])+'</noscript><script type="application/json" data-checklist-copy>'+JSON.stringify({count:t[9],missing:t[10],complete:t[11]}).replace(/</g,'\\u003c')+'</script></div></details>';
 body+=(ctas[1]||'')+section('linkedin-agency-score',t[0],checklist);
 body=body.replace('<section id="linkedin-agency-score" tabindex="-1">','<section id="linkedin-agency-score" class="original-tool" tabindex="-1">');
 let refs=old.get('provider-links-and-commercial-disclosure');assert(refs);refs=refs.replace(/<p>[\s\S]*?<\/p>/,p(c.historical));body+=refs;
 let faq=old.get('frequently-asked-questions');assert(faq);faq=faq.replace('</section>',c.extraFaq.map(([q,a])=>'<details><summary>'+e(q)+'</summary>'+p(a)+'</details>').join('')+'</section>');body+=faq;
 let sources=old.get('sources');assert(sources);sources=sources.replace(/(<\/h2>)[\s\S]*?(<ol>)/,(_,a,z)=>a+p(c.sourceNote)+'<p><a href="/data/linkedin-agency-review-2026-10-15.json">'+e({en:'Read the dated provider source snapshot (JSON)',es:'Consultar las fuentes de proveedores del 15 de octubre (JSON)',ca:'Consulta les fonts de proveïdors del 15 d’octubre (JSON)',fr:'Consulter les sources des prestataires du 15 octobre (JSON)'}[lang])+'</a></p>'+z);body+=sources;
 h=h.replace('<article>'+oldArticle+'</article>','<article>'+body+'</article>').replace(/(<p class="answer">)[\s\S]*?(<\/p>)/,(_,a,z)=>a+e(c.answer)+z);
 // Provider references remain readable, without outbound competitor anchors.
 const providerHosts=new Set(['cleverly.co','doitdigital.agency','leadcookie.com','pluralsales.com','prospectengine.com','salesbread.com']);
 h=h.replace(/<a\b[^>]*href="(https?:\/\/[^\"]+)"[^>]*>([\s\S]*?)<\/a>/g,(all,url,label)=>{const u=new URL(url.replaceAll('&amp;','&'));return providerHosts.has(u.hostname.replace(/^www\./,''))?'<span class="selection-source">'+label.replace(/\s*→\s*$/,'')+' · '+e(u.hostname.replace(/^www\./,'')+u.pathname)+'</span>':all;});
 // Correct literal translations without changing the preserved fictional exercise.
 const fixes={es:{'campaña gestionada por boutique':'campaña gestionada por una agencia especializada','cuentas nombradas':'cuentas objetivo concretas','muestra de cuenta redactada':'muestra de cuenta anonimizada','Economía y outbound':'Costes y salida'},ca:{'Campanya gestionada per botiga':'Campanya gestionada per una agència especialitzada','Reserveu reunions de compte amb nom':'Concertar reunions amb comptes objectiu concrets','propietat i outbound':'propietat i sortida','economia, propietat i outbound':'costos, propietat i sortida','Economia i outbound':'Costos i sortida','mostra de compte redactada':'mostra de compte anonimitzada','Un proveïdor que reserve reunions':'Un proveïdor que reserva reunions','Rols d\'investigació, estratègia i èxit':'Rols de recerca, estratègia i seguiment'},fr:{'Campagne gérée par la boutique':'Campagne gérée par une agence spécialisée','Ajouter LinkedIn aux outbound multicanales':'Associer LinkedIn à la prospection multicanale','Planifier des réunions nominatives':'Organiser des rendez-vous avec des comptes ciblés','n’assimilent pas':'n’assimilez pas','les copys':'les textes','adéquation opérationnel':'Adéquation opérationnelle','promesse générique faite pour vous':'promesse générique de prise en charge complète'}};
 // Apply prose corrections outside the preserved worked example only.
 const token='<!--PRESERVED_WORKED_EXAMPLE-->';h=h.replace(worked,token);for(const [a,b]of Object.entries(fixes[lang]||{}))h=h.replaceAll(a,b);if(lang==='es')h=h.replaceAll('salida','finalización del contrato').replaceAll('Salida','Finalización del contrato');if(lang==='ca')h=h.replaceAll('sortida','finalització del contracte').replaceAll('Sortida','Finalització del contracte');h=h.replace(token,worked);
 const finalBody=h.match(/<article>([\s\S]*?)<\/article>/)[1];const faqPairs=[...faq.matchAll(/<details><summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(m=>[m[1],m[2]]);assert.equal(faqPairs.length,7);
 const plain=s=>s.replace(/<[^>]*>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
 h=h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,raw)=>{const d=JSON.parse(raw),nodes=d['@graph']||[d];for(const n of nodes){if(['Article','WebPage','TechArticle'].includes(n['@type'])&&n.dateModified)n.dateModified=data.revision;if(n['@type']==='FAQPage')n.mainEntity=faqPairs.map(([q,a])=>({'@type':'Question',name:plain(q),acceptedAnswer:{'@type':'Answer',text:plain(a)}}));}return'<script type="application/ld+json">'+JSON.stringify(d).replace(/</g,'\\u003c')+'</script>';});
 h=h.replace(/<time datetime="2026-11-04">[^<]+<\/time>/,'<time datetime="'+data.date+'">'+e(c.updated)+'</time>');
 const toc=[...finalBody.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[\s\S]*?<h2>([\s\S]*?)<\/h2>/g)].map(m=>'<a href="#'+m[1]+'">'+m[2]+'</a>').join('');
 h=h.replace(/(<details class="mobile-toc">[\s\S]*?<nav\b[^>]*>)[\s\S]*?(<\/nav>)/,(_,a,z)=>a+toc+z).replace(/(<aside class="toc">[\s\S]*?<\/div>)[\s\S]*?(<\/aside>)/,(_,a,z)=>a+toc+z);
 h=h.replace('<div class="hero-actions">','<div class="hero-actions"><a class="secondary" href="#selection-model">'+e(c.jump)+'</a>').replace('class="journal-article','class="journal-article linkedin-selection-review');
 h=h.replace(/<script src="\/agency-proposal-checklist\.js[^\"]*" defer><\/script>/g,'').replace(/<link rel="stylesheet" href="\/agency-proposal-checklist\.css[^\"]*">/g,'');
 h=h.replace('</head>','<link rel="stylesheet" href="'+asset('/agency-proposal-checklist.css')+'"><link rel="stylesheet" href="'+asset('/linkedin-selection-review.css')+'"></head>').replace('</body>','<script src="'+asset('/agency-proposal-checklist.js')+'" defer></script></body>');
 for(const id of ids)assert(h.includes('id="'+id+'"'),'Lost original anchor '+lang+' '+id);assert(h.includes(worked));assert(!h.includes('equipo de cuatro')&&!h.includes('equip de quatre')&&!h.includes('équipe de quatre'));
 assert(h.includes('datetime="'+data.date+'"'));fs.writeFileSync(file,h);
 const url=origin+prefix+route;let n=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>[^<]+<\/lastmod><\/url>/g,(m,u)=>u===url?(n++,'<url><loc>'+url+'</loc><lastmod>'+data.date+'</lastmod></url>'):m);assert.equal(n,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Revised LinkedIn agency selection guidance in four languages; dated provider dataset and original fictional exercise preserved.');
