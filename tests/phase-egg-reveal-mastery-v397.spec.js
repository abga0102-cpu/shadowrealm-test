const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
test('V397 double eggs count for mastery and summon gets a reveal screen', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
  const g4=fs.readFileSync(path.join(root,'game-4.js'),'utf8');
  const g5=fs.readFileSync(path.join(root,'game-5.js'),'utf8');
  expect(g1).toContain('function addMasteryCredits');
  expect(g1).toContain('petDoubleMasteryCompV397');
  expect(g2).toContain('addMasteryCredits(s.petMastery, eggsToMake)');
  expect(g2).toContain('bonusCount');
  expect(g4).toContain('œufs obtenus');
  expect(g5).toContain('function showEggSummonResult');
  expect(g5).toContain('srEggRevealHeroV397');
  expect(g5).toContain('★ +');
  expect(g5).toContain('showEggSummonResult(r)');
});