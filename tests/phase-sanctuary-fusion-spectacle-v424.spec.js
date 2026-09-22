const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V424 Sanctuary post-merge spectacle is local and scales with rarity', async()=>{
  const root=path.join(__dirname,'..');
  const fx=fs.readFileSync(path.join(root,'sanctuary-merge-fx-v178.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(fx).toContain('Sanctuary Merge FX V424');
  expect(fx).toContain("var anchor=nx?anchorForSlot(t):null;");
  expect(fx).toContain("if(res&&nx)setTimeout(function(){fx(nx,anchor);},0);");
  expect(fx).toContain("var n=reduced()?0:Math.round(clamp(8+lv*1.18,8,34));");
  expect(fx).toContain("var rings=reduced()?0:(2+Math.floor(lv/6));");
  expect(fx).toContain("var stars=reduced()?0:(lv>=5?Math.round(clamp((lv-3)*.7,2,14)):0);");
  expect(fx).toContain("if(lv>=12)h+='<div class=\"beam\"></div>';");
  expect(fx).toContain("if(lv>=18)navigator.vibrate([28,22,34,20,52]);");
  expect(fx).toContain("@media(prefers-reduced-motion:reduce)");
  expect(fx).toContain("FUSION RÉUSSIE");

  // Presentation wrapper still delegates the actual merge to the existing authority.
  expect(fx).toContain("var base=sanctMergeDrop;");
  expect(fx).toContain("var res=base.apply(this,arguments);");

  expect(index).toContain('shadowreach-build" content="2026.09.22.424');
  expect(index).toContain('sanctuary-merge-fx-v178.js?v=2026.09.22.424a');
  expect(index).toContain("var V='2026.09.22.424'");
});
