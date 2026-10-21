'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../game-5.js'),'utf8');
const start=source.indexOf('function sanctMergeDrop(from,to){');
const end=source.indexOf('\nconst ACT =',start);
assert(start>=0&&end>start,'sanctMergeDrop source must be located');
function setup(board,save=()=>true){
 const st={mergeBoard:board.slice(),mergeFusions:0,fusions:0,mergeSelected:0,mergeLockedSlots:{}};
 const events=[];
 const ctx={sanctMergeState:()=>st,sanctMergeNext:r=>r==='RARE_I'?'RARE_II':null,
  sanctMergeDiscover:()=>{},SANCT_MERGE_NAME:{RARE_I:'Rare I',RARE_II:'Rare II',MYTHIQUE_I:'Mythique I'},
  saveNow:save,toast:m=>events.push(m),render:()=>{},navigator:{},dirty:false,Date};
 vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);
 return {st,drop:ctx.sanctMergeDrop,events};
}
test('21 slots: move Mythique I from purchased cell to empty cell without loss',()=>{
 const b=Array(21).fill(null);b[20]='MYTHIQUE_I';
 const {st,drop}=setup(b);
 assert.equal(drop(20,17),true);
 assert.equal(st.mergeBoard.length,21);
 assert.equal(st.mergeBoard[17],'MYTHIQUE_I');
 assert.equal(st.mergeBoard[20],null);
 assert.equal(st.mergeBoard.filter(Boolean).length,1);
});
test('21 slots: moving to occupied different rarity preserves both',()=>{
 const b=Array(21).fill(null);b[20]='MYTHIQUE_I';b[18]='RARE_I';
 const {st,drop}=setup(b);
 assert.equal(drop(20,18),false);
 assert.deepEqual(st.mergeBoard,b);
});
test('21 slots: equal rarity fusion consumes exactly two and creates one',()=>{
 const b=Array(21).fill(null);b[19]='RARE_I';b[20]='RARE_I';
 const {st,drop}=setup(b);
 assert.equal(drop(19,20),true);
 assert.equal(st.mergeBoard[20],'RARE_II');
 assert.equal(st.mergeBoard.filter(Boolean).length,1);
 assert.equal(st.mergeFusions,1);
});
test('save refusal rolls back move without fragment loss',()=>{
 const b=Array(21).fill(null);b[20]='MYTHIQUE_I';
 const {st,drop}=setup(b,()=>false);
 assert.equal(drop(20,17),false);
 assert.deepEqual(st.mergeBoard,b);
});
