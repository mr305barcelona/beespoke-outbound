const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const internalTraffic = require('./build-internal-traffic');
internalTraffic.build();
const origin = 'https://outbound-lead-generation.com';
const locales = ['en', 'es', 'ca', 'fr'];
const prefix = l => l === 'en' ? '' : `/${l}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const write = (f, text) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), text); };
const copy = {
  en: { name: 'Resources', home: 'Home', language: 'Language', title: 'Guides and campaign planning resources', description: 'Browse existing B2B outreach guides, industry planning pages and private campaign worksheets in one place.', intro: 'Choose a topic, then open the existing guide or worksheet. Use the planning worksheets to organize your own evidence and decisions.', browse: 'Browse all guides and planning resources', sections: ['Planning worksheets','Services and channels','Approaches and sales roles','Campaign execution','Industry planning','Published case studies','Editorial methodology'], planning: ['ICP scorecard','Outbound campaign brief'], jump: 'Resource categories' },
  es: { name: 'Recursos', home: 'Inicio', language: 'Idioma', title: 'Guías y recursos para planificar campañas', description: 'Encuentra guías de prospección B2B, páginas por sector y plantillas privadas de planificación de campañas.', intro: 'Elige un tema y abre la guía o plantilla. Usa las plantillas para ordenar tus propias pruebas y decisiones.', browse: 'Ver todas las guías y plantillas de planificación', sections: ['Plantillas de planificación','Servicios y canales','Enfoques y roles comerciales','Ejecución de campañas','Planificación por sector','Casos publicados','Metodología editorial'], planning: ['Ficha de evaluación del ICP','Brief de campaña outbound'], jump: 'Categorías de recursos' },
  ca: { name: 'Recursos', home: 'Inici', language: 'Idioma', title: 'Guies i recursos per planificar campanyes', description: 'Troba guies de prospecció B2B, pàgines per sector i plantilles privades de planificació de campanyes.', intro: 'Tria un tema i obre la guia o la plantilla. Fes servir les plantilles per ordenar les teves proves i decisions.', browse: 'Veure totes les guies i plantilles de planificació', sections: ['Plantilles de planificació','Serveis i canals','Enfocaments i rols comercials','Execució de campanyes','Planificació per sector','Casos publicats','Metodologia editorial'], planning: ['Fitxa d’avaluació de l’ICP','Brief de campanya outbound'], jump: 'Categories de recursos' },
  fr: { name: 'Ressources', home: 'Accueil', language: 'Langue', title: 'Guides et ressources pour préparer une campagne', description: 'Retrouvez les guides de prospection B2B, les pages sectorielles et les fiches privées de préparation de campagne.', intro: 'Choisissez un sujet, puis ouvrez le guide ou la fiche. Utilisez les fiches pour organiser vos propres preuves et décisions.', browse: 'Voir tous les guides et fiches de préparation', sections: ['Fiches de préparation','Services et canaux','Approches et rôles commerciaux','Exécution des campagnes','Préparation par secteur','Cas publiés','Méthodologie éditoriale'], planning: ['Grille d’évaluation de l’ICP','Brief de campagne outbound'], jump: 'Catégories de ressources' }
};
const basePages = JSON.parse(read('data/seo-pages.json'));
const exampleRoutes = require('./build-research-example')();
const exampleCopy = JSON.parse(read('data/research-handoff-example.json'));
// Commercial copy is held for permission. This directory only points to
// existing non-pricing guides; it makes no new offer or competitor claims.
const held = /pricing|cost|pay-per-meeting|best-|benchmark|agency-vs-software|b2b-seo-vs-ppc/;
const eligible = basePages.filter(p => !held.test(p.path));
const titleFor = (l, p) => {
  const html = read(`${prefix(l).slice(1)}${prefix(l) ? '/' : ''}${p.path.slice(1)}index.html`);
  return html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
};
const hubRoutes = locales.map(l => `${prefix(l)}/resources/`);
for (const l of locales) {
  const c = copy[l], route = `${prefix(l)}/resources/`, home = `${prefix(l)}/`;
  const groups = [
    ['planning', [...['/downloads/beespoke-icp-scorecard/','/downloads/beespoke-outbound-campaign-brief/'].map((p,i) => ({url:prefix(l)+p,name:c.planning[i]})), {url:exampleRoutes[locales.indexOf(l)],name:exampleCopy[l].resourceLabel}]],
    ['channels', eligible.filter(p => p.path.startsWith('/services/')).map(p => ({url:prefix(l)+p.path,name:titleFor(l,p)}))],
    ['roles', eligible.filter(p => p.path.startsWith('/compare/')).map(p => ({url:prefix(l)+p.path,name:titleFor(l,p)}))],
    ['execution', eligible.filter(p => p.path.startsWith('/guides/')).map(p => ({url:prefix(l)+p.path,name:titleFor(l,p)}))],
    ['industries', eligible.filter(p => p.path.startsWith('/industries/')).map(p => ({url:prefix(l)+p.path,name:titleFor(l,p)}))],
    ['cases', eligible.filter(p => p.path.startsWith('/case-studies/')).map(p => ({url:prefix(l)+p.path,name:titleFor(l,p)}))],
    ['methodology', eligible.filter(p => p.path === '/editorial-policy/').map(p => ({url:prefix(l)+p.path,name:titleFor(l,p)}))]
  ];
  const listed = groups.flatMap(g => g[1]);
  const schema = {'@context':'https://schema.org','@graph':[
    {'@type':'CollectionPage','@id':origin+route+'#webpage',url:origin+route,name:c.title,description:c.description,inLanguage:l,mainEntity:{'@id':origin+route+'#resources'}},
    {'@type':'ItemList','@id':origin+route+'#resources',itemListElement:listed.map((r,i) => ({'@type':'ListItem',position:i+1,name:r.name,url:origin+r.url}))},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:c.home,item:origin+home},{'@type':'ListItem',position:2,name:c.name,item:origin+route}]}
  ]};
  const alternate = [...locales,'x-default'].map(x => `<link rel="alternate" hreflang="${x}" href="${origin}${prefix(x === 'x-default' ? 'en' : x)}/resources/">`).join('');
  const language = locales.map(x => `<a href="${prefix(x)}/resources/" lang="${x}"${x===l?' aria-current="page"':''}>${({en:'English',es:'Español',ca:'Català',fr:'Français'})[x]}</a>`).join('');
  write(route.slice(1)+'index.html', `<!DOCTYPE html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.title)} | Beespoke</title><meta name="description" content="${esc(c.description)}"><meta name="robots" content="index, follow"><link rel="canonical" href="${origin}${route}">${alternate}<meta property="og:type" content="website"><meta property="og:title" content="${esc(c.title)}"><meta property="og:description" content="${esc(c.description)}"><meta property="og:url" content="${origin}${route}"><meta property="og:image" content="${origin}/assets/social/beespoke-og.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.png"><link rel="stylesheet" href="/seo.css"><script async src="https://www.googletagmanager.com/gtag/js?id=G-KDXYW9W2BB"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-KDXYW9W2BB');</script><script src="/seo.js" defer></script><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head><body><a class="skip-link" href="#main-content">${esc(({en:'Skip to main content',es:'Saltar al contenido principal',ca:'Ves al contingut principal',fr:'Aller au contenu principal'})[l])}</a><header class="site-header"><nav aria-label="${esc(c.home)}"><a class="brand" href="${home}"><span>B</span>Beespoke Outbound</a><div><a href="#planning">${esc(c.sections[0])}</a></div><div class="language-switcher"><button type="button" aria-expanded="false" aria-label="${c.language}">${l.toUpperCase()}</button><div>${language}</div></div></nav></header><div class="breadcrumbs"><a href="${home}">${esc(c.home)}</a><span aria-hidden="true">/</span><span>${esc(c.name)}</span></div><main id="main-content" class="resource-hub"><header class="hero"><p class="eyebrow">${esc(c.name)}</p><h1>${esc(c.title)}</h1><p class="answer">${esc(c.intro)}</p></header><nav class="resource-jump" aria-label="${esc(c.jump)}">${groups.map((g,i)=>`<a href="#${g[0]}">${esc(c.sections[i])}</a>`).join('')}</nav><div class="resource-sections">${groups.map((g,i)=>`<section id="${g[0]}" class="resource-section"><h2>${esc(c.sections[i])}</h2><ul class="resource-cards">${g[1].map(r=>`<li><a href="${r.url}">${esc(r.name)}</a></li>`).join('')}</ul></section>`).join('')}</div></main><footer><a href="${home}">Beespoke Outbound</a> · <a href="${prefix(l)}/editorial-policy/">${esc(c.sections[6])}</a></footer></body></html>\n`);
}

const imageVariants = JSON.parse(read('data/site-image-variants.json'));
let sitemap = read('sitemap.xml');
for (const r of [...hubRoutes,...exampleRoutes]) {
  if (!sitemap.includes(`<loc>${origin}${r}</loc>`)) sitemap = sitemap.replace('</urlset>', `  <url><loc>${origin}${r}</loc><lastmod>2026-10-16</lastmod></url>\n</urlset>`);
  if (hubRoutes.includes(r)) sitemap = sitemap.replace(new RegExp(`(<loc>${origin.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}${r}</loc><lastmod>)[^<]+(</lastmod>)`),(all,before,after)=>`${before}2026-10-16${after}`);
}
write('sitemap.xml', sitemap);
const publicRoutes = [...sitemap.matchAll(/<loc>https:\/\/outbound-lead-generation\.com([^<]+)<\/loc>/g)].map(m=>m[1]);
const extraRoutes = ['/book/','/booking-confirmed/',...locales.flatMap(l=>['/downloads/beespoke-icp-scorecard/','/downloads/beespoke-outbound-campaign-brief/'].map(p=>prefix(l)+p))];
const files = [...new Set([...publicRoutes,...extraRoutes])].map(p => p === '/' ? 'index.html' : p.slice(1)+'index.html');
const hashes = {};
const version = file => hashes[file] ||= crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,12);
for (const file of files) {
  let html = read(file), lang = html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'en';
  if (!copy[lang]) lang = 'en';
  const c = copy[lang], hub = `${prefix(lang)}/resources/`;
  // Move the existing language disclosure into the header's layout; its links,
  // visible wording and destination language stay unchanged.
  html = html.replace(/<header class="site-header">([\s\S]*?)<\/header>/, (header, inner) => {
    const switcher = inner.match(/<div class="language-switcher">[\s\S]*?<\/div><\/div>/)?.[0];
    if (switcher && inner.includes('</nav>'+switcher)) inner = inner.replace('</nav>'+switcher, switcher+'</nav>');
    inner = inner.replace(new RegExp(`href="${prefix(lang)}/research/2026-b2b-outbound-pricing-benchmark/">([^<]+)</a>`), `href="${hub}">$1</a>`);
    return `<header class="site-header">${inner}</header>`;
  });
  if (['index.html','es/index.html','ca/index.html','fr/index.html'].includes(file)) {
    // CSS property names must stay valid after prose localization.
    html = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/g,
      (all, open, css, close) => open + css.replace(/\bobject-(?:encaje|encaix|adéquation)(?=\s*:)/g, 'object-fit') + close);
    // Keep visible branding and contact wording in the accessible name.
    const navName = {en:'Primary navigation',es:'Navegación principal',ca:'Navegació principal',fr:'Navigation principale'}[lang];
    const homeName = {en:'home',es:'inicio',ca:'inici',fr:'accueil'}[lang];
    html = html.replace(/(<nav class="nav" aria-label=")[^"]*(")/, `$1${navName}$2`);
    html = html.replace(/(<a class="brand"[^>]*aria-label=")[^"]*(")/, `$1B Beespoke Outbound, ${homeName}$2`);
    html = html.replace(/<div class="brand-mark"(?: aria-hidden="true")?>/, '<div class="brand-mark" aria-hidden="true">');
    html = html.replace(/(\.whatsapp-float\s*\{[^}]*\bcolor:)\s*#ffffff/i, '$1 #101828');
    html = html.replace(/(<a\b[^>]*class="whatsapp-float"[^>]*?)\s+aria-label="[^"]*"/g, '$1');
    if (!html.includes('class="resource-directory-link"')) html = html.replace(/(<h2 id="resources-title">[\s\S]*?<\/h2>)/, `$1<p class="resource-directory-link"><a href="${hub}">${esc(c.browse)} →</a></p>`);
    // Regenerate source candidates from the current manifest on every build.
    html = html.replace(/<picture class="optimized-picture[^>]*><source[^>]*>(<img[^>]*>)<\/picture>/g, '$1');
    html = html.replace(/<img\b[^>]*>/g, img => {
      const src = img.match(/\bsrc="([^"]+)"/)?.[1];
      if (!src) return img;
      const candidates = imageVariants.filter(r => r.source === src.replace(/^\//,''));
      if (!candidates.length) return img;
      const founder = img.includes('founder-photo');
      const srcset = candidates.map(r=>`/${r.output} ${r.width}w`).join(', ');
      return `<picture class="optimized-picture${founder?' founder-picture':''}"><source type="image/webp" srcset="${srcset}" sizes="${founder?'118px':'160px'}">${img}</picture>`;
    });
  }
  // The visible language code must be part of the control's spoken name.
  html = html.replace(/(<div class="language-switcher"><button[^>]*aria-label=")([^"]*)("[^>]*>)([A-Z]{2})(<\/button>)/g,
    (all, before, label, middle, code, after) => `${before}${code} — ${label.replace(/^[A-Z]{2}\s*—\s*/, '').replace(/\s*\([A-Z]{2}\)$/, '')}${middle}${code}${after}`);
  if (!html.includes('href="/technical.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/technical.css"></head>');
  html = html.replace(/\b(src|href)="(\/[^"?#]+\.(?:js|css))(?:\?[^"#]*)?"/g,(all,attr,url)=>{
    const f = url.slice(1);
    return fs.existsSync(path.join(root,f)) ? `${attr}="${url}?v=${version(f)}"` : all;
  });
  // Page authorship and revision metadata describe the document, not the
  // service it describes. Keep the existing page ID and all existing values.
  html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,(all,open,json,close)=>{
    const data = JSON.parse(json), graph = data['@graph'];
    if (!Array.isArray(graph)) return all;
    const index = graph.findIndex(node=>node['@type']==='Service' && (node.author || node.dateModified || node.headline || node.inLanguage));
    if (index < 0) return all;
    const original = graph[index], service = {...original};
    const page = {'@type':'WebPage','@id':original['@id'],url:original.url,name:original.name,description:original.description};
    for (const key of ['dateModified','author','inLanguage','headline']) {
      if (Object.hasOwn(original,key)) page[key]=original[key];
      delete service[key];
    }
    service['@id']=original.url+'#service';
    service.mainEntityOfPage={'@id':page['@id']};
    page.mainEntity={'@id':service['@id']};
    graph.splice(index,1,page,service);
    return open+JSON.stringify(data).replace(/</g,'\\u003c')+close;
  });
  html = internalTraffic.applyGuard(html);
  write(file, html);
}
console.log(`Technical build: ${hubRoutes.length} neutral resource hubs; ${files.length} pages with content-derived asset versions. Commercial articles, metadata, schema and existing lastmod dates preserved.`);

// Add the scoped neutral example after generated/localized content is stable.
require('./build-safe-query-followup')();

// Apply owner-confirmed facts before exact reviewed editorial corrections.
require('./build-commercial-terms')();
// Apply exact, reviewed editorial corrections after generated content is final.
require('./build-reviewed-editorial')();

require('./build-commercial-consistency')();
