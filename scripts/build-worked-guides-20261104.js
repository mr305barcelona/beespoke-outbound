const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const asset = require('./asset-version');
const root = path.resolve(__dirname, '..');
const origin = 'https://outbound-lead-generation.com';
const revision = '2026-11-04';
const stamp = '2026-11-04T10:28:58+01:00';
const targets = {
  manage: '/guides/how-to-manage-an-outsourced-sdr-team/',
  manufacturing: '/industries/manufacturing-lead-generation/',
  inhouse: '/compare/lead-generation-agency-vs-in-house-team/',
  risks: '/guides/outsourced-sdr-pros-and-cons/',
  roles: '/compare/sdr-vs-bdr-outsourcing/'
};
const locales = ['en', 'es', 'ca', 'fr'];
const labels = {
  en: ['Updated November 4, 2026','Sources for this example','See managed outbound scope','Discuss the handoff with Noah'],
  es: ['Actualizado el 4 de noviembre de 2026','Fuentes del ejemplo','Ver el alcance outbound','Hablar con Noah sobre el traspaso'],
  ca: ['Actualitzat el 4 de novembre de 2026','Fonts de l’exemple','Veure l’abast outbound','Parlar amb en Noah sobre el traspàs'],
  fr: ['Mis à jour le 4 novembre 2026','Sources de l’exemple','Voir le périmètre de prospection','Parler de la passation avec Noah']
};
const topics = {
  manage: ['Outsourced SDR management','Gestión de equipos SDR externos','Gestió d’equips SDR externs','Gestion des équipes SDR externalisées'],
  manufacturing: ['Industrial lead generation','Captación industrial','Captació industrial','Génération de leads industriels'],
  inhouse: ['Lead generation operating models','Modelos de captación','Models de captació','Modèles de génération de leads'],
  risks: ['Outsourced SDR decision guide','Guía de externalización SDR','Guia d’externalització SDR','Guide d’externalisation SDR'],
  roles: ['Sales development roles','Funciones de desarrollo comercial','Funcions de desenvolupament comercial','Fonctions de développement commercial']
};
const sources = {
  manage: [['Near','https://www.hirewithnear.com/blog/outsourced-sdr-what-to-look-for-and-how-to-work-together'],['SalesHive','https://saleshive.com/blog/sales-development-reps-best-practices-teams'],['G2','https://learn.g2.com/sdr-playbook']],
  manufacturing: [['Thomasnet','https://blog.thomasnet.com/lead-generation-for-manufacturers-industrial-tips-tricks-and-ideas'],['Percepture','https://percepture.com/manufacturing-insights/industrial-lead-generation-for-manufacturers/'],['CUFinder','https://cufinder.io/blog/lead-generation-industry/manufacturing/']],
  inhouse: [['Leadfeeder','https://www.leadfeeder.com/blog/comparisons/lead-generation-agency-vs-in-house-lead-generation/'],['LeadHaste','https://leadhaste.com/blog/in-house-vs-outsourced-lead-generation'],['TradeWind','https://www.tradewindsdr.com/blog/lead-generation-outsourcing-a-complete-guide']],
  risks: [['Callbox','https://www.callboxinc.com/growth-hacking/advantages-outsourcing-sdr-services/'],['Virtustant','https://www.virtustant.com/blog/outsourced-sdr-pros-cons'],['Belkins','https://belkins.io/blog/inhouse-vs-outsourced-sdrs']],
  roles: [['Sales Focus','https://www.salesfocusinc.com/sdr-vs-bdr/'],['Near','https://www.hirewithnear.com/blog/outsourcing-bdr-and-sdr-roles-a-comprehensive-guide'],['Sales Enablement Collective','https://www.salesenablementcollective.com/the-role-of-bdrs-sdrs-vs-account-executives/']]
};
const esc = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const resolve = (prefix, route) => path.join(root, (prefix + route).slice(1), 'index.html');
const href = (url, name) => '<a href="' + esc(url) + '">' + esc(name) + '</a>';

function block(b) {
  if (b.kind === 'paragraph') return '<p>' + esc(b.text) + '</p>';
  if (b.kind === 'record') {
    const rows = b.rows.map(([k,v]) => '<dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd>').join('');
    return '<div class="worked-record"><h4>' + esc(b.title) + '</h4><dl>' + rows + '</dl></div>';
  }
  assert.equal(b.kind,'table');
  const head = b.heads.map(x => '<th scope="col">' + esc(x) + '</th>').join('');
  const rows = b.rows.map(([name,...rest]) => '<tr><th scope="row">' + esc(name) + '</th>' +
    rest.map(x => '<td>' + esc(x) + '</td>').join('') + '</tr>').join('');
  return '<div class="table-wrap" tabindex="0" role="region" aria-label="' + esc(b.title) +
    '"><table><caption>' + esc(b.title) + '</caption><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
}

const costLabels = {
  es: ['Compara tus costes a 3, 6 y 12 meses','Moneda','Arranque gestionado','Operación gestionada mensual','Herramientas externas mensuales','Tiempo mensual del cliente','Contratación inicial','Operación interna mensual','Herramientas internas mensuales','Supervisión interna mensual','Calcular','Restablecer','Introduce todos los costes. Un campo vacío queda pendiente.'],
  ca: ['Compara els costos a 3, 6 i 12 mesos','Moneda','Arrencada gestionada','Operació gestionada mensual','Eines externes mensuals','Temps mensual del client','Contractació inicial','Operació interna mensual','Eines internes mensuals','Supervisió interna mensual','Calcula','Restableix','Introdueix tots els costos. Un camp buit queda pendent.'],
  fr: ['Comparez vos coûts sur 3, 6 et 12 mois','Devise','Démarrage géré','Exécution gérée mensuelle','Outils externes mensuels','Temps client mensuel','Recrutement initial','Exécution interne mensuelle','Outils internes mensuels','Encadrement interne mensuel','Calculer','Réinitialiser','Renseignez tous les coûts. Un champ vide reste à confirmer.']
};
function costModel(locale) {
  const [title,currency,...copy] = costLabels[locale];
  const keys = ['agencySetup','agencyMonthly','agencyTools','agencyOwner','internalHire','internalMonthly','internalTools','internalOwner'];
  const fields = keys.map((key,i) => '<label for="worked-model-' + key + '">' + esc(copy[i]) +
    '</label><input id="worked-model-' + key + '" name="' + key +
    '" data-model-input type="number" min="0" max="1000000000" step="any" inputmode="decimal">').join('');
  return '<div class="worked-chapter" id="worked-calculator"><h3>' + esc(title) +
    '</h3><div data-buyer-model class="worked-calculator"><label for="worked-model-currency">' + esc(currency) +
    '</label><select id="worked-model-currency" name="currency"><option>USD</option><option>EUR</option></select>' +
    fields + '<div><button type="button" data-model-calculate disabled>' + esc(copy[8]) +
    '</button> <button type="button" data-model-reset disabled>' + esc(copy[9]) +
    '</button></div><p data-model-status role="status">' + esc(copy[10]) +
    '</p><div data-model-output class="table-wrap" hidden></div></div></div>';
}

function build(id,route,l) {
  const prefix = l === 'en' ? '' : '/' + l;
  const filename = resolve(prefix,route);
  const doc = require('../data/worked-guides-20261104/' + id + '/' + l + '.json');
  const [updated,sourceLabel,service,cta] = labels[l];
  const section = '<section class="worked-guide" id="worked-example" tabindex="-1"><h2>' + esc(doc.title) +
    '</h2><p class="worked-fiction">' + esc(doc.fiction) + '</p>' +
    doc.sections.map((s,i) => '<div class="worked-chapter" id="worked-example-' + (i+1) + '"><h3>' +
      esc(s.title) + '</h3>' + s.blocks.map(block).join('') + '</div>').join('\n') +
    (id === 'inhouse' && l !== 'en' ? costModel(l) : '') +
    '<p class="worked-sources">' + esc(sourceLabel) + ' · ' + sources[id].map(([name,url]) => href(url,name)).join(' · ') + '</p>' +
    (id === 'manage' ? '<p class="worked-cta">' + href(prefix+'/services/outbound-lead-generation/', service) +
      ' · ' + href('/book/?'+(prefix ? 'lang='+l+'&' : '')+'cta=guide-sdr-management',cta) + '</p>' : '') + '</section>';
  let h = fs.readFileSync(filename,'utf8');
  assert(!h.includes('id="worked-example"'),'Expected a clean upstream article '+filename);
  assert(h.includes('<article>') && h.includes('<p class="answer">'));
  h = h.replace('<article>', () => '<article>' + section)
    .replace(/(<p class="answer">)[\s\S]*?(<\/p>)/, (_,a,z) => a + esc(doc.answer) + z)
    .replace(/(<p class="meta">[\s\S]*?·\s*)[^<]+(<\/p>)/, (_,a,z) => a + '<time datetime="' + revision + '">' + esc(updated) + '</time>' + z);
  const topic = esc(topics[id][locales.indexOf(l)]);
  h = h.replace(/(<p class="eyebrow">)[\s\S]*?(<\/p>)/, (_,a,z) => a + topic + z)
    .replace(/(<div class="breadcrumbs"><a href=")\/("[^>]*>[^<]+<\/a><span>\/<\/span><span>)[\s\S]*?(<\/span><\/div>)/,
      (_,a,b,z) => a + prefix + '/' + b + topic + z);
  const toc = href('#worked-example',doc.toc);
  h = h.replace(/(<details class="mobile-toc">[\s\S]*?<nav\b[^>]*>)/, (_, start) => start + toc)
    .replace(/(<aside class="toc">[\s\S]*?<\/div>)/, (_, start) => start + toc);
  if (id === 'manage') {
    h = h.replace(/<main\b[^>]*>[\s\S]*?<\/main>/, main => main
      .replace(/<aside class="inline-cta">[\s\S]*?<\/aside>/g,'')
      .replace(/<section class="final-cta">[\s\S]*?<\/section>/g,'')
      .replaceAll('https://calendly.com/noahlevybuilds/30min','/book/?'+(prefix ? 'lang='+l+'&amp;' : '')+'cta=guide-sdr-management-hero')
      .replace(/<a href="https:\/\/memoryblue\.com\/wp-content\/uploads\/[^"]+">[^<]+<\/a>/, href('https://memoryblue.com/blog/choosing-your-sales-outsourcing-partner-how-to-get-it-right/','memoryBlue')));
  }
  for (const [key,val] of [['name','description'],['property','og:description'],['name','twitter:description']]) {
    h = h.replace(new RegExp('(<meta '+key+'="'+val+'" content=")[^"]*(")'),(_,a,z) => a + esc(doc.description) + z);
  }
  h = h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (_,raw) => {
    const schema = JSON.parse(raw);
    for (const node of schema['@graph'] || [schema]) if (node['@type'] === 'Article') {
      node.description = doc.description; node.dateModified = stamp; node.inLanguage = l;
    }
    return '<script type="application/ld+json">' + JSON.stringify(schema).replace(/</g,'\\u003c') + '</script>';
  }).replace(/<body class="([^"]+)">/,'<body class="$1 worked-guide-page">')
    .replace('</head>','<link rel="stylesheet" href="' + asset('/worked-guides.css') + '"></head>');
  if (id === 'inhouse' && l !== 'en') h = h.replace('</head>', '<script src="' + asset('/buyer-model.js') + '" defer></script></head>');
  assert(h.includes('href="#worked-example"') && h.includes('datetime="'+revision+'"'));
  fs.writeFileSync(filename,h);
  const hub = resolve(prefix,'/resources/');
  const card = new RegExp('(<a class="journal-resource-link" href="' + prefix + route + '"[^>]*><div><h2[^>]*>[\\s\\S]*?</h2>)(?:<p>[\\s\\S]*?</p>)?');
  const current = fs.readFileSync(hub,'utf8');
  if (card.test(current)) fs.writeFileSync(hub,current.replace(card,(_,start) => start + '<p>' + esc(doc.description) + '</p>'));
}

for (const [id,route] of Object.entries(targets)) for (const l of locales) build(id,route,l);
const sitemapPath = path.join(root,'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath,'utf8');
for (const route of Object.values(targets)) for (const l of locales) {
  const u = origin + (l === 'en' ? '' : '/' + l) + route;
  const tag = new RegExp('(<loc>' + u.replaceAll('.','\\.') + '</loc><lastmod>)[^<]+(</lastmod>)');
  assert(tag.test(sitemap), 'Missing sitemap entry ' + u);
  sitemap = sitemap.replace(tag,(_,a,z) => a + revision + z);
}
fs.writeFileSync(sitemapPath,sitemap);
console.log('Rebuilt five worked buyer guides in English, Spanish, Catalan and French.');

