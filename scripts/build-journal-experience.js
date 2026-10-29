const fs=require('node:fs'),path=require('node:path'),assetUrl=require('./asset-version');
const root=path.resolve(__dirname,'..'),origin='https://outbound-lead-generation.com',ui=JSON.parse(fs.readFileSync(path.join(root,'data/journal-interface.json'),'utf8'));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=s=>String(s).replace(/&(?:amp|quot|#39|apos|lt|gt|nbsp);|&#(?:x[0-9a-f]+|\d+);/gi,c=>{const simple={'&amp;':'&','&quot;':'"','&#39;':"'",'&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '};if(simple[c])return simple[c];const n=c.slice(2,-1);return String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):parseInt(n,10));});
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const fileFor=route=>route==='/'?'index.html':route.replace(/^\//,'')+'index.html';
const routes=[...read('sitemap.xml').matchAll(/<loc>https:\/\/outbound-lead-generation\.com([^<]+)<\/loc>/g)].map(m=>m[1]);
const localeFor=route=>route.match(/^\/(es|ca|fr)(?:\/|$)/)?.[1]||'en';
const jsonSafe=x=>JSON.stringify(x).replace(/</g,'\\u003c');
const mark='<img class="brand-mark" src="/assets/brand/beespoke-mark-c3.svg" alt="" width="38" height="38" aria-hidden="true" decoding="async">';
function bodyClass(h,name){return h.replace(/<body\b([^>]*)>/,(m,a)=>{const c=a.match(/\bclass="([^"]*)"/);if(c){const names=new Set(c[1].split(/\s+/).filter(Boolean));names.add(name);return '<body'+a.replace(c[0],'class="'+[...names].join(' ')+'"')+'>';}return '<body'+a+' class="'+name+'">';});}
function newHeader(h,route,locale){
 const c=ui[locale],home=locale==='en'?'/':'/'+locale+'/';
 const match=h.match(/<header\b[^>]*class="site-header(?:\s[^"]*)?"[^>]*>[\s\S]*?<\/header>/)||h.match(/<nav class="nav"[\s\S]*?<\/nav>/);
 if(!match)throw Error('No public header '+route);
 const lang=[...match[0].matchAll(/<a\b[^>]*\blang="(?:en|es|ca|fr)"[^>]*>[\s\S]*?<\/a>/g)].map(m=>m[0]);if(lang.length!==4)throw Error('Expected four locale destinations '+route);
 const active=route===home+'resources/'||/\/(?:guides|compare|industries|resources)\//.test(route)?'resources':route===home+'pricing/'?'pricing':route.includes('/case-studies/')?'cases':'';
 const links=[['how',home+'#how-it-works'],['cases',home+'#case-studies'],['pricing',home+'pricing/'],['resources',home+'resources/']].map(([key,url])=>'<a href="'+url+'"'+(key===active?' aria-current="'+(route===url?'page':'true')+'"':'')+'>'+esc(c[key])+'</a>').join('');
 const progress=match[0].includes('class="reading-progress"')?'<div class="reading-progress" aria-hidden="true"><span></span></div>':'';
 const header='<header class="site-header journal-site-header"><nav class="journal-nav" aria-label="'+esc(c.nav)+'"><a class="brand" href="'+home+'" aria-label="Beespoke Outbound, '+esc(c.home)+'">'+mark+'<span class="journal-brand-name">Beespoke Outbound</span></a><div class="journal-menu-links" id="site-menu">'+links+'</div><a class="nav-cta journal-book" href="https://calendly.com/noahlevybuilds/30min">'+esc(c.book)+'</a><details class="language-switcher journal-language"><summary aria-controls="language-options" aria-label="'+locale.toUpperCase()+' — '+esc(c.language)+'">'+locale.toUpperCase()+'</summary><div id="language-options">'+lang.join('')+'</div></details><button class="journal-menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu">'+esc(c.menu)+'</button></nav>'+progress+'</header>';
 return h.replace(match[0],header);
}
function library(h,locale){
 if(h.includes('data-journal-library'))return h;
 const c=ui[locale],pre=locale==='en'?'':'/'+locale;
 const ld=h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);if(!ld)throw Error('Missing hub schema');const graph=JSON.parse(ld[1]);const list=graph['@graph'].find(x=>x['@type']==='ItemList');
 const groups=[...h.matchAll(/<section id="([^"]+)" class="resource-section"><h2>([\s\S]*?)<\/h2><ul class="resource-cards">([\s\S]*?)<\/ul><\/section>/g)].map(m=>({id:m[1],title:decode(m[2]),urls:[...m[3].matchAll(/<a href="([^"]+)">/g)].map(a=>a[1])}));if(groups.length!==7)throw Error('Expected existing resource groups');
 const grouped=new Map(groups.flatMap(g=>g.urls.map(url=>[url,g])));
 const promoted=['/guides/b2b-cold-email-copywriting/','/guides/cold-email-follow-up/','/guides/linkedin-prospecting-messages/','/industries/logistics-lead-generation/'].map(r=>origin+pre+r);
 const items=[...promoted.map(url=>list.itemListElement.find(x=>x.url===url)).filter(Boolean),...list.itemListElement.filter(x=>!promoted.includes(x.url))];if(items.length!==list.itemListElement.length||new Set(items.map(x=>x.url)).size!==items.length)throw Error('Resource inventory changed');
 const rows=items.map((item,i)=>{
  const url=item.url.slice(origin.length),g=grouped.get(url);if(!g)throw Error('Missing original category '+url);const topics=[];
  if(url.includes('cold-email'))topics.push('email');if(url.includes('linkedin'))topics.push('linkedin');if(url.includes('/industries/'))topics.push('industries');if(['planning','execution','roles','methodology'].includes(g.id))topics.push('planning');
  const target=read(fileFor(url)),meta=target.match(/<meta name="description" content="([^"]*)"/);let description=meta?decode(meta[1]):'';if(/[$€£]|\b(?:USD|EUR)\b/.test(description))description='';
  const action=url.includes('/services/')?c.service:url.includes('/downloads/')?c.worksheet:url.includes('/case-studies/')?c.case:url.includes('/resources/')?c.example:url.includes('/editorial-policy/')?c.policy:c.read;
  return '<li class="journal-resource-row" data-resource-group="'+g.id+'" data-resource-topics="'+topics.join(' ')+'"><p class="journal-resource-type">'+esc(g.title)+'</p><a class="journal-resource-link" href="'+esc(url)+'" aria-labelledby="resource-title-'+i+'"><div><h2 id="resource-title-'+i+'">'+esc(item.name)+'</h2>'+(description?'<p>'+esc(description)+'</p>':'')+'</div><span class="journal-resource-action" aria-hidden="true">'+esc(action)+' →</span></a></li>';
 }).join('');
 const hero=h.match(/<main id="main-content" class="resource-hub">(<header class="hero">[\s\S]*?<\/header>)/)?.[1];if(!hero)throw Error('Missing original hub heading');
 const filters=[['all',c.all],['email',c.email],['linkedin',c.linkedin],['industries',c.industries],['planning',c.planning]].map(([key,label])=>'<button type="button" data-resource-filter="'+key+'" aria-pressed="'+(key==='all')+'">'+esc(label)+'</button>').join('');
 const anchors=groups.map(g=>'<span class="journal-resource-anchor" id="'+g.id+'" aria-hidden="true"></span>').join('');
 const config={count:c.count,fragments:{planning:'planning',channels:'all',roles:'planning',execution:'planning',industries:'industries',cases:'all',methodology:'planning'}};
 const main='<main id="main-content" class="resource-hub" data-journal-library>'+hero+anchors+'<div class="journal-resource-controls" data-resource-controls hidden><label class="journal-resource-search-label" for="resource-search">'+esc(c.search)+'<input id="resource-search" data-resource-search type="search" placeholder="'+esc(c.placeholder)+'" autocomplete="off"></label><div class="journal-resource-filters" aria-label="'+esc(c.resources)+'">'+filters+'</div><p class="journal-resource-status" data-resource-status role="status" aria-live="polite"></p></div><p class="journal-resource-empty" data-resource-empty hidden>'+esc(c.none)+'</p><ul class="journal-resource-list" id="resource-list">'+rows+'</ul><script type="application/json" data-resource-config>'+jsonSafe(config)+'</script></main>';
 h=h.replace(/<main id="main-content" class="resource-hub">[\s\S]*?<\/main>/,main);
 list.itemListElement=items.map((x,i)=>({...x,position:i+1}));return h.replace(ld[0],'<script type="application/ld+json">'+jsonSafe(graph)+'</script>');
}
let changed=0,home=0,libraries=0,editorial=0;
for(const route of routes){const f=path.join(root,fileFor(route)),before=fs.readFileSync(f,'utf8'),locale=localeFor(route),c=ui[locale],pre=locale==='en'?'':'/'+locale;let h=before;const isHome=route===pre+'/',isLibrary=route===pre+'/resources/';h=newHeader(h,route,locale);h=bodyClass(h,isHome?'journal-home':isLibrary?'journal-library':'journal-article');
 if(isLibrary){h=library(h,locale);libraries++;}else if(!isHome){h=h.replace(/<div class="toc-label">[\s\S]*?<\/div>/g,'<div class="toc-label"><strong>'+esc(c.contents)+'</strong></div>');h=h.replace(/(<details class="mobile-toc"><summary>)[\s\S]*?(<\/summary>)/g,'$1<span>'+esc(c.onPage)+'</span><span class="toc-action" aria-hidden="true">⌄</span>$2');editorial++;}else home++;
 h=h.replace(/<link rel="stylesheet" href="\/journal-experience\.css[^\"]*">/g,'').replace(/<script src="\/journal-experience\.js[^\"]*" defer><\/script>/g,'');h=h.replace('</head>','<link rel="stylesheet" href="'+assetUrl('/journal-experience.css')+'"><script src="'+assetUrl('/journal-experience.js')+'" defer></script></head>');if(h!==before){fs.writeFileSync(f,h);changed++;}
}
console.log(JSON.stringify({journalExperienceChanged:changed,homeHeaders:home,resourceLibraries:libraries,editorialPages:editorial}));
