/* SHADOWREACH V308 · Progression state safety
   Targeted QA correction after the V307 batch.

   V284's Skill rarity override reads Skill stars from the live player state S,
   even though the canonical getRates(system, mastery, ascension, stars) API
   receives the star count being evaluated. This can make previews, arena
   simulations and cloned-state QA show the live player's Skill rarity table.

   V308 restores the API contract for Skill rates only. Live calls keep the
   same approved V284 distribution, while explicit 0★/1★ evaluations are now
   isolated from S. No economy, save schema, owned progression or rarity values
   are changed. */
(function(){'use strict';
if(window.__srProgressionStateSafetyV308)return;
window.__srProgressionStateSafetyV308=true;

var SKILL_ANCHORS={
  0:{COMMUN:100,RARE:0,EPIQUE:0,MYTHIQUE:0,ARTEFACT:0,LEGENDAIRE:0,DIVIN:0},
  10:{COMMUN:65,RARE:27,EPIQUE:8,MYTHIQUE:0,ARTEFACT:0,LEGENDAIRE:0,DIVIN:0},
  20:{COMMUN:45,RARE:30,EPIQUE:20,MYTHIQUE:5,ARTEFACT:0,LEGENDAIRE:0,DIVIN:0},
  30:{COMMUN:35,RARE:27,EPIQUE:24,MYTHIQUE:12,ARTEFACT:2,LEGENDAIRE:0,DIVIN:0},
  40:{COMMUN:30,RARE:25,EPIQUE:24,MYTHIQUE:16,ARTEFACT:5,LEGENDAIRE:0,DIVIN:0},
  50:{COMMUN:27,RARE:25,EPIQUE:23,MYTHIQUE:18,ARTEFACT:7,LEGENDAIRE:0,DIVIN:0}
};

function explicitSkillRates(mastery,stars){
  var m=Math.max(0,Math.min(50,Number(mastery)||0));
  var ks=[0,10,20,30,40,50],lo=0,hi=0;
  if(m===0){lo=hi=0;}
  else{
    for(var i=1;i<ks.length;i++){
      if(m<=ks[i]){lo=ks[i-1];hi=ks[i];break;}
    }
  }
  var t=hi===lo?0:(m-lo)/(hi-lo),out={};
  Object.keys(SKILL_ANCHORS[lo]).forEach(function(r){
    out[r]=SKILL_ANCHORS[lo][r]+(SKILL_ANCHORS[hi][r]-SKILL_ANCHORS[lo][r])*t;
  });
  if(Math.max(0,Math.floor(Number(stars)||0))>=1&&m>=50){
    out={COMMUN:25,RARE:23,EPIQUE:22,MYTHIQUE:18,ARTEFACT:7,LEGENDAIRE:5,DIVIN:0};
  }
  return out;
}

try{
  if(typeof getRates==='function'&&!getRates.__srV308){
    var previousGetRates=getRates;
    getRates=function(system,mastery,ascension,stars){
      if(system==='skill'&&arguments.length>=4&&stars!=null){
        return explicitSkillRates(mastery,stars);
      }
      return previousGetRates.apply(this,arguments);
    };
    getRates.__srV308=true;
    getRates.__srPrevious=previousGetRates;
  }
}catch(_){ }

window.__srV308SkillRates=explicitSkillRates;
window.__srProgressionStateSafetyConfigV308={
  skillRatesUseExplicitStars:true,
  preservesApprovedSkillRates:true,
  destructiveMigration:false,
  economyRebalanced:false,
  saveSchemaChanged:false
};

try{
  if(typeof S!=='undefined'&&S){
    S.progressionStateSafetyVersion=308;
    if(typeof saveNow==='function')saveNow();
  }
}catch(_){ }
})();
