// Remote Browserbase only. Reads public pages; preview serves scoped public files.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),readline=require('node:readline');
const {chromium}=process.env.CODEX_NODE_MODULES?require(path.join(process.env.CODEX_NODE_MODULES,'playwright')):require('playwright');
const growth=require('../data/locale-growth-20261015');
const root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com';
const live=process.argv.includes('--live'),output=path.join(root,'outputs/locale-growth-2026-10-15');
const routes=[...Object.keys(growth.pages),...Object.keys(growth.links)];
const files=new Set([...routes.map(p=>p.slice(1)+'index.html'),'seo.js','seo.css','favicon.png','apple-touch-icon.png']);
if(process.stdin.isTTY)require('node:child_process').execFileSync('/bin/stty',['-echo'],{stdio:'inherit'});
const input=readline.createInterface({input:process.stdin,terminal:false});process.stdout.write('{"ready":true}\n');
(async()=>{
  const line=await new Promise(resolve=>input.once('line',resolve));input.close();const url=JSON.parse(line).cdpUrl;
  const u=new URL(url);assert.equal(u.protocol,'wss:');assert(u.hostname.endsWith('.browserbase.com'));
  const browser=await chromium.connectOverCDP(url),context=browser.contexts()[0],page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.origin!==origin)return route.abort();
    if(live)return route.continue();
    let rel=u.pathname.slice(1);if(rel.endsWith('/'))rel+='index.html';
    if(!files.has(rel))return route.abort();
    return route.fulfill({status:200,contentType:{'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'}[path.extname(rel)],body:fs.readFileSync(path.join(root,rel)),headers:{'Cache-Control':'no-store'}});
  });
  const results=[];
  for(const width of [390,768,1440])for(const route of routes){
    await page.setViewportSize({width,height:844});
    const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
    await page.locator('article h2').first().waitFor();
    const facts=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,canonical:document.querySelector('link[rel=canonical]').href,overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelector('h1').textContent,broken:[...document.querySelectorAll('a[href^="#"]')].map(a=>a.hash.slice(1)).filter(id=>!document.getElementById(id)),tables:[...document.querySelectorAll('table')].map(t=>({caption:!!t.caption,headers:t.querySelectorAll('th').length})),cta:document.querySelector('.hero-actions .button').getAttribute('href')}));
    assert.equal(facts.canonical,origin+route);assert(facts.overflow<=2,`${route}: overflow ${facts.overflow}`);assert.equal(facts.broken.length,0);
    const config=growth.pages[route],link=growth.links[route];
    if(config){
      assert.equal(facts.title,config.title);assert.equal(facts.h1,config.h1);assert.equal(facts.lang,config.locale);
      assert(facts.tables.every(t=>t.caption&&t.headers));
      assert.match(facts.cta,/^(?:https:\/\/calendly.com\/noahlevybuilds\/30min|\/book\/)/);
      const summary=page.locator('.faqs summary').first();await summary.click();assert(await page.locator('.faqs details').first().getAttribute('open')!==null);
      if(config.locale==='fr'){
        await page.locator('[data-fit]').first().check();assert.match(await page.locator('[data-fit-score]').innerText(),/^1 sur 8/);
        await page.locator('[data-fit]').first().uncheck();assert.match(await page.locator('[data-fit-score]').innerText(),/^0 sur 8/);
      }
      const secondary=page.locator('.hero-actions .secondary');await secondary.click();assert(page.url().includes(config.secondary.href));
      if(width===390){await page.locator('header.hero').screenshot({path:path.join(output,config.locale+'-hero-'+(live?'live':'preview')+'.png')});await page.locator(config.locale==='es'?'#ejemplo-presupuesto':'#preparation-campagne').screenshot({path:path.join(output,config.locale+'-content-'+(live?'live':'preview')+'.png')});}
    }else assert(await page.locator(`#${link.id} a[href="${link.href}"]`).count()===1);
    if(width===390){await page.locator('.mobile-toc summary').click();assert(await page.locator('.mobile-toc nav').isVisible());}
    results.push({route,width,...facts});process.stdout.write(JSON.stringify({checked:{route,width}})+'\n');
  }
  assert.equal(errors.length,0,errors.join('\n'));await page.close();
  const report={date:growth.updated,mode:live?'Browserbase production':'Browserbase isolated preview',checks:results.length,results,errors,productionAnalyticsRequestsSent:0,realBookingsSubmitted:0};
  fs.writeFileSync(path.join(output,live?'browserbase-live-qa.json':'browserbase-preview-qa.json'),JSON.stringify(report,null,2)+'\n');
  process.stdout.write(JSON.stringify({passed:true,checks:results.length,mode:report.mode})+'\n');process.exit(0);
})().catch(e=>{process.stderr.write(String(e.message).replace(/wss?:\/\/\S+/g,'[remote connection]')+'\n');process.exit(1);});
