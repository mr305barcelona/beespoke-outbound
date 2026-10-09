const path=require('node:path');
const fs=require('node:fs');
const {chromium}=require(process.env.CODEX_NODE_MODULES?path.join(process.env.CODEX_NODE_MODULES,'playwright'):'playwright');
const pages=require('../data/seo-pages.json');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4175';
const priorities=['/guides/cold-email-agency/','/compare/lead-generation-agency-vs-software/','/services/b2b-lead-generation/','/services/linkedin-lead-generation/','/compare/lead-generation-agency-vs-in-house-team/','/guides/google-ads-management-cost/'];
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const failures=[];let checked=0;
 for(const width of [390,768,1440]) {
  const context=await browser.newContext({viewport:{width,height:1000}});
  // Never contaminate the owner's analytics or follow booking links in QA.
  await context.route('**/*',async r=>{
    const url=new URL(r.request().url());
    if(url.origin!==new URL(base).origin)return r.abort();
    if(process.env.QA_BASE_URL)return r.continue();
    // Render the exact static build without depending on a long-lived preview server.
    const name=decodeURIComponent(url.pathname);
    let file=path.join(__dirname,'..',name);
    if(!path.extname(file))file=path.join(file,'index.html');
    if(!fs.existsSync(file))return r.fulfill({status:404,body:'Missing build asset'});
    const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2'}[path.extname(file)];
    return r.fulfill({path:file,...(mime?{contentType:mime}:{})});
  });
  const jobs=(width===390?pages.map(p=>p.path):priorities).flatMap(p=>['en','es','ca','fr'].map(l=>({path:p,locale:l})));
  let cursor=0;
  await Promise.all(Array.from({length:2},async()=>{
   const page=await context.newPage();
   while(cursor<jobs.length){
    const job=jobs[cursor++]; const url=base+(job.locale==='en'?'':'/'+job.locale)+job.path;
    const errors=[];const handler=e=>errors.push(e.message);page.on('pageerror',handler);
    const response=await page.goto(url,{waitUntil:'load',timeout:60000});
    const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length,lang:document.documentElement.lang,broken:[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash.length>1&&!document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a=>a.hash)}));
    if(response.status()!==200||state.overflow>2||state.h1!==1||state.lang!==job.locale||state.broken.length||errors.length)failures.push({url,width,state,errors});
    if(job.locale==='en'&&width===1440&&job.path==='/guides/cold-email-agency/')await page.screenshot({path:'/tmp/beespoke-optimization-cold-email.png'});
    if(job.locale==='en'&&width===390&&job.path==='/compare/lead-generation-agency-vs-software/')await page.locator('article section').filter({hasText:'A fictional 90-day budget: software is not the whole cost'}).screenshot({path:'/tmp/beespoke-optimization-budget.png'});
    page.off('pageerror',handler);checked++;
   }
   await page.close();
  }));
  await context.close();
 }
 await browser.close();
 if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}
 console.log(`Optimization browser QA passed: ${checked} checks, all 200 SEO URLs on mobile plus 24 priority language versions on tablet and desktop.`);
})().catch(e=>{console.error(e);process.exit(1);});
