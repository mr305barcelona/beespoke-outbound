const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const publicPages = [...sitemap.matchAll(/<loc>https:\/\/outbound-lead-generation\.com([^<]*)<\/loc>/g)]
  .map((match) => match[1]);
const planningPages = [
  "/downloads/beespoke-icp-scorecard/",
  "/downloads/beespoke-outbound-campaign-brief/",
  ...["es", "ca", "fr"].flatMap((locale) => [
    `/${locale}/downloads/beespoke-icp-scorecard/`,
    `/${locale}/downloads/beespoke-outbound-campaign-brief/`
  ])
];
const pages = [...new Set([...publicPages, ...planningPages])];
const failures = [];
let checkedReferences = 0;

function pageFile(pageUrl) {
  const clean = pageUrl.split(/[?#]/)[0];
  if (clean === "/") return path.join(root, "index.html");
  return path.join(root, clean.replace(/^\//, ""), clean.endsWith("/") ? "index.html" : "");
}

function targetFile(reference, sourceUrl) {
  const clean = reference.split(/[?#]/)[0];
  if (!clean) return null;
  if (/^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(clean)) return null;
  const sourceBase = sourceUrl.endsWith("/") ? sourceUrl : path.posix.dirname(sourceUrl);
  const resolvedUrl = clean.startsWith("/")
    ? clean
    : path.posix.resolve(sourceBase, clean);
  const local = path.join(root, resolvedUrl.replace(/^\//, ""));
  if (resolvedUrl.endsWith("/")) return path.join(local, "index.html");
  if (path.extname(local)) return local;
  return path.join(local, "index.html");
}

for (const pageUrl of pages) {
  const file = pageFile(pageUrl);
  if (!fs.existsSync(file)) {
    failures.push(`${pageUrl}: page file missing`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = targetFile(match[1], pageUrl);
    if (!target) continue;
    checkedReferences += 1;
    if (!fs.existsSync(target)) failures.push(`${pageUrl}: missing ${match[1]}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Internal-link QA passed for ${pages.length} pages and ${checkedReferences} local references.`);
