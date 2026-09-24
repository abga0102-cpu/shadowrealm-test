const fs=require('fs');const assert=require('assert');
const src=fs.readFileSync('game-2.js','utf8');
const start=src.indexOf('function handleCombatEnd(c)');
const end=src.indexOf('/* -------- periodic reward flush',start);
const block=src.slice(start,end);
assert(block.includes('{ skipRender: route !== "accueil" }'),'campaign completion must not rebuild non-Home screens');
assert(block.includes('if (route !== "accueil") renderHUD();'),'campaign completion must keep HUD current');
assert(src.includes('function flushRewards()')&&src.slice(src.indexOf('function flushRewards()')).includes('{ skipRender: route !== "accueil" }'),'periodic rewards must remain isolated');
console.log('V438 campaign background UI isolation contract OK');