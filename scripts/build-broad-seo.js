// Locale-specific additions run after localization and earlier scoped releases.
const fs=require('node:fs'),path=require('node:path'),growth=require('../data/broad-seo-20261015');
for(const route of growth.routes){const locale=/^\/(es|ca|fr)\//.exec(route)?.[1]||'en',pathname=locale==='en'?route:route.slice(3),file=path.join(__dirname,'..',route,'index.html');fs.writeFileSync(file,growth.apply(fs.readFileSync(file,'utf8'),pathname,locale));}
const review={title:'Outsourced SDR provider positioning review',checkedOn:growth.updated,publisher:'Beespoke Outbound Lead Generation',methodology:'Manual Browserbase review of linked first-party pages. Positioning is advertised scope, not independent performance validation or guaranteed staffing. Unpaid, unranked inclusion; publisher sells a competing LinkedIn service.',providers:growth.providers.map(([provider,source,positioning])=>({provider,source,checkedOn:growth.updated,positioning:positioning[0],publisherOffer:provider==='Beespoke'}))};
fs.writeFileSync(path.join(__dirname,'../data/sdr-provider-review-2026-10-15.json'),JSON.stringify(review,null,2)+'\n');
console.log(`Built ${growth.routes.length} focused broad-audit page updates.`);
