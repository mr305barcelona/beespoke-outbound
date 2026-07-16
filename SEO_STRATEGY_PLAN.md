# Beespoke Organic Search Strategy

Date: 2026-07-16

## Executive decision

Beespoke should build a compact buyer-intent SEO library, not a high-volume generic sales blog.

The strategic position is:

> Founder-led outbound for B2B companies that want qualified meetings without hiring and managing an SDR team.

The first 90 days should publish 18 pages across four closely connected clusters:

1. Core service pages that explain what Beespoke sells.
2. Pricing and buying-decision pages for prospects actively evaluating an agency.
3. Industry pages backed by real campaign experience.
4. Comparison pages for prospects choosing between an agency, an employee, a freelancer, or a known provider.

This mirrors the Zapiekanka system: one primary intent per URL, hubs that own broad topics, children that own narrow questions, useful original assets, strong contextual internal links, a generated sitemap, and expansion based on Search Console evidence.

## Current baseline

The live site is a polished single-page commercial site with:

- a clear value proposition;
- public pricing ($1,500 monthly or $1,000 plus $100 per held meeting);
- named founder and Barcelona location;
- two relevant case-study summaries;
- recognizable prospect logos and one anonymized campaign reply;
- canonical metadata and `ProfessionalService` structured data.

The organic-search constraint is surface area. The sitemap contains only the homepage. Sections such as pricing, process, and case studies are fragments on that page, so search engines cannot rank distinct URLs for those high-intent questions.

Before launch, remove all private proposal URLs from discovery, navigation, and indexing. They should require authentication or return `noindex`; robots.txt alone does not protect confidential content.

## What the current SERPs show

Current search results are dominated by providers publishing dedicated pages for:

- outbound lead generation agencies;
- LinkedIn lead generation services;
- appointment-setting services and pricing;
- outsourced SDR services and cost;
- best-agency lists and competitor alternatives;
- industry-specific outbound services.

The market is content-competitive, but much of the ranking content is broad, vendor-written, and weak on transparent qualification rules, real examples, founder involvement, or small-team economics. Beespoke can win narrower queries with unusually candid, concrete answers.

Do not invent search volume or difficulty. The opportunity labels in `seo-keyword-map.csv` are relative hypotheses based on intent specificity and visible SERP composition. Validate numeric volume with Google Keyword Planner, Ahrefs, Semrush, or LowFruits before changing the publishing order.

## Information architecture

```text
/
/services/
/services/outbound-lead-generation/
/services/b2b-appointment-setting/
/services/linkedin-lead-generation/
/services/outsourced-sdr/
/pricing/
/guides/
/guides/outbound-lead-generation-cost/
/guides/appointment-setting-pricing/
/guides/outsourced-sdr-cost/
/guides/hire-sdr-vs-outsource/
/guides/pay-per-meeting-lead-generation/
/industries/
/industries/cybersecurity-lead-generation/
/industries/b2b-saas-lead-generation/
/industries/consulting-lead-generation/
/industries/pr-agency-lead-generation/
/compare/
/compare/outbound-agency-vs-in-house-sdr/
/compare/outbound-agency-vs-freelancer/
/compare/belkins-alternatives/
/case-studies/
/case-studies/cybersecurity-linkedin-lead-generation/
/case-studies/media-partnership-outreach/
/about/noah-levy/
/editorial-policy/
```

## First 18 pages

### Wave 1: money pages and proof (weeks 1-4)

1. `/services/outbound-lead-generation/`
2. `/services/b2b-appointment-setting/`
3. `/services/linkedin-lead-generation/`
4. `/pricing/`
5. `/guides/outbound-lead-generation-cost/`
6. `/case-studies/cybersecurity-linkedin-lead-generation/`
7. `/case-studies/media-partnership-outreach/`
8. `/about/noah-levy/`

### Wave 2: active evaluation (weeks 5-8)

9. `/services/outsourced-sdr/`
10. `/guides/appointment-setting-pricing/`
11. `/guides/outsourced-sdr-cost/`
12. `/guides/hire-sdr-vs-outsource/`
13. `/guides/pay-per-meeting-lead-generation/`
14. `/compare/outbound-agency-vs-in-house-sdr/`
15. `/compare/outbound-agency-vs-freelancer/`

### Wave 3: defensible vertical relevance (weeks 9-12)

16. `/industries/cybersecurity-lead-generation/`
17. `/industries/b2b-saas-lead-generation/`
18. `/industries/consulting-lead-generation/`

Do not publish `/compare/belkins-alternatives/` until Beespoke has independently reviewed the current Belkins offer and at least four alternatives. Comparison pages must be dated, fair, sourced, and useful even when Beespoke is not the best fit.

## Page standards

Every acquisition page must have:

- one unique primary query and one dominant search intent;
- a server-rendered or static `200` response;
- unique title, description, H1, canonical, Open Graph metadata, and breadcrumbs;
- a direct 40-80 word answer near the top;
- at least one original decision tool, table, template, example, or dataset;
- contextual links to its parent, two siblings, one proof page, and the booking CTA;
- visible author, last-updated date, and factual source notes;
- `BreadcrumbList` plus the most accurate page-type schema;
- no unsupported performance promises, review markup, or client claims.

FAQ sections should exist only when they add real buyer value. Google rarely shows FAQ rich results for ordinary commercial sites, so FAQ markup is not a growth strategy.

## Templates

### Service page

1. Direct definition and outcome.
2. Who the service is and is not for.
3. Exact deliverables.
4. How targeting, messaging, follow-up, qualification, and booking work.
5. Channel-specific limitations and risks.
6. Relevant campaign proof.
7. Pricing or a direct pricing link.
8. Evaluation checklist.
9. CTA to discuss fit.

### Cost or pricing guide

1. Current short answer with a range and date.
2. Pricing models table.
3. Cost drivers.
4. Hidden software, data, management, and ramp costs.
5. Worked examples for three company profiles.
6. Downloadable budgeting worksheet or interactive calculator.
7. When each model is economically wrong.
8. Beespoke pricing, disclosed plainly.

### Industry page

1. Why outbound is different in that industry.
2. Likely buying committee and titles.
3. Useful targeting signals.
4. Messaging angles that are credible versus generic.
5. Compliance, trust, or sales-cycle constraints.
6. An anonymized real example or clearly labeled illustrative example.
7. Relevant case study.
8. Fit criteria and CTA.

### Comparison page

1. Verdict by buyer type.
2. Neutral comparison table.
3. Fully loaded cost and ramp assumptions.
4. Control, speed, expertise, risk, and management tradeoffs.
5. Scenarios where each option wins.
6. Transparent methodology, sources, and review date.
7. CTA framed as a fit check, not a predetermined conclusion.

## Original assets that create a moat

The Zapiekanka pages became stronger when they offered practice and reference assets. The Beespoke equivalent is decision utility:

- **Outbound cost calculator:** employee salary, tools, data, management time, agency fee, meetings, show rate, opportunity rate, ACV, and break-even point.
- **Qualified-meeting definition builder:** company fit, title/seniority, geography, need/signal, exclusion rules, no-show policy, and acceptance window.
- **Agency evaluation scorecard:** targeting, deliverability, copy, channel mix, reporting, ownership, qualification, and contract terms.
- **ICP worksheet:** firmographic filters, trigger events, buyer committee, exclusions, evidence, and list-size estimate.
- **Campaign benchmark reports:** publish only aggregated first-party numbers with sample size, dates, channel, audience, and methodology.
- **Real outreach teardowns:** anonymized message, reason it worked or failed, reply, follow-up, and lesson.

These assets should be usable without submitting an email. Conversion can be offered afterward through save/export or a consultation.

## Internal linking rules

- `/services/` owns the service map; each child owns one service.
- `/pricing/` owns Beespoke's actual packages; cost guides own market education.
- `/guides/outbound-lead-generation-cost/` owns the broad cost question; narrower appointment-setting and SDR pages own their own models.
- Industry pages explain industry-specific execution; they do not repeat the generic service page.
- Case studies own evidence and narrative; service and industry pages summarize and link to them.
- Comparison pages link to pricing, one relevant service, and a proof page.
- No two URLs may share the same primary keyword.

## Conversion design

Track the full organic path rather than raw traffic:

```text
organic landing -> engaged visit -> proof/pricing view -> booking click -> scheduled call -> held call -> qualified opportunity -> client
```

Use one primary CTA: `Book a 20-minute outbound fit call`. Add a lower-friction CTA on educational pages: `Build your qualification criteria` or `Estimate your outbound cost`.

Create GA4 events for `seo_cta_click`, `pricing_view`, `case_study_view`, `calculator_complete`, `calendly_open`, and `whatsapp_click`. Capture landing page and first-touch query class in the CRM or booking form.

## Technical implementation

1. Keep all public editorial pages as static HTML or pre-rendered pages.
2. Create a page registry (JSON, YAML, or framework content collection) containing slug, title, description, primary keyword, cluster, author, updated date, schema type, related URLs, and sitemap status.
3. Generate `sitemap.xml` from the registry. Do not use `changefreq` or priority as a substitute for real crawl signals.
4. Add `/robots.txt`, canonical consistency, a real 404 page, breadcrumb navigation, and XML sitemap validation.
5. Put proposal and client-only pages behind access control and `noindex` headers.
6. Add organization, person, service, article, and breadcrumb schema only where each entity is visible and accurate.
7. Keep images compressed, specify dimensions, and meet Core Web Vitals on mobile.
8. Add a CI check for duplicate titles, duplicate primary keywords, broken internal links, missing canonicals, invalid JSON-LD, thin pages, and orphaned pages.

## Measurement and publishing rules

Set up Google Search Console and Bing Webmaster Tools before the first cluster launches. Record a dated baseline.

Review monthly:

- indexed versus submitted URLs;
- impressions, clicks, CTR, and position by page and query;
- non-brand versus brand queries;
- assisted pricing and case-study views;
- booking clicks, held calls, qualified opportunities, and revenue by landing page.

Decision rules:

- Under 100 impressions: collect more data unless indexing or intent is clearly wrong.
- Position 4-20 with impressions: improve direct answers, original utility, proof, and internal links.
- Position 1-5 with weak CTR: test title and description against the actual SERP.
- Two URLs earning the same query: inspect intent and consolidate if they solve the same job.
- No impressions after 6-8 weeks of confirmed indexing: reassess whether the query deserves its own URL.
- Traffic without commercial progression: tighten audience fit rather than adding more volume.

## Guardrails

- Do not generate dozens of city pages; Beespoke serves internationally and local intent is not the core buying job.
- Do not publish one near-identical page per industry without first-party insight.
- Do not target tool tutorials as the main strategy; they attract operators more often than buyers.
- Do not claim email, phone, or multichannel execution on a service page unless Beespoke currently delivers it.
- Do not invent client names, outcomes, benchmarks, testimonials, or search-volume numbers.
- Do not update year labels without materially rechecking the facts.
- Do not use AI-written comparison pages without independent verification of every vendor claim.

## Success criterion

The first milestone is not 10,000 monthly visits. It is a small set of pages that consistently attract founders and sales leaders already deciding how to build pipeline, then produce attributable qualified conversations. Ten high-intent organic leads are more valuable than thousands of tutorial visits from people who will never hire Beespoke.

