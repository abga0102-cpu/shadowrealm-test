'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../sanctuary-touch-polish-v181.js'),'utf8');
const start=src.indexOf('function selectTarget(x,y){');
const end=src.indexOf('\nfunction updateTarget()',start);
assert(start>=0&&end>start,'Sanctuary touch target function exists');
function select(hit,from=0){
 const cell=hit===null?null:{dataset:{sanctSlot:String(hit)},closest(s){return s==='.sanctMergeCell[data-sanct-slot]'?this:null;}};
 const ctx={drag:{from},document:{elementFromPoint(){return cell;}}};
 vm.createContext(ctx);vm.runInContext(src.slice(start,end),ctx);
 return ctx.selectTarget(120,140);
}
test('highlight only an actual drop target, not a nearby cell',()=>{assert.equal(select(null),null);});
test('highlight destination under pointer including purchased slot 21',()=>{assert.equal(select(20).dataset.sanctSlot,'20');});
test('do not highlight source as destination',()=>{assert.equal(select(0),null);});
