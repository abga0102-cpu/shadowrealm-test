const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');

test('V423 Sanctuary shows merge-ready anticipation before drag without gameplay changes', async()=>{
  const root=path.join(__dirname,'..');
  const g4=fs.readFileSync(path.join(root,'game-4.js'),'utf8');
  const touch=fs.readFileSync(path.join(root,'sanctuary-touch-polish-v181.js'),'utf8');
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');

  expect(g4).toContain('ready=sanctMergeCount(st,r)>=2 && !!sanctMergeNext(r)');
  expect(g4).toContain("ready?' srMergeReady181':''");
  expect(g4).toContain('--srReady:'+"c");
  expect(touch).toContain('.sanctMergePiece.srMergeReady181>div:first-child');
  expect(touch).toContain('@keyframes srSanctReady181');
  expect(touch).toContain('injectCss();');
  expect(touch).toContain('@media(prefers-reduced-motion:reduce)');
  expect(touch).toContain('.sanctMergePiece.srMergeReady181>div:first-child,.sanctMergeCell.srCompat181{animation:none}');

  // Existing authorities stay intact.
  expect(touch).toContain("if(typeof sanctMergeDrop!=='function'||typeof sanctMergeState!=='function')return;");
  expect(touch).not.toContain('var base=sanctMergeDrop');

  expect(index).toContain('shadowreach-build" content="2026.09.22.423');
  expect(index).toContain('game-4.js?v=2026.09.22.423a');
  expect(index).toContain('sanctuary-touch-polish-v181.js?v=2026.09.22.423a');
});
