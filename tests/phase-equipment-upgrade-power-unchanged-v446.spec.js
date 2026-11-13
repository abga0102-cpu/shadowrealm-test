const fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('progression-overhaul-v283.js','utf8');
assert(!s.includes('upgradePowerV446'),'V446 must not introduce a new equipment power multiplier');
assert(s.includes('V446 moves the'),'V446 authority marker missing');
console.log('V446 leaves equipment upgrade power untouched');
