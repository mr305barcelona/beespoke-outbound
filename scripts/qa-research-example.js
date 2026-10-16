const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com',locales=['en','es','ca','fr'];
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const data=JSON.parse(read('data/research-handoff-example.json'));
const prefix=l=>l==='en'?'':`/${l}`;
const graph=html=>JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for(const l of locales){
 const route=prefix(l)+'/resources/account-research-handoff-example/',html=read(route.slice(1)+'index.html'),g=graph(html);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
 assert(html.includes(escape(data[l].notice)),'Fictional disclosure must stay visible in every language');
 assert.equal(g.find(x=>x['@type']==='WebPage').url,origin+route);
 assert(!g.some(x=>['Review','AggregateRating','Person','Service'].includes(x['@type'])),'A fictional example must not become company proof or a new service');
 for(const other of [...locales,'x-default'])assert(html.includes(`hreflang="${other}" href="${origin}${prefix(other==='x-default'?'en':other)}/resources/account-research-handoff-example/"`));
 for(const worksheet of ['beespoke-icp-scorecard','beespoke-outbound-campaign-brief'])assert(html.includes(`href="${prefix(l)}/downloads/${worksheet}/"`),'Keep worksheet handoff in the selected language');
 const hub=read((prefix(l)+'/resources/').slice(1)+'index.html');
 assert(hub.includes(`href="${route}"`),'The new resource must be discoverable');
 assert(!/calendly|mailto:|<form|<input|<textarea/i.test(html),'The example must not collect data or present a live outreach or booking action');
}
let count=0;
for(const p of JSON.parse(read('data/seo-pages.json')).filter(p=>p.path.startsWith('/services/')))for(const l of locales){
 const route=prefix(l)+p.path,g=graph(read(route.slice(1)+'index.html')),service=g.find(n=>n['@type']==='Service'),page=g.find(n=>n['@type']==='WebPage');
 assert(service&&page,'Separate the service from its document');
 assert.equal(page['@id'],origin+route+'#page');
 assert.equal(page.mainEntity['@id'],service['@id']);
 assert.equal(service.mainEntityOfPage['@id'],page['@id']);
 assert.equal(service.provider['@id'],origin+'/#organization');
 assert(g.some(n=>n['@id']===service.provider['@id']),'Provider reference must resolve within the graph');
 for(const key of ['author','dateModified','inLanguage','headline'])assert(!Object.hasOwn(service,key),`Document property ${key} must not sit on Service`);
 assert(page.dateModified&&page.author,'Preserve existing document metadata');
 count++;
}
console.log(`Research example and entity QA passed: four fictional localized resources and ${count} connected WebPage/Service graphs.`);
