/* SHADOWREACH V305 · Progression integration pack
   Consolidated QA corrections that are all consequences of already-approved design:
   - retired Familiar Apple progression must not create Apple refunds through fusion/Ascension;
   - retired Rebirth must never appear as a tutorial step;
   - exported Familiar stat previews/tests must read the state being evaluated, not live S;
   - V316 progression gates: Forge unlocks at hero level 3, Skills at hero level 4.
   No rarity curve, resource cost, owned equipment stat, floor balance or save schema is changed. */
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

/* ---------- V316 early-system unlock gates ---------- */
var FORGE_UNLOCK_LEVEL=3,SKILL_UNLOCK_LEVEL=4;
function heroLevel(){try{return Math.max(1,Math.floor(Number(S&&S.level)||1));}catch(_){return 1;}}
function forgeUnlocked(){return heroLevel()>=FORGE_UNLOCK_LEVEL;}
function skillsUnlocked(){return heroLevel()>=SKILL_UNLOCK_LEVEL;}
function lockedToast(level,label){try{if(typeof toast==='function')toast(label+' débloqué'+(label==='Forge'?'e':'')+' au niveau '+level,false);}catch(_){ }}

try{
  if(typeof startForgeBatch==='function'&&!startForgeBatch.__srV316Unlock){
    var oldStartForgeBatch=startForgeBatch;
    startForgeBatch=function(){if(!forgeUnlocked()){lockedToast(FORGE_UNLOCK_LEVEL,'Forge');return false;}return oldStartForgeBatch.apply(this,arguments);};
    startForgeBatch.__srV316Unlock=true;startForgeBatch.__srPrevious=oldStartForgeBatch;
  }
}catch(_){ }
try{
  if(typeof forgeSummon==='function'&&!forgeSummon.__srV316Unlock){
    var oldForgeSummon=forgeSummon;
    forgeSummon=function(){if(!forgeUnlocked()){lockedToast(FORGE_UNLOCK_LEVEL,'Forge');return [];}return oldForgeSummon.apply(this,arguments);};
    forgeSummon.__srV316Unlock=true;forgeSummon.__srPrevious=oldForgeSummon;
  }
}catch(_){ }
try{
  if(typeof upgradeForge==='function'&&!upgradeForge.__srV316Unlock){
    var oldUpgradeForge=upgradeForge;
    upgradeForge=function(){if(!forgeUnlocked()){lockedToast(FORGE_UNLOCK_LEVEL,'Forge');return false;}return oldUpgradeForge.apply(this,arguments);};
    upgradeForge.__srV316Unlock=true;upgradeForge.__srPrevious=oldUpgradeForge;
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
        var lock=document.createElement('div');lock.className='srFeatureLock';lock.setAttribute('data-act','locked');lock.setAttribute('data-arg',String(FORGE_UNLOCK_LEVEL));
        lock.innerHTML=(typeof ic==='function'?ic('lock',26):'🔒')+'<b>FORGE · NIV.'+FORGE_UNLOCK_LEVEL+'</b><span>Continue à monter ton héros pour débloquer la Forge.</span>';
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
window.__srProgressionUnlocksV316={forge:FORGE_UNLOCK_LEVEL,skills:SKILL_UNLOCK_LEVEL,forgeUnlocked:forgeUnlocked,skillsUnlocked:skillsUnlocked};

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
    S.progressionIntegrationVersion=305;
    if(typeof computePower==='function')S.power=computePower(S);
    if(typeof computeDerived==='function'&&typeof D!=='undefined')D=computeDerived(S);
    if(typeof saveNow==='function')saveNow();
    if(typeof scheduleRender==='function')scheduleRender();
  }
}catch(_){ }

window.__srProgressionIntegrationConfigV305={
  familiarAppleRefunds:false,
  rebirthTutorial:false,
  stateAwareFamiliarPreview:true,
  unlocks:{forge:FORGE_UNLOCK_LEVEL,skills:SKILL_UNLOCK_LEVEL},
  destructiveMigration:false,
  saveSchemaChanged:false
};
})();