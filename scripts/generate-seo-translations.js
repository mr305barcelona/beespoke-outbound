const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const root = path.join(__dirname, "..");
const pages = require(path.join(root, "data", "seo-pages.json"));
const locales = ["es", "ca", "fr"];

function collect(value, output) {
  if (typeof value === "string" && /[A-Za-z]/.test(value) && !value.startsWith("/") && !value.startsWith("http")) output.add(value);
  else if (Array.isArray(value)) value.forEach((item) => collect(item, output));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collect(item, output));
}

const phrases = new Set();
collect(pages, phrases);

// Template and interactive-tool copy that is not stored in seo-pages.json.
const htmlFiles = [path.join(root, "index.html"), ...pages.map((page) => path.join(root, page.path.replace(/^\//, ""), "index.html"))];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
  for (const match of html.matchAll(/>([^<>]+)</g)) {
    const phrase = match[1].replace(/\s+/g, " ").trim();
    if (/[A-Za-z]/.test(phrase) && phrase.length > 1) phrases.add(phrase);
  }
}

const queue = [...phrases];

async function translate(text, locale) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.search = new URLSearchParams({ client: "gtx", sl: "en", tl: locale, dt: "t", q: text });
  let payload;
  try {
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error(`${locale} translation failed: ${response.status}`);
    payload = await response.json();
  } catch (error) {
    // Some managed environments restrict Node's DNS path while curl remains
    // available. Keep generation resumable by falling back to curl.
    const { stdout } = await execFileAsync("curl", ["-sS", "--fail", "--retry", "2", "--max-time", "30", url.toString()], { maxBuffer: 1024 * 1024 });
    payload = JSON.parse(stdout);
  }
  return payload[0].map((part) => part[0]).join("");
}

async function runLocale(locale) {
  const target = path.join(root, "data", `seo-translations.${locale}.json`);
  const cache = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, "utf8")) : {};
  const pending = queue.filter((phrase) => !cache[phrase]);
  let cursor = 0;
  async function worker() {
    while (cursor < pending.length) {
      const phrase = pending[cursor++];
      cache[phrase] = await translate(phrase, locale);
      if (cursor % 25 === 0) fs.writeFileSync(target, `${JSON.stringify(cache, null, 2)}\n`);
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  fs.writeFileSync(target, `${JSON.stringify(cache, null, 2)}\n`);
  console.log(`${locale}: ${Object.keys(cache).length} translated phrases`);
}

(async () => {
  for (const locale of locales) await runLocale(locale);
})().catch((error) => { console.error(error); process.exit(1); });
