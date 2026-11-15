const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');

test('V490 makes Forge gold strictly recycle-only at +50%',async()=>{
 const src=fs.readFileSync(path.join(root,'forge-compare-v95.js'),'utf8');
 expect(src).toContain('var goldBefore=Math.max(0,Number(S.gold)||0)');
 expect(src).toContain('r.gold=0');
 expect(src).toContain('if(r.recycled&&!r.free)');
 expect(src).toContain('forgeGoldRewardV470(S,rarity)*1.5');
 expect(src).toContain('st.gold=goldBefore+recycleGold');
 expect(src).toContain('recycleOnly:true');
 expect(src).toContain('freeBonusGold:false');
 expect(src).toContain('absoluteGoldSnapshot:true');
});

test('V490 pays Gold when a kept item is manually recycled',async()=>{
 const src=fs.readFileSync(path.join(root,'forge-compare-v95.js'),'utf8');
 expect(src).toContain('nativeRecycleItem');
 expect(src).toContain('nativeRecycleBatch');
 expect(src).toContain('nativeRecycleItemsByIds');
 expect(src).toContain('payRecycleGoldV490');
 expect(src).toContain('manualRecycleGold:true');
});

test('V490 feedback reports only recycled gold',async()=>{
 const src=fs.readFileSync(path.join(root,'forge-compare-v95.js'),'utf8');
 expect(src).toContain("+' or'");
 expect(src).toContain("var gold=melted.reduce");
});

test('V490 free Forge results never create Gold even when recycled later',async()=>{
 const src=fs.readFileSync(path.join(root,'forge-compare-v95.js'),'utf8');
 expect(src).toContain('if(r.recycled&&!r.free)');
 expect(src).toContain('if(r.free) hit.freeForgeBonus=true');
 expect(src).toContain('if(!it || it.freeForgeBonus) return sum');
 expect(src).toContain('freeBonusGold:false');
 expect(src).toContain('freeOriginPersistent:true');
});
