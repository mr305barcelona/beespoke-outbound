// Bounded, owner-approved October 26 content work. Runs after older editorial layers.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com';
const rows=require('../data/query-improvements-20261026.json');
const cold='/services/cold-email-lead-generation/';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fileFor=route=>path.join(root,route.replace(/^\//,''),'index.html');
const date={en:'October 26, 2026',es:'26 de octubre de 2026',ca:'26 d’octubre de 2026',fr:'26 octobre 2026'};
const changed=new Set();
function revise(html,route,locale){
 html=html.replace(/(<p class="meta">[^]*?(?:Updated |Actualizado el |Actualitzat el |Mis à jour le ))[^<]*(<\/p>)/,(all,a,b)=>a+date[locale]+b);
 html=html.replace(/(<script type="application\/ld\+json">)([^]*?)(<\/script>)/g,(all,a,s,b)=>{
  const data=JSON.parse(s);for(const n of data['@graph']||[]){if(n['@id']?.startsWith(origin+route+'#')&&n.dateModified)n.dateModified='2026-10-26T18:30:00+01:00';}
  return a+JSON.stringify(data).replace(/</g,'\\u003c')+b;
 });
 return html;
}
function metadata(html,row){
 if(row.title){html=html.replace(/<title>[^]*?<\/title>/,'<title>'+esc(row.title)+'</title>').replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*(")/g,(all,a,b)=>a+esc(row.title)+b);}
 if(row.description)html=html.replace(/(<meta (?:name="(?:description|twitter:description)"|property="og:description") content=")[^"]*(")/g,(all,a,b)=>a+esc(row.description)+b);
 if(row.h1)html=html.replace(/<h1>[^]*?<\/h1>/,'<h1>'+esc(row.h1)+'</h1>');
 if(row.answer)html=html.replace(/(<p class="answer">)[^]*?(<\/p>)/,(all,a,b)=>a+esc(row.answer)+b);
 if(row.h1||row.description)html=html.replace(/(<script type="application\/ld\+json">)([^]*?)(<\/script>)/g,(all,a,s,b)=>{
  const data=JSON.parse(s);for(const n of data['@graph']||[]){if(n['@id']?.startsWith(origin+row.path+'#')&&['WebPage','Service','Article'].includes(n['@type'])){if(row.h1){n.name=row.h1;if(n.headline)n.headline=row.h1;}if(row.description)n.description=row.description;}}
  return a+JSON.stringify(data).replace(/</g,'\\u003c')+b;
 });
 for(const [before,after] of row.replacements||[]){assert(html.includes(esc(before)),row.path+': expected exact prior wording missing: '+before);html=html.split(esc(before)).join(esc(after));}
 return html;
}
function section(s){
 const table=s.table?'<div class="table-wrap" tabindex="0" role="region" aria-label="'+esc(s.table.caption)+'"><table><caption>'+esc(s.table.caption)+'</caption><thead><tr>'+s.table.headers.map(x=>'<th scope="col">'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+s.table.rows.map(r=>'<tr>'+r.map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'';
 return '<section id="'+s.id+'" data-growth-20261026><h2>'+esc(s.heading)+'</h2>'+s.body.map(x=>'<p>'+esc(x)+'</p>').join('')+table+'<div class="text-links">'+s.links.map(([url,label])=>'<a href="'+esc(url)+'">'+esc(label)+' →</a>').join('')+'</div></section>';
}
function insert(html,s,article=true){
 assert(!html.includes('id="'+s.id+'"'),'Duplicate bounded growth section '+s.id);
 const anchor=article?'</article>':'</main>';assert(html.includes(anchor),'Missing insertion anchor '+s.id);html=html.replace(anchor,section(s)+anchor);
 if(article){const nav='<a href="#'+s.id+'">'+esc(s.heading)+'</a>';for(const marker of ['</nav></details>','<div class="toc-progress">']){assert(html.includes(marker),'Missing TOC anchor '+s.id);html=html.replace(marker,nav+marker);}}
 return html;
}
function apply(route,fn){const f=fileFor(route),before=fs.readFileSync(f,'utf8'),after=fn(before);if(after!==before){fs.writeFileSync(f,after);changed.add(route);}}
for(const row of rows){const locale=/^\/(es|ca|fr)\//.exec(row.path)?.[1]||'en';apply(row.path,html=>revise(insert(metadata(html,row),row.section),row.path,locale));}
const references={
 en:{heading:'Need someone to run your cold email?',body:'This guide helps you evaluate agencies and costs. For Beespoke’s managed execution, use the dedicated service page: account research, messages, follow-up, replies, qualification and meeting handoff, with the actual scope and responsibilities.',label:'See Beespoke’s managed B2B cold email service'},
 es:{heading:'¿Necesitas delegar la ejecución del cold email?',body:'Esta guía ayuda a evaluar agencias y costes. Para conocer la ejecución gestionada por Beespoke, consulta el servicio específico: investigación, mensajes, seguimiento, respuestas, cualificación y relevo comercial, con su alcance y responsabilidades.',label:'Ver el servicio de cold email B2B de Beespoke'},
 ca:{heading:'Necessites delegar l’execució del cold email?',body:'Aquesta guia ajuda a avaluar agències i costos. Per conèixer l’execució gestionada per Beespoke, consulta el servei específic: recerca, missatges, seguiment, respostes, qualificació i traspàs comercial, amb l’abast i les responsabilitats.',label:'Veure el servei de cold email B2B de Beespoke'},
 fr:{heading:'Vous souhaitez déléguer l’exécution du cold email ?',body:'Ce guide aide à évaluer les agences et les coûts. Pour découvrir l’exécution gérée par Beespoke, consultez la prestation dédiée : recherche, messages, relances, réponses, qualification et relais commercial, avec son périmètre et ses responsabilités.',label:'Consulter la prestation de cold email B2B de Beespoke'}
};
for(const locale of Object.keys(references)){
 const prefix=locale==='en'?'':'/'+locale,c=references[locale];
 for(const route of ['/guides/cold-email-agency/','/guides/cold-email-agency-pricing/']){
  const full=prefix+route,s={id:'managed-cold-email-service',heading:c.heading,body:[c.body],links:[[prefix+cold,c.label]]};
  apply(full,html=>revise(insert(html,s),full,locale));
 }
 const hub=prefix+'/resources/';
 apply(hub,html=>{
  // Resource hubs may already discover this registry entry. Avoid a duplicate route.
  if(html.includes('href="'+prefix+cold+'"'))return html;
  return insert(html,{id:'cold-email-service-route',heading:c.heading,body:[],links:[[prefix+cold,c.label]]},false);
 });
 apply(prefix+cold,html=>revise(html,prefix+cold,locale));
}
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const route of changed){const target=origin+route;const escaped=target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');sitemap=sitemap.replace(new RegExp('(<loc>'+escaped+'</loc><lastmod>)[^<]+(</lastmod>)'),(all,a,b)=>a+'2026-10-26'+b);}fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
console.log('October 26 content growth: '+changed.size+' scoped pages; existing canonicals and guide intents preserved.');
