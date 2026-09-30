const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');

test('V489 makes Forge gold recycle-only at +50%',async()=>{
 const src=fs.readFileSync(path.join(root,'forge-compare-v95.js'),'utf8');
 expect(src).toContain('oldDropGold+=Math.max(0,Number(r.gold)||0)');
 expect(src).toContain('r.gold=0');
 expect(src).toContain('if(r.recycled)');
 expect(src).toContain('forgeGoldRewardV470(S,rarity)*1.5');
 expect(src).toContain('st.gold=Math.max(0,(Number(st.gold)||0)-oldDropGold+recycleGold)');
 expect(src).toContain('recycleOnly:true');
});

test('V489 feedback reports recycled gold',async()=>{
 const src=fs.readFileSync(path.join(root,'forge-compare-v95.js'),'utf8');
 expect(src).toContain("+' or'");
 expect(src).toContain("var gold=melted.reduce");
});
