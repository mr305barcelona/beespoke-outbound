const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pages = JSON.parse(fs.readFileSync(path.join(root, "data", "seo-pages.json"), "utf8"));
const pricingBenchmark = JSON.parse(fs.readFileSync(path.join(root, "data", "outbound-pricing-benchmark-2026.json"), "utf8"));
const origin = "https://outbound-lead-generation.com";
const organizationId = `${origin}/#organization`;
const personId = `${origin}/about/noah-levy/#person`;
const organizationSameAs = [
  "https://www.goodfirms.co/company/beespoke-outbound-lead-generation",
  "https://techbehemoths.com/company/beespoke-outbound-lead-generation",
  "https://clutch.co/profile/beespoke-outbound-lead-generation",
  "https://www.cylex.es/barcelona/beespoke-outbound-lead-generation-14666954.html"
];
const defaultUpdated = "2026-07-24";
const updatedOverrides = new Map([
  ["/services/linkedin-lead-generation/", "2026-08-26"],
  ["/services/outsourced-sdr/", "2026-08-26"],
  ["/guides/outsourced-sdr-pros-and-cons/", "2026-08-19"],
  ["/guides/outbound-call-center-pricing/", "2026-08-19"],
  ["/guides/b2b-lead-generation-consultant-vs-agency/", "2026-08-19"],
  ["/compare/sdr-vs-bdr-outsourcing/", "2026-08-19"],
  ["/ai-instructions/", "2026-08-19"],
  ["/guides/best-linkedin-lead-generation-agencies/", "2026-08-19"],
  ["/case-studies/media-partnership-outreach/", "2026-08-19"],
  ["/guides/outsourced-sdr-vs-lead-generation-agency/", "2026-08-19"],
  ["/research/2026-b2b-outbound-pricing-benchmark/", "2026-08-19"],
  ["/industries/accounting-firm-lead-generation/", "2026-08-17"],
  ["/industries/recruitment-agency-lead-generation/", "2026-08-17"],
  ["/industries/it-services-lead-generation/", "2026-08-17"],
  ["/guides/linkedin-lead-generation-agency-cost/", "2026-08-17"],
  ["/compare/lead-generation-agency-vs-software/", "2026-08-17"],
  ["/guides/best-outsourced-sdr-companies/", "2026-08-17"],
  ["/industries/professional-services-lead-generation/", "2026-08-17"],
  ["/industries/marketing-agency-lead-generation/", "2026-08-17"],
  ["/guides/how-to-manage-an-outsourced-sdr-team/", "2026-08-17"],
  ["/compare/sdr-outsourcing-vs-staff-augmentation/", "2026-08-17"],
  ["/guides/how-to-choose-an-outbound-lead-generation-agency/", "2026-08-17"],
  ["/guides/best-b2b-lead-generation-agencies/", "2026-08-17"],
  ["/services/outbound-lead-generation/", "2026-08-03"],
  ["/guides/outbound-lead-generation-cost/", "2026-08-03"],
  ["/case-studies/cybersecurity-linkedin-lead-generation/", "2026-08-03"],
  ["/guides/outsourced-sdr-vs-lead-generation-agency/", "2026-08-03"],
  ["/services/b2b-lead-generation/", "2026-08-07"],
  ["/guides/cold-email-agency/", "2026-08-07"],
  ["/services/outbound-sales-outsourcing/", "2026-08-07"],
  ["/guides/cold-email-agency-pricing/", "2026-08-07"],
  ["/compare/outsourced-sdr-vs-in-house-sdr/", "2026-08-07"],
  ["/compare/lead-generation-agency-vs-in-house-team/", "2026-08-07"],
  ["/editorial-policy/", "2026-07-27"]
]);
const updatedFor = (pagePath) => updatedOverrides.get(pagePath) || defaultUpdated;
const modifiedDateTimeFor = (pagePath) => updatedOverrides.has(pagePath)
  ? `${updatedFor(pagePath)}T15:00:00+02:00`
  : "2026-07-24T09:00:00+02:00";
const displayDateFor = (pagePath) => new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC"
}).format(new Date(`${updatedFor(pagePath)}T12:00:00Z`));

const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));

function renderSection(section) {
  const paragraphs = (section.body || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  const items = section.items ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
  const callout = section.callout ? `<aside class="callout">${escapeHtml(section.callout)}</aside>` : "";
  const links = section.links ? `<div class="text-links">${section.links.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)} →</a>`).join("")}</div>` : "";
  const table = section.table ? `<div class="table-wrap"><table><caption>${escapeHtml(section.table.caption)}</caption><thead><tr>${section.table.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead><tbody>${section.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : "";
  return `<section id="${escapeHtml(section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}"><h2>${escapeHtml(section.heading)}</h2>${paragraphs}${items}${table}${callout}${links}</section>`;
}

function renderFaqs(page) {
  if (!page.faqs?.length) return "";
  return `<section class="faqs" id="frequently-asked-questions"><h2>Frequently asked questions</h2><div class="faq-list">${page.faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}</div></section>`;
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
  if (page.tool) {
    const blocks = page.tool.blocks.map((block) => `<div><span>${escapeHtml(block.label)}</span><strong>${escapeHtml(block.heading)}</strong><p>${escapeHtml(block.body)}</p></div>`).join("");
    return `<section class="original-tool evidence-method" id="${escapeHtml(page.tool.id)}"><div class="tool-heading"><span>${escapeHtml(page.tool.eyebrow)}</span><h2>${escapeHtml(page.tool.heading)}</h2><p>${escapeHtml(page.tool.intro)}</p></div><div class="evidence-grid">${blocks}</div><p class="tool-note">${escapeHtml(page.tool.note)}</p></section>`;
  }
  if (page.path === "/services/b2b-lead-generation/") {
    const signals = ["A narrow company profile is written","Buying roles are mapped beyond one title","The offer solves a specific costly problem","Relevant proof or insight is available","Exclusions protect customers and poor-fit accounts","A sales owner can run discovery quickly","Customer value supports hands-on acquisition","The team can support a 6–12 week learning window"];
    return `<section class="original-tool checklist-tool" id="b2b-readiness-score"><div class="tool-heading"><span>Original campaign-readiness diagnostic</span><h2>Should you buy B2B lead generation yet?</h2><p>Check only conditions that are already true. The result identifies whether execution or commercial definition is the next constraint.</p></div><div class="check-grid">${signals.map((item) => `<label><input type="checkbox" data-fit>${item}</label>`).join("")}</div><div class="tool-output"><span>Readiness signals confirmed</span><strong data-fit-score>0 of 8 signals</strong><p data-fit-copy>Clarify the buyer, problem and commercial owner before paying for campaign execution.</p></div></section>`;
  }
  if (page.path === "/guides/cold-email-agency/") {
    const controls = ["Sending-domain ownership is documented","SPF, DKIM and DMARC responsibility is named","Mailbox and volume limits are written","Contact-data sources are disclosed","Copy and full sequences require approval","Opt-outs update a shared suppression list","Deliverability pause rules are defined","Assets and data can be exported at exit"];
    return `<section class="original-tool checklist-tool" id="cold-email-risk-audit"><div class="tool-heading"><span>Original cold-email risk audit</span><h2>Would the proposed operating system survive scrutiny?</h2><p>Confirm only controls that appear in the written scope or contract.</p></div><div class="check-grid">${controls.map((item) => `<label><input type="checkbox" data-risk>${item}</label>`).join("")}</div><div class="tool-output"><span>Controls confirmed</span><strong data-risk-score>0 of 8</strong><p>Unwritten infrastructure, compliance and handover assumptions belong in the contract before any account access is granted.</p></div></section>`;
  }
  if (page.path === "/services/outbound-sales-outsourcing/") {
    return `<section class="original-tool evidence-method" id="handoff-boundary"><div class="tool-heading"><span>Original responsibility boundary</span><h2>Draw the line before outsourcing begins</h2><p>A clean handoff prevents the provider and client from assuming the other party owns a critical sales task.</p></div><div class="evidence-grid"><div><span>Provider owns</span><strong>Prospecting execution</strong><p>Research, outreach, first replies, written qualification and meeting context.</p></div><div><span>Shared</span><strong>Commercial truth</strong><p>ICP decisions, claims, exclusions, sensitive replies and campaign learning.</p></div><div><span>Client owns</span><strong>Opportunity progression</strong><p>Discovery, solution design, CRM next steps, proposal, negotiation and close.</p></div></div><p class="tool-note">Name an accountable person on both sides for every shared responsibility.</p></section>`;
  }
  if (page.path === "/guides/cold-email-agency-pricing/") {
    return `<section class="original-tool evidence-method" id="cold-email-quote-normalizer"><div class="tool-heading"><span>Original quote-normalization model</span><h2>Convert every cold-email quote into the same cost</h2><p>Use one evaluation period and include all work required to operate the campaign.</p></div><div class="evidence-grid"><div><span>Agency layer</span><strong>Retainer + setup + variable fees</strong><p>Include every event that can trigger additional billing.</p></div><div><span>Infrastructure layer</span><strong>Domains + mailboxes + data + tools</strong><p>Include replacement assets and verification, not only launch costs.</p></div><div><span>Client layer</span><strong>Review + compliance + sales time</strong><p>Account for approval, difficult replies, discovery and CRM work.</p></div></div><p class="tool-note">Fully loaded cost per held ICP meeting = all three layers ÷ qualified meetings that actually occurred.</p></section>`;
  }
  if (page.path === "/compare/outsourced-sdr-vs-in-house-sdr/") {
    return `<section class="original-tool evidence-method" id="sdr-model-test"><div class="tool-heading"><span>Original SDR model test</span><h2>Which constraint should determine the model?</h2><p>Choose by the primary operating constraint rather than the lowest headline cost.</p></div><div class="evidence-grid"><div><span>Evidence constraint</span><strong>Run a bounded external test</strong><p>Validate the segment and message before creating permanent capacity.</p></div><div><span>Capacity constraint</span><strong>Outsource defined execution</strong><p>Add accountable prospecting without waiting through a full hiring cycle.</p></div><div><span>Capability constraint</span><strong>Build in-house</strong><p>Invest internally when the motion is proven and strategically durable.</p></div></div><p class="tool-note">Management and sales follow-up remain necessary in every model.</p></section>`;
  }
  if (page.path === "/compare/lead-generation-agency-vs-in-house-team/") {
    return `<section class="original-tool evidence-method" id="reversibility-test"><div class="tool-heading"><span>Original reversibility test</span><h2>What is the cost of choosing the wrong model?</h2><p>Compare the decision by the uncertainty it resolves and the commitment it creates.</p></div><div class="evidence-grid"><div><span>Agency risk</span><strong>Fees + time + market exposure</strong><p>Limit the test, preserve asset ownership and write revision rules.</p></div><div><span>Hiring risk</span><strong>Recruiting + ramp + fixed capacity</strong><p>Confirm durable volume, management and a documented operating system.</p></div><div><span>Shared protection</span><strong>Evidence before expansion</strong><p>Define the signal that supports scaling, changing or stopping the model.</p></div></div><p class="tool-note">The most reversible option is not always best, but uncertainty should be priced explicitly.</p></section>`;
  }
  if (page.path === "/research/2026-b2b-outbound-pricing-benchmark/") {
    const rows = pricingBenchmark.offers.map((offer) => `<tr${offer.publisherOffer ? ' class="publisher-row"' : ""}><td><strong>${escapeHtml(offer.provider)}</strong><span>${escapeHtml(offer.offer)}</span>${offer.publisherOffer ? "<small>Publisher offer</small>" : ""}</td><td><strong>${escapeHtml(offer.price)}</strong><span>${escapeHtml(offer.billingUnit)}</span></td><td>${escapeHtml(offer.model)}</td><td>${escapeHtml(offer.channels)}</td><td>${escapeHtml(offer.output)}<span>${escapeHtml(offer.commitment)}</span></td><td><a href="${escapeHtml(offer.source)}" rel="nofollow">Source ↗</a></td></tr>`).join("");
    const embedCode = `&lt;a href="${origin}${page.path}"&gt;&lt;img src="${origin}/assets/research/2026-outbound-pricing-benchmark-chart.svg" alt="2026 B2B outbound public pricing comparison by Beespoke"&gt;&lt;/a&gt;`;
    return `<section class="original-tool benchmark-tool" id="public-price-dataset"><div class="tool-heading"><span>Original provider-level dataset</span><h2>40 public offers, with the comparison fields kept intact</h2><p>Checked July 24, 2026. Use the filters in your browser search or scan by provider, billing model and output definition.</p></div><div class="benchmark-stats"><div><strong>40</strong><span>Public price points</span></div><div><strong>12</strong><span>Provider websites</span></div><div><strong>3</strong><span>Native currencies</span></div><div><strong>0</strong><span>Currency conversions</span></div></div><div class="benchmark-actions"><a class="button" href="/data/outbound-pricing-benchmark-2026.json" download>Download source data (JSON)</a><a class="secondary" href="/assets/research/2026-outbound-pricing-benchmark-chart.svg" download>Download chart (SVG)</a></div><p class="table-scroll-hint"><span aria-hidden="true">↔</span> Swipe or scroll sideways to view every comparison field.</p><div class="table-wrap benchmark-table" tabindex="0" aria-label="Scrollable outbound pricing comparison table"><table><caption>Provider-published B2B outbound pricing checked July 24, 2026</caption><thead><tr><th>Provider and offer</th><th>Public price</th><th>Delivery model</th><th>Channels</th><th>Published output and commitment</th><th>Evidence</th></tr></thead><tbody>${rows}</tbody></table></div><figure class="research-chart"><img src="/assets/research/2026-outbound-pricing-benchmark-chart.svg" alt="USD monthly public prices grouped by software-like capacity, managed campaign and outsourced SDR scope"><figcaption>Selected fixed monthly USD prices only. Hybrid, one-time, EUR and GBP rows remain in the table but are excluded from this chart.</figcaption></figure><div class="embed-panel"><label for="benchmark-embed">Embed this chart with attribution</label><textarea id="benchmark-embed" readonly rows="4">${embedCode}</textarea><p>Keep the image linked to this page so readers can inspect the source table, methodology and retrieval date.</p></div><div class="download-grid"><a href="/downloads/beespoke-icp-scorecard/" class="download-card"><span>Buyer planning asset</span><strong>ICP scorecard</strong><p>Score market fit, evidence, accessibility and campaign readiness before scaling outreach.</p></a><a href="/downloads/beespoke-outbound-campaign-brief/" class="download-card"><span>Buyer planning asset</span><strong>Outbound campaign brief</strong><p>Define audience, proof, messages, qualification, responsibilities and measurement in one printable brief.</p></a></div></section>`;
  }
  if (page.path === "/guides/appointment-setting-pricing/") {
    return `<section class="original-tool evidence-method" id="quote-normalizer"><div class="tool-heading"><span>Original quote-normalization tool</span><h2>Turn three different quotes into one comparable unit</h2><p>Ask every provider for these four numbers before comparing price.</p></div><div class="evidence-grid"><div><span>1 · Total cost</span><strong>All monthly fees</strong><p>Retainer, setup allocation, data, software, performance fees and internal management.</p></div><div><span>2 · Attendance</span><strong>Qualified meetings held</strong><p>Exclude cancellations, no-shows, duplicates and meetings that fail written criteria.</p></div><div><span>3 · Progression</span><strong>Accepted opportunities</strong><p>Record which held meetings sales accepts for active progression and why.</p></div></div><p class="tool-note">Comparable cost per held meeting = total monthly cost ÷ qualified meetings held. Comparable cost per opportunity = total monthly cost ÷ accepted opportunities.</p></section>`;
  }
  if (page.path === "/guides/pay-per-meeting-lead-generation/") {
    const clauses = ["Payment requires attendance, not only a booking","Company-fit criteria are written","Accepted roles or buying responsibility are written","Duplicate and existing-opportunity windows are defined","No-show, reschedule and cancellation rules are defined","The provider supplies evidence for qualification","Disputes have a deadline and named reviewer","Credits and replacements are shown separately in reporting"];
    return `<section class="original-tool checklist-tool" id="meeting-contract-audit"><div class="tool-heading"><span>Original contract-risk audit</span><h2>Would your pay-per-meeting definition survive a dispute?</h2><p>Check only clauses that appear clearly in the proposed agreement.</p></div><div class="check-grid">${clauses.map((item) => `<label><input type="checkbox" data-risk>${item}</label>`).join("")}</div><div class="tool-output"><span>Contract controls confirmed</span><strong data-risk-score>0 of 8</strong><p>Unwritten quality expectations become billing disputes. Resolve missing controls before launch.</p></div></section>`;
  }
  if (page.path === "/services/outsourced-sdr/") {
    const scope = ["Named people and management owner","Exact weekly capacity","Included channels and sender identities","Data and software responsibility","ICP, list and message ownership","Reply and qualification workflow","CRM and reporting expectations","Ramp, replacement and exit plan"];
    return `<section class="original-tool checklist-tool" id="outsourced-sdr-scope"><div class="tool-heading"><span>Original scope audit</span><h2>Is the outsourced SDR offer operationally complete?</h2><p>A proposal is not comparable until these responsibilities are explicit.</p></div><div class="check-grid">${scope.map((item) => `<label><input type="checkbox" data-fit>${item}</label>`).join("")}</div><div class="tool-output"><span>Scope controls confirmed</span><strong data-fit-score>0 of 8 signals</strong><p data-fit-copy>Start by naming the people, capacity, channels and ownership before comparing retainers.</p></div></section>`;
  }
  if (page.path === "/guides/outsourced-sdr-cost/") {
    return `<section class="original-tool evidence-method" id="fully-loaded-sdr-cost"><div class="tool-heading"><span>Original cost stack</span><h2>Build the fully loaded monthly SDR number</h2><p>Add every layer; do not compare a salary with an all-inclusive provider fee.</p></div><div class="evidence-grid"><div><span>Provider layer</span><strong>Retainer + variable fees</strong><p>Setup allocation, base fee, per-meeting fees, minimums and currency effects.</p></div><div><span>Operating layer</span><strong>Tools + data + infrastructure</strong><p>CRM, contact data, dialer, sending domains, LinkedIn and reporting systems.</p></div><div><span>Client layer</span><strong>Management + enablement</strong><p>Strategy, training, reviews, sales follow-up and time spent correcting work.</p></div></div><p class="tool-note">Fully loaded cost per accepted opportunity = all three layers ÷ opportunities accepted by sales in the same period.</p></section>`;
  }
  if (page.path === "/compare/outbound-agency-vs-freelancer/") {
    return `<section class="original-tool evidence-method" id="continuity-test"><div class="tool-heading"><span>Original continuity test</span><h2>What happens if the primary operator disappears?</h2><p>Use the answer to expose key-person and handover risk.</p></div><div class="evidence-grid"><div><span>Access</span><strong>Can you reach the operator?</strong><p>Confirm who actually researches, writes, sends, handles replies and reports.</p></div><div><span>Assets</span><strong>Can another person continue?</strong><p>Lists, copy, decisions, credentials and campaign history should remain usable.</p></div><div><span>Coverage</span><strong>Is backup real or theoretical?</strong><p>Name the replacement, handover time and quality-control owner before signing.</p></div></div><p class="tool-note">A solo expert can be the best choice when continuity risk is visible and acceptable. A team is valuable only when coverage is documented.</p></section>`;
  }
  if (page.path === "/editorial-policy/") {
    return `<section class="original-tool evidence-method" id="claim-label"><div class="tool-heading"><span>Reader verification tool</span><h2>How to classify a claim on this site</h2><p>Use the label that best matches the evidence shown beside the assertion.</p></div><div class="evidence-grid"><div><span>Observed</span><strong>Firsthand but bounded</strong><p>A real Beespoke campaign observation with client and sample limitations stated.</p></div><div><span>Sourced</span><strong>Externally verifiable</strong><p>A dated official, primary or provider-published source linked for inspection.</p></div><div><span>Interpreted</span><strong>Professional judgment</strong><p>Beespoke's practical conclusion, clearly separated from guarantees or universal facts.</p></div></div><p class="tool-note">If a material factual claim lacks enough context to classify, it should be corrected or clarified.</p></section>`;
  }
  if (page.path.startsWith("/industries/")) {
    const cyber = page.path.includes("cybersecurity");
    const saas = page.path.includes("b2b-saas");
    const consulting = page.path.includes("consulting");
    const label = cyber ? "Cybersecurity" : saas ? "B2B SaaS" : consulting ? "Consulting" : "Manufacturing";
    const items = cyber ? ["The security category is narrowly defined","Target accounts share relevant technical context","The buying committee is mapped beyond job titles","Claims are supported by credible proof","The sender can handle security objections","Meeting criteria are written","Exclusions protect poor-fit accounts","A technical discovery owner is available"] : saas ? ["The use case is narrower than 'all B2B companies'","Customer value supports human acquisition","The account universe is large enough to test","Economic and technical buyers are mapped","Relevant proof exists","The offer has paying customers","Sales follows up quickly","Exclusions protect poor-fit accounts"] : consulting ? ["One business problem is campaign-ready","A narrow market wedge is defined","The buying committee is mapped","The firm has relevant proof","The sender has a credible point of view","Project value supports human acquisition","A diagnostic call owner is available","Poor-fit accounts are excluded"] : ["Target accounts share a defined process or application","The buying group is mapped","Technical capability is translated into business value","Account exclusions are written","Relevant proof is available","The sender can route technical questions","Customer value supports human acquisition","Sales can progress complex opportunities"];
    return `<section class="original-tool checklist-tool" id="industry-fit-check"><div class="tool-heading"><span>Original market-readiness tool</span><h2>${label} outbound readiness check</h2><p>Check only the conditions that are already true. Gaps indicate work to complete before scaling contact volume.</p></div><div class="check-grid">${items.map((item) => `<label><input type="checkbox" data-risk>${item}</label>`).join("")}</div><div class="tool-output"><span>Readiness signals confirmed</span><strong data-risk-score>0 of 8</strong><p>A narrow market, defensible proof and an available sales owner matter more than list size.</p></div></section>`;
  }
  if (page.path.includes("outsourced-sdr-vs")) {
    return `<section class="original-tool evidence-method" id="model-selector"><div class="tool-heading"><span>Operating-model selector</span><h2>Start with the capability you actually need</h2><p>Use the primary gap—not the provider's label—to shortlist a model.</p></div><div class="evidence-grid"><div><span>Capacity gap</span><strong>Outsourced SDR</strong><p>Dedicated rep capacity integrated with your team and systems.</p></div><div><span>Campaign gap</span><strong>Lead generation agency</strong><p>A defined channel or campaign managed toward qualified meetings.</p></div><div><span>Leadership gap</span><strong>Fractional sales leader</strong><p>Senior design, coaching and operating rhythm for an existing team.</p></div></div><p class="tool-note">If the offer and buyer are still unclear, validate them before adding any full-time or outsourced execution model.</p></section>`;
  }
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
  if (page.path === "/research/2026-b2b-outbound-pricing-benchmark/") {
    const providers = [...new Map(pricingBenchmark.offers.map((offer) => [offer.provider, offer.source])).entries()];
    return `<section class="sources" id="sources"><h2>Sources and methodology</h2><p>Every row comes from a provider-controlled page checked on July 24, 2026. Prices are shown in their native currency and retain setup, variable-fee and minimum-term details. The sample is descriptive, not an audited industry census.</p><ol>${providers.map(([provider, href]) => `<li><a href="${escapeHtml(href)}"><span>${escapeHtml(provider)}</span> published pricing</a></li>`).join("")}</ol></section>`;
  }
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
    ],
    "/guides/appointment-setting-pricing/": [
      ["Alleyoop 2026 appointment-setting cost analysis", "https://alleyoop.io/appointment-setting-cost"],
      ["Leadriver 2026 appointment-setting benchmarks", "https://www.leadriver.io/blog/b2b-appointment-setting-cost-benchmarks"],
      ["ViaMetric published appointment pricing", "https://viametric.com/pricing/"]
    ],
    "/guides/pay-per-meeting-lead-generation/": [
      ["Leads to Green published pay-per-meeting scope", "https://leadstogreen.com/"],
      ["MeetCold pay-per-show-up definition", "https://meetcold.com/pricing"],
      ["GrowQuikr published pay-per-appointment terms", "https://growquikr.com/pay-per-lead"]
    ],
    "/guides/outsourced-sdr-cost/": [
      ["RhemaVox 2026 outsourced SDR cost guide", "https://rhemavox.com/blog/how-much-does-an-outsourced-sdr-cost/"],
      ["Outbound Sales Pro 2026 outsourced SDR pricing", "https://outboundsalespro.com/outsourced-sdr-pricing-2025/"],
      ["Rose Talent Solutions 2026 SDR cost comparison", "https://rosetalentsolutions.io/blog/how-much-does-an-outsourced-sales-development-rep-cost"]
    ],
    "/guides/cold-email-agency/": [
      ["Google email sender guidelines", "https://support.google.com/mail/answer/81126"],
      ["US FTC CAN-SPAM compliance guide", "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business"],
      ["UK ICO business-to-business marketing guidance", "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/business-to-business-marketing/"]
    ],
    "/guides/cold-email-agency-pricing/": [
      ["Google email sender guidelines", "https://support.google.com/mail/answer/81126"],
      ["US FTC CAN-SPAM compliance guide", "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business"],
      ["UK ICO guidance on direct marketing using electronic mail", "https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/"]
    ]
  };
  const sources = page.sources?.length ? page.sources.map((source) => [source.label, source.href]) : sourceMap[page.path];
  if (!sources) return "";
  const checkedDate = page.sourceChecked || (page.path.includes("cold-email-agency") ? "August 7, 2026" : "July 20, 2026");
  const methodology = page.sourceMethodology || "Third-party prices, platform requirements and legal guidance can change. Provider-published information describes each source's own offer and is used for buyer diligence, not as an independent endorsement.";
  return `<section class="sources" id="sources"><h2>Sources and methodology</h2><p><span>${escapeHtml(methodology)}</span> <span>These sources were checked on ${checkedDate}.</span></p><ol>${sources.map(([label, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`).join("")}</ol></section>`;
}

function renderCompetitiveDepth(page) {
  if (page.decisionGuide) {
    const guide = page.decisionGuide;
    const paragraphs = (guide.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    const items = guide.items ? `<ol>${guide.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : "";
    const table = guide.table ? `<div class="table-wrap"><table><caption>${escapeHtml(guide.table.caption)}</caption><thead><tr>${guide.table.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead><tbody>${guide.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : "";
    return `<section class="competitive-depth" id="buyer-decision-guide"><h2>${escapeHtml(guide.heading)}</h2>${paragraphs}${items}${table}</section>`;
  }
  if (page.path === "/services/b2b-lead-generation/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>How to compare B2B lead generation agencies</h2><div class="table-wrap"><table><caption>Agency evaluation framework</caption><thead><tr><th>Question</th><th>Strong evidence</th><th>Warning sign</th></tr></thead><tbody><tr><td>How is the ICP built?</td><td>Account context, buying roles, exclusions and a reviewable hypothesis</td><td>A list filtered only by industry and title</td></tr><tr><td>Who operates the campaign?</td><td>Named delivery owner and clear time allocation</td><td>The delivery team is hidden until after signature</td></tr><tr><td>What counts as success?</td><td>Held ICP meetings and accepted opportunities shown separately</td><td>Contacts, replies and bookings combined as leads</td></tr><tr><td>What does the client own?</td><td>Lists, copy, history and learning remain exportable</td><td>Campaign assets disappear at cancellation</td></tr><tr><td>When is the service a poor fit?</td><td>Specific non-fit conditions and alternative models</td><td>The same volume promise for every market</td></tr></tbody></table></div><h3>What Beespoke does differently</h3><p>Beespoke keeps founder-level judgment connected to target selection, replies and campaign learning; publishes its actual standard prices; defines qualification before launch; and states the limits of its LinkedIn-led scope.</p></section>`;
  if (page.path === "/guides/cold-email-agency/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>A 12-question cold email agency due-diligence list</h2><ol><li>Which legal entities and countries will be contacted?</li><li>Where does contact data come from and how is it verified?</li><li>Who owns every domain and mailbox?</li><li>Who configures SPF, DKIM and DMARC?</li><li>What volume, ramp and pause limits apply?</li><li>Who approves full message sequences?</li><li>How are duplicates, customers and open opportunities excluded?</li><li>Who reads replies and how quickly?</li><li>How are opt-outs and suppression records shared?</li><li>What counts as a booked, held and qualified meeting?</li><li>What happens after a deliverability incident?</li><li>Which assets and records are exported at termination?</li></ol><p>A provider should answer these questions in operational language and reflect the material controls in the written agreement.</p></section>`;
  if (page.path === "/services/outbound-sales-outsourcing/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>Choose the outsourcing depth by the sales motion</h2><div class="table-wrap"><table><caption>Outbound outsourcing scope comparison</caption><thead><tr><th>Model</th><th>Scope</th><th>Best when</th><th>Main risk</th></tr></thead><tbody><tr><td>Campaign agency</td><td>Targeting through qualified meeting</td><td>You need a managed test or focused channel</td><td>Learning is lost without a deliberate handoff</td></tr><tr><td>Staff-augmentation SDR</td><td>Dedicated rep capacity in your systems</td><td>Your managers can direct daily work</td><td>The client underestimates coaching needs</td></tr><tr><td>Outsourced SDR pod</td><td>Multichannel team and management</td><td>Volume supports a larger external operation</td><td>High fixed scope before market validation</td></tr><tr><td>Full-cycle outsourced sales</td><td>Prospecting through close</td><td>Product and contracting can be delegated credibly</td><td>Customer promises move outside the company</td></tr></tbody></table></div><h3>Beespoke’s disclosed boundary</h3><p>Beespoke is a campaign agency: it manages focused prospecting and the qualified handoff. Discovery, proposal, negotiation and closing remain with the client.</p></section>`;
  if (page.path === "/guides/cold-email-agency-pricing/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>Fields every comparable quote should contain</h2><div class="table-wrap"><table><caption>Cold email quote normalization sheet</caption><thead><tr><th>Field</th><th>Record</th><th>Why it changes price</th></tr></thead><tbody><tr><td>Delivery model</td><td>Software, consulting, managed or performance</td><td>Defines how much operating work transfers</td></tr><tr><td>Infrastructure</td><td>Domains, mailboxes, authentication and monitoring</td><td>Creates both capacity and reputation risk</td></tr><tr><td>Data</td><td>Sources, verification, allowance and exclusions</td><td>Research depth affects relevance and labor</td></tr><tr><td>Billing event</td><td>Lead, reply, booking, held meeting or opportunity</td><td>Different events cannot share one unit price</td></tr><tr><td>Client work</td><td>Approvals, replies, compliance and discovery</td><td>Retained labor belongs in fully loaded cost</td></tr><tr><td>Exit</td><td>Asset ownership, exports and access removal</td><td>Replacement cost can exceed one month’s fee</td></tr></tbody></table></div><p>Put all shortlisted providers into the same sheet and refuse to score a field that remains undefined.</p></section>`;
  if (page.path === "/compare/outsourced-sdr-vs-in-house-sdr/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>A five-stage decision sequence</h2><ol><li>Write the market and offer assumptions that remain unproven.</li><li>Estimate durable weekly prospecting demand after validation.</li><li>Name the manager, coaching capacity and required channels.</li><li>Build twelve-month fully loaded cost for both models.</li><li>Define ownership, handover and the evidence that triggers expansion.</li></ol><h3>Do not confuse a staffing label with a service model</h3><p>An outsourced SDR may be dedicated staff augmentation, a shared team or a managed campaign. Ask for named people, allocated capacity, management ownership, channel scope and exact deliverables before comparing it with an employee.</p></section>`;
  if (page.path === "/compare/lead-generation-agency-vs-in-house-team/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>A scorecard for the operating-model decision</h2><div class="table-wrap"><table><caption>Evidence to gather before choosing</caption><thead><tr><th>Decision area</th><th>Agency evidence</th><th>In-house evidence</th></tr></thead><tbody><tr><td>Market certainty</td><td>Bounded test design and revision plan</td><td>Proven volume supporting permanent capacity</td></tr><tr><td>Management</td><td>Named senior delivery and review owner</td><td>Named manager with weekly coaching time</td></tr><tr><td>Capability</td><td>Relevant channel operation and controls</td><td>Recruiting and enablement plan</td></tr><tr><td>Economics</td><td>Fully loaded contract and retained client work</td><td>Fully loaded employment, ramp and tools</td></tr><tr><td>Learning</td><td>Documented transfer and asset ownership</td><td>CRM, coaching and experiment discipline</td></tr><tr><td>Exit risk</td><td>Export and handover procedure</td><td>Coverage and replacement procedure</td></tr></tbody></table></div><p>Score the evidence that exists today—not the capability either model promises to develop later.</p></section>`;
  if (page.path === "/research/2026-b2b-outbound-pricing-benchmark/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>Use the benchmark without misreading it</h2><div class="table-wrap"><table><caption>Normalization checks before comparing two offers</caption><thead><tr><th>Field</th><th>Comparable only when</th><th>Common mistake</th></tr></thead><tbody><tr><td>Delivery model</td><td>Both transfer a similar amount of execution and management</td><td>Comparing software with a human-managed team</td></tr><tr><td>Billing event</td><td>Lead, booked meeting, held meeting and accepted opportunity are defined the same way</td><td>Calling every positive reply a meeting</td></tr><tr><td>Channel scope</td><td>Sender count, channels and infrastructure are aligned</td><td>Ignoring domains, data, profiles or dialer costs</td></tr><tr><td>Commitment</td><td>Setup and minimum term are included in the evaluation period</td><td>Comparing month one against a mature monthly run rate</td></tr><tr><td>Client work</td><td>Reply handling, sales follow-up and management burden are accounted for</td><td>Treating internal time as free</td></tr></tbody></table></div><h3>A defensible buying sequence</h3><ol><li>Shortlist offers by delivery model and channel fit.</li><li>Normalize fixed, setup, variable and required third-party costs.</li><li>Write the qualified-and-held meeting definition.</li><li>Model pessimistic, expected and optimistic opportunity progression.</li><li>Choose the smallest test that can produce a credible learning signal.</li></ol></section>`;
  if (page.path.startsWith("/industries/")) return `<section class="competitive-depth" id="buyer-decision-guide"><h2>Questions to use when comparing specialist agencies</h2><div class="table-wrap"><table><caption>Industry lead-generation provider check</caption><thead><tr><th>Question</th><th>Strong evidence</th><th>Warning sign</th></tr></thead><tbody><tr><td>How will you segment this market?</td><td>Account context, problem and buying-group logic</td><td>Industry label plus job-title list</td></tr><tr><td>What proof supports the approach?</td><td>Relevant, bounded evidence with limitations</td><td>Unverifiable logos or guaranteed outcomes</td></tr><tr><td>How are technical replies handled?</td><td>Named routing and response process</td><td>Generic scripts continue after objections</td></tr><tr><td>What counts as qualified?</td><td>Written company, role, interest and attendance rules</td><td>Every booking is billed or reported equally</td></tr><tr><td>When would you recommend another channel?</td><td>Clear non-fit conditions</td><td>One channel presented as universal</td></tr></tbody></table></div><h3>What Beespoke does differently</h3><p>Beespoke keeps strategy close to campaign replies, exposes channel limitations and tests a small defensible segment before expansion. That is a focused operating choice, not a claim to fit every industrial or cybersecurity sales motion.</p></section>`;
  if (page.path.includes("outsourced-sdr-vs")) return `<section class="competitive-depth" id="buyer-decision-guide"><h2>A procurement checklist for any model</h2><ul><li>Name the people who will perform and supervise the work.</li><li>Write the exact channels, markets, sender profiles and systems included.</li><li>Define booked, held, qualified and accepted-opportunity metrics separately.</li><li>Confirm ownership of data, copy, accounts, domains and campaign history.</li><li>Model ramp time, management time and replacement risk.</li><li>Agree on the evidence that triggers expansion, revision or cancellation.</li></ul><p>A sound provider should make the operating tradeoffs clearer even when that comparison points away from its own service.</p></section>`;
  if (page.path === "/services/outbound-lead-generation/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>How to compare outbound agencies</h2><p>The right provider depends on the sales motion, not the largest activity promise. Use the operating differences below before comparing retainers.</p><div class="table-wrap"><table><caption>Outbound agency evaluation framework</caption><thead><tr><th>Question</th><th>Strong answer</th><th>Warning sign</th></tr></thead><tbody><tr><td>Which channels are actually included?</td><td>Exact current scope, owners and third-party costs</td><td>“Omnichannel” without deliverables</td></tr><tr><td>How is a qualified meeting defined?</td><td>Written company, role, interest and attendance rules</td><td>Any calendar booking counts</td></tr><tr><td>Who controls strategy and replies?</td><td>Named senior operator close to campaign evidence</td><td>Strategy disappears after onboarding</td></tr><tr><td>What does the client own?</td><td>Clear ownership of data, copy, accounts and history</td><td>Campaign assets vanish at cancellation</td></tr><tr><td>How is performance reviewed?</td><td>Held meetings, fit, opportunity progression and learning</td><td>Reports stop at sends, opens or connections</td></tr></tbody></table></div><h3>When Beespoke is not the right choice</h3><p>Beespoke is currently centered on focused LinkedIn-led execution. A company needing a large cold-calling floor, high-volume email infrastructure, 24-hour multilingual coverage, or a dedicated full-time SDR pod should choose a provider built for that scope.</p></section>`;
  if (page.path === "/services/b2b-appointment-setting/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>Choose an appointment-setting model by sales motion</h2><div class="table-wrap"><table><caption>Appointment-setting model comparison</caption><thead><tr><th>Model</th><th>Best when</th><th>Main tradeoff</th></tr></thead><tbody><tr><td>LinkedIn-led boutique team</td><td>Senior B2B buyers, credibility matters, focused TAM</td><td>Lower volume than a calling floor</td></tr><tr><td>Cold-email agency</td><td>Large addressable market and healthy sending infrastructure</td><td>Deliverability and domain-management risk</td></tr><tr><td>Call center</td><td>Phone-reachable market and repeatable qualification script</td><td>Brand and agent-quality variance</td></tr><tr><td>In-house SDR</td><td>Long-term volume, strong management and enough ramp time</td><td>Hiring, tooling, training and turnover</td></tr></tbody></table></div><h3>Reporting that exposes meeting quality</h3><ul><li>Booked, held, cancelled and no-show meetings shown separately</li><li>ICP acceptance and rejection reasons</li><li>Held-meeting to accepted-opportunity progression</li><li>Objections and message changes by segment</li><li>Accounts contacted, excluded and remaining</li></ul></section>`;
  if (page.path === "/services/linkedin-lead-generation/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>LinkedIn outreach, content and ads solve different jobs</h2><div class="table-wrap"><table><caption>LinkedIn lead-generation approaches</caption><thead><tr><th>Approach</th><th>Primary job</th><th>Time profile</th><th>Beespoke scope</th></tr></thead><tbody><tr><td>One-to-one outreach</td><td>Start conversations with named buyers</td><td>Direct, constrained by audience and platform rules</td><td>Core service</td></tr><tr><td>Founder content</td><td>Build familiarity and credibility</td><td>Compounds over time</td><td>Supporting advice/assets when agreed</td></tr><tr><td>LinkedIn Ads</td><td>Buy targeted reach and capture demand</td><td>Faster reach, separate media budget</td><td>Not included in standard plans</td></tr><tr><td>Social selling</td><td>Develop relationships through useful participation</td><td>Human, ongoing</td><td>Can inform campaign behavior</td></tr></tbody></table></div><h3>Questions an agency should answer before profile access</h3><ul><li>Will any third-party tool log in, scrape, message or modify the profile?</li><li>Who reviews target lists and copy before activity begins?</li><li>What happens if LinkedIn restricts the account?</li><li>How are credentials protected and who can access them?</li><li>Can the service operate within LinkedIn's current agreement and guidance?</li></ul></section>`;
  if (page.path === "/pricing/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>What the headline price does not tell you</h2><div class="table-wrap"><table><caption>Budget items to confirm before signing</caption><thead><tr><th>Cost item</th><th>Beespoke standard plan</th><th>Confirm before launch</th></tr></thead><tbody><tr><td>Strategy, list, messaging and management</td><td>Included</td><td>Target-market scope and sender count</td></tr><tr><td>Software and third-party data</td><td>Not included</td><td>Named tools, owner and monthly estimate</td></tr><tr><td>Performance fee</td><td>Hybrid plan only</td><td>Written ICP and held-meeting definition</td></tr><tr><td>Cold calling, paid ads and full-cycle closing</td><td>Not included</td><td>Separate provider or scope if required</td></tr><tr><td>Internal sales time</td><td>Client responsibility</td><td>Discovery, follow-up and CRM discipline</td></tr></tbody></table></div><h3>Three economic scenarios</h3><p>Use the calculator above with a pessimistic, expected and optimistic case. A serious decision should still be acceptable under the pessimistic assumptions. If one closed customer cannot reasonably cover several months of the program, focused human-led outbound may be economically premature.</p></section>`;
  if (page.path === "/guides/outbound-lead-generation-cost/") return `<section class="competitive-depth" id="buyer-decision-guide"><h2>Worked cost scenarios</h2><div class="table-wrap"><table><caption>Illustrative monthly scenarios—not market promises</caption><thead><tr><th>Situation</th><th>Likely operating model</th><th>Budget implication</th><th>Decision risk</th></tr></thead><tbody><tr><td>Founder testing one narrow ICP</td><td>Boutique LinkedIn-led campaign</td><td>Lower retainer plus tools</td><td>Offer may not yet be proven</td></tr><tr><td>Scale-up needing multichannel volume</td><td>Dedicated outsourced SDR pod</td><td>Higher retainer, data and infrastructure</td><td>Management and attribution complexity</td></tr><tr><td>Enterprise named-account program</td><td>Research-heavy ABM/outbound team</td><td>Higher cost per account and longer learning window</td><td>Small sample and long sales cycle</td></tr></tbody></table></div><h3>Method for comparing quotes</h3><p>Normalize every quote to the same scope: channels, sender count, research depth, data, infrastructure, reply handling, qualification, contract length and ownership. Then compare expected cost per <em>held ICP meeting</em> and per accepted opportunity—not cost per email or booked calendar slot.</p></section>`;
  if (page.path.startsWith("/case-studies/")) return `<section class="competitive-depth" id="buyer-decision-guide"><h2>Evidence ledger</h2><div class="table-wrap"><table><caption>What this case study supports</caption><thead><tr><th>Evidence type</th><th>Available here</th><th>Limitation</th></tr></thead><tbody><tr><td>Client context</td><td>Industry, company profile and target audience</td><td>Client identity is partly withheld</td></tr><tr><td>Execution</td><td>Channel, personas and campaign approach</td><td>Private copy and account data are not published</td></tr><tr><td>Outcome</td><td>Observed meeting level and examples stated on page</td><td>No causal experiment or universal benchmark</td></tr><tr><td>Transferable lesson</td><td>Clearly labeled operating interpretation</td><td>Must be retested for another offer and market</td></tr></tbody></table></div><h3>What would strengthen the public evidence further</h3><p>A client-approved date range, denominator, anonymized campaign screenshot and downstream opportunity data would make the case stronger. Those items will only be published with permission; their absence is disclosed rather than replaced with invented precision.</p></section>`;
  return `<section class="competitive-depth" id="buyer-decision-guide"><h2>How to verify founder-led involvement</h2><ul><li>Ask who attends the strategy and weekly review calls.</li><li>Ask who writes and approves targeting and messages.</li><li>Ask who reads replies and decides what changes.</li><li>Ask what happens when the campaign contradicts the original hypothesis.</li></ul><p>“Founder-led” is meaningful only when senior judgment remains connected to execution and evidence after the sale.</p></section>`;
}

function renderPage(page) {
  const url = `${origin}${page.path}`;
  const pageUpdated = updatedFor(page.path);
  const modifiedDateTime = modifiedDateTimeFor(page.path);
  const alternates = ["es", "ca", "fr"].map((locale) => `<link rel="alternate" hreflang="${locale}" href="${origin}/${locale}${page.path}">`).join("");
  const isProfilePage = page.path.startsWith("/about/");
  const pageSchema = isProfilePage
    ? {
        "@type": "ProfilePage",
        "@id": `${url}#page`,
        url,
        name: page.h1,
        description: page.description,
        dateModified: modifiedDateTime,
        mainEntity: { "@type": "Person", "@id": personId, name: "Noah Levy" }
      }
    : {
        "@type": page.schemaType || (page.path.startsWith("/services/") ? "Service" : "Article"),
        "@id": `${url}#page`,
        url,
        name: page.h1,
        description: page.description,
        dateModified: modifiedDateTime,
        author: { "@id": personId },
        ...(page.path.startsWith("/services/") ? { provider: { "@id": organizationId } } : { publisher: { "@id": organizationId } })
      };
  const organizationSchema = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": organizationId,
    name: "Beespoke Outbound Lead Generation",
    alternateName: "Beespoke",
    url: `${origin}/`,
    logo: { "@type": "ImageObject", url: `${origin}/favicon.png`, width: 96, height: 96 },
    description: "Founder-led B2B outbound lead generation and qualified meeting booking for focused markets.",
    foundingDate: "2025",
    founder: { "@id": personId },
    areaServed: "International",
    address: { "@type": "PostalAddress", addressLocality: "Barcelona", addressCountry: "ES" },
    sameAs: organizationSameAs,
    knowsAbout: ["B2B outbound lead generation", "LinkedIn lead generation", "B2B appointment setting", "Outsourced sales development"]
  };
  const personSchema = {
    "@type": "Person",
    "@id": personId,
    name: "Noah Levy",
    jobTitle: "Founder",
    description: "Founder of Beespoke Outbound Lead Generation",
    url: `${origin}/about/noah-levy/`,
    worksFor: { "@id": organizationId },
    sameAs: ["https://www.linkedin.com/in/noahlevywriter/", "https://app.qwoted.com/sources/noah-levy"]
  };
  const datasetSchema = page.path === "/research/2026-b2b-outbound-pricing-benchmark/"
    ? [{
        "@type": "Dataset",
        "@id": `${url}#dataset`,
        name: "2026 B2B Outbound Pricing Benchmark",
        description: "Forty provider-published B2B outbound pricing offers with native currency, billing unit, delivery model, channels, output definition, commitment and source.",
        url,
        creator: { "@id": organizationId },
        datePublished: "2026-07-24",
        dateModified: modifiedDateTime,
        temporalCoverage: "2026",
        spatialCoverage: "International",
        measurementTechnique: "Manual collection from provider-controlled public pricing pages",
        variableMeasured: ["Public price", "Billing unit", "Delivery model", "Channels", "Published output", "Commitment"],
        distribution: [{
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${origin}/data/outbound-pricing-benchmark-2026.json`
        }]
      }]
    : [];
  const faqSchema = page.faqs?.length
    ? [{
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }))
      }]
    : [];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      pageSchema,
      organizationSchema,
      personSchema,
      ...datasetSchema,
      ...faqSchema,
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` }, { "@type": "ListItem", position: 2, name: page.h1, item: url }] }
    ]
  };
  const toolNav = page.tool
    ? [page.tool.id, page.tool.navLabel]
    : page.path === "/guides/appointment-setting-pricing/"
    ? ["quote-normalizer", "Quote normalizer"]
    : page.path === "/services/b2b-lead-generation/"
      ? ["b2b-readiness-score", "B2B readiness diagnostic"]
      : page.path === "/guides/cold-email-agency/"
        ? ["cold-email-risk-audit", "Cold email risk audit"]
        : page.path === "/services/outbound-sales-outsourcing/"
          ? ["handoff-boundary", "Responsibility boundary"]
          : page.path === "/guides/cold-email-agency-pricing/"
            ? ["cold-email-quote-normalizer", "Quote normalizer"]
            : page.path === "/compare/outsourced-sdr-vs-in-house-sdr/"
              ? ["sdr-model-test", "SDR model test"]
              : page.path === "/compare/lead-generation-agency-vs-in-house-team/"
                ? ["reversibility-test", "Reversibility test"]
    : page.path === "/guides/pay-per-meeting-lead-generation/"
      ? ["meeting-contract-audit", "Contract-risk audit"]
      : page.path === "/services/outsourced-sdr/"
        ? ["outsourced-sdr-scope", "Scope audit"]
        : page.path === "/guides/outsourced-sdr-cost/"
          ? ["fully-loaded-sdr-cost", "Fully loaded cost"]
          : page.path === "/compare/outbound-agency-vs-freelancer/"
            ? ["continuity-test", "Continuity test"]
            : page.path === "/editorial-policy/"
              ? ["claim-label", "Claim verification"]
              : page.path.startsWith("/industries/")
                ? ["industry-fit-check", "Industry readiness check"]
                : page.path.includes("outsourced-sdr-vs")
                  ? ["model-selector", "Operating-model selector"]
                  : page.path === "/pricing/" || page.path.includes("outbound-lead-generation-cost")
                    ? ["outbound-cost-calculator", "Break-even calculator"]
                    : page.path.includes("b2b-appointment-setting")
                      ? ["qualification-builder", "Qualification builder"]
                      : page.path.includes("linkedin-lead-generation")
                        ? ["linkedin-risk-check", "LinkedIn risk audit"]
                        : page.path.includes("outbound-lead-generation") && page.path.startsWith("/services/")
                          ? ["outbound-fit-score", "Outbound fit check"]
                          : page.path.startsWith("/case-studies/")
                            ? ["evidence-method", "Evidence standard"]
                            : page.path === "/research/2026-b2b-outbound-pricing-benchmark/"
                              ? ["public-price-dataset", "Public price dataset"]
                              : ["working-principles", "Working principles"];
  const hasSources = Boolean(page.sources?.length) || ["/guides/outbound-lead-generation-cost/", "/services/linkedin-lead-generation/", "/guides/appointment-setting-pricing/", "/guides/pay-per-meeting-lead-generation/", "/guides/outsourced-sdr-cost/", "/guides/cold-email-agency/", "/guides/cold-email-agency-pricing/", "/research/2026-b2b-outbound-pricing-benchmark/"].includes(page.path);
  const toc = `${page.sections.slice(0, 1).map((section) => `<a href="#${escapeHtml(section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}">${escapeHtml(section.heading)}</a>`).join("")}<a href="#${toolNav[0]}">${toolNav[1]}</a>${page.sections.slice(1).map((section) => `<a href="#${escapeHtml(section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))}">${escapeHtml(section.heading)}</a>`).join("")}<a href="#buyer-decision-guide">Buyer decision guide</a>${page.faqs?.length ? '<a href="#frequently-asked-questions">Frequently asked questions</a>' : ""}${hasSources ? '<a href="#sources">Sources and methodology</a>' : ""}`;
  const related = page.related.map((link) => `<a class="related-card" href="${escapeHtml(link)}"><span>Related</span><strong>${escapeHtml(labelFor(link))}</strong></a>`).join("");
  const socialImage = page.path === "/research/2026-b2b-outbound-pricing-benchmark/" ? `${origin}/assets/social/2026-pricing-benchmark-og.png` : `${origin}/assets/social/beespoke-og.png`;
  const socialAlt = page.path === "/research/2026-b2b-outbound-pricing-benchmark/" ? "2026 B2B outbound pricing benchmark by Beespoke" : "Beespoke Outbound Lead Generation";
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(page.title)}</title><meta name="description" content="${escapeHtml(page.description)}"><meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="en" href="${url}">${alternates}<link rel="alternate" hreflang="x-default" href="${url}"><link rel="stylesheet" href="/seo.css?v=20260803">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KDXYW9W2BB"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-KDXYW9W2BB');</script><script src="/seo.js?v=20260826" defer></script>
<meta property="og:type" content="article"><meta property="og:title" content="${escapeHtml(page.title)}"><meta property="og:description" content="${escapeHtml(page.description)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="Beespoke Outbound Lead Generation"><meta property="og:image" content="${socialImage}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escapeHtml(socialAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(page.title)}"><meta name="twitter:description" content="${escapeHtml(page.description)}"><meta name="twitter:image" content="${socialImage}"><meta name="twitter:image:alt" content="${escapeHtml(socialAlt)}"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>
</head><body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header"><nav><a class="brand" href="/"><span>B</span>Beespoke Outbound</a><div><a href="/services/b2b-lead-generation/">Services</a><a href="/case-studies/cybersecurity-linkedin-lead-generation/">Case studies</a><a href="/research/2026-b2b-outbound-pricing-benchmark/">Resources</a><a href="/pricing/">Pricing</a><a class="nav-cta" href="https://calendly.com/noahlevybuilds/30min">Book a conversation</a></div></nav><div class="language-switcher"><button type="button" aria-expanded="false" aria-label="Language">EN</button><div><a href="${page.path}" lang="en" aria-current="page">English</a><a href="/es${page.path}" lang="es">Español</a><a href="/ca${page.path}" lang="ca">Català</a><a href="/fr${page.path}" lang="fr">Français</a></div></div><div class="reading-progress" aria-hidden="true"><span></span></div></header>
<main id="main-content"><div class="breadcrumbs"><a href="/">Home</a><span>/</span><span>${escapeHtml(page.eyebrow)}</span></div>
<header class="hero"><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p class="answer">${escapeHtml(page.answer)}</p><div class="hero-actions"><a class="button" href="https://calendly.com/noahlevybuilds/30min">Book a 30-minute fit call</a><a class="secondary" href="/pricing/">See transparent pricing</a></div><p class="meta">Written by <a href="/about/noah-levy/">Noah Levy</a> · Updated ${displayDateFor(page.path)}</p></header>
<details class="mobile-toc"><summary><span><small>On this page</small><strong class="current-section">${escapeHtml(page.sections[0].heading)}</strong></span><span class="toc-action">Sections</span></summary><nav aria-label="Page sections">${toc}</nav></details>
<div class="article-grid"><aside class="toc"><div class="toc-label"><span>Article guide</span><strong>On this page</strong></div>${toc}<div class="toc-progress"><span></span></div></aside><article>${page.sections.map((section, index) => `${renderSection(section)}${index === 0 ? renderOriginalTool(page) : ""}${index === 1 ? renderInlineCta(page, "middle") : index === 3 ? renderInlineCta(page, "late") : ""}`).join("")}${renderCompetitiveDepth(page)}${renderFaqs(page)}${renderSources(page)}</article></div>
<section class="related"><p class="eyebrow">Continue researching</p><h2>Related Beespoke resources</h2><div class="related-grid">${related}</div></section>
<section class="final-cta"><h2>See whether focused outbound fits your market</h2><p>Bring your offer, target buyer and current pipeline. We will have a practical conversation about fit, constraints and the next sensible test.</p><a class="button" href="https://calendly.com/noahlevybuilds/30min">Book a conversation</a></section></main>
<footer>© 2026 Beespoke Outbound Lead Generation · Barcelona · <a href="/">outbound-lead-generation.com</a> · <a href="/ai-instructions/">AI &amp; company facts</a></footer>
</body></html>`;
}

for (const page of pages) {
  const output = path.join(root, page.path.replace(/^\//, ""), "index.html");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, renderPage(page));
}

const sitemapEntries = [
  { path: "/", updated: defaultUpdated },
  ...["es", "ca", "fr"].map((locale) => ({ path: `/${locale}/`, updated: defaultUpdated })),
  ...pages.map((page) => ({ path: page.path, updated: updatedFor(page.path) })),
  ...["es", "ca", "fr"].flatMap((locale) => pages.map((page) => ({ path: `/${locale}${page.path}`, updated: updatedFor(page.path) })))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((entry) => `  <url><loc>${origin}${entry.path}</loc><lastmod>${entry.updated}</lastmod></url>`).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
console.log(`Built ${pages.length} SEO pages and ${sitemapEntries.length} sitemap entries.`);
