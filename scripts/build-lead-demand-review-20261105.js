'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),data=require('../data/lead-demand-review-20261105.json');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=s=>'<p>'+esc(s)+'</p>';
const cards=(rows,cls='ld-cards')=>'<div class="'+cls+'">'+rows.map(([title,...copy])=>'<div><h3>'+esc(title)+'</h3>'+copy.map(p).join('')+'</div>').join('')+'</div>';
function section(h,id,fn){
 const opening=new RegExp('<section\\b[^>]*\\bid="'+id+'"[^>]*>').exec(h);assert(opening,id);
 let depth=0,end;const tail=h.slice(opening.index);
 for(const m of tail.matchAll(/<(\/?)section\b[^>]*>/g)){depth+=m[1]?-1:1;if(!depth){end=opening.index+m.index+m[0].length;break;}}
 assert(end,id+' balanced section');return h.slice(0,opening.index)+fn(h.slice(opening.index,end))+h.slice(end);
}
const append=(h,id,html)=>section(h,id,s=>s.slice(0,-10)+html+'</section>');
const block=(id,title,body)=>'<section class="ld-example" id="'+id+'"><h2>'+esc(title)+'</h2>'+body+'</section>';
const css=`
body.journal-article .article-grid article .ld-example{box-sizing:border-box;padding:clamp(.8rem,2.5vw,1.7rem);margin:1.8rem 0;border:1px solid #d6e0e5;border-radius:.55rem;background:#f6f9fa;color:#14212b;scroll-margin-top:calc(var(--header) + 24px)}
body.journal-article .ld-example h2{margin-top:0}
body.journal-article .ld-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;margin:1rem 0}
body.journal-article .ld-cards>div,body.journal-article .ld-breakdown>div{min-width:0;padding:1rem;background:#fff;border:1px solid #d6e0e5;border-radius:.4rem}
body.journal-article .ld-cards h3,body.journal-article .ld-breakdown h3{font:600 1.04rem/1.45 Arial,Helvetica,sans-serif;margin:0 0 .5rem;color:#14212b}
body.journal-article .ld-cards p{margin:.6rem 0 0}
body.journal-article .ld-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem;margin:1rem 0}
body.journal-article .ld-metrics>div{min-width:0;padding:.8rem;border-bottom:2px solid #b2c4cf}
body.journal-article .ld-metrics dt{font-size:.9rem;line-height:1.5;margin:0}
body.journal-article .ld-metrics dd{margin:.4rem 0 0;font-size:1.65rem;font-weight:600;font-variant-numeric:tabular-nums}
body.journal-article .ld-breakdown{display:grid;gap:.7rem;margin:1rem 0}
body.journal-article .ld-decision{padding:.85rem 1rem;border-inline-start:3px solid #527087;background:#eaf0f3;color:#14212b}
body.journal-article .ld-message{margin:1rem 0;padding:1rem;border-inline-start:3px solid #527087;background:#fff;color:#14212b;font:inherit}
body.journal-article .ld-brief{display:grid;gap:1rem}
body.journal-article .ld-brief dt{font-weight:600}
body.journal-article .ld-brief dd{margin:.35rem 0 0}
body.journal-article .ld-optional{border:1px solid #b9c5cd;border-radius:.4rem;padding:1rem}
body.journal-article .ld-optional>summary{font:600 1rem/1.5 Arial,Helvetica,sans-serif;cursor:pointer;color:#14212b}
body.journal-article .ld-optional[open]>summary{margin-bottom:1rem}
body.journal-article .ld-optional .worksheet-actions .button.secondary{color:#14212b;background:#fff;border:1px solid #8a979f;border-radius:3px;box-shadow:none;min-height:44px;font-weight:500}
body.journal-article .ld-optional .worksheet-actions .button.secondary:hover{background:#edf2f5;color:#14212b}
body.journal-article .ld-optional :is(summary,button):focus-visible{outline:3px solid #356781;outline-offset:3px}
body.journal-article #sources .source-reference{overflow-wrap:anywhere;word-break:normal}
@media(max-width:600px){body.journal-article .ld-cards,body.journal-article .ld-metrics{grid-template-columns:1fr}}
@media print{body.journal-article .ld-cards>div{break-inside:avoid}body.journal-article .ld-optional{border:0}}
`;
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const lang of ['en','es','ca','fr']){
 const c=data[lang],prefix=lang==='en'?'':'/'+lang,route=prefix+'/compare/lead-generation-vs-demand-generation/',file=path.join(root,route.slice(1),'index.html');let h=fs.readFileSync(file,'utf8');
 assert(!h.includes('id="ld-worked-diagnosis"'));
 h=append(h,'guide-section-1','<h3>'+esc(c.termsTitle)+'</h3><dl class="ld-brief">'+c.terms.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>'+p(c.termsNote));
 const metrics='<dl class="ld-metrics">'+c.metricLabels.map((a,i)=>'<div><dt>'+esc(a)+'</dt><dd>'+[80,12,4][i]+'</dd></div>').join('')+'</dl>';
 const breakdown=cards(c.breakdownLabels.map((label,i)=>[label,c.breakdownNotes[i]]),'ld-breakdown');
 h=section(h,'guide-section-1',s=>s+block('ld-worked-diagnosis',c.cohortTitle,p(c.cohortIntro)+metrics+breakdown+p(c.cohortFlow)+p(c.cohortRates)+'<p class="ld-decision">'+esc(c.cohortDecision)+'</p>'));
 h=section(h,'buyer-worksheet',s=>s.replace(/^(<section\b[^>]*>)([\s\S]*)(<\/section>)$/,(_,a,b,z)=>a+'<details class="ld-optional" id="ld-optional-workbook"><summary>'+esc(c.workbook)+'</summary>'+p(c.workbookNote)+b+'</details>'+z));
 const messages=p(c.messageContext)+c.openings.map(([title,quote,note])=>'<h3>'+esc(title)+'</h3><blockquote class="ld-message">'+p(quote)+'</blockquote>'+p(note)).join('')+p(c.practice)+'<div class="text-links"><a href="'+prefix+'/guides/b2b-cold-email-copywriting/">'+esc(c.writingLink)+' →</a><a href="'+prefix+'/guides/cold-email-follow-up/">'+esc(c.followupLink)+' →</a></div>';
 h=section(h,'guide-section-3',s=>s+block('ld-channel-examples',c.channelTitle,cards(c.channels))+block('ld-message-examples',c.messageTitle,messages));
 h=append(h,'guide-section-5','<h3>'+esc(c.diagnosesTitle)+'</h3><dl class="ld-brief">'+c.diagnoses.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>');
 h=append(h,'guide-section-6','<h3>'+esc(c.gatingTitle)+'</h3>'+cards(c.gating));
 h=section(h,'guide-section-7',s=>s+block('ld-booking-records',c.recordsTitle,cards(c.records)+p(c.recordNote)));
 h=append(h,'guide-section-9','<h3>'+esc(c.briefTitle)+'</h3><dl class="ld-brief">'+c.brief.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>');
 h=h.replace(/(<aside class="inline-cta">[\s\S]*?<p>)[\s\S]*?(<\/p>)/g,(_,a,z)=>a+esc(c.cta)+z).replace(/(<section class="final-cta">[\s\S]*?<p>)[\s\S]*?(<\/p>)/,(_,a,z)=>a+esc(c.cta)+z);
 h=h.replace(/<div class="hero-actions"[^>]*>/,m=>m+'<a class="secondary" href="#ld-worked-diagnosis">'+esc(c.jump)+'</a>');
 for(const [after,id,label]of [['guide-section-1','ld-worked-diagnosis',c.cohortTitle],['guide-section-3','ld-channel-examples',c.channelTitle],['ld-channel-examples','ld-message-examples',c.messageTitle],['guide-section-7','ld-booking-records',c.recordsTitle]]){
  const re=new RegExp('(<a href="#'+after+'">[^<]+</a>)','g');let count=0;h=h.replace(re,m=>{count++;return m+'<a href="#'+id+'">'+esc(label)+'</a>';});assert.equal(count,2,id+' contents');
 }
 h=section(h,'frequently-asked-questions',s=>s.replace('</div></section>','<details><summary>'+esc(c.faq[0])+'</summary>'+p(c.faq[1])+'</details></div></section>'));
 h=section(h,'sources',s=>{
  s=s.replace(/<p>[\s\S]*?<\/p>/,p(c.sourceNote));
  s=s.replace(/<a href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/g,(_,url,label)=>'<span class="source-reference">'+label+' ('+esc(url.replace(/^https?:\/\//,''))+')</span>');
  const refs=['MX Group — themxgroup.com/resources/demand-generation-vs-lead-generation/','Headley Media — headleymedia.com/resources/demand-generation-vs-lead-generation-what-you-need-to-know/','VisioneerIT — visioneerit.com/blog/demand-generation-vs-lead-generation-key-differences-every-b2b-marketer-must-know','Leadfeeder — leadfeeder.com/blog/comparisons/demand-generation-vs-lead-generation/'];
  return s.replace('</ol>','</ol><ul>'+refs.map(x=>'<li><span class="source-reference">'+esc(x)+'</span></li>').join('')+'</ul>');
 });
 let dateCount=0;h=h.replace(/(<p class="meta">[\s\S]*?)(October 28, 2026|28 de octubre de 2026|28 d’octubre de 2026|28 octobre 2026)(<\/p>)/,(_,a,b,z)=>{dateCount++;return a+c.dateLabel+z;});assert.equal(dateCount,1);
 h=h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/,(_,a,json,z)=>{const g=JSON.parse(json);for(const n of g['@graph']){if(n['@type']==='Article')n.dateModified=data.revision;if(n['@type']==='FAQPage')n.mainEntity.push({'@type':'Question',name:c.faq[0],acceptedAnswer:{'@type':'Answer',text:c.faq[1]}});}return a+JSON.stringify(g).replace(/</g,'\\u003c')+z;});
 h=h.replace('</head>','<style id="lead-demand-review">'+css+'</style></head>').replace('</body>','<script id="ld-workbook-behavior">document.addEventListener("click",function(e){var a=e.target.closest("a[href=\\"#buyer-worksheet\\"]");if(a)document.getElementById("ld-optional-workbook").open=true;});</script></body>');
 fs.writeFileSync(file,h);
 const old='<loc>https://outbound-lead-generation.com'+route+'</loc><lastmod>2026-10-28</lastmod>';assert.equal(sitemap.split(old).length-1,1);sitemap=sitemap.replace(old,old.replace('2026-10-28',data.date));
}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);console.log('Applied 18 reviewed improvements to four lead/demand comparison locales.');

