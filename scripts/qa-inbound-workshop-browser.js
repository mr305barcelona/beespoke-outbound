const path = require('node:path');
const { chromium } = require(process.env.CODEX_NODE_MODULES ? path.join(process.env.CODEX_NODE_MODULES,'playwright') : 'playwright');
const routes = [...Object.keys(require('../data/inbound-workshop').packs), '/guides/google-ads-management-cost/', '/compare/b2b-seo-vs-ppc/', '/guides/aeo-agency-pricing/'];
(async () => {
  const browser = await chromium.launch({ channel:'chrome', headless:true });
  const failures = [];
  for (const width of [390,768,1440]) {
    const context = await browser.newContext({viewport:{width,height:1000}});
    await context.route(/googletagmanager\.com/,route=>route.abort());
    for (const locale of ['en','es','ca','fr']) for (const route of routes) {
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      const url=`${process.env.QA_BASE_URL||'http://127.0.0.1:4173'}${locale==='en'?'':'/'+locale}${route}`;
      const response=await page.goto(url,{waitUntil:'networkidle'});
      const state=await page.evaluate(()=>({
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        lang:document.documentElement.lang,
        workshops:document.querySelectorAll('#worked-examples').length,
        padding:parseFloat(getComputedStyle(document.querySelector('#worked-examples')).paddingLeft),
        nav:document.querySelectorAll('.service-navigation a').length,
        h1:document.querySelectorAll('h1').length,
        broken:[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash),
        text:document.querySelector('#worked-examples').innerText
      }));
      if(response.status()!==200||state.overflow>2||state.padding<18||state.lang!==locale||state.workshops!==1||state.nav!==4||state.h1!==1||state.broken.length||errors.length) failures.push({url,width,state,errors});
      if(locale!=='en' && /Fictional worked example|Try your own assumptions|Provider source|Management fees for the same period|Inside the work/.test(state.text)) failures.push({url,reason:'English workshop copy leaked'});
      if(route.includes('/services/') && !/Fictional|ficticio|fictici|fictif/.test(state.text)) failures.push({url,reason:'Fictional disclosure missing'});
      const acquisition=page.locator('[data-inbound-calc="acquisition"]');
      if(await acquisition.count()) {
        const result=()=>acquisition.locator('[data-output]').allTextContents();
        if((await result()).some(value=>value==='—')) failures.push({url,reason:'Default calculations missing'});
        await acquisition.locator('[data-input="customers"]').fill('0');
        if((await result())[2]!=='—') failures.push({url,reason:'Zero customers must not show zero CAC'});
        await acquisition.locator('[data-input="opportunities"]').fill('41');
        if(!(await acquisition.locator('[data-error]').isVisible())||(await result()).some(value=>value!=='—')) failures.push({url,reason:'Invalid funnel accepted'});
        await acquisition.locator('[data-input="opportunities"]').fill('8');
        await acquisition.locator('[data-input="customers"]').fill('2');
        await acquisition.locator('[data-input="media"]').fill('-1');
        if(!(await acquisition.locator('[data-error]').isVisible())) failures.push({url,reason:'Negative input accepted'});
        await acquisition.locator('[data-input="media"]').fill('4000');
      }
      const fee=page.locator('[data-inbound-calc="fees"]');
      if(await fee.count()) {
        await fee.locator('[data-input="spend"]').fill('1000');
        const values=await fee.locator('[data-output]').allTextContents();
        // Percentage fee minimum = 750, setup = 600: 1000+750+600=2350.
        if(!values[1].replace(/[^0-9]/g,'').startsWith('2350')) failures.push({url,reason:'Minimum fee arithmetic',values});
        await fee.locator('[data-input="percent"]').fill('101');
        if(!(await fee.locator('[data-error]').isVisible())) failures.push({url,reason:'Percentage >100 accepted'});
        await fee.locator('[data-input="percent"]').fill('15');
      }
      const scope=page.locator('[data-inbound-calc="scope"]');
      if(await scope.count()) {
        await scope.locator('[data-input="hours"]').fill('39');
        if(!(await scope.locator('[data-error]').isVisible())) failures.push({url,reason:'Weekly minimum not protected'});
        await scope.locator('[data-input="hours"]').fill('40');
      }
      if(locale==='en'&&width===1440&&route.includes('b2b-ppc-agency')) await page.locator('#worked-examples').screenshot({path:'/tmp/beespoke-inbound-workshop.png'});
      if(locale==='en'&&width===390&&route.includes('google-ads-management-cost')) await acquisition.screenshot({path:'/tmp/beespoke-inbound-calculator-mobile.png'});
      await page.close();
    }
    await context.close();
  }
  if(!process.env.QA_BASE_URL) for(const width of [390,1440]) {
    const page=await browser.newPage({viewport:{width,height:1000}});
    await page.route(/googletagmanager\.com/,route=>route.abort());
    for(const route of ['/','/google-ads/','/seo-aeo/']) {
      await page.goto('http://127.0.0.1:4174'+route,{waitUntil:'networkidle'});
      const preview=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,tabs:document.querySelectorAll('.preview-channels a').length,noindex:document.querySelector('meta[name="robots"]')?.content,active:document.querySelectorAll('.preview-channels a[aria-current="page"]').length}));
      if(preview.overflow>2||preview.tabs!==3||preview.active!==1||preview.noindex!=='noindex,nofollow') failures.push({route,width,preview});
      if(route==='/') await page.screenshot({path:`/tmp/beespoke-channel-preview-${width}.png`});
    }
    await page.close();
  }
  await browser.close();
  if(failures.length) { console.error(JSON.stringify(failures,null,2));process.exit(1); }
  console.log('Inbound workshop QA passed: 24 URLs at 3 widths; fictional labels, local-language text, navigation, anchors, calculators and invalid-input protections.');
})().catch(error=>{console.error(error);process.exit(1);});
