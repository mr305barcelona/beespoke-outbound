const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const origin = "https://outbound-lead-generation.com";
const pages = require(path.join(root, "data", "seo-pages.json"));
const locales = {
  es: { label: "Español", home: "Inicio" },
  ca: { label: "Català", home: "Inici" },
  fr: { label: "Français", home: "Accueil" }
};

const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const localizedPath = (locale, pathname) => `/${locale}${pathname === "/" ? "/" : pathname}`;

function languageLinks(pagePath, active) {
  const choices = [
    ["en", "English", pagePath],
    ...Object.entries(locales).map(([code, config]) => [code, config.label, localizedPath(code, pagePath)])
  ];
  return `<div class="language-switcher"><button type="button" aria-expanded="false" aria-label="Language">${active.toUpperCase()}</button><div>${choices.map(([code, label, href]) => `<a href="${href}" lang="${code}"${code === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</div></div>`;
}

function hreflang(pagePath) {
  return [
    `<link rel="alternate" hreflang="en" href="${origin}${pagePath}">`,
    ...Object.keys(locales).map((locale) => `<link rel="alternate" hreflang="${locale}" href="${origin}${localizedPath(locale, pagePath)}">`),
    `<link rel="alternate" hreflang="x-default" href="${origin}${pagePath}">`
  ].join("");
}

function translateText(text, dictionary) {
  const leading = text.match(/^\s*/)[0];
  const trailing = text.match(/\s*$/)[0];
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact || !/[A-Za-z]/.test(compact)) return text;
  return `${leading}${dictionary[compact] || compact}${trailing}`;
}

function localizeInternalLinks(html, locale) {
  const known = new Set(pages.map((page) => page.path));
  return html.replace(/href="(\/[^"#?]*)"/g, (full, href) => known.has(href) ? `href="${localizedPath(locale, href)}"` : full);
}

function localizeSchema(html, page, locale, dictionary) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (full, raw) => {
    const schema = JSON.parse(raw);
    const localizedUrl = `${origin}${localizedPath(locale, page.path)}`;
    for (const node of schema["@graph"] || []) {
      if (node.url) node.url = localizedUrl;
      if (node["@id"]) node["@id"] = `${localizedUrl}#page`;
      if (node.name) node.name = dictionary[node.name] || node.name;
      if (node.description) node.description = dictionary[node.description] || node.description;
      if (node.author?.url) node.author.url = `${origin}${localizedPath(locale, "/about/noah-levy/")}`;
      if (node.itemListElement) node.itemListElement.forEach((item) => {
        if (item.position === 1) item.name = locales[locale].home;
        if (item.position === 2) { item.name = dictionary[item.name] || item.name; item.item = localizedUrl; }
      });
    }
    return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
  });
}

function localizeHtml(source, page, locale, dictionary) {
  const localizedUrl = `${origin}${localizedPath(locale, page.path)}`;
  let html = source
    .replace(/<link rel="alternate"[^>]+>/g, "")
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${localizedUrl}">${hreflang(page.path)}`)
    .replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${localizedUrl}">`)
    .replace(/(<meta (?:name|property)="(?:description|og:title|og:description)" content=")([^"]+)(">)/g, (all, before, value, after) => `${before}${escapeHtml(dictionary[value] || value)}${after}`)
    .replace(/<title>([^<]+)<\/title>/, (all, value) => `<title>${escapeHtml(dictionary[value] || value)}</title>`);
  html = localizeSchema(html, page, locale, dictionary);
  html = html.replace(/(<script[\s\S]*?<\/script>|<[^>]+>|[^<]+)/gi, (token) => token.startsWith("<") ? token : translateText(token, dictionary));
  html = localizeInternalLinks(html, locale);
  html = html.replace(/<div class="language-switcher">[\s\S]*?<\/div><\/div>/, languageLinks(page.path, locale));
  const terminology = {
    es: [
      [/\| a medida/g, "| Beespoke"], [/Saliente a medida/g, "Beespoke Outbound"], [/Noé Levy/g, "Noah Levy"],
      [/Precios a medida/g, "Precios de Beespoke"], [/generación-de-leads-salientes\.com/g, "outbound-lead-generation.com"], [/\bHogar\b/g, "Inicio"],
      [/Generación de leads salientes/g, "Generación de leads outbound"], [/generación de leads salientes/g, "generación de leads outbound"],
      [/Generación de leads de salida/g, "Generación de leads outbound"], [/generación de leads de salida/g, "generación de leads outbound"],
      [/Salida B2B gestionada/g, "Outbound B2B gestionado"], [/campaña saliente/g, "campaña outbound"], [/salidas salientes/g, "outbound"],
      [/agencias emisoras/gi, "agencias de outbound"], [/agencia emisora/gi, "agencia de outbound"], [/sistema de salida/gi, "sistema outbound"], [/\bPIC\b/g, "ICP"]
    ],
    ca: [
      [/\| Va dir abelles/g, "| Beespoke"], [/Sortida d'abelles/g, "Beespoke Outbound"], [/Beesspoke/g, "Beespoke"], [/Preus Beespoke/g, "Preus de Beespoke"], [/\bCasa\b/g, "Inici"],
      [/Generació de leads de sortida/g, "Generació de leads outbound"], [/generació de leads de sortida/g, "generació de leads outbound"],
      [/Generació de contactes de sortida/g, "Generació de contactes outbound"], [/generació de contactes de sortida/g, "generació de contactes outbound"],
      [/Sortida B2B gestionada/g, "Outbound B2B gestionat"], [/campanya de sortida/g, "campanya outbound"],
      [/agències de sortida/gi, "agències d'outbound"], [/agència de sortida/gi, "agència d'outbound"], [/sistema de sortida/gi, "sistema outbound"]
    ],
    fr: [
      [/Beespoke sortant/g, "Beespoke Outbound"], [/Tarification sur mesure/g, "Tarifs Beespoke"], [/Noah Lévy/g, "Noah Levy"], [/Noé Levy/g, "Noah Levy"], [/\bMaison\b/g, "Accueil"],
      [/Génération de leads sortants/g, "Génération de leads outbound"], [/génération de leads sortants/g, "génération de leads outbound"],
      [/Gestion sortante B2B/g, "Prospection outbound B2B"], [/campagne sortante/g, "campagne outbound"],
      [/agences sortantes/gi, "agences outbound"], [/agence sortante/gi, "agence outbound"], [/système sortant/gi, "système outbound"]
    ]
  };
  for (const [pattern, replacement] of terminology[locale]) html = html.replace(pattern, replacement);
  return html;
}

for (const [locale] of Object.entries(locales)) {
  const dictionary = require(path.join(root, "data", `seo-translations.${locale}.json`));
  for (const page of pages) {
    const source = fs.readFileSync(path.join(root, page.path.replace(/^\//, ""), "index.html"), "utf8");
    const output = path.join(root, localizedPath(locale, page.path).replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, localizeHtml(source, page, locale, dictionary));
  }
}

console.log(`Built ${pages.length * Object.keys(locales).length} localized SEO pages.`);
