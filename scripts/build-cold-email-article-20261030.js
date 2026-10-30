const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),asset=require('./asset-version');
const root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com',route='/guides/b2b-cold-email-copywriting/',locales=['en','es','ca','fr'];
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const plain=value=>String(value).replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const legacy={'guide-section-1':'j-context','guide-section-2':'j-context','guide-section-3':'j-examples','guide-section-4':'j-review','guide-section-5':'j-offer','guide-section-6':'j-length','guide-section-7':'j-measure','buyer-worksheet':'j-review','phrase-review':'j-review','buyer-decision-guide':'j-practice','frequently-asked-questions':'j-faq',sources:'j-sources'};
const label=(l,items)=>items[locales.indexOf(l)];
function example(sample,p){
 return '<div class="j-example" data-example="'+sample.id+'"><h3>'+esc(sample.title)+'</h3><p class="j-small">'+esc(p.ui.fictionalCase)+'</p><dl><dt>'+esc(p.ui.observed)+'</dt><dd>'+esc(sample.context)+'</dd><dt>'+esc(p.ui.unknown)+'</dt><dd>'+esc(sample.unknown)+'</dd></dl><div class="j-email"><p class="j-subject">'+esc(p.ui.subject)+' · '+esc(sample.subject)+'</p><p class="j-email-body">'+esc(sample.message)+'</p></div><div class="j-inbox" aria-label="'+esc(p.ui.inbox+' — '+sample.name)+'"><p class="j-small">'+esc(p.ui.inbox)+'</p><p>'+esc(sample.subject)+'</p><p>'+esc(sample.message.split('\n\n')[1])+'</p></div><ul class="j-notes">'+sample.notes.map(note=>'<li>'+esc(note)+'</li>').join('')+'</ul><button class="j-button cursor-interaction" type="button" data-load="'+sample.id+'" disabled>'+esc(p.ui.reviewExample)+'</button></div>';
}
for(const l of locales){
 const p=JSON.parse(fs.readFileSync(path.join(root,'data/cold-email-article-20261030/'+l+'.json'),'utf8')),pre=l==='en'?'':'/'+l,url=origin+pre+route,file=path.join(root,(pre+route).slice(1),'index.html');
 let h=fs.readFileSync(file,'utf8'),main=p.html;
 const oldHeader=h.match(/<header class="site-header journal-site-header">[\s\S]*?<\/header>/)[0];
 assert(main.includes('id="main-content"'));assert(!/Full article preview|Revised for review|data-site-link/.test(main));
 main=main.replace('<div data-example-library></div>','<div data-example-library>'+p.samples.slice(0,4).map(s=>example(s,p)).join('')+'</div>');
 for(const sample of p.samples.slice(4))main=main.replace('<p class="j-email-body" data-micro="'+sample.id+'"></p>','<p class="j-email-body" data-micro="'+sample.id+'">'+esc(p.ui.subject+': '+sample.subject+'\n\n'+sample.message)+'</p>');
 main=main.replace(/(<select[^>]*data-example-select[^>]*>[\s\S]*?)(<\/select>)/,(m,a,z)=>a+p.samples.map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join('')+z);
 const sections=[...main.matchAll(/<section class="[^"]*j-section[^"]*" id="([^"]+)" data-section-label="([^"]+)">/g)].map(m=>({id:m[1],label:m[2]}));assert.equal(sections.length,12);
 const links=sections.map(s=>'<a class="j-section-link" href="#'+s.id+'" data-jump="'+s.id+'">'+s.label+'</a>').join('')+'<button type="button" class="j-show-all cursor-interaction" data-show-all hidden>'+esc(label(l,['Read the full article','Leer el artículo completo','Llegir l’article complet','Lire l’article complet']))+'</button>';
 main=main.replace(/<nav([^>]*\bdata-contents[^>]*)><\/nav>/g,'<nav$1>'+links+'</nav>');
 for(const [alias,target] of Object.entries(legacy)){
  const anchor='<span class="legacy-anchor" id="'+alias+'" aria-hidden="true"></span>';
  if(alias==='phrase-review')main=main.replace('<details class="j-tool" data-phrase-tool>',anchor+'<details class="j-tool" data-phrase-tool>');
  else main=main.replace(new RegExp('(<section[^>]*id="'+target+'"[^>]*>)'),'$1'+anchor);
 }
 // Forms remain optional and honest when client-side behavior is unavailable.
 main=main.replace(/<button\b([^>]*\bdata-(?:use-selected|build-review|new-draft|export|clear(?:-yes|-no)?|edit-review|print|phrase-check|phrase-clear|close-csv)\b[^>]*)>/g,(m,a)=>a.includes('disabled')?m:'<button'+a+' disabled>');
 const faqs=[...main.matchAll(/<details><summary class="cursor-interaction">([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)].map(m=>({question:plain(m[1]),answer:plain(m[2])}));assert.equal(faqs.length,7);
 const config={locale:l,ui:p.ui,samples:p.samples};
 h=h.replace(/<div id="beespoke-cold-email-full"><div class="j-page">(<main[\s\S]*?<\/main>)<\/div><script type="application\/json" data-cold-email-config>[\s\S]*?<\/script><\/div>/,'$1');
 assert.equal((h.match(/<main\b/g)||[]).length,1);
 h=h.replace(/<main\b[^>]*>[\s\S]*?<\/main>/,'<div id="beespoke-cold-email-full"><div class="j-page">'+main+'</div><script type="application/json" data-cold-email-config>'+json(config)+'</script></div>');
 h=h.replace(/<body\b([^>]*)>/,(m,a)=>a.includes('cold-copy-page')?m:'<body'+a.replace(/class="([^"]+)"/,'class="$1 cold-copy-page"')+'>');
 h=h.replace(/<title>[\s\S]*?<\/title>/,'<title>'+esc(p.title)+'</title>');
 for(const [type,name,value] of [['name','description',p.description],['property','og:title',p.title],['property','og:description',p.description],['name','twitter:title',p.title],['name','twitter:description',p.description]])h=h.replace(new RegExp('(<meta '+type+'="'+name+'" content=")[^"]*(")'),(m,a,z)=>a+esc(value)+z);
 h=h.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(m,raw)=>{const data=JSON.parse(raw);for(const n of data['@graph']||[data]){
  if(n['@type']==='Article'){n.name=p.h1;n.headline=p.h1;n.description=p.description;n.inLanguage=l;n.datePublished=p.datePublished;n.dateModified=p.dateModified;}
  if(n['@type']==='FAQPage')n.mainEntity=faqs.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}));
  if(n['@type']==='BreadcrumbList')n.itemListElement=[{name:label(l,['Home','Inicio','Inici','Accueil']),item:origin+pre+'/'},{name:label(l,['Resources','Recursos','Recursos','Ressources']),item:origin+pre+'/resources/'},{name:p.h1,item:url}].map((v,i)=>({'@type':'ListItem',position:i+1,...v}));
 }return '<script type="application/ld+json">'+json(data)+'</script>';});
 h=h.replace(/<link rel="stylesheet" href="\/(?:buyer-guide-worksheet|outbound-message-examples|cold-email-article)\.css[^\"]*">/g,'').replace(/<script src="\/(?:buyer-guide-worksheet|outbound-phrase-review|cold-email-article)\.js[^\"]*" defer><\/script>/g,'');
 h=h.replace('</head>','<link rel="stylesheet" href="'+asset('/cold-email-article.css')+'"><script src="'+asset('/cold-email-article.js')+'" defer></script></head>');
 assert.equal(h.match(/<header class="site-header journal-site-header">[\s\S]*?<\/header>/)[0],oldHeader,'Header/booking/language behavior must be preserved');
 fs.writeFileSync(file,h);
 // Refresh only this article’s existing discovery row and ItemList entry.
 const hub=path.join(root,(pre+'/resources/').slice(1),'index.html');let library=fs.readFileSync(hub,'utf8');
 const itemRe=new RegExp('(<a class="journal-resource-link" href="'+pre+route+'"[^>]*><div><h2[^>]*>)[\\s\\S]*?(</h2>)(?:<p>[\\s\\S]*?</p>)?');
 assert(itemRe.test(library),'Existing resource row');library=library.replace(itemRe,(m,a,z)=>a+esc(p.h1)+z+'<p>'+esc(p.description)+'</p>');
 library=library.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(m,raw)=>{const d=JSON.parse(raw);for(const n of d['@graph']||[d])if(n['@type']==='ItemList'){const item=n.itemListElement.find(x=>x.url===url);assert(item);item.name=p.h1;}return '<script type="application/ld+json">'+json(d)+'</script>';});fs.writeFileSync(hub,library);
}
let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for(const l of locales){const url=origin+(l==='en'?'':'/'+l)+route;sitemap=sitemap.replace(new RegExp('(<loc>'+url+'</loc><lastmod>)[^<]+(</lastmod>)'),'$12026-10-30$2');}
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
console.log('Cold-email article: four complete locales, static examples/FAQs, localized private tools; existing routes/header/tracking preserved.');
