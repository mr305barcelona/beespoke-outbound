const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
// Localize existing homepage metadata without changing visible copy or dates.
const descriptions={
es:'Beespoke ayuda a empresas B2B a generar oportunidades comerciales y concertar reuniones con sus clientes ideales mediante prospección por email y LinkedIn.',
ca:'Beespoke ajuda empreses B2B a generar oportunitats comercials i concertar reunions amb els seus clients ideals mitjançant prospecció per correu electrònic i LinkedIn.',
fr:'Beespoke aide les entreprises B2B à prospecter par email et LinkedIn et à obtenir des rendez-vous avec leurs clients cibles.'
};
const original={description:'Beespoke Outbound Lead Generation helps B2B companies build sales pipeline by booking qualified meetings with ideal customers through targeted outbound campaigns.','og:description':'Outbound lead generation that books real meetings with your ideal clients.','twitter:description':'B2B outbound lead generation and meeting booking for companies that need more qualified sales pipeline.'};
for(const [lang,value]of Object.entries(descriptions)){
const file=path.join(root,lang,'index.html');let html=fs.readFileSync(file,'utf8');const body=html.slice(html.indexOf('<body'));
for(const name of Object.keys(original)){const key=name==='og:description'?'property':'name',re=new RegExp('<meta '+key+'="'+name+'" content="([^"]*)"[^>]*>','g');const matches=[...html.matchAll(re)];assert.equal(matches.length,1,'One metadata field required: '+lang+' '+name);assert([original[name],value].includes(matches[0][1]),'Unexpected homepage metadata: '+lang+' '+name);html=html.replace(re,tag=>tag.replace('content="'+matches[0][1]+'"','content="'+value+'"'));}
assert.equal(html.slice(html.indexOf('<body')),body,'Visible homepage changed');fs.writeFileSync(file,html);
}
