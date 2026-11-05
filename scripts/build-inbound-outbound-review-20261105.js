'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),data=require('../data/inbound-outbound-review-20261105.json');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const [lang,p] of Object.entries(data.pages)){
 const file=path.join(root,p.path);let h=fs.readFileSync(file,'utf8');
 assert.equal(hash(h),p.originalSha256,lang+' comparison baseline changed; reconcile before applying reviewed edits');
 for(const c of [...p.changes].reverse()){
  assert.equal(h.slice(c.start,c.end),c.old,lang+' reviewed replacement mismatch');
  h=h.slice(0,c.start)+c.new+h.slice(c.end);
 }
 assert.equal(hash(h),p.reviewedSha256,lang+' output differs from approved preview');
 let dates=0;
 h=h.replace(/(<p class="meta">[\s\S]*?)(October 28, 2026|28 de octubre de 2026|28 d’octubre de 2026|28 octobre 2026)(<\/p>)/,(m,a,b,c)=>{dates++;return a+data.localDates[lang]+c;});
 assert.equal(dates,1,lang+' visible revision date');
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(m,a,json,z)=>{
  const graph=JSON.parse(json);let count=0;for(const node of graph['@graph'])if(node['@type']==='Article'){node.dateModified=data.revision;count++;}
  assert.equal(count,1);return a+JSON.stringify(graph).replace(/</g,'\\u003c')+z;
 });
 fs.writeFileSync(file,h);
 const url='https://outbound-lead-generation.com/'+p.path.replace(/index\.html$/,'');
 const literal='<loc>'+url+'</loc><lastmod>2026-10-28</lastmod>';
 assert.equal(sitemap.split(literal).length-1,1,lang+' sitemap revision');
 sitemap=sitemap.replace(literal,'<loc>'+url+'</loc><lastmod>'+data.reviewedDate+'</lastmod>');
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
console.log('Applied reviewed inbound/outbound comparison in four languages with aligned revision dates.');
