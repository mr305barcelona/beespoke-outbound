const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {providers} = require('../data/broad-seo-20261015');
const origin = 'https://outbound-lead-generation.com';
const route = '/guides/best-outsourced-sdr-companies/';
const verified = '2026-11-04';
const revised = '2026-11-04T11:47:38+01:00';
const primary = 'https://memoryblue.com/';
const labels = {
  en: {
    scope: 'Publicly describes a focus on B2B technology and professional-services companies.',
    reference: 'memoryBlue, company website (memoryblue.com). Scope verified November 4, 2026.',
    heading: 'Provider references and disclosure',
    introduction: 'Verify each provider’s current scope on its own website. Public offers change. Ask for references and review the contract and data-handling terms before signing.',
    hero: ['links to first-party sources','names first-party sources'],
    note: ['each linked first-party page','each listed provider’s website'],
    august: ['These sources were checked on August 17, 2026.','The Leadium and CIENCE references were checked on August 17, 2026.']
  },
  es: {
    scope: 'Indica públicamente que se centra en empresas B2B de tecnología y servicios profesionales.',
    reference: 'memoryBlue, sitio web corporativo (memoryblue.com). Alcance verificado el 4 de noviembre de 2026.',
    heading: 'Referencias de proveedores y transparencia',
    introduction: 'Consulta el sitio web de cada proveedor para comprobar su alcance actual. Las ofertas cambian. Pide referencias y revisa el contrato y el tratamiento de datos antes de firmar.',
    hero: ['enlaza fuentes propias','identifica fuentes de los propios proveedores'],
    note: ['cada página del proveedor enlazada','el sitio web de cada proveedor de la lista'],
    august: ['Estas fuentes fueron verificadas el 17 de agosto de 2026.','Las referencias de Leadium y CIENCE se verificaron el 17 de agosto de 2026.']
  },
  ca: {
    scope: 'Indica públicament que se centra en empreses B2B de tecnologia i serveis professionals.',
    reference: 'memoryBlue, web corporatiu (memoryblue.com). Abast verificat el 4 de novembre de 2026.',
    heading: 'Referències de proveïdors i transparència',
    introduction: 'Consulta el web de cada proveïdor per comprovar el seu abast actual. Les ofertes canvien. Demana referències i revisa el contracte i el tractament de dades abans de signar.',
    hero: ['enllaça fonts pròpies','identifica fonts dels mateixos proveïdors'],
    note: ['Revisem cada pàgina del proveïdor enllaçada','Vam revisar el web de cada proveïdor de la llista'],
    august: ["Aquestes fonts es van comprovar el 17 d'agost de 2026.",'Les referències de Leadium i CIENCE es van comprovar el 17 d’agost de 2026.']
  },
  fr: {
    scope: 'Indique publiquement se concentrer sur les entreprises B2B de la tech et des services professionnels.',
    reference: 'memoryBlue, site de l’entreprise (memoryblue.com). Périmètre vérifié le 4 novembre 2026.',
    heading: 'Références des prestataires et transparence',
    introduction: 'Consultez le site de chaque prestataire pour vérifier son périmètre actuel. Les offres évoluent. Demandez des références et vérifiez le contrat et le traitement des données avant de signer.',
    hero: ['renvoie vers leurs propres sources','identifie les sources des prestataires'],
    note: ['chaque page de prestataire liée','le site de chaque prestataire de la liste'],
    august: ['Ces sources ont été vérifiées le 17 août 2026.','Les références de Leadium et de CIENCE ont été vérifiées le 17 août 2026.']
  }
};
const escape = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bySite = new Map(providers.filter(([,url]) => url.startsWith('https://') && new URL(url).origin !== origin).map(([name,url])=>[new URL(url).hostname,name]));

function edit(html, lang) {
  const copy = labels[lang];
  const [oldHero, newHero] = copy.hero;
  const [oldNote, newNote] = copy.note;
  assert(html.includes(oldHero) && html.includes(oldNote), lang);
  html = html.replace(oldHero, newHero).replace(oldNote, newNote);
  const [oldAugust, newAugust] = copy.august;
  const august = [oldAugust, escape(oldAugust)].find(text => html.includes(text));
  assert(august, lang);
  html = html.replace(august, escape(newAugust));
  const providerHeading = /<section id="provider-links-and-disclosure"><h2>([^<]+)<\/h2><p>[^<]+<\/p>/;
  const existingHeading = html.match(providerHeading)?.[1];
  assert(existingHeading, lang);
  html = html.replaceAll('href="#provider-links-and-disclosure">'+existingHeading+'</a>', 'href="#provider-links-and-disclosure">'+escape(copy.heading)+'</a>')
    .replace(providerHeading, '<section id="provider-links-and-disclosure"><h2>'+escape(copy.heading)+'</h2><p>'+escape(copy.introduction)+'</p>');
  const row = '<th scope="row"><a href="'+primary+'">memoryBlue</a></th><td>';
  assert(html.includes(row), lang);
  html = html.replace(/(<th scope="row"><a href="https:\/\/memoryblue\.com\/">memoryBlue<\/a><\/th><td>)([^<]+)(<\/td>)/, (_, before, scope, after) =>
    before + scope + '. ' + escape(copy.scope) + after
  );
  const source = /<li><a href="https:\/\/memoryblue\.com\/wp-content\/uploads\/2025\/02\/Maximizing-the-impact-of-outsourced-SDRs-020825\.pdf">[^<]*<\/a><\/li>/g;
  const sources = html.match(source) || [];
  assert.equal(sources.length, 1, lang);
  html = html.replace(source, '<li><span data-provider-source="memoryblue" data-verified-on="'+verified+'">'+escape(copy.reference)+'</span></li>');
  const references = /<a\b[^>]*href="(https:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/g;
  html = html.replace(references, (link,href,text) => {
    const url = new URL(href);
    const name = bySite.get(url.hostname);
    if (!name) return link;
    if (url.pathname === '/') return '<span>'+escape(name)+'</span>';
    if (url.hostname === 'www.leadium.com' || url.hostname === 'www.cience.com') {
      return '<span>'+escape(name)+' · '+escape(url.hostname.replace(/^www\./,''))+escape(url.pathname)+'</span>';
    }
    return '<span>'+text.trim()+'</span>';
  });
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,raw)=>{
    const graph=JSON.parse(raw);
    const node=graph['@graph'].find(item=>item['@type']==='Article');
    assert(node?.dateModified,lang);
    node.dateModified=revised;
    return '<script type="application/ld+json">'+JSON.stringify(graph).replace(/</g,'\\u003c')+'</script>';
  });
  assert(![...html.matchAll(/<a\b[^>]*href="(https:\/\/[^"]+)"/g)].some(([,url])=>bySite.has(new URL(url).hostname)),lang);
  assert(html.includes('data-provider-source="memoryblue"'),lang);
  return html;
}

const root = path.join(__dirname,'..');
for (const lang of Object.keys(labels)) {
  const prefix = lang === 'en' ? '' : '/'+lang;
  const file = path.join(root,(prefix+route).slice(1),'index.html');
  const html = edit(fs.readFileSync(file,'utf8'),lang);
  assert(html.includes('datetime="'+verified+'"') && html.includes(origin+prefix+route),lang);
  fs.writeFileSync(file,html);
}
console.log('Updated memoryBlue’s sourced scope and made provider citations non-clickable in four shortlist locales.');
