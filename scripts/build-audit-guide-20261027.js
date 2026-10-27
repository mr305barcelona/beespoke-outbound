const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),assetUrl=require("./asset-version");
const root=path.resolve(__dirname,".."),copy=require("../data/lead-generation-audit-copy-20261027");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function form(c){
 const fields=c.webLabels.map((label,i)=>'<label for="audit-count-'+i+'"><span data-audit-label>'+esc(label)+'</span><input id="audit-count-'+i+'" type="number" inputmode="numeric" min="0" max="1000000000" step="1" data-audit-count autocomplete="off"></label>').join("");
 return '<form data-audit-calculator novalidate aria-describedby="audit-privacy"><div class="calculator-grid"><label for="audit-mode">'+esc(c.mode)+'<select id="audit-mode" data-audit-mode><option value="web">'+esc(c.web)+'</option><option value="outbound">'+esc(c.outbound)+'</option></select></label>'+fields+'<label for="audit-target">'+esc(c.target)+'<input id="audit-target" data-audit-target type="number" inputmode="numeric" min="0" max="1000000000" step="1" autocomplete="off"></label></div><div class="text-links"><button class="button" type="submit">'+esc(c.calculate)+'</button><button class="button secondary" type="button" data-audit-sample>'+esc(c.sample)+'</button><button class="button secondary" type="button" data-audit-reset>'+esc(c.reset)+'</button></div><p data-audit-status role="status" aria-live="polite">'+esc(c.empty)+'</p><div class="tool-output" data-audit-output hidden><div class="table-wrap" tabindex="0" role="region" aria-label="'+esc(c.result)+'"><table><caption>'+esc(c.result)+'</caption><thead><tr><th scope="col">'+esc(c.stage)+'</th><th scope="col">'+esc(c.rate)+'</th></tr></thead><tbody data-audit-rows></tbody></table></div><p>'+esc(c.overall)+' <strong data-audit-overall></strong></p><div data-audit-scenario hidden><span>'+esc(c.needed)+'</span><strong data-audit-needed></strong></div></div></form><script type="application/json" id="audit-config">'+JSON.stringify(c).replace(/</g,"\\u003c")+'</script>';
}
const dates={en:"October 27, 2026",es:"27 de octubre de 2026",ca:"27 d’octubre de 2026",fr:"27 octobre 2026"};
const updated={en:"Updated ",es:"Actualizado el ",ca:"Actualitzat el ",fr:"Mis à jour le "};
const discovery={
 en:["Already running a campaign?","Audit your B2B lead-generation process","to separate measurement gaps, buyer fit and booking friction before increasing activity."],
 es:["¿Ya tienes una campaña en marcha?","Audita tu proceso de captación B2B","para distinguir problemas de medición, encaje y reserva antes de aumentar la actividad."],
 ca:["Ja tens una campanya en marxa?","Audita el procés de captació B2B","per distingir problemes de mesurament, encaix i reserva abans d’augmentar l’activitat."],
 fr:["Vous menez déjà une campagne ?","Auditez votre processus de prospection B2B","pour distinguer les lacunes de mesure, de ciblage et de réservation avant d’augmenter l’activité."]
};
for(const locale of ["en","es","ca","fr"]){
 const prefix=locale==="en"?"":"/"+locale,route=prefix+copy.path,file=path.join(root,route.slice(1),"index.html"),p=copy.page(locale),c=p.auditUi;let html=fs.readFileSync(file,"utf8");
 assert.equal((html.match(/id="audit-funnel"/g)||[]).length,1);
 html=html.replace(/(<section class="original-tool[^>]*id="audit-funnel">)([\s\S]*?)(<\/section>)/,(all,a,b,z)=>a+b.replace('<p class="tool-note">','<p class="tool-note" id="audit-privacy">')+form(c)+z);
 assert(html.includes("data-audit-calculator"),locale+": tool insertion failed");
 if(locale!=="en")html=html.replace(/href="\/resources\/account-research-handoff-example\/"/g,'href="'+prefix+'/resources/account-research-handoff-example/"');
 html=html.replace(/(<p class="meta">[\s\S]*?(?:Updated |Actualizado el |Actualitzat el |Mis à jour le ))[^<]*(<\/p>)/,(all,a,z)=>a.replace(/(?:Updated |Actualizado el |Actualitzat el |Mis à jour le )$/,updated[locale])+dates[locale]+z);
 html=html.replace("</head>",'<link rel="stylesheet" href="'+assetUrl("/lead-generation-audit.css")+'"><script src="'+assetUrl("/lead-generation-audit.js")+'" defer></script></head>');
 fs.writeFileSync(file,html);
 // This scoped editorial handoff publishes the new resource without rewriting the existing service.
 const service=path.join(root,(prefix+"/services/outbound-lead-generation/").slice(1),"index.html"),link=discovery[locale];let old=fs.readFileSync(service,"utf8");
 assert(!old.includes('class="audit-guide-link"'));
 old=old.replace("</article>",'<p class="audit-guide-link">'+esc(link[0])+' <a href="'+prefix+copy.path+'">'+esc(link[1])+'</a> '+esc(link[2])+'</p></article>');
 fs.writeFileSync(service,old);
}
let sitemap=fs.readFileSync(path.join(root,"sitemap.xml"),"utf8");
for(const locale of ["en","es","ca","fr"]){const prefix=locale==="en"?"":"/"+locale;for(const route of [prefix+copy.path,prefix+"/resources/"]){const url="https://outbound-lead-generation.com"+route;const escaped=url.replace(/[.*+?^$()|[\]\\]/g,"\\$&");sitemap=sitemap.replace(new RegExp("(<loc>"+escaped+"</loc><lastmod>)[^<]+(</lastmod>)"),(a,b,z)=>b+"2026-10-27"+z);}}
fs.writeFileSync(path.join(root,"sitemap.xml"),sitemap);
console.log("Audit guide: four complete locales, local-only funnel arithmetic and matching substantive dates.");
