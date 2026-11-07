/* Regression: restoration must never overwrite a valid active save without a fresh backup.
   Run: node tests/restore-backup-failclosed-v509.test.js */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const safety = fs.readFileSync(path.join(__dirname, '../save-safety-v340.js'), 'utf8');
const MAIN = 'shadowreach.save.local';
const BACKUP = 'shadowreach.save.backup.v340.1';
const old = JSON.stringify({playerName:'Current',level:12,recordFloor:100,floor:99,stats:{},inventory:[],equipped:{},raids:{},gold:700,exp:3,pets:[]});
const candidate = JSON.stringify({playerName:'Backup',level:7,recordFloor:50,floor:49,stats:{},inventory:[],equipped:{},raids:{},gold:400,exp:2,pets:[]});
function setup(active=old, withSafety=true) {
  const data = new Map();
  if (active !== null) data.set(MAIN, active);
  let failBackup = false, reloads = 0, confirms = 0;
  const localStorage = {
    get length(){return data.size;},
    key(i){return Array.from(data.keys())[i] ?? null;},
    getItem(k){return data.has(k) ? data.get(k) : null;},
    setItem(k,v){if(failBackup && k === BACKUP)throw Error('QuotaExceededError');data.set(k,String(v));},
    removeItem(k){data.delete(k);}
  };
  const location = {search:'',reload(){reloads++;}};
  const window = {confirm(){confirms++;return true;},addEventListener(){}};
  const document = {readyState:'loading'};
  const ctx = vm.createContext({window,document,localStorage,location,console,Date,JSON,Number,Math,Array,Object,String,isFinite});
  if (withSafety) vm.runInContext(safety,ctx,{filename:'save-safety-v340.js'});
  data.set(BACKUP,candidate);
  return {ctx,window,data,stats:()=>({reloads,confirms}),failBackup(v){failBackup=v;}};
}
{
  const t=setup();t.failBackup(true);
  assert.equal(t.window.__srSaveSafetyV340.restore(1),false);
  assert.equal(t.data.get(MAIN),old);
  assert.equal(t.stats().reloads,0);
}
{
  const t=setup();
  assert.equal(t.window.__srSaveSafetyV340.restore(1),true);
  assert.equal(t.data.get(MAIN),candidate);
  assert.equal(t.data.get(BACKUP),old);
  assert.equal(t.stats().reloads,1);
}
{
  const t=setup('{corrupt');
  assert.equal(t.window.__srSaveSafetyV340.restore(1),true);
  assert.equal(t.data.get(MAIN),candidate);
  assert.equal(t.stats().reloads,1);
}
{
  const t=setup();t.failBackup(true);
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),false);
  assert.equal(t.data.get(MAIN),old);
  assert.equal(t.stats().reloads,0);
}
{
  const t=setup();
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),true);
  assert.equal(JSON.parse(t.data.get(MAIN)).level,7);
  assert.equal(t.data.get(BACKUP),old);
  assert.equal(t.stats().reloads,1);
}
{
  const t=setup(null);
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),true);
  assert.equal(JSON.parse(t.data.get(MAIN)).level,7);
  assert.equal(t.stats().reloads,1);
}
{
  // Restoring an older hero must not silently delete an ancestral familiar.
  const ancestral = {id:'ancestor-1',name:'Guardian',rarity:'ANCESTRAL'};
  const currentWithPet = JSON.stringify({...JSON.parse(old),pets:[ancestral],activePetId:ancestral.id});
  const t=setup(currentWithPet);
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),true);
  const restored=JSON.parse(t.data.get(MAIN));
  assert.equal(restored.pets.some(p=>p.id===ancestral.id),true);
  assert.equal(restored.activePetId,ancestral.id);
}
{
  const t=setup(old,false);
  assert.equal(t.window.__srSaveRecoveryV341,undefined);
  assert.equal(t.data.get(MAIN),old);
  assert.equal(t.stats().reloads,0);
}
{
  // The published index must load the patched modules, not a previously cached URL.
  const index = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const safetyUrl = 'save-safety-v340.js?v=2026.11.07.291';
  assert.equal(index.split(safetyUrl).length - 1, 1);
  assert.ok(!index.includes('<script src="save-recovery-v341.js'), 'Duplicate recovery module must not load');
}
console.log('Restore safety: 8 restore scenarios and 1 consolidated script-version check passed.');
