const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const asset = require('./asset-version');

const root = path.resolve(__dirname, '..');
const origin = 'https://outbound-lead-generation.com';
const route = '/guides/b2b-lead-generation-consultant-vs-agency/';
const revision = '2026-11-04';
const revisionTime = '2026-11-04T09:46:49+01:00';
const locales = ['en', 'es', 'ca', 'fr'];
const sources = [
  ['Raheel Bodla', 'https://raheelbodla.com/b2b-lead-generation-consultant-vs-agency/'],
  ['Global BPO Index', 'https://globalbpoindex.com/guides/lead-generation-consultants/'],
  ['Credo', 'https://getcredo.com/guide/busy-executives-guide-hiring-digital-agency/agency-vs-consultant/'],
  ['Sales Higher', 'https://saleshigher.com/lead-generation-consultancy/'],
  ['CadenceSEO', 'https://www.cadenceseo.com/blog/marketing-consultant-or-marketing-agency-which-one-is-for-me/']
];
const relatedRoutes = [
  '/guides/b2b-lead-generation-audit/',
  '/guides/how-to-choose-an-outbound-lead-generation-agency/',
  '/guides/outsourced-sdr-vs-lead-generation-agency/',
  '/guides/outbound-lead-generation-cost/',
  '/editorial-policy/'
];
const legacyTargets = {
  'separate-advice-execution-and-capacity': 'm-models',
  'lead-generation-model-selector': 'm-cases',
  'choose-according-to-the-binding-constraint': 'm-brief',
  'define-deliverables-that-reveal-whether-learning-occurred': 'm-work',
  'compare-economics-using-the-cost-of-the-missing-capability': 'm-costs',
  'diligence-the-person-process-and-commercial-incentives': 'm-diligence',
  'buyer-decision-guide': 'm-record',
  'frequently-asked-questions': 'm-faq',
  sources: 'm-sources'
};
const fitIds = {
  en: 'beespoke-s-position-and-fit-boundary',
  es: 'beespoke-s-position-and-encaje-boundary',
  ca: 'beespoke-s-position-and-encaix-boundary',
  fr: 'beespoke-s-position-and-adéquation-boundary'
};
const e = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const decode = value => value.replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const dataPath = (prefix, name) => path.join(root, (prefix + name).slice(1), 'index.html');

function updateGraph(html, callback) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (_, raw) => {
    const graph = JSON.parse(raw);
    callback(graph['@graph'] || [graph]);
    return '<script type="application/ld+json">' + json(graph) + '</script>';
  });
}

function renderBlock(block, doc) {
  switch (block.type) {
    case 'p':
      return '<p>' + e(block.text) + '</p>';
    case 'heading':
      return '<h3>' + e(block.text) + '</h3>';
    case 'record': {
      const record = [block.title, ...block.rows.map(([label, text]) => label + '\n' + text)].join('\n\n');
      return '<div class="m-record" data-model-record><pre tabindex="0" role="region" aria-label="' +
        e(block.title) + '">' + e(record) + '</pre></div>';
    }
    case 'table': {
      const head = block.heads.map(h => '<th scope="col">' + e(h) + '</th>').join('');
      const body = block.rows.map(([first, ...cells]) => '<tr><th scope="row">' + e(first) +
        '</th>' + cells.map(c => '<td>' + e(c) + '</td>').join('') + '</tr>').join('');
      return '<div class="m-table-block" data-columns="' + block.heads.length +
        '"><p class="m-table-hint">' + e(doc.scroll) + '</p><div class="m-table-wrap" tabindex="0" role="region" aria-label="' +
        e(block.caption) + '"><table><caption><span>' + e(block.caption) + '</span></caption><thead><tr>' +
        head + '</tr></thead><tbody>' + body + '</tbody></table></div></div>';
    }
    default:
      throw Error('Unknown consultant guide block: ' + block.type);
  }
}

function buildLocale(locale) {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const url = origin + prefix + route;
  const file = dataPath(prefix, route);
  const doc = require('../data/consultant-article-20261104/' + locale + '.json');
  const legacy = { ...legacyTargets, [fitIds[locale]]: 'm-service' };
  const link = (p, label) => '<a href="' + prefix + p + '">' + e(label) + '</a>';
  const related = i => link(relatedRoutes[i], doc.relatedLabels[i]);
  const sections = [
    ...doc.sections,
    { id: 'm-faq', label: doc.faq, title: doc.faq },
    { id: 'm-sources', label: doc.sourcesTitle, title: doc.sourcesTitle }
  ];
  const nav = sections.map(s => '<a class="m-section-link" href="#' + s.id + '" data-jump="' + s.id + '">' +
    e(s.label) + '</a>').join('');
  const navElement = '<nav data-model-contents aria-label="' + e(doc.contents) + '">' + nav + '</nav>';
  let html = fs.readFileSync(file, 'utf8');
  const h1 = html.match(/<h1>([\s\S]*?)<\/h1>/);
  assert(h1, 'Missing original guide H1');
  const heading = decode(h1[1]);

  const additional = {
    'm-brief': '<p class="m-links">' + related(0) + '</p>',
    'm-scopes': '<p class="m-links">' + related(1) + '</p>',
    'm-costs': '<p class="m-links">' + related(3) + '</p>',
    'm-service': '<p class="m-links">' + link('/services/outbound-lead-generation/', doc.serviceLinks[0]) +
      ' · ' + link('/pricing/', doc.serviceLinks[2]) + '</p><p><a class="m-button" href="/book/?' +
      (prefix ? 'lang=' + locale + '&amp;' : '') + 'cta=consultant-guide">' + e(doc.serviceLinks[1]) + '</a></p>',
    'm-faq': doc.faqs.map(([q, a]) => '<details><summary>' + e(q) + '</summary><p>' + e(a) + '</p></details>').join(''),
    'm-sources': '<p>' + e(doc.sourcesIntro) + '</p><ul>' +
      sources.map(([label, href], i) => '<li><a href="' + e(href) + '" rel="noopener">' + e(label) +
        '</a> — ' + e(doc.sourceNotes[i]) + '</li>').join('') + '</ul><h3>' + e(doc.relatedTitle) +
      '</h3><div class="m-related">' + relatedRoutes.map((_, i) => related(i)).join('') + '</div>'
  };
  const content = sections.map(s => {
    const anchors = Object.entries(legacy).filter(([, target]) => target === s.id)
      .map(([id]) => '<span class="legacy-anchor" id="' + e(id) + '" aria-hidden="true"></span>').join('');
    return '<section class="m-section' + (s.id === 'm-service' ? ' m-handoff' : '') + '" id="' + s.id + '" tabindex="-1" data-section-label="' + e(s.label) +
      '"><h2>' + e(s.title) + '</h2>' + anchors +
      (s.blocks || []).map(b => renderBlock(b, doc)).join('') + (additional[s.id] || '') + '</section>';
  }).join('\n');
  const main = '<main class="m-main" id="main-content"><div class="m-hero"><p class="m-breadcrumb">' +
    link('/resources/', doc.resources) + ' / ' + h1[1] + '</p><p class="m-kicker">' + e(doc.kicker) +
    '</p>' + h1[0] + '<p class="m-lead">' + e(doc.answer) + '</p><p><a class="m-button" data-jump="m-cases" href="#m-cases">' +
    e(doc.read) + '</a></p><p class="m-meta">' + e(doc.author) + ' ' + link('/about/noah-levy/', 'Noah Levy') +
    ' · <time datetime="' + revision + '">' + e(doc.updated) + '</time></p><p class="m-small">' + e(doc.fiction) +
    '</p></div><details class="m-mobile-contents"><summary>' + e(doc.contents) + '</summary>' + navElement +
    '</details><div class="m-layout"><aside class="m-rail"><p>' + e(doc.contents) + '</p>' + navElement +
    '</aside><div class="m-content"><article>' + content + '</article></div></div></main>';

  // Reuse the existing scoped article skin and reading controls without changing shared assets.
  const shell = '<div id="beespoke-model-full"><div class="m-page">' + main +
    '</div><script type="application/json" data-model-config>' + json({ locale, legacy }) + '</script></div>';
  html = html.replace(/<div id="beespoke-model-full"><div class="m-page">(<main[\s\S]*?<\/main>)<\/div><script type="application\/json" data-model-config>[\s\S]*?<\/script><\/div>/, '$1')
    .replace(/<main\b[^>]*>[\s\S]*?<\/main>/, () => shell)
    .replace(/<body class="([^"]+)">/, (_, classes) =>
      '<body class="' + (classes.includes('model-article-page') ? classes : classes + ' model-article-page') + '">');
  for (const [attr, key] of [['name', 'description'], ['property', 'og:description'], ['name', 'twitter:description']]) {
    html = html.replace(new RegExp('(<meta ' + attr + '="' + key + '" content=")[^"]*(")'), (_, a, z) => a + e(doc.description) + z);
  }
  html = updateGraph(html, nodes => {
    const article = nodes.find(n => n['@type'] === 'Article');
    assert(article);
    Object.assign(article, { name: heading, headline: heading, description: doc.description, dateModified: revisionTime, inLanguage: locale });
    const crumbs = nodes.find(n => n['@type'] === 'BreadcrumbList');
    if (crumbs) crumbs.itemListElement = [
      { '@type': 'ListItem', position: 1, name: doc.resources, item: origin + prefix + '/resources/' },
      { '@type': 'ListItem', position: 2, name: heading, item: url }
    ];
    let faq = nodes.find(n => n['@type'] === 'FAQPage');
    if (!faq) {
      faq = { '@type': 'FAQPage', '@id': url + '#faq' };
      nodes.push(faq);
    }
    faq.mainEntity = doc.faqs.map(([q, a]) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a }
    }));
  });
  html = html.replace(/<link rel="stylesheet" href="\/model-article\.css[^"]*">/g, '')
    .replace(/<script src="\/model-article\.js[^"]*" defer><\/script>/g, '')
    .replace('</head>', '<link rel="stylesheet" href="' + asset('/model-article.css') +
      '"><script src="' + asset('/model-article.js') + '" defer></script></head>');
  fs.writeFileSync(file, html);

  const hub = dataPath(prefix, '/resources/');
  const card = new RegExp('(<a class="journal-resource-link" href="' + prefix + route +
    '"[^>]*><div><h2[^>]*>[\\s\\S]*?</h2>)(?:<p>[\\s\\S]*?</p>)?');
  const hubHtml = fs.readFileSync(hub, 'utf8');
  assert(card.test(hubHtml), 'Missing consultant guide resource card: ' + locale);
  fs.writeFileSync(hub, hubHtml.replace(card, (_, start) => start + '<p>' + e(doc.description) + '</p>'));
}

for (const locale of locales) buildLocale(locale);
const sitemapPath = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const locale of locales) {
  const url = origin + (locale === 'en' ? '' : '/' + locale) + route;
  const date = new RegExp('(<loc>' + url.replaceAll('.', '\\.') + '</loc><lastmod>)[^<]+(</lastmod>)');
  assert(date.test(sitemap), 'Missing sitemap entry: ' + locale);
  sitemap = sitemap.replace(date, (_, a, z) => a + revision + z);
}
fs.writeFileSync(sitemapPath, sitemap);
console.log('Consultant versus agency guide: rebuilt all four localized pages and resource cards.');

