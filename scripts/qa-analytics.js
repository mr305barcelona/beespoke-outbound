const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pages = JSON.parse(fs.readFileSync(path.join(root, "data", "seo-pages.json"), "utf8"));
const publicPaths = [
  "/",
  ...pages.map((page) => page.path),
  ...["es", "ca", "fr"].flatMap((locale) => [
    `/${locale}/`,
    ...pages.map((page) => `/${locale}${page.path}`)
  ])
];
const failures = [];

const fileFor = (pagePath) => pagePath === "/"
  ? path.join(root, "index.html")
  : path.join(root, pagePath.replace(/^\//, ""), "index.html");

for (const pagePath of publicPaths) {
  const html = fs.readFileSync(fileFor(pagePath), "utf8");
  if ((html.match(/src="\/seo\.js\?v=20260814"/g) || []).length !== 1) failures.push(`${pagePath}: expected one versioned shared analytics script`);
  if ((html.match(/G-KDXYW9W2BB/g) || []).length !== 2) failures.push(`${pagePath}: GA4 measurement ID missing or duplicated`);
  if (/gtag\(['"]event['"]/.test(html)) failures.push(`${pagePath}: inline event tracking can duplicate shared tracking`);
}

const shared = fs.readFileSync(path.join(root, "seo.js"), "utf8");
for (const eventName of ["calendly_click", "whatsapp_click", "contact_intent"]) {
  if (!shared.includes(`track("${eventName}"`)) failures.push(`seo.js: missing ${eventName}`);
}
for (const token of ["beespoke-session-attribution-v1", "first_touch_source", "first_touch_landing_page", "ai-assistant", "enrichCalendlyLink", "utm_content"]) {
  if (!shared.includes(token)) failures.push(`seo.js: missing attribution control ${token}`);
}
if (shared.indexOf("enrichCalendlyLink(link, ctaLocation)") > shared.indexOf('track("calendly_click"')) failures.push("seo.js: Calendly attribution must be applied before the click is tracked");
if ((shared.match(/document\.addEventListener\("click"/g) || []).length > 3) failures.push("seo.js: unexpected duplicate delegated click handlers");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Analytics QA passed for ${publicPaths.length} public pages.`);
