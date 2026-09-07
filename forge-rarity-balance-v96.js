// FORGE_RARITY_BALANCE_V96
// Espace davantage la stat de base entre les raretés sans toucher aux taux de drop,
// aux niveaux de Forge ni aux bonus secondaires. Les anciennes pièces sont migrées
// une seule fois pour qu'un objet déjà possédé reste cohérent avec un nouveau drop.
(function(){
  'use strict';

  const OLD = {
    COMMUN:1, RARE:1.45, EPIQUE:1.95, MYTHIQUE:2.60,
    ARTEFACT:3.45, LEGENDAIRE:4.55, INFERNAL:6.00, IMMORTEL:7.90, DIVIN:10.40,
    HEROIQUE:3.45, ANCESTRAL:6.00
  };
  const NEXT = {
    COMMUN:1, RARE:1.55, EPIQUE:2.20, MYTHIQUE:3.05,
    ARTEFACT:4.15, LEGENDAIRE:5.55, INFERNAL:7.35, IMMORTEL:9.70, DIVIN:12.80,
    HEROIQUE:4.15, ANCESTRAL:7.35
  };

  // makeItem lit directement RARITY_MUL : mettre la table à jour suffit pour
  // tous les futurs objets, sans dupliquer le moteur de génération.
  Object.keys(NEXT).forEach(function(r){
    if(Object.prototype.hasOwnProperty.call(RARITY_MUL,r)) RARITY_MUL[r]=NEXT[r];
  });

  function round2(v){ return Math.round((Number(v)||0)*100)/100; }
  function scaleItem(it){
    if(!it||!it.rarity) return;
    const oldMul=OLD[it.rarity], newMul=NEXT[it.rarity];
    if(!oldMul||!newMul||oldMul===newMul) return;
    const ratio=newMul/oldMul;

    // On conserve exactement le rapport d'amélioration Poussière déjà acquis.
    // Seule la fondation liée à la rareté est rééchelonnée.
    if(it.baseDamage!=null) it.baseDamage=round2(it.baseDamage*ratio);
    if(it.damage!=null) it.damage=round2(it.damage*ratio);
    if(it.baseHp!=null) it.baseHp=round2(it.baseHp*ratio);
    if(it.hp!=null) it.hp=round2(it.hp*ratio);
    if(it.originalPower!=null) it.originalPower=round2(it.originalPower*ratio);
    if(it.power!=null) it.power=round2((Number(it.damage)||0)+(Number(it.hp)||0));
  }

  function migrateExisting(){
    if(typeof S==='undefined'||!S||S.forgeRarityCurveVersion>=96) return;
    (S.inventory||[]).forEach(scaleItem);
    if(S.equipped) Object.keys(S.equipped).forEach(function(k){ scaleItem(S.equipped[k]); });
    S.forgeRarityCurveVersion=96;
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
