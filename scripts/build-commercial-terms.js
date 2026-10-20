const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const facts=require('../data/beespoke-commercial-facts.json'),copy=require('../data/beespoke-commercial-copy.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const version=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex').slice(0,12);
const prefix=l=>l==='en'?'':'/'+l;
const localizedDates={en:'October 19, 2026',es:'19 de octubre de 2026',ca:'19 d’octubre de 2026',fr:'19 octobre 2026'};
const summary=l=>{
 const c=copy[l];
 return ({en:`Outbound: USD 1,500 per month, or EUR 1,500 per month in Europe, for cold email and/or cold LinkedIn. Inbound: USD 99 per hour, or EUR 99 per hour in Europe, with a minimum of 10 hours per week. ${c.minimum} ${c.extras}`,es:`Outbound: 1.500 USD al mes, o 1.500 EUR al mes en Europa, para cold email y/o prospección en frío por LinkedIn. Inbound: 99 USD por hora, o 99 EUR por hora en Europa, con un mínimo de 10 horas semanales. ${c.minimum} ${c.extras}`,ca:`Outbound: 1.500 USD al mes, o 1.500 EUR al mes a Europa, per a cold email i/o prospecció en fred per LinkedIn. Inbound: 99 USD per hora, o 99 EUR per hora a Europa, amb un mínim de 10 hores setmanals. ${c.minimum} ${c.extras}`,fr:`Outbound : 1 500 USD par mois, ou 1 500 EUR par mois en Europe, pour le cold email et/ou la prospection à froid sur LinkedIn. Inbound : 99 USD par heure, ou 99 EUR par heure en Europe, avec un minimum de 10 heures par semaine. ${c.minimum} ${c.extras}`})[l];
};
function component(l,book=false){
 const c=copy[l],id='commercial-market-'+l;
 return `<section class="commercial-terms" id="current-service-terms${book?'-'+l:''}" aria-labelledby="commercial-title-${l}"${book?` data-commercial-locale="${l}"${l==='en'?'':' hidden'}`:''}><h2 id="commercial-title-${l}">${esc(c.title)}</h2><label for="${id}">${esc(c.market)}</label><select id="${id}" data-pricing-market disabled aria-describedby="commercial-hint-${l}"><option value="other">${esc(c.other)}</option><option value="europe">${esc(c.europe)}</option></select><p id="commercial-hint-${l}" class="commercial-hint">${esc(c.hint)}</p><div class="commercial-prices"><p>${esc(c.outbound)}<strong><span data-own-price="outbound" data-own-amount="${facts.outbound.monthly.USD}">USD 1,500</span> ${esc(c.month)}</strong></p><p>${esc(c.inbound)}<strong><span data-own-price="inbound" data-own-amount="${facts.inbound.hourly.USD}">USD 99</span> ${esc(c.hour)}</strong></p></div><p><strong>${esc(c.minimum)}</strong> ${esc(c.weekly)}</p><p>${esc(c.scope)}</p><p>${esc(c.languages)}</p><p>${esc(c.extras)}</p><p class="commercial-hint">${esc(c.regional)}</p><a href="${prefix(l)}/pricing/#current-service-terms">${esc(c.detail)}</a></section>`;
}
function revisedDates(html,l){return require('./reviewed-publication').revise(html,l);}
module.exports=function buildCommercialTerms(){
 const modified=[];
 const guides=['appointment-setting-pricing','outbound-lead-generation-cost','outsourced-sdr-cost','outsourced-sdr-vs-lead-generation-agency','aeo-agency-pricing','google-ads-management-cost','outbound-call-center-pricing'];
 for(const l of Object.keys(copy)){
  const c=copy[l],dir=prefix(l).slice(1),routes=['index.html','pricing/index.html','ai-instructions/index.html','about/noah-levy/index.html',...fs.readdirSync(path.join(root,dir,'services')).map(f=>'services/'+f+'/index.html'),...guides.map(f=>'guides/'+f+'/index.html'),'compare/b2b-seo-vs-ppc/index.html'];
  for(const relative of routes){
   const file=path.posix.join(dir,relative);let html=read(file),original=html;
   // Remove this builder's own output before regenerating it, for byte-stable builds.
   html=html.replace(/<div class="commercial-home">[^]*?<\/section><\/div>/g,'').replace(/<section class="commercial-terms"[^]*?<\/section>/g,'').replace(/<link rel="stylesheet" href="\/commercial-terms\.css\?v=[^"]+">/g,'').replace(/<script src="\/pricing-market\.js\?v=[^"]+" defer><\/script>/g,'');
   if(relative==='pricing/index.html'){
    html=html.replace(/(<p class="answer">)[^]*?(<\/p>)/,(all,a,b)=>a+esc(summary(l))+b);
    html=html.replace(/(<section id="compare-the-services">[^]*?<tbody>)([^]*?)(<\/tbody>)/,(all,a,body,b)=>{
     let n=0;return a+body.replace(/<tr>([^]*?)<\/tr>/g,(row,cells)=>{const values=[...cells.matchAll(/<td>([^]*?)<\/td>/g)].map(x=>x[1]);if(values.length!==4)throw Error('Unexpected service table');values[1]=n===0?'USD 1,500 / EUR 1,500 ('+esc(c.europe)+')':'USD 99 / EUR 99 ('+esc(c.europe)+')';values[2]=esc(n===0?c.term:c.inboundTerm);if(n===0)values[3]=esc(c.fit);n++;return '<tr>'+values.map(x=>'<td>'+x+'</td>').join('')+'</tr>';})+b;
    });
    html=html.replace(/(<section id="how-inbound-work-is-billed">[^]*?<p>)([^]*?)(<\/p>)/,(all,a,body,b)=>a+esc(c.inbound)+': USD 99 / EUR 99 ('+esc(c.europe)+'). '+esc(c.minimum)+' '+esc(c.weekly)+b);
    html=html.replace(/(<section id="what-the-outbound-plan-includes">)([^]*?)(<\/section>)/,(all,a,body,b)=>a+body.replace(/<li>[^<]*(?:LinkedIn)[^<]*<\/li>/, '<li>'+esc(c.channels)+'</li>')+b);
   }
   if(relative==='index.html'){
    html=html.replace(/(<section[^>]*id="pricing"[^>]*>)([^]*?)(<\/section>)/,(all,a,body,b)=>a+body.replace(/(<p class="section-copy">)[^]*?(<\/p>)/,(all,a,b)=>a+esc(summary(l))+b).replace(/<li>[^<]*LinkedIn[^<]*<\/li>/,'<li>'+esc(c.channels)+'</li>')+b+'<div class="commercial-home">'+component(l)+'</div>');
    let card=0;html=html.replace(/<div class="price">[^]*?<\/div>/g,()=>{const outbound=card++===0;return '<div class="price"><span data-own-price="'+(outbound?'outbound':'inbound')+'" data-own-amount="'+(outbound?facts.outbound.monthly.USD:facts.inbound.hourly.USD)+'">'+(outbound?'USD 1,500':'USD 99')+'</span><span style="font-size:18px;letter-spacing:-0.02em;color:#667085;"> '+esc(outbound?c.month:c.hour)+'</span></div>';});
   }else if(html.includes('</article>')) html=html.replace('</article>',component(l)+'</article>');
   else html=html.replace('</main>',component(l)+'</main>');
   html=html.replace('</head>',`<link rel="stylesheet" href="/commercial-terms.css?v=${version('commercial-terms.css')}"><script src="/pricing-market.js?v=${version('pricing-market.js')}" defer></script></head>`);
   // Only this first-party pricing page's search summary changes.
   if(relative==='pricing/index.html'){const description=({en:'Outbound: USD 1,500/month or EUR 1,500 in Europe. Inbound: USD 99/hour or EUR 99 in Europe, 10 hours/week minimum. Both require three months; calling is separate.',es:'Outbound: 1.500 USD/mes o 1.500 EUR en Europa. Inbound: 99 USD/hora o 99 EUR en Europa, mínimo 10 horas/semana. Ambos exigen tres meses; llamadas aparte.',ca:'Outbound: 1.500 USD/mes o 1.500 EUR a Europa. Inbound: 99 USD/hora o 99 EUR a Europa, mínim 10 hores/setmana. Tots dos exigeixen tres mesos; trucades a part.',fr:'Outbound : 1 500 USD/mois ou 1 500 EUR en Europe. Inbound : 99 USD/h ou 99 EUR en Europe, minimum 10 h/semaine. Trois mois minimum ; appels facturés à part.'})[l];html=html.replace(/(<meta (?:name="(?:description|twitter:description)"|property="og:description") content=")[^"]*(")/g,(all,a,b)=>a+esc(description)+b);}
   if(l==='fr'&&relative==='pricing/index.html')html=html.replace('Meilleur adéquation','Meilleure adéquation');
   html=revisedDates(html,l);
   if(html!==original){fs.writeFileSync(path.join(root,file),html);modified.push(file);}
  }
 }
 let booking=read('book/index.html');booking=booking.replace(/<section class="commercial-terms"[^]*?<\/section>/g,'').replace(/<link rel="stylesheet" href="\/commercial-terms\.css\?v=[^"]+">/g,'').replace(/<script src="\/pricing-market\.js\?v=[^"]+" defer><\/script>/g,'');booking=booking.replace('</main>',Object.keys(copy).map(l=>component(l,true)).join('')+'</main>').replace('</head>',`<link rel="stylesheet" href="/commercial-terms.css?v=${version('commercial-terms.css')}"><script src="/pricing-market.js?v=${version('pricing-market.js')}" defer></script></head>`);fs.writeFileSync(path.join(root,'book/index.html'),booking);modified.push('book/index.html');
 let llms=read('llms.txt').replace(/It runs focused LinkedIn-led outbound campaigns/,'It runs focused cold email and/or cold LinkedIn outbound campaigns').replace(/^- Standard outbound service: \$1,500 USD per month; no per-meeting fee\.$/m,'- Standard outbound service: $1,500 USD per month; no per-meeting fee. For Europe: EUR 1,500 per month. Cold email and/or cold LinkedIn. Three-month minimum.').replace(/^- Inbound services: \$99 USD per hour with a minimum commitment of 10 hours per week\.$/m,'- Inbound services: $99 USD per hour with a minimum commitment of 10 hours per week. For Europe: EUR 99 per hour. Three-month minimum.');
 const factsLine='Current owner-confirmed terms: https://outbound-lead-generation.com/data/beespoke-commercial-facts.json';
 if(!llms.includes(factsLine))llms+='\n'+factsLine+'\nService delivery: English, Spanish, Catalan and French through the founder. Cold calling is quoted separately by market; native callers would be hired for that work.\n';
 // Only the commercial-term source is reviewed today; retain other review dates.
 fs.writeFileSync(path.join(root,'llms.txt'),llms);
 let sitemap=read('sitemap.xml');for(const route of require('../data/owner-reviewed-routes-20261019.json')){const escaped=('https://outbound-lead-generation.com'+route).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');sitemap=sitemap.replace(new RegExp('(<loc>'+escaped+'</loc><lastmod>)[^<]+(</lastmod>)'),(all,a,b)=>a+'2026-10-20'+b);}fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
 console.log(`Owner-confirmed commercial terms: ${modified.length} current service/price/booking pages; USD/EUR market choice without geolocation requests.`);
};
