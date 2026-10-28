/* Regression tests for import guard. Run: node tests/import-save-validation-v508.test.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../import-save-guard-v207.js'),'utf8');
function run(json){
  const events={};let saved=0,migrated=0,started=0;
  const ctx={window:{},ACT:{},S:{sentinel:true},console:{warn(){}},Number,JSON,String,Array,Object,Error,
    document:{createElement(){return {files:[{name:'save.json'}],click(){this.onchange();}};}},
    FileReader:class{readAsText(){this.result=json;this.onload();}},
    migrate(raw){migrated++;return {...raw,inventory:raw.inventory||[],raids:raw.raids||{}};},
    RAID_IDS:[],todayStr(){return '2026-10-28';},computePower(){return 1;},
    refreshDerived(){},saveNow(){saved++;return true;},startCampaign(){started++;},nav(){},toast(){}};
  vm.createContext(ctx);vm.runInContext(source,ctx);ctx.ACT.importSave();
  return {saved,migrated,started,S:ctx.S};
}
for(const bad of ['{}','null','[]','0','"hello"','{"level":1}','{"stats":{},"forge":{},"level":0}','{"stats":{},"forge":{},"inventory":{}}']){
  const r=run(bad);assert.equal(r.saved,0,bad);assert.equal(r.migrated,0,bad);assert.equal(r.S.sentinel,true,bad);
}
const good=run(JSON.stringify({version:207,playerName:'Test',level:5,stats:{},forge:{},raids:{},inventory:[],pets:[]}));
assert.equal(good.saved,1);assert.equal(good.migrated,1);assert.equal(good.started,1);assert.equal(good.S.level,5);
console.log('Import validation: invalid payloads rejected; valid save accepted.');
