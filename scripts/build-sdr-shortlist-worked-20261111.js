'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=require('../data/sdr-shortlist-worked-20261111.json');
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=s=>'<p>'+e(s)+'</p>',dl=rows=>'<dl class="shortlist-record">'+rows.map(([a,b])=>'<div><dt>'+e(a)+'</dt><dd>'+e(b)+'</dd></div>').join('')+'</dl>';
const re=id=>new RegExp('(<section[^>]*id="'+id+'"[^>]*>)([\\s\\S]*?)(<\\/section>)');
const gates={
 en:['Three checks before choosing finalists','Operating-model fit','The channels, capacity and client responsibilities match the work.','Inspectable execution','Research, messages, reply decisions and outcomes can be reviewed.','A workable exit','Ownership, exports, notice and access removal are clear.'],
 es:['Tres comprobaciones antes de elegir finalistas','Encaje del modelo','Canales, capacidad y responsabilidades del cliente cubren el trabajo.','Ejecución verificable','Se pueden revisar investigación, mensajes, decisiones sobre respuestas y resultados.','Finalización ordenada','Propiedad, exportaciones, preaviso y retirada de accesos están claros.'],
 ca:['Tres comprovacions abans de triar finalistes','Encaix del model','Canals, capacitat i responsabilitats del client cobreixen la feina.','Execució verificable','Es poden revisar recerca, missatges, decisions sobre respostes i resultats.','Finalització ordenada','Propietat, exportacions, preavís i retirada d’accessos estan clars.'],
 fr:['Trois vérifications avant de choisir des finalistes','Adéquation du modèle','Les canaux, capacités et responsabilités du client correspondent au travail.','Exécution vérifiable','La recherche, les messages, le traitement des réponses et les résultats sont consultables.','Sortie praticable','Propriété, exports, préavis et retrait des accès sont clairs.']
};
const intros={
 en:['The providers below publicly market outsourced SDR, appointment-setting or closely related B2B lead-generation services. The table records dated advertised positioning, not independently verified delivery quality. Confirm current scope directly.','No company paid for inclusion. Beespoke is disclosed because it competes in this market.'],
 es:['Los proveedores siguientes anuncian servicios de SDR externos, concertación de reuniones o captación B2B relacionados. La tabla recoge su oferta en las fechas indicadas, no una calidad de servicio verificada de forma independiente. Confirma el alcance actual directamente.','Ninguna empresa ha pagado por aparecer. Beespoke declara su presencia porque compite en este mercado.'],
 ca:['Els proveïdors següents anuncien serveis d’SDR externs, concertació de reunions o captació B2B relacionats. La taula recull l’oferta en les dates indicades, no una qualitat de servei verificada de manera independent. Confirma l’abast actual directament.','Cap empresa ha pagat per aparèixer-hi. Beespoke declara que hi participa perquè competeix en aquest mercat.'],
 fr:['Les prestataires ci-dessous annoncent des services de SDR externalisés, de prise de rendez-vous ou de génération de leads B2B connexes. Le tableau décrit leur offre aux dates indiquées, pas une qualité vérifiée indépendamment. Confirmez directement le périmètre actuel.','Aucune entreprise n’a payé pour figurer ici. Beespoke signale sa présence parce qu’il vend un service concurrent.']
};
const disclosures={
 en:['Verify each provider’s current scope on its own website. Public offers change. Request relevant references and review the contract and data-handling terms before signing.','Beespoke earns revenue from outbound services. This list includes larger and broader competitors, uses no affiliate links and accepts no payment for order or inclusion.'],
 es:['Consulta el sitio de cada proveedor para comprobar el alcance actual. Las ofertas cambian. Pide referencias pertinentes y revisa contrato y tratamiento de datos antes de firmar.','Beespoke obtiene ingresos de servicios de prospección. La selección incluye competidores más grandes y con una oferta más amplia, no usa enlaces de afiliación y no acepta pagos por la inclusión ni por el orden.'],
 ca:['Consulta el web de cada proveïdor per comprovar l’abast actual. Les ofertes canvien. Demana referències pertinents i revisa el contracte i el tractament de dades abans de signar.','Beespoke obté ingressos de serveis de prospecció. La selecció inclou competidors més grans i amb una oferta més àmplia, no fa servir enllaços d’afiliació i no accepta pagaments per la inclusió ni per l’ordre.'],
 fr:['Consultez le site de chaque prestataire pour vérifier le périmètre actuel. Les offres évoluent. Demandez des références pertinentes et vérifiez contrat et traitement des données avant de signer.','Beespoke tire ses revenus de la prospection. La sélection comprend des concurrents plus grands et aux offres plus larges, sans lien d’affiliation ni paiement pour l’inclusion ou l’ordre.']
};
const style=`
body.sdr-shortlist-review #worked-example{scroll-margin-top:calc(var(--header) + 24px)}
body.sdr-shortlist-review #worked-example :is(h3,h4){font:600 1.1rem/1.5 Arial,Helvetica,sans-serif;letter-spacing:normal;text-transform:none;color:#14212b;margin:1.7rem 0 .7rem}
body.sdr-shortlist-review #worked-example p{color:#14212b;overflow-wrap:anywhere}
body.sdr-shortlist-review .shortlist-record{margin:1rem 0}
body.sdr-shortlist-review .shortlist-record>div{padding:.75rem 0;border-bottom:1px solid #d4dde1;min-width:0}
body.sdr-shortlist-review .shortlist-record dt{color:#14212b;font:600 1rem/1.55 Arial,Helvetica,sans-serif;letter-spacing:normal;text-transform:none}
body.sdr-shortlist-review .shortlist-record dd{color:#14212b;margin:.25rem 0 0;font:400 1rem/1.7 Arial,Helvetica,sans-serif;overflow-wrap:anywhere}
body.sdr-shortlist-review .proposal-decision{margin:1.3rem 0;padding:1rem 1.2rem;border:1px solid #d4dde1;background:#fff;color:#14212b;box-shadow:none;border-radius:3px}
body.sdr-shortlist-review .proposal-decision h4{margin:.2rem 0 .6rem!important}
body.sdr-shortlist-review .meeting-evidence{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0}
body.sdr-shortlist-review .meeting-evidence>div{border:1px solid #d4dde1;padding:1rem;background:#fff;min-width:0}
body.sdr-shortlist-review .meeting-evidence h4{margin:.2rem 0!important}
body.sdr-shortlist-review #worked-example :is(blockquote,.evidence-total){margin:1rem 0;padding:1rem 1.2rem;border:0;border-inline-start:3px solid #5a7483;background:#eef3f5;color:#14212b;font:400 1rem/1.7 Arial,Helvetica,sans-serif;box-shadow:none}
body.sdr-shortlist-review .evidence-total strong{color:#14212b;font-weight:600}
body.sdr-shortlist-review .evidence-method{background:#f4f7f8;color:#14212b;box-shadow:none}
body.sdr-shortlist-review .evidence-method :is(span,strong,p){color:#14212b;letter-spacing:normal;text-transform:none}
body.sdr-shortlist-review .evidence-method .evidence-grid{grid-template-columns:1fr;gap:.6rem}
body.sdr-shortlist-review .evidence-method .evidence-grid>div{background:#fff;border:1px solid #d4dde1;padding:1rem}
body.sdr-shortlist-review .evidence-method strong{font:600 1rem/1.5 Arial,Helvetica,sans-serif}
body.sdr-shortlist-review .inline-cta{background:#f4f7f8;color:#14212b;box-shadow:none;border:1px solid #d4dde1;padding:1.2rem}
body.sdr-shortlist-review .inline-cta h2{font:600 1.1rem/1.5 Arial,Helvetica,sans-serif;color:#14212b;letter-spacing:normal;margin:.3rem 0}
body.sdr-shortlist-review .inline-cta :is(p,span){color:#14212b;letter-spacing:normal;text-transform:none}
body.sdr-shortlist-review .table-wrap:focus-visible{outline:3px solid #356781;outline-offset:3px}
@media(max-width:650px){body.sdr-shortlist-review .meeting-evidence{grid-template-columns:1fr}body.sdr-shortlist-review .proposal-decision{padding:.9rem}}
`;
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=data[lang],prefix=lang==='en'?'':'/'+lang,route=prefix+'/guides/best-outsourced-sdr-companies/',file=path.join(root,route.slice(1),'index.html');let h=fs.readFileSync(file,'utf8');assert(!h.includes('id="sdr-shortlist-worked-style"'));
 const terms=h.match(/<section class="commercial-terms"[\s\S]*?<\/section>/)?.[0];
 const oldAnchors=[...h.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 const first=h.match(re('shortlist-providers-by-the-job-to-be-done'));assert(first);
 const oldRows=[...first[2].matchAll(/<tr>[\s\S]*?<\/tr>/g)].map(m=>m[0]).filter(s=>!s.includes('Beespoke'));
 let inner=first[2];let para=0;inner=inner.replace(/<p>[\s\S]*?<\/p>/g,m=>para<2?p(intros[lang][para++]):m);
 inner=inner.replace(/<caption>[\s\S]*?<\/caption>/,'<caption>'+e(c.caption)+'</caption>');
 const own=[...inner.matchAll(/<tr>[\s\S]*?<\/tr>/g)].find(m=>m[0].includes('>Beespoke</a>'));assert(own);let col=0;inner=inner.replace(own[0],own[0].replace(/<td>[\s\S]*?<\/td>/g,()=>'<td>'+e([c.ownScope,c.ownCheck][col++])+'</td>'));assert.equal(col,2);
 inner=inner.replace(/<p data-provider-review>[\s\S]*?<\/p>/,'<p data-provider-review>'+e(c.providerNote)+'</p>');assert(inner.includes(e(c.providerNote)));
 inner=inner.replace(/(<a href="\/data\/sdr-provider-review-2026-10-15.json"[^>]*>)[\s\S]*?(<\/a>)/,'$1'+e(c.archive)+'$2');h=h.replace(first[0],first[1]+inner+first[3]);
 const g=gates[lang];h=h.replace(re('outsourced-sdr-shortlist'),(_,a,b,z)=>a+'<div class="tool-heading"><h2>'+e(g[0])+'</h2>'+p(c.gateIntro)+'</div><div class="evidence-grid">'+[1,3,5].map(i=>'<div><strong>'+e(g[i])+'</strong>'+p(g[i+1])+'</div>').join('')+'</div><p class="tool-note">'+e(c.gateEnd)+'</p>'+z);
 let worked='<h2>'+e(c.title)+'</h2><p class="worked-fiction">'+e(c.fiction)+'</p><div class="worked-chapter" id="worked-example-1"><h3>'+e(c.briefTitle)+'</h3>'+p(c.brief)+dl(c.criteria)+'</div>';
 worked+='<div class="worked-chapter" id="worked-example-2"><h3>'+e(c.proposalsTitle)+'</h3>'+c.proposals.map(([title,evidence,decision,next])=>'<div class="proposal-decision"><h4>'+e(title)+'</h4>'+dl([[c.evidenceLabel,evidence],[c.decisionLabel,decision],[c.nextLabel,next]])+'</div>').join('')+'<h3>'+e(c.decisionTitle)+'</h3>'+dl(c.decisionRows)+'</div>';
 worked+='<div class="worked-chapter" id="worked-example-3"><h3>'+e(c.handoffTitle)+'</h3><blockquote>'+p(c.reply)+'</blockquote>'+p(c.handoff)+'</div><div class="worked-chapter" id="worked-example-4"><h3>'+e(c.exitTitle)+'</h3>'+p(c.exitText)+'</div>';
 worked+='<div id="meeting-evidence"><h3>'+e(c.ledgerTitle)+'</h3>'+p(c.ledgerIntro)+'<div class="meeting-evidence">'+c.ledger.map(([id,created,record,classification])=>'<div><h4>'+e(id)+'</h4>'+dl([[c.ledgerLabels[0],created],[c.ledgerLabels[1],record],[c.ledgerLabels[2],classification]])+'</div>').join('')+'</div><div class="evidence-total"><strong>'+e(c.totalsTitle)+'</strong>'+p(c.totals)+'</div>'+p(c.ledgerLimit)+'</div><h3>'+e(c.routeTitle)+'</h3>'+p(c.routeIntro)+'<div class="text-links">'+c.links.map(([url,label])=>'<a href="'+prefix+url+'">'+e(label)+' →</a>').join('')+'</div>';
 assert(re('worked-example').test(h));h=h.replace(re('worked-example'),(_,a,b,z)=>a+worked+z);
 for(const[id,[title,paras,list]]of Object.entries(c.editorial||{}))h=h.replace(re(id),(_,a,b,z)=>{const links=b.match(/<div class="text-links">[\s\S]*?<\/div>/)?.[0]||'';return a+'<h2>'+e(title)+'</h2>'+paras.map(p).join('')+(list.length?'<ul>'+list.map(s=>'<li>'+e(s)+'</li>').join('')+'</ul>':'')+links+z;});
 h=h.replace(re('provider-links-and-disclosure'),(_,a,b,z)=>{let n=0;return a+b.replace(/<p>[\s\S]*?<\/p>/g,m=>n<2?p(disclosures[lang][n++]):m).replace(/(<a href="[^"#]*\/services\/outsourced-sdr\/"[^>]*>)[\s\S]*?(<\/a>)/,'$1'+e(c.serviceLabel)+'$2')+z;});
 h=h.replace(re('buyer-decision-guide'),(_,a,b,z)=>a+(c.checkRows?'<h2>'+e(c.checkTitle)+'</h2><ol>'+c.checkSteps.map(s=>'<li>'+e(s)+'</li>').join('')+'</ol><div class="table-wrap"><table><caption>'+e(c.checkTitle)+'</caption><thead><tr>'+c.checkHeads.map(s=>'<th scope="col">'+e(s)+'</th>').join('')+'</tr></thead><tbody>'+c.checkRows.map(([a,...rest])=>'<tr><th scope="row">'+e(a)+'</th>'+rest.map(s=>'<td>'+e(s)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':b.replace(/<h2>[\s\S]*?<\/h2>/,'<h2>'+e(c.checkTitle)+'</h2>'))+z);
 // Correct mistranslated labels without altering the named provider assertions.
 if(lang==='es')h=h.replace('Cuadro de mando de diligencia debida de SDR subcontratado',c.checkTitle);
 if(lang==='ca')h=h.replace('<td>Outbound</td><td>Què és exactament qualificat?','<td>Resultat</td><td>Què es considera qualificat?').replace('<td>Outbound</td><td>Què reté el client?','<td>Sortida</td><td>Què conserva el client?');
 if(lang==='fr')h=h.replace('<td>Sortir</td><td>Qu\'est-ce qui est qualifié exactement ?','<td>Résultat</td><td>Qu’est-ce qui est qualifié exactement ?');
 if(c.faqs){h=h.replace(re('frequently-asked-questions'),(_,a,b,z)=>a+b.match(/<h2>[\s\S]*?<\/h2>/)[0]+c.faqs.map(([q,answer])=>'<details><summary>'+e(q)+'</summary>'+p(answer)+'</details>').join('')+z);}
 h=h.replace(/<div class="table-wrap">(<table><caption>([^<]+)<\/caption>)/g,(_,table,caption)=>'<div class="table-wrap" tabindex="0" role="region" aria-label="'+caption+'">'+table);
 const ctas=[...h.matchAll(/<aside class="inline-cta">[\s\S]*?<\/aside>/g)].map(m=>m[0]);assert.equal(ctas.length,2);for(let i=0;i<2;i++){const copy=c['cta'+(i+1)];h=h.replace(ctas[i],ctas[i].replace(/<h2>[\s\S]*?<\/h2>/,'<h2>'+e(copy[0])+'</h2>').replace(/<p>[\s\S]*?<\/p>/,p(copy[1])));}
 // Preserve all old anchor targets while keeping contents labels in agreement.
 const titles=new Map([...h.matchAll(/<section[^>]*id="([^"]+)"[^>]*>\s*<h2>([\s\S]*?)<\/h2>/g)].map(m=>[m[1],m[2]]));titles.set('outsourced-sdr-shortlist',e(g[0]));
 for(const[id,title]of titles)h=h.replace(new RegExp('(<a href="#'+id+'">)[\\s\\S]*?(<\\/a>)','g'),'$1'+title+'$2');
 h=h.replace('<div class="hero-actions">','<div class="hero-actions"><a class="secondary" href="#worked-example">'+e(c.jump)+'</a>');
 h=h.replace(/<time datetime="2026-11-04">[^<]+<\/time>/,'<time datetime="'+data.date+'">'+e(c.updated)+'</time>');
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,j,z)=>{const graph=JSON.parse(j);for(const n of graph['@graph']||[graph]){if(['Article','WebPage','TechArticle'].includes(n['@type'])&&n.dateModified)n.dateModified=data.revision;if(n['@type']==='FAQPage'&&c.faqs)n.mainEntity=c.faqs.map(([q,answer])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:answer}}));}return a+JSON.stringify(graph).replace(/</g,'\\u003c')+z;});
 h=h.replace('class="journal-article','class="journal-article sdr-shortlist-review').replace('</head>','<style id="sdr-shortlist-worked-style">'+style+'</style></head>');
 for(const row of oldRows)assert(h.includes(row),'Named third-party provider row changed');
 for(const id of oldAnchors)assert(h.includes('id="'+id+'"'),'Old anchor removed: '+id);
 if(terms)assert(h.includes(terms),'Approved commercial terms changed');
 assert(h.includes('datetime="'+data.date+'"'));assert(!/<a[^>]+href="https?:\/\/(?:www\.)?(?:memoryblue|salesroads|martal|cience|belkins|leadium|saleshive|callbox|cleverly)\./i.test(h));
 fs.writeFileSync(file,h);
 const url='https://outbound-lead-generation.com'+route;let n=0;sitemap=sitemap.replace(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g,(m,u)=>u===url?(n++,'<url><loc>'+u+'</loc><lastmod>'+data.date+'</lastmod></url>'):m);assert.equal(n,1);
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('SDR shortlist: completed supplier decisions and booking-evidence example in four languages; dated provider facts preserved.');
