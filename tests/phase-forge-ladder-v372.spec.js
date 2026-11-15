const { test, expect } = require('@playwright/test');
const fs=require('fs'), path=require('path');

test('V501 Forge ladder, upward-only power migration and Divine gate', async()=>{
 const root=path.join(__dirname,'..');
 const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
 const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
 const p=fs.readFileSync(path.join(root,'progression-overhaul-v283.js'),'utf8');

 expect(g1).toContain('const EQUIP_FORGE_RARITY_ORDER = ["COMMUN", "PEU_COMMUN", "RARE", "EPIQUE", "HEROIQUE", "MYTHIQUE", "ARTEFACT", "LEGENDAIRE", "IMMORTEL", "DIVIN"]');
 expect(g1).toContain('const FORGE_ASCEND_POWER_MUL = [1, 2, 2]');
 expect(g1).toContain('const FORGE_ASCEND_MAX_STARS = 2');

 expect(g2).toContain('PEU_COMMUN: 4, RARE: 12, EPIQUE: 15, HEROIQUE: 22, MYTHIQUE: 28');
 expect(g2).toContain('ARTEFACT: 35, LEGENDAIRE: 40, INFERNAL: 999, IMMORTEL: 45, DIVIN: 48');
 expect(g2).toContain('if (rarity === "INFERNAL") return false');
 expect(g2).toContain('if (stars >= 1 && rarity === "PEU_COMMUN") min = 1');
 expect(g2).toContain('if (stars >= 2 && rarity === "RARE") min = 1');
 expect(g2).toContain('if (rarity === "DIVIN") return (st.ascension || 0) >= 1');

 expect(p).toContain('COMMUN:550,PEU_COMMUN:1100,RARE:2200,EPIQUE:8800,HEROIQUE:17600,MYTHIQUE:35200,ARTEFACT:140800');
 expect(p).toContain("var EQUIP_ORDER=['COMMUN','PEU_COMMUN','RARE','EPIQUE','HEROIQUE','MYTHIQUE','ARTEFACT','LEGENDAIRE','IMMORTEL','DIVIN']");
 expect(p).toContain('var targetBD=Math.max(oldBD,x.d),targetBH=Math.max(oldBH,x.h)');
 expect(p).toContain('var nd=Math.max(oldD,Math.round(targetBD*df*100)/100),nh=Math.max(oldH,Math.round(targetBH*hf*100)/100)');
 expect(p).toContain('it.powerCurveVersion=targetVersion');
 expect(p).toContain('var targetVersion=501');
});
