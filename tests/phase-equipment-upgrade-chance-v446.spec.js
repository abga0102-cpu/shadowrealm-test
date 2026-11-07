const fs=require('fs'),assert=require('assert');
const progression=fs.readFileSync('progression-overhaul-v283.js','utf8');
const finalChance=fs.readFileSync('dust-chance-floor-v301.js','utf8');

assert(progression.includes('if(level<25)return 100'),'V446 risk threshold must remain +25 in progression authority');
assert(progression.includes('95-5*Math.floor((level-25)/2)'),'V446 chance curve must still start at +25');
assert(finalChance.includes('if(level<25)return 100'),'final runtime chance authority must not revert +25 back to +70');
assert(finalChance.includes('Math.max(5,95-5*Math.floor((level-25)/2))'),'historical 5% chance floor must remain active');
console.log('V446 equipment upgrade threshold remains active through final authority');
