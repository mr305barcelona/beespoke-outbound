const assert=require('node:assert/strict');
const {calculate}=require('../appointment-pricing-review');
// Independently calculated procurement examples and boundary cases.
assert.deepEqual(calculate([8190,24,16,12,4]).costs,[341.25,511.875,682.5,2047.5]);
assert.deepEqual(calculate([7290,24,18,9,3]).costs,[303.75,405,810,2430]);
assert.deepEqual(calculate([8190,24,8,6,2]).costs,[341.25,1023.75,1365,4095]);
assert.deepEqual(calculate([500,0,0,0,0]).costs,[null,null,null,null]);
assert.deepEqual(calculate([0,5,4,3,1]).costs,[0,0,0,0]);
for(const row of [[500,10,11,5,2],[500,10,8,9,2],[500,10,8,5,6],[500,1.5,1,1,1],[-1,1,1,1,1],['',1,1,1,1],[Infinity,1,1,1,1],[NaN,1,1,1,1],[500,100001,1,1,1],[100000001,1,1,1,1]])assert.equal(calculate(row),null);
console.log('Appointment quote arithmetic passed: two distinct invoice comparisons, downside, zero outcomes and invalid cohorts.');
