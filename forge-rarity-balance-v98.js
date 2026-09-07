// FORGE_RARITY_BALANCE_V98
// Courbe forte validée : chaque rareté doit représenter un vrai saut de puissance.
// Aucun changement des taux de drop, coûts, niveaux de Forge ou bonus secondaires.
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