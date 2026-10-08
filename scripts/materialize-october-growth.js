// Mechanical materialization of reviewed editorial copy into the existing catalogs.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { pages: additions, dictionaries } = require('../data/october-inbound-guides');
const pagesFile = path.join(root, 'data/seo-pages.json');
let raw = fs.readFileSync(pagesFile, 'utf8');
const existing = JSON.parse(raw);
for (const page of additions) {
  if (existing.some(candidate => candidate.path === page.path)) throw new Error(`Already materialized: ${page.path}`);
}
raw = raw.replace(/\]\s*$/, `,\n${additions.map(page => JSON.stringify(page, null, 2)).join(',\n')}\n]\n`);
const links = {
  '/services/b2b-ppc-agency/': ['/guides/google-ads-management-cost/', '/compare/b2b-seo-vs-ppc/'],
  '/services/b2b-seo-agency/': ['/compare/b2b-seo-vs-ppc/', '/guides/aeo-agency-pricing/'],
  '/services/generative-engine-optimization/': ['/guides/aeo-agency-pricing/', '/compare/b2b-seo-vs-ppc/']
};
for (const page of existing) {
  if (!links[page.path]) continue;
  const prior = `"related":${JSON.stringify(page.related)}`;
  const next = `"related":${JSON.stringify([...page.related, ...links[page.path]])}`;
  if (!raw.includes(prior)) throw new Error(`Expected related-list formatting: ${page.path}`);
  raw = raw.replace(prior, next);
}
fs.writeFileSync(pagesFile, raw);
const overrideFile = path.join(root, 'data/seo-translation-overrides.json');
const overrides = JSON.parse(fs.readFileSync(overrideFile, 'utf8'));
for (const locale of Object.keys(dictionaries)) Object.assign(overrides[locale], dictionaries[locale]);
fs.writeFileSync(overrideFile, JSON.stringify(overrides, null, 2) + '\n');
const benchmarkFile = path.join(root, 'data/seo-serp-benchmark.json');
const benchmarks = JSON.parse(fs.readFileSync(benchmarkFile, 'utf8'));
const refs = [
  ['google ads management cost', 'https://velocityppc.com/blog/google-ads-agency-pricing/'],
  ['b2b seo vs ppc', 'https://www.zapminds.com/insights/seo-vs-ppc-b2b-roi'],
  ['aeo agency pricing', 'https://gigawattgroup.com/insights/geo-aeo-pricing-models-what-agencies-charge-in-2026/']
];
additions.forEach((page, i) => benchmarks.push({
  path: page.path, query: refs[i][0], checked: '2026-10-08',
  serpDifficulty: 'Not measured: no fresh Semrush volume or KD claim',
  competitors: [refs[i][1]],
  serpRequirements: ['direct answer', 'scope', 'fee or channel comparison', 'worked decision framework', 'limitations', 'official sources', 'commercial next step'],
  beespokeAdvantages: ['disclosed hourly rate and weekly minimum', 'explicit fully loaded economics or scope worksheet', 'four reviewed languages', 'no invented client results'],
  externalConstraints: ['limited authority', 'ranking and conversion data needed after publication']
}));
fs.writeFileSync(benchmarkFile, JSON.stringify(benchmarks, null, 2) + '\n');
console.log(`Materialized ${additions.length} guides with Spanish, Catalan and French editorial copy.`);
