const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const asset = require('./asset-version');
const root = path.resolve(__dirname, '..');
const origin = 'https://outbound-lead-generation.com';
const revision = '2026-11-04';
const revisionTime = '2026-11-04T11:27:48+01:00';
const locales = ['en','es','ca','fr'];
const guides = {
  software: ['/compare/lead-generation-agency-vs-software/','Software or agency','Software o agencia','Programari o agència','Logiciel ou agence'],
  appointments: ['/guides/appointment-setting-pricing/','Appointment-setting pricing','Precios de concertación de citas','Preus de concertació de reunions','Tarifs de prise de rendez-vous'],
  sdr: ['/guides/best-outsourced-sdr-companies/','Choosing outsourced SDR support','Elegir apoyo SDR externo','Triar suport SDR extern','Choisir un prestataire SDR'],
  linkedin: ['/guides/best-linkedin-lead-generation-agencies/','Choosing LinkedIn outreach support','Elegir apoyo para prospectar en LinkedIn','Triar suport per prospectar a LinkedIn','Choisir un prestataire de prospection LinkedIn'],
  b2b: ['/guides/best-b2b-lead-generation-agencies/','Choosing a B2B lead generation agency','Elegir una agencia de captación B2B','Triar una agència de captació B2B','Choisir une agence de génération de leads B2B']
};
const update = ['Updated November 4, 2026','Actualizado el 4 de noviembre de 2026','Actualitzat el 4 de novembre de 2026','Mis à jour le 4 novembre 2026'];
const e = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const file = (prefix, route) => path.join(root,(prefix + route).slice(1),'index.html');

function render(block) {
  if (block.kind === 'paragraph') return '<p>' + e(block.text) + '</p>';
  if (block.kind === 'record') return '<div class="worked-record"><h4>' + e(block.title) + '</h4><dl>' +
    block.rows.map(([term,text]) => '<dt>' + e(term) + '</dt><dd>' + e(text) + '</dd>').join('') + '</dl></div>';
  assert.equal(block.kind,'table');
  return '<div class="table-wrap" tabindex="0" role="region" aria-label="' + e(block.title) + '"><table><caption>' +
    e(block.title) + '</caption><thead><tr>' + block.heads.map(t => '<th scope="col">' + e(t) + '</th>').join('') +
    '</tr></thead><tbody>' + block.rows.map(([first,...rest]) => '<tr><th scope="row">' + e(first) + '</th>' +
      rest.map(t => '<td>' + e(t) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}

function build(id, route, topic, locale, index) {
  const prefix = locale === 'en' ? '' : '/' + locale;
  const doc = require('../data/buyer-evidence-20261104/' + id + '/' + locale + '.json');
  const filename = file(prefix,route);
  let html = fs.readFileSync(filename,'utf8');
  assert(html.includes('<article>') && !html.includes('id="worked-example"'),filename);
  const section = '<section class="worked-guide" id="worked-example" tabindex="-1"><h2>' + e(doc.title) +
    '</h2><p class="worked-fiction">' + e(doc.fiction) + '</p>' + (id==='software'?'':'<p>'+e(doc.answer)+'</p>') +
    doc.sections.map((s,i) => '<div class="worked-chapter" id="worked-example-' + (i+1) + '"><h3>' +
      e(s.title) + '</h3>' + s.blocks.map(render).join('') + '</div>').join('\n') + '</section>';
  const toc = '<a href="#worked-example">' + e(doc.toc) + '</a>';
  html = html.replace(/(<article>[\s\S]*?<\/section>[\s\S]*?<\/section>)/,(_,a) => a + section)
    .replace(/(<details class="mobile-toc">[\s\S]*?<nav\b[^>]*>)/,(_,a) => a + toc)
    .replace(/(<aside class="toc">[\s\S]*?<\/div>)/,(_,a) => a + toc)
    .replace(/(<p class="meta">[\s\S]*?·\s*)[^<]+(<\/p>)/,(_,a,z) => a + '<time datetime="' + revision + '">' + e(update[index]) + '</time>' + z)
    .replace(/(<p class="eyebrow">)[\s\S]*?(<\/p>)/,(_,a,z) => a + e(topic) + z)
    .replace(/(<div class="breadcrumbs"><a href=")\/("[^>]*>[^<]+<\/a><span>\/<\/span><span>)[\s\S]*?(<\/span><\/div>)/,(_,a,b,z) => a + prefix + '/' + b + e(topic) + z);
  if (id === 'software') html = html.replace(/(<p class="answer">)[\s\S]*?(<\/p>)/,(_,a,z) => a + e(doc.answer) + z);
  for (const [attr,key] of [['name','description'],['property','og:description'],['name','twitter:description']]) {
    html=html.replace(new RegExp('(<meta '+attr+'="'+key+'" content=")[^"]*(")'),(_,a,z)=>a+e(doc.description)+z);
  }
  html = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(_,raw)=>{
    const data=JSON.parse(raw);
    for (const n of data['@graph']||[data]) if(n['@type']==='Article' || (n['@type']==='WebPage' && n.dateModified)){
      n.description=doc.description;n.dateModified=revisionTime;n.inLanguage=locale;
    }
    return '<script type="application/ld+json">'+JSON.stringify(data).replace(/</g,'\\u003c')+'</script>';
  }).replace(/<body class="([^"]+)">/,'<body class="$1 worked-guide-page">')
    .replace('</head>','<link rel="stylesheet" href="'+asset('/worked-guides.css')+'"></head>');
  assert((html.match(/href="#worked-example"/g)||[]).length===2 && html.includes('datetime="'+revision+'"'),filename);
  fs.writeFileSync(filename,html);

}

const sitemapPath=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapPath,'utf8');
for(const [id,[route,...topics]] of Object.entries(guides)){
  locales.forEach((locale,index)=>{
    build(id,route,topics[index],locale,index);
    const url=origin+(locale==='en'?'':'/'+locale)+route;
    const pattern=new RegExp('(<loc>'+url.replaceAll('.','\\.')+'</loc><lastmod>)[^<]+(</lastmod>)');
    assert(pattern.test(sitemap),url);
    sitemap=sitemap.replace(pattern,(_,a,z)=>a+revision+z);
  });
}
fs.writeFileSync(sitemapPath,sitemap);
console.log('Added buyer evidence examples to five existing article families in four locales.');

