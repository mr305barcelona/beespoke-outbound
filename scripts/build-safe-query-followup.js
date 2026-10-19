const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

module.exports = function buildSafeQueryFollowup() {
  const file = path.join(root, 'es/industries/professional-services-lead-generation/index.html');
  let html = fs.readFileSync(file, 'utf8');
  const id = 'professional-services-worked-example';
  const section = `<section id="${id}"><h3>Ejemplo ficticio de prospección para servicios profesionales</h3><p>Una consultora de operaciones quiere explorar si la apertura de una segunda sede crea una necesidad de coordinación. El anuncio público permite investigar esa posibilidad; la necesidad, la prioridad y el presupuesto quedan por confirmar. Esta situación es ficticia y sirve para practicar el método.</p><ol><li><strong>Señal:</strong> registra el anuncio público, su enlace y la fecha. Describe lo que dice la fuente, sin añadir un problema que la empresa no haya comunicado.</li><li><strong>Interlocutor:</strong> identifica quién coordina el proceso entre sedes y quién puede evaluar un cambio. Valida la responsabilidad en esa decisión concreta.</li><li><strong>Hipótesis:</strong> formula una pregunta sobre la coordinación entre ubicaciones y prepara una explicación breve del método de la consultora, con sus límites.</li><li><strong>Cualificación:</strong> confirma el encaje del servicio, la relevancia del problema, la responsabilidad del interlocutor y el siguiente paso acordado.</li></ol><p><strong>Mensaje ilustrativo:</strong> «He visto el anuncio de la nueva sede. ¿Está revisando el equipo cómo coordinar el trabajo entre ubicaciones, o ahora mismo hay otra prioridad?»</p><p>Registra la respuesta y lo que queda por comprobar. Para preparar la siguiente cuenta, consulta el <a href="/es/resources/account-research-handoff-example/">ejemplo completo de investigación de cuentas y traspaso a ventas</a> y completa la <a href="/es/downloads/beespoke-icp-scorecard/">ficha de evaluación del ICP</a>.</p></section>`;
  if (!html.includes(`id="${id}"`)) {
    const target = '<section id="use-triggers-as-research-clues-not-private-knowledge">';
    if (html.split(target).length !== 2) throw new Error('Expected professional-services insertion point');
    const boundary = /(<\/section>\s*)(<section id="use-triggers-as-research-clues-not-private-knowledge">)/;
    if (html.split(boundary).length !== 4) throw new Error('Expected end of offer-definition section');
    html = html.replace(boundary, (all, close, next) => section + close + next);
  }
  // The original title, description, FAQs, commercial copy and other locales stay intact.
  html = html.replace('Actualizado el 9 de octubre de 2026', 'Actualizado el 19 de octubre de 2026');
  html = html.replace(/"dateModified":"2026-10-09T15:00:00\+02:00"/g, '"dateModified":"2026-10-19T11:19:26Z"');
  fs.writeFileSync(file, html);
  const sitemapFile = path.join(root, 'sitemap.xml');
  const sitemap = fs.readFileSync(sitemapFile, 'utf8');
  fs.writeFileSync(sitemapFile, sitemap.replace(/(<loc>https:\/\/outbound-lead-generation\.com\/es\/industries\/professional-services-lead-generation\/<\/loc><lastmod>)[^<]+(<\/lastmod>)/, (all, before, after) => before + '2026-10-19' + after));
  buildManufacturingResearch();
  repairNeutralUsability();
  addReadinessPlanningLinks();
};

function buildManufacturingResearch() {
  const file = path.join(root, 'industries/manufacturing-lead-generation/index.html');
  let html = fs.readFileSync(file, 'utf8');
  const id = 'manufacturing-buyer-research-prompts';
  const section = `<section id="${id}"><h3>Match the manufacturing offer to the buyer question</h3><p>Choose a specific offer before building a manufacturer list. The following illustrative research prompts distinguish component supply, assembly and equipment sales.</p><div class="table-wrap" role="region" tabindex="0" aria-labelledby="manufacturing-research-caption"><table><caption id="manufacturing-research-caption">Illustrative manufacturing account-research prompts</caption><thead><tr><th scope="col">Offer type</th><th scope="col">Details to investigate</th><th scope="col">Buyer-routing question</th></tr></thead><tbody><tr><td>Machined components</td><td>Relevant processes, materials, part families and technical requirements that your team can verify.</td><td>Who can confirm technical compatibility, and who manages supplier qualification?</td></tr><tr><td>Contract assembly</td><td>Assembly steps, expected production pattern, testing needs and handoff requirements.</td><td>Who owns production planning, and who can evaluate quality or testing requirements?</td></tr><tr><td>Industrial equipment</td><td>The application, installed environment, integration constraints and support expectations.</td><td>Who owns the operational problem, and who coordinates the technical evaluation?</td></tr></tbody></table></div><p>Use confirmed capabilities to write inclusion and exclusion rules. Record a source link and date for each public observation; keep unverified specifications and purchasing needs marked as unknown.</p><p>For a capability-led research model, <a href="https://www.nist.gov/mep/supply-chain/supplier-scouting">NIST MEP's U.S. Supplier Scouting process</a> describes matching manufacturers by production and technical capabilities. The prompts above are illustrative outbound planning questions.</p><p>Document the account evidence in the <a href="/resources/account-research-handoff-example/">research and sales-handoff example</a>, then use the <a href="/downloads/beespoke-icp-scorecard/">ICP scorecard</a> to record your own targeting criteria.</p></section>`;
  if (!html.includes(`id="${id}"`)) {
    const boundary = /(<\/section>)(<section class="original-tool checklist-tool" id="industry-fit-check">)/;
    if (html.split(boundary).length !== 4) throw new Error('Expected end of manufacturing targeting section');
    html = html.replace(boundary, (all, close, next) => section + close + next);
  }
  html = html.replace('Updated July 24, 2026', 'Updated October 19, 2026');
  html = html.replace(/"dateModified":"2026-07-24T09:00:00\+02:00"/g, '"dateModified":"2026-10-19T16:54:59Z"');
  fs.writeFileSync(file, html);
  const sitemapFile = path.join(root, 'sitemap.xml');
  const sitemap = fs.readFileSync(sitemapFile, 'utf8');
  fs.writeFileSync(sitemapFile, sitemap.replace(/(<loc>https:\/\/outbound-lead-generation\.com\/industries\/manufacturing-lead-generation\/<\/loc><lastmod>)[^<]+(<\/lastmod>)/, (all, before, after) => before + '2026-10-19' + after));
}

// Scope is explicit: do not extend this list to held pricing/provider pages.
function repairNeutralUsability() {
  const files = [
    "about/noah-levy/index.html",
    "ai-instructions/index.html",
    "ca/about/noah-levy/index.html",
    "ca/ai-instructions/index.html",
    "ca/case-studies/cybersecurity-linkedin-lead-generation/index.html",
    "ca/case-studies/media-partnership-outreach/index.html",
    "ca/compare/lead-generation-agency-vs-in-house-team/index.html",
    "ca/compare/outbound-agency-vs-freelancer/index.html",
    "ca/compare/outsourced-sdr-vs-in-house-sdr/index.html",
    "ca/compare/sdr-outsourcing-vs-staff-augmentation/index.html",
    "ca/compare/sdr-vs-bdr-outsourcing/index.html",
    "ca/editorial-policy/index.html",
    "ca/guides/b2b-lead-generation-consultant-vs-agency/index.html",
    "ca/guides/cold-email-agency/index.html",
    "ca/guides/how-to-choose-an-outbound-lead-generation-agency/index.html",
    "ca/guides/how-to-manage-an-outsourced-sdr-team/index.html",
    "ca/guides/outsourced-sdr-pros-and-cons/index.html",
    "ca/guides/outsourced-sdr-vs-lead-generation-agency/index.html",
    "ca/industries/accounting-firm-lead-generation/index.html",
    "ca/industries/b2b-saas-lead-generation/index.html",
    "ca/industries/consulting-lead-generation/index.html",
    "ca/industries/cybersecurity-lead-generation/index.html",
    "ca/industries/it-services-lead-generation/index.html",
    "ca/industries/manufacturing-lead-generation/index.html",
    "ca/industries/marketing-agency-lead-generation/index.html",
    "ca/industries/professional-services-lead-generation/index.html",
    "ca/industries/recruitment-agency-lead-generation/index.html",
    "ca/services/b2b-appointment-setting/index.html",
    "ca/services/b2b-lead-generation/index.html",
    "ca/services/b2b-ppc-agency/index.html",
    "ca/services/b2b-seo-agency/index.html",
    "ca/services/generative-engine-optimization/index.html",
    "ca/services/linkedin-lead-generation/index.html",
    "ca/services/outbound-lead-generation/index.html",
    "ca/services/outbound-sales-outsourcing/index.html",
    "ca/services/outsourced-sdr/index.html",
    "case-studies/cybersecurity-linkedin-lead-generation/index.html",
    "case-studies/media-partnership-outreach/index.html",
    "compare/lead-generation-agency-vs-in-house-team/index.html",
    "compare/outbound-agency-vs-freelancer/index.html",
    "compare/outsourced-sdr-vs-in-house-sdr/index.html",
    "compare/sdr-outsourcing-vs-staff-augmentation/index.html",
    "compare/sdr-vs-bdr-outsourcing/index.html",
    "editorial-policy/index.html",
    "es/about/noah-levy/index.html",
    "es/ai-instructions/index.html",
    "es/case-studies/cybersecurity-linkedin-lead-generation/index.html",
    "es/case-studies/media-partnership-outreach/index.html",
    "es/compare/lead-generation-agency-vs-in-house-team/index.html",
    "es/compare/outbound-agency-vs-freelancer/index.html",
    "es/compare/outsourced-sdr-vs-in-house-sdr/index.html",
    "es/compare/sdr-outsourcing-vs-staff-augmentation/index.html",
    "es/compare/sdr-vs-bdr-outsourcing/index.html",
    "es/editorial-policy/index.html",
    "es/guides/b2b-lead-generation-consultant-vs-agency/index.html",
    "es/guides/cold-email-agency/index.html",
    "es/guides/how-to-choose-an-outbound-lead-generation-agency/index.html",
    "es/guides/how-to-manage-an-outsourced-sdr-team/index.html",
    "es/guides/outsourced-sdr-pros-and-cons/index.html",
    "es/guides/outsourced-sdr-vs-lead-generation-agency/index.html",
    "es/industries/accounting-firm-lead-generation/index.html",
    "es/industries/b2b-saas-lead-generation/index.html",
    "es/industries/consulting-lead-generation/index.html",
    "es/industries/cybersecurity-lead-generation/index.html",
    "es/industries/it-services-lead-generation/index.html",
    "es/industries/manufacturing-lead-generation/index.html",
    "es/industries/marketing-agency-lead-generation/index.html",
    "es/industries/professional-services-lead-generation/index.html",
    "es/industries/recruitment-agency-lead-generation/index.html",
    "es/services/b2b-appointment-setting/index.html",
    "es/services/b2b-lead-generation/index.html",
    "es/services/b2b-ppc-agency/index.html",
    "es/services/b2b-seo-agency/index.html",
    "es/services/generative-engine-optimization/index.html",
    "es/services/linkedin-lead-generation/index.html",
    "es/services/outbound-lead-generation/index.html",
    "es/services/outbound-sales-outsourcing/index.html",
    "es/services/outsourced-sdr/index.html",
    "fr/about/noah-levy/index.html",
    "fr/ai-instructions/index.html",
    "fr/case-studies/cybersecurity-linkedin-lead-generation/index.html",
    "fr/case-studies/media-partnership-outreach/index.html",
    "fr/compare/lead-generation-agency-vs-in-house-team/index.html",
    "fr/compare/outbound-agency-vs-freelancer/index.html",
    "fr/compare/outsourced-sdr-vs-in-house-sdr/index.html",
    "fr/compare/sdr-outsourcing-vs-staff-augmentation/index.html",
    "fr/compare/sdr-vs-bdr-outsourcing/index.html",
    "fr/editorial-policy/index.html",
    "fr/guides/b2b-lead-generation-consultant-vs-agency/index.html",
    "fr/guides/cold-email-agency/index.html",
    "fr/guides/how-to-choose-an-outbound-lead-generation-agency/index.html",
    "fr/guides/how-to-manage-an-outsourced-sdr-team/index.html",
    "fr/guides/outsourced-sdr-pros-and-cons/index.html",
    "fr/industries/accounting-firm-lead-generation/index.html",
    "fr/industries/b2b-saas-lead-generation/index.html",
    "fr/industries/consulting-lead-generation/index.html",
    "fr/industries/cybersecurity-lead-generation/index.html",
    "fr/industries/it-services-lead-generation/index.html",
    "fr/industries/manufacturing-lead-generation/index.html",
    "fr/industries/marketing-agency-lead-generation/index.html",
    "fr/industries/professional-services-lead-generation/index.html",
    "fr/industries/recruitment-agency-lead-generation/index.html",
    "fr/services/b2b-appointment-setting/index.html",
    "fr/services/b2b-lead-generation/index.html",
    "fr/services/b2b-ppc-agency/index.html",
    "fr/services/b2b-seo-agency/index.html",
    "fr/services/generative-engine-optimization/index.html",
    "fr/services/linkedin-lead-generation/index.html",
    "fr/services/outbound-sales-outsourcing/index.html",
    "fr/services/outsourced-sdr/index.html",
    "guides/b2b-lead-generation-consultant-vs-agency/index.html",
    "guides/cold-email-agency/index.html",
    "guides/how-to-choose-an-outbound-lead-generation-agency/index.html",
    "guides/how-to-manage-an-outsourced-sdr-team/index.html",
    "guides/outsourced-sdr-pros-and-cons/index.html",
    "guides/outsourced-sdr-vs-lead-generation-agency/index.html",
    "industries/accounting-firm-lead-generation/index.html",
    "industries/b2b-saas-lead-generation/index.html",
    "industries/consulting-lead-generation/index.html",
    "industries/cybersecurity-lead-generation/index.html",
    "industries/it-services-lead-generation/index.html",
    "industries/manufacturing-lead-generation/index.html",
    "industries/marketing-agency-lead-generation/index.html",
    "industries/professional-services-lead-generation/index.html",
    "industries/recruitment-agency-lead-generation/index.html",
    "services/b2b-appointment-setting/index.html",
    "services/b2b-lead-generation/index.html",
    "services/b2b-ppc-agency/index.html",
    "services/b2b-seo-agency/index.html",
    "services/generative-engine-optimization/index.html",
    "services/linkedin-lead-generation/index.html",
    "services/outbound-lead-generation/index.html",
    "services/outbound-sales-outsourcing/index.html"
];
  const grammarFiles = new Set([
    "fr/industries/accounting-firm-lead-generation/index.html",
    "fr/industries/b2b-saas-lead-generation/index.html",
    "fr/industries/consulting-lead-generation/index.html",
    "fr/industries/cybersecurity-lead-generation/index.html",
    "fr/industries/it-services-lead-generation/index.html",
    "fr/industries/manufacturing-lead-generation/index.html",
    "fr/industries/marketing-agency-lead-generation/index.html",
    "fr/industries/professional-services-lead-generation/index.html",
    "fr/industries/recruitment-agency-lead-generation/index.html",
    "fr/services/b2b-appointment-setting/index.html",
    "fr/services/b2b-lead-generation/index.html",
    "fr/services/linkedin-lead-generation/index.html",
    "fr/services/outbound-sales-outsourcing/index.html",
    "fr/services/outsourced-sdr/index.html"
]);
  const style = "<style id=\"neutral-tool-label-contrast\">.tool-heading>span{color:#143d59}</style>";
  const grammar = [
    [
        "<h2>Vous ne savez pas si le prospection outbound correspond à votre offre ?</h2>",
        "<h2>Vous ne savez pas si la prospection outbound correspond à votre offre ?</h2>"
    ],
    [
        "<h2>Vérifiez si les prospection outbound ciblée correspondent à votre marché</h2>",
        "<h2>Vérifiez si la prospection outbound ciblée correspond à votre marché</h2>"
    ]
];
  for (const relative of files) {
    const file = path.join(root, relative);
    let html = fs.readFileSync(file, 'utf8');
    // Reuse the existing dark brand color; sizes, backgrounds and user zoom stay intact.
    if (!html.includes('id="neutral-tool-label-contrast"')) {
      if (html.split('</head>').length !== 2) throw new Error('Expected one head: ' + relative);
      html = html.replace('</head>', style + '</head>');
    }
    if (grammarFiles.has(relative)) {
      // Two visible CTA headings only: feminine singular agreement, same meaning.
      for (const [before, after] of grammar) {
        const count = html.split(before).length - 1;
        if (count === 1) html = html.replace(before, after);
        else if (count !== 0 || html.split(after).length !== 2) throw new Error('Unexpected CTA heading: ' + relative);
      }
    }
    fs.writeFileSync(file, html);
  }
}

// Neutral readiness guidance: reuse existing same-language planning resources.
function addReadinessPlanningLinks() {
  const copy = {
    "en": {
        "prefix": "",
        "oldDate": "Updated October 9, 2026",
        "newDate": "Updated October 19, 2026",
        "html": "To make the readiness signals concrete, record your targeting criteria in the <a href=\"/downloads/beespoke-icp-scorecard/\">blank ICP scorecard</a>. Use the <a href=\"/resources/account-research-handoff-example/\">fictional account-research and handoff example</a> to separate observations, assumptions and agreed next steps."
    },
    "es": {
        "prefix": "es/",
        "oldDate": "Actualizado el 9 de octubre de 2026",
        "newDate": "Actualizado el 19 de octubre de 2026",
        "html": "Para concretar las señales de preparación, anota tus criterios de selección en la <a href=\"/es/downloads/beespoke-icp-scorecard/\">ficha de evaluación del ICP en blanco</a>. Utiliza el <a href=\"/es/resources/account-research-handoff-example/\">ejemplo ficticio de investigación y traspaso a ventas</a> para separar observaciones, hipótesis y próximos pasos acordados."
    },
    "ca": {
        "prefix": "ca/",
        "oldDate": "Actualitzat el 9 d’octubre de 2026",
        "newDate": "Actualitzat el 19 d’octubre de 2026",
        "html": "Per concretar els senyals de preparació, anota els criteris de selecció a la <a href=\"/ca/downloads/beespoke-icp-scorecard/\">fitxa d’avaluació de l’ICP en blanc</a>. Fes servir l’<a href=\"/ca/resources/account-research-handoff-example/\">exemple fictici de recerca i traspàs a vendes</a> per separar observacions, hipòtesis i passos següents acordats."
    },
    "fr": {
        "prefix": "fr/",
        "oldDate": "Mis à jour le 9 octobre 2026",
        "newDate": "Mis à jour le 19 octobre 2026",
        "html": "Pour préciser les critères de préparation, notez vos critères de ciblage dans la <a href=\"/fr/downloads/beespoke-icp-scorecard/\">grille ICP vierge</a>. Utilisez l’<a href=\"/fr/resources/account-research-handoff-example/\">exemple fictif de recherche et de transmission aux ventes</a> pour distinguer les observations, les hypothèses et les prochaines étapes convenues."
    }
};
  const timestamp = "2026-10-19T17:53:39Z";
  const sitemapFile = path.join(root, 'sitemap.xml');
  let sitemap = fs.readFileSync(sitemapFile, 'utf8');
  for (const c of Object.values(copy)) {
    const relative = c.prefix + 'services/b2b-lead-generation/index.html';
    const file = path.join(root, relative);
    let html = fs.readFileSync(file, 'utf8');
    const paragraph = '<p class="readiness-planning-links">' + c.html + '</p>';
    const re = /<section class="original-tool checklist-tool" id="b2b-readiness-score">[\s\S]*?<\/section>/;
    const section = html.match(re)?.[0];
    if (!section) throw new Error('Expected B2B readiness section: ' + relative);
    if (!section.includes('class="readiness-planning-links"')) {
      html = html.replace(section, section.replace('</section>', paragraph + '</section>'));
    } else if (!section.includes(paragraph)) throw new Error('Existing readiness guidance differs: ' + relative);
    html = html.replace(c.oldDate, c.newDate);
    html = html.replace('"dateModified":"2026-10-09T15:00:00+02:00"', '"dateModified":"' + timestamp + '"');
    fs.writeFileSync(file, html);
    const url = 'https://outbound-lead-generation.com/' + c.prefix + 'services/b2b-lead-generation/';
    const entry = sitemap.match(new RegExp('<url><loc>' + url + '</loc><lastmod>[^<]+</lastmod></url>'))?.[0];
    if (!entry) throw new Error('Expected B2B sitemap entry: ' + relative);
    sitemap = sitemap.replace(entry, entry.replace(/<lastmod>[^<]+<\/lastmod>/, '<lastmod>2026-10-19</lastmod>'));
  }
  fs.writeFileSync(sitemapFile, sitemap);
}
