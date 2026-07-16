const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pages = JSON.parse(fs.readFileSync(path.join(root, "data", "seo-pages.json"), "utf8"));
const origin = "https://outbound-lead-generation.com";
const updated = "2026-07-16";

const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

function renderSection(section) {
  const paragraphs = (section.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const items = section.items ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
  const callout = section.callout ? `<aside class="callout">${escapeHtml(section.callout)}</aside>` : "";
  const links = section.links ? `<div class="text-links">${section.links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)} →</a>`).join("")}</div>` : "";
  const table = section.table ? `<div class="table-wrap"><table><caption>${escapeHtml(section.table.caption)}</caption><thead><tr>${section.table.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead><tbody>${section.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : "";
  return `<section id="${escapeHtml(section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}"><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${items}${table}${callout}${links}</section>`;
}

function labelFor(link) {
  const page = pages.find((candidate) => candidate.path === link);
  return page ? page.h1 : link.split("/").filter(Boolean).pop().replace(/-/g, " ");
}

function renderPage(page) {
  const url = `${origin}${page.path}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": page.path.startsWith("/services/") ? "Service" : page.path.startsWith("/about/") ? "ProfilePage" : "Article", "@id": `${url}#page`, url, name: page.h1, description: page.description, dateModified: updated, author: { "@type": "Person", name: "Noah Levy", url: `${origin}/about/noah-levy/` }, provider: { "@type": "ProfessionalService", name: "Beespoke Outbound Lead Generation", url: `${origin}/` } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` }, { "@type": "ListItem", position: 2, name: page.h1, item: url }] }
    ]
  };
  const toc = page.sections.map((section) => `<a href="#${escapeHtml(section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}">${escapeHtml(section.heading)}</a>`).join("");
  const related = page.related.map((link) => `<a class="related-card" href="${escapeHtml(link)}"><span>Related</span><strong>${escapeHtml(labelFor(link))}</strong></a>`).join("");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}"><link rel="stylesheet" href="/seo.css">
<meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Beespoke Outbound Lead Generation">
<meta name="twitter:card" content="summary"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
</head><body>
<header class="site-header"><nav><a class="brand" href="/"><span>B</span>Beespoke Outbound</a><div><a href="/services/outbound-lead-generation/">Services</a><a href="/case-studies/cybersecurity-linkedin-lead-generation/">Case studies</a><a href="/pricing/">Pricing</a><a class="nav-cta" href="https://calendly.com/noahlevybuilds/30min">Book a conversation</a></div></nav></header>
<main><div class="breadcrumbs"><a href="/">Home</a><span>/</span><span>${escapeHtml(page.eyebrow)}</span></div>
<header class="hero"><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p class="answer">${escapeHtml(page.answer)}</p><div class="hero-actions"><a class="button" href="https://calendly.com/noahlevybuilds/30min">Book a 30-minute fit call</a><a class="secondary" href="/pricing/">See transparent pricing</a></div><p class="meta">Written by <a href="/about/noah-levy/">Noah Levy</a> · Updated July 16, 2026</p></header>
<div class="article-grid"><aside class="toc"><strong>On this page</strong>${toc}</aside><article>${page.sections.map(renderSection).join("")}</article></div>
<section class="related"><p class="eyebrow">Continue researching</p><h2>Related Beespoke resources</h2><div class="related-grid">${related}</div></section>
<section class="final-cta"><h2>See whether focused outbound fits your market</h2><p>Bring your offer, target buyer and current pipeline. We will have a practical conversation about fit, constraints and the next sensible test.</p><a class="button" href="https://calendly.com/noahlevybuilds/30min">Book a conversation</a></section></main>
<footer>© 2026 Beespoke Outbound Lead Generation · Barcelona · <a href="/">outbound-lead-generation.com</a></footer>
</body></html>`;
}

for (const page of pages) {
  const output = path.join(root, page.path.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, renderPage(page));
}

const sitemapEntries = [{ path: "/", updated: "2026-07-16" }, ...pages.map((page) => ({ path: page.path, updated }))];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((entry) => `  <url><loc>${origin}${entry.path}</loc><lastmod>${entry.updated}</lastmod></url>`).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
console.log(`Built ${pages.length} SEO pages and ${sitemapEntries.length} sitemap entries.`);
