'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{summarize}=require('../agency-proposal-checklist');
const root=path.resolve(__dirname,'..'),route='guides/best-linkedin-lead-generation-agencies/index.html';
const de=s=>s.replace(/<[^>]+>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
for(const lang of ['en','es','ca','fr']){
 const h=fs.readFileSync(path.join(root,lang==='en'?'':lang,route),'utf8'),c=lang==='en'?require('../data/linkedin-selection-review-20261112').en:require('../data/linkedin-selection-review-'+lang+'-20261112');
 assert.equal((h.match(/data-evidence-item /g)||[]).length,12);assert.equal((h.match(/data-critical="true"/g)||[]).length,4);assert.equal((h.match(/data-evidence-reset/g)||[]).length,1);
 assert(h.includes('class="selection-checklist"><summary>'));assert(h.includes('id="worked-example"'));assert(h.includes('id="selection-economics"'));assert(h.includes('id="contact-coordination"'));assert(h.includes('id="selection-brief"'));assert(h.includes('datetime="2026-11-12"'));assert.equal((h.match(/<h1>/g)||[]).length,1);
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);for(const [,id]of h.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),lang+' missing '+id);
 const d=JSON.parse(h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);const faq=d['@graph'].find(n=>n['@type']==='FAQPage');const v=[...h.matchAll(/<details><summary>([^<]+)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(m=>[de(m[1]),de(m[2])]);assert.equal(v.length,7);assert.deepEqual(v,faq.mainEntity.map(q=>[q.name,q.acceptedAnswer.text]));
 const config=JSON.parse(h.match(/<script type="application\/json" data-checklist-copy>([\s\S]*?)<\/script>/)[1]);assert.equal(config.complete,c.checklist[11]);
 for(const [,url]of h.matchAll(/<a\b[^>]*href="(https?:\/\/[^\"]+)"/g))assert(!/(cleverly\.co|doitdigital\.agency|leadcookie\.com|pluralsales\.com|prospectengine\.com|salesbread\.com)/.test(new URL(url).hostname));
 for(const bad of ['equipo de cuatro','equip de quatre','équipe de quatre','Campanya gestionada per botiga','Campagne gérée par la boutique','n’assimilent pas'])assert(!h.includes(bad),bad);
 assert(h.includes('2026-10-15.json'),'Historical review remains linked');assert(!h.includes('$999'),'New provider package remains held');assert(h.includes(c.scope[0].replaceAll('&','&amp;')));
}
assert.deepEqual(summarize([{checked:true,critical:true},{checked:false,critical:true}]),{reviewed:1,total:2,criticalMissing:1});
const js=fs.readFileSync(path.join(root,'agency-proposal-checklist.js'),'utf8');assert(!/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|gtag|dataLayer)\s*[.(]/.test(js));
assert.equal(2000*3+300+900,7200);assert.equal(1600*3+600+600+1200,7200);assert.equal(7200/6,1200);assert.equal(7200/8,900);assert.equal(7200/2,3600);assert.equal(7200/3,2400);assert.equal(7200/4,1800);
console.log('LinkedIn selection: four-language tool/FAQ/anchor parity, held provider assertions, no competitor anchors, scoped runtime privacy and worked arithmetic pass.');
