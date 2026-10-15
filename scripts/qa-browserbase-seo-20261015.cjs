// Connects only to a user-authorized remote Browserbase session. No local browser.
// Local public-file responses create an isolated preview; analytics is blocked.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const readline = require('node:readline');
const {chromium} = process.env.CODEX_NODE_MODULES ? require(path.join(process.env.CODEX_NODE_MODULES,'playwright')) : require('playwright');
const root = path.resolve(__dirname,'..');
const origin = 'https://outbound-lead-generation.com';
const output = path.join(root,'outputs/seo-audit-2026-10-15');
const basePath = '/compare/lead-generation-agency-vs-software/';
const publicFiles = new Set(['seo.js','seo.css','software-agency-calculator.js','favicon.png','apple-touch-icon.png','book/index.html','booking-confirmed/index.html',...['','es/','ca/','fr/'].map(l=>`${l}${basePath.slice(1)}index.html`)]);
if(process.stdin.isTTY)require('node:child_process').execFileSync('/bin/stty',['-echo'],{stdio:'inherit'});
const input = readline.createInterface({input:process.stdin,terminal:false});
process.stdout.write('{"ready":true}\n');
(async()=>{
  const line = await new Promise(resolve=>input.once('line',resolve));input.close();
  const connection = JSON.parse(line).cdpUrl;
  const u = new URL(connection);assert.equal(u.protocol,'wss:');assert(u.hostname.endsWith('.browserbase.com'));
  const browser = await chromium.connectOverCDP(connection);
  const context = browser.contexts()[0];
  let thirdPartyAllowed = false;
  const blocked = new Set();
  await context.route('**/*',async route=>{
    const url = new URL(route.request().url());
    if(url.origin===origin) {
      let relative = url.pathname.slice(1);if(relative.endsWith('/'))relative+='index.html';
      if(!publicFiles.has(relative))return route.abort();
      const ext=path.extname(relative);const contentType={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png'}[ext];
      return route.fulfill({status:200,contentType,body:fs.readFileSync(path.join(root,relative)),headers:{'Cache-Control':'no-store'}});
    }
    const analyticsRequest=/googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|googleadservices\.com/.test(url.hostname)||/\/(?:g\/|j\/)?collect\/?$/.test(url.pathname);
    if(thirdPartyAllowed && !analyticsRequest)return route.continue();
    blocked.add(url.hostname);return route.abort();
  });
  const page = context.pages()[0] || await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const results=[];
  for(const width of (process.argv.includes('--booking-only') ? [] : [390,768,1440]))for(const locale of ['en','es','ca','fr']) {
    await page.setViewportSize({width,height:844});
    const pathname=(locale==='en'?'':`/${locale}`)+basePath;
    await page.goto(origin+pathname,{waitUntil:'domcontentloaded'});
    const calc=page.locator('[data-software-agency-calculator]');await calc.waitFor();
    await assert.doesNotReject(()=>page.waitForFunction(()=>document.querySelector('[data-comparison-output="softwareTotal"]').textContent!=='—'));
    const facts=await page.evaluate(()=>({lang:document.documentElement.lang,title:document.title,canonical:document.querySelector('link[rel=canonical]').href,overflow:document.documentElement.scrollWidth-innerWidth,inputs:[...document.querySelectorAll('[data-comparison-input]')].map(e=>({id:e.id,label:document.querySelector(`label[for="${e.id}"]`)?.textContent.trim()})),outputs:[...document.querySelectorAll('[data-comparison-output]')].map(e=>e.textContent),links:[...document.querySelectorAll('a[href="#software-agency-calculator"]')].length}));
    assert.equal(facts.lang,locale);assert.equal(facts.canonical,origin+pathname);assert(facts.overflow<=2);assert.equal(facts.inputs.length,10);assert(facts.inputs.every(e=>e.label));assert.equal(facts.outputs[4],'18');assert(facts.links>=2);
    await calc.locator('[data-comparison-input="agencyOpportunities"]').fill('0');
    assert.equal(await calc.locator('[data-comparison-output="agencyUnit"]').innerText(),'—');
    await calc.locator('[data-comparison-input="agencyOpportunities"]').fill('18');
    await calc.locator('[data-comparison-input="agencyFee"]').fill('2000');
    assert.equal(await calc.locator('[data-comparison-output="agencyMatch"]').innerText(),'11');
    await calc.locator('[data-comparison-input="agencyOpportunities"]').fill('1.5');
    assert.equal(await calc.locator('[data-comparison-input="agencyOpportunities"]').getAttribute('aria-invalid'),'true');
    assert(await calc.locator('[data-comparison-error]').isVisible());
    assert.equal(await calc.locator('[data-comparison-output="agencyTotal"]').innerText(),'—');
    await calc.locator('[data-comparison-input="agencyOpportunities"]').fill('18');
    await calc.locator('[data-comparison-input="agencyFee"]').fill('4000');
    await calc.locator('[data-comparison-input="rate"]').fill('');
    assert(await calc.locator('[data-comparison-error]').isVisible());
    await calc.locator('[data-comparison-input="rate"]').fill('50');
    assert.equal(await calc.locator('[data-comparison-output="agencyMatch"]').innerText(),'18');
    if(width===390&&locale==='en')await calc.screenshot({path:path.join(output,'comparison-calculator-mobile-preview.png')});
    if(width===1440&&locale==='en')await calc.screenshot({path:path.join(output,'comparison-calculator-desktop-preview.png')});
    results.push({locale,width,canonical:facts.canonical,title:facts.title,overflow:facts.overflow,scenarios:'default, edited fee, zero opportunities, fractional count, blank input, recovery'});
    process.stdout.write(JSON.stringify({checked:{locale,width}})+'\n');
  }
  await page.setViewportSize({width:390,height:844});
  thirdPartyAllowed=true;
  await page.goto(origin+'/book/?cta=hero',{waitUntil:'domcontentloaded'});
  await page.locator('#calendly-embed iframe').waitFor({timeout:45000});
  if(process.argv.includes('--wait-for-calendar'))await page.frameLocator('#calendly-embed iframe').getByRole('table',{name:/Select a/}).waitFor({timeout:45000});
  const booking=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,fallback:{href:document.querySelector('[data-calendly-fallback]').href,top:document.querySelector('[data-calendly-fallback]').getBoundingClientRect().top,direct:document.querySelector('[data-calendly-fallback]').dataset.calendlyDirect},iframeTop:document.querySelector('#calendly-embed iframe').getBoundingClientRect().top,successHidden:document.querySelector('[data-booking-success]').hidden}));
  assert(booking.overflow<=2);assert(booking.fallback.top<600);assert.equal(booking.fallback.direct,'true');assert.equal(booking.successHidden,true);
  await page.screenshot({path:path.join(output,'mobile-booking-improved-preview.png'),fullPage:true});
  // Production analytics remains blocked. These synthetic events only exercise
  // the isolated preview, never Calendly scheduling or the GA4 collection API.
  const bookingId='00000000-0000-4000-8000-000000000001';
  const measurement=await page.evaluate(id=>{
    const leadCount=()=>window.dataLayer.filter(e=>e?.[0]==='event'&&e[1]==='generate_lead').length;
    const frame=document.querySelector('#calendly-embed iframe');
    const data={event:'calendly.event_scheduled',payload:{event:{uri:`https://api.calendly.com/scheduled_events/${id}`}}};
    window.dispatchEvent(new MessageEvent('message',{origin:'https://calendly.com',source:window,data}));
    const wrongFrame=leadCount();
    for(let i=0;i<2;i++)window.dispatchEvent(new MessageEvent('message',{origin:'https://calendly.com',source:frame.contentWindow,data}));
    return {wrongFrame,after:leadCount(),successVisible:!document.querySelector('[data-booking-success]').hidden};
  },bookingId);
  assert.equal(measurement.wrongFrame,0);assert.equal(measurement.after,1);assert(measurement.successVisible);
  await page.goto(origin+'/booking-confirmed/',{waitUntil:'domcontentloaded'});
  const confirmation=await page.evaluate(()=>({leads:window.dataLayer.filter(e=>e?.[0]==='event'&&e[1]==='generate_lead').length,heading:document.querySelector('h1').innerText}));
  assert.equal(confirmation.leads,0);assert.match(confirmation.heading,/Calendly/);
  assert.equal(errors.length,0,errors.join('\n'));
  const report={date:'2026-10-15',mode:'Remote Browserbase isolated preview using scoped local public files; no production deployment',results,booking,calendarReadiness:process.argv.includes('--wait-for-calendar')?'Loaded calendar checked':'Only iframe initialization checked; complete calendar UI remains a separate check',measurement,confirmation,errors,blockedDomains:[...blocked],realBookingsSubmitted:0,productionAnalyticsRequestsSent:0};
  const reportPath=path.join(output,process.argv.includes('--booking-only')?'implementation-booking-browserbase-qa.json':'implementation-browserbase-qa.json');
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  await page.goto('about:blank');await context.unroute('**/*');
  process.stdout.write(JSON.stringify({passed:true,checks:results.length,report:reportPath})+'\n');
  process.exit(0);
})().catch(e=>{process.stderr.write(String(e.message).replace(/wss?:\/\/\S+/g,'[remote connection]')+'\n');process.exit(1);});
