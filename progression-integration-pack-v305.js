/* SHADOWREACH V305 / V461 · Progression integration pack
   Consolidated QA corrections that are all consequences of already-approved design:
   - retired Familiar Apple progression must not create Apple refunds through fusion/Ascension;
   - retired Rebirth must never appear as a tutorial step;
   - exported Familiar stat previews/tests must read the state being evaluated, not live S;
   - V321 progression gates: Forge unlocks at campaign stage 1-2;
   - V461 starter pacing: Skills at hero level 2, a free first Skill, a short starter Egg and visible early milestones;
   - V317 Forge -> Raid onboarding keeps its original hero-level-3 depletion guard.
   No rarity curve, owned equipment stat or later progression balance is changed. */
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

/* ---------- Rebirth retirement + V321 Forge teaching step ---------- */
try{if(typeof TUTORIAL_FLOWS!=='undefined'&&TUTORIAL_FLOWS)delete TUTORIAL_FLOWS.rebirth;}catch(_){ }
function forgeIntroReadyV321(){
  try{return !!(S&&S.tutorial&&S.tutorial.forgeIntroReadyV321)&&Math.max(0,Number(S.forge&&S.forge.summonCount)||0)===0;}catch(_){return false;}
}
function forgeIntroTutorialV321(){
  return {key:'forge',title:'Forge ton équipement',sub:"L’ennemi de l’étage 1-2 est trop puissant avec ton équipement actuel. Forge une pièce puis équipe-la : ta Puissance augmente immédiatement."};
}
try{
  if(typeof pendingTutorialStep==='function'&&!pendingTutorialStep.__srV305){
    var oldPendingTutorialStep=pendingTutorialStep;
    pendingTutorialStep=function(){
      try{
        if(forgeIntroReadyV321()){
          var forgeSeen=S.tutorial&&S.tutorial.seen;
          if(forgeSeen&&!forgeSeen.forge)return forgeIntroTutorialV321();
        }
      }catch(_){ }
      var step=oldPendingTutorialStep.apply(this,arguments);
      var suppress=[];
      if(step&&step.key==='rebirth')suppress.push('rebirth');
      if(step&&step.key==='forge'&&!forgeIntroReadyV321())suppress.push('forge');
      if(!suppress.length)return step;
      try{
        if(typeof S==='undefined'||!S||!S.tutorial)return null;
        var seen=S.tutorial.seen||(S.tutorial.seen={}),saved={};
        suppress.forEach(function(key){saved[key]={had:Object.prototype.hasOwnProperty.call(seen,key),value:seen[key]};seen[key]=true;});
        var next=oldPendingTutorialStep.apply(this,arguments);
        suppress.forEach(function(key){if(saved[key].had)seen[key]=saved[key].value;else delete seen[key];});
        return next&&suppress.indexOf(next.key)>=0?null:next;
      }catch(_){return null;}
    };
    pendingTutorialStep.__srV305=true;pendingTutorialStep.__srForgeIntroV321=true;pendingTutorialStep.__srPrevious=oldPendingTutorialStep;
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

/* ---------- V321 early-system unlock gates ---------- */
var FORGE_UNLOCK_FLOOR=2,V317_RAID_FORGE_LEVEL=3,SKILL_UNLOCK_LEVEL=2;
function heroLevel(){try{return Math.max(1,Math.floor(Number(S&&S.level)||1));}catch(_){return 1;}}
function campaignProgress(){try{return Math.max(1,Math.floor(Number(S&&S.floor)||1),Math.floor(Number(S&&S.recordFloor)||1),Math.floor(Number(S&&S.checkpoint)||1));}catch(_){return 1;}}
function forgeUnlocked(){return campaignProgress()>=FORGE_UNLOCK_FLOOR;}
function skillsUnlocked(){return heroLevel()>=SKILL_UNLOCK_LEVEL;}
function forgeLockedToast(){try{if(typeof toast==='function')toast('Forge débloquée à l’étage 1-2',false);}catch(_){ }}
function lockedToast(level,label){try{if(typeof toast==='function')toast(label+' débloqué'+(label==='Forge'?'e':'')+' au niveau '+level,false);}catch(_){ }}

try{
  if(typeof startForgeBatch==='function'&&!startForgeBatch.__srV316Unlock){
    var oldStartForgeBatch=startForgeBatch;
    startForgeBatch=function(){if(!forgeUnlocked()){forgeLockedToast();return false;}return oldStartForgeBatch.apply(this,arguments);};
    startForgeBatch.__srV316Unlock=true;startForgeBatch.__srForgeIntroV321=true;startForgeBatch.__srPrevious=oldStartForgeBatch;
  }
}catch(_){ }
try{
  if(typeof forgeSummon==='function'&&!forgeSummon.__srV316Unlock){
    var oldForgeSummon=forgeSummon;
    forgeSummon=function(){if(!forgeUnlocked()){forgeLockedToast();return [];}return oldForgeSummon.apply(this,arguments);};
    forgeSummon.__srV316Unlock=true;forgeSummon.__srForgeIntroV321=true;forgeSummon.__srPrevious=oldForgeSummon;
  }
}catch(_){ }
try{
  if(typeof upgradeForge==='function'&&!upgradeForge.__srV316Unlock){
    var oldUpgradeForge=upgradeForge;
    upgradeForge=function(){if(!forgeUnlocked()){forgeLockedToast();return false;}return oldUpgradeForge.apply(this,arguments);};
    upgradeForge.__srV316Unlock=true;upgradeForge.__srForgeIntroV321=true;upgradeForge.__srPrevious=oldUpgradeForge;
  }
}catch(_){ }
try{
  if(typeof summonSkill==='function'&&!summonSkill.__srV316Unlock){
    var oldSummonSkill=summonSkill;
    summonSkill=function(){if(!skillsUnlocked()){lockedToast(SKILL_UNLOCK_LEVEL,'Compétences');return [];}return oldSummonSkill.apply(this,arguments);};
    summonSkill.__srV316Unlock=true;summonSkill.__srPrevious=oldSummonSkill;
  }
}catch(_){ }
try{
  if(typeof equipSkill==='function'&&!equipSkill.__srV316Unlock){
    var oldEquipSkill=equipSkill;
    equipSkill=function(){if(!skillsUnlocked()){lockedToast(SKILL_UNLOCK_LEVEL,'Compétences');return false;}return oldEquipSkill.apply(this,arguments);};
    equipSkill.__srV316Unlock=true;equipSkill.__srPrevious=oldEquipSkill;
  }
}catch(_){ }
try{
  if(typeof nav==='function'&&!nav.__srV316Unlock){
    var oldNav=nav;
    nav=function(dest){if(dest==='competences'&&!skillsUnlocked()){lockedToast(SKILL_UNLOCK_LEVEL,'Compétences');return false;}return oldNav.apply(this,arguments);};
    nav.__srV316Unlock=true;nav.__srPrevious=oldNav;
  }
}catch(_){ }
try{
  if(typeof ACT!=='undefined'&&ACT&&typeof ACT.castSkill==='function'&&!ACT.castSkill.__srV316Unlock){
    var oldCastSkillAction=ACT.castSkill;
    ACT.castSkill=function(){if(!skillsUnlocked()){lockedToast(SKILL_UNLOCK_LEVEL,'Compétences');return false;}return oldCastSkillAction.apply(this,arguments);};
    ACT.castSkill.__srV316Unlock=true;ACT.castSkill.__srPrevious=oldCastSkillAction;
  }
}catch(_){ }
try{
  if(typeof skillSlotsHTML==='function'&&!skillSlotsHTML.__srV316Unlock){
    var oldSkillSlotsHTML=skillSlotsHTML;
    skillSlotsHTML=function(){
      if(skillsUnlocked())return oldSkillSlotsHTML.apply(this,arguments);
      var n=3;try{n=Math.max(1,Math.min(3,Number(RULES&&RULES.SKILL_SLOTS_BASE)||3));}catch(_){ }
      var h='';for(var i=0;i<n;i++)h+='<div class="slot sealed" data-act="locked" data-arg="'+SKILL_UNLOCK_LEVEL+'" title="Compétences débloquées au niveau '+SKILL_UNLOCK_LEVEL+'">'+(typeof ic==='function'?ic('lock',18):'🔒')+'<span class="lv">NIV.'+SKILL_UNLOCK_LEVEL+'</span></div>';
      h+='<div class="autoSk off" data-act="locked" data-arg="10" title="AUTO débloqué au niveau 10">'+(typeof ic==='function'?ic('bolt',12):'')+'<span>NIV.10</span><i></i></div>';
      return h;
    };
    skillSlotsHTML.__srV316Unlock=true;skillSlotsHTML.__srPrevious=oldSkillSlotsHTML;
  }
}catch(_){ }
try{
  if(typeof scrCompetences==='function'&&!scrCompetences.__srV316Unlock){
    var oldScrCompetences=scrCompetences;
    scrCompetences=function(){
      if(skillsUnlocked())return oldScrCompetences.apply(this,arguments);
      var head=typeof topbar==='function'?topbar('Compétences'):'';
      return head+'<div class="pad mt8"><div class="card frame center" style="padding:18px 12px">'+(typeof ic==='function'?ic('lock',32):'🔒')+'<div class="bb gt mt8">COMPÉTENCES VERROUILLÉES</div><div class="dim small mt6">Atteins le niveau '+SKILL_UNLOCK_LEVEL+' pour débloquer les invocations et les emplacements de compétences.</div></div></div>';
    };
    scrCompetences.__srV316Unlock=true;scrCompetences.__srPrevious=oldScrCompetences;
  }
}catch(_){ }
try{
  if(typeof scrDeveloppement==='function'&&!scrDeveloppement.__srV316Unlock){
    var oldScrDeveloppement=scrDeveloppement;
    scrDeveloppement=function(){
      var html=String(oldScrDeveloppement.apply(this,arguments));
      if(skillsUnlocked())return html;
      html=html.replace('data-act="go" data-arg="competences"','data-act="locked" data-arg="'+SKILL_UNLOCK_LEVEL+'"');
      html=html.replace('Invocation, équipement et amélioration des compétences.','Débloqué au niveau '+SKILL_UNLOCK_LEVEL+' · Invocation, équipement et amélioration des compétences.');
      return html;
    };
    scrDeveloppement.__srV316Unlock=true;scrDeveloppement.__srPrevious=oldScrDeveloppement;
  }
}catch(_){ }

var unlockStyle=document.createElement('style');
unlockStyle.id='srSystemUnlocksV316';
unlockStyle.textContent='#homeForge.srFeatureLocked{position:relative!important;overflow:hidden!important}#homeForge.srFeatureLocked>*{opacity:.18!important;pointer-events:none!important}#homeForge .srFeatureLock{position:absolute;inset:8px;z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border:1px solid #E8B44A66;border-radius:10px;background:linear-gradient(180deg,#101725f2,#080d17f5);text-align:center;color:var(--text)}#homeForge .srFeatureLock b{color:var(--goldLit);font-size:13px;letter-spacing:.6px}#homeForge .srFeatureLock span{color:var(--textMute);font-size:10px}';
try{document.head.appendChild(unlockStyle);}catch(_){ }
function decorateUnlocks(){
  try{
    var forge=document.getElementById('homeForge');
    if(forge){
      forge.classList.toggle('srFeatureLocked',!forgeUnlocked());
      var old=forge.querySelector('.srFeatureLock');if(old)old.remove();
      if(!forgeUnlocked()){
        var lock=document.createElement('div');lock.className='srFeatureLock';
        lock.innerHTML=(typeof ic==='function'?ic('lock',26):'🔒')+'<b>FORGE · ÉTAGE 1-2</b><span>Atteins l’étage 1-2 pour débloquer la Forge.</span>';
        forge.appendChild(lock);
      }
    }
    if(!skillsUnlocked()){
      var skillLink=document.querySelector('[data-arg="competences"]');
      if(skillLink){skillLink.setAttribute('data-act','locked');skillLink.setAttribute('data-arg',String(SKILL_UNLOCK_LEVEL));}
    }
  }catch(_){ }
}
try{window.addEventListener('sr:bottomnavrendered',function(){requestAnimationFrame(decorateUnlocks);});}catch(_){ }
try{window.addEventListener('load',function(){requestAnimationFrame(decorateUnlocks);},{once:true});}catch(_){ }
setTimeout(decorateUnlocks,0);
window.__srProgressionUnlocksV316={forge:FORGE_UNLOCK_FLOOR,forgeFloor:FORGE_UNLOCK_FLOOR,forgeStage:'1-2',skills:SKILL_UNLOCK_LEVEL,forgeUnlocked:forgeUnlocked,skillsUnlocked:skillsUnlocked};
window.__srProgressionUnlocksV321=window.__srProgressionUnlocksV316;
window.__srForgeIntroTutorialV321=forgeIntroTutorialV321;

/* ---------- V317 Forge -> Raid onboarding ---------- */
var V317_START_MINERAI=250,V317_LEGACY_START=400,V317_FRESH_MS=5*60*1000;
var V317_LEGACY_RAID_LEVEL=(typeof RULES!=='undefined'&&Number(RULES.RAID_UNLOCK_LEVEL))||5;
function v317HeroLevel(s){return Math.max(1,Math.floor(Number(s&&s.level)||1));}
function v317CraftCost(s){try{return Math.max(1,Number(forgeCost(s&&s.forge?s.forge.level:1))||10);}catch(_){return 10;}}
function v317NoEquipmentProgress(s){
  try{if((s.inventory||[]).length)return false;return !Object.keys(s.equipped||{}).some(function(k){return !!s.equipped[k];});}catch(_){return false;}
}
function v317BrandNewLegacyDefault(s){
  if(!s)return false;
  var age=Date.now()-(Number(s.firstSeen)||0);
  return age>=0&&age<=V317_FRESH_MS&&v317HeroLevel(s)===1&&Number(s.floor||1)===1&&
    Number(s.exp||0)===0&&Number(s.statPoints||0)===0&&Number(s.minerai||0)===V317_LEGACY_START&&
    Number(s.forge&&s.forge.summonCount||0)===0&&v317NoEquipmentProgress(s);
}
function v317HasRaidHistory(s){
  try{
    if(s.tutorial&&s.tutorial.seen&&s.tutorial.seen.raid)return true;
    var ids=(typeof RAID_IDS!=='undefined'&&RAID_IDS)||Object.keys(s.raids||{});
    return ids.some(function(id){var r=s.raids&&s.raids[id];return !!r&&(Number(r.record||0)>0||Number(r.level||1)>1||Number(r.stars||0)>0);});
  }catch(_){return false;}
}
function v317RaidUnlockedRaw(s){return !!(s&&s.onboardingV317&&s.onboardingV317.raidUnlocked);}
function v317SyncRaidGate(s){
  try{if(typeof RULES!=='undefined'&&RULES)RULES.RAID_UNLOCK_LEVEL=v317RaidUnlockedRaw(s)?1:V317_LEGACY_RAID_LEVEL;}catch(_){ }
}
function v317Apply(s){
  if(!s)return false;
  var changed=false;
  if(!s.onboardingV317||typeof s.onboardingV317!=='object'){
    var legacy=v317HeroLevel(s)>=V317_LEGACY_RAID_LEVEL||v317HasRaidHistory(s);
    s.onboardingV317={startMineralsApplied:false,raidUnlocked:!!legacy,raidUnlockedReason:legacy?'legacy':''};
    changed=true;
  }
  var o=s.onboardingV317;
  if(!o.startMineralsApplied&&v317BrandNewLegacyDefault(s)){
    s.minerai=V317_START_MINERAI;o.startMineralsApplied=true;changed=true;
  }
  if(!o.startMineralsApplied&&Number(s.minerai||0)===V317_START_MINERAI&&v317HeroLevel(s)===1&&
      Number(s.floor||1)===1&&Number(s.forge&&s.forge.summonCount||0)===0&&
      Date.now()-(Number(s.firstSeen)||0)<=V317_FRESH_MS){o.startMineralsApplied=true;changed=true;}
  if(!o.raidUnlocked&&v317HeroLevel(s)>=V317_RAID_FORGE_LEVEL&&Number(s.minerai||0)<v317CraftCost(s)){
    o.raidUnlocked=true;o.raidUnlockedReason='minerai';o.raidUnlockedAt=Date.now();changed=true;
  }
  try{if(typeof S!=='undefined'&&s===S)v317SyncRaidGate(s);}catch(_){ }
  return changed;
}
function v317RaidUnlocked(s){v317Apply(s);return v317RaidUnlockedRaw(s);}
function v317RaidTutorial(){return {key:'raid',title:'Raids débloqués',sub:"Tu n’as plus assez de Minerai pour forger. Ouvre Progression, puis Défis, puis Raids et lance le Raid Minerai pour refaire tes réserves."};}

try{
  if(typeof defaultState==='function'&&!defaultState.__srV317){
    var oldDefaultStateV317=defaultState;
    defaultState=function(){var s=oldDefaultStateV317.apply(this,arguments);s.minerai=V317_START_MINERAI;s.onboardingV317={startMineralsApplied:true,raidUnlocked:false,raidUnlockedReason:''};return s;};
    defaultState.__srV317=true;defaultState.__srPrevious=oldDefaultStateV317;
  }
}catch(_){ }
try{
  if(typeof migrate==='function'&&!migrate.__srV317){
    var oldMigrateV317=migrate;
    migrate=function(){
      var raw=arguments[0],had=!!(raw&&raw.onboardingV317&&typeof raw.onboardingV317==='object');
      var s=oldMigrateV317.apply(this,arguments);
      if(!had){try{delete s.onboardingV317;}catch(_){ }}
      v317Apply(s);return s;
    };
    if(oldMigrateV317.__srV299)migrate.__srV299=oldMigrateV317.__srV299;
    migrate.__srV317=true;migrate.__srPrevious=oldMigrateV317;
  }
}catch(_){ }
try{
  if(typeof loadSave==='function'&&!loadSave.__srV317){
    var oldLoadSaveV317=loadSave;
    loadSave=function(){var s=oldLoadSaveV317.apply(this,arguments);if(s)v317Apply(s);return s;};
    loadSave.__srV317=true;loadSave.__srPrevious=oldLoadSaveV317;
  }
}catch(_){ }
try{
  if(typeof forgeSummon==='function'&&!forgeSummon.__srV317){
    var oldForgeSummonV317=forgeSummon;
    forgeSummon=function(){
      var wasUnlocked=false;try{wasUnlocked=typeof S!=='undefined'&&S?v317RaidUnlockedRaw(S):false;}catch(_){ }
      var out=oldForgeSummonV317.apply(this,arguments),changed=false,forgeIntroCompleted=false;
      try{
        if(typeof S!=='undefined'&&S){
          changed=v317Apply(S);
          if(Array.isArray(out)&&out.length&&S.tutorial&&S.tutorial.forgeIntroReadyV321&&Math.max(0,Number(S.forge&&S.forge.summonCount)||0)>0){
            S.tutorial.seen=S.tutorial.seen||{};S.tutorial.seen.forge=true;S.tutorial.forgeIntroReadyV321=false;S.tutorial.forgeIntroCompletedV321=true;forgeIntroCompleted=true;changed=true;
          }
        }
      }catch(_){ }
      if(changed){try{if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }}
      if(forgeIntroCompleted){try{if(typeof clearTutorialGuide==='function')clearTutorialGuide();var card=document.getElementById('tutorialCard');if(card)card.remove();}catch(_){ }}
      if(!wasUnlocked&&typeof S!=='undefined'&&S&&v317RaidUnlockedRaw(S)){try{if(typeof checkTutorial==='function')setTimeout(checkTutorial,180);}catch(_){ }}
      return out;
    };
    forgeSummon.__srV317=true;forgeSummon.__srForgeIntroV321=true;forgeSummon.__srPrevious=oldForgeSummonV317;
  }
}catch(_){ }
try{
  if(typeof pendingTutorialStep==='function'&&!pendingTutorialStep.__srV317){
    var oldPendingTutorialV317=pendingTutorialStep;
    pendingTutorialStep=function(){
      v317Apply(S);
      var step=oldPendingTutorialV317.apply(this,arguments),unlocked=v317RaidUnlockedRaw(S);
      if(step&&step.key==='raid'){
        if(!unlocked)return null;
        return S.onboardingV317.raidUnlockedReason==='minerai'?v317RaidTutorial():step;
      }
      if(step)return step;
      var seen=S.tutorial&&S.tutorial.seen;
      if(unlocked&&seen&&!seen.raid&&S.onboardingV317.raidUnlockedReason==='minerai')return v317RaidTutorial();
      return null;
    };
    pendingTutorialStep.__srV317=true;pendingTutorialStep.__srPrevious=oldPendingTutorialV317;
  }
}catch(_){ }
window.__srV317EnsureOnboarding=function(s){v317Apply(s);return s;};
window.__srV317RaidUnlocked=v317RaidUnlocked;
window.__srForgeRaidOnboardingConfigV317={startMinerai:V317_START_MINERAI,craftCost:10,paidCraftsBeforeRaid:25,forgeUnlockLevel:V317_RAID_FORGE_LEVEL,raidDepletionMinHeroLevel:V317_RAID_FORGE_LEVEL,actualForgeUnlockFloor:FORGE_UNLOCK_FLOOR,actualForgeUnlockStage:'1-2',legacyRaidLevel:V317_LEGACY_RAID_LEVEL};

/* ---------- V461 · Dense first minutes ---------- */
var V461_FRESH_MS=30*60*1000,V461_STARTER_EGG_FLOOR=3,V461_STARTER_HATCH_SECS=30,V461_FIRST_BOSS_FLOOR=5;
function v461Highest(s){return Math.max(1,Math.floor(Number(s&&s.floor)||1),Math.floor(Number(s&&s.recordFloor)||1),Math.floor(Number(s&&s.checkpoint)||1));}
function v461FreshCandidate(s){
  if(!s)return false;
  var age=Date.now()-Math.max(0,Number(s.firstSeen)||0);
  var boss5=!!(s.bossClears&&s.bossClears[String(V461_FIRST_BOSS_FLOOR)]);
  var advanced=v461Highest(s)>V461_FIRST_BOSS_FLOOR||boss5||Number(s.ascension||0)>0;
  return !advanced&&age>=0&&age<=V461_FRESH_MS;
}
function v461StarterState(active){
  return {version:461,active:!!active,completed:false,skillCreditGranted:false,freeSkillSummons:0,
    starterEggGranted:false,starterEggId:null,startedAt:Date.now(),completedAt:0};
}
function v461Ensure(s,forceFresh){
  if(!s)return false;
  if(!s.onboardingV461||typeof s.onboardingV461!=='object'){
    s.onboardingV461=v461StarterState(!!forceFresh||v461FreshCandidate(s));
    return true;
  }
  var o=s.onboardingV461,changed=false;
  if(Number(o.version)!==461){o.version=461;changed=true;}
  if(!Number.isFinite(Number(o.freeSkillSummons))){o.freeSkillSummons=0;changed=true;}
  o.freeSkillSummons=Math.max(0,Math.floor(Number(o.freeSkillSummons)||0));
  if(o.completed&&o.active){o.active=false;changed=true;}
  return changed;
}
function v461Active(s){return !!(s&&s.onboardingV461&&s.onboardingV461.active&&!s.onboardingV461.completed);}
function v461FreeSkillAvailable(s){return !!(v461Active(s)&&Number(s.onboardingV461.freeSkillSummons)>0);}
function v461Announce(events){
  if(!events||!events.length)return;
  events.forEach(function(ev){
    setTimeout(function(){
      try{
        if(typeof rewardPop==='function')rewardPop(ev.title,ev.sub,false,ev.action||null,ev.arg||null,4600,ev.kind||null);
        else if(typeof toast==='function')toast(ev.title+(ev.sub?' · '+ev.sub:''),true);
      }catch(_){}
    },0);
  });
}
function v461ApplyMilestones(s,announce){
  if(!s)return {changed:false,events:[]};
  var changed=v461Ensure(s,false),events=[],o=s.onboardingV461;
  if(!v461Active(s))return {changed:changed,events:events};

  if(!o.skillCreditGranted&&Math.max(1,Math.floor(Number(s.level)||1))>=SKILL_UNLOCK_LEVEL){
    o.skillCreditGranted=true;o.freeSkillSummons=Math.max(1,Number(o.freeSkillSummons)||0);changed=true;
    events.push({title:'Compétences débloquées',sub:'Ta première invocation est offerte.',action:'go',arg:'competences',kind:'skill'});
  }

  if(!o.starterEggGranted&&v461Highest(s)>=V461_STARTER_EGG_FLOOR){
    var egg={id:typeof rid==='function'?rid():('starter-'+Date.now()),rarity:'COMMUN',
      species:typeof randSpecies==='function'?randSpecies():'dragonnet',
      element:typeof randElement==='function'?randElement():'normal',
      hatchEnd:Date.now()+V461_STARTER_HATCH_SECS*1000,starterV461:true};
    s.eggs=Array.isArray(s.eggs)?s.eggs:[];
    s.eggs.push(egg);o.starterEggGranted=true;o.starterEggId=egg.id;changed=true;
    events.push({title:'Premier œuf obtenu',sub:'Éclosion accélérée · 30 s.',action:'go',arg:'familiers',kind:'egg'});
  }

  if(s.bossClears&&s.bossClears[String(V461_FIRST_BOSS_FLOOR)]){
    o.completed=true;o.active=false;o.completedAt=Date.now();changed=true;
    events.push({title:'Départ accompli',sub:'Ton build est lancé. La progression normale commence.',kind:'boss'});
  }
  if(announce)v461Announce(events);
  return {changed:changed,events:events};
}

/* A fresh hero reaches level 2 during the first normal stage instead of
   watching several stages before the first new system appears. This multiplier
   exists only while the starter flow is active and the hero is still level 1. */
try{
  if(typeof expReward==='function'&&!expReward.__srV461){
    var oldExpRewardV461=expReward;
    expReward=function(floor){
      var base=oldExpRewardV461.apply(this,arguments);
      try{
        if(v461Active(S)&&Math.max(1,Math.floor(Number(S.level)||1))<2&&Number(floor)<=2)
          return Math.max(base,Math.ceil(expToNext(1)/3));
      }catch(_){}
      return base;
    };
    expReward.__srV461=true;expReward.__srPrevious=oldExpRewardV461;
  }
}catch(_){}

/* Persist starter state on every genuinely new game, while old/advanced saves
   are never enrolled retroactively. */
try{
  if(typeof defaultState==='function'&&!defaultState.__srV461){
    var oldDefaultStateV461=defaultState;
    defaultState=function(){var s=oldDefaultStateV461.apply(this,arguments);s.onboardingV461=v461StarterState(true);return s;};
    defaultState.__srV461=true;defaultState.__srPrevious=oldDefaultStateV461;
  }
}catch(_){}
try{
  if(typeof migrate==='function'&&!migrate.__srV461){
    var oldMigrateV461=migrate;
    migrate=function(){
      var raw=arguments[0],had=!!(raw&&raw.onboardingV461&&typeof raw.onboardingV461==='object');
      var s=oldMigrateV461.apply(this,arguments);
      if(!had)try{delete s.onboardingV461;}catch(_){}
      v461Ensure(s,false);return s;
    };
    if(oldMigrateV461.__srV299)migrate.__srV299=oldMigrateV461.__srV299;
    migrate.__srV461=true;migrate.__srPrevious=oldMigrateV461;
  }
}catch(_){}
try{
  if(typeof loadSave==='function'&&!loadSave.__srV461){
    var oldLoadSaveV461=loadSave;
    loadSave=function(){var s=oldLoadSaveV461.apply(this,arguments);if(s)v461Ensure(s,false);return s;};
    loadSave.__srV461=true;loadSave.__srPrevious=oldLoadSaveV461;
  }
}catch(_){}

/* First Skill invocation is free without inflating the shard economy. The
   normal cost function remains authoritative for every later invocation. */
try{
  if(typeof summonSkill==='function'&&!summonSkill.__srV461){
    var oldSummonSkillV461=summonSkill;
    summonSkill=function(n){
      var count=Math.max(1,Math.floor(Number(n)||1));
      if(!v461FreeSkillAvailable(S))return oldSummonSkillV461.apply(this,arguments);
      var first=[],normalCost=skillSummonCost;
      try{
        skillSummonCost=function(){return 0;};
        first=oldSummonSkillV461.call(this,1)||[];
      }finally{skillSummonCost=normalCost;}
      if(Array.isArray(first)&&first.length){
        S.onboardingV461.freeSkillSummons=Math.max(0,Number(S.onboardingV461.freeSkillSummons)||0)-1;
        try{if(typeof saveNow==='function')saveNow();}catch(_){}
      }
      if(count<=1)return first;
      var rest=oldSummonSkillV461.call(this,count-1)||[];
      return (Array.isArray(first)?first:[]).concat(Array.isArray(rest)?rest:[]);
    };
    summonSkill.__srV461=true;summonSkill.__srPrevious=oldSummonSkillV461;
  }
}catch(_){}

/* Milestones are applied at the two progression boundaries that can unlock
   them: level grants and campaign completion. */
try{
  if(typeof grantLevels==='function'&&!grantLevels.__srV461){
    var oldGrantLevelsV461=grantLevels;
    grantLevels=function(s){var out=oldGrantLevelsV461.apply(this,arguments),m=v461ApplyMilestones(s,true);if(m.changed)try{if(typeof saveNow==='function'&&s===S)saveNow();}catch(_){}return out;};
    grantLevels.__srV461=true;grantLevels.__srPrevious=oldGrantLevelsV461;
  }
}catch(_){}
try{
  if(typeof handleCombatEnd==='function'&&!handleCombatEnd.__srV461){
    var oldHandleCombatEndV461=handleCombatEnd;
    handleCombatEnd=function(){
      var out=oldHandleCombatEndV461.apply(this,arguments),m=v461ApplyMilestones(S,true);
      if(m.changed){try{if(typeof computePower==='function')S.power=computePower(S);if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}catch(_){}}
      return out;
    };
    handleCombatEnd.__srV461=true;handleCombatEnd.__srPrevious=oldHandleCombatEndV461;
  }
}catch(_){}

function v461NextStep(s){
  if(!v461Active(s))return null;
  var o=s.onboardingV461||{},highest=v461Highest(s),lvl=Math.max(1,Math.floor(Number(s.level)||1));
  if(Math.max(0,Number(s.forge&&s.forge.summonCount)||0)<1)
    return {id:'forge',title:'Forge',note:'Atteins Facile 1-2 puis forge ta première pièce.',now:Math.min(highest,2),max:2,go:'accueil',ready:highest>=2};
  if(lvl<SKILL_UNLOCK_LEVEL)
    return {id:'skillsUnlock',title:'Compétences',note:'Atteins le niveau '+SKILL_UNLOCK_LEVEL+'.',now:lvl,max:SKILL_UNLOCK_LEVEL,go:'accueil',ready:false};
  if(Number(o.freeSkillSummons)>0)
    return {id:'freeSkill',title:'Première compétence',note:'1 invocation offerte t’attend.',now:1,max:1,go:'competences',ready:true};
  if(!Object.keys(s.skills||{}).length)
    return {id:'firstSkill',title:'Première compétence',note:'Invoque puis équipe ta première compétence.',now:0,max:1,go:'competences',ready:true};
  if(!o.starterEggGranted)
    return {id:'starterEgg',title:'Premier œuf',note:'Atteins Facile 1-3.',now:Math.min(highest,V461_STARTER_EGG_FLOOR),max:V461_STARTER_EGG_FLOOR,go:'accueil',ready:false};
  var starter=(s.eggs||[]).find(function(e){return e&&e.id===o.starterEggId;});
  if(starter){
    var remain=Math.max(0,(Number(starter.hatchEnd)||0)-Date.now());
    return {id:'hatch',title:'Premier familier',note:remain>0?'Éclosion · '+Math.ceil(remain/1000)+' s':'Ton œuf est prêt à éclore.',now:Math.max(0,V461_STARTER_HATCH_SECS-Math.ceil(remain/1000)),max:V461_STARTER_HATCH_SECS,go:'familiers',ready:remain<=0};
  }
  if(!(s.bossClears&&s.bossClears[String(V461_FIRST_BOSS_FLOOR)]))
    return {id:'boss5',title:'Premier Boss',note:'Prépare ton build pour Facile 1-5.',now:Math.min(highest,V461_FIRST_BOSS_FLOOR),max:V461_FIRST_BOSS_FLOOR,go:'accueil',ready:false};
  return null;
}
window.__srStarterPacingV461={
  version:461,skillUnlockLevel:SKILL_UNLOCK_LEVEL,starterEggFloor:V461_STARTER_EGG_FLOOR,
  starterHatchSeconds:V461_STARTER_HATCH_SECS,firstBossFloor:V461_FIRST_BOSS_FLOOR,
  ensure:v461Ensure,applyMilestones:v461ApplyMilestones,active:v461Active,
  freeSkillAvailable:v461FreeSkillAvailable,nextStep:v461NextStep
};

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

try{
  if(typeof S!=='undefined'&&S){
    var onboardingChanged=v317Apply(S);
    var starterResult=v461ApplyMilestones(S,false);
    onboardingChanged=onboardingChanged||starterResult.changed;
    S.progressionIntegrationVersion=461;
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof saveNow==='function'&&onboardingChanged)saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }

window.__srProgressionIntegrationConfigV305={
  revision:461,
  familiarAppleRefunds:false,
  rebirthTutorial:false,
  stateAwareFamiliarPreview:true,
  unlocks:{forgeFloor:FORGE_UNLOCK_FLOOR,forgeStage:'1-2',skills:SKILL_UNLOCK_LEVEL},
  forgeIntroV321:true,
  forgeRaidOnboardingV317:true,
  startMinerai:V317_START_MINERAI,
  starterPacing:{skillLevel:SKILL_UNLOCK_LEVEL,firstSkillFree:true,starterEggFloor:V461_STARTER_EGG_FLOOR,starterHatchSeconds:V461_STARTER_HATCH_SECS,firstBossFloor:V461_FIRST_BOSS_FLOOR,level1ExpBoost:true},
  destructiveMigration:false,
  saveSchemaChanged:true
};
})();