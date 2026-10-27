const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),copy=require("../data/lead-generation-audit-copy-20261027"),{calculate}=require("../lead-generation-audit");
const example=calculate(["200","20","8","6","3"],"10");assert.equal(example.bookingRate,.04);assert.deepEqual(example.rates,[.1,.4,.75,.5]);assert.equal(example.needed,250);
assert.equal(calculate(["100","10","4","3","1"],"10").needed,250);
assert.equal(calculate(["0","0","0","0","0"],"10").needed,null);
assert.equal(calculate(["0","0","0","0","0"],"0").needed,0);
assert.equal(calculate(["100","10","0","0","0"],"3").needed,null);
for(const values of [["","","","",""],["1","2","0","0","0"],["1.5","1","1","0","0"],["Infinity","1","1","0","0"],["-1","0","0","0","0"],["1000000001","1","1","0","0"]])assert(calculate(values).error);
assert.equal(calculate(["1","1","1","1","1"],"-1").error,"invalid");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
for(const locale of ["en","es","ca","fr"]){
 const prefix=locale==="en"?"":"/"+locale,url="https://outbound-lead-generation.com"+prefix+copy.path,p=copy.page(locale),html=fs.readFileSync(path.join(root,(prefix+copy.path).slice(1),"index.html"),"utf8");
 const reviewed=[p.answer,...p.sections.flatMap(s=>[s.heading,...s.body,...(s.items||[]),...(s.table?.rows.flat()||[])]),...p.tool.blocks.flatMap(b=>[b.heading,b.body]),...p.decisionGuide.body,...p.decisionGuide.items,p.sourceMethodology];for(const text of reviewed)assert(html.includes(esc(text)),locale+": reviewed copy changed by a later editorial layer: "+text.slice(0,90));
 assert(html.includes("<h1>"+esc(p.h1)+"</h1>"));assert(html.includes('<link rel="canonical" href="'+url+'">'));
 for(const f of p.faqs){assert(html.includes(esc(f.question)));assert(html.includes(esc(f.answer)));}
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"],faq=graph.find(n=>n["@type"]==="FAQPage");assert.deepEqual(faq.mainEntity.map(n=>n.acceptedAnswer.text),p.faqs.map(f=>f.answer));assert.equal(graph.find(n=>n["@id"]===url+"#page").dateModified.slice(0,10),"2026-10-27");
 const ui=JSON.parse(html.match(/<script type="application\/json" id="audit-config">([\s\S]*?)<\/script>/)[1]);assert.deepEqual(ui,p.auditUi);
 const dateLabel={en:"Updated October 27, 2026",es:"Actualizado el 27 de octubre de 2026",ca:"Actualitzat el 27 d’octubre de 2026",fr:"Mis à jour le 27 octobre 2026"}[locale];assert(html.includes(dateLabel),locale+": date label must be localized");
 assert.equal((html.match(/data-audit-count/g)||[]).length,5);assert(html.includes('id="audit-privacy"'));assert(html.includes('data-audit-output hidden'));assert(html.includes('/lead-generation-audit.js?v='));
 assert(html.includes('href="'+prefix+'/resources/account-research-handoff-example/"'));
 const hub=fs.readFileSync(path.join(root,(prefix+"/resources/").slice(1),"index.html"),"utf8");assert(hub.includes('href="'+prefix+copy.path+'"'));assert(hub.includes(esc(p.h1)));
}
const runtime=fs.readFileSync(path.join(root,"lead-generation-audit.js"),"utf8");
assert(!/\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|gtag|dataLayer)\s*[.(]/.test(runtime),"Funnel input must not leave local arithmetic");
console.log("Audit guide QA: four complete locales, real FAQ/schema parity, cohort arithmetic, invalid/unknown/zero cases, discovery and local-only input handling.");
