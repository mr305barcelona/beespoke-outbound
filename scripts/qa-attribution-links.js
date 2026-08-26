const fs = require("fs");
const path = require("path");

const rows = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "attribution-destinations.json"), "utf8"));
const failures = [];
const sources = new Set();

for (const row of rows) {
  if (!row.source || sources.has(row.source)) failures.push(`duplicate or missing source: ${row.source || "(blank)"}`);
  sources.add(row.source);
  let destination;
  try { destination = new URL(row.destination); }
  catch { failures.push(`${row.source}: invalid destination`); continue; }
  if (destination.origin !== "https://outbound-lead-generation.com") failures.push(`${row.source}: destination must use the canonical HTTPS origin`);
  if (row.strategy === "clean_referral") {
    if (destination.search) failures.push(`${row.source}: citation and expert-profile links must remain clean for canonical backlink consistency`);
  } else if (row.strategy === "utm") {
    if (destination.searchParams.get("utm_source") !== row.source.replace(/_company$/, "")) {
      if (!(row.source === "linkedin_company" && destination.searchParams.get("utm_source") === "linkedin")) failures.push(`${row.source}: UTM source does not match the source key`);
    }
    if (!destination.searchParams.get("utm_medium")) failures.push(`${row.source}: missing utm_medium`);
    if (!destination.searchParams.get("utm_campaign")) failures.push(`${row.source}: missing utm_campaign`);
    for (const [key, value] of destination.searchParams) {
      if (/\s/.test(value) || value !== value.toLowerCase()) failures.push(`${row.source}: ${key} must be lowercase snake_case without spaces`);
    }
  } else {
    failures.push(`${row.source}: strategy must be clean_referral or utm`);
  }
  try { new URL(row.profileUrl); }
  catch { failures.push(`${row.source}: invalid profile URL`); }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Attribution-link QA passed for ${rows.length} referral and campaign destinations.`);
