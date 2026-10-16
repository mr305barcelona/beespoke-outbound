const assetUrl = require("./asset-version");
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {calculate} = require('../software-agency-calculator');
const copy = require('../data/software-comparison');
const base = Object.fromEntries(Object.entries(copy.fields).map(([key,[value]])=>[key,value]));
assert.deepEqual(calculate(base),{softwareTotal:8100,agencyTotal:14400,softwareUnit:810,agencyUnit:800,agencyMatch:18});
assert.equal(calculate({...base,agencyOpportunities:9}).agencyUnit,1600,'Sensitivity example must match the guide');
const zero = calculate({...base,softwareOpportunities:0,agencyOpportunities:0});
assert.equal(zero.softwareUnit,null);assert.equal(zero.agencyUnit,null);assert.equal(zero.agencyMatch,null);
assert.equal(calculate({...base,rate:0,softwareTools:0,softwareSetup:0}).agencyMatch,null,'Zero unit cost has no defined ratio threshold');
assert.equal(calculate({...base,agencyFee:0,agencyExtras:0,agencyHours:0,agencySetup:0}).agencyMatch,1,'A cost per opportunity still requires an opportunity');
const higherTime = calculate({...base,softwareHours:80});
assert.equal(higherTime.softwareTotal,14100);assert.equal(higherTime.agencyTotal,14400);
for(const locale of ['en','es','ca','fr']) {
  const file = path.join(__dirname,'..',locale==='en'?'':locale,copy.pagePath,'index.html');
  const html = fs.readFileSync(file,'utf8');
  assert.equal((html.match(/data-comparison-input=/g)||[]).length,10);
  assert.equal((html.match(/data-comparison-output=/g)||[]).length,5);
  assert(html.includes(assetUrl("/software-agency-calculator.js")));
  assert(html.includes('href="#software-agency-calculator"'));
  assert(html.includes(locale==='en'?copy.copy.heading:copy.dictionaries[locale][copy.copy.heading]));
  if(locale!=='en')for(const value of Object.values(copy.copy))assert(!html.includes(`>${value}<`),`${locale}: untranslated copy ${value}`);
}
console.log('Software comparison QA passed: totals, sensitivity, undefined ratios, zero-cost edge case and four fully localized calculators.');
