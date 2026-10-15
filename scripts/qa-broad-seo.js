const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const g=require('../data/broad-seo-20261015'),calc=require('../call-center-quote-calculator'),quote=require('../data/call-center-quote-calculator'),data=require('../data/outbound-pricing-recheck-2026-10-15.json');
const root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com',esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const defaults=Object.fromEntries(Object.entries(quote.fields).map(([k,v])=>[k,v[0]]));
assert(calc.validate(defaults));assert.deepEqual(calc.calculate(defaults),{aTotal:2700,bTotal:3700,aUnit:270,bUnit:3700/12});
const zero={...defaults,aHeld:0,bHeld:0};assert(calc.validate(zero));assert.equal(calc.calculate(zero).aUnit,null);assert.equal(calc.calculate(zero).bUnit,null);
assert.equal(calc.calculate({...defaults,aRate:0,aExtras:0,aInternal:0}).aUnit,0);
for(const invalid of [{aHours:-1},{aRate:NaN},{aHeld:1.5},{bBookings:1.5},{bHeld:21},{aRate:Infinity},{aHours:1e308,aRate:1e308},{aHeld:Number.MAX_SAFE_INTEGER+1}])assert(!calc.validate({...defaults,...invalid}));
assert.equal(data.providers.length,12);assert.equal(new Set(data.providers.map(p=>p.provider)).size,12);assert.equal(data.historicalCheckedOn,'2026-07-24');
for(const p of data.providers){assert(p.checkedOn===g.updated);assert(new URL(p.source).protocol==='https:');assert(p.status in data.statusDefinitions);if(['unavailable','conflicting','quote-only'].includes(p.status))assert.equal(p.currentQuotes.length,0);}
for(const name of ['Cleverly','SaaS Leads','TargetFlow'])assert(data.providers.find(p=>p.provider===name).currentQuotes.every(q=>q.currency===null));
assert.equal(data.providers.find(p=>p.provider==='GTM Bud').currentQuotes[1].amount/3,500);
assert.equal(data.providers.find(p=>p.provider==='Sales Hype').currentQuotes[0].currency,'GBP');
assert.equal(require('../data/outbound-pricing-benchmark-2026.json').checkedOn,'2026-07-24');
for(const route of g.routes){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8'),locale=/^\/(es|ca|fr)\//.exec(route)?.[1]||'en',base=locale==='en'?route:route.slice(3),graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert(html.includes(`rel="canonical" href="${origin}${route}"`));assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert(graph.find(n=>n['@id']===origin+route+'#page').dateModified.startsWith(g.updated));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,route+': duplicate ID');
 for(const [,id]of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),route+': '+id);
 for(const l of ['en','es','ca','fr','x-default'])assert(html.includes(`hreflang="${l}"`));
 for(const q of graph.find(n=>n['@type']==='FAQPage')?.mainEntity||[])assert(html.includes(esc(q.name))&&html.includes(esc(q.acceptedAnswer.text)),route+': FAQ parity');
 if(base===g.call){assert.equal((html.match(/data-quote-input=/g)||[]).length,10);assert.equal((html.match(/data-quote-output=/g)||[]).length,4);assert(html.includes(esc(quote.copy[locale].privacy)));assert(html.includes(esc(quote.copy[locale].currencyNote)));assert(html.includes('<noscript>'));assert.equal((html.match(/call-center-quote-calculator\.js/g)||[]).length,1);assert(html.includes(esc(g.callCopy[locale].title)));}
 if(base===g.research){assert.equal((html.match(/data-recheck-provider=/g)||[]).length,12);assert.equal((html.match(/rel="nofollow">/g)||[]).length,39);assert(html.includes('data-historical-snapshot'));assert.equal(graph.filter(n=>n['@type']==='Dataset').length,2);assert.equal(graph.find(n=>n['@type']==='Dataset').dateModified,'2026-07-24');assert(html.includes(esc(g.ui[locale].history)));}
 if(base===g.shortlist){assert(html.includes('data-provider-review'));const firstTable=html.match(/<table>([\s\S]*?)<\/table>/)[1];assert.equal((firstTable.match(/<thead>[\s\S]*?<\/thead>/)[0].match(/<th>/g)||[]).length,3);assert.equal((firstTable.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].match(/<tr>/g)||[]).length,10);for(const [name,url,copy]of g.providers){assert(html.includes(`href="${esc(url)}">${esc(name)}</a>`));assert(html.includes(esc(copy[['en','es','ca','fr'].indexOf(locale)])));}}
 if(base===g.sdr){assert(/1(?:[,.]|\s)500 USD/.test(html));assert(!html.includes('transparent flat or hybrid pricing'));}
}
const review=require('../data/sdr-provider-review-2026-10-15.json');assert.equal(review.providers.length,10);
console.log('Broad SEO QA passed: 17 page boundaries, 12 dated pricing sources, historical dates, 10 sourced provider summaries, calculator edge cases, FAQ parity and localization.');
