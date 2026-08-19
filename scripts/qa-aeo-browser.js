const fs = require("fs");
const path = require("path");

const moduleRoot = process.env.CODEX_NODE_MODULES;
const { chromium } = moduleRoot
  ? require(path.join(moduleRoot, "playwright"))
  : require("playwright");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const output = process.env.QA_SCREENSHOT_DIR || "/tmp/beespoke-aeo-qa";
const paths = [
  "/ai-instructions/",
  "/guides/best-linkedin-lead-generation-agencies/",
  "/guides/outsourced-sdr-pros-and-cons/",
  "/guides/outbound-call-center-pricing/",
  "/guides/b2b-lead-generation-consultant-vs-agency/",
  "/compare/sdr-vs-bdr-outsourcing/"
];
const locales = ["", "/es", "/ca", "/fr"];
const viewports = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 820, height: 1180 },
  desktop: { width: 1440, height: 1000 }
};

fs.mkdirSync(output, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const failures = [];
  let checks = 0;

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport });
    await context.route(/googletagmanager\.com/, (route) => route.abort());
    for (const locale of locales) {
      for (const pagePath of paths) {
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error" && !message.text().includes("net::ERR_FAILED")) errors.push(message.text());
        });
        const urlPath = `${locale}${pagePath}`;
        const response = await page.goto(`${base}${urlPath}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(150);
        checks += 1;
        if (!response?.ok()) failures.push(`${viewportName} ${urlPath}: HTTP ${response?.status()}`);

        const result = await page.evaluate(({ viewportName }) => {
          const sectionLinks = [...document.querySelectorAll('.mobile-toc a[href^="#"], .toc a[href^="#"]')];
          const brokenSections = sectionLinks
            .map((link) => link.getAttribute("href"))
            .filter((href) => !document.querySelector(href));
          const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
          const header = document.querySelector(".site-header");
          const mobileToc = document.querySelector(".mobile-toc");
          const desktopToc = document.querySelector(".toc");
          return {
            lang: document.documentElement.lang,
            h1: document.querySelector("h1")?.textContent.trim(),
            ctas: document.querySelectorAll('a[href*="calendly.com"]').length,
            languages: document.querySelectorAll(".language-switcher a").length,
            brokenSections,
            overflow,
            headerPosition: header ? getComputedStyle(header).position : "missing",
            mobileTocDisplay: mobileToc ? getComputedStyle(mobileToc).display : "missing",
            desktopTocDisplay: desktopToc ? getComputedStyle(desktopToc).display : "missing",
            viewportName
          };
        }, { viewportName });

        if (!result.h1) failures.push(`${viewportName} ${urlPath}: empty H1`);
        if (result.ctas < 5) failures.push(`${viewportName} ${urlPath}: only ${result.ctas} booking CTAs`);
        if (result.languages !== 4) failures.push(`${viewportName} ${urlPath}: ${result.languages} language links`);
        if (result.brokenSections.length) failures.push(`${viewportName} ${urlPath}: broken section links ${result.brokenSections.join(", ")}`);
        if (result.overflow > 2) failures.push(`${viewportName} ${urlPath}: ${result.overflow}px horizontal overflow`);
        if (result.headerPosition !== "sticky") failures.push(`${viewportName} ${urlPath}: header is ${result.headerPosition}, not sticky`);
        if (viewportName === "mobile" && result.mobileTocDisplay === "none") failures.push(`${viewportName} ${urlPath}: mobile section navigator hidden`);
        if (viewportName === "desktop" && result.desktopTocDisplay === "none") failures.push(`${viewportName} ${urlPath}: desktop section navigator hidden`);

        if ((viewportName === "mobile" && ["", "/es"].includes(locale)) || (viewportName === "desktop" && ["", "/fr"].includes(locale))) {
          const slug = urlPath.replace(/^\//, "").replace(/\/$/, "").replace(/\//g, "-");
          await page.screenshot({ path: path.join(output, `${viewportName}-${slug}.png`), fullPage: false });
        }
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
        await page.waitForTimeout(100);
        const progress = await page.$eval(".reading-progress span", (element) => parseFloat(getComputedStyle(element).width));
        if (!(progress > 0)) failures.push(`${viewportName} ${urlPath}: reading progress did not advance`);
        if (errors.length) failures.push(`${viewportName} ${urlPath}: browser errors: ${errors.join(" | ")}`);
        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`Browser QA passed ${checks} page/viewport combinations. Screenshots: ${output}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
