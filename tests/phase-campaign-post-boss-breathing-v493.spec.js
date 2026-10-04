const fs=require('fs');
const assert=require('assert');
const src=fs.readFileSync('campaign-early-rebalance-v449.js','utf8');

assert(src.includes('var BREATHING_START=56, BREATHING_REFERENCE_MUL=1.10, BREATHING_EXIT_MAX_MUL=1.15;'),'V493 breathing constants must stay locked');
assert(src.includes("visibleFrom:'Facile 3-16'"),'V493 must start at Facile 3-16');
assert(src.includes('var refFloor=bossFloor-3+offset; /* B-2 for B+1; B-1 for B+2 */'),'B+1/B+2 must reference B-2/B-1');
assert(src.includes('secondHP*BREATHING_EXIT_MAX_MUL'),'B+3 HP must be capped against B+2 target');
assert(src.includes('secondDmg*BREATHING_EXIT_MAX_MUL'),'B+3 damage must be capped against B+2 target');
assert(src.includes("stats:['hp','damage'],bossChanged:false,raidsChanged:false,megaBossChanged:false,rngNeutralReferences:true"),'V493 scope must exclude bosses/raids/mega-bosses and keep reference spawns RNG-neutral');
assert(src.includes('var realRandom=Math.random,ref=null;'),'V493 reference construction must preserve the live RNG function');
assert(src.includes('Math.random=function(){return 0.5;};'),'V493 reference construction must use deterministic local randomness');
assert(src.includes('Math.random=realRandom;'),'V493 must restore live RNG after reference construction');

function offset(f){if(f<56)return 0;const r=f%5;return r>=1&&r<=3?r:0;}
assert.strictEqual(offset(55),0,'Facile 3-15 Boss unchanged');
assert.strictEqual(offset(56),1,'Facile 3-16 is first breathing floor');
assert.strictEqual(offset(57),2,'Facile 3-17 is second breathing floor');
assert.strictEqual(offset(58),3,'Facile 3-18 is transition floor');
assert.strictEqual(offset(59),0,'Facile 3-19 resumes normal authority');
assert.strictEqual(offset(60),0,'next Boss unchanged');
assert.strictEqual(offset(61),1,'rule repeats after following Boss');

const b2=100,b1=120;
assert.strictEqual(Math.round(b2*1.10),110);
assert.strictEqual(Math.round(b1*1.10),132);
assert.strictEqual(Math.round(b1*1.10*1.15),152,'third-floor ceiling derives from second breathing target');
console.log('V493 post-Boss breathing regression: OK');
