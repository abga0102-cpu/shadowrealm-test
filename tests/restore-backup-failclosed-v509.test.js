/* Regression: restoration must never overwrite a valid active save without a fresh backup.
   Run: node tests/restore-backup-failclosed-v509.test.js */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const safety = fs.readFileSync(path.join(__dirname, '../save-safety-v340.js'), 'utf8');
const recovery = fs.readFileSync(path.join(__dirname, '../save-recovery-v341.js'), 'utf8');
const MAIN = 'shadowreach.save.local';
const BACKUP = 'shadowreach.save.backup.v340.1';
const old = JSON.stringify({playerName:'Current',level:12,recordFloor:100,floor:99,stats:{},inventory:[],equipped:{},raids:{},gold:700,exp:3,pets:[]});
const candidate = JSON.stringify({playerName:'Backup',level:7,recordFloor:50,floor:49,stats:{},inventory:[],equipped:{},raids:{},gold:400,exp:2,pets:[]});
function setup(active=old, withSafety=true) {
  const data = new Map();
  if (active !== null) data.set(MAIN, active);
  let failBackup = false, reloads = 0, confirms = 0;
  const alerts = [];
  const localStorage = {
    get length(){return data.size;},
    key(i){return Array.from(data.keys())[i] ?? null;},
    getItem(k){return data.has(k) ? data.get(k) : null;},
    setItem(k,v){if(failBackup && k === BACKUP)throw Error('QuotaExceededError');data.set(k,String(v));},
    removeItem(k){data.delete(k);}
  };
  const location = {search:'',reload(){reloads++;}};
  const window = {confirm(){confirms++;return true;},alert(s){alerts.push(s);},addEventListener(){}};
  const document = {readyState:'loading'};
  const ctx = vm.createContext({window,document,localStorage,location,console,Date,JSON,Number,Math,Array,Object,String,isFinite});
  if (withSafety) vm.runInContext(safety,ctx,{filename:'save-safety-v340.js'});
  data.set(BACKUP,candidate);
  return {ctx,window,data,alerts,stats:()=>({reloads,confirms}),failBackup(v){failBackup=v;},loadRecovery(){vm.runInContext(recovery,ctx,{filename:'save-recovery-v341.js'});}};
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
  const t=setup();t.loadRecovery();t.failBackup(true);
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),false);
  assert.equal(t.data.get(MAIN),old);
  assert.equal(t.stats().reloads,0);
  assert.equal(t.alerts.length,1);
}
{
  const t=setup();t.loadRecovery();
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),true);
  assert.equal(JSON.parse(t.data.get(MAIN)).level,7);
  assert.equal(t.data.get(BACKUP),old);
  assert.equal(t.stats().reloads,1);
}
{
  const t=setup(null);t.loadRecovery();
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),true);
  assert.equal(JSON.parse(t.data.get(MAIN)).level,7);
  assert.equal(t.stats().reloads,1);
}
{
  const t=setup(old,false);t.loadRecovery();
  assert.equal(t.window.__srSaveRecoveryV341.restoreCandidate(BACKUP),false);
  assert.equal(t.data.get(MAIN),old);
  assert.equal(t.stats().reloads,0);
  assert.equal(t.alerts.length,1);
}
{
  // The published index must load the patched modules, not a previously cached URL.
  const index = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const safetyUrl = 'save-safety-v340.js?v=2026.10.29.509';
  const recoveryUrl = 'save-recovery-v341.js?v=2026.10.29.509';
  assert.equal(index.split(safetyUrl).length - 1, 1);
  assert.equal(index.split(recoveryUrl).length - 1, 1);
  assert.ok(index.indexOf(safetyUrl) < index.indexOf(recoveryUrl), 'Safety module must load before recovery');
}
console.log('Restore safety: 7 restore scenarios and 1 production script-version check passed.');
