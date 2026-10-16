const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const assetUrl = require('./asset-version');
const root = path.resolve(__dirname, '..');
const origin = 'https://outbound-lead-generation.com';
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const sitemap = read('sitemap.xml');
const routes = [...sitemap.matchAll(/<loc>https:\/\/outbound-lead-generation\.com([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(routes).size, routes.length, 'Sitemap URLs must be unique');
for (const route of routes) {
  const html = read(route === '/' ? 'index.html' : route.slice(1)+'index.html');
  assert(html.includes(`src="${assetUrl('/seo.js')}"`), `${route}: stale shared behavior`);
  assert(html.includes(`href="${assetUrl('/technical.css')}"`), `${route}: missing technical style`);
  for (const match of html.matchAll(/\b(?:src|href)="(\/[^"?#]+\.(?:js|css))(\?[^"#]*)?"/g)) {
    assert.equal(match[1]+(match[2]||''), assetUrl(match[1]), `${route}: asset content version mismatch`);
  }
}
for (const locale of ['en','es','ca','fr']) {
  const prefix = locale==='en'?'':`/${locale}`, route = `${prefix}/resources/`, html = read(route.slice(1)+'index.html');
  assert(html.includes(`<link rel="canonical" href="${origin}${route}">`));
  assert.equal((html.match(/<h1[ >]/g)||[]).length, 1);
  assert.equal((html.match(/G-KDXYW9W2BB/g)||[]).length, 2, 'New hub retains the existing analytics configuration');
  for (const lang of ['en','es','ca','fr','x-default']) assert.equal((html.match(new RegExp(`hreflang="${lang}"`,'g'))||[]).length,1);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,new Set(ids).size);
  for(const m of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(m[1]),`Broken hub fragment ${m[1]}`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const list = schema['@graph'].find(n=>n['@type']==='ItemList');
  assert(list.itemListElement.length>20, 'Directory must expose useful existing routes');
  assert.equal(list.itemListElement.length,new Set(list.itemListElement.map(x=>x.url)).size);
  for(const item of list.itemListElement) {
    assert(!/pricing|cost|pay-per-meeting|best-|benchmark|agency-vs-software|b2b-seo-vs-ppc/.test(item.url), 'Held commercial subjects must stay out of new hub copy');
    assert(fs.existsSync(path.join(root,item.url.slice(origin.length+1),'index.html')));
    assert(html.includes(`href="${item.url.slice(origin.length)}"`));
  }
}
for(const image of JSON.parse(read('data/site-image-variants.json'))) {
  assert(fs.statSync(path.join(root,image.output)).size<fs.statSync(path.join(root,image.source)).size, 'A replacement must reduce bytes');
  assert(fs.existsSync(path.join(root,image.source)), 'Keep the original fallback');
}
for (const file of ['index.html','es/index.html','ca/index.html','fr/index.html']) {
  const html = read(file);
  assert(!html.includes('noah_levy_profile_picture-800.webp'), 'Retired candidate must not survive a rebuild');
  const founder = html.match(/<picture class="optimized-picture founder-picture">([\s\S]*?)<\/picture>/)?.[1];
  assert(founder?.includes('sizes="118px"'), `${file}: portrait sizes must match its layout`);
  for (const image of JSON.parse(read('data/site-image-variants.json'))) assert(html.includes(`/${image.output} ${image.width}w`), `${file}: missing current image candidate ${image.output}`);
}
console.log(`Technical QA passed: ${routes.length} public URLs, content versions, four resource hubs and smaller image variants.`);
require('./qa-research-example');
