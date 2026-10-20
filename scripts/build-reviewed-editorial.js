const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const rows = require('../data/editorial-reviewed-2026-10-19.json');
const normalize = value => String(value).replace(/\s+/gu, ' ').trim();
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (all, code) => {
  const known = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0'};
  if (code[0] !== '#') return known[code.toLowerCase()] ?? all;
  return String.fromCodePoint(parseInt(code.slice(code[1].toLowerCase()==='x'?2:1), code[1].toLowerCase()==='x'?16:10));
});
const escape = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
module.exports = function buildReviewedEditorial() {
  const report = {reviewedStrings:463, correctedStrings:rows.length, files:[], matchedIds:[]};
  const matched = new Set();
  for (const locale of ['es','ca','fr']) {
    const map = new Map(rows.filter(row=>row.locale===locale).map(row=>[normalize(row.before),row]));
    const replace = text => {
      const row=map.get(normalize(decode(text)));
      if (!row) return text;
      matched.add(row.id);
      return text.match(/^\s*/u)[0]+escape(row.after)+text.match(/\s*$/u)[0];
    };
    function jsonText(value, key) {
      if (Array.isArray(value)) return value.map(x=>jsonText(x,key));
      if (value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,jsonText(v,k)]));
      if (typeof value==='string' && ['name','text','description','headline','caption','articleBody'].includes(key)) {
        const row=map.get(normalize(value));
        if(row){matched.add(row.id);return row.after;}
      }
      return value;
    }
    function walk(folder) {
      for(const entry of fs.readdirSync(folder,{withFileTypes:true})) {
        const file=path.join(folder,entry.name);
        if(entry.isDirectory()) walk(file);
        else if(entry.name.endsWith('.html')) {
          const original=fs.readFileSync(file,'utf8');
          // Tokenize protected code and tags. Only reviewed text nodes, label
          // attributes and equivalent structured-data text fields can change.
          const result=original.replace(/<!--[^]*?-->|<script\b[^]*?<\/script\s*>|<style\b[^]*?<\/style\s*>|<[^>]+>|[^<]+/gi, token=>{
            if (/^<script\b/i.test(token)) {
              if(!/^<script\b[^>]*type="application\/ld\+json"/i.test(token)) return token;
              return token.replace(/(^<script\b[^>]*>)([^]*)(<\/script\s*>$)/i,(all,open,json,close)=>open+JSON.stringify(jsonText(JSON.parse(json),'')).replace(/</g,'\\u003c')+close);
            }
            if(/^<(?:style\b|!--)/i.test(token)) return token;
            if(token.startsWith('<')) return token.replace(/\b(content|aria-label|title|alt)="([^"]*)"/g,(all,name,value)=>`${name}="${replace(value)}"`);
            return replace(token);
          });
          if(result!==original){
            const revised=require('./reviewed-publication').revise(result,locale);
            fs.writeFileSync(file,revised);report.files.push(path.relative(root,file));
          }
        }
      }
    }
    walk(path.join(root,locale));
  }
  let sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  for(const file of report.files){const route='/'+file.replace(/index\.html$/,'');const loc='https://outbound-lead-generation.com'+route;const escaped=loc.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');sitemap=sitemap.replace(new RegExp('(<loc>'+escaped+'</loc><lastmod>)[^<]+(</lastmod>)'),(all,before,after)=>before+require('./reviewed-publication').dateFor(route,'2026-10-20')+after);}
  fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
  report.matchedIds=[...matched].sort((a,b)=>a-b);
  report.unmatchedIds=rows.filter(x=>!matched.has(x.id)).map(x=>x.id);
  // A local release report, kept outside the website tree.
  if(process.env.BEESPOKE_EDITORIAL_REPORT) fs.writeFileSync(process.env.BEESPOKE_EDITORIAL_REPORT,JSON.stringify(report,null,2)+'\n');
  console.log(`Reviewed editorial corrections: ${matched.size}/${rows.length} strings matched across ${report.files.length} changed localized files.`);
};
