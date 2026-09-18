const { test, expect } = require('@playwright/test');
const fs=require('fs'), path=require('path');
test('V372 Forge ladder, power migration and Divine gate', async()=>{
 const root=path.join(__dirname,'..');
 const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
 const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
 const p=fs.readFileSync(path.join(root,'progression-overhaul-v283.js'),'utf8');
 expect(g1).toContain('["COMMUN", "PEU_COMMUN", "RARE", "EPIQUE", "HEROIQUE", "MYTHIQUE", "ARTEFACT", "LEGENDAIRE", "INFERNAL", "IMMORTEL", "DIVIN"]');
 expect(g2).toContain('PEU_COMMUN: 4, RARE: 12, EPIQUE: 18, HEROIQUE: 24, MYTHIQUE: 30');
 expect(g2).toContain('ARTEFACT: 40');
 expect(g2).toContain('rarity === "LEGENDAIRE") return stars >= 1');
 expect(g2).toContain('rarity === "INFERNAL") return stars >= 2');
 expect(g2).toContain('rarity === "IMMORTEL") return stars >= 3');
 expect(g2).toContain('rarity === "DIVIN") return (st.ascension || 0) >= 1');
 expect(p).toContain('COMMUN:500,PEU_COMMUN:1000,RARE:2000,EPIQUE:8000,HEROIQUE:16000,MYTHIQUE:32000,ARTEFACT:128000');
 expect(p).toContain('it.baseDamage=x.d;it.baseHp=x.h');
 expect(p).toContain('it.powerCurveVersion=targetVersion');
});
