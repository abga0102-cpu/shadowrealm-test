/* Regression suite: node --test tests/sanctuary-v126-v130-integration.test.js
   Runs source excerpts from the actual game, not rewritten movement algorithms.
   Isolated state only: never accesses real player saves or localStorage. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const source=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const v126=source('accomplishments-merge-v126.js');
const game5=source('game-5.js');
const v130=source('sanctuary-endgame-v130.js');
function extract(src,start,end){
  const a=src.indexOf(start),b=src.indexOf(end,a);
  assert.ok(a>=0&&b>a,'source anchors '+start);
  return src.slice(a,b);
}
const dropSource=extract(game5,'function sanctMergeDrop(','\nconst ACT =');
const stateSource=extract(v130,'function cap(st){',';\n(function migrate()')+';';
function sandbox(S,{saveOk=true}={}){
  const logs=[];
  const ctx={S,window:{addEventListener(){}},document:{getElementById(){return null}},
    queueMicrotask(fn){fn();},SANCT_BOARD_SIZE:16,
    expansionLedger(){return Number(S.sanctuary.boardExpansions)||0;},
    localStorage:{getItem(){return null;}},dirty:false,
    saveNow(){return saveOk;},toast(...args){logs.push(args);},render(){},
    sanctMergeNext(r){return r==='RARE_I'?'RARE_II':null;},
    sanctMergeDiscover(){},navigator:{vibrate(){}},
    SANCT_MERGE_NAME:{RARE_I:'Rare I',RARE_II:'Rare II',MYTHIQUE_I:'Mythique I'}};
  vm.createContext(ctx);
  vm.runInContext(stateSource,ctx);
  vm.runInContext(dropSource,ctx);
  return {ctx,logs};
}
function runV126(ctx){vm.runInContext(v126,ctx);}
function fresh(size,filled=false){
  return {sanctuary:{mergeBoard:Array(size).fill(filled?'RARE_I':null),
    boardExpansions:size-16,mergeReserve:[],mergeFusions:0,fusions:0},
    accomplishments:{mergePieces:{}}};
}
for(const size of [16,21,32]){
  test('move into last purchased slot survives JSON reload: '+size,()=>{
    const S=fresh(size);S.sanctuary.mergeBoard[0]='MYTHIQUE_I';
    const {ctx}=sandbox(S);
    assert.equal(ctx.sanctMergeDrop(0,size-1),true);
    const reloaded=JSON.parse(JSON.stringify(S));
    const next=sandbox(reloaded);
    runV126(next.ctx);
    const st=next.ctx.sanctMergeState();
    assert.equal(st.mergeBoard.length,size);
    assert.equal(st.mergeBoard[0],null);
    assert.equal(st.mergeBoard[size-1],'MYTHIQUE_I');
    assert.equal(st.mergeBoard.filter(Boolean).length,1);
  });
  test('full board reward persists in array reserve: '+size,()=>{
    const S=fresh(size,true);S.accomplishments.mergePieces.RARE=1;
    const {ctx}=sandbox(S);runV126(ctx);
    const reloaded=JSON.parse(JSON.stringify(S));
    assert.equal(reloaded.sanctuary.mergeReserve.length,1);
    assert.equal(reloaded.sanctuary.mergeReserve[0],'RARE_I');
    assert.equal(reloaded.sanctuary.mergeBoard.length,size);
    const next=sandbox(reloaded);runV126(next.ctx);
    assert.equal(next.ctx.sanctMergeState().mergeReserve.length,1);
  });
}
test('legacy reserve counts migrate without losing higher tiers',()=>{
  const S=fresh(21,true);
  S.sanctuary.mergeReserve={MYTHIQUE:2,ARTEFACT_II:1};
  const {ctx}=sandbox(S);runV126(ctx);
  const persisted=JSON.parse(JSON.stringify(S));
  assert.deepEqual(persisted.sanctuary.mergeReserve,['MYTHIQUE_I','MYTHIQUE_I','ARTEFACT_II']);
});
test('move rollback on refused save preserves fragment',()=>{
  const S=fresh(21);S.sanctuary.mergeBoard[0]='MYTHIQUE_I';
  const {ctx}=sandbox(S,{saveOk:false});
  assert.equal(ctx.sanctMergeDrop(0,20),false);
  assert.equal(S.sanctuary.mergeBoard[0],'MYTHIQUE_I');
  assert.equal(S.sanctuary.mergeBoard[20],null);
});
test('claimed Rare and Mythic rewards use canonical board ranks',()=>{
  const S=fresh(21);S.accomplishments.mergePieces={RARE:1,MYTHIQUE:1};
  const {ctx}=sandbox(S);runV126(ctx);
  assert.equal(S.sanctuary.mergeBoard[0],'RARE_I');
  assert.equal(S.sanctuary.mergeBoard[1],'MYTHIQUE_I');
});
