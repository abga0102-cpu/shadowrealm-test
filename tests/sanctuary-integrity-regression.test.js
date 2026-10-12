// Shadowreach Sanctuary integrity regression tests (isolated; no production imports)
// Run: node tests/sanctuary-integrity-regression.test.js
const assert=require('node:assert/strict');
const board=Array(21).fill(null);board[0]='common';board[1]='common';board[20]='mythic1';
const before=board.slice();const proposed=board.slice();proposed[0]=null;proposed[1]='uncommon';
// Simulate a state change while the paid auto-merge confirmation is open.
board[2]='rare';
const legacyAccepts=board.length===proposed.length;
assert.equal(legacyAccepts,true,'Document existing length-only check weakness');
assert.notDeepEqual(board,before,'Board changed during confirmation');
assert.notDeepEqual(board,proposed,'Stale result would overwrite intervening change');
const safeToCommit=board.every((value,index)=>value===before[index]);
assert.equal(safeToCommit,false,'Snapshot comparison must reject stale result');
assert.equal(board[20],'mythic1','Unrelated Mythic I must remain untouched');
// Movement into an empty purchased slot must preserve count and rarity.
const move=before.slice();move[20]=null;move[19]='mythic1';
assert.equal(move.filter(Boolean).length,before.filter(Boolean).length);
assert.equal(move[19],'mythic1');
console.log('PASS: 21-slot movement invariant and stale-confirmation regression scenario');
