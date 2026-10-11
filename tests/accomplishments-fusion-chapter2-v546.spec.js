const fs=require('fs');
const assert=require('assert');

const canonical=fs.readFileSync('accomplishments-canonical-v139.js','utf8');
const claim=fs.readFileSync('accomplishments-claim-v140.js','utf8');
const index=fs.readFileSync('index.html','utf8');

const chapter2=[2500,5000,7500,10000,12500,15000,17500];
chapter2.forEach(n=>{
  assert(canonical.includes('fusion'+n),'canonical milestone fusion'+n);
  assert(claim.includes('fusion'+n),'claim milestone fusion'+n);
});

assert(!canonical.includes('fusion20000'),'Chapter 3 must stay offline');
assert(!claim.includes('fusion20000'),'Chapter 3 claim must stay offline');

assert(claim.includes("fusion5000:{minerai:15000,stabilitySeals:5}"));
assert(claim.includes("fusion7500:{minerai:15000,stabilitySeals:10}"));
assert(claim.includes("fusion10000:{minerai:15000,infusionCatalysts:1}"));
assert(claim.includes("fusion12500:{minerai:15000,infusionCatalysts:1}"));
assert(claim.includes("fusion15000:{minerai:15000,infusionCatalysts:1}"));
assert(claim.includes("fusion17500:{minerai:15000,infusionCatalysts:5}"));

assert(claim.includes("fusion2500:{gems:1}"));
assert(claim.includes("fusion5000:{gems:1}"));
assert(claim.includes("fusion7500:{gems:2}"));
assert(claim.includes("fusion10000:{gems:2}"));
assert(claim.includes("fusion12500:{gems:3}"));
assert(claim.includes("fusion15000:{gems:3}"));
assert(claim.includes("fusion17500:{gems:5}"));

assert(claim.includes('mergeFusions'));
assert(claim.includes('fusionHistoryBackfillV546'));
assert(canonical.includes('Catalyseur d’infusion'));
assert(canonical.includes('Sceaux de stabilité'));

assert(index.includes('shadowreach-build" content="2026.10.11.546"'));
assert(index.includes('accomplishments-canonical-v139.js?v=2026.10.11.546'));
assert(index.includes('accomplishments-claim-v140.js?v=2026.10.11.546'));

new Function(canonical);
new Function(claim);

console.log('V546 Fusion accomplishments Chapter 2 guard: OK');
