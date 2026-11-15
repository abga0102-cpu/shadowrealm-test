/* Shadowreach Sanctuary regression checks — run with: node tests/sanctuary-transactions.test.cjs
   Isolated model tests. They do NOT prove browser/iOS integration or save persistence. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','game-5.js'),'utf8');
const start=source.indexOf('function sanctMergeDrop(from,to){');
const end=source.indexOf('\nconst ACT = {',start);
assert(start>=0&&end>start,'sanctMergeDrop source must exist');
const fn=source.slice(start,end);
function setup(board,{save=()=>true}={}){
 const st={mergeBoard:board.slice(),mergeSelected:0,mergeFusions:0,fusions:0,mergeLockedSlots:{},mergeLastPurchaseAudit:null};
 let saves=0,renders=0;
 const ctx={sanctMergeState:()=>st,sanctMergeNext:r=>r==='COMMUN'?'PEU_COMMUN':null,
 sanctMergeDiscover:()=>{},saveNow:()=>{saves++;return save();},render:()=>{renders++;},toast:()=>{},
 SANCT_MERGE_NAME:{COMMUN:'Commun',PEU_COMMUN:'Peu commun'},navigator:{vibrate:()=>{}},dirty:false};
 vm.createContext(ctx);vm.runInContext(fn,ctx);
 return {st,move:(a,b)=>ctx.sanctMergeDrop(a,b),get saves(){return saves;},get renders(){return renders;}};
}
function check(label,run){run();process.stdout.write('PASS '+label+'\n');}
check('move to paid slot 21 preserves count and capacity',()=>{
 const board=Array(21).fill(null);board[0]='COMMUN';
 const t=setup(board);assert.equal(t.move(0,20),true);
 assert.equal(t.st.mergeBoard.length,21);assert.equal(t.st.mergeBoard.filter(Boolean).length,1);
 assert.equal(t.st.mergeBoard[20],'COMMUN');assert.equal(t.st.mergeBoard[0],null);
 assert.equal(t.saves,1);
});
check('merge consumes exactly two and creates next rarity',()=>{
 const board=Array(21).fill(null);board[0]='COMMUN';board[20]='COMMUN';
 const t=setup(board);assert.equal(t.move(0,20),true);
 assert.equal(t.st.mergeBoard[20],'PEU_COMMUN');assert.equal(t.st.mergeBoard.filter(Boolean).length,1);
 assert.equal(t.st.mergeFusions,1);
});
check('different rarities cannot merge',()=>{
 const board=Array(21).fill(null);board[0]='COMMUN';board[20]='PEU_COMMUN';
 const t=setup(board);assert.equal(t.move(0,20),false);
 assert.deepEqual(t.st.mergeBoard,board);assert.equal(t.saves,0);
});
check('save refusal rolls back move',()=>{
 const board=Array(21).fill(null);board[0]='COMMUN';
 const t=setup(board,{save:()=>false});assert.equal(t.move(0,20),false);
 assert.deepEqual(t.st.mergeBoard,board);assert.equal(t.st.mergeFusions,0);
});
check('save exception rolls back merge',()=>{
 const board=Array(21).fill(null);board[0]='COMMUN';board[20]='COMMUN';
 const t=setup(board,{save:()=>{throw Error('quota');}});
 assert.equal(t.move(0,20),false);assert.deepEqual(t.st.mergeBoard,board);
 assert.equal(t.st.mergeFusions,0);
});
check('invalid index never mutates inventory',()=>{
 const board=Array(21).fill(null);board[0]='COMMUN';
 const t=setup(board);assert.equal(t.move(0,21),false);
 assert.equal(t.move(-1,2),false);assert.deepEqual(t.st.mergeBoard,board);
});
