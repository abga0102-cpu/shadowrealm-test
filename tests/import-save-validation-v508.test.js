/* Regression tests for import guard. Run: node tests/import-save-validation-v508.test.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../import-save-guard-v207.js'),'utf8');
function run(json,opts={}){
  let saved=0,migrated=0,started=0,notices=[];
  const ctx={window:{},ACT:{},S:{sentinel:true},console:{warn(){}},Number,JSON,String,Array,Object,Error,
    document:{createElement(){return {files:[{name:'save.json'}],click(){this.onchange();}};}},
    FileReader:class{readAsText(){this.result=json;this.onload();}},
    migrate(raw){migrated++;if(opts.migrateThrows)throw Error('migration failed');return {...raw,inventory:raw.inventory||[],raids:raw.raids||{}};},
    RAID_IDS:[],todayStr(){return '2026-10-28';},computePower(){if(opts.powerThrows)throw Error('bad power');return 1;},
    refreshDerived(){},saveNow(){saved++;return !opts.saveFails;},startCampaign(){started++;},nav(){},toast(msg){notices.push(msg);}};
  vm.createContext(ctx);vm.runInContext(source,ctx);ctx.ACT.importSave();
  return {saved,migrated,started,S:ctx.S,notices};
}
for(const bad of [
  '{}','null','[]','0','"hello"','{"level":1}',
  '{"stats":{},"forge":{},"level":1}',
  '{"version":207,"level":1,"inventory":[],"equipped":[]}',
  '{"version":207,"level":1,"inventory":{},"equipped":{}}',
  '{"version":207,"level":1,"inventory":[],"equipped":{},"pets":{}}'
]){
  const r=run(bad);assert.equal(r.saved,0,bad);assert.equal(r.migrated,0,bad);assert.equal(r.S.sentinel,true,bad);
}
for(const fixture of ['minimal-old-save.json','legacy-accessory.json','malformed-slots.json']){
  const json=fs.readFileSync(path.join(__dirname,'fixtures/saves',fixture),'utf8');
  const r=run(json);assert.equal(r.saved,1,fixture);assert.equal(r.started,1,fixture);
}
const good=JSON.stringify({version:207,playerName:'Test',level:5,stats:{},forge:{},raids:{},inventory:[],equipped:{},pets:[]});
const ok=run(good);assert.equal(ok.saved,1);assert.equal(ok.migrated,1);assert.equal(ok.started,1);assert.equal(ok.S.level,5);
for(const opts of [{saveFails:true},{migrateThrows:true},{powerThrows:true}]){
  const r=run(good,opts);assert.equal(r.S.sentinel,true,JSON.stringify(opts));assert.equal(r.started,0,JSON.stringify(opts));
}
console.log('Import validation: partial JSON rejected, legacy fixtures accepted, failures rolled back.');
