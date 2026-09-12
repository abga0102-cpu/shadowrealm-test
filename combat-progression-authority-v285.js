/* SHADOWREACH V285 · Combat progression authority
   V314 extension: canonical 400-stage campaign structure.
   Visible stages keep the approved chapter-stage notation 1-1 .. 40-10 while
   the internal numeric index 1..400 remains stable for saves and balancing.
   Fixed campaign curve calibrated against weak/normal/max 0★/Ascension builds.
   Never scales enemies from current player power. */
(function(){
'use strict';
if(window.__srCombatProgressionV285)return;
window.__srCombatProgressionV285=true;
window.__srCampaign400V314=true;

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
   stage 41-1. The final stage remains replayable; first-clear rewards still
   remain one-time through the existing bossRewardsClaimed contract. */
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
      var out=oldHandleCombatEnd.apply(this,arguments);
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

/* The legacy combat renderer still writes a numeric inter-floor flash. Rewrite
   only that visual after the canonical draw so players always see 1-1, 1-2...
   rather than the internal 1..400 index. */
try{
  if(typeof drawArena==='function'&&!drawArena.__srCampaignStageNotationV314){
    var oldDrawArena=drawArena;
    drawArena=function(){
      var out=oldDrawArena.apply(this,arguments);
      try{
        if(typeof combat!=='undefined'&&combat&&combat.ctx==='campaign'&&typeof arenaNodes!=='undefined'&&arenaNodes&&arenaNodes.banner&&typeof floorFlash!=='undefined'&&floorFlash&&Date.now()<floorFlash.until&&combat.status!=='lost'){
          arenaNodes.banner.textContent='ÉTAGE '+campaignMeta(floorFlash.floor).stageCode;
        }
      }catch(_){ }
      return out;
    };
    drawArena.__srCampaignStageNotationV314=true;
    drawArena.__srPrevious=oldDrawArena;
  }
}catch(_){ }

window.__srCombatProgressionConfigV285={
  bossHP:BOSS,normalHP:NORMAL,maxFloor:CAMPAIGN_MAX,difficulties:DIFFICULTIES,
  chaptersPerDifficulty:5,floorsPerChapter:10,totalChapters:40,campaignMeta:campaignMeta
};
})();