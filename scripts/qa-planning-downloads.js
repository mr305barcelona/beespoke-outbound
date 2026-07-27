const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const locales = ["en", "es", "ca", "fr"];
const resources = [
  { path: "/downloads/beespoke-icp-scorecard/", controls: 13, marker: "data-total" },
  { path: "/downloads/beespoke-outbound-campaign-brief/", controls: 19, marker: "Launch gate" }
];
const failures = [];

for (const locale of locales) {
  for (const resource of resources) {
    const localized = locale === "en" ? resource.path : `/${locale}${resource.path}`;
    const file = path.join(root, localized.replace(/^\//, ""), "index.html");
    if (!fs.existsSync(file)) {
      failures.push(`${localized}: missing`);
      continue;
    }
    const html = fs.readFileSync(file, "utf8");
    for (const required of [`<html lang="${locale}">`, "noindex,follow", "rel=\"canonical\"", "hreflang=\"x-default\"", "property=\"og:image\"", "Print", "window.print()", "download", "sends no data"]) {
      if (locale !== "en" && ["Print", "sends no data"].includes(required)) continue;
      if (!html.includes(required)) failures.push(`${localized}: missing ${required}`);
    }
    for (const hreflang of locales) {
      if (!html.includes(`hreflang="${hreflang}"`)) failures.push(`${localized}: missing ${hreflang} alternate`);
    }
    const controls = (html.match(/<(?:input|textarea)\b/g) || []).length;
    if (controls < resource.controls) failures.push(`${localized}: too few usable controls (${controls})`);
    if (resource.path.includes("scorecard") && !html.includes(resource.marker)) failures.push(`${localized}: score calculation missing`);
    if (resource.path.includes("campaign-brief") && !/<div class="checklist">/.test(html)) failures.push(`${localized}: launch checklist missing`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Planning-download QA passed for 8 localized resources.");
