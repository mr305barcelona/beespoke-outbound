// Only connects to an explicitly supplied remote Browserbase CDP endpoint.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),readline=require('node:readline'),crypto=require('node:crypto');
const {chromium}=process.env.CODEX_NODE_MODULES?require(path.join(process.env.CODEX_NODE_MODULES,'playwright')):require('playwright');
const growth=require('../data/broad-seo-20261015'),root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com',live=process.argv.includes('--live'),output=path.join(root,'outputs/broad-seo-audit-2026-10-15');
const assets=['seo.js','seo.css','favicon.png','apple-touch-icon.png','call-center-quote-calculator.js','call-center-quote-calculator.css','data/outbound-pricing-recheck-2026-10-15.json','data/sdr-provider-review-2026-10-15.json','assets/research/2026-outbound-pricing-benchmark-chart.svg','assets/social/2026-pricing-benchmark-og.png'];
const researchOnly=process.argv.includes('--research-only');
const routes=researchOnly?growth.routes.filter(p=>p.endsWith(growth.research)):growth.routes;
const files=new Set([...growth.routes.map(p=>p.slice(1)+'index.html'),...assets]);
if(process.stdin.isTTY)require('node:child_process').execFileSync('/bin/stty',['-echo'],{stdio:'inherit'});
const input=readline.createInterface({input:process.stdin,terminal:false});process.stdout.write('{"ready":true}\n');
(async()=>{
 const line=await new Promise(resolve=>input.once('line',resolve));input.close();const url=JSON.parse(line).cdpUrl,u=new URL(url);assert.equal(u.protocol,'wss:');assert(u.hostname.endsWith('.browserbase.com'));
 const browser=await chromium.connectOverCDP(url),context=browser.contexts()[0],page=await context.newPage(),errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==origin)return route.abort();if(live)return route.continue();let rel=u.pathname.slice(1);if(rel.endsWith('/'))rel+='index.html';if(!files.has(rel))return route.abort();return route.fulfill({status:200,contentType:{'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'}[path.extname(rel)],body:fs.readFileSync(path.join(root,rel)),headers:{'Cache-Control':'no-store'}});});
 const results=[];
 for(const width of [390,768,1440])for(const route of routes){
  await page.setViewportSize({width,height:844});const response=await page.goto(origin+route+(live?'?release=20261015-broad':''),{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);await page.locator('article h2').first().waitFor();
  const hash=crypto.createHash('sha256').update(await response.body()).digest('hex'),localHash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,route,'index.html'))).digest('hex');assert.equal(hash,localHash,route+': response differs from reviewed release');
  const facts=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,canonical:document.querySelector('link[rel=canonical]').href,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length,broken:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.hash.slice(1)).filter(id=>!document.getElementById(id)),cta:document.querySelector('.hero-actions .button').getAttribute('href')}));
  assert.equal(facts.canonical,origin+route);assert.equal(facts.h1,1);assert(facts.overflow<=2,`${route}: document overflow ${facts.overflow}`);assert.equal(facts.broken.length,0);assert.match(facts.cta,/^(?:https:\/\/calendly.com\/noahlevybuilds\/30min|\/book\/)/);
  const locale=/^\/(es|ca|fr)\//.exec(route)?.[1]||'en',base=locale==='en'?route:route.slice(3);assert.equal(facts.lang,locale);
  if(base===growth.call){
   await page.locator('[data-quote-output="aTotal"]').filter({hasText:/2[,.\s  ]?700/}).waitFor();
   const get=()=>page.locator('[data-quote-output]').allTextContents(),initial=await get();assert.equal(initial.length,4);assert(initial.every(t=>t!=='—'));
   assert.equal(await page.locator('[data-quote-error]').isVisible(),false);
   await page.locator('[data-quote-input="aHours"]').fill('100');assert.notEqual((await get())[0],initial[0]);
   await page.locator('[data-quote-input="aHeld"]').fill('0');assert.equal((await get())[1],'—');assert.equal(await page.locator('[data-quote-error]').isVisible(),false);
   await page.locator('[data-quote-input="bHeld"]').fill('21');assert(await page.locator('[data-quote-error]').isVisible());assert((await get()).every(t=>t==='—'));assert.equal(await page.locator('[data-quote-input="bHeld"]').getAttribute('aria-invalid'),'true');
   await page.locator('[data-quote-input="bHeld"]').fill('12');await page.locator('[data-quote-input="aHeld"]').fill('10');await page.locator('[data-quote-input="aHours"]').fill('80');
   await page.locator('[data-quote-input="aRate"]').fill('');assert(await page.locator('[data-quote-error]').isVisible());await page.locator('[data-quote-input="aRate"]').fill('-1');assert(await page.locator('[data-quote-error]').isVisible());await page.locator('[data-quote-input="aRate"]').fill('25');
   await page.locator('[data-quote-input="aHeld"]').fill('1.5');assert(await page.locator('[data-quote-error]').isVisible());await page.locator('[data-quote-input="aHeld"]').fill('10');
   await page.locator('[data-quote-currency]').selectOption('EUR');assert((await get())[0].includes('€'));assert((await get())[0].match(/2[,.\s  ]?700/));await page.locator('[data-quote-currency]').selectOption('USD');assert.deepEqual(await get(),initial);
   for(const id of await page.locator('[data-quote-input]').evaluateAll(els=>els.map(e=>e.id)))assert.equal(await page.locator(`label[for="${id}"]`).count(),1);
   await page.locator('.hero-actions .secondary').click();assert(page.url().includes('#call-center-quote-calculator'));
   if(width===390)await page.locator('#call-center-quote-calculator').screenshot({path:path.join(output,`${locale}-quote-${live?'live':'preview'}.png`)});
  }
  if(base===growth.research){assert.equal(await page.locator('[data-recheck-provider]').count(),12);assert.equal(await page.locator('[data-historical-snapshot]').count(),1);if(width===390)await page.locator('#october-source-recheck').screenshot({path:path.join(output,`${locale}-recheck-${live?'live':'preview'}.png`)});}
  if(base===growth.shortlist){assert.equal(await page.locator('article table').first().locator('tbody tr').count(),10);assert.equal(await page.locator('article table').first().locator('tbody th a').count(),10);}
  if(route===Object.keys(growth.french)[0]){await page.locator('.faqs summary').first().click();assert(await page.locator('.faqs details').first().getAttribute('open')!==null);if(width===390)await page.locator('header.hero').screenshot({path:path.join(output,`fr-sdr-hero-${live?'live':'preview'}.png`)});}
  if(width===390){await page.locator('.mobile-toc summary').click();assert(await page.locator('.mobile-toc nav').isVisible());}
  results.push({route,width,...facts,sha256:hash});process.stdout.write(JSON.stringify({checked:{route,width}})+'\n');
 }
 const assetResults=[];for(const file of ['call-center-quote-calculator.js','call-center-quote-calculator.css','data/outbound-pricing-recheck-2026-10-15.json','data/sdr-provider-review-2026-10-15.json','sitemap.xml']){if(!live)continue;const response=await page.goto(origin+'/'+file+'?release=20261015-broad',{waitUntil:'domcontentloaded'}),hash=crypto.createHash('sha256').update(await response.body()).digest('hex');assert.equal(response.status(),200);assert.equal(hash,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'));assetResults.push({file,status:response.status(),sha256:hash});}
 assert.equal(errors.length,0,errors.join('\n'));await page.close();const report={date:growth.updated,mode:live?'Browserbase production':'Browserbase isolated preview',checks:results.length,results,assets:assetResults,errors,externalRequestsBlocked:true,realBookingsSubmitted:0};fs.writeFileSync(path.join(output,live?'browserbase-live-qa.json':researchOnly?'browserbase-preview-research-qa.json':'browserbase-preview-qa.json'),JSON.stringify(report,null,2)+'\n');process.stdout.write(JSON.stringify({passed:true,checks:results.length,assetChecks:assetResults.length,mode:report.mode})+'\n');process.exit(0);
})().catch(e=>{process.stderr.write(String(e.message).replace(/wss?:\/\/\S+/g,'[remote connection]')+'\n');process.exit(1);});
