/* SHADOWREACH V449 / V465 / V478 · Final Campaign power authority
   Existing approved early-Campaign balance remains unchanged:
   - Facile 1-2 .. Facile 5-4 => HP -40%, damage +60%.
   - Facile 5-5 .. Facile 5-19 => HP -30%; damage -15% at 5-5 for continuity,
     then -30% from 5-6 through 5-19.

   V478 does NOT rebalance any enemy by itself. It turns this already-last
   Campaign spawn owner into the single final adjustment/inspection point:
   - all earlier V288/V289/V333/V352 layers run first;
   - the historical V449/V465 band then runs exactly as before;
   - future approved Campaign HP/damage bands must be registered here as FINAL_RULES;
   - every normal Campaign spawn records the final HP/damage and known upstream
     layers, so a requested percentage can be tested against what the player
     actually fights instead of against an obsolete intermediate curve.

   Raids and Mega-Bosses are never affected by V478 final rules. */
(function(){
'use strict';
if(window.__srCampaignEarlyRebalanceV449)return;
window.__srCampaignEarlyRebalanceV449=true;
window.__srCampaignPowerAuthorityV478=true;

var FIRST=2, FIRST_END=84, SECOND_START=85, SECOND_END=99, BOSS_EVERY=5;
var SECOND_DAMAGE_MUL=0.70;
var SECOND_ENTRY_DAMAGE_MUL=0.85;
var FINAL_RULES=[];

function multipliers(f){
  f=Math.max(1,Math.floor(Number(f)||1));
  if(f>=FIRST&&f<=FIRST_END)return {hp:0.60,dmg:1.60,band:1};
  if(f===SECOND_START)return {hp:0.70,dmg:SECOND_ENTRY_DAMAGE_MUL,band:2,continuityGuard:true};
  if(f>SECOND_START&&f<=SECOND_END)return {hp:0.70,dmg:SECOND_DAMAGE_MUL,band:2};
  return {hp:1,dmg:1,band:0};
}
function isBossFloor(f){return Math.max(1,Math.floor(Number(f)||1))%BOSS_EVERY===0;}
function postBoss(f){return f>1&&isBossFloor(f-1);}
function floorOf(opts){return Math.max(1,Math.floor(Number(opts&&opts.floor)||1));}
function finitePositive(v,fallback){v=Number(v);return isFinite(v)&&v>0?v:fallback;}
function enemyType(enemy,opts){
  if(opts&&opts.boss)return 'boss';
  if((opts&&opts.elite)||(enemy&&enemy.elite))return 'elite';
  return 'normal';
}
function knownLayers(enemy){
  var out=[];
  if(enemy&&enemy.__srStarterBossV462)out.push('starterBossV462');
  if(enemy&&enemy.__srEasyDragonV334)out.push('easyDragonV334');
  if(enemy&&enemy.__srLateEasyBalanceV334)out.push('lateEasyV334');
  if(enemy&&enemy.__srCampaignBalanceV362)out.push('campaignTierV362/V473');
  if(enemy&&enemy.__srCampaignEarlyRebalanceV449)out.push('earlyRebalanceV449/V465');
  return out;
}
function cloneRule(r){
  return {id:r.id,from:r.from,to:r.to,hpMul:r.hpMul,damageMul:r.damageMul,types:(r.types||[]).slice()};
}
function ruleApplies(rule,floor,type){
  if(floor<rule.from||floor>rule.to)return false;
  return !rule.types||!rule.types.length||rule.types.indexOf(type)>=0;
}
function applyFinalRules(enemy,opts){
  if(opts&&opts.noFastback)return [];
  var floor=floorOf(opts),type=enemyType(enemy,opts),applied=[];
  for(var i=0;i<FINAL_RULES.length;i++){
    var rule=FINAL_RULES[i];
    if(!ruleApplies(rule,floor,type))continue;
    var hpMul=finitePositive(rule.hpMul,1),damageMul=finitePositive(rule.damageMul,1);
    var beforeMax=Math.max(1,Number(enemy.maxHP||enemy.hp||1));
    var beforeHp=Math.max(1,Number(enemy.hp||beforeMax));
    enemy.maxHP=Math.max(1,Math.floor(beforeMax*hpMul));
    enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(beforeHp*hpMul)));
    enemy.dmg=Math.max(1,Math.floor(Math.max(1,Number(enemy.dmg||1))*damageMul));
    applied.push(rule.id);
  }
  return applied;
}
function finalSnapshot(enemy,opts,preHP,preDamage,applied){
  return {
    version:478,
    floor:floorOf(opts),
    type:enemyType(enemy,opts),
    preFinalHP:Math.max(1,Number(preHP)||1),
    preFinalDamage:Math.max(1,Number(preDamage)||1),
    hp:Math.max(1,Number(enemy.maxHP||enemy.hp||1)),
    damage:Math.max(1,Number(enemy.dmg||1)),
    upstreamLayers:knownLayers(enemy),
    finalRules:(applied||[]).slice(),
    finalAuthority:true
  };
}

/* Final-spawn authority. The historical V449/V465 adjustment is preserved
   byte-for-byte in meaning; V478 only adds a single future final-rule hook and
   final-value observability after that adjustment. */
try{
  if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignEarlyRebalanceV449){
    var previousMakeEnemy=makeEnemy;
    makeEnemy=function(mode,opts){
      var enemy=previousMakeEnemy(mode,opts);
      if(mode!=='campaign'||!opts||!enemy||opts.megaBoss)return enemy;

      var preHP=Math.max(1,Number(enemy.maxHP||enemy.hp||1));
      var preDamage=Math.max(1,Number(enemy.dmg||1));
      var f=floorOf(opts),m=multipliers(f);

      if(m.band){
        var beforeHP=Math.max(1,Number(enemy.maxHP||enemy.hp||1));
        var beforeDmg=Math.max(1,Number(enemy.dmg||1));
        enemy.maxHP=Math.max(1,Math.floor(beforeHP*m.hp));
        enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||beforeHP)*m.hp)));
        enemy.dmg=Math.max(1,Math.floor(beforeDmg*m.dmg));
        enemy.__srCampaignEarlyRebalanceV449={floor:f,hpMul:m.hp,dmgMul:m.dmg,band:m.band};
      }

      /* noFastback identifies Mega-Boss construction in the current runtime.
         Keep its existing historical path untouched and outside V478 rules. */
      if(opts.noFastback)return enemy;

      var applied=applyFinalRules(enemy,opts);
      enemy.__srCampaignPowerFinalV478=finalSnapshot(enemy,opts,preHP,preDamage,applied);
      return enemy;
    };
    makeEnemy.__srCampaignEarlyRebalanceV449=true;
    makeEnemy.__srCampaignPowerAuthorityV478=true;
  }
}catch(_){}

window.__srCampaignEarlyRebalanceConfigV449={
  version:465,first:{from:2,to:84,visible:'Facile 1-2 → Facile 5-4',hpMul:.60,damageMul:1.60},
  second:{from:85,to:99,visible:'15 étages suivants (Facile 5-5 → Facile 5-19)',hpMul:.70,damageMul:SECOND_DAMAGE_MUL,
    entryFloor:SECOND_START,entryDamageMul:SECOND_ENTRY_DAMAGE_MUL,fullDamageFrom:SECOND_START+1},
  multipliers:multipliers,isBossFloor:isBossFloor,postBossException:postBoss,
  invariant:'no-higher-stage-easier-except-stage-after-boss',raidsChanged:false,megaBossChanged:false
};

window.__srCampaignPowerAuthorityConfigV478={
  version:478,
  balanceNeutral:true,
  finalOwner:'campaign-early-rebalance-v449.js',
  finalRules:FINAL_RULES,
  addRule:function(rule){
    if(!rule||!rule.id)throw new Error('Campaign final rule requires an id');
    var normalized={
      id:String(rule.id),
      from:Math.max(1,Math.floor(Number(rule.from)||1)),
      to:Math.max(1,Math.floor(Number(rule.to)||1)),
      hpMul:finitePositive(rule.hpMul,1),
      damageMul:finitePositive(rule.damageMul,1),
      types:Array.isArray(rule.types)?rule.types.slice():[]
    };
    if(normalized.to<normalized.from)throw new Error('Campaign final rule has invalid range');
    for(var i=0;i<FINAL_RULES.length;i++)if(FINAL_RULES[i].id===normalized.id)throw new Error('Duplicate Campaign final rule: '+normalized.id);
    FINAL_RULES.push(normalized);
    return cloneRule(normalized);
  },
  clearRules:function(){FINAL_RULES.length=0;},
  inspectEnemy:function(enemy){return enemy&&enemy.__srCampaignPowerFinalV478?enemy.__srCampaignPowerFinalV478:null;},
  policy:'Future Campaign HP/damage edits must be final rules in this owner; do not add another makeEnemy balance wrapper.',
  raidsChanged:false,
  megaBossChanged:false
};
})();