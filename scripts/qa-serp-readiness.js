const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const pages = JSON.parse(fs.readFileSync(path.join(root, "data", "seo-pages.json"), "utf8"));
const benchmark = JSON.parse(fs.readFileSync(path.join(root, "data", "seo-serp-benchmark.json"), "utf8"));
const failures = [];

for (const page of pages) {
  const row = benchmark.find((item) => item.path === page.path);
  if (!row) { failures.push(`${page.path}: missing SERP benchmark`); continue; }
  if (row.competitors.length < 1) failures.push(`${page.path}: no competitor evidence`);
  if (row.serpRequirements.length < 6) failures.push(`${page.path}: incomplete SERP requirements`);
  if (row.beespokeAdvantages.length < 2) failures.push(`${page.path}: insufficient differentiation`);
  const html = fs.readFileSync(path.join(root, page.path.replace(/^\//, ""), "index.html"), "utf8");
  const required = page.path === '/guides/how-to-choose-an-outbound-lead-generation-agency/' ? ['data-evaluation','id="s-brief"','j-handoff','reading-progress','application/ld+json'] : page.path === '/guides/b2b-lead-generation-audit/' ? ['data-calculator','id="d-web"','j-handoff','reading-progress','application/ld+json'] : page.path === '/guides/account-based-prospecting/' ? ['data-register','id="a-cases"','j-handoff','reading-progress','application/ld+json'] : page.path === '/guides/b2b-sales-prospecting-plan/' ? ['data-planner','id="p-plan"','j-handoff','reading-progress','application/ld+json'] : ["/guides/b2b-cold-email-copywriting/", "/guides/cold-email-follow-up/", "/guides/linkedin-prospecting-messages/", "/industries/logistics-lead-generation/", "/guides/cold-email-agency/"].includes(page.path) ? ["data-workbook", (page.path === '/guides/cold-email-agency/' ? 'id="a-choice"' : page.path === '/industries/logistics-lead-generation/' ? 'id="g-fit"' : page.path === '/guides/cold-email-follow-up/' ? 'id="f-decision"' : page.path === '/guides/linkedin-prospecting-messages/' ? 'id="l-route"' : 'id="j-offer"'), "j-handoff", "reading-progress", "application/ld+json"] : ["original-tool", "competitive-depth", "inline-cta", "reading-progress", "application/ld+json"];
  for (const token of required) {
    if (!html.includes(token)) failures.push(`${page.path}: missing ${token}`);
  }
}

if (benchmark.length !== pages.length) failures.push("Benchmark/page count mismatch");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`SERP readiness QA passed for ${pages.length} pages against ${benchmark.reduce((sum, row) => sum + row.competitors.length, 0)} competitor references.`);
