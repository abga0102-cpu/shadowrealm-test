'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../game-5.js'),'utf8');
const start=source.indexOf('  // sanctuaire\n');
const end=source.indexOf('  // tree\n',start);
assert(start>=0&&end>start,'Sanctuary action handlers must exist');
function actionsFor(board,audit){
 const st={mergeBoard:board.slice(),mergeSelected:-1,mergeLockedSlots:{},mergeLastPurchaseAudit:{...audit},mergeDiscovered:{},mergeCrafts:0,stabilitySeals:0};
 const recipe={id:'test_seal',kind:'seal',req:{RARE_I:1},qty:1,name:'Test'};
 const ctx={sanctMergeState:()=>st,SANCT_MERGE_RECIPES:[recipe],sanctMergeRecipeKnown:()=>true,sanctMergeRecipeReady:()=>true,sanctMergeRecipeOutput:()=>'',toast:()=>{},render:()=>{},dirty:false,Date,S:{accels:{}}};
 vm.createContext(ctx);
 vm.runInContext('globalThis.actions={'+source.slice(start,end)+'};',ctx);
 return {st,actions:ctx.actions};
}
test('packing updates purchased fragment audit to its new slot',()=>{
 const {st,actions}=actionsFor([null,'RARE_I',null],{slot:1,rarity:'RARE_I',count:1,at:Date.now(),save:'ok'});
 actions.sanctMergePack();
 assert.equal(st.mergeBoard[0],'RARE_I');
 assert.equal(st.mergeLastPurchaseAudit.slot,0,'stale audit could recreate a moved fragment');
});
test('ritual consumption marks purchased fragment as legitimately removed',()=>{
 const {st,actions}=actionsFor(['RARE_I',null],{slot:0,rarity:'RARE_I',count:1,at:Date.now(),save:'ok'});
 actions.sanctRecipeCraft('test_seal');
 assert.equal(st.mergeBoard[0],null);
 assert.ok(st.mergeLastPurchaseAudit.lastRemoval,'untracked ritual can trigger purchase auto-restoration');
});
