const reviewedDateFor=require('./reviewed-publication').dateFor;
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const growth = require('../data/locale-growth-20261015');
const root = path.resolve(__dirname,'..');
const origin = 'https://outbound-lead-generation.com';
const esc = value => value.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
for(const [route,copy] of Object.entries(growth.pages)) {
  const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8').replace(/&#39;/g,"'");
  assert(html.includes(`<title>${esc(copy.title)}</title>`));
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  assert(html.includes(`<h1>${esc(copy.h1)}</h1>`));
  assert(html.includes(`<link rel="canonical" href="${origin}${route}">`));
  assert(!html.includes('name="robots" content="noindex'));
  for(const field of ['description','og:description','twitter:description']) {
    assert(html.includes(`${field}" content="${esc(copy.description)}"`),`${route}: ${field}`);
  }
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const page=graph.find(n=>n['@id']===origin+route+'#page');
  assert.equal(page.inLanguage,copy.locale); assert(page.dateModified.startsWith(reviewedDateFor(route,growth.updated)));
  assert.equal(graph.filter(n=>n['@type']==='FAQPage').length,1);
  const faq=graph.find(n=>n['@type']==='FAQPage');
  assert.equal(faq.mainEntity.length,copy.faqs.length);
  for(const item of faq.mainEntity) {
    assert(html.includes(`<summary>${esc(item.name)}</summary><p>${esc(item.acceptedAnswer.text)}</p>`),'FAQ must match visible copy');
  }
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${route}: duplicate IDs`);
  for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),`${route}: broken fragment ${id}`);
  for(const language of ['en','es','ca','fr','x-default'])assert(html.includes(`hreflang="${language}"`));
  assert(html.includes(reviewedDateFor(route,growth.updated)==='2026-10-20'?(copy.locale==='fr'?'20 octobre 2026':'20 de octubre de 2026'):(copy.locale==='fr'?'15 octobre 2026':'15 de octubre de 2026')));
  assert(!html.includes('Updated October'));
  // Full-pipeline byte stability is checked for this release; later owner/editorial layers intentionally follow growth.apply.
}
for(const [route,link] of Object.entries(growth.links)) {
  const html=fs.readFileSync(path.join(root,route,'index.html'),'utf8').replace(/&#39;/g,"'");
  const article=html.match(/<article>([\s\S]*?)<\/article>/)[1];
  assert(article.includes(`href="${link.href}"`));assert(article.includes(`id="${link.id}"`));
}
const fr=fs.readFileSync(path.join(root,'fr/services/outbound-lead-generation/index.html'),'utf8');
assert.equal((fr.match(/data-fit>/g)||[]).length,8);
for(const bad of ['outbound sortantes','quelles chaînes','Nommé opérateur principal','de le copy'])assert(!fr.includes(bad));
assert(fr.includes('1 500 USD par mois'));assert(fr.includes('sans frais par rendez-vous'));
const es=fs.readFileSync(path.join(root,'es/guides/appointment-setting-pricing/index.html'),'utf8');
assert(!es.includes('relances'));assert(es.includes('1.500 USD/mes'));
assert(es.includes('1.000 USD/mes'));
assert(es.includes('seis meses'));assert(es.includes('Sales Navigator se factura aparte'));
assert(es.includes('supuestos inventados en USD'));assert(es.includes('Se excluyen impuestos'));
assert(es.includes('puesta en marcha de cero'));assert(es.includes('queda indefinido; no es cero'));
assert.equal((2500+300+400)/10,320);assert.equal((20*200+300+400)/5,940);
assert.equal(Math.round((20*200+300+400)/12*100)/100,391.67);
assert.equal((2500+300+400)/4,800);
console.log('Locale-growth QA passed: translated metadata, FAQ parity, fragment targets, price scope, provider conditions and fictional budget arithmetic.');
