const fs = require("fs");
const path = require("path");
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "seo-pages.json"), "utf8"));
const failures = [];
const seenTitles = new Set();
const sitemap = fs.readFileSync(path.join(__dirname, "..", "sitemap.xml"), "utf8");

if (/proposal|microsite/i.test(sitemap)) failures.push("sitemap: private proposal or microsite URL detected");

for (const page of pages) {
  const file = path.join(__dirname, "..", page.path.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) { failures.push(`${page.path}: missing output`); continue; }
  const html = fs.readFileSync(file, "utf8");
  if (seenTitles.has(page.title)) failures.push(`${page.path}: duplicate title`);
  seenTitles.add(page.title);
  for (const required of ["<h1>", "rel=\"icon\"", "href=\"/favicon.png\"", "href=\"/apple-touch-icon.png\"", "rel=\"canonical\"", "application/ld+json", "class=\"answer\"", "class=\"breadcrumbs\"", "class=\"reading-progress\"", "class=\"mobile-toc\"", "class=\"skip-link\"", "<main id=\"main-content\"", "src=\"/seo.js?v=20260819\"", "property=\"og:image\"", "name=\"twitter:image\"", "summary_large_image"]) {
    if (!html.includes(required)) failures.push(`${page.path}: missing ${required}`);
  }
  if (/rel="icon"[^>]+href="data:/i.test(html)) failures.push(`${page.path}: favicon must use a stable crawlable URL`);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(match[1])) failures.push(`${page.path}: broken section link #${match[1]}`);
  }
  if ((html.match(/<section /g) || []).length < 5) failures.push(`${page.path}: fewer than five substantive sections`);
  if ((html.match(/class="inline-cta"/g) || []).length < 2) failures.push(`${page.path}: fewer than two contextual inline CTAs`);
  if ((html.match(/calendly\.com\/noahlevybuilds\/30min/g) || []).length < 5) failures.push(`${page.path}: insufficient booking CTA coverage`);
  if (!html.includes("class=\"original-tool")) failures.push(`${page.path}: missing original page utility`);
  if (!html.includes("class=\"competitive-depth\"")) failures.push(`${page.path}: missing buyer decision depth`);
  if ((html.match(/<table>/g) || []).length < (page.path === "/about/noah-levy/" ? 0 : 1)) failures.push(`${page.path}: missing decision table`);
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!jsonLd) continue;
  const graph = JSON.parse(jsonLd[1])["@graph"] || [];
  const pageNode = graph[0];
  const organization = graph.find((node) => Array.isArray(node["@type"]) && node["@type"].includes("Organization"));
  const person = graph.find((node) => node["@type"] === "Person");
  if (organization?.["@id"] !== "https://outbound-lead-generation.com/#organization" || organization.sameAs?.length < 2) failures.push(`${page.path}: incomplete shared organization entity`);
  if (person?.["@id"] !== "https://outbound-lead-generation.com/about/noah-levy/#person") failures.push(`${page.path}: incomplete shared founder entity`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(pageNode.dateModified || "")) failures.push(`${page.path}: dateModified is not an ISO 8601 DateTime with timezone`);
  if (page.path === "/about/noah-levy/") {
    if (pageNode["@type"] !== "ProfilePage") failures.push(`${page.path}: missing ProfilePage type`);
    if (pageNode.author) failures.push(`${page.path}: ProfilePage must not use unsupported author field`);
    if (pageNode.mainEntity?.["@type"] !== "Person" || !pageNode.mainEntity?.name) failures.push(`${page.path}: ProfilePage requires a named Person mainEntity`);
  }
  if (page.path === "/guides/outbound-lead-generation-cost/") {
    if (!html.includes("Is a $10,000 monthly outbound agency worth it?")) failures.push(`${page.path}: missing live-query decision section`);
    if (!html.includes("$10,000 monthly outbound retainer decision test")) failures.push(`${page.path}: missing $10k decision table`);
    if (!html.includes("How outbound agencies charge: retainer, pay per meeting, or hybrid")) failures.push(`${page.path}: missing live-query pricing-model section`);
    if (!page.title.toLowerCase().includes("how much do outbound agencies charge")) failures.push(`${page.path}: title does not address the leading query`);
    if (!html.includes("frequently-asked-questions") || !graph.some((node) => node["@type"] === "FAQPage")) failures.push(`${page.path}: FAQ content or schema missing`);
  }
  if (page.path === "/research/2026-b2b-outbound-pricing-benchmark/") {
    for (const required of ["40 public offers", "benchmark-table", "publisher-row", "Download source data (JSON)", "2026-outbound-pricing-benchmark-chart.svg", "2026-pricing-benchmark-og.png", "For writers and editors", "Request founder comment", "/downloads/beespoke-icp-scorecard/", "/downloads/beespoke-outbound-campaign-brief/", "Swipe or scroll sideways", "tabindex=\"0\"", "Email a pricing correction"]) {
      if (!html.includes(required)) failures.push(`${page.path}: missing research requirement ${required}`);
    }
    if ((html.match(/rel="nofollow">Source/g) || []).length !== 40) failures.push(`${page.path}: expected 40 row-level source links`);
    const datasetNode = graph.find((node) => node["@type"] === "Dataset");
    if (!datasetNode || datasetNode.distribution?.[0]?.encodingFormat !== "application/json") failures.push(`${page.path}: Dataset schema or JSON distribution missing`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`SEO QA passed for ${pages.length} pages.`);
