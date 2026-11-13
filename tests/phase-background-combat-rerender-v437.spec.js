const fs=require('fs');const assert=require('assert');
const src=fs.readFileSync('game-2.js','utf8');
assert(src.includes('if (!(opts && opts.skipRender)) scheduleRender();'),'update must support non-destructive state updates');
assert(src.includes('{ skipRender: route !== "accueil" }'),'background campaign reward flush must not rebuild non-Home screens');
assert(src.includes('if (route !== "accueil") renderHUD();'),'HUD must still refresh after background rewards');
console.log('V437 background combat rerender contract OK');