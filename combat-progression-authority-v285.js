/* SHADOWREACH V285 · Combat progression authority
   V314 extension: canonical 400-stage campaign structure.
   V316: each campaign stage owns its own compact encounter track instead of
   showing the whole 10-stage chapter at once. The approved encounter pattern is
   3,3,3,2,1,3,3,3,2,1 for stages 1..10; elite stage 5 and boss stage 10 are
   single encounters. Internal floor ids remain unchanged for saves/balancing.
   Fixed campaign curve calibrated against weak/normal/max 0★/Ascension builds.
   Never scales enemies from current player power. */
(function(){
'use strict';
if(window.__srCombatProgressionV285)return;
window.__srCombatProgressionV285=true;
window.__srCampaign400V314=true;
window.__srStageMiniProgressV316=true;

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
function campaignMeta(f){
  var floor=clampFloor(f),di=Math.min(DIFFICULTIES.length-1,Math.floor((floor-1)/50));
  var diff=DIFFICULTIES[di],within=floor-di*50;
  var chapter=Math.floor((floor-1)/10)+1,stage=(floor-1)%10+1;
  var difficultyChapter=Math.floor((within-1)/10)+1,stageCode=chapter+'-'+stage;
  return {
    floor:floor,maxFloor:CAMPAIGN_MAX,difficultyIndex:di,difficultyId:diff.id,difficulty:diff.label,
    difficultyFloor:within,difficultyChapter:difficultyChapter,chapter:chapter,stage:stage,stageCode:stageCode,isBoss:stage===10,
    label:diff.label+' · '+stageCode
  };
}
window.__srCampaignMaxFloor=CAMPAIGN_MAX;
window.__srCampaignDifficulties=DIFFICULTIES.slice();
window.__srCampaignMeta=campaignMeta;
window.__srCampaignLabel=function(f){return campaignMeta(f).label;};
window.__srCampaignStageLabel=function(f){return campaignMeta(f).stageCode;};

/* Forge-Master-style encounter rhythm inside every 10-stage chapter.
   A dot is a real campaign encounter/wave, not decorative chapter progress. */
var STAGE_WAVE_PATTERN=[3,3,3,2,1,3,3,3,2,1];
function stageWaveCount(floor){
  var stage=campaignMeta(floor).stage;
  return STAGE_WAVE_PATTERN[Math.max(0,Math.min(9,stage-1))]||1;
}
window.__srCampaignWavePatternV316=STAGE_WAVE_PATTERN.slice();
window.__srCampaignWaveCountV316=stageWaveCount;
try{
  if(typeof campaignWaveCount==='function'){
    campaignWaveCount=function(floor){return stageWaveCount(floor);};
    campaignWaveCount.__srStageMiniProgressV316=true;
  }
}catch(_){ }

/* Reuse the native arena track language, but make it represent only the current
   stage's real encounters. 1-5 therefore shows one elite dot; 1-10 one boss dot. */
function stageMiniTrack(floor){
  floor=clampFloor(floor);
  var total=stageWaveCount(floor),cur=1;
  try{
    if(typeof combat!=='undefined'&&combat&&Number(combat.floor)===floor&&(combat.ctx==='campaign'||combat.ctx==='mega')){
      cur=Math.max(1,Math.min(total,Math.floor(Number(combat.step)||1)));
    }
  }catch(_){ }
  var h='',boss=false,elite=false;
  try{boss=typeof isBoss==='function'&&isBoss(floor);elite=!boss&&typeof isElite==='function'&&isElite(floor);}catch(_){ }
  for(var i=1;i<=total;i++){
    if(i>1)h+='<i class="'+(i<=cur?'on':'')+'"></i>';
    var cls='sdot srStageMiniDot';
    if(boss)cls+=' boss';else if(elite)cls+=' elite';
    if(i<cur)cls+=' on';
    if(i===cur)cls+=' cur';
    var skull='';
    try{if(boss&&typeof MINI_SKULL!=='undefined')skull=MINI_SKULL;}catch(_){ }
    h+='<span class="'+cls+'" data-stage-step="'+i+'" data-stage-total="'+total+'">'+skull+'</span>';
  }
  return h;
}
window.__srStageMiniTrackV316=stageMiniTrack;
try{
  if(typeof floorTrack==='function'){
    floorTrack=function(floor){return stageMiniTrack(floor);};
    floorTrack.__srStageMiniProgressV316=true;
  }
}catch(_){ }

/* Existing V285 anchors through Expert stay untouched. V314 extends only the
   missing Cauchemar -> Divin runway. Values are fixed world progression, never
   derived from the current player's power. */
var BOSS={
  10:2000,20:20000,30:180000,40:3000000,50:20000000,
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

/* Campaign bosses are built through the legacy multiplier path. Keep the exact
   V285/V314 target HP as its authority without coupling it to player power. */
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

/* Preserve a record from the former endless campaign instead of silently
   discarding it, then normalize the active campaign into the new 1..400 world. */
function normalizeCampaignState(){
  try{
    if(typeof S==='undefined'||!S)return;
    var highest=Math.max(Number(S.floor)||1,Number(S.recordFloor)||1,Number(S.checkpoint)||1);
    if(highest>CAMPAIGN_MAX)S.legacyCampaignRecord=Math.max(Number(S.legacyCampaignRecord)||0,highest);
    if((Number(S.floor)||1)>CAMPAIGN_MAX)S.floor=CAMPAIGN_MAX;
    if((Number(S.recordFloor)||1)>CAMPAIGN_MAX)S.recordFloor=CAMPAIGN_MAX;
    if((Number(S.checkpoint)||1)>CAMPAIGN_MAX)S.checkpoint=CAMPAIGN_MAX;
    if((Number(S.pendingBossFloor)||0)>CAMPAIGN_MAX)S.pendingBossFloor=0;
  }catch(_){ }
}
normalizeCampaignState();

/* Never let a completed Boss 40-10 (internal floor 400) advance to an undefined
   stage 41-1. V316 also normalizes the legacy three-wave completion check so a
   2-wave or 1-wave stage still gets its proper floor reward notice. */
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
      var finalWin=!!(c&&c.ctx==='campaign'&&c.status==='won'&&Number(c.floor)>=CAMPAIGN_MAX);
      var actualStep=null,stageFinished=false;
      try{
        stageFinished=!!(c&&c.ctx==='campaign'&&c.status==='won'&&Number(c.step)>=stageWaveCount(c.floor));
        if(stageFinished&&typeof RULES!=='undefined'&&Number(c.step)<Number(RULES.STEPS_PER_FLOOR)){
          actualStep=c.step;c.step=RULES.STEPS_PER_FLOOR;
        }
      }catch(_){ }
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
    handleCombatEnd.__srStageMiniProgressV316=true;
    handleCombatEnd.__srPrevious=oldHandleCombatEnd;
  }
}catch(_){ }

/* Native arena label without adding another runtime script. drawArena compares
   against the raw label every frame, so the proxy remembers that raw value while
   the actual DOM node receives the approved difficulty + chapter-stage label. */
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
        try{
          if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign')node.textContent=campaignMeta(combat.floor).label;
          else node.textContent=raw;
        }catch(_){node.textContent=raw;}
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

/* Keep the native status pills, but make the wave denominator match the real
   per-stage encounter count. Also retain the V314 local stage flash rewrite. */
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
    drawArena.__srStageMiniProgressV316=true;
    drawArena.__srPrevious=oldDrawArena;
  }
}catch(_){ }

window.__srCombatProgressionConfigV285={
  bossHP:BOSS,normalHP:NORMAL,maxFloor:CAMPAIGN_MAX,difficulties:DIFFICULTIES,
  chaptersPerDifficulty:5,floorsPerChapter:10,totalChapters:40,campaignMeta:campaignMeta,
  stageWavePattern:STAGE_WAVE_PATTERN.slice(),stageWaveCount:stageWaveCount
};
})();