const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const copy = require('../data/pricing-evidence-20261104.json');
const root = path.join(__dirname, '..');
const origin = 'https://outbound-lead-generation.com';
const revised = '2026-11-04T12:05:02+01:00';
const date = revised.slice(0,10);
const dates = {
  en:'Updated November 4, 2026',
  es:'Actualizado el 4 de noviembre de 2026',
  ca:'Actualitzat el 4 de novembre de 2026',
  fr:'Mis à jour le 4 novembre 2026'
};
const guides = {
  cost: {
    route:'/guides/outbound-lead-generation-cost/',
    after:'outbound-cost-calculator',
    providers:new Set(['leadium.com','artemisleads.com','division50.com'])
  },
  calling: {
    route:'/guides/outbound-call-center-pricing/',
    after:'call-center-quote-audit',
    providers:new Set(['justcall.io','sascallcenter.com','telecominc.com'])
  }
};
const esc = text => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const anchor = 'worked-quote-review';
function render(doc) {
  const html = doc.blocks.map((b,i) => {
    if (b.kind==='h2' || b.kind==='h3') return '<'+b.kind+'>'+esc(b.text)+'</'+b.kind+'>';
    if (b.kind==='paragraph') return '<p>'+esc(b.text)+'</p>';
    assert.equal(b.kind,'table');
    const heading = doc.blocks.slice(0,i).findLast(item=>item.kind==='h3').text;
    const caption = '<caption>'+esc(heading)+'</caption>';
    const cells = b.columns.map(c=>'<th scope="col">'+esc(c)+'</th>').join('');
    const rows = b.rows.map(([label,...values])=>'<tr><th scope="row">'+esc(label)+'</th>'+
      values.map(value=>'<td>'+esc(value)+'</td>').join('')+'</tr>').join('');
    return '<div class="table-wrap" role="region" tabindex="0" aria-label="'+esc(heading)+'"><table>'+caption+
      '<thead><tr>'+cells+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
  });
  return '<section id="'+anchor+'" tabindex="-1">'+html.join('\n')+'</section>';
}
function update(html, guide, doc, lang) {
  assert(!html.includes('id="'+anchor+'"'));
  const hook = new RegExp('(<section\\b[^>]*id="'+guide.after+'"[^>]*>[\\s\\S]*?<\\/section>)');
  assert(hook.test(html),lang+guide.route);
  const navLink = '<a href="#'+anchor+'">'+esc(doc.label)+'</a>';
  html=html.replace(hook,(_,before)=>before+render(doc))
    .replace(/(<aside class="toc">[\s\S]*?<\/div>)/,(_,before)=>before+navLink)
    .replace(/(<details class="mobile-toc">[\s\S]*?<nav\b[^>]*>)/,(_,before)=>before+navLink)
    .replace(/(<p class="meta">[\s\S]*?·\s*)[^<]+(<\/p>)/,(_,before,after)=>
      before+'<time datetime="'+date+'">'+esc(dates[lang])+'</time>'+after);
  let unlinked=0;
  html=html.replace(/<a\b[^>]*href="(https:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/g,(full,href,label)=>{
    const url=new URL(href), hostname=url.hostname.replace(/^www\./,'');
    if(!guide.providers.has(hostname))return full;
    unlinked++;
    return '<span class="source-reference">'+label+' ('+esc(hostname+url.pathname).replaceAll('/','/<wbr>')+')</span>';
  });
  assert.equal(unlinked,3,lang+guide.route);
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,raw)=>{
    const graph=JSON.parse(raw);
    const article=graph['@graph'].find(n=>n['@type']==='Article');
    assert(article?.dateModified,lang+guide.route);
    article.dateModified=revised;
    return '<script type="application/ld+json">'+JSON.stringify(graph).replace(/</g,'\\u003c')+'</script>';
  });
  assert.equal((html.match(/href="#worked-quote-review"/g)||[]).length,2);
  assert(html.includes('datetime="'+date+'"'));
  return html;
}

const sitemapFile=path.join(root,'sitemap.xml');
let sitemap=fs.readFileSync(sitemapFile,'utf8');
for(const [id,guide] of Object.entries(guides)){
  for(const [lang,doc] of Object.entries(copy[id])){
    const route=(lang==='en'?'':'/'+lang)+guide.route;
    const filename=path.join(root,route.slice(1),'index.html');
    fs.writeFileSync(filename,update(fs.readFileSync(filename,'utf8'),guide,doc,lang));
    const row = new RegExp('(<loc>'+ (origin+route).replaceAll('.','\\.') +'<\\/loc><lastmod>)[^<]+(<\\/lastmod>)');
    assert(row.test(sitemap),route);
    sitemap=sitemap.replace(row,(_,start,end)=>start+date+end);
  }
}
fs.writeFileSync(sitemapFile,sitemap);
console.log('Pricing guide examples: eight localized pages with plain-text provider citations.');
