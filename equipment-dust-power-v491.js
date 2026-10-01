/* SHADOWREACH V491 · Puissance des améliorations Poussière ×2
   Autorité tardive dédiée à la puissance des améliorations d'équipement.
   - Gain par amélioration réussie : +6% de la stat de base (anciennement +3%).
   - Coût Poussière et chance de réussite restent délégués aux autorités existantes.
   - Les équipements déjà améliorés sont recalculés à +6% par niveau pour que
     les anciennes améliorations profitent aussi du nouveau balance pass.
   - Maîtrise d'équipement (niveau romain), rareté, qualité et originalPower
     restent inchangés. Aucun remboursement de Poussière n'est créé.
*/
(function(){
'use strict';
if(window.__srEquipmentDustPowerV491)return;
window.__srEquipmentDustPowerV491=true;
var PER_STEP=0.06;
var VERSION=491;

function levelOf(it){
  try{if(typeof equipmentUpgradeLevel==='function')return Math.max(0,Math.floor(Number(equipmentUpgradeLevel(it))||0));}catch(_){}
  return Math.max(0,Math.floor(Number(it&&it.upgradeLevel)||0));
}
function stepsOf(it,next){
  var lv=levelOf(it)+(next?1:0),anchor=Math.max(0,Math.floor(Number(it&&it.upgradeBaseLevel)||0));
  return Math.max(0,lv-anchor);
}
function rounded(n){return Math.round((Number(n)||0)*100)/100;}
function targetStat(it,steps){
  if(!it)return {label:'Stat',value:0};
  if(Number(it.baseDamage)>0)return {label:'ATQ',value:rounded(Number(it.baseDamage)*(1+steps*PER_STEP))};
  return {label:'PV',value:rounded(Number(it.baseHp||0)*(1+steps*PER_STEP))};
}
function applyItem(it){
  if(!it)return false;
  var steps=stepsOf(it,false),beforeD=Number(it.damage)||0,beforeH=Number(it.hp)||0;
  if(Number(it.baseDamage)>0)it.damage=targetStat(it,steps).value;
  if(Number(it.baseHp)>0)it.hp=targetStat(it,steps).value;
  it.power=rounded((Number(it.damage)||0)+(Number(it.hp)||0));
  it.dustPowerVersion=VERSION;
  return beforeD!==Number(it.damage||0)||beforeH!==Number(it.hp||0);
}
function applyState(s){
  if(!s)return false;
  var changed=false;
  (s.inventory||[]).forEach(function(it){if(applyItem(it))changed=true;});
  if(s.equipped)Object.keys(s.equipped).forEach(function(k){if(applyItem(s.equipped[k]))changed=true;});
  s.equipmentDustPowerVersion=VERSION;
  return changed;
}

try{
  itemUpgradePreview=function(it){
    if(!it)return {label:'Stat',current:0,next:0,gain:0};
    var cur=Number(it.baseDamage)>0?Number(it.damage||0):Number(it.hp||0);
    var target=targetStat(it,stepsOf(it,true));
    return {label:target.label,current:cur,next:target.value,gain:rounded(target.value-cur)};
  };
}catch(_){}

try{
  upgradeItem=function(id){
    var result={ok:false,reason:'missing',chance:0};
    update(function(s){
      var it=Object.values(s.equipped||{}).find(function(x){return x&&x.id===id;})||(s.inventory||[]).find(function(x){return x&&x.id===id;});
      if(!it)return;
      var cost=itemUpgradeCost(it);
      if(s.poussiere<cost){result.reason='dust';return;}
      var baseChance=itemUpgradeChance(it);
      var want=Math.min(itemSealCount(id),Math.ceil((100-baseChance)/5));
      var seals=Math.min(want,(s.sanctuary&&s.sanctuary.stabilitySeals)||0);
      var chance=Math.min(100,baseChance+seals*5);
      s.poussiere-=cost;
      if(seals)s.sanctuary.stabilitySeals-=seals;
      itemSealPlan[id]=0;
      var beforeDamage=Number(it.damage)||0,beforeHp=Number(it.hp)||0;
      result={ok:true,success:Math.random()*100<chance,chance:chance,seals:seals};
      if(!result.success)return;
      it.upgradeLevel=levelOf(it)+1;
      applyItem(it);
      result.statGain=rounded((Number(it.damage||0)-beforeDamage)+(Number(it.hp||0)-beforeHp));
      result.statLabel=Number(it.baseDamage)>0?'ATQ':'PV';
      result.powerMultiplier=2;
      result.perStepPct=6;
    });
    return result;
  };
}catch(_){}

try{
  if(typeof S!=='undefined'&&S&&Number(S.equipmentDustPowerVersion)<VERSION){
    var changed=applyState(S);
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof saveNow==='function')saveNow();
    if(changed&&typeof scheduleRender==='function')scheduleRender();
  }
}catch(e){console.warn('V491 Dust power migration skipped',e);}

window.__srEquipmentDustPowerV491={version:VERSION,perStepPct:6,previousPerStepPct:3,multiplier:2,applyItem:applyItem,applyState:applyState,costChanged:false,chanceChanged:false};
})();
