const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path'),vm=require('vm');

test('V425 lowers Campaign damage from Difficile 3-10 without a backward base-damage step', async()=>{
  const root=path.join(__dirname,'..');
  const src=fs.readFileSync(path.join(root,'enemy-damage-authority-v289.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  const context={window:{__srCampaignMaxFloor:800},Math,Number,Object,Array,isFinite};
  vm.createContext(context);
  vm.runInContext(src,context);

  const cfg=context.window.__srEnemyDamageConfigV289;
  const dmg=context.window.__srV289EnemyDamage;
  expect(cfg.version).toBe(425);
  expect(cfg.difficile310DamageV425.visibleStage).toBe('Difficile 3-10');
  expect(cfg.difficile310DamageV425.startFloor).toBe(150);
  expect(cfg.difficile310DamageV425.targetDamageMul).toBe(0.50);
  expect(cfg.difficile310DamageV425.raidsChanged).toBe(false);
  expect(cfg.difficile310DamageV425.hpChanged).toBe(false);

  const before=dmg(149);
  const cut=dmg(150);
  expect(cut).toBeGreaterThan(before);

  // Base Campaign damage never goes backward after the cutover.
  let prev=cut;
  for(let floor=151;floor<=800;floor++){
    const cur=dmg(floor);
    expect(cur).toBeGreaterThanOrEqual(prev);
    prev=cur;
  }

  // Once the transition has settled, the requested reduction is the full -50%.
  const source170=cfg.difficile310DamageV425.sourceDamage(170);
  expect(dmg(170)).toBe(Math.round(source170*0.50));

  // Earlier Campaign and Raid balance ownership remains untouched.
  expect(dmg(149)).toBe(cfg.difficile310DamageV425.sourceDamage(149));
  expect(src).toContain('RAID_DAMAGE_MUL=RAID_BASE_DAMAGE_MUL_V324*GLOBAL_DAMAGE_MUL_V381');

  expect(index).toContain('shadowreach-build" content="2026.09.22.425');
  expect(index).toContain('enemy-damage-authority-v289.js?v=2026.09.22.425a');
  expect(index).toContain("var V='2026.09.22.425'");
});
