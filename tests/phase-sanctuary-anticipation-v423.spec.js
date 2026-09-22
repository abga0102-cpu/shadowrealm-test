const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V423 marks mergeable Sanctuary duplicates before drag and excludes max rarity', async({page})=>{
  const root=path.join(__dirname,'..');
  const touch=fs.readFileSync(path.join(root,'sanctuary-touch-polish-v181.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(touch).toContain('function refreshReadyPairs()');
  expect(touch).toContain("el.classList.add('srSanctReady181')");
  expect(touch).toContain('@keyframes srSanctReadyOrb181');
  expect(touch).toContain('prefers-reduced-motion:reduce');
  expect(touch).toContain("document.documentElement.classList.add('srSanctDragActive181')");
  expect(index).toContain('sanctuary-touch-polish-v181.js?v=2026.09.22.423');

  await page.goto('/?smoke=1');
  await page.waitForFunction(()=>window.__srSanctTouchV181===true && typeof render==='function' && typeof sanctMergeState==='function');
  const state=await page.evaluate(async()=>{
    S.sanctuary=S.sanctuary||{};
    S.sanctuary.mergeBoard=Array(16).fill(null);
    S.sanctuary.mergeBoard[0]='COMMUN';
    S.sanctuary.mergeBoard[1]='COMMUN';
    S.sanctuary.mergeBoard[2]='DIVIN';
    S.sanctuary.mergeBoard[3]='DIVIN';
    route='sanctuaire';
    render();
    await Promise.resolve();
    await Promise.resolve();
    const ready=[...document.querySelectorAll('.sanctMergePiece.srSanctReady181')];
    return ready.map(el=>({slot:Number(el.dataset.sanctSlot),rarity:el.dataset.sanctRarity}));
  });

  expect(state).toHaveLength(2);
  expect(state.map(x=>x.rarity)).toEqual(['COMMUN','COMMUN']);
  expect(state.map(x=>x.slot)).toEqual([0,1]);
});
