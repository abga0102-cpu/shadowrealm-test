/* SHADOWREACH V491 · Puissance des améliorations Poussière ×2
   Autorité dédiée, chargée après V304.
   - Gain réussi : +6% de la stat de base par niveau Poussière (ancien +3%).
   - Coût V283, chance V301 et Sceaux inchangés.
   - Recalcule les améliorations existantes sans consommer de Poussière.
*/
(function(){'use strict';
if(window.__srEquipmentDustPowerV491)return;
var STEP=.06;
function level(it){try{if(typeof equipmentUpgradeLevel==='function')return Math.max(0,Math.floor(Number(equipmentUpgradeLevel(it))||0));}catch(_){}return Math.max(0,Math.floor(Number(it&&it.upgradeLevel)||0));}
function steps(it,next){var lv=level(it)+(next?1:0),anchor=Math.max(0,Math.floor(Number(it&&it.upgradeBaseLevel)||0));return Math.max(0,lv-anchor);}
function round(n){return Math.round((Number(n)||0)*100)/100;}
function target(it,n){if(!it)return {label:'Stat',value:0};if(Number(it.baseDamage)>0)return {label:'ATQ',value:round(Number(it.baseDamage)*(1+n*STEP))};return {label:'PV',value:round(Number(it.baseHp||0)*(1+n*STEP))};}
function applyItem(it){if(!it)return false;var bd=Number(it.damage)||0,bh=Number(it.hp)||0,t=target(it,steps(it,false));if(Number(it.baseDamage)>0)it.damage=t.value;if(Number(it.baseHp)>0)it.hp=t.value;it.power=round((Number(it.damage)||0)+(Number(it.hp)||0));it.dustPowerVersion=491;return bd!==Number(it.damage||0)||bh!==Number(it.hp||0);}
function applyState(s){if(!s)return false;var changed=false;(s.inventory||[]).forEach(function(it){if(applyItem(it))changed=true;});if(s.equipped)Object.keys(s.equipped).forEach(function(k){if(applyItem(s.equipped[k]))changed=true;});s.equipmentDustPowerVersion=491;return changed;}
try{itemUpgradePreview=function(it){if(!it)return {label:'Stat',current:0,next:0,gain:0};var cur=Number(it.baseDamage)>0?Number(it.damage||0):Number(it.hp||0),t=target(it,steps(it,true));return {label:t.label,current:cur,next:t.value,gain:round(t.value-cur)};};}catch(_){}
try{upgradeItem=function(id){var result={ok:false,reason:'missing',chance:0};update(function(s){var it=Object.values(s.equipped||{}).find(function(x){return x&&x.id===id;})||(s.inventory||[]).find(function(x){return x&&x.id===id;});if(!it)return;var cost=itemUpgradeCost(it);if(s.poussiere<cost){result.reason='dust';return;}var baseChance=itemUpgradeChance(it),want=Math.min(itemSealCount(id),Math.ceil((100-baseChance)/5)),seals=Math.min(want,(s.sanctuary&&s.sanctuary.stabilitySeals)||0),chance=Math.min(100,baseChance+seals*5);s.poussiere-=cost;if(seals)s.sanctuary.stabilitySeals-=seals;itemSealPlan[id]=0;var beforeD=Number(it.damage)||0,beforeH=Number(it.hp)||0;result={ok:true,success:Math.random()*100<chance,chance:chance,seals:seals};if(!result.success)return;it.upgradeLevel=level(it)+1;applyItem(it);result.statGain=round((Number(it.damage||0)-beforeD)+(Number(it.hp||0)-beforeH));result.statLabel=Number(it.baseDamage)>0?'ATQ':'PV';result.powerMultiplier=2;result.perStepPct=6;});return result;};}catch(_){}
try{if(typeof S!=='undefined'&&S&&Number(S.equipmentDustPowerVersion)<491){applyState(S);if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){}
window.__srEquipmentDustPowerV491={version:491,perStepPct:6,previousPerStepPct:3,multiplier:2,applyItem:applyItem,applyState:applyState,costChanged:false,chanceChanged:false};
})();
