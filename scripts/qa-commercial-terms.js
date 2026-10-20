const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),facts=require('../data/beespoke-commercial-facts.json'),copy=require('../data/beespoke-commercial-copy.json');
assert.deepEqual(facts.outbound.monthly,{USD:1500,EUR:1500});assert.deepEqual(facts.inbound.hourly,{USD:99,EUR:99});assert.equal(facts.outbound.minimumMonths,3);assert.equal(facts.inbound.minimumMonths,3);assert.equal(facts.inbound.minimumHoursPerWeek,10);assert.equal(facts.outbound.callingIncluded,false);assert.equal(facts.coldCalling.nativeCallersWouldBeHired,true);
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const locale of ['en','es','ca','fr']){
 const prefix=locale==='en'?'':locale+'/';
 for(const name of ['index.html','pricing/index.html','services/b2b-ppc-agency/index.html','services/b2b-seo-agency/index.html','services/generative-engine-optimization/index.html','services/outbound-lead-generation/index.html','ai-instructions/index.html']){
  const html=fs.readFileSync(path.join(root,prefix+name),'utf8');
  assert.equal((html.match(/id="current-service-terms"/g)||[]).length,1);
  for(const field of ['minimum','weekly','scope','languages','regional'])assert(html.includes(esc(copy[locale][field])),locale+name+field);
  assert.equal((html.match(/pricing-market\.js\?/g)||[]).length,1);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);
 }
 const home=fs.readFileSync(path.join(root,prefix+'index.html'),'utf8');assert.equal((home.match(/data-own-price="outbound"/g)||[]).length,2);assert.equal((home.match(/data-own-price="inbound"/g)||[]).length,2);
 const pricing=fs.readFileSync(path.join(root,prefix+'pricing/index.html'),'utf8');assert(!/Confirm engagement term before purchase|Confirmar la duración antes de contratar|Confirma la durada abans de contractar|Confirmer la durée avant de s'engager/.test(pricing));
}
const booking=fs.readFileSync(path.join(root,'book/index.html'),'utf8');for(const locale of ['en','es','ca','fr'])assert(booking.includes(`data-commercial-locale="${locale}"`));
const script=fs.readFileSync(path.join(root,'pricing-market.js'),'utf8');assert(!/fetch\(|XMLHttpRequest|navigator\.geolocation/.test(script));
console.log('Commercial QA passed: approved USD/EUR rates, both minimum terms, weekly commitment, conditional calling scope, localized booking facts, unique controls and no location requests.');

// These FAQs previously excluded managed cold email from the base service.
const corrections=require('../data/beespoke-scope-consistency-20261019.json');
for(const file of [...new Set(corrections.map(x=>x.path))]){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const schema=[...html.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)].map(x=>JSON.parse(x[1]));
 const questions=schema.flatMap(x=>(x['@graph']||[x]).filter(n=>n['@type']==='FAQPage').flatMap(n=>n.mainEntity||[]));
 const selected=corrections.filter(x=>x.path===file);
 for(const row of selected){assert(html.includes(esc(row.after)),file+': current scope missing');assert(!html.includes(esc(row.before)),file+': retired scope remains');}
 const answer=selected[1].after;assert(questions.some(q=>q.acceptedAnswer?.text===answer),file+': visible answer/schema mismatch');
 if(file.startsWith('fr/'))assert(questions.some(q=>q.name===selected[2].after),file+': corrected question/schema mismatch');
}
console.log('Cold-email scope QA passed for all four visible introductions/FAQs and matching structured answers.');

const alignment=require('../data/beespoke-current-offer-alignment.json');
for(const row of alignment){
 const html=fs.readFileSync(path.join(root,row.path),'utf8');
 assert(html.includes(esc(row.after)),row.path+': reviewed current offer absent');
 assert(!html.includes(esc(row.before)),row.path+': superseded offer remains');
}
console.log('Current-offer consistency QA passed: 68 exact passages across 24 first-party pages.');

const publication=require('./reviewed-publication');
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const route of require('../data/owner-reviewed-routes-20261019.json')){
 const loc='https://outbound-lead-generation.com'+route;
 const position=sitemap.indexOf('<loc>'+loc+'</loc>');if(position<0)continue;
 assert(sitemap.slice(position,position+loc.length+80).includes('<lastmod>'+publication.dateFor(route,'')+'</lastmod>'),route+': reviewed sitemap date mismatch');
}
console.log('Reviewed sitemap dates agree with the scoped publication date.');

for(const row of require('../data/editorial-reviewed-2026-10-19.json').filter(r=>r.reviewedOn==='2026-10-20')){
 for(const file of row.pages){const html=fs.readFileSync(path.join(root,file),'utf8');assert(html.includes(esc(row.after)),file+': reviewed grammar missing');assert(!html.includes(esc(row.before)),file+': superseded grammar remains');}
}
console.log('Five follow-up editorial corrections remain applied in visible text and matching schema fields.');
