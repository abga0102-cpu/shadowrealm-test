// FORGE_RARITY_BALANCE_V98
// Courbe forte validée : chaque rareté doit représenter un vrai saut de puissance.
// V322B ci-dessous fixe uniquement le taux Épique de la Forge à 0,25 %.
(function(){
  'use strict';

  // Courbe actuellement sauvegardée par v96 -> nouvelle courbe forte v98.
  const OLD = {
    COMMUN:1, RARE:1.55, EPIQUE:2.20, MYTHIQUE:3.05,
    ARTEFACT:4.15, LEGENDAIRE:5.55, INFERNAL:7.35, IMMORTEL:9.70, DIVIN:12.80,
    HEROIQUE:4.15, ANCESTRAL:7.35
  };
  const NEXT = {
    COMMUN:1, RARE:1.80, EPIQUE:3.30, MYTHIQUE:6.00,
    ARTEFACT:10.50, LEGENDAIRE:18.00, INFERNAL:30.00, IMMORTEL:50.00, DIVIN:80.00,
    HEROIQUE:10.50, ANCESTRAL:30.00
  };

  Object.keys(NEXT).forEach(function(r){
    if(Object.prototype.hasOwnProperty.call(RARITY_MUL,r)) RARITY_MUL[r]=NEXT[r];
  });

  function round2(v){ return Math.round((Number(v)||0)*100)/100; }
  function scaleItem(it){
    if(!it||!it.rarity) return;
    const oldMul=OLD[it.rarity], newMul=NEXT[it.rarity];
    if(!oldMul||!newMul||oldMul===newMul) return;
    const ratio=newMul/oldMul;
    if(it.baseDamage!=null) it.baseDamage=round2(it.baseDamage*ratio);
    if(it.damage!=null) it.damage=round2(it.damage*ratio);
    if(it.baseHp!=null) it.baseHp=round2(it.baseHp*ratio);
    if(it.hp!=null) it.hp=round2(it.hp*ratio);
    if(it.originalPower!=null) it.originalPower=round2(it.originalPower*ratio);
    if(it.power!=null) it.power=round2((Number(it.damage)||0)+(Number(it.hp)||0));
  }

  function migrateExisting(){
    if(typeof S==='undefined'||!S||S.forgeRarityCurveVersion>=98) return;
    // v96 a déjà normalisé les anciennes pièces. v98 ne fait donc que le delta 96 -> 98.
    (S.inventory||[]).forEach(scaleItem);
    if(S.equipped) Object.keys(S.equipped).forEach(function(k){ scaleItem(S.equipped[k]); });
    S.forgeRarityCurveVersion=98;
    if(typeof computePower==='function') S.power=computePower(S);
    if(typeof computeDerived==='function' && typeof D!=='undefined') D=computeDerived(S);
    if(typeof dirty!=='undefined') dirty=true;
    if(typeof scheduleRender==='function') scheduleRender();
    if(typeof saveNow==='function') saveNow();
  }

  migrateExisting();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',migrateExisting,{once:true});
  else setTimeout(migrateExisting,0);
})();

// V322B · Forge Épique = 0,25 % réel à partir du déblocage Forge 6.
// L'écart retiré d'Épique retourne à Commun afin de conserver une somme exacte
// de 100 % sans modifier les chances des autres raretés.
(function(){
  'use strict';
  if(window.__srForgeEpicRateV322B)return;
  window.__srForgeEpicRateV322B=true;
  var EPIC_RATE=0.25;

  try{
    if(typeof gateForgeRates==='function'&&!gateForgeRates.__srEpicRateV322B){
      var previousGateForgeRates=gateForgeRates;
      gateForgeRates=function(rates,forgeLevel){
        var out=previousGateForgeRates.apply(this,arguments);
        if(!out||Number(forgeLevel)<6)return out;
        out=Object.assign({},out);
        var current=Math.max(0,Number(out.EPIQUE)||0);
        var delta=current-EPIC_RATE;
        out.EPIQUE=EPIC_RATE;
        out.COMMUN=Math.max(0,(Number(out.COMMUN)||0)+delta);
        return out;
      };
      gateForgeRates.__srEpicRateV322B=true;
      gateForgeRates.__srPrevious=previousGateForgeRates;
    }
  }catch(_){ }

  function patchEpicRateText(){
    try{
      var rows=document.querySelectorAll('.itemRow');
      for(var i=0;i<rows.length;i++){
        var row=rows[i],txt=String(row.textContent||'');
        if(txt.indexOf('Épique')<0||txt.indexOf('Forge 6+')<0)continue;
        var pill=row.querySelector('.pill');
        if(pill&&String(pill.textContent||'').indexOf('Débloqué')<0)pill.textContent='0,25 %';
        var sub=row.querySelector('.mute.tiny.b');
        if(sub&&String(sub.textContent||'').indexOf('par forge')>=0){
          sub.textContent=String(sub.textContent||'').replace(/[0-9]+(?:[.,][0-9]+)?\s*%\s*par forge/,'0,25 % par forge');
        }
      }
    }catch(_){ }
  }

  try{
    if(typeof showRarityInfo==='function'&&!showRarityInfo.__srEpicRateV322B){
      var previousShowRarityInfo=showRarityInfo;
      showRarityInfo=function(){
        var out=previousShowRarityInfo.apply(this,arguments);
        patchEpicRateText();
        setTimeout(patchEpicRateText,0);
        return out;
      };
      showRarityInfo.__srEpicRateV322B=true;
      showRarityInfo.__srPrevious=previousShowRarityInfo;
    }
  }catch(_){ }

  window.__srForgeEpicRateConfigV322B={unlockForgeLevel:6,epicRate:EPIC_RATE,redistributeTo:'COMMUN'};
})();
