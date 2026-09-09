/* Shadowreach V238 — recyclage équipement : restitution des Poussières investies.
   Le recyclage rend la valeur de base + 100% des coûts des améliorations réussies.
   Le bonus d'Arbre « poussière » ne s'applique qu'à la valeur de base pour éviter toute boucle de profit. */
(function(){
  'use strict';
  if(window.__srEquipmentDustRefundV238)return;
  window.__srEquipmentDustRefundV238=true;
  if(typeof dustValue!=='function'||typeof upgradeItem!=='function'||typeof itemUpgradeCost!=='function')return;

  var baseDustValue=dustValue;
  var baseUpgradeItem=upgradeItem;

  function allItems(s){
    var out=[];
    if(s&&s.equipped)Object.keys(s.equipped).forEach(function(k){if(s.equipped[k])out.push(s.equipped[k]);});
    if(s&&Array.isArray(s.inventory))out=out.concat(s.inventory.filter(Boolean));
    return out;
  }

  function successfulInvestmentEstimate(it){
    var level=Math.max(0,Math.floor(Number(it&&it.level)||0));
    var anchor=Math.max(0,Math.floor(Number(it&&it.upgradeBaseLevel)||0));
    if(level<=anchor)return 0;
    var total=0;
    for(var lv=anchor;lv<level;lv++) total+=Math.round(20+lv*12);
    return total;
  }

  // Migration sans reset : les équipements encore possédés récupèrent leur historique
  // reconstructible. Jusqu'au niveau 100 les améliorations sont garanties, donc ce calcul
  // correspond exactement aux Poussières dépensées sur les niveaux réussis.
  try{
    if(typeof S!=='undefined'&&S&&!S.equipmentDustRefundV238){
      allItems(S).forEach(function(it){
        if(!Number.isFinite(Number(it.dustInvested))) it.dustInvested=successfulInvestmentEstimate(it);
      });
      S.equipmentDustRefundV238=true;
      S.equipmentDustRefundNoticeV238={trackedItems:allItems(S).filter(function(it){return Number(it.dustInvested)>0;}).length};
      if(typeof dirty!=='undefined')dirty=true;
      if(typeof saveNow==='function')saveNow();
    }
  }catch(e){console.warn('equipment dust migration V238',e);}

  dustValue=function(s,it){
    var base=Math.max(0,Number(baseDustValue(s,it))||0);
    var invested=Math.max(0,Number(it&&it.dustInvested)||0);
    return Math.floor(base+invested);
  };

  upgradeItem=function(id){
    var it=null,cost=0;
    try{
      it=Object.values(S.equipped||{}).find(function(x){return x&&x.id===id;})||
        (S.inventory||[]).find(function(x){return x&&x.id===id;});
      if(it)cost=itemUpgradeCost(it);
    }catch(_){}

    var result=baseUpgradeItem.apply(this,arguments);
    // Seuls les niveaux réellement gagnés deviennent remboursables. Les tentatives
    // ratées restent un coût de progression et ne créent pas de boucle de recyclage.
    if(result&&result.ok&&result.success&&it){
      it.dustInvested=Math.max(0,Number(it.dustInvested)||0)+Math.max(0,Number(cost)||0);
      try{if(typeof dirty!=='undefined')dirty=true;}catch(_){}
    }
    return result;
  };
})();