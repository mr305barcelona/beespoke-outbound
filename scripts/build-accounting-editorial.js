const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),rows=require('../data/editorial-accounting-20261020.json');
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const decode=s=>s.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(a,k)=>k[0]==='#'?String.fromCodePoint(parseInt(k.slice(k[1].toLowerCase()==='x'?2:1),k[1].toLowerCase()==='x'?16:10)):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0'})[k.toLowerCase()]);
module.exports=function(){
 for(const file of [...new Set(rows.map(r=>r.path))]){
  const selected=rows.filter(r=>r.path===file),replace=s=>selected.reduce((v,r)=>v.replaceAll(r.before,r.after),s);
  const json=(v,key)=>Array.isArray(v)?v.map(x=>json(x,key)):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,json(x,k)])):typeof v==='string'&&['name','text','description','headline'].includes(key)?replace(v):v;
  let html=fs.readFileSync(path.join(root,file),'utf8');
  html=html.replace(/<!--[^]*?-->|<script\b[^]*?<\/script\s*>|<style\b[^]*?<\/style\s*>|<[^>]+>|[^<]+/gi,token=>{
   if(/^<script\b/i.test(token))return /^<script\b[^>]*type="application\/ld\+json"/i.test(token)?token.replace(/(^<script\b[^>]*>)([^]*)(<\/script\s*>$)/i,(all,a,t,b)=>a+JSON.stringify(json(JSON.parse(t),'')).replace(/</g,'\\u003c')+b):token;
   if(/^<(?:style\b|!--)/i.test(token))return token;
   if(token.startsWith('<'))return token.replace(/\b(content|aria-label|title|alt)="([^"]*)"/g,(all,k,v)=>{const d=decode(v),a=replace(d);return a===d?all:k+'="'+esc(a)+'"';});
   const d=decode(token),a=replace(d);return a===d?token:esc(a);
  });
  const normalized=decode(html).replace(/<[^>]+>/g,' ');
  for(const row of selected)if(normalized.includes(row.before)||!normalized.includes(row.after))throw Error('Editorial correction missing: '+file+' / '+row.before.slice(0,50));
  html=require('./reviewed-publication').revise(html,file.split('/')[0]);
  fs.writeFileSync(path.join(root,file),html);
 }
 console.log('Accounting editorial: '+rows.length+' reviewed corrections across three localized guides.');
};
