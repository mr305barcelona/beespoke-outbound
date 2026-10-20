const fs=require('node:fs'),path=require('node:path');
const dates={en:'Updated October 20, 2026',es:'Actualizado el 20 de octubre de 2026',ca:'Actualitzat el 20 d’octubre de 2026',fr:'Mis à jour le 20 octobre 2026'};
function revise(html,locale){
 return html.replace(/(<p class="meta">[^]*?·\s*)([^<]+)(<\/p>)/g,(all,a,old,b)=>a+dates[locale]+b).replace(/(<script type="application\/ld\+json">)([^]*?)(<\/script>)/g,(all,a,text,b)=>{
  const data=JSON.parse(text);for(const node of data['@graph']||[data])if(['WebPage','Article','TechArticle'].includes(node['@type'])&&node.dateModified)node.dateModified=node.dateModified.replace(/^\d{4}-\d{2}-\d{2}/,'2026-10-20');
  return a+JSON.stringify(data).replace(/</g,'\\u003c')+b;
 });
}
const routes=require('../data/owner-reviewed-routes-20261019.json');
const dateFor=(route,fallback)=>routes.includes(route)?'2026-10-20':fallback;
module.exports={revise,dateFor};
