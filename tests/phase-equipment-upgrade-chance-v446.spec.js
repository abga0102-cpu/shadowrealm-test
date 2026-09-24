const fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('progression-overhaul-v283.js','utf8');
assert(s.includes('if(level<25)return 100'),'upgrade chance must stay guaranteed below +25');
assert(s.includes('95-5*Math.floor((level-25)/2)'),'existing chance curve must start at +25');
assert(s.includes('60+36*Math.max(0,Number(level)||0)'),'dust cost must remain unchanged');
console.log('V446 equipment upgrade threshold OK');
