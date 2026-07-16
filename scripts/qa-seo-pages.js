const fs = require("fs");
const path = require("path");
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "seo-pages.json"), "utf8"));
const failures = [];
const seenTitles = new Set();

for (const page of pages) {
  const file = path.join(__dirname, "..", page.path.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) { failures.push(`${page.path}: missing output`); continue; }
  const html = fs.readFileSync(file, "utf8");
  if (seenTitles.has(page.title)) failures.push(`${page.path}: duplicate title`);
  seenTitles.add(page.title);
  for (const required of ["<h1>", "rel=\"canonical\"", "application/ld+json", "class=\"answer\"", "class=\"breadcrumbs\"", "class=\"reading-progress\"", "class=\"mobile-toc\"", "src=\"/seo.js\""]) {
    if (!html.includes(required)) failures.push(`${page.path}: missing ${required}`);
  }
  if ((html.match(/<section /g) || []).length < 5) failures.push(`${page.path}: fewer than five substantive sections`);
  if ((html.match(/class="inline-cta"/g) || []).length < 2) failures.push(`${page.path}: fewer than two contextual inline CTAs`);
  if ((html.match(/calendly\.com\/noahlevybuilds\/30min/g) || []).length < 5) failures.push(`${page.path}: insufficient booking CTA coverage`);
  if (!html.includes("class=\"original-tool")) failures.push(`${page.path}: missing original page utility`);
  if (!html.includes("class=\"competitive-depth\"")) failures.push(`${page.path}: missing buyer decision depth`);
  if ((html.match(/<table>/g) || []).length < (page.path === "/about/noah-levy/" ? 0 : 1)) failures.push(`${page.path}: missing decision table`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`SEO QA passed for ${pages.length} pages.`);
