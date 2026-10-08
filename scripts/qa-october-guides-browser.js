const path = require('path');
const { chromium } = require(process.env.CODEX_NODE_MODULES ? path.join(process.env.CODEX_NODE_MODULES, 'playwright') : 'playwright');
const routes = ['/guides/google-ads-management-cost/', '/compare/b2b-seo-vs-ppc/', '/guides/aeo-agency-pricing/'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [];
  for (const width of [390, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    await context.route(/googletagmanager\.com/, route => route.abort());
    for (const locale of ['', 'es', 'ca', 'fr']) {
      for (const route of routes) {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const url = `${process.env.QA_BASE_URL || 'http://127.0.0.1:4173'}${locale ? '/' + locale : ''}${route}`;
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        const result = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          lang: document.documentElement.lang,
          h1: document.querySelectorAll('h1').length,
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          links: [...document.querySelectorAll('a[href^="#"]')].map(a => a.hash).filter(hash => hash.length > 1 && !document.getElementById(decodeURIComponent(hash.slice(1)))),
          ctas: document.querySelectorAll('a[href*="calendly"],a[href*="/book/"]').length,
          text: document.body.innerText
        }));
        if (response.status() !== 200 || result.overflow > 2 || result.h1 !== 1 || result.lang !== (locale || 'en') || !result.canonical || result.links.length || result.ctas < 2 || errors.length) failures.push({url,width,result,errors});
        if (!locale && width === 1440 && route === routes[0]) await page.screenshot({path:'/tmp/beespoke-google-ads-guide.png'});
        await page.close();
      }
    }
    await context.close();
  }
  await browser.close();
  if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exit(1); }
  console.log('October guide browser QA passed: 12 localized pages at mobile, tablet and desktop widths; anchors, CTAs, canonical URLs and page scripts verified.');
})().catch(error => { console.error(error); process.exit(1); });
