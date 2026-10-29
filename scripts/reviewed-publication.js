const fs=require('node:fs'),path=require('node:path');
const dates={en:'Updated October 20, 2026',es:'Actualizado el 20 de octubre de 2026',ca:'Actualitzat el 20 d’octubre de 2026',fr:'Mis à jour le 20 octobre 2026'};
function revise(html,locale){
 return html.replace(/(<p class="meta">[^]*?·\s*)([^<]+)(<\/p>)/g,(all,a,old,b)=>a+dates[locale]+b).replace(/(<script type="application\/ld\+json">)([^]*?)(<\/script>)/g,(all,a,text,b)=>{
  const data=JSON.parse(text);for(const node of data['@graph']||[data])if(['WebPage','Article','TechArticle'].includes(node['@type'])&&node.dateModified)node.dateModified=node.dateModified.replace(/^\d{4}-\d{2}-\d{2}/,'2026-10-20');
  return a+JSON.stringify(data).replace(/</g,'\\u003c')+b;
 });
}
const routes=require('../data/owner-reviewed-routes-20261019.json');
const contentRoutes=new Set(require('../data/query-improvements-20261026.json').map(row=>row.path));
for(const locale of ['','/es','/ca','/fr'])for(const route of ['/services/cold-email-lead-generation/','/guides/cold-email-agency/','/guides/cold-email-agency-pricing/'])contentRoutes.add(locale+route);
const buyerRoutes=new Set(require('../data/buyer-clarity-20261027').routes);
const outboundOwnerRoutes=new Set(Object.keys(require('../data/outbound-owner-improvements-20261029.json')).flatMap(route=>['','/es','/ca','/fr'].map(pre=>pre+route)));outboundOwnerRoutes.add('/guides/cold-email-agency/');
const dateFor=(route,fallback)=>outboundOwnerRoutes.has(route)?'2026-10-29':buyerRoutes.has(route)?'2026-10-27':contentRoutes.has(route)?'2026-10-26':routes.includes(route)?'2026-10-20':fallback;
module.exports={revise,dateFor};
