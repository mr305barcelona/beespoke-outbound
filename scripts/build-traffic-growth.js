// Run after localization so English-only experiments do not leak into translations.
const fs=require('node:fs'),path=require('node:path');
const growth=require('../data/traffic-growth-20261015');
for(const route of [...Object.keys(growth.english),...Object.keys(growth.spanish)]){
 const file=path.join(__dirname,'..',route,'index.html'),locale=route.startsWith('/es/')?'es':'en';
 const pathname=locale==='es'?route.slice(3):route;
 fs.writeFileSync(file,growth.apply(fs.readFileSync(file,'utf8'),pathname,locale));
}
console.log('Built three focused traffic-growth updates after localization.');
