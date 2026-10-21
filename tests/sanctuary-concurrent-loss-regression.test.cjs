'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../sanctuary-endgame-v130.js'),'utf8');
const start=src.indexOf('function mergeTraceTick(){');
const end=src.indexOf('\nsetInterval(mergeTraceTick,100);',start);
assert(start>=0&&end>start,'mergeTraceTick must exist');
test('a legitimate fusion must not hide simultaneous loss of Mythique I',()=>{
 const before=Array(21).fill(null);
 before[0]='RARE_I';before[1]='RARE_I';before[20]='MYTHIQUE_I';
 const after=Array(21).fill(null);after[1]='RARE_II';
 const st={mergeBoard:after,mergeFusions:1,mergeCrafts:0,sacrifices:0};
 const ctx={S:{sanctuary:st},mergeTracePrev:{count:3,board:before,fusions:0,crafts:0,sacrifices:0},dirty:false,Date,saveNow:()=>true};
 vm.createContext(ctx);
 vm.runInContext(src.slice(start,end),ctx);
 ctx.mergeTraceTick();
 assert.equal(st.mergeLossTrace.suspectedExtraLoss,1,
  'A concurrent unexplained loss must be flagged even during fusion');
 assert.equal(st.mergeBoard.includes('MYTHIQUE_I'),false,
  'Detection must not invent a replacement fragment without transaction proof');
});
