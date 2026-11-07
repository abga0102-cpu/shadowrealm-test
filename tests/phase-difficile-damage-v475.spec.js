const { test, expect } = require('@playwright/test');

async function openCleanGame(page) {
  await page.route('**/npm/**', route => route.abort());
  await page.addInitScript(() => {
    try { localStorage.removeItem('shadowreach.save.local'); } catch (_) {}
  });
  await page.goto('/index.html?smoke=1');
  await page.waitForFunction(() =>
    typeof S !== 'undefined' &&
    typeof makeEnemy === 'function' &&
    typeof campaignMeta === 'function' &&
    window.__srEnemyDamageConfigV289 &&
    window.__srEnemyDamageConfigV289.difficile17DamageV475 &&
    window.__srCampaignDifficultyBridgeV473
  );
  await expect(page.locator('#srBootDiagnostic')).toHaveCount(0);
}

test('V475 starts at Difficile 1-7 and reaches the full -30% without a backwards damage step', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const cfg=window.__srEnemyDamageConfigV289;
    const v=cfg.difficile17DamageV475;
    const rows=[106,107,108,109,110,111,150,800].map(f => ({
      floor:f,
      label:campaignMeta(f).label,
      source:v.sourceDamage(f),
      final:v.finalDamage(f)
    }));
    return {start:v.startFloor,mul:v.targetDamageMul,rows};
  });

  expect(out.start).toBe(107);
  expect(out.mul).toBeCloseTo(0.70,8);
  expect(out.rows.find(r=>r.floor===107).label).toBe('Difficile · 1-7');

  const f106=out.rows.find(r=>r.floor===106);
  const f107=out.rows.find(r=>r.floor===107);
  const f110=out.rows.find(r=>r.floor===110);
  const f150=out.rows.find(r=>r.floor===150);
  const f800=out.rows.find(r=>r.floor===800);

  expect(f106.final).toBe(f106.source);
  expect(f107.final).toBeGreaterThanOrEqual(f106.final);
  expect(f107.final).toBeLessThan(f107.source);
  expect(f110.final / f110.source).toBeCloseTo(0.70,4);
  expect(f150.final / f150.source).toBeCloseTo(0.70,4);
  expect(f800.final / f800.source).toBeCloseTo(0.70,4);
});

test('V475 Campaign base damage never decreases from 1-7 through floor 800', async ({ page }) => {
  await openCleanGame(page);
  const rows = await page.evaluate(() => {
    const v=window.__srEnemyDamageConfigV289.difficile17DamageV475;
    const out=[];
    for(let f=106;f<=800;f++) out.push({f,source:v.sourceDamage(f),final:v.finalDamage(f)});
    return out;
  });

  for(let i=1;i<rows.length;i++) {
    expect(rows[i].final).toBeGreaterThanOrEqual(rows[i-1].final);
    expect(rows[i].final).toBeLessThanOrEqual(rows[i].source);
  }
});

test('V475 reduces normal, Elite and Boss Campaign damage while preserving hierarchy', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const floor=110;
    const type=ENEMY_TYPES[0];
    const mk=(kind,noFastback=false)=>makeEnemy('campaign',{
      type,
      name:'V475 test',
      tier:'COMMUN',
      floor,
      elite:kind==='elite',
      boss:kind==='boss',
      noFastback,
      x:200
    });
    const normal=mk('normal');
    const elite=mk('elite');
    const boss=mk('boss');
    const megaRef=mk('boss',true);
    return {
      normal:normal.dmg,
      elite:elite.dmg,
      boss:boss.dmg,
      megaRef:megaRef.dmg,
      source:window.__srEnemyDamageConfigV289.difficile17DamageV475.sourceDamage(floor),
      final:window.__srEnemyDamageConfigV289.difficile17DamageV475.finalDamage(floor)
    };
  });

  expect(out.final / out.source).toBeCloseTo(0.70,4);
  expect(out.elite).toBeGreaterThan(out.normal);
  expect(out.boss).toBeGreaterThan(out.elite);
  expect(out.megaRef).toBeGreaterThan(out.boss);
  expect(out.boss / out.megaRef).toBeCloseTo(0.70,2);
});

test('V475 leaves Mega-Boss x10 reference damage and Raid damage path outside the new nerf', async ({ page }) => {
  await openCleanGame(page);
  const out = await page.evaluate(() => {
    const floor=110;
    const def=bossFor(floor);
    const type=Object.assign({}, ENEMY_TYPES[1], {
      id:'mega_'+def.id,
      name:'Méga-'+def.name,
      img:def.img,
      ranged:!!def.ranged,
      proj:def.proj||'magic'
    });
    const reference=makeEnemy('campaign',{
      type,name:type.name,tier:def.tier,floor,boss:true,
      abils:def.abils,noFastback:true,x:AW-60
    });
    const mega=makeMegaBossEnemy(floor);
    const raidBefore=raidEnemyDamage('minerai',10);
    const raidAfter=raidEnemyDamage('minerai',10);
    return {
      reference:reference.dmg,
      mega:mega.dmg,
      raidBefore,
      raidAfter,
      megaPreserved:window.__srBossFinalConfigV288.preserveMegaDamageV475,
      raidsChanged:window.__srEnemyDamageConfigV289.difficile17DamageV475.raidsChanged,
      megaChanged:window.__srEnemyDamageConfigV289.difficile17DamageV475.megaBossChanged
    };
  });

  expect(out.mega).toBe(out.reference*10);
  expect(out.raidAfter).toBe(out.raidBefore);
  expect(out.megaPreserved).toBe(true);
  expect(out.raidsChanged).toBe(false);
  expect(out.megaChanged).toBe(false);
});

test('V475 publishes the new build and authority cache keys', async ({ page }) => {
  await openCleanGame(page);
  const html = await page.locator('html').evaluate(() => document.documentElement.outerHTML);
  expect(html).toContain('shadowreach-build');
  expect(await page.locator('meta[name="shadowreach-build"]').getAttribute('content')).toBe('2026.09.29.475');
  const scripts = await page.locator('script[src]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src')));
  expect(scripts.some(s => s && s.includes('enemy-damage-authority-v289.js?v=2026.09.29.475a'))).toBe(true);
  expect(scripts.some(s => s && s.includes('boss-final-authority-v288.js?v=2026.09.29.475b'))).toBe(true);
});
