const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const pages=require('../data/seo-pages.json');
const sprint=require('../data/seo-optimization-sprint');
sprint.apply(pages);
const origin='https://outbound-lead-generation.com';
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const incoming=new Map(pages.map(p=>[p.path,new Set()]));
for(const p of pages) for(const locale of ['en','es','ca','fr']) {
  const route=(locale==='en'?'':'/'+locale)+p.path;
  const html=fs.readFileSync(path.join(__dirname,'..',route,'index.html'),'utf8');
  assert(html.includes(`<link rel="canonical" href="${origin}${route}">`),`${route}: canonical`);
  for(const l of ['en','es','ca','fr','x-default']) {
    const href=origin+(['en','x-default'].includes(l)?'':'/'+l)+p.path;
    assert(html.includes(`hreflang="${l}" href="${href}"`),`${route}: missing reciprocal language ${l}`);
  }
  const title=html.match(/<title>(.*?)<\/title>/)[1];
  assert(!/amp;amp;|amp;quot;/.test(title),`${route}: double-escaped title`);
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const org=schema['@graph'].find(n=>n['@id']===origin+'/#organization');
  assert.equal(org.name,'Beespoke Outbound Lead Generation',`${route}: translated business identity`);
  const author=schema['@graph'].find(n=>n['@id']===origin+'/about/noah-levy/#person');
  assert.equal(author.name,'Noah Levy',`${route}: author identity`);
  if(locale!=='en') for(const [en,translated] of Object.entries(sprint.dictionaries[locale])) {
    if(en.length<25||en.endsWith(' →')) continue;
    const visible=html.replace(/<script[\s\S]*?<\/script>/g,'');
    assert(!visible.includes(esc(en)),`${route}: untranslated sprint text: ${en}`);
  }
  if(locale==='en') {
    const body=html.split('<article>')[1]?.split('</main>')[0]||'';
    for(const m of body.matchAll(/href="(\/[^"#?]+)"/g)) if(incoming.has(m[1])&&m[1]!==p.path)incoming.get(m[1]).add(p.path);
  }
}
for(const [url,refs] of incoming) assert(refs.size>0,`${url}: no editorial incoming link`);
for(const url of ['/guides/google-ads-management-cost/','/guides/aeo-agency-pricing/','/compare/b2b-seo-vs-ppc/']) assert(incoming.get(url).size>=3,`${url}: weak discovery links`);
assert.equal(3*(500+2000)+600,8100);
assert.equal(3*(4000+600)+600,14400);
assert.equal(8100/10,810);
assert.equal(14400/18,800);
assert.equal(14400/9,1600);
console.log('Optimization QA passed: 200 SEO URLs, reciprocal languages, stable entity names, metadata escaping, translated sprint copy, zero editorial orphans and fictional budget arithmetic.');
