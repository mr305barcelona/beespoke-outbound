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
  for (const required of ["<h1>", "rel=\"canonical\"", "application/ld+json", "class=\"answer\"", "class=\"breadcrumbs\""]) {
    if (!html.includes(required)) failures.push(`${page.path}: missing ${required}`);
  }
  if ((html.match(/<section /g) || []).length < 5) failures.push(`${page.path}: fewer than five substantive sections`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`SEO QA passed for ${pages.length} pages.`);
