/* SHADOWREACH V322 · Familiar economy + 800-stage campaign authority
   - 50 Essence per paid Familiar summon while preserving Double Œuf extras.
   - 8 difficulties × 5 chapters × 20 stages = 800 internal campaign stages.
   - first visible difficulty is Facile (compatibility id remains `normal`).
   - one-time migration maps legacy 1..400 progression proportionally to 1..800.
   - V321 Forge teaching encounter remains isolated at visible stage 1-2. */
(function(){
'use strict';
if(window.__srProgressionCampaignV322)return;
window.__srProgressionCampaignV322=true;

var CAMPAIGN_MAX=800;
var LEGACY_MAX=400;
var PAID_FAMILIAR_COST=50;
var EXTRA_FAMILIAR_COST=25; // core already charges 25; V322 adds the other 25.
var DIFFICULTIES=[
  {id:'normal',label:'Facile',start:1,end:100},
  {id:'difficile',label:'Difficile',start:101,end:200},
  {id:'expert',label:'Expert',start:201,end:300},
  {id:'cauchemar',label:'Cauchemar',start:301,end:400},
  {id:'infernal',label:'Infernal',start:401,end:500},
  {id:'abyssal',label:'Abyssal',start:501,end:600},
  {id:'immortel',label:'Immortel',start:601,end:700},
  {id:'divin',label:'Divin',start:701,end:800}
];
var STAGE_WAVES=[3,3,3,2,1,3,3,3,2,1,3,3,3,2,1,3,3,3,2,1];

function clampFloor(f){f=Math.floor(Number(f)||1);return Math.max(1,Math.min(CAMPAIGN_MAX,f));}
function difficultyIndexForFloor(f){for(var i=0;i<DIFFICULTIES.length;i++)if(f>=DIFFICULTIES[i].start&&f<=DIFFICULTIES[i].end)return i;return 7;}
function stageKind(stage){stage=Math.max(1,Math.min(20,Math.floor(Number(stage)||1)));var m=((stage-1)%5)+1;return m===5?'boss':m===4?'elite':'normal';}
function campaignMeta(f){
  var floor=clampFloor(f),di=difficultyIndexForFloor(floor),diff=DIFFICULTIES[di],within=floor-diff.start+1;
  var chapter=Math.floor((within-1)/20)+1,stage=(within-1)%20+1,kind=stageKind(stage);
  return {floor:floor,maxFloor:CAMPAIGN_MAX,difficultyIndex:di,difficultyId:diff.id,difficulty:diff.label,
    difficultyFloor:within,difficultyChapter:chapter,chapter:chapter,globalChapter:Math.floor((floor-1)/20)+1,
    stage:stage,stageCode:chapter+'-'+stage,kind:kind,isBoss:kind==='boss',isElite:kind==='elite',label:diff.label+' · '+chapter+'-'+stage};
}
function waveCount(f){return STAGE_WAVES[campaignMeta(f).stage-1]||1;}
function encounterIndex(f,kind){var n=0;f=clampFloor(f);for(var i=1;i<=f;i++)if(campaignMeta(i).kind===kind)n++;return Math.max(0,n-1);}

window.__srCampaignMaxFloor=CAMPAIGN_MAX;
window.__srCampaignDifficulties=DIFFICULTIES.slice();
window.__srCampaignMeta=campaignMeta;
window.__srCampaignLabel=function(f){return campaignMeta(f).label;};
window.__srCampaignStageLabel=function(f){return campaignMeta(f).stageCode;};
window.__srCampaignStageKindV316=function(f){return campaignMeta(f).kind;};
window.__srCampaignStageKindV322=function(f){return campaignMeta(f).kind;};
window.__srCampaignWavePatternV315=STAGE_WAVES.slice();
window.__srCampaignWaveCountV315=waveCount;
window.__srCampaignWavePatternV316=STAGE_WAVES.slice();
window.__srCampaignWaveCountV316=waveCount;
window.__srCampaignWavePatternV322=STAGE_WAVES.slice();
window.__srCampaignWaveCountV322=waveCount;

try{isBoss=function(f){return campaignMeta(f).isBoss;};}catch(_){ }
try{isElite=function(f){return campaignMeta(f).isElite;};}catch(_){ }
try{eliteIndex=function(f){return encounterIndex(f,'elite');};}catch(_){ }
try{if(typeof ELITE_DEFS!=='undefined')eliteFor=function(f){return ELITE_DEFS[encounterIndex(f,'elite')%ELITE_DEFS.length];};}catch(_){ }
try{if(typeof BOSS_DEFS!=='undefined')bossFor=function(f){return BOSS_DEFS[encounterIndex(f,'boss')%BOSS_DEFS.length];};}catch(_){ }
try{campaignWaveCount=function(f){return waveCount(f);};campaignWaveCount.__srCampaign800V322=true;}catch(_){ }

function compactStageTrack(floor){
  floor=clampFloor(floor);var meta=campaignMeta(floor),count=waveCount(floor),step=1;
  try{if(combat&&combat.ctx==='campaign'&&Number(combat.floor)===floor)step=Math.floor(Number(combat.step)||1);}catch(_){ }
  step=Math.max(1,Math.min(count,step));var h='';
  for(var i=1;i<=count;i++){
    if(i>1)h+='<i class="'+(i<=step?'on':'')+'"></i>';
    var cls='sdot srStageMiniDot';if(meta.isBoss)cls+=' boss';else if(meta.isElite&&i===count)cls+=' elite';if(i<step)cls+=' on';if(i===step)cls+=' cur';
    var icon='';try{if(meta.isBoss&&typeof MINI_SKULL!=='undefined')icon=MINI_SKULL;}catch(_){ }
    h+='<span class="'+cls+'" data-stage-step="'+i+'" data-stage-total="'+count+'">'+icon+'</span>';
  }return h;
}
window.__srCompactStageTrackHTMLV322=compactStageTrack;
try{floorTrack=function(f){return compactStageTrack(f);};floorTrack.__srCampaign800V322=true;}catch(_){ }

/* Preserve the validated 1..400 power curve semantically by stretching it over
   the new 1..800 campaign. Endgame strength is unchanged; pacing is smoother. */
var BOSS={5:500,10:2000,20:20000,30:180000,40:3000000,50:20000000,60:80000000,70:180000000,80:350000000,90:600000000,100:800000000,110:1000000000,120:1200000000,130:2200000000,140:4000000000,150:7000000000,200:30000000000,250:120000000000,300:480000000000,350:1800000000000,400:6000000000000};
var NORMAL={1:22,10:300,20:5000,30:50000,40:400000,50:2000000,60:6000000,70:15000000,80:30000000,100:80000000,120:180000000,150:550000000,200:2200000000,250:8000000000,300:28000000000,350:95000000000,400:320000000000};
var DAMAGE={1:2,10:50,20:300,30:1500,40:2000,50:50000,60:300000,70:1500000,80:6000000,90:10000000,100:15000000,110:20000000,120:26000000,130:32000000,140:38000000,150:38000000,200:90000000,250:210000000,300:480000000,350:1050000000,400:2300000000};
function semanticLegacyFloor(f){return 1+(clampFloor(f)-1)*(LEGACY_MAX-1)/(CAMPAIGN_MAX-1);}
function logInterp(table,f){var ks=Object.keys(table).map(Number).sort(function(a,b){return a-b;});if(f<=ks[0])return table[ks[0]];for(var i=1;i<ks.length;i++)if(f<=ks[i]){var a=ks[i-1],b=ks[i],t=(f-a)/(b-a);return Math.max(1,Math.round(Math.exp(Math.log(table[a])+(Math.log(table[b])-Math.log(table[a]))*t)));}return table[ks[ks.length-1]];}
window.__srV322EnemyHP=function(f){return logInterp(NORMAL,semanticLegacyFloor(f));};
window.__srV322BossHP=function(f){return logInterp(BOSS,semanticLegacyFloor(f));};
window.__srV322EnemyDamage=function(f){return logInterp(DAMAGE,semanticLegacyFloor(f));};
window.__srV285EnemyHP=window.__srV322EnemyHP;
window.__srV285BossHP=window.__srV322BossHP;
window.__srV289EnemyDamage=window.__srV322EnemyDamage;
try{enemyHP=window.__srV322EnemyHP;}catch(_){ }
try{enemyDamage=window.__srV322EnemyDamage;}catch(_){ }

function migrateLegacyFloor(v){
  v=Math.max(1,Math.floor(Number(v)||1));if(v>LEGACY_MAX)return Math.min(CAMPAIGN_MAX,v);
  var di=Math.min(7,Math.floor((v-1)/50)),within=((v-1)%50)+1;
  return di*100+Math.min(100,((within-1)*2)+1);
}
function migrateCampaignState(){
  try{
    if(typeof S==='undefined'||!S)return;
    S.migrations=S.migrations||{};
    if(!S.migrations.campaign800V322){
      ['floor','recordFloor','checkpoint'].forEach(function(k){if(Number(S[k])>0)S[k]=migrateLegacyFloor(S[k]);});
      if(Number(S.pendingBossFloor)>0)S.pendingBossFloor=migrateLegacyFloor(S.pendingBossFloor);
      S.migrations.campaign800V322=true;
      if(S.campaignComplete400){S.campaignComplete800=true;S.floor=CAMPAIGN_MAX;S.recordFloor=CAMPAIGN_MAX;S.checkpoint=CAMPAIGN_MAX;}
      try{if(typeof saveNow==='function')saveNow();}catch(_){ }
    }
    S.floor=clampFloor(S.floor);S.recordFloor=clampFloor(S.recordFloor);S.checkpoint=clampFloor(S.checkpoint);
    var maxStep=waveCount(S.floor);if((Number(S.step)||1)>maxStep)S.step=maxStep;
  }catch(_){ }
}
migrateCampaignState();

/* Replace V285 wrappers with the preserved core owners so floor 400 is no longer
   treated as campaign completion. Reapply only the V315/V321 behavior needed by
   the current campaign. */
try{
  var coreStart=(startCampaign&&startCampaign.__srPrevious)||startCampaign;
  if(typeof coreStart==='function'){
    startCampaign=function(){migrateCampaignState();var out=coreStart.apply(this,arguments);try{if(combat&&typeof window.__srApplyForgeIntroCombatV321==='function'&&window.__srApplyForgeIntroCombatV321(combat)&&typeof drawArena==='function')drawArena();}catch(_){ }return out;};
    startCampaign.__srCampaign800V322=true;startCampaign.__srPrevious=coreStart;
  }
}catch(_){ }
try{
  var coreEnd=(handleCombatEnd&&handleCombatEnd.__srPrevious)||handleCombatEnd;
  if(typeof coreEnd==='function'){
    handleCombatEnd=function(c){
      var won=!!(c&&c.ctx==='campaign'&&c.status==='won'),introLoss=!!(c&&c.__srForgeIntroV321&&c.ctx==='campaign'&&c.status==='lost'),actualStep=null;
      if(introLoss){try{S.tutorial=S.tutorial||{};S.tutorial.seen=S.tutorial.seen||{};S.tutorial.forgeIntroReadyV321=true;S.tutorial.forgeIntroDefeatsV321=Math.max(0,Number(S.tutorial.forgeIntroDefeatsV321)||0)+1;if(typeof saveNow==='function')saveNow();}catch(_){ }}
      try{if(won&&Number(c.step)>=waveCount(c.floor)&&Number(c.step)<Number(RULES.STEPS_PER_FLOOR)){actualStep=c.step;c.step=RULES.STEPS_PER_FLOOR;}}catch(_){ }
      var finalWin=!!(won&&Number(c.floor)>=CAMPAIGN_MAX),out=coreEnd.apply(this,arguments);if(actualStep!==null)c.step=actualStep;
      if(finalWin){try{S.floor=CAMPAIGN_MAX;S.step=1;S.recordFloor=CAMPAIGN_MAX;S.checkpoint=CAMPAIGN_MAX;S.pendingBossFloor=0;S.campaignComplete800=true;S.campaignCompletedAt800=S.campaignCompletedAt800||Date.now();if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }}
      if(introLoss){try{if(typeof checkTutorial==='function')setTimeout(checkTutorial,90);}catch(_){ }}return out;
    };
    handleCombatEnd.__srCampaign800V322=true;handleCombatEnd.__srPrevious=coreEnd;
  }
}catch(_){ }

/* Paid Familiar summon: add 25 Essence per paid invocation on top of the core
   25-Essence charge. The core summon function remains responsible for tree
   Double Œuf extras, so free bonus eggs never receive an extra charge. */
try{
  if(typeof ACT!=='undefined'&&ACT&&typeof ACT.summonEgg==='function'&&!ACT.summonEgg.__srV322){
    var oldSummonEggAction=ACT.summonEgg;
    ACT.summonEgg=function(a){
      var n=Math.max(1,Math.floor(Number(a)||1));
      if(!S||Number(S.essence)<PAID_FAMILIAR_COST*n){try{toast('Essence insuffisante');}catch(_){ }return;}
      try{update(function(s){s.essence=Math.max(0,Number(s.essence||0)-EXTRA_FAMILIAR_COST*n);});}catch(_){return oldSummonEggAction.apply(this,arguments);}
      return oldSummonEggAction.apply(this,arguments);
    };
    ACT.summonEgg.__srV322=true;ACT.summonEgg.__srPrevious=oldSummonEggAction;
  }
}catch(_){ }

/* Familiar renderer text is corrected without observing the DOM. V309 already
   owns bounded async renderer recovery; this wrapper composes with that owner. */
function patchFamiliarCostUI(){
  try{
    if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.familiers!=='function')return false;
    var cur=SCREENS.familiers;if(cur.__srSummonCostV322)return false;var base=cur;
    var wrapped=function(){var html=String(base.apply(this,arguments));html=html.replace(/Invoquer · 25/g,'Invoquer · 50').replace(/x10 · 250/g,'x10 · 500');return html;};
    wrapped.__srSummonCostV322=true;wrapped.__srPrevious=base;SCREENS.familiers=wrapped;return true;
  }catch(_){return false;}
}
[0,60,180,420,900,1600,2600,3800].forEach(function(ms){setTimeout(function(){if(patchFamiliarCostUI()){try{if(route==='familiers'&&typeof scheduleRender==='function')scheduleRender();}catch(_){ }}},ms);});
patchFamiliarCostUI();

window.__srProgressionCampaignConfigV322={maxFloor:800,difficulties:DIFFICULTIES,chaptersPerDifficulty:5,stagesPerChapter:20,totalStages:800,paidFamiliarCost:50,legacyMigration:true,firstDifficultyLabel:'Facile',preservesFreeDoubleEgg:true};
})();
