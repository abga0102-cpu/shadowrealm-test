'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../sanctuary-endgame-v130.js'),'utf8');
const begin=src.indexOf('function sacrifice(rarity){');
const end=src.indexOf('\nfunction recoverFirstSlot()',begin);
assert(begin>=0&&end>begin,'sacrifice function found');
function run(){
 const st={mergeBoard:Array(21).fill(null),mergeLastPurchaseAudit:{slot:20,rarity:'EPIQUE_I',count:1,save:'ok',at:Date.now()},sacrifices:0};
 st.mergeBoard[20]='EPIQUE_I';
 let rewards=0,saves=0;
 const ctx={sanctMergeState:()=>st,REWARDS:{EPIQUE_I:{mineral:10}},NAMES:{EPIQUE_I:'Épique I'},confirm:()=>true,rewardText:()=>'',grant:()=>{rewards++;},saveNow:()=>{saves++;return true;},toast:()=>{},render:()=>{},dirty:false,Date};
 vm.createContext(ctx);vm.runInContext(src.slice(begin,end),ctx);
 ctx.sacrifice('EPIQUE_I');
 // Mirror the purchase-recovery predicate used by sanctMergeState.
 const au=st.mergeLastPurchaseAudit,idx=Number(au.slot);
 const shouldRecover=au.save==='ok'&&idx>=0&&idx<st.mergeBoard.length&&Date.now()-Number(au.at)<120000&&!st.mergeBoard[idx]&&!au.lastRemoval&&st.mergeBoard.filter(Boolean).length<Number(au.count);
 return {st,rewards,saves,shouldRecover};
}
test('sacrifice of recently purchased fragment does not trigger purchase recovery',()=>{
 const r=run();assert.equal(r.rewards,1);assert.equal(r.saves,1);assert.equal(r.st.mergeBoard[20],null);assert.equal(r.st.mergeLastPurchaseAudit.lastRemoval,'Sacrifice volontaire');assert.equal(r.shouldRecover,false);
});
