const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const pages = require(path.join(root, "data", "seo-pages.json"));
const locales = ["es", "ca", "fr"];
const editorialForbidden = {
  es: ["saliente", "salida", "divulgación", "llamada de ajuste", "retenedor", "PCI", "PIC", "Noé Levy", "precios a medida"],
  ca: ["sortida", "sortides", "sortint", "divulgació", "trucada de fit", "retenedor", "PCI", "DEG", "Va dir abelles"],
  fr: ["sortant", "sortante", "sorties", "sensibilisation", "appel d'ajustement", "dispositif de retenue", "PCI", "DTS", "Noah Lévy"]
};
const failures = [];
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
    for (const forbidden of editorialForbidden[locale]) {
      if (new RegExp(`\\b${escapeRegExp(forbidden)}\\b`, "i").test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${localizedPath}: literal translation '${forbidden}'`);
    }
  }
  const homePath = `/${locale}/`;
  const homeHtml = fs.readFileSync(path.join(root, locale, "index.html"), "utf8");
  if (!homeHtml.includes(`<html lang="${locale}">`)) failures.push(`${homePath}: wrong homepage lang`);
  if (!homeHtml.includes(`rel="canonical" href="https://outbound-lead-generation.com/${locale}/"`)) failures.push(`${homePath}: wrong homepage canonical`);
  for (const hreflang of ["en", "es", "ca", "fr", "x-default"]) if ((homeHtml.match(new RegExp(`hreflang="${hreflang}"`, "g")) || []).length !== 1) failures.push(`${homePath}: invalid homepage ${hreflang}`);
  if (!homeHtml.includes(`lang="${locale}" aria-current="page"`)) failures.push(`${homePath}: homepage language selector missing`);
  if (!homeHtml.includes(`/${locale}/services/outbound-lead-generation/`)) failures.push(`${homePath}: localized homepage internal links missing`);
  if (!homeHtml.includes('src="/seo.js"')) failures.push(`${homePath}: homepage language behavior missing`);
  if (/src="(?!\/|https?:|data:)[^"]+"/.test(homeHtml)) failures.push(`${homePath}: homepage contains a relative asset URL`);
  if (!homeHtml.includes("Noah Levy") || !homeHtml.includes("Beespoke")) failures.push(`${homePath}: homepage proper noun altered`);
  for (const forbidden of editorialForbidden[locale]) if (new RegExp(`\\b${escapeRegExp(forbidden)}\\b`, "i").test(homeHtml.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${homePath}: homepage literal translation '${forbidden}'`);
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const locale of locales) for (const page of pages) if (!sitemap.includes(`/${locale}${page.path}`)) failures.push(`sitemap missing /${locale}${page.path}`);
for (const locale of locales) if (!sitemap.includes(`/${locale}/</loc>`)) failures.push(`sitemap missing /${locale}/`);

if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Localized SEO QA passed for ${pages.length * locales.length} pages across ${locales.length} languages.`);
