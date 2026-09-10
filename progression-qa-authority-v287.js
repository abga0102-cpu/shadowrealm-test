/* SHADOWREACH V287 · Progression QA authority
   Fixes three integration gaps found after V283-V286:
   1) Poussiere upgrades now really grant +2% of base stat per item level.
   2) Offensive skills really use intrinsic power instead of player damage.
   3) Kameha MULTI damages at most 3 targets while keeping its MULTI identity.
   Also cleans the legacy Familiar UI of levels/apples/percentage presentation. */
(function(){'use strict';if(window.__srProgressionQAV287)return;window.__srProgressionQAV287=true;

/* ---------- equipment upgrade authority ---------- */
function itemFind(s,id){var it=null;try{it=Object.values(s.equipped||{}).find(function(x){return x&&x.id===id;})||(s.inventory||[]).find(function(x){return x&&x.id===id;})||null;}catch(_){ }return it;}
function applyGrowth(it){if(!it)return;var lv=Math.max(0,Number(it.level)||0),mul=1+.02*lv;if(Number(it.baseDamage)>0)it.damage=Math.max(Number(it.damage)||0,Math.round(Number(it.baseDamage)*mul*100)/100);if(Number(it.baseHp)>0)it.hp=Math.max(Number(it.hp)||0,Math.round(Number(it.baseHp)*mul*100)/100);it.power=Math.round(((Number(it.damage)||0)+(Number(it.hp)||0))*100)/100;it.equipmentGrowthVersion=287;}
try{if(typeof itemUpgradePreview==='function')itemUpgradePreview=function(it){if(!it)return {label:'Stat',current:0,next:0,gain:0};var lv=Math.max(0,Number(it.level)||0),mul=1+.02*(lv+1),current,next,label;if(Number(it.baseDamage)>0){current=Number(it.damage)||0;next=Math.round(Number(it.baseDamage)*mul*100)/100;label='ATQ';}else{current=Number(it.hp)||0;next=Math.round(Number(it.baseHp)*mul*100)/100;label='PV';}next=Math.max(current,next);return {label:label,current:current,next:next,gain:Math.round((next-current)*100)/100};};}catch(_){ }
try{if(typeof upgradeItem==='function'&&!upgradeItem.__srV287){var oldUpgradeItem=upgradeItem;upgradeItem=function(id){var before=itemFind(S,id),beforeStat=before?((Number(before.damage)||0)+(Number(before.hp)||0)):0;var res=oldUpgradeItem(id);if(res&&res.ok){update(function(s){applyGrowth(itemFind(s,id));});var after=itemFind(S,id),afterStat=after?((Number(after.damage)||0)+(Number(after.hp)||0)):beforeStat;res.statGain=Math.round((afterStat-beforeStat)*100)/100;res.statLabel=after&&Number(after.baseDamage)>0?'ATQ':'PV';}return res;};upgradeItem.__srV287=true;}}catch(_){ }
try{if(typeof S!=='undefined'&&S){(S.inventory||[]).forEach(applyGrowth);if(S.equipped)Object.keys(S.equipped).forEach(function(k){applyGrowth(S.equipped[k]);});S.equipmentGrowthVersion=287;}}catch(_){ }

/* ---------- intrinsic offensive skill damage ---------- */
var INTRINSIC={taillade:2000,frappe:10000,frappe_sombre:10000,percee:50000,meteore:5000000,kameha:50000000,execution:250000000,cataclysme:1000000000};
var RARITY_BASE={COMMUN:2000,RARE:10000,EPIQUE:50000,MYTHIQUE:5000000,ARTEFACT:50000000,LEGENDAIRE:250000000,DIVIN:1000000000};
function intrinsic(def){return INTRINSIC[def&&def.id]||RARITY_BASE[def&&def.rarity]||0;}
try{if(typeof skillMult==='function'){skillMult=function(def){if(!def||!(Number(def.mult)>0))return Number(def&&def.mult)||0;var base=intrinsic(def);if(!base)return Number(def.mult)||0;var current=1;try{current=Math.max(1,Number(D&&D.damage)||1);}catch(_){ }return base/current;};}}catch(_){ }
/* V284 already owns +5%/level and Skill-star multiplication. This layer only
   guarantees that the value entering that formula is intrinsic. */

/* Kameha stays type MULTI in data/UI. The old combat engine treats unknown
   attack types as single-target, so extend the first Kameha impact to two extra
   living enemies. Guarding prevents recursive replication. */
var kGuard=false;
try{if(typeof applyDamageToEnemy==='function'&&!applyDamageToEnemy.__srV287){var oldApply=applyDamageToEnemy;applyDamageToEnemy=function(c,e,dmg,crit,color,src){var out=oldApply.apply(this,arguments);if(!kGuard&&src==='skill'&&color==='#43C98B'&&c&&c.enemies){var equipped=false;try{equipped=(S.skillSlots||[]).some(function(id){return id==='kameha';});}catch(_){ }if(equipped){kGuard=true;try{var extras=c.enemies.filter(function(x){return x&&x.alive&&x!==e;}).slice(0,2);extras.forEach(function(x){oldApply(c,x,dmg,crit,color,src);});}finally{kGuard=false;}}}return out;};applyDamageToEnemy.__srV287=true;}}catch(_){ }

/* ---------- Familiar legacy UI cleanup ---------- */
try{if(typeof scrFamiliers==='function'&&!scrFamiliers.__srV287){var oldFam=scrFamiliers;scrFamiliers=function(){var h=String(oldFam()||''),p=(S.pets||[]).find(function(x){return x&&x.id===S.activePetId;})||null,st=(window.__srV286PetStats&&p)?window.__srV286PetStats(p,S):{damage:0,hp:0};
  /* active card */
  h=h.replace(/<span class="pill">Niv\. [^<]*<\/span>/g,'');
  h=h.replace(/\+0% dégâts/g,'+'+fmt(st.damage)+' DGT').replace(/\+0% PV/g,'+'+fmt(st.hp)+' PV');
  /* collection/mini-cards */
  h=h.replace(/Niv\. \d+(?:\/\d+)?\s*·\s*/g,'');
  /* old active upgrade control is either Apple button or NIV. MAX */
  h=h.replace(/<button[^>]*data-act="upgradePet"[\s\S]*?<\/button>/g,'');
  h=h.replace(/<span class="pill center"[^>]*>NIV\. MAX<\/span>/g,'');
  /* percentage-based comparison is obsolete: species are situational, not a single-score ladder */
  h=h.replace(/<div class="card famCompare mt8">[\s\S]*?<\/div><\/div>/,'');
  h=h.replace('Le familier le plus avancé conserve son niveau, son espèce, son élément et ses Pommes investies.','Le familier utilisé comme noyau conserve son espèce et son élément.');
  h=h.replace(/Pommes[^<]*/g,'Progression par fusion');
  return h;};scrFamiliers.__srV287=true;}
var style=document.createElement('style');style.id='sr-v287-familiar-clean';style.textContent='.famV229 .famHeroActions{grid-template-columns:1fr}.famV229 .famTileLv{font-size:8px}.famV229 .famTileLv:empty{display:none}';document.head.appendChild(style);}catch(_){ }

/* Recompute after save migration + authority installation. */
try{if(typeof S!=='undefined'&&S){S.progressionQAVersion=287;if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srProgressionQAConfigV287={intrinsic:INTRINSIC,equipmentPerLevel:.02,kamehaTargets:3};
})();