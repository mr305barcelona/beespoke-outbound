const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),slugs=['b2b-seo-audit','b2b-content-audit','account-based-prospecting','aeo-audit'];
const dec=s=>String(s).replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
let count=0;for(const slug of slugs){const g=require('../data/buyer-guides-20261027/'+slug+'.json');for(const l of ['en','es','ca','fr']){
 const p=g[l],route=(l==='en'?'':'/'+l)+p.path,h=fs.readFileSync(path.join(root,route.slice(1),'index.html'),'utf8'),article=h.match(/<article>([\s\S]*?)<\/article>/)[1],visible=dec(article);
 assert.equal((h.match(/<h1>/g)||[]).length,1,route);assert(h.includes('<html lang="'+l+'">'));assert(h.includes('rel="canonical" href="https://outbound-lead-generation.com'+route+'"'));
 for(const lang of ['en','es','ca','fr','x-default'])assert(h.includes('hreflang="'+lang+'" href="https://outbound-lead-generation.com'+(['en','x-default'].includes(lang)?'':'/'+lang)+p.path+'"'));
 for(const s of p.sections){assert(visible.includes(s.heading),route+': reviewed heading missing');for(const b of s.body)assert(visible.includes(b),route+': reviewed paragraph changed');}
 const graph=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 const art=graph.find(x=>x['@type']==='Article');assert.equal(art.headline,p.h1);assert.equal(art.inLanguage,l);assert.equal(art.datePublished,'2026-10-27T17:00:00+01:00');
 const faq=graph.find(x=>x['@type']==='FAQPage');assert.deepEqual(faq.mainEntity.map(x=>[x.name,x.acceptedAnswer.text]),p.faqs.map(x=>[x.question,x.answer]));for(const f of p.faqs)assert(visible.includes(f.answer));
 assert(!/<form\b/i.test(h),route+': worksheet must never submit');assert(p.workbook.fields.length>=6);assert.equal((h.match(/<textarea /g)||[]).length,p.workbook.fields.length*2);for(const action of ['summary','add','sample','export','print','reset'])assert(h.includes('data-worksheet-'+action));
 assert.equal((h.match(/id="buyer-worksheet"/g)||[]).length,1);assert(h.includes('role="status" aria-live="polite"'));
 const cfg=JSON.parse(h.match(/<script type="application\/json" data-worksheet-config>([\s\S]*?)<\/script>/)[1]);assert.deepEqual(cfg.fields,p.workbook.fields);assert(cfg.samples.length>=6);assert(cfg.samples.every(row=>row.values.length===cfg.fields.length&&row.state==='fictional'));assert(cfg.options[0]);assert(cfg.summary.includes('{unknown}'));assert(cfg.summary.includes('{fictional}'));assert.equal(art.dateModified,'2026-10-28T10:00:00+01:00');assert(h.includes('data-worksheet-report'));assert(h.includes('<template>'));
 for(const m of h.matchAll(/href="#([^"]+)"/g))assert(h.includes('id="'+m[1]+'"'),route+': dead section link '+m[1]);
 for(const m of article.matchAll(/href="(\/[^"#?]+)"/g))if(l!=='en')assert(m[1].startsWith('/'+l+'/'),route+': cross-language internal link '+m[1]);
 assert(p.sections.length>=7 && p.sections.some(s=>s.table) && p.sections.some(s=>s.links),route+': decision help missing');
 assert(!/Partezz|\bundefined\b|\[object Object\]/.test(h));count++;
}}
const js=fs.readFileSync(path.join(root,'buyer-guide-worksheet.js'),'utf8');assert(!/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|gtag|dataLayer|submit|location|URLSearchParams)\b/.test(js),'Worksheet must not send/store inputs or change the URL');
console.log('Buyer guide QA passed: '+count+' complete locales; reviewed body/FAQ parity, reciprocal language metadata, local-only non-form worksheets and section links.');
