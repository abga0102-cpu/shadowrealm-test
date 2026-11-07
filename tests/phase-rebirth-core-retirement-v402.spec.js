const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V402 retires Rebirth formulas in core while preserving save compatibility', async()=>{
  const root=path.join(__dirname,'..');
  const g1=fs.readFileSync(path.join(root,'game-1.js'),'utf8');
  const g2=fs.readFileSync(path.join(root,'game-2.js'),'utf8');
  const g3=fs.readFileSync(path.join(root,'game-3.js'),'utf8');
  const g4=fs.readFileSync(path.join(root,'game-4.js'),'utf8');
  const g5=fs.readFileSync(path.join(root,'game-5.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(g1).toContain('const REBIRTH_UPGRADES = [];');
  expect(g1).toContain('function rb() { return 0; }');
  expect(g1).toContain('rebirth: { pr: 0, upgrades: {}, count: 0 }');
  expect(g1).not.toContain('rb(s, "life")');
  expect(g1).not.toContain('rb(s, "damage")');
  expect(g1).not.toContain('rb(s, "critdmg")');
  expect(g1).not.toContain('rb(s, "atkspeed")');
  expect(g1).not.toContain('rb(s, "dmgred")');
  expect(g1).not.toContain('rb(s, "lifesteal")');
  expect(g1).not.toContain('rb(s, "regen")');
  expect(g1).not.toContain('rb(s, "bossdmg")');
  expect(g1).not.toContain('rb(s, "exp")');
  expect(g1).not.toContain('rb(s, "apples")');

  expect(g2).not.toContain('rb(s, "floorSkip")');
  expect(g2).toContain('function canRebirth() { return false; }');
  expect(g2).toContain('function doRebirth() { return 0; }');
  expect(g2).toContain('function buyRebirth() { return false; }');

  expect(g3).not.toContain('"Rebirth"');
  expect(g4).not.toContain('rb(S, "apples")');
  expect(g4).not.toContain('label:"Rebirth"');
  expect(g4).not.toContain('worldRebirth');
  expect(g5).toContain('function scrRebirth() { return scrAscension(); }');
  expect(g5).not.toContain('PR insuffisants');
  expect(g5).not.toContain('Rebirth impossible');
  expect(g5).not.toContain('arenaRbValue');
  expect(g5).not.toContain('label:"Rebirth"');
  expect(g5).not.toContain('points de guerre issus du Rebirth');
  expect(index).toContain('rebirth-removal-v276.js');
  expect(index).toContain('rebirth-removal-authority-v281.js');
  expect(index).toContain("var V='2026.09.19.402'");
});
