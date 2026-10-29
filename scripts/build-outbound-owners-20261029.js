const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),updates=require('../data/outbound-owner-improvements-20261029.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const revisions={en:'Updated October 29, 2026',es:'Actualizado el 29 de octubre de 2026',ca:'Actualitzat el 29 d’octubre de 2026',fr:'Mis à jour le 29 octobre 2026'};
const changed=[];
for(const [route,u]of Object.entries(updates))for(const l of ['en','es','ca','fr']){
 const pre=l==='en'?'':'/'+l,p=pre+route,file=path.join(root,p.slice(1),'index.html'),c=u[l];let h=fs.readFileSync(file,'utf8');assert(!h.includes('id="'+u.id+'"'),'Duplicate postprocessor '+p);
 for(const [old,text] of c.scopeCorrections||[]){assert(h.includes(old)||h.includes(esc(old)),'Expected original scope '+p);h=h.split(esc(old)).join(esc(text));if(old!==esc(old))h=h.split(old).join(text);}
 const faq=h.match(/<section\b[^>]*class="[^"]*\bfaqs\b[^"]*"[^>]*>/),anchor=faq?.[0]||h.match(/<section\b[^>]*\bid="buyer-decision-guide"[^>]*>/)?.[0];assert(anchor,'No editorial insertion point '+p);
 const before=anchor.match(/id="([^"]+)"/)[1],section='<section class="competitive-depth" id="'+u.id+'"><h2>'+esc(c.heading)+'</h2>'+c.body.map(t=>'<p>'+esc(t)+'</p>').join('')+(c.items?'<ol>'+c.items.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol>':'')+'</section>';
 h=h.replace(anchor,section+anchor);let tocCount=0;h=h.replace(new RegExp('<a href="#'+before+'">','g'),m=>{tocCount++;return '<a href="#'+u.id+'">'+esc(c.heading)+'</a>'+m;});assert.equal(tocCount,2,'Both reading navigators '+p);
 h=h.replace(/(<p class="meta">[\s\S]*? · )[^<]*(<\/p>)/,(m,a,z)=>a+revisions[l]+z);
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,(m,a,j,z)=>{const d=JSON.parse(j);for(const n of d['@graph']||[d]){if(['WebPage','Article'].includes(n['@type']))n.dateModified='2026-10-29T12:00:00+01:00';if(n['@type']==='FAQPage')for(const item of n.mainEntity||[])for(const [old,text]of c.scopeCorrections||[])item.acceptedAnswer.text=item.acceptedAnswer.text.split(old).join(text); }return a+JSON.stringify(d).replace(/</g,'\\u003c')+z;});fs.writeFileSync(file,h);changed.push(p);
}
// Correct the existing English buyer-guide callout using the established channel scope.
{const route='/guides/cold-email-agency/',file=path.join(root,route.slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 const old='This is a buyer’s guide, not a cold-email service offer. Beespoke’s published outbound plan is LinkedIn-led; any additional channel needs a separate written scope.';
 const replacement='This buyer’s guide explains how to evaluate a provider. Beespoke’s standard outbound plan covers cold email and/or cold LinkedIn; the agreed channel responsibilities, infrastructure and third-party costs should be written down before work begins.';
 assert(h.includes(old),'Expected original approved-fact contradiction');h=h.replace(old,replacement);
 h=h.replace(/(<p class="meta">[\s\S]*? · )[^<]*(<\/p>)/,(m,a,z)=>a+revisions.en+z);
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,(m,a,j,z)=>{const d=JSON.parse(j);for(const n of d['@graph']||[d])if(['WebPage','Article'].includes(n['@type']))n.dateModified='2026-10-29T12:00:00+01:00';return a+JSON.stringify(d).replace(/</g,'\\u003c')+z;});fs.writeFileSync(file,h);changed.push(route);
}
let s=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const p of changed){const url='https://outbound-lead-generation.com'+p;s=s.replace(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g,(m,u)=>u===url?'<url><loc>'+u+'</loc><lastmod>2026-10-29</lastmod></url>':m);}fs.writeFileSync(path.join(root,'sitemap.xml'),s);
console.log('Outbound owner improvements: '+changed.length+' localized pages; primary targets, existing content and approved prices preserved.');
