'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),asset=require('./asset-version');
const root=path.resolve(__dirname,'..'),route='/compare/outsourced-sdr-vs-in-house-sdr/',date='2026-11-16';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraph=s=>'<p>'+esc(s)+'</p>';
const table=t=>'<div class="table-wrap" role="region" tabindex="0" aria-label="'+esc(t.caption)+'"><table><caption>'+esc(t.caption)+'</caption><thead><tr>'+t.heads.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+t.rows.map(([h,...cells])=>'<tr><th scope="row">'+esc(h)+'</th>'+cells.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const body=c=>(c.paragraphs||[]).map(paragraph).join('')+(c.list?'<ul>'+c.list.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>':'')+(c.table?table(c.table):'')+(c.after?paragraph(c.after):'');
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=require('../data/sdr-compare-review-20261116/'+lang+'.json'),prefix=lang==='en'?'':'/'+lang,file=path.join(root,(prefix+route).slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 assert(!h.includes('sdr-compare-review.css'));const original=h.match(/<article>([^]*?)<\/article>/)[1],sections=new Map([...original.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<\/section>/g)].map(m=>[m[1],m[0]])),oldIds=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),oldHrefs=new Set([...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]));
 const worked=sections.get('worked-quote-review');assert(worked);let content=original;
 for(const [id,copy]of Object.entries(c.sections)){
  const old=sections.get(id);assert(old,id);const links=[...old.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>[^]*?<\/a>/g)].map(m=>{const plain=m[1].replace(/^\/(?:es|ca|fr)(?=\/)/,'');return c.linkLabels[plain]?m[0].replace(/>[^]*?<\/a>$/, '>'+esc(c.linkLabels[plain])+'</a>'):m[0];});
  if(id==='where-beespoke-fits')links.push('<a href="'+prefix+'/pricing/#current-service-terms">'+esc(c.pricingLink)+'</a>');
  content=content.replace(old,old.match(/^<section\b[^>]*>/)[0]+'<h2>'+esc(copy.title)+'</h2>'+body(copy)+(links.length?'<p>'+links.join(' ')+'</p>':'')+'</section>');
 }
 const oldModel=sections.get('sdr-model-test');assert(oldModel);assert.equal(c.record.fields.length,6);content=content.replace(oldModel,'<section class="original-tool" id="sdr-model-test" tabindex="-1"><h2>'+esc(c.model.title)+'</h2>'+body(c.model)+'<details class="quote-brief"><summary>'+esc(c.record.summary)+'</summary><dl class="brief-fields">'+c.record.fields.map(([name,value])=>'<div><dt>'+esc(name)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl></details></section>');
 assert.equal((content.match(/<aside class="inline-cta">/g)||[]).length,2);content=content.replace(/<aside class="inline-cta">[^]*?<\/aside>/g,'');
 const oldFAQ=sections.get('frequently-asked-questions');assert.equal(c.faqs.length,7);content=content.replace(oldFAQ,oldFAQ.match(/^<section\b[^>]*>/)[0]+oldFAQ.match(/<h2>[^]*?<\/h2>/)[0]+c.faqs.map(([q,a])=>'<details><summary>'+esc(q)+'</summary>'+paragraph(a)+'</details>').join('')+'</section>');
 assert(!sections.has('sources'));content+='<section class="sources" id="sources" tabindex="-1"><h2>'+esc(c.sourcesTitle)+'</h2>'+paragraph(c.sourcesIntro)+'<ol>'+c.references.map(r=>{const u=new URL(r.url);return'<li><span class="source-reference">'+esc(r.name)+' · '+esc(u.hostname+u.pathname).replaceAll('/','/<wbr>')+'</span></li>';}).join('')+'</ol></section>';
 assert(content.includes(worked),'Original 12-week worked calendar must remain exact');h=h.replace('<article>'+original+'</article>','<article>'+content+'</article>');
 const label=h.match(/<p class="eyebrow">([^]*?)<\/p>/)[1];assert(label.trim().length>0);assert(h.split(label).length>=3);h=h.replaceAll(label,esc(c.label));
 h=h.replace(/(<p class="answer">)[^]*?(<\/p>)/,(_,a,b)=>a+esc(c.answer)+b).replace('class="journal-article','class="journal-article sdr-compare-review');assert.equal((h.match(/<time /g)||[]).length,1);h=h.replace(/<time datetime="[^"]+">[^<]+<\/time>/,'<time datetime="'+date+'">'+esc(c.updated)+'</time>');
 h=h.replace(/<script type="application\/ld\+json">([^]*?)<\/script>/,(_,raw)=>{const d=JSON.parse(raw);for(const n of d['@graph']||[d]){if(['WebPage','Article','TechArticle'].includes(n['@type'])&&n.dateModified)n.dateModified=date+'T00:00:00Z';if(n['@type']==='FAQPage')n.mainEntity=c.faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}));}return'<script type="application/ld+json">'+JSON.stringify(d).replace(/</g,'\\u003c')+'</script>';});
 const toc=[...content.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>[^]*?<h2>([^]*?)<\/h2>/g)].map(m=>'<a href="#'+m[1]+'">'+m[2]+'</a>').join('');h=h.replace(/(<details class="mobile-toc">[^]*?<nav\b[^>]*>)[^]*?(<\/nav>)/,(_,a,b)=>a+toc+b).replace(/(<aside class="toc">[^]*?<\/div>)[^]*?(<div class="toc-progress">)/,(_,a,b)=>a+toc+b);
 h=h.replace('</head>','<link rel="stylesheet" href="'+asset('/sdr-compare-review.css')+'"></head>');for(const id of oldIds)assert(h.includes('id="'+id+'"'),'Lost anchor '+lang+' '+id);const newHrefs=new Set([...h.matchAll(/href="([^"]+)"/g)].map(m=>m[1]));for(const href of oldHrefs)assert(newHrefs.has(href),'Lost href '+lang+' '+href);fs.writeFileSync(file,h);
 const url='https://outbound-lead-generation.com'+prefix+route;let n=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>[^<]+<\/lastmod><\/url>/g,(m,u)=>u===url?(n++,'<url><loc>'+u+'</loc><lastmod>'+date+'</lastmod></url>'):m);assert.equal(n,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('SDR hiring comparison: four native revisions, original 12-week calendar preserved, fictional cash/time ledger and six-field decision record; no new provider claims.');
