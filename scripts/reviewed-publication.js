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
const workedGuideRoutes = new Set([
 '/guides/how-to-manage-an-outsourced-sdr-team/','/industries/manufacturing-lead-generation/',
 '/compare/lead-generation-agency-vs-in-house-team/','/guides/outsourced-sdr-pros-and-cons/',
 '/compare/sdr-vs-bdr-outsourcing/'
].flatMap(p=>['','/es','/ca','/fr'].map(prefix=>prefix+p)));
const buyerEvidenceRoutes = new Map([
  ['/compare/lead-generation-agency-vs-software/', 'software'],
  ['/guides/appointment-setting-pricing/', 'appointments'],
  ['/guides/best-outsourced-sdr-companies/', 'sdr'],
  ['/guides/best-linkedin-lead-generation-agencies/', 'linkedin'],
  ['/guides/best-b2b-lead-generation-agencies/', 'b2b']
]);
const unlocalized = route => route.replace(/^\/(?:es|ca|fr)(?=\/)/, '');
function buyerDescription(route, locale, fallback) {
  const guide = buyerEvidenceRoutes.get(unlocalized(route));
  return guide ? require('../data/buyer-evidence-20261104/' + guide + '/' + locale).description : fallback;
}
const pricingEvidenceRoutes = new Set(['/guides/outbound-lead-generation-cost/','/guides/outbound-call-center-pricing/','/guides/linkedin-lead-generation-agency-cost/','/compare/outsourced-sdr-vs-in-house-sdr/','/guides/outsourced-sdr-cost/','/guides/pay-per-meeting-lead-generation/','/guides/cold-email-agency-pricing/']);
const dateFor=(route,fallback)=>['/industries/recruitment-agency-lead-generation/','/industries/marketing-agency-lead-generation/','/industries/b2b-saas-lead-generation/','/industries/it-services-lead-generation/'].includes(unlocalized(route))?'2026-11-09':['/compare/outbound-agency-vs-freelancer/','/compare/sdr-outsourcing-vs-staff-augmentation/'].includes(unlocalized(route))?'2026-11-05':workedGuideRoutes.has(route)||buyerEvidenceRoutes.has(unlocalized(route))||pricingEvidenceRoutes.has(unlocalized(route))?'2026-11-04':/^(?:\/(?:es|ca|fr))?\/guides\/b2b-lead-generation-consultant-vs-agency\/$/.test(route)?'2026-11-04':/^(?:\/(?:es|ca|fr))?\/guides\/outsourced-sdr-vs-lead-generation-agency\/$/.test(route)?'2026-11-03':outboundOwnerRoutes.has(route)?'2026-10-29':buyerRoutes.has(route)?'2026-10-27':contentRoutes.has(route)?'2026-10-26':routes.includes(route)?'2026-10-20':fallback;
module.exports={revise,dateFor,buyerDescription};
