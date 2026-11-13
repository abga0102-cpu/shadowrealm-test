const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');

test('V488 publishes a dedicated enemy name/name ability/HP layout', async()=>{
  const css=fs.readFileSync(path.join(root,'combat-nameplate-fix-v488.css'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  expect(index).toContain('shadowreach-build" content="2026.09.30.488"');
  expect(index).toContain('combat-nameplate-fix-v488.css?v=2026.09.30.488');
  expect(css).toContain('.unit .hpMini.foe');
  expect(css).toContain('top:-10px !important');
  expect(css).toContain('.unit .foeTag');
  expect(css).toContain('top:-31px !important');
  expect(css).toContain('.unit .foeAbil');
  expect(css).toContain('top:-49px !important');
});

test('V488 keeps long Boss/Elite names out of the HP lane', async({page})=>{
  await page.setContent(`<!doctype html><style>
    .unit{position:relative;width:72px;height:72px}
    .hpMini,.foeTag,.foeAbil{position:absolute;left:0;right:0;height:12px}
    ${fs.readFileSync(path.join(root,'combat-nameplate-fix-v488.css'),'utf8')}
  </style><div class="unit"><div class="foeAbil">ENRAGÉ</div><div class="foeTag">Seigneur ancestral extrêmement long</div><div class="hpMini foe">100%</div></div>`);
  const boxes=await page.evaluate(()=>{
    const b=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom};};
    return {ability:b('.foeAbil'),name:b('.foeTag'),hp:b('.hpMini.foe')};
  });
  expect(boxes.name.bottom).toBeLessThanOrEqual(boxes.hp.top);
  expect(boxes.ability.bottom).toBeLessThanOrEqual(boxes.name.top);
});
