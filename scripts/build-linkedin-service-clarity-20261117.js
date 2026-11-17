'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),route='/services/linkedin-lead-generation/',date='2026-11-17';
const copies=require('../data/linkedin-service-clarity-20261117.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras=xs=>xs.map(x=>'<p>'+esc(x)+'</p>').join('');
const section=(id,c)=>'<section id="'+id+'" tabindex="-1"><h2>'+esc(c.title)+'</h2>'+paras(c.paragraphs)+'</section>';
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=copies[lang],pre=lang==='en'?'':'/'+lang,file=path.join(root,(pre+route).slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 const original=h.match(/<article>([^]*?)<\/article>/)[1],sections=new Map([...original.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<\/section>/g)].map(m=>[m[1],m[0]]));
 const terms=sections.get('current-service-terms'),caseStudy=sections.get(lang==='es'?'pruebas-y-ejemplo':'evidence-from-cybersecurity-outreach');assert(terms&&caseStudy);
 const title=h.match(/<title>[^]*?<\/title>/)[0],heading=h.match(/<h1>[^]*?<\/h1>/)[0],answer=h.match(/<p class="answer">[^]*?<\/p>/)[0];let content=original;
 for(const [id,copy]of Object.entries(c.sections)){assert(sections.has(id),id);content=content.replace(sections.get(id),section(id,copy));}
 const includes=sections.get('linkedin-outreach-service-includes');assert(includes);const messageLink=includes.match(/<p class="outbound-guides-link">[^]*?<\/p>/)?.[0];assert(messageLink);
 content=content.replace(includes,'<section id="linkedin-outreach-service-includes" tabindex="-1"><h2>'+esc(c.includes.title)+'</h2>'+paras(c.includes.paragraphs)+messageLink+'</section>');
 if(lang==='es'){
  const old=sections.get('tareas-y-precio');assert(old);let n=0;content=content.replace(old,old.replace(/<p>[^]*?<\/p>/g,m=>++n===2?'<p>'+esc(c.scopeCorrection)+'</p>':m));assert(n>=2);
 }
 const faqId=lang==='es'?'preguntas-frecuentes':'frequently-asked-questions',faq=sections.get(faqId);assert(faq);assert.equal(c.faqs.length,6);
 content=content.replace(faq,faq.match(/^<section\b[^>]*>/)[0]+faq.match(/<h2>[^]*?<\/h2>/)[0]+c.faqs.map(([q,a])=>'<details><summary>'+esc(q)+'</summary><p>'+esc(a)+'</p></details>').join('')+'</section>');
 const prepId=lang==='es'?'preparar-conversacion':'prepare-your-fit-call',prep='<section id="'+prepId+'" tabindex="-1"><h2>'+esc(c.prep.title)+'</h2>'+paras(c.prep.paragraphs)+'<p><a class="button" href="https://calendly.com/noahlevybuilds/30min">'+esc(c.prep.book)+'</a></p><div class="text-links"><a href="'+pre+'/services/cold-email-lead-generation/">'+esc(c.prep.email)+'</a><a href="'+pre+'/guides/linkedin-lead-generation-agency-cost/">'+esc(c.prep.cost)+'</a></div></section>';
 if(lang==='es'){assert(sections.has(prepId));content=content.replace(sections.get(prepId),prep);}else content+=prep;
 content=content.replace(/<aside class="inline-cta">[^]*?<\/aside>/g,'');
 const translations={
  ca:[['Inicieu converses amb compradors amb nom','Iniciar converses amb compradors concrets'],['Compreu abast objectiu i capteu la demanda','Arribar a un públic seleccionat i captar demanda'],['Compostos al llarg del temps','Efecte acumulatiu al llarg del temps'],['Assessorament/actius de suport quan s&#39;acordi','Assessorament i materials de suport quan s’acordi'],['no només la preu anunciat','no només el preu anunciat']],
  fr:[['Profil horaire','Horizon de temps'],['Portée sur mesure','Périmètre Beespoke'],['Démarrez des conversations avec des acheteurs nommés','Engager des conversations avec des acheteurs identifiés'],['Composés au fil du temps','Effet cumulatif dans le temps'],['Conseils/atouts complémentaires lorsque convenus','Conseils et supports complémentaires selon l’accord'],['Un outil tiers se connectera-t-il, supprimera-t-il un message ou modifiera-t-il le profil','Un outil tiers se connectera-t-il au profil, extraira-t-il des données, enverra-t-il des messages ou modifiera-t-il le profil'],['les listes de cibles et les copy','les listes de cibles et les messages'],['LinkedIn a interdit les conseils sur les logiciels','Consulter les règles de LinkedIn sur les logiciels interdits']],
  es:[['Las cancelaciones y respuestas negativas se respetan inmediatamente','Las solicitudes de no recibir más contactos y las respuestas negativas se respetan inmediatamente']]
 };
 for(const [old,value]of translations[lang]||[])content=content.replaceAll(old,value);
 if(lang==='ca')content=content.replace("Definim els filtres de comptes i persones, investiguem clients potencials, aguditzem el perfil d'enviament, escrivim la connexió i la seqüència de seguiment, gestionem les respostes i reservem converses adequades.",esc('Definim els criteris de selecció d’empreses i interlocutors, investiguem possibles compradors, revisem el perfil des del qual es contactarà, redactem la invitació i els missatges de seguiment, gestionem les respostes i concertem converses pertinents.')).replace("Lògica d'orientació de Sales Navigator",'Criteris de selecció a Sales Navigator').replace('Connexió i seqüències de missatges','Invitacions i seqüències de missatges');
 if(lang==='fr')content=content.replace("Nous définissons les filtres de compte et de personnalité, recherchons des prospects, affinons le profil d'envoi, rédigeons la séquence de connexion et de suivi, gérons les réponses et réservons des conversations adaptées.",esc('Nous définissons les critères de sélection des entreprises et des interlocuteurs, recherchons les prospects, retravaillons le profil utilisé pour les contacter, rédigeons les invitations et les relances, traitons les réponses et organisons des conversations pertinentes.'));
 assert(content.includes(terms),'Current terms must remain exact');assert(content.includes(caseStudy),'Public evidence must remain exact');
 h=h.replace('<article>'+original+'</article>','<article>'+content+'</article>');
 const toc=[...content.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<\/section>/g)].map(m=>{const heading=m[0].match(/<h2>([^]*?)<\/h2>/);return heading?'<a href="#'+m[1]+'">'+heading[1]+'</a>':'';}).join('');
 assert(toc.includes('href="#'+prepId+'"'));
 h=h.replace(/(<details class="mobile-toc">[^]*?<nav\b[^>]*>)[^]*?(<\/nav>)/,(_,a,b)=>a+toc+b).replace(/(<aside class="toc">[^]*?<\/div>)[^]*?(<div class="toc-progress">)/,(_,a,b)=>a+toc+b);
 assert.equal((h.match(/<p class="meta">/g)||[]).length,1);h=h.replace(/(<p class="meta">[^]*?·\s*)[^]*?(<\/p>)/,(_,a,b)=>a+'<time datetime="'+date+'">'+esc(c.updated)+'</time>'+b);
 h=h.replace(/<script type="application\/ld\+json">([^]*?)<\/script>/,(_,raw)=>{const d=JSON.parse(raw);for(const n of d['@graph']||[d]){if(['WebPage','Article','TechArticle'].includes(n['@type'])&&n.dateModified)n.dateModified=date+'T00:00:00Z';if(n['@type']==='FAQPage')n.mainEntity=c.faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}));}return'<script type="application/ld+json">'+JSON.stringify(d).replace(/</g,'\\u003c')+'</script>';});
 assert(h.includes(title)&&h.includes(heading)&&h.includes(answer),'Preserve search intent and approved direct answer');
 for(const id of [...original.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))assert(h.includes('id="'+id+'"'),'Lost original anchor '+id);
 assert.equal((h.match(/data-risk>/g)||[]).length,8);assert.equal((h.match(/class="outbound-guides-link"/g)||[]).length,1);fs.writeFileSync(file,h);
 const url='https://outbound-lead-generation.com'+pre+route;let n=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>[^<]+<\/lastmod><\/url>/g,(m,u)=>u===url?(n++,'<url><loc>'+u+'</loc><lastmod>'+date+'</lastmod></url>'):m);assert.equal(n,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('LinkedIn service: four native scope, personalization, qualification and fit-call corrections; current terms, evidence and intent preserved.');
