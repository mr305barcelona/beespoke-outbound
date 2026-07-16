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

function renderInlineCta(page, position) {
  const isPricing = page.path === "/pricing/" || page.path.includes("cost");
  const isCaseStudy = page.path.startsWith("/case-studies/");
  const heading = isPricing
    ? "Want to compare the numbers for your market?"
    : isCaseStudy
      ? "Could this approach fit your buyers?"
      : position === "middle"
        ? "Not sure whether outbound fits your offer?"
        : "Turn the framework into a focused campaign";
  const copy = isPricing
    ? "Bring your contract value, buyer, current pipeline and internal alternatives. We will help you identify the assumptions that actually change the economics."
    : isCaseStudy
      ? "We will look at your target accounts, proof, buying committee and reason for contact before recommending a campaign."
      : "A short fit call covers your ICP, offer, available proof and the smallest credible test—without pretending every market needs the same outbound system.";
  return `<aside class="inline-cta"><div><span>${position === "middle" ? "Practical next step" : "Apply this guide"}</span><h2>${heading}</h2><p>${copy}</p></div><a class="button" href="https://calendly.com/noahlevybuilds/30min">Book a 30-minute fit call</a></aside>`;
}

function renderOriginalTool(page) {
  if (page.path === "/pricing/" || page.path.includes("outbound-lead-generation-cost")) {
    return `<section class="original-tool calculator" id="outbound-cost-calculator"><div class="tool-heading"><span>Original planning tool</span><h2>Outbound break-even calculator</h2><p>Model the monthly economics using your assumptions. The result is a planning estimate, not a performance promise.</p></div><div class="calculator-grid"><label>Monthly program cost ($)<input data-calc="cost" type="number" min="0" value="1500"></label><label>Meetings held per month<input data-calc="meetings" type="number" min="0" value="6"></label><label>Meeting-to-opportunity rate (%)<input data-calc="oppRate" type="number" min="0" max="100" value="35"></label><label>Opportunity win rate (%)<input data-calc="winRate" type="number" min="0" max="100" value="20"></label><label>Average first-year revenue ($)<input data-calc="revenue" type="number" min="0" value="15000"></label><label>Gross margin (%)<input data-calc="margin" type="number" min="0" max="100" value="70"></label></div><div class="calculator-results" aria-live="polite"><div><span>Expected customers / month</span><strong data-result="customers">0.42</strong></div><div><span>Expected gross profit</span><strong data-result="profit">$4,410</strong></div><div><span>Modeled return on cost</span><strong data-result="roi">2.9×</strong></div><div><span>Meetings to break even</span><strong data-result="breakEven">2.0</strong></div></div><p class="tool-note">Change every input. A responsible buying decision should stress-test the pessimistic case, not only the expected case.</p></section>`;
  }
  if (page.path.includes("b2b-appointment-setting")) {
    return `<section class="original-tool checklist-tool" id="qualification-builder"><div class="tool-heading"><span>Original qualification tool</span><h2>Build a defensible meeting definition</h2><p>Select the conditions your provider must verify. The completed sentence becomes a starting point for your contract or campaign brief.</p></div><div class="check-grid">${["Matches the agreed company profile","Has an accepted role or buying responsibility","Is in an approved geography","Understands why the meeting was proposed","Shows explicit interest in a business conversation","Attends the scheduled meeting","Is not on the exclusion list","Meets any required timing or trigger condition"].map((item, i) => `<label><input type="checkbox" data-qualify ${i < 6 ? "checked" : ""}>${item}</label>`).join("")}</div><div class="tool-output"><span>Definition strength</span><strong data-qualification-score>6 of 8 conditions defined</strong><p data-qualification-copy>A qualified meeting matches the written company, role, geography, context, interest and attendance conditions.</p></div></section>`;
  }
  if (page.path.includes("linkedin-lead-generation")) {
    return `<section class="original-tool checklist-tool" id="linkedin-risk-check"><div class="tool-heading"><span>Platform-safety audit</span><h2>Check the campaign before it touches your profile</h2><p>LinkedIn says unauthorized software that scrapes data or automates activity is prohibited. Use this checklist to expose account and reputation risk before hiring a provider.</p></div><div class="check-grid">${["The provider names every tool that will access the profile","The account owner keeps credentials private","Targeting uses a written ICP, not scraped bulk data","Messages are reviewed by a human before launch","Daily activity is conservative and explainable","Opt-outs and negative replies are respected immediately","The contract identifies who carries account-restriction risk","The campaign can run without fake profiles or fake engagement"].map((item) => `<label><input type="checkbox" data-risk>${item}</label>`).join("")}</div><div class="tool-output"><span>Risk controls confirmed</span><strong data-risk-score>0 of 8</strong><p>Do not accept “our automation is safe” as a control. Ask what accesses the account and compare it with LinkedIn's current rules.</p></div><div class="source-links"><a href="https://www.linkedin.com/legal/user-agreement">LinkedIn User Agreement →</a><a href="https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions">LinkedIn prohibited software guidance →</a></div></section>`;
  }
  if (page.path.includes("outbound-lead-generation") && page.path.startsWith("/services/")) {
    return `<section class="original-tool checklist-tool" id="outbound-fit-score"><div class="tool-heading"><span>Two-minute fit check</span><h2>Is managed outbound appropriate yet?</h2><p>This is a readiness screen, not a sales qualification form. Check only what is already true today.</p></div><div class="check-grid">${["We can name a narrow company profile","We know the roles involved in buying","A typical customer supports hands-on acquisition","We have proof or a credible reason to be heard","Someone can run discovery and follow-up","The offer solves a specific costly problem","We can exclude companies that should not be contacted","We can support a 6–12 week learning window"].map((item) => `<label><input type="checkbox" data-fit>${item}</label>`).join("")}</div><div class="tool-output"><span>Readiness</span><strong data-fit-score>0 of 8 signals</strong><p data-fit-copy>Start by clarifying the buyer and problem before paying for campaign execution.</p></div></section>`;
  }
  if (page.path.startsWith("/case-studies/")) {
    return `<section class="original-tool evidence-method" id="evidence-method"><div class="tool-heading"><span>Evidence standard</span><h2>How to interpret this case study</h2><p>This page separates observed facts from inference and from guarantees.</p></div><div class="evidence-grid"><div><span>Observed</span><strong>Named audience and campaign outcomes</strong><p>Facts drawn from Beespoke's campaign work and presented at the level client confidentiality permits.</p></div><div><span>Interpretation</span><strong>Why the campaign may have worked</strong><p>Operational lessons are explicitly presented as Beespoke's interpretation, not controlled causal proof.</p></div><div><span>Not claimed</span><strong>A guaranteed result for another company</strong><p>Offer, proof, sender, market, timing and sales execution change outcomes.</p></div></div><p class="tool-note">Before publication, identifiable names, screenshots and private correspondence require permission or anonymization.</p></section>`;
  }
  return `<section class="original-tool evidence-method" id="working-principles"><div class="tool-heading"><span>Working standard</span><h2>What founder-led means in practice</h2></div><div class="evidence-grid"><div><span>Strategy</span><strong>Senior involvement</strong><p>Noah remains involved in ICP, positioning and campaign learning.</p></div><div><span>Execution</span><strong>Small accountable team</strong><p>The people doing the work remain close to replies and results.</p></div><div><span>Fit</span><strong>Permission to say no</strong><p>Beespoke will identify when outbound or its current channel scope is not appropriate.</p></div></div></section>`;
}

function renderSources(page) {
  const sourceMap = {
    "/guides/outbound-lead-generation-cost/": [
      ["Leadium appointment-setting pricing guide (2026)", "https://www.leadium.com/blog/appointment-setting-services"],
      ["Artemis Leads published outbound pricing", "https://www.artemisleads.com/pricing-b2b-outbound-lead-generation"],
      ["Division50 outbound service cost discussion", "https://division50.com/services/outbound"]
    ],
    "/services/linkedin-lead-generation/": [
      ["LinkedIn User Agreement", "https://www.linkedin.com/legal/user-agreement"],
      ["LinkedIn prohibited software and extensions", "https://www.linkedin.com/help/linkedin/answer/a1341387/prohibited-software-and-extensions"],
      ["Official Sales Navigator advanced-search guidance", "https://business.linkedin.com/sell/sales-navigator/how-to-use"]
    ]
  };
  const sources = sourceMap[page.path];
  if (!sources) return "";
  return `<section class="sources" id="sources"><h2>Sources and methodology</h2><p>Third-party prices and platform rules can change. These sources were checked on July 16, 2026. Provider-published prices describe their own offers and are used as market examples, not independent averages.</p><ol>${sources.map(([label, href]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`).join("")}</ol></section>`;
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
  const toolNav = page.path === "/pricing/" || page.path.includes("outbound-lead-generation-cost")
    ? ["outbound-cost-calculator", "Break-even calculator"]
    : page.path.includes("b2b-appointment-setting")
      ? ["qualification-builder", "Qualification builder"]
      : page.path.includes("linkedin-lead-generation")
        ? ["linkedin-risk-check", "LinkedIn risk audit"]
        : page.path.includes("outbound-lead-generation") && page.path.startsWith("/services/")
          ? ["outbound-fit-score", "Outbound fit check"]
          : page.path.startsWith("/case-studies/")
            ? ["evidence-method", "Evidence standard"]
            : ["working-principles", "Working principles"];
  const hasSources = page.path === "/guides/outbound-lead-generation-cost/" || page.path === "/services/linkedin-lead-generation/";
  const toc = `${page.sections.slice(0, 1).map((section) => `<a href="#${escapeHtml(section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}">${escapeHtml(section.heading)}</a>`).join("")}<a href="#${toolNav[0]}">${toolNav[1]}</a>${page.sections.slice(1).map((section) => `<a href="#${escapeHtml(section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}">${escapeHtml(section.heading)}</a>`).join("")}${hasSources ? '<a href="#sources">Sources and methodology</a>' : ""}`;
  const related = page.related.map((link) => `<a class="related-card" href="${escapeHtml(link)}"><span>Related</span><strong>${escapeHtml(labelFor(link))}</strong></a>`).join("");
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}"><link rel="stylesheet" href="/seo.css"><script src="/seo.js" defer></script>
<meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Beespoke Outbound Lead Generation">
<meta name="twitter:card" content="summary"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
</head><body>
<header class="site-header"><nav><a class="brand" href="/"><span>B</span>Beespoke Outbound</a><div><a href="/services/outbound-lead-generation/">Services</a><a href="/case-studies/cybersecurity-linkedin-lead-generation/">Case studies</a><a href="/pricing/">Pricing</a><a class="nav-cta" href="https://calendly.com/noahlevybuilds/30min">Book a conversation</a></div></nav><div class="reading-progress" aria-hidden="true"><span></span></div></header>
<main><div class="breadcrumbs"><a href="/">Home</a><span>/</span><span>${escapeHtml(page.eyebrow)}</span></div>
<header class="hero"><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p class="answer">${escapeHtml(page.answer)}</p><div class="hero-actions"><a class="button" href="https://calendly.com/noahlevybuilds/30min">Book a 30-minute fit call</a><a class="secondary" href="/pricing/">See transparent pricing</a></div><p class="meta">Written by <a href="/about/noah-levy/">Noah Levy</a> · Updated July 16, 2026</p></header>
<details class="mobile-toc"><summary><span><small>On this page</small><strong class="current-section">${escapeHtml(page.sections[0].heading)}</strong></span><span class="toc-action">Sections</span></summary><nav aria-label="Page sections">${toc}</nav></details>
<div class="article-grid"><aside class="toc"><div class="toc-label"><span>Article guide</span><strong>On this page</strong></div>${toc}<div class="toc-progress"><span></span></div></aside><article>${page.sections.map((section, index) => `${renderSection(section)}${index === 0 ? renderOriginalTool(page) : ""}${index === 1 ? renderInlineCta(page, "middle") : index === 3 ? renderInlineCta(page, "late") : ""}`).join("")}${renderSources(page)}</article></div>
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
