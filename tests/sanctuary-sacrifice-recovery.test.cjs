'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../sanctuary-endgame-v130.js'),'utf8');
function extract(start,end){
 const a=src.indexOf(start),b=src.indexOf(end,a);
 assert(a>=0&&b>a,'Sanctuary runtime function must be present: '+start);
 return src.slice(a,b);
}
const stateCode=extract('sanctMergeState=function(){','\n(function migrate()');
const sacrificeCode=extract('function sacrifice(rarity){','\nfunction recoverFirstSlot()');
function setup(board,audit,accept=true){
 const st={mergeBoard:board.slice(),boardExpansions:5,mergeLastPurchaseAudit:{...audit},sacrifices:0};
 const S={sanctuary:st};
 let rewards=0,saves=0;
 const ctx={S,expansionLedger:()=>5,cap:()=>21,saveNow:()=>{saves++;return true;},
  REWARDS:{EPIQUE_I:{mineral:10}},NAMES:{EPIQUE_I:'Épique I'},confirm:()=>accept,
  rewardText:()=>'',grant:()=>{rewards++;},toast:()=>{},render:()=>{},dirty:false,Date};
 vm.createContext(ctx);
 vm.runInContext(stateCode+'\n'+sacrificeCode,ctx);
 return {st,ctx,get rewards(){return rewards;},get saves(){return saves;}};
}
function audit(slot,count){
 return {slot,rarity:'EPIQUE_I',count,save:'ok',at:Date.now()};
}
test('sacrificing the purchased piece never triggers the real purchase-recovery code',()=>{
 const board=Array(21).fill(null);board[20]='EPIQUE_I';
 const r=setup(board,audit(20,1));
 r.ctx.sacrifice('EPIQUE_I');
 r.ctx.sanctMergeState();
 assert.equal(r.rewards,1);assert.equal(r.saves,1);
 assert.equal(r.st.mergeBoard[20],null);
 assert.equal(r.st.mergeBoard.filter(Boolean).length,0);
 assert.equal(r.st.mergeLastPurchaseAudit.lastRemoval,'Sacrifice volontaire');
});
test('sacrificing an identical older piece leaves the purchased one intact',()=>{
 const board=Array(21).fill(null);board[0]='EPIQUE_I';board[20]='EPIQUE_I';
 const r=setup(board,audit(20,2));
 r.ctx.sacrifice('EPIQUE_I');
 r.ctx.sanctMergeState();
 assert.equal(r.rewards,1);
 assert.equal(r.st.mergeBoard[0],null);
 assert.equal(r.st.mergeBoard[20],'EPIQUE_I');
 assert.equal(r.st.mergeBoard.filter(Boolean).length,1);
 assert.equal(r.st.mergeLastPurchaseAudit.lastRemoval,undefined);
});
test('cancelled sacrifice does not alter fragments or award rewards',()=>{
 const board=Array(21).fill(null);board[20]='EPIQUE_I';
 const r=setup(board,audit(20,1),false);
 r.ctx.sacrifice('EPIQUE_I');
 assert.equal(r.rewards,0);assert.equal(r.saves,0);
 assert.equal(r.st.mergeBoard[20],'EPIQUE_I');
 assert.equal(r.st.mergeLastPurchaseAudit.lastRemoval,undefined);
});
