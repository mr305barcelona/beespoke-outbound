'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),route='/guides/appointment-setting-pricing/',date='2026-11-17',copy=require('../data/appointment-handoff-20261117.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=copy[lang],pre=lang==='en'?'':'/'+lang,file=path.join(root,(pre+route).slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 const original=h.match(/<article>([^]*?)<\/article>/)[1],sections=new Map([...original.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<\/section>/g)].map(m=>[m[1],m[0]]));
 const oldIds=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),oldHrefs=new Set([...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]));
 const own=sections.get(lang==='es'?'alcance-beespoke':'where-beespoke-pricing-fits'),next=sections.get('pricing-next-step'),sources=sections.get(lang==='es'?'fuentes-y-metodo':'sources');assert(own&&next&&sources);
 const preserve=['worked-example','quote-budget','quote-normalizer','quote-brief','current-service-terms',lang==='es'?'preguntas-frecuentes':'pricing-questions'];
 let body=original.replace(/<aside class="inline-cta">[^]*?<\/aside>/g,'');
 const handoff='<section id="appointment-fit-call" tabindex="-1"><h2>'+esc(c.heading)+'</h2><aside class="inline-cta"><div><p>'+esc(c.intro)+'</p><a class="button" href="https://calendly.com/noahlevybuilds/30min">'+esc(c.book)+'</a><p>'+esc(c.privacy)+'</p><details class="fit-call-preparation"><summary>'+esc(c.optionalLabel)+'</summary><ul>'+c.items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></details></div></aside></section>';
 body=body.replace(own,own+handoff);
 const links=[...next.matchAll(/<a\b[^>]*>[^]*?<\/a>/g)].map(m=>m[0]);assert.equal(links.length,4);assert.equal(c.routes.length,4);
 body=body.replace(next,next.match(/^<section\b[^>]*>/)[0]+next.match(/<h2>[^]*?<\/h2>/)[0]+'<ul>'+links.map((a,i)=>'<li>'+a+'<p>'+esc(c.routes[i])+'</p></li>').join('')+'</ul></section>');
 body=body.replace(sources,sources.replace('</section>','<p>'+esc(c.sourceNote)+'</p></section>'));
 for(const id of preserve)assert(body.includes(sections.get(id)),'Preserve complete section '+lang+' '+id);
 assert(body.includes(own),'Own-service price and scope must stay exact');
 h=h.replace('<article>'+original+'</article>','<article>'+body+'</article>');
 const toc=[...body.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<\/section>/g)].map(m=>{const title=m[0].match(/<h2>([^]*?)<\/h2>/);return title?'<a href="#'+m[1]+'">'+title[1]+'</a>':'';}).join('');assert(toc.includes('href="#appointment-fit-call"'));
 h=h.replace(/(<details class="mobile-toc">[^]*?<nav\b[^>]*>)[^]*?(<\/nav>)/,(_,a,b)=>a+toc+b).replace(/(<aside class="toc">[^]*?<\/div>)[^]*?(<div class="toc-progress">[^]*?<\/aside>|<\/aside>)/,(_,a,b)=>a+toc+b);
 assert.equal((h.match(/<time /g)||[]).length,1);h=h.replace(/<time datetime="[^"]+">[^<]+<\/time>/,'<time datetime="'+date+'">'+esc(c.updated)+'</time>');
 h=h.replace(/<script type="application\/ld\+json">([^]*?)<\/script>/,(_,raw)=>{const d=JSON.parse(raw);for(const n of d['@graph']||[d])if(['WebPage','Article','TechArticle'].includes(n['@type'])&&n.dateModified)n.dateModified=date+'T00:00:00Z';return'<script type="application/ld+json">'+JSON.stringify(d).replace(/</g,'\\u003c')+'</script>';});
 const newHrefs=new Set([...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]));for(const url of oldHrefs)assert(newHrefs.has(url),'Lost existing route '+lang+' '+url);for(const id of oldIds)assert(h.includes('id="'+id+'"'),'Lost original anchor '+id);
 assert.equal((h.match(/class="inline-cta"/g)||[]).length,1);fs.writeFileSync(file,h);
 const canonical='https://outbound-lead-generation.com'+pre+route;let count=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>[^<]+<\/lastmod><\/url>/g,(m,url)=>url===canonical?(count++,'<url><loc>'+url+'</loc><lastmod>'+date+'</lastmod></url>'):m);assert.equal(count,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Appointment pricing: one contextual fit-call handoff and annotated existing routes in four languages; complete prices, tools, FAQs and booking implementation preserved.');
