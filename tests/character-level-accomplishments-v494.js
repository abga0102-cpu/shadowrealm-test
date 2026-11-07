const fs=require('fs');
const assert=require('assert');
const src=fs.readFileSync('accomplishments-claim-v140.js','utf8');
const expected='[[10,250],[15,350],[20,500],[25,700],[30,1000],[35,1200],[40,1500],[50,2000],[60,2500],[70,3000],[80,3500],[90,4000],[100,5000]]';
assert(src.includes('var LEVEL_STEPS='+expected));
assert(src.includes('Number(S&&S.level)>=row[0]'));
assert(src.includes('Math.round(row[1]*0.25)'));
assert(src.includes("if(root.querySelector('#srHeroLevelAccomplishmentsV494'))return"));
console.log('V494 character-level accomplishments guard: OK');
