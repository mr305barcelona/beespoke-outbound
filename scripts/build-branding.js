const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),tag='c3-20261021',assetUrl=require('./asset-version');
const mark='<img class="brand-mark" src="/assets/brand/beespoke-mark-c3.svg" alt="" width="38" height="38" aria-hidden="true" decoding="async">';
const head='<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg?v='+tag+'"><link rel="stylesheet" href="'+assetUrl('/brand.css')+'">';
const skip=new Set(['.git','node_modules','outputs','tmp','.agents','.codex']);
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(skip.has(e.name)?[]:files(path.join(dir,e.name))):e.name.endsWith('.html')&&!/\s\d+\.html$/.test(e.name)?[path.join(dir,e.name)]:[]);}
let changed=0,marks=0,icons=0;
for(const file of files(root)){let html=fs.readFileSync(file,'utf8');if(!html.includes('favicon.png'))continue;
 const before=html;
 html=html.replace(/(<a\b[^>]*\bclass="(?:brand|booking-brand)"[^>]*>)([^]*?)(<\/a>)/g,(all,a,inside,b)=>{
  if(inside.includes('/assets/brand/beespoke-mark-c3.svg')){marks++;return all;}
  const updated=inside.replace(/<div class="brand-mark"(?: aria-hidden="true")?>B<\/div>|<span>B<\/span>/,mark);
  if(updated!==inside)marks++;return a+updated+b;
 });
 if(!html.includes('href="/favicon.svg?v='+tag+'"'))html=html.replace('</head>',head+'</head>');
 html=html.replace(/href="\/brand\.css[^\"]*"/g,'href="'+assetUrl('/brand.css')+'"');
 if(html.includes('href="/favicon.svg?v='+tag+'"'))icons++;
 if(html!==before){fs.writeFileSync(file,html);changed++;}
}
console.log(JSON.stringify({brandingPagesChanged:changed,brandMarks:marks,svgFavicons:icons}));

