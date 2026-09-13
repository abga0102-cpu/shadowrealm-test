/* SHADOWREACH V285 · Combat progression authority
   V316 campaign structure: canonical 400-stage campaign with local visible
   chapter numbering per difficulty and Forge-Master-like encounter pacing.
   Visible chapter numbers are derived from each difficulty's real length and
   are not capped at 5. Internal floor ids 1..400 remain stable for saves and
   balancing. Every 10-stage chapter uses the approved rhythm:
   N/N/N, N/N/N, N/N/N, N/Elite, Boss, then repeat for stages 6..10.
   Fixed enemy scaling never derives from current player power. */
(function(){
'use strict';
if(window.__srCombatProgressionV285)return;
window.__srCombatProgressionV285=true;
window.__srCampaign400V314=true;
window.__srLocalStageNotationV315=true;
window.__srCompactStageTrackV315=true;
window.__srForgeMasterStageFlowV316=true;

var CAMPAIGN_MAX=400;
var DIFFICULTIES=[
  {id:'normal',label:'Normal',start:1,end:50},
  {id:'difficile',label:'Difficile',start:51,end:100},
  {id:'expert',label:'Expert',start:101,end:150},
  {id:'cauchemar',label:'Cauchemar',start:151,end:200},
  {id:'infernal',label:'Infernal',start:201,end:250},
  {id:'abyssal',label:'Abyssal',start:251,end:300},
  {id:'immortel',label:'Immortel',start:301,end:350},
  {id:'divin',label:'Divin',start:351,end:400}
];

function clampFloor(f){f=Math.floor(Number(f)||1);return Math.max(1,Math.min(CAMPAIGN_MAX,f));}
function difficultyIndexForFloor(floor){
  for(var i=0;i<DIFFICULTIES.length;i++)if(floor>=DIFFICULTIES[i].start&&floor<=DIFFICULTIES[i].end)return i;
  return Math.max(0,DIFFICULTIES.length-1);
}
function stageKindFromStage(stage){
  stage=Math.max(1,Math.min(10,Math.floor(Number(stage)||1)));
  if(stage===5||stage===10)return 'boss';
  if(stage===4||stage===9)return 'elite';
  return 'normal';
}
function campaignMeta(f){
  var floor=clampFloor(f),di=difficultyIndexForFloor(floor);
  var diff=DIFFICULTIES[di],within=floor-diff.start+1;
  var globalChapter=Math.floor((floor-1)/10)+1,stage=(within-1)%10+1;
  var difficultyChapter=Math.floor((within-1)/10)+1,stageCode=difficultyChapter+'-'+stage;
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

/* Real encounter authority. A chapter is two identical five-stage beats:
   1/2/3 normal x3, 4 normal+elite, 5 boss; then 6/7/8, 9, 10. */
var STAGE_WAVES=[3,3,3,2,1,3,3,3,2,1];
function stageWaveCount(f){
  var stage=campaignMeta(f).stage;
  return STAGE_WAVES[Math.max(0,Math.min(9,stage-1))]||1;
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

/* Replace legacy 5/10 classification with the approved local-stage cadence.
   RULES.BOSS_EVERY remains 10 because it still defines chapter length elsewhere. */
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
  }
}catch(_){ }

/* Current-stage track only: normal stages = 3 normal dots; elite stages =
   normal dot then elite dot; boss stages = one boss dot. */
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
window.__srStageMiniTrackV316=compactStageTrack;
try{
  if(typeof floorTrack==='function'){
    floorTrack=function(floor){return compactStageTrack(floor);};
    floorTrack.__srCompactStageTrackV315=true;
    floorTrack.__srForgeMasterStageFlowV316=true;
  }
}catch(_){ }

/* Existing progression anchors stay intact; a first mid-chapter Boss anchor is
   added at internal floor 5 so the new first Boss does not inherit floor-10 HP. */
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
window.__srV285EnemyHP=function(f){return logInterp(NORMAL,clampFloor(f));};
window.__srV285BossHP=function(f){f=clampFloor(f);return logInterp(BOSS,f);};
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

/* Preserve old saves and clamp a former 3-wave step when that save now lands on
   a 1- or 2-encounter stage. No floor, record or reward history is erased. */
function normalizeCampaignState(){
  try{
    if(typeof S==='undefined'||!S)return;
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
  if(typeof startCampaign==='function'&&!startCampaign.__srCampaign400V314){
    var oldStartCampaign=startCampaign;
    startCampaign=function(){normalizeCampaignState();return oldStartCampaign.apply(this,arguments);};
    startCampaign.__srCampaign400V314=true;
    startCampaign.__srPrevious=oldStartCampaign;
  }
}catch(_){ }
try{
  if(typeof handleCombatEnd==='function'&&!handleCombatEnd.__srCampaign400V314){
    var oldHandleCombatEnd=handleCombatEnd;
    handleCombatEnd=function(c){
      var won=!!(c&&c.ctx==='campaign'&&c.status==='won');
      var actualStep=null;
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
            S.campaignComplete400=true;S.campaignCompletedAt=S.campaignCompletedAt||Date.now();
            if(typeof saveNow==='function')saveNow();
            if(typeof scheduleRender==='function')scheduleRender();
          }
        }catch(_){ }
      }
      return out;
    };
    handleCombatEnd.__srCampaign400V314=true;
    handleCombatEnd.__srForgeMasterStageFlowV316=true;
    handleCombatEnd.__srPrevious=oldHandleCombatEnd;
  }
}catch(_){ }

function decorateArenaLabel(){
  try{
    if(typeof arenaNodes==='undefined'||!arenaNodes||!arenaNodes.label||arenaNodes.label.__srCampaign400Proxy)return;
    var node=arenaNodes.label;
    if(!node||!node.nodeType)return;
    var raw=String(node.textContent||'');
    var proxy={__srCampaign400Proxy:true};
    Object.defineProperty(proxy,'textContent',{
      configurable:false,enumerable:true,
      get:function(){return raw;},
      set:function(v){
        raw=String(v==null?'':v);
        try{if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign')node.textContent=campaignMeta(combat.floor).label;else node.textContent=raw;}catch(_){node.textContent=raw;}
      }
    });
    arenaNodes.label=proxy;
    if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign')node.textContent=campaignMeta(combat.floor).label;
  }catch(_){ }
}
try{
  if(typeof mountArena==='function'&&!mountArena.__srCampaign400V314){
    var oldMountArena=mountArena;
    mountArena=function(){var out=oldMountArena.apply(this,arguments);decorateArenaLabel();return out;};
    mountArena.__srCampaign400V314=true;
    mountArena.__srPrevious=oldMountArena;
  }
}catch(_){ }
decorateArenaLabel();

function syncStageWavePill(){
  try{
    if(typeof combat==='undefined'||!combat||combat.ctx!=='campaign'||typeof arenaNodes==='undefined'||!arenaNodes||!arenaNodes.sub)return;
    var pill=arenaNodes.sub.querySelector('.fPill');
    if(!pill)return;
    var wanted='Vague '+Math.max(1,Number(combat.step)||1)+'/'+stageWaveCount(combat.floor);
    if(String(pill.textContent||'').trim()===wanted)return;
    var icon='';try{if(typeof ic==='function')icon=ic('swords',10);}catch(_){ }
    pill.innerHTML=icon+wanted;
  }catch(_){ }
}
try{
  if(typeof drawArena==='function'&&!drawArena.__srCampaignStageNotationV314){
    var oldDrawArena=drawArena;
    drawArena=function(){
      var out=oldDrawArena.apply(this,arguments);
      syncStageWavePill();
      try{
        if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign'&&typeof arenaNodes!=='undefined'&&arenaNodes&&arenaNodes.banner&&typeof floorFlash!=='undefined'&&floorFlash&&Date.now()<floorFlash.until&&combat.status!=='lost'){
          arenaNodes.banner.textContent='ÉTAGE '+campaignMeta(floorFlash.floor).stageCode;
        }
      }catch(_){ }
      return out;
    };
    drawArena.__srCampaignStageNotationV314=true;
    drawArena.__srForgeMasterStageFlowV316=true;
    drawArena.__srPrevious=oldDrawArena;
  }
}catch(_){ }

var CHAPTER_COUNTS=DIFFICULTIES.map(function(d){return Math.ceil(Math.max(0,d.end-d.start+1)/10);});
window.__srCombatProgressionConfigV285={
  bossHP:BOSS,normalHP:NORMAL,maxFloor:CAMPAIGN_MAX,difficulties:DIFFICULTIES,
  chaptersPerDifficulty:CHAPTER_COUNTS[0],chapterCounts:CHAPTER_COUNTS,
  floorsPerChapter:10,totalChapters:Math.ceil(CAMPAIGN_MAX/10),campaignMeta:campaignMeta,
  stageWavePattern:STAGE_WAVES.slice(),stageWaveCount:stageWaveCount
};
})();
