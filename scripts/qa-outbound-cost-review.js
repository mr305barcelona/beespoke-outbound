'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{calculate}=require('../outbound-cost-review');
const root=path.resolve(__dirname,'..'),valid={cost:3000,meetings:12,oppRate:25,winRate:20,revenue:20000,margin:60};
const r=calculate(valid);for(const[k,v]of Object.entries({customers:.6,profit:7200,surplus:4200,multiple:2.4,ratio:140,required:5}))assert(Math.abs(r[k]-v)<1e-8,k);
for(const key of Object.keys(valid))for(const value of ['',null,undefined,-1,'x',Infinity])assert(calculate({...valid,[key]:value}).error,key+' invalid');
for(const key of ['oppRate','winRate','margin'])assert(calculate({...valid,[key]:100.1}).error);
assert(calculate({...valid,meetings:1.5}).error);assert(calculate({...valid,meetings:1e30}).error);
for(const key of ['oppRate','winRate','margin','revenue']){const z=calculate({...valid,[key]:0});assert.equal(z.profit,0);assert.equal(z.required,null);assert.equal(z.ratio,-100);}
const zero=calculate({...valid,cost:0});assert.equal(zero.multiple,null);assert.equal(zero.ratio,null);assert.equal(zero.required,0);
assert.equal(calculate({...valid,cost:10000}).surplus,-2800);assert(Math.abs(calculate({...valid,cost:10000}).ratio+28)<1e-8);
assert.equal(calculate({...valid,meetings:6}).profit,3600);assert.equal(calculate({...valid,meetings:0}).surplus,-3000);
assert.equal(calculate({...valid,meetings:1,revenue:1,margin:100,oppRate:100,winRate:100,cost:1.1}).required,2);
assert(calculate({...valid,revenue:1e308,meetings:1e9}).error);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const lang of ['en','es','ca','fr']){const c=lang==='en'?require('../data/outbound-cost-review-20261113').en:require('../data/outbound-cost-review-'+lang+'-20261113');const prefix=lang==='en'?'':'/'+lang;const h=fs.readFileSync(path.join(root,(prefix+'/guides/outbound-lead-generation-cost/').slice(1),'index.html'),'utf8');
 assert(h.includes('class="journal-article cost-review'));assert(!h.includes('class="calculator"'));assert.equal((h.match(/data-cost-input=/g)||[]).length,6);assert.equal((h.match(/data-cost-output=/g)||[]).length,6);assert(h.includes('<details class="cost-tool">'));assert(!h.includes('<details class="cost-tool" open'));
 for(const key of ['first-90-day-budget','invoice-unit-check','billable-event-test','reply-handling-scope-check'])assert(h.includes('id="'+key+'"'));
 for(const val of [c.answer,c.own,c.worked,c.downside,c.cash,c.sourceNote])assert(h.includes(esc(val)));
 for(const[q,a]of c.faqs){assert(h.includes('<summary>'+esc(q)+'</summary><p>'+esc(a)+'</p>'));}
 const d=JSON.parse(h.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)[1]),faq=d['@graph'].find(x=>x['@type']==='FAQPage');assert.equal(faq.mainEntity.length,7);for(const q of faq.mainEntity)assert(h.includes('<summary>'+esc(q.name)+'</summary><p>'+esc(q.acceptedAnswer.text)+'</p>'));
 const ids=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);for(const m of h.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]));
 assert(h.includes('datetime="2026-11-13"'));assert(!/href="https?:\/\/(?:www\.)?(?:leadium|artemisleads|division50|artisan|salesroads|toplead|apollo|outreachbloom|gtmplays)\./i.test(h));
}
const runtime=fs.readFileSync(path.join(root,'outbound-cost-review.js'),'utf8');for(const forbidden of ['fetch(','XMLHttpRequest','localStorage','sessionStorage','dataLayer','gtag(','sendBeacon','WebSocket'])assert(!runtime.includes(forbidden),forbidden);
console.log('Outbound-cost QA passed: bounded arithmetic, missing/zero/invalid/overflow/rounding behavior, four-language parity, original routes and ungated local utility.');
