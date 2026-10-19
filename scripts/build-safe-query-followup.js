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
