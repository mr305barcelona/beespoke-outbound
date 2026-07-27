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
const benchmarkSchemaExpectations = {
  es: { datasetName: "Benchmark de precios outbound B2B 2026", ogAlt: "Benchmark de precios outbound B2B 2026 de Beespoke", tableLabel: "Tabla comparativa de precios outbound con desplazamiento horizontal" },
  ca: { datasetName: "Benchmark de preus outbound B2B 2026", ogAlt: "Benchmark de preus outbound B2B 2026 de Beespoke", tableLabel: "Taula comparativa de preus outbound amb desplaçament horitzontal" },
  fr: { datasetName: "Benchmark 2026 des tarifs outbound B2B", ogAlt: "Benchmark 2026 des tarifs outbound B2B par Beespoke", tableLabel: "Tableau comparatif des tarifs outbound à défilement horizontal" }
};
const editorialClaimHeadings = {
  es: "Cómo clasificar una afirmación en este sitio",
  ca: "Com classificar una afirmació en aquest lloc",
  fr: "Comment qualifier une affirmation sur ce site"
};
const costModelHeadings = {
  es: "Cómo cobran las agencias outbound: cuota mensual, pago por reunión o modelo híbrido",
  ca: "Com cobren les agències outbound: quota mensual, pagament per reunió o model híbrid",
  fr: "Comment les agences de prospection facturent : forfait mensuel, paiement au rendez-vous ou modèle hybride"
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
    if (!html.includes('property="og:image"') || !html.includes('name="twitter:image"') || !html.includes('summary_large_image')) failures.push(`${localizedPath}: social preview metadata missing`);
    for (const forbidden of ["Va dir abelles", "Sortida d'abelles", "Saliente a medida", "Beespoke sortant", "Noé Levy", "Noah Lévy", "generación-de-leads-salientes.com"]) {
      if (html.includes(forbidden)) failures.push(`${localizedPath}: bad translation '${forbidden}'`);
    }
    for (const forbidden of editorialForbidden[locale]) {
      if (new RegExp(`\\b${escapeRegExp(forbidden)}\\b`, "i").test(html.replace(/<script[\s\S]*?<\/script>/g, ""))) failures.push(`${localizedPath}: literal translation '${forbidden}'`);
    }
    if (page.path === "/editorial-policy/" && !html.includes(editorialClaimHeadings[locale])) failures.push(`${localizedPath}: editorial claim terminology is incorrect`);
    if (page.path === "/guides/outbound-lead-generation-cost/" && !html.includes(costModelHeadings[locale])) failures.push(`${localizedPath}: live-query pricing heading is not localized`);
    if (page.path === "/research/2026-b2b-outbound-pricing-benchmark/") {
      for (const provider of ["Beespoke", "OutsourcedSDR", "BitWide", "Artemis Leads", "MarknTech", "Cleverly", "SaaS Leads", "Telesales.it", "GTM Bud", "Occura", "TargetFlow", "Sales Hype"]) {
        if (!html.includes(`<strong>${provider}</strong>`)) failures.push(`${localizedPath}: provider name altered (${provider})`);
      }
      if ((html.match(/rel="nofollow">/g) || []).length !== 40) failures.push(`${localizedPath}: row-level source count changed`);
      if (!html.includes(`/${locale}/downloads/beespoke-icp-scorecard/`) || !html.includes(`/${locale}/downloads/beespoke-outbound-campaign-brief/`)) failures.push(`${localizedPath}: localized planning assets missing`);
      const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
      const dataset = schema["@graph"].find((node) => node["@type"] === "Dataset");
      const breadcrumbs = schema["@graph"].find((node) => node["@type"] === "BreadcrumbList");
      const expected = benchmarkSchemaExpectations[locale];
      if (dataset?.name !== expected.datasetName || dataset?.measurementTechnique === "Manual collection from provider-controlled public pricing pages") failures.push(`${localizedPath}: Dataset schema not fully localized`);
      if (breadcrumbs?.itemListElement?.[0]?.item !== `https://outbound-lead-generation.com/${locale}/`) failures.push(`${localizedPath}: localized breadcrumb homepage missing`);
      if (!html.includes(`og:image:alt" content="${expected.ogAlt}"`)) failures.push(`${localizedPath}: localized social image alt missing`);
      if (!html.includes(`aria-label="${expected.tableLabel}"`)) failures.push(`${localizedPath}: localized table label missing`);
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
