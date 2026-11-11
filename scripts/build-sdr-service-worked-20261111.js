'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=require('../data/sdr-service-worked-20261111.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=s=>'<p>'+esc(s)+'</p>',dl=rows=>'<dl class="sdr-record">'+rows.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>';
const id='managed-prospecting-example';
const style=`
body.sdr-service-review #${id}{scroll-margin-top:calc(var(--header) + 24px)}
body.sdr-service-review #${id} h3{font:600 1.1rem/1.5 Arial,Helvetica,sans-serif;letter-spacing:normal;text-transform:none;color:#14212b;margin:1.6rem 0 .6rem}
body.sdr-service-review #${id} blockquote{margin:1rem 0;padding:1rem 1.2rem;background:#f4f7f8;color:#14212b;border:0;border-inline-start:3px solid #5a7483;font:400 1rem/1.7 Arial,Helvetica,sans-serif;box-shadow:none}
body.sdr-service-review #${id} blockquote p{color:#14212b;margin:.7rem 0;overflow-wrap:anywhere}
body.sdr-service-review .sdr-note{padding:.85rem 1rem;border-inline-start:3px solid #5a7483;background:#eef3f5;color:#14212b;font:400 .95rem/1.65 Arial,Helvetica,sans-serif}
body.sdr-service-review .sdr-record{margin:1rem 0}
body.sdr-service-review .sdr-record>div{padding:.8rem 0;border-bottom:1px solid #d4dde1;min-width:0}
body.sdr-service-review .sdr-record dt{font-weight:600;color:#14212b}
body.sdr-service-review .sdr-record dd{margin:.3rem 0 0;color:#14212b;overflow-wrap:anywhere}
body.sdr-service-review .sdr-tool-toggle{border:1px solid #cbd6dc;background:#fff;color:#14212b;padding:.8rem 1rem;border-radius:3px}
body.sdr-service-review .sdr-tool-toggle>summary{cursor:pointer;font:600 1rem/1.5 Arial,Helvetica,sans-serif;min-height:44px;display:list-item;align-content:center;color:#14212b}
body.sdr-service-review .sdr-tool-toggle>summary:focus-visible{outline:3px solid #356781;outline-offset:3px}
body.sdr-service-review .sdr-tool-toggle .check-grid label{font:400 1rem/1.5 Arial,Helvetica,sans-serif;color:#14212b;background:#f4f7f8;text-transform:none;letter-spacing:normal;min-width:0}
body.sdr-service-review .sdr-tool-toggle .tool-output{background:#eef3f5;color:#14212b;box-shadow:none;border:0}
body.sdr-service-review .sdr-tool-toggle .tool-output :is(span,strong,p){color:#14212b;-webkit-text-fill-color:#14212b;text-transform:none;letter-spacing:normal}
body.sdr-service-review .inline-cta{background:#f4f7f8;color:#14212b;box-shadow:none;border:1px solid #d4dde1;padding:1.2rem}
body.sdr-service-review .inline-cta h2{font:600 1.1rem/1.5 Arial,Helvetica,sans-serif;color:#14212b;letter-spacing:normal;margin:.3rem 0}
body.sdr-service-review .inline-cta p{color:#14212b}
body.sdr-service-review .inline-cta span{color:#405363;letter-spacing:normal;text-transform:none}
@media(max-width:600px){body.sdr-service-review .sdr-tool-toggle .check-grid{grid-template-columns:1fr}body.sdr-service-review #${id} blockquote{padding:.9rem}}
`;
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=data[lang],prefix=lang==='en'?'':'/'+lang,route=prefix+'/services/outsourced-sdr/',file=path.join(root,route.slice(1),'index.html');let h=fs.readFileSync(file,'utf8');assert(!h.includes('id="sdr-service-worked-style"'));
 const terms=h.match(/<section class="commercial-terms"[\s\S]*?<\/section>/)[0];
 const graphBefore=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const faqs=JSON.stringify(graphBefore['@graph'].find(n=>n['@type']==='FAQPage'));
 const old=h.match(new RegExp('<section[^>]*id="'+id+'"[^>]*>[\\s\\S]*?<\\/section>'));
 if(lang==='en'){assert(old);h=h.replace(old[0],'');h=h.replace(new RegExp('<a href="#'+id+'">[\\s\\S]*?<\\/a>','g'),'');}else assert(!old);
 let section='<section id="'+id+'"><h2>'+esc(c.title)+'</h2><p class="sdr-note">'+esc(c.fiction)+'</p>'+p(c.context);
 section+='<h3>'+esc(c.researchTitle)+'</h3>'+dl(c.research)+'<h3>'+esc(c.channelTitle)+'</h3>'+p(c.channel);
 section+='<h3>'+esc(c.messageTitle)+'</h3><blockquote>'+p(c.subject)+c.message.map(p).join('')+'</blockquote>'+p(c.annotation);
 section+='<h3>'+esc(c.followupTitle)+'</h3><blockquote>'+p(c.followup)+'</blockquote>'+p(c.followupNote);
 section+='<h3>'+esc(c.replyTitle)+'</h3><blockquote>'+p(c.reply)+'</blockquote>'+dl(c.decisions);
 section+='<h3>'+esc(c.handoffTitle)+'</h3>'+p(c.handoffIntro)+dl(c.handoff);
 section+='<h3>'+esc(c.feedbackTitle)+'</h3>'+p(c.feedback)+'<h3>'+esc(c.routeTitle)+'</h3>'+p(c.routeIntro)+'<div class="text-links">'+c.links.map(([url,label])=>'<a href="'+prefix+url+'">'+esc(label)+' →</a>').join('')+'</div></section>';
 const ctas=[...h.matchAll(/<aside class="inline-cta">[\s\S]*?<\/aside>/g)].map(m=>m[0]);assert.equal(ctas.length,2);
 for(let i=0;i<2;i++){const old=ctas[i],copy=c['cta'+(i+1)];let next=old.replace(/<h2>[\s\S]*?<\/h2>/,'<h2>'+esc(copy[0])+'</h2>').replace(/<p>[\s\S]*?<\/p>/,p(copy[1]));h=h.replace(old,(i===0?section:'')+next);}
 const nav='<a href="#'+id+'">'+esc(c.title)+'</a>';
 h=h.replace(/(<aside class="toc">[\s\S]*?<\/div>)/,'$1'+nav).replace(/(<details class="mobile-toc"[\s\S]*?<nav[^>]*>)/,'$1'+nav);
 assert.equal(h.split('href="#'+id+'"').length-1,2);
 h=h.replace('<div class="hero-actions">','<div class="hero-actions"><a class="secondary" href="#'+id+'">'+esc(c.jump)+'</a>');
 // Keep the existing scope check available without opening a form before the lesson.
 if(lang!=='en'){
  const re=/<section([^>]*id="outsourced-sdr-scope"[^>]*)>([\s\S]*?)<\/section>/,m=h.match(re);assert(m);
  const labels={es:'Opcional: revisar el alcance de una propuesta',ca:'Opcional: revisar l’abast d’una proposta',fr:'Facultatif : examiner le périmètre d’une proposition'};
  h=h.replace(m[0],'<section'+m[1]+'><details class="sdr-tool-toggle"><summary>'+esc(labels[lang])+'</summary>'+m[2]+'</details></section>');
 }
 h=h.replace(/(<p class="meta">[\s\S]*?· )[^<]+(<\/p>)/,(_,a,z)=>a+c.updated+z);
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,j,z)=>{const g=JSON.parse(j);for(const n of g['@graph'])if(n['@type']==='WebPage')n.dateModified=data.revision;assert.equal(JSON.stringify(g['@graph'].find(n=>n['@type']==='FAQPage')),faqs);return a+JSON.stringify(g).replace(/</g,'\\u003c')+z;});
 assert(h.includes(terms),'Existing commercial terms must remain byte-identical');
 h=h.replace('class="journal-article"','class="journal-article sdr-service-review"').replace('</head>','<style id="sdr-service-worked-style">'+style+'</style></head>');
 fs.writeFileSync(file,h);
 const url='https://outbound-lead-generation.com'+route;let count=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g,(m,u)=>{if(u!==url)return m;count++;return '<url><loc>'+u+'</loc><lastmod>'+data.date+'</lastmod></url>';});assert.equal(count,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('SDR service: original worked handoff, clear buyer routes and restrained controls in four languages.');
