const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const rows=[...require('../data/beespoke-scope-consistency-20261019.json'),...require('../data/beespoke-current-offer-alignment.json')];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const decode=s=>s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g,(all,k)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'",apos:"'",nbsp:' '})[k]);
const norm=s=>s.replace(/\s+/gu,' ').trim();
module.exports=function buildCommercialConsistency(){
 for(const file of [...new Set(rows.map(x=>x.path))]){
  const selected=rows.filter(x=>x.path===file),map=new Map(selected.map(x=>[norm(x.before),x.after]));
  const replace=text=>{const after=map.get(norm(decode(text)));return after?esc(after):text;};
  const jsonReplace=(value,key)=>{
   if(Array.isArray(value))return value.map(x=>jsonReplace(x,key));
   if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,jsonReplace(v,k)]));
   if(typeof value==='string'&&['text','name','description','headline'].includes(key))return map.get(norm(value))||value;
   return value;
  };
  const original=fs.readFileSync(path.join(root,file),'utf8');
  let html=original.replace(/<!--[^]*?-->|<script\b[^]*?<\/script\s*>|<style\b[^]*?<\/style\s*>|<[^>]+>|[^<]+/gi,token=>{
   if(/^<script\b/i.test(token)){
    if(!/^<script\b[^>]*type="application\/ld\+json"/i.test(token))return token;
    return token.replace(/(^<script\b[^>]*>)([^]*)(<\/script\s*>$)/i,(all,a,text,b)=>a+JSON.stringify(jsonReplace(JSON.parse(text),'')).replace(/</g,'\\u003c')+b);
   }
   if(token.startsWith('<'))return token;
   return replace(token);
  });
  for(const row of selected){if(!html.includes(esc(row.after)))throw Error('Missing approved scope correction: '+file);}
  const locale=/^(es|ca|fr)\//.exec(file)?.[1]||'en';html=require('./reviewed-publication').revise(html,locale);fs.writeFileSync(path.join(root,file),html);
 }
 console.log('Commercial consistency: current first-party service descriptions and matching FAQ answers aligned to owner-approved scope.');
};
