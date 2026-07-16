const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const pages = require(path.join(root, "data", "seo-pages.json"));
const locales = ["es", "ca", "fr"];
const failures = [];

for (const locale of locales) {
  for (const page of pages) {
    const localizedPath = `/${locale}${page.path}`;
    const file = path.join(root, localizedPath.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(file)) { failures.push(`${localizedPath}: missing`); continue; }
    const html = fs.readFileSync(file, "utf8");
    const expectedCanonical = `https://outbound-lead-generation.com${localizedPath}`;
    if (!html.includes(`<html lang="${locale}">`)) failures.push(`${localizedPath}: wrong lang`);
    if (!html.includes(`rel="canonical" href="${expectedCanonical}"`)) failures.push(`${localizedPath}: wrong canonical`);
    for (const hreflang of ["en", "es", "ca", "fr", "x-default"]) {
      if ((html.match(new RegExp(`hreflang="${hreflang}"`, "g")) || []).length !== 1) failures.push(`${localizedPath}: invalid ${hreflang} alternate count`);
    }
    if (!html.includes(`lang="${locale}" aria-current="page"`)) failures.push(`${localizedPath}: language selector state missing`);
    if (!html.includes(`/${locale}/pricing/`) && page.path !== "/about/noah-levy/") failures.push(`${localizedPath}: localized internal links missing`);
    if (!html.includes("Noah Levy") || !html.includes("Beespoke")) failures.push(`${localizedPath}: proper noun altered`);
    for (const forbidden of ["Va dir abelles", "Sortida d'abelles", "Saliente a medida", "Beespoke sortant", "Noé Levy", "Noah Lévy", "generación-de-leads-salientes.com"]) {
      if (html.includes(forbidden)) failures.push(`${localizedPath}: bad translation '${forbidden}'`);
    }
  }
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const locale of locales) for (const page of pages) if (!sitemap.includes(`/${locale}${page.path}`)) failures.push(`sitemap missing /${locale}${page.path}`);

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Localized SEO QA passed for ${pages.length * locales.length} pages across ${locales.length} languages.`);
