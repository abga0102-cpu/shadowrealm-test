/* SHADOWREACH V305 · Progression integration pack
   Consolidated QA corrections that are all consequences of already-approved design:
   - retired Familiar Apple progression must not create Apple refunds through fusion/Ascension;
   - retired Rebirth must never appear as a tutorial step;
   - exported Familiar stat previews/tests must read the state being evaluated, not live S.
   V315 also owns the early Forge -> Raid onboarding contract so progression
   integration stays in one existing runtime owner instead of adding another layer. */
(function(){'use strict';
if(window.__srProgressionIntegrationV305)return;window.__srProgressionIntegrationV305=true;

/* ---------- Familiar legacy Apple refunds ---------- */
try{
  if(typeof fusePets==='function'&&!fusePets.__srV305){
    var oldFusePets=fusePets;
    fusePets=function(rarity){
      var before=0;try{before=Math.max(0,Number(S&&S.apples)||0);}catch(_){ }
      var res=oldFusePets.apply(this,arguments);
      if(res&&res.ok){
        try{if(typeof S!=='undefined'&&S&&(Number(S.apples)||0)>before)S.apples=before;}catch(_){ }
        res.refund=0;
        try{if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }
      }
      return res;
    };
    fusePets.__srV305=true;fusePets.__srPrevious=oldFusePets;
  }
}catch(_){ }

try{
  if(typeof doAscendMastery==='function'&&!doAscendMastery.__srV305){
    var oldAscendMastery=doAscendMastery;
    doAscendMastery=function(sys){
      var before=0;try{before=Math.max(0,Number(S&&S.apples)||0);}catch(_){ }
      var res=oldAscendMastery.apply(this,arguments);
      if(sys==='pet'&&res&&res.ok){
        try{if(typeof S!=='undefined'&&S&&(Number(S.apples)||0)>before)S.apples=before;}catch(_){ }
        res.appleRefund=0;
        try{if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }
      }
      return res;
    };
    doAscendMastery.__srV305=true;doAscendMastery.__srPrevious=oldAscendMastery;
  }
}catch(_){ }

try{
  if(typeof ascensionPreview==='function'&&!ascensionPreview.__srV305){
    var oldAscensionPreview=ascensionPreview;
    ascensionPreview=function(s,sys){
      var out=oldAscensionPreview.apply(this,arguments);
      if(sys==='pet'&&out&&Array.isArray(out.keep)){
        out.keep=out.keep.filter(function(row){return !(row&&/pomme/i.test(String(row[0]||'')));});
      }
      return out;
    };
    ascensionPreview.__srV305=true;ascensionPreview.__srPrevious=oldAscensionPreview;
  }
}catch(_){ }

/* ---------- Rebirth tutorial retirement ---------- */
try{if(typeof TUTORIAL_FLOWS!=='undefined'&&TUTORIAL_FLOWS)delete TUTORIAL_FLOWS.rebirth;}catch(_){ }
try{
  if(typeof pendingTutorialStep==='function'&&!pendingTutorialStep.__srV305){
    var oldPendingTutorialStep=pendingTutorialStep;
    pendingTutorialStep=function(){
      var step=oldPendingTutorialStep.apply(this,arguments);
      if(!step||step.key!=='rebirth')return step;
      try{
        if(typeof S==='undefined'||!S||!S.tutorial)return null;
        var seen=S.tutorial.seen||(S.tutorial.seen={});
        var had=Object.prototype.hasOwnProperty.call(seen,'rebirth'),old=seen.rebirth;
        seen.rebirth=true;
        var next=oldPendingTutorialStep.apply(this,arguments);
        if(had)seen.rebirth=old;else delete seen.rebirth;
        return next&&next.key==='rebirth'?null:next;
      }catch(_){return null;}
    };
    pendingTutorialStep.__srV305=true;pendingTutorialStep.__srPrevious=oldPendingTutorialStep;
  }
}catch(_){ }
try{
  if(typeof S!=='undefined'&&S&&S.tutorial){
    S.tutorial.seen=S.tutorial.seen||{};
    S.tutorial.seen.rebirth=true;
    if(typeof tutorialCurrentKey!=='undefined'&&tutorialCurrentKey==='rebirth'){
      try{if(typeof clearTutorialGuide==='function')clearTutorialGuide();}catch(_){ }
      tutorialCurrentKey=null;
      var card=document.getElementById('tutorialCard');if(card)card.remove();
    }
  }
}catch(_){ }

/* ---------- State-aware Familiar stat helper ---------- */
var PET_BASE={COMMUN:[1500,12000],PEU_COMMUN:[5000,40000],RARE:[20000,160000],EPIQUE:[120000,960000],MYTHIQUE:[900000,7200000],ANCESTRAL:[7000000,56000000],LEGENDAIRE:[70000000,560000000],DIVIN:[544000000,4350000000]};
var PET_SPEC={loup:[1.40,.65],felin:[1.20,.85],dragonnet:[1,1],oiseau:[.70,1.40]};
function petStats(p,state){
  if(!p)return {damage:0,hp:0};
  var s=state;try{if(!s&&typeof S!=='undefined')s=S;}catch(_){ }s=s||{};
  var b=PET_BASE[p.rarity]||PET_BASE.COMMUN,sp=PET_SPEC[p.species]||PET_SPEC.dragonnet;
  var stars=0;try{stars=Math.max(0,Math.floor(Number(s.stars&&s.stars.pet)||0));}catch(_){ }
  var m=1;try{m=typeof ascendPowerMul==='function'?Number(ascendPowerMul(stars,'pet'))||1:[1,1.5,2.1,3][Math.min(stars,3)];}catch(_){m=1;}
  var d=b[0]*sp[0]*m,h=b[1]*sp[1]*m;
  try{if(typeof treeSum==='function'){d*=1+(Number(treeSum(s,'petDmg'))||0)/100;h*=1+(Number(treeSum(s,'petHp'))||0)/100;}}catch(_){ }
  try{if(typeof petElement==='function'&&petElement(p).id==='normal')d*=1.10;}catch(_){ }
  return {damage:Math.round(d),hp:Math.round(h)};
}
window.__srV305PetStats=petStats;
window.__srV286PetStats=petStats;

/* ---------- V315 early Forge -> Raid onboarding ---------- */
var V315_START_MINERAI=250,V315_LEGACY_START=400,V315_FRESH_MS=5*60*1000;
var V315_LEGACY_RAID_LEVEL=(typeof RULES!=='undefined'&&Number(RULES.RAID_UNLOCK_LEVEL))||5;
function v315CraftCost(s){try{return Math.max(1,Number(forgeCost(s&&s.forge?s.forge.level:1))||1);}catch(_){return 10;}}
function v315NoEquipmentProgress(s){
  try{if((s.inventory||[]).length)return false;return !Object.keys(s.equipped||{}).some(function(k){return !!s.equipped[k];});}catch(_){return false;}
}
function v315BrandNewLegacyDefault(s){
  if(!s)return false;
  var age=Date.now()-(Number(s.firstSeen)||0);
  return age>=0&&age<=V315_FRESH_MS&&Number(s.level||1)===1&&Number(s.floor||1)===1&&
    Number(s.exp||0)===0&&Number(s.statPoints||0)===0&&Number(s.minerai||0)===V315_LEGACY_START&&
    Number(s.forge&&s.forge.summonCount||0)===0&&v315NoEquipmentProgress(s);
}
function v315HasRaidHistory(s){
  try{
    if(s.tutorial&&s.tutorial.seen&&s.tutorial.seen.raid)return true;
    var ids=(typeof RAID_IDS!=='undefined'&&RAID_IDS)||Object.keys(s.raids||{});
    return ids.some(function(id){var r=s.raids&&s.raids[id];return !!r&&(Number(r.record||0)>0||Number(r.level||1)>1||Number(r.stars||0)>0);});
  }catch(_){return false;}
}
function v315Apply(s){
  if(!s)return false;
  var changed=false;
  if(!s.onboardingV315||typeof s.onboardingV315!=='object'){
    var legacy=Number(s.level||1)>=V315_LEGACY_RAID_LEVEL||v315HasRaidHistory(s);
    s.onboardingV315={startMineralsApplied:false,raidUnlocked:!!legacy,raidUnlockedReason:legacy?'legacy':''};
    changed=true;
  }
  var o=s.onboardingV315;
  if(!o.startMineralsApplied&&v315BrandNewLegacyDefault(s)){
    s.minerai=V315_START_MINERAI;o.startMineralsApplied=true;changed=true;
  }
  if(!o.startMineralsApplied&&Number(s.minerai||0)===V315_START_MINERAI&&Number(s.level||1)===1&&
      Number(s.floor||1)===1&&Number(s.forge&&s.forge.summonCount||0)===0&&
      Date.now()-(Number(s.firstSeen)||0)<=V315_FRESH_MS){o.startMineralsApplied=true;changed=true;}
  if(!o.raidUnlocked&&Number(s.minerai||0)<v315CraftCost(s)){
    o.raidUnlocked=true;o.raidUnlockedReason='minerai';o.raidUnlockedAt=Date.now();changed=true;
  }
  return changed;
}
function v315RaidUnlocked(s){v315Apply(s);return !!(s&&s.onboardingV315&&s.onboardingV315.raidUnlocked);}

try{
  if(typeof defaultState==='function'&&!defaultState.__srV315){
    var oldDefaultStateV315=defaultState;
    defaultState=function(){var s=oldDefaultStateV315.apply(this,arguments);s.minerai=V315_START_MINERAI;s.onboardingV315={startMineralsApplied:true,raidUnlocked:false,raidUnlockedReason:''};return s;};
    defaultState.__srV315=true;defaultState.__srPrevious=oldDefaultStateV315;
  }
}catch(_){ }
try{
  if(typeof migrate==='function'&&!migrate.__srV315){
    var oldMigrateV315=migrate;
    migrate=function(){var s=oldMigrateV315.apply(this,arguments);v315Apply(s);return s;};
    migrate.__srV315=true;migrate.__srPrevious=oldMigrateV315;
  }
}catch(_){ }
try{
  if(typeof loadSave==='function'&&!loadSave.__srV315){
    var oldLoadSaveV315=loadSave;
    loadSave=function(){var s=oldLoadSaveV315.apply(this,arguments);if(s)v315Apply(s);return s;};
    loadSave.__srV315=true;loadSave.__srPrevious=oldLoadSaveV315;
  }
}catch(_){ }
try{
  if(typeof forgeSummon==='function'&&!forgeSummon.__srV315){
    var oldForgeSummonV315=forgeSummon;
    forgeSummon=function(){
      var before=typeof S!=='undefined'&&S?v315RaidUnlocked(S):false;
      var out=oldForgeSummonV315.apply(this,arguments),changed=false;
      try{if(typeof S!=='undefined'&&S)changed=v315Apply(S);}catch(_){ }
      if(changed){try{if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }}
      if(!before&&typeof S!=='undefined'&&S&&v315RaidUnlocked(S)){try{if(typeof checkTutorial==='function')setTimeout(checkTutorial,180);}catch(_){ }}
      return out;
    };
    forgeSummon.__srV315=true;forgeSummon.__srPrevious=oldForgeSummonV315;
  }
}catch(_){ }
function v315RaidTutorial(){return {key:'raid',title:'Raids débloqués',sub:"Tu n’as plus assez de Minerai pour forger. Ouvre Défis, puis Raids et lance le Raid Minerai pour refaire tes réserves."};}
try{
  if(typeof pendingTutorialStep==='function'&&!pendingTutorialStep.__srV315){
    var oldPendingTutorialV315=pendingTutorialStep;
    pendingTutorialStep=function(){
      v315Apply(S);
      var step=oldPendingTutorialV315.apply(this,arguments),unlocked=v315RaidUnlocked(S);
      if(step&&step.key==='raid'){
        if(!unlocked)return null;
        return S.onboardingV315.raidUnlockedReason==='minerai'?v315RaidTutorial():step;
      }
      if(step)return step;
      var seen=S.tutorial&&S.tutorial.seen;
      if(unlocked&&seen&&!seen.raid&&S.onboardingV315.raidUnlockedReason==='minerai')return v315RaidTutorial();
      return null;
    };
    pendingTutorialStep.__srV315=true;pendingTutorialStep.__srPrevious=oldPendingTutorialV315;
  }
}catch(_){ }
try{
  if(typeof scrRaid==='function'&&!scrRaid.__srV315){
    var oldScrRaidV315=scrRaid;
    scrRaid=function(){
      v315Apply(S);
      if(!v315RaidUnlocked(S))return topbar('Raids')+'<div class="pad mt6"><div class="notice center">Les Raids se débloquent quand tu n’as plus assez de Minerai pour forger.</div></div>';
      if(Number(S.level||1)>=V315_LEGACY_RAID_LEVEL)return oldScrRaidV315.apply(this,arguments);
      var oldGate=RULES.RAID_UNLOCK_LEVEL;
      try{RULES.RAID_UNLOCK_LEVEL=1;return oldScrRaidV315.apply(this,arguments);}finally{RULES.RAID_UNLOCK_LEVEL=oldGate;}
    };
    scrRaid.__srV315=true;scrRaid.__srPrevious=oldScrRaidV315;
    if(typeof SCREENS!=='undefined'&&SCREENS)SCREENS.raid=scrRaid;
  }
}catch(_){ }
window.__srV315EnsureOnboarding=function(s){v315Apply(s);return s;};
window.__srV315RaidUnlocked=v315RaidUnlocked;
window.__srForgeRaidOnboardingConfigV315={startMinerai:V315_START_MINERAI,craftCost:10,paidCraftsBeforeRaid:25,legacyRaidLevel:V315_LEGACY_RAID_LEVEL};

try{
  if(typeof S!=='undefined'&&S){
    var onboardingChanged=v315Apply(S);
    S.progressionIntegrationVersion=305;
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof saveNow==='function'&&(onboardingChanged||true))saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }

window.__srProgressionIntegrationConfigV305={
  familiarAppleRefunds:false,
  rebirthTutorial:false,
  stateAwareFamiliarPreview:true,
  destructiveMigration:false,
  saveSchemaChanged:true,
  forgeRaidOnboardingV315:true,
  startMinerai:V315_START_MINERAI
};
})();
