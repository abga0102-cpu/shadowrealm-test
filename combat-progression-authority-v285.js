/* SHADOWREACH V285 · Combat progression authority
   V322 campaign structure: 8 difficulties × 5 chapters × 20 stages = 800
   internal stages. Stage labels restart at 1-1 for each difficulty and the
   first difficulty is now Facile while keeping compatibility id `normal`.
   V321 keeps its onboarding-only loss at visible stage 1-2 before the first
   Forge craft, then restores the exact normal campaign balance after crafting.
   The validated former 1..400 power curve is stretched semantically over
   1..800, preserving endgame strength while smoothing campaign pacing. */
(function(){
'use strict';
if(window.__srCombatProgressionV285)return;
window.__srCombatProgressionV285=true;
window.__srCampaign400V314=true; /* compatibility marker retained for old contracts */
window.__srCampaign800V322=true;
window.__srLocalStageNotationV315=true;
window.__srCompactStageTrackV315=true;
window.__srForgeMasterStageFlowV316=true;
window.__srForgeIntroCombatV321=true;

var CAMPAIGN_MAX=800;
var LEGACY_CAMPAIGN_MAX=400;
var FORGE_INTRO_FLOOR_V321=2;
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

function clampFloor(f){f=Math.floor(Number(f)||1);return Math.max(1,Math.min(CAMPAIGN_MAX,f));}
function difficultyIndexForFloor(floor){
  for(var i=0;i<DIFFICULTIES.length;i++)if(floor>=DIFFICULTIES[i].start&&floor<=DIFFICULTIES[i].end)return i;
  return Math.max(0,DIFFICULTIES.length-1);
}
function stageKindFromStage(stage){
  stage=Math.max(1,Math.min(20,Math.floor(Number(stage)||1)));
  var beat=((stage-1)%5)+1;
  if(beat===5)return 'boss';
  if(beat===4)return 'elite';
  return 'normal';
}
function campaignMeta(f){
  var floor=clampFloor(f),di=difficultyIndexForFloor(floor);
  var diff=DIFFICULTIES[di],within=floor-diff.start+1;
  var globalChapter=Math.floor((floor-1)/20)+1,stage=(within-1)%20+1;
  var difficultyChapter=Math.floor((within-1)/20)+1,stageCode=difficultyChapter+'-'+stage;
  var kind=stageKindFromStage(stage);
  return {
    floor:floor,maxFloor:CAMPAIGN_MAX,difficultyIndex:di,difficultyId:diff.id,difficulty:diff.label,
    difficultyFloor:within,difficultyChapter:difficultyChapter,chapter:difficultyChapter,globalChapter:globalChapter,
    stage:stage,stageCode:stageCode,kind:kind,isBoss:kind==='boss',isElite:kind==='elite',
    label:diff.label+' · '+stageCode
  };
}
window.__srCampaignMaxFloor=CAMPAIGN_MAX;
window.__srCampaignDifficulties=DIFFICULTIES.slice();
window.__srCampaignMeta=campaignMeta;
window.__srCampaignLabel=function(f){return campaignMeta(f).label;};
window.__srCampaignStageLabel=function(f){return campaignMeta(f).stageCode;};
window.__srCampaignStageKindV316=function(f){return campaignMeta(f).kind;};
window.__srCampaignStageKindV322=function(f){return campaignMeta(f).kind;};

/* Twenty-stage chapters preserve the approved five-stage encounter beat four
   times: N/N/N, N/Elite, Boss. */
var STAGE_WAVES=[3,3,3,2,1,3,3,3,2,1,3,3,3,2,1,3,3,3,2,1];
function stageWaveCount(f){
  var stage=campaignMeta(f).stage;
  return STAGE_WAVES[Math.max(0,Math.min(19,stage-1))]||1;
}
function campaignIsBoss(f){return campaignMeta(f).kind==='boss';}
function campaignIsElite(f){return campaignMeta(f).kind==='elite';}
function encounterIndex(f,kind){
  var floor=clampFloor(f),n=0;
  for(var i=1;i<=floor;i++)if(campaignMeta(i).kind===kind)n++;
  return Math.max(0,n-1);
}
window.__srCampaignWavePatternV315=STAGE_WAVES.slice();
window.__srCampaignWaveCountV315=stageWaveCount;
window.__srCampaignWavePatternV316=STAGE_WAVES.slice();
window.__srCampaignWaveCountV316=stageWaveCount;
window.__srCampaignWavePatternV322=STAGE_WAVES.slice();
window.__srCampaignWaveCountV322=stageWaveCount;

try{if(typeof isBoss==='function')isBoss=function(f){return campaignIsBoss(f);};}catch(_){ }
try{if(typeof isElite==='function')isElite=function(f){return campaignIsElite(f);};}catch(_){ }
try{
  if(typeof eliteIndex==='function')eliteIndex=function(f){return encounterIndex(f,'elite');};
  if(typeof eliteFor==='function'&&typeof ELITE_DEFS!=='undefined')eliteFor=function(f){return ELITE_DEFS[encounterIndex(f,'elite')%ELITE_DEFS.length];};
  if(typeof bossFor==='function'&&typeof BOSS_DEFS!=='undefined')bossFor=function(f){return BOSS_DEFS[encounterIndex(f,'boss')%BOSS_DEFS.length];};
}catch(_){ }
try{
  if(typeof campaignWaveCount==='function'){
    campaignWaveCount=function(f){return stageWaveCount(f);};
    campaignWaveCount.__srCompactStageTrackV315=true;
    campaignWaveCount.__srForgeMasterStageFlowV316=true;
    campaignWaveCount.__srCampaign800V322=true;
  }
}catch(_){ }

function compactStageTrack(floor){
  floor=clampFloor(floor);
  var meta=campaignMeta(floor),count=stageWaveCount(floor),step=1;
  try{if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign'&&Number(combat.floor)===floor)step=Math.floor(Number(combat.step)||1);}catch(_){ }
  step=Math.max(1,Math.min(count,step));
  var h='';
  for(var i=1;i<=count;i++){
    if(i>1)h+='<i class="'+(i<=step?'on':'')+'"></i>';
    var cls='sdot srStageMiniDot';
    if(meta.isBoss)cls+=' boss';
    else if(meta.isElite&&i===count)cls+=' elite';
    if(i<step)cls+=' on';
    if(i===step)cls+=' cur';
    var icon='';
    try{if(meta.isBoss&&typeof MINI_SKULL!=='undefined')icon=MINI_SKULL;}catch(_){ }
    h+='<span class="'+cls+'" data-stage-step="'+i+'" data-stage-total="'+count+'">'+icon+'</span>';
  }
  return h;
}
window.__srCompactStageTrackHTMLV315=compactStageTrack;
window.__srCompactStageTrackHTMLV322=compactStageTrack;
window.__srStageMiniTrackV316=compactStageTrack;
try{
  if(typeof floorTrack==='function'){
    floorTrack=function(floor){return compactStageTrack(floor);};
    floorTrack.__srCompactStageTrackV315=true;
    floorTrack.__srForgeMasterStageFlowV316=true;
    floorTrack.__srCampaign800V322=true;
  }
}catch(_){ }

/* Existing 1..400 anchors are the semantic balance authority. Mapping 1..800
   onto that curve preserves the old endpoint and every difficulty power band. */
var BOSS={
  5:500,10:2000,20:20000,30:180000,40:3000000,50:20000000,
  60:80000000,70:180000000,80:350000000,90:600000000,
  100:800000000,110:1000000000,120:1200000000,130:2200000000,
  140:4000000000,150:7000000000,
  200:30000000000,250:120000000000,300:480000000000,
  350:1800000000000,400:6000000000000
};
var NORMAL={
  1:22,10:300,20:5000,30:50000,40:400000,50:2000000,
  60:6000000,70:15000000,80:30000000,100:80000000,
  120:180000000,150:550000000,
  200:2200000000,250:8000000000,300:28000000000,
  350:95000000000,400:320000000000
};
function semanticLegacyFloor(f){return 1+(clampFloor(f)-1)*(LEGACY_CAMPAIGN_MAX-1)/(CAMPAIGN_MAX-1);}
function logInterp(table,f){
  var ks=Object.keys(table).map(Number).sort(function(a,b){return a-b;});
  if(f<=ks[0])return table[ks[0]];
  for(var i=1;i<ks.length;i++){
    if(f<=ks[i]){
      var a=ks[i-1],b=ks[i],t=(f-a)/(b-a);
      return Math.round(Math.exp(Math.log(table[a])+(Math.log(table[b])-Math.log(table[a]))*t));
    }
  }
  return table[ks[ks.length-1]];
}
window.__srV285EnemyHP=function(f){return logInterp(NORMAL,semanticLegacyFloor(f));};
window.__srV285BossHP=function(f){return logInterp(BOSS,semanticLegacyFloor(f));};
try{if(typeof enemyHP==='function')enemyHP=window.__srV285EnemyHP;}catch(_){ }

try{
  if(typeof campaignBossStatMul==='function'){
    var oldBossStatMul=campaignBossStatMul;
    campaignBossStatMul=function(f){
      var base=window.__srV285EnemyHP(f),target=window.__srV285BossHP(f),o=oldBossStatMul(f),hp=base>0?target/base:1;
      if(o&&typeof o==='object'){
        o=Object.assign({},o);
        if('hp' in o)o.hp=hp;
        if('hpMul' in o)o.hpMul=hp;
        return o;
      }
      return hp;
    };
  }
}catch(_){ }

function forgeIntroCraftedV321(s){try{return Math.max(0,Number(s&&s.forge&&s.forge.summonCount)||0)>0;}catch(_){return false;}}
function forgeIntroEligibleV321(s){
  if(!s||forgeIntroCraftedV321(s))return false;
  var highest=Math.max(Number(s.floor)||1,Number(s.recordFloor)||1,Number(s.checkpoint)||1);
  return highest<=FORGE_INTRO_FLOOR_V321;
}
function applyForgeIntroCombatV321(c){
  if(!c||c.ctx!=='campaign'||Number(c.floor)!==FORGE_INTRO_FLOOR_V321)return false;
  var s=null;try{s=typeof S!=='undefined'?S:null;}catch(_){ }
  if(!forgeIntroEligibleV321(s))return false;
  var heroHP=Math.max(1,Number(c.heroMaxHP)||Number(c.heroHP)||1),enemies=Array.isArray(c.enemies)?c.enemies:[];
  c.__srForgeIntroV321=true;
  enemies.forEach(function(e){
    if(!e)return;
    e.maxHP=Math.max(Number(e.maxHP)||1,Math.ceil(heroHP*1000));
    e.hp=e.maxHP;
    e.dmg=Math.max(Number(e.dmg)||1,Math.ceil(heroHP*20));
    e.__srForgeIntroV321=true;
  });
  return enemies.length>0;
}
window.__srNeedsForgeIntroV321=forgeIntroEligibleV321;
window.__srApplyForgeIntroCombatV321=applyForgeIntroCombatV321;
window.__srForgeIntroCombatConfigV321={floor:FORGE_INTRO_FLOOR_V321,stage:'1-2',hpVsHero:1000,damageVsHero:20};

/* One-time migration preserves each legacy difficulty and position within it:
   legacy 1..50 becomes the same difficulty's odd positions 1..99. Completed
   400-stage saves become fully completed 800-stage saves. */
function migrateLegacyFloor(v){
  v=Math.max(1,Math.floor(Number(v)||1));
  if(v>LEGACY_CAMPAIGN_MAX)return Math.min(CAMPAIGN_MAX,v);
  var di=Math.min(7,Math.floor((v-1)/50)),within=((v-1)%50)+1;
  return di*100+Math.min(100,((within-1)*2)+1);
}
function normalizeCampaignState(){
  try{
    if(typeof S==='undefined'||!S)return;
    S.migrations=S.migrations||{};
    if(!S.migrations.campaign800V322){
      var legacyComplete=!!S.campaignComplete400;
      ['floor','recordFloor','checkpoint'].forEach(function(k){if(Number(S[k])>0)S[k]=migrateLegacyFloor(S[k]);});
      if(Number(S.pendingBossFloor)>0)S.pendingBossFloor=migrateLegacyFloor(S.pendingBossFloor);
      if(legacyComplete){
        S.floor=CAMPAIGN_MAX;S.recordFloor=CAMPAIGN_MAX;S.checkpoint=CAMPAIGN_MAX;S.pendingBossFloor=0;
        S.campaignComplete800=true;S.campaignCompletedAt800=S.campaignCompletedAt800||S.campaignCompletedAt||Date.now();
      }
      S.migrations.campaign800V322=true;
      try{if(typeof saveNow==='function')saveNow();}catch(_){ }
    }
    var highest=Math.max(Number(S.floor)||1,Number(S.recordFloor)||1,Number(S.checkpoint)||1);
    if(highest>CAMPAIGN_MAX)S.legacyCampaignRecord=Math.max(Number(S.legacyCampaignRecord)||0,highest);
    if((Number(S.floor)||1)>CAMPAIGN_MAX)S.floor=CAMPAIGN_MAX;
    if((Number(S.recordFloor)||1)>CAMPAIGN_MAX)S.recordFloor=CAMPAIGN_MAX;
    if((Number(S.checkpoint)||1)>CAMPAIGN_MAX)S.checkpoint=CAMPAIGN_MAX;
    if((Number(S.pendingBossFloor)||0)>CAMPAIGN_MAX)S.pendingBossFloor=0;
    var maxStep=stageWaveCount(S.floor);
    if((Number(S.step)||1)>maxStep)S.step=maxStep;
  }catch(_){ }
}
normalizeCampaignState();

try{
  if(typeof startCampaign==='function'&&!startCampaign.__srCampaign800V322){
    var oldStartCampaign=startCampaign;
    startCampaign=function(){
      normalizeCampaignState();
      var out=oldStartCampaign.apply(this,arguments);
      try{if(typeof combat!=='undefined'&&applyForgeIntroCombatV321(combat)&&typeof drawArena==='function')drawArena();}catch(_){ }
      return out;
    };
    startCampaign.__srCampaign400V314=true;
    startCampaign.__srCampaign800V322=true;
    startCampaign.__srForgeIntroV321=true;
    startCampaign.__srPrevious=oldStartCampaign;
  }
}catch(_){ }
try{
  if(typeof handleCombatEnd==='function'&&!handleCombatEnd.__srCampaign800V322){
    var oldHandleCombatEnd=handleCombatEnd;
    handleCombatEnd=function(c){
      var won=!!(c&&c.ctx==='campaign'&&c.status==='won');
      var forgeIntroLoss=!!(c&&c.__srForgeIntroV321&&c.ctx==='campaign'&&c.status==='lost');
      var actualStep=null;
      if(forgeIntroLoss){
        try{
          if(typeof S!=='undefined'&&S){
            S.tutorial=S.tutorial||{};S.tutorial.seen=S.tutorial.seen||{};
            S.tutorial.forgeIntroReadyV321=true;
            S.tutorial.forgeIntroDefeatsV321=Math.max(0,Number(S.tutorial.forgeIntroDefeatsV321)||0)+1;
            if(typeof saveNow==='function')saveNow();
          }
        }catch(_){ }
      }
      try{
        if(won&&Number(c.step)>=stageWaveCount(c.floor)&&Number(c.step)<Number(RULES.STEPS_PER_FLOOR)){
          actualStep=c.step;c.step=RULES.STEPS_PER_FLOOR;
        }
      }catch(_){ }
      var finalWin=!!(won&&Number(c.floor)>=CAMPAIGN_MAX);
      var out=oldHandleCombatEnd.apply(this,arguments);
      if(actualStep!==null)c.step=actualStep;
      if(finalWin){
        try{
          if(typeof S!=='undefined'&&S){
            S.floor=CAMPAIGN_MAX;S.step=1;S.recordFloor=CAMPAIGN_MAX;S.checkpoint=CAMPAIGN_MAX;S.pendingBossFloor=0;
            S.campaignComplete800=true;S.campaignCompletedAt800=S.campaignCompletedAt800||Date.now();
            if(typeof saveNow==='function')saveNow();
            if(typeof scheduleRender==='function')scheduleRender();
          }
        }catch(_){ }
      }
      if(forgeIntroLoss){try{if(typeof checkTutorial==='function')setTimeout(checkTutorial,90);}catch(_){ }}
      return out;
    };
    handleCombatEnd.__srCampaign400V314=true;
    handleCombatEnd.__srCampaign800V322=true;
    handleCombatEnd.__srForgeMasterStageFlowV316=true;
    handleCombatEnd.__srForgeIntroV321=true;
    handleCombatEnd.__srPrevious=oldHandleCombatEnd;
  }
}catch(_){ }

function decorateArenaLabel(){
  try{
    if(typeof arenaNodes==='undefined'||!arenaNodes||!arenaNodes.label||arenaNodes.label.__srCampaign400Proxy)return;
    var node=arenaNodes.label;if(!node||!node.nodeType)return;var raw=String(node.textContent||'');var proxy={__srCampaign400Proxy:true};
    Object.defineProperty(proxy,'textContent',{configurable:false,enumerable:true,get:function(){return raw;},set:function(v){raw=String(v==null?'':v);try{if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign')node.textContent=campaignMeta(combat.floor).label;else node.textContent=raw;}catch(_){node.textContent=raw;}}});
    arenaNodes.label=proxy;if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign')node.textContent=campaignMeta(combat.floor).label;
  }catch(_){ }
}
try{
  if(typeof mountArena==='function'&&!mountArena.__srCampaign800V322){
    var oldMountArena=mountArena;
    mountArena=function(){var out=oldMountArena.apply(this,arguments);decorateArenaLabel();return out;};
    mountArena.__srCampaign400V314=true;mountArena.__srCampaign800V322=true;mountArena.__srPrevious=oldMountArena;
  }
}catch(_){ }
decorateArenaLabel();

function syncStageWavePill(){
  try{
    if(typeof combat==='undefined'||!combat||combat.ctx!=='campaign'||typeof arenaNodes==='undefined'||!arenaNodes||!arenaNodes.sub)return;
    var pill=arenaNodes.sub.querySelector('.fPill');if(!pill)return;
    var wanted='Vague '+Math.max(1,Number(combat.step)||1)+'/'+stageWaveCount(combat.floor);
    if(String(pill.textContent||'').trim()===wanted)return;
    var icon='';try{if(typeof ic==='function')icon=ic('swords',10);}catch(_){ }
    pill.innerHTML=icon+wanted;
  }catch(_){ }
}
try{
  if(typeof drawArena==='function'&&!drawArena.__srCampaignStageNotationV322){
    var oldDrawArena=drawArena;
    drawArena=function(){
      var out=oldDrawArena.apply(this,arguments);syncStageWavePill();
      try{if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign'&&typeof arenaNodes!=='undefined'&&arenaNodes&&arenaNodes.banner&&typeof floorFlash!=='undefined'&&floorFlash&&Date.now()<floorFlash.until&&combat.status!=='lost')arenaNodes.banner.textContent='ÉTAGE '+campaignMeta(floorFlash.floor).stageCode;}catch(_){ }
      return out;
    };
    drawArena.__srCampaignStageNotationV314=true;drawArena.__srCampaignStageNotationV322=true;drawArena.__srForgeMasterStageFlowV316=true;drawArena.__srPrevious=oldDrawArena;
  }
}catch(_){ }

var CHAPTER_COUNTS=DIFFICULTIES.map(function(d){return Math.ceil(Math.max(0,d.end-d.start+1)/20);});
window.__srCombatProgressionConfigV285={
  bossHP:BOSS,normalHP:NORMAL,maxFloor:CAMPAIGN_MAX,difficulties:DIFFICULTIES,
  chaptersPerDifficulty:5,chapterCounts:CHAPTER_COUNTS,floorsPerChapter:20,totalChapters:40,
  campaignMeta:campaignMeta,stageWavePattern:STAGE_WAVES.slice(),stageWaveCount:stageWaveCount,
  legacyMaxFloor:LEGACY_CAMPAIGN_MAX,migrateLegacyFloor:migrateLegacyFloor,forgeIntroV321:window.__srForgeIntroCombatConfigV321
};
window.__srProgressionCampaignConfigV322={maxFloor:800,difficulties:DIFFICULTIES,chaptersPerDifficulty:5,stagesPerChapter:20,totalStages:800,firstDifficultyLabel:'Facile',legacyMigration:true};
})();