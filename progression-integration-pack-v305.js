/* SHADOWREACH V305 · Progression integration pack
   Consolidated QA corrections that are all consequences of already-approved design:
   - retired Familiar Apple progression must not create Apple refunds through fusion/Ascension;
   - retired Rebirth must never appear as a tutorial step;
   - exported Familiar stat previews/tests must read the state being evaluated, not live S.
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
  destructiveMigration:false,
  saveSchemaChanged:false
};
})();
