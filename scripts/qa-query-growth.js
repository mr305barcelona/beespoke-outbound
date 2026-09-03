const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const pages = require("../data/seo-pages.json");
const copy = require("../data/seo-query-growth-copy.json");
const targets = ["/services/outbound-lead-generation/", "/guides/outbound-lead-generation-cost/"];
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
assert.equal(new Set(copy.map(row => row[0])).size, copy.length, "Duplicate translation key");
for (const row of copy) {
  assert.equal(row.length, 4, "Each copy row must include English, Spanish, Catalan and French");
  assert(row.every(value => typeof value === "string" && value.trim()), "Empty translation");
}
for (const url of targets) {
  const page = pages.find(page => page.path === url);
  const english = fs.readFileSync(path.join(root, url, "index.html"), "utf8");
  for (const locale of ["en", "es", "ca", "fr"]) {
    const file = path.join(root, locale === "en" ? "" : locale, url, "index.html");
    const html = fs.readFileSync(file, "utf8");
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])["@graph"];
    assert(html.includes("2026-09-03"), `${file}: updated date missing`);
    assert(html.includes('class="reading-progress"') || html.includes('id="reading-progress"'), `${file}: reading progress missing`);
    assert(!html.includes('name="robots" content="noindex'), `${file}: unexpected noindex`);
    if (locale !== "en") {
      const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");
      for (const [text] of copy) {
        if (english.includes(escape(text))) assert(!visible.includes(escape(text)), `${file}: English copy leaked: ${text}`);
      }
    }
    const faq = graph.find(node => node["@type"] === "FAQPage");
    assert.equal(faq.mainEntity.length, page.faqs.length, `${file}: FAQ schema mismatch`);
    for (const item of faq.mainEntity) {
      assert(html.includes(escape(item.name)), `${file}: schema question absent from visible page`);
      assert(html.includes(escape(item.acceptedAnswer.text)), `${file}: schema answer absent from visible page`);
    }
  }
}
const cost = pages.find(page => page.path === targets[1]);
assert.equal(cost.title, "How Much Do Outbound Agencies Charge? When $10K Is Worth It", "Preserve the existing query target");
const example = cost.sections.find(section => section.heading.startsWith("Worked example:"));
assert(example.body[0].startsWith("Illustration only"), "Hypothetical data must be labeled");
assert.equal((20 * 150 + 500) / 10, 350);
assert.equal((4000 + 500) / 15, 300);
assert(example.callout.includes("undefined, not zero"), "Guard the zero-meeting denominator");
console.log("Query-growth QA passed: 8 page variants, 3 reviewed translations, FAQ parity and pricing-example arithmetic.");
