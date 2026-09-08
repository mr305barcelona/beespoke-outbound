const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pages = require(path.join(root, "data", "seo-pages.json"));
const locales = ["es", "ca", "fr"];
const inboundPaths = [
  "/services/b2b-ppc-agency/",
  "/services/b2b-seo-agency/",
  "/services/generative-engine-optimization/"
];
const ignoredKeys = new Set(["path", "href", "sourceChecked", "id", "related"]);
const failures = [];

function inspectLocalization(source, localized, trail) {
  if (typeof source === "string") {
    if (/^(?:https?:\/\/|\/)/.test(source)) return;
    if (typeof localized !== "string" || !localized.trim()) {
      failures.push(`${trail}: missing reviewed translation`);
    }
    return;
  }
  if (Array.isArray(source)) {
    if (!Array.isArray(localized) || source.length !== localized.length) {
      failures.push(`${trail}: translated array does not match source length`);
      return;
    }
    source.forEach((value, index) => inspectLocalization(value, localized[index], `${trail}[${index}]`));
    return;
  }
  if (!source || typeof source !== "object") return;
  if (!localized || typeof localized !== "object") {
    failures.push(`${trail}: missing translated object`);
    return;
  }
  for (const [key, value] of Object.entries(source)) {
    if (ignoredKeys.has(key)) continue;
    if (!Object.prototype.hasOwnProperty.call(localized, key)) {
      failures.push(`${trail}.${key}: missing reviewed translation`);
      continue;
    }
    inspectLocalization(value, localized[key], `${trail}.${key}`);
  }
}

for (const locale of locales) {
  const translations = require(path.join(root, "data", `seo-inbound-localizations.${locale}.json`));
  for (const pagePath of inboundPaths) {
    const page = pages.find((candidate) => candidate.path === pagePath);
    const localized = translations[pagePath];
    if (!page || !localized) {
      failures.push(`${locale}${pagePath}: source or reviewed translation missing`);
      continue;
    }
    inspectLocalization(page, localized, `${locale}${pagePath}`);

    const outputPath = path.join(root, locale, pagePath.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(outputPath)) {
      failures.push(`${locale}${pagePath}: rendered page missing`);
      continue;
    }
    const html = fs.readFileSync(outputPath, "utf8");
    for (const copy of [localized.title, localized.h1, localized.answer, ...localized.sections.map((section) => section.heading)]) {
      const escaped = copy.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      if (!html.includes(escaped)) failures.push(`${locale}${pagePath}: rendered translation missing '${copy}'`);
    }
    for (const required of [
      `<html lang="${locale}">`,
      `rel="canonical" href="https://outbound-lead-generation.com/${locale}${pagePath}"`,
      "class=\"reading-progress\"",
      "class=\"mobile-toc\"",
      "class=\"toc\"",
      "class=\"original-tool",
      "class=\"competitive-depth\"",
      "href=\"/favicon.png\"",
      "href=\"/apple-touch-icon.png\"",
      "id=\"sources\""
    ]) {
      if (!html.includes(required)) failures.push(`${locale}${pagePath}: missing ${required}`);
    }
    for (const hreflang of ["en", "es", "ca", "fr", "x-default"]) {
      if ((html.match(new RegExp(`hreflang="${hreflang}"`, "g")) || []).length !== 1) {
        failures.push(`${locale}${pagePath}: invalid ${hreflang} alternate count`);
      }
    }
    if ((html.match(/class="inline-cta"/g) || []).length < 2) failures.push(`${locale}${pagePath}: fewer than two contextual CTAs`);
    if ((html.match(/calendly\.com\/noahlevybuilds\/30min/g) || []).length < 5) failures.push(`${locale}${pagePath}: insufficient booking CTA coverage`);
    if (html.includes(page.h1)) failures.push(`${locale}${pagePath}: English H1 leaked into localized page`);
    if (/Niagara Networks|niagaranetworks|NiagaraNetworks/i.test(html)) failures.push(`${locale}${pagePath}: private client identity leaked`);
  }
}

for (const pagePath of inboundPaths) {
  const page = pages.find((candidate) => candidate.path === pagePath);
  const source = JSON.stringify(page);
  if (/Niagara Networks|niagaranetworks|NiagaraNetworks/i.test(source)) failures.push(`${pagePath}: private client identity appears in source copy`);
  const html = fs.readFileSync(path.join(root, pagePath.replace(/^\//, ""), "index.html"), "utf8");
  if (/Niagara Networks|niagaranetworks|NiagaraNetworks/i.test(html)) failures.push(`${pagePath}: private client identity appears in output`);
  for (const required of ["rel=\"canonical\"", "application/ld+json", "class=\"reading-progress\"", "class=\"mobile-toc\"", "href=\"/favicon.png\"", "id=\"sources\""]) {
    if (!html.includes(required)) failures.push(`${pagePath}: missing ${required}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Inbound SEO QA passed for ${inboundPaths.length} pages across English and ${locales.length} reviewed translations.`);
