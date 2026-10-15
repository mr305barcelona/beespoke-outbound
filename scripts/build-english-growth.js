const fs=require('node:fs'),path=require('node:path'),growth=require('../data/english-growth-20261015');
for(const route of Object.keys(growth.config)){const f=path.join(__dirname,'..',route,'index.html');fs.writeFileSync(f,growth.apply(fs.readFileSync(f,'utf8'),route));}
console.log('Built two English LinkedIn/SDR growth pages after localization.');
