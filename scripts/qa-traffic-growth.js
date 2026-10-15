const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const growth=require('../data/traffic-growth-20261015'),root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com';
const esc=s=>s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
for(const [route,copy] of Object.entries({...growth.english,...growth.spanish})){
 const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
 assert(html.includes(`<title>${esc(copy.title)}</title>`));assert(html.includes(`<h1>${esc(copy.h1)}</h1>`));
 assert.equal((html.match(/<h1>/g)||[]).length,1);assert(html.includes(`rel="canonical" href="${origin}${route}"`));
 for(const field of ['description','og:description','twitter:description'])assert(html.includes(`${field}" content="${esc(copy.description)}"`));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
 for(const [,id]of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),route+': '+id);
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert(graph.find(n=>n['@id']===origin+route+'#page').dateModified.startsWith(growth.updated));
 for(const q of graph.find(n=>n['@type']==='FAQPage').mainEntity)assert(html.includes(`<summary>${esc(q.name)}</summary><p>${esc(q.acceptedAnswer.text)}</p>`));
 for(const l of ['en','es','ca','fr','x-default'])assert(html.includes(`hreflang="${l}"`));
}
const cost=fs.readFileSync(path.join(root,'guides/outbound-lead-generation-cost/index.html'),'utf8');
assert(cost.includes('7,100 USD'));assert.equal(3*(1500+300+400)+500,7100);
assert(cost.includes('invented assumptions'));assert(cost.includes('not a contractual minimum'));assert(cost.includes('undefined'));
assert(cost.includes('$10,000 monthly outbound retainer decision test'));
const es=fs.readFileSync(path.join(root,'es/services/linkedin-lead-generation/index.html'),'utf8');
assert.equal((es.match(/data-risk>/g)||[]).length,8);assert(es.includes('1.500 USD al mes'));assert(es.includes('sin tarifa por reunión'));
for(const bad of ['Que esta incluido','Lógica de orientación','su cerrador','las materiales','Compre alcance'])assert(!es.includes(bad));
for(const locale of ['ca','fr','es'])for(const route of Object.keys(growth.english)){
 const html=fs.readFileSync(path.join(root,locale,route,'index.html'),'utf8');
 assert(!html.includes(growth.english[route].title),`${locale}${route}: English experiment leaked`);
 assert(!html.includes('id="first-90-day-budget"'));
}
console.log('Traffic-growth QA passed: scoped metadata, existing tools, translated boundaries, FAQ parity, anchors and fictional launch-budget arithmetic.');
