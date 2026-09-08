const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pages = require(path.join(root, "data", "seo-pages.json"));
const benchmark = require(path.join(root, "data", "outbound-pricing-benchmark-2026.json"));
const locales = ["", "es", "ca", "fr"];
const inboundPaths = [
  "/services/b2b-ppc-agency/",
  "/services/b2b-seo-agency/",
  "/services/generative-engine-optimization/"
];
const retiredOffer = /Hybrid Performance (?:Plan|costs)|Its Hybrid Performance plan|under the Hybrid Performance plan|hybrid plan (?:is|at) \$1,000|\$1,000 per month plus \$100|\$1,000 monthly hybrid plan|Beespoke.?s hybrid plan/i;

assert.equal(benchmark.offers.length, 39, "Benchmark should contain 39 current public offers");
assert(!benchmark.offers.some((offer) => offer.provider === "Beespoke" && /hybrid/i.test(offer.offer)), "Retired Beespoke hybrid offer remains in benchmark");
assert(!retiredOffer.test(JSON.stringify(pages)), "Retired Beespoke hybrid offer remains in source pages");

for (const locale of locales) {
  const prefix = locale ? `${locale}/` : "";
  const pricing = fs.readFileSync(path.join(root, prefix, "pricing/index.html"), "utf8");
  assert(!retiredOffer.test(pricing), `${locale || "en"} pricing page still exposes the retired offer`);
  assert(/1(?:[,.]|\s|&nbsp;| | )500/.test(pricing), `${locale || "en"} pricing page is missing the outbound price`);
  assert(/99/.test(pricing) && /10/.test(pricing), `${locale || "en"} pricing page is missing inbound price or weekly minimum`);

  for (const pagePath of inboundPaths) {
    const html = fs.readFileSync(path.join(root, prefix, pagePath.replace(/^\//, ""), "index.html"), "utf8");
    assert(!retiredOffer.test(html), `${locale || "en"}${pagePath} still exposes the retired offer`);
    assert(/99/.test(html) && /10/.test(html), `${locale || "en"}${pagePath} is missing inbound price or weekly minimum`);
  }
}

const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
assert(llms.includes("$1,500 USD per month; no per-meeting fee"), "llms.txt is missing the current outbound price");
assert(llms.includes("$99 USD per hour with a minimum commitment of 10 hours per week"), "llms.txt is missing the inbound price");
assert(!retiredOffer.test(llms), "llms.txt exposes the retired offer");

console.log("Pricing-facts QA passed across four languages, three inbound services, current benchmark data and llms.txt.");
