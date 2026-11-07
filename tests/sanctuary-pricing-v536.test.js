/* Shadowreach V536: invariant checks for Sanctuary supplier prices.
   Run with: node tests/sanctuary-pricing-v536.test.js */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('sanctuary-pricing-v125.js','utf8');
const context = {
  window:{}, console,
  sanctSupplierPrice: () => 99999,
  // No S: avoid any mutation to a save when testing pure prices.
};
vm.createContext(context);
vm.runInContext(source, context);
function price(level, rarity){return context.sanctSupplierPrice(level,rarity);}
for(let level=13;level<=15;level++){
  const rare=price(level,'RARE');
  const epic=price(level,'EPIQUE');
  assert.ok(epic>=4*rare, 'Epic direct undercuts 4 Rare I at level '+level);
  assert.ok(epic<=1.2*4*rare,'Epic convenience premium too high at level '+level);
}
for(const [rarity,start,end] of [['COMMUN',1,4],['PEU_COMMUN',5,8],['RARE',9,12],['EPIQUE',13,15]]){
  let previous=Infinity;
  for(let level=start;level<=end;level++){
    const current=price(level,rarity);
    assert.ok(current>0&&current<=previous,rarity+' price must be positive and non-increasing');
    previous=current;
  }
}
assert.equal(price(15,'RARE'),1050);
assert.equal(price(15,'EPIQUE'),4400);
console.log('V536 Sanctuary pricing invariants passed.');
