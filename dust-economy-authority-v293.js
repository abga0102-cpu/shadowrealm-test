/* SHADOWREACH V293 / V364 · Dust recycling economy authority
   Recycling now follows the game's native equipment-value formula again:
   rarity rank + 20% of ORIGINAL equipment power, then the Tree Dust bonus.
   This keeps Auto-Forge and manual recycling coherent while preventing any
   upgrade/recycle loop because upgraded power and dustInvested are ignored.
*/
(function(){
  'use strict';
  if(window.__srDustEconomyAuthorityV293)return;
  window.__srDustEconomyAuthorityV293=true;

  var RANK_BY_RARITY={
    COMMUN:0,RARE:1,EPIQUE:2,MYTHIQUE:3,ARTEFACT:4,
    LEGENDAIRE:5,INFERNAL:6,IMMORTEL:7,DIVIN:8,
    /* legacy aliases */ HEROIQUE:4,ANCESTRAL:6,PEU_COMMUN:1
  };

  function normalizeRarity(raw){
    var s=String(raw==null?'':raw).trim().toUpperCase();
    try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(_){}
    s=s.replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    if(s==='PEU__COMMUN')s='PEU_COMMUN';
    return s;
  }

  function rankForRarity(raw){
    var key=normalizeRarity(raw);
    var n=RANK_BY_RARITY[key];
    return Number.isFinite(Number(n))?Math.max(0,Math.floor(Number(n))):0;
  }

  function treeDustBonus(s){
    try{
      if(typeof treeSum==='function')return Math.max(0,Number(treeSum(s,'dust'))||0);
    }catch(_){}
    return 0;
  }

  function originalPowerOf(it){
    if(!it)return 0;
    var original=it.originalPower!=null?Number(it.originalPower):NaN;
    if(!Number.isFinite(original)){
      original=(Number(it.baseDamage)||0)+(Number(it.baseHp)||0);
      if(!(original>0))original=Number(it.power)||0;
    }
    return Math.max(0,original||0);
  }

  function valueForItem(s,it){
    if(!it||!it.rarity)return 0;
    var rank=rankForRarity(it.rarity);
    var original=originalPowerOf(it);
    var bonus=treeDustBonus(s);
    return Math.max(0,Math.floor(((rank+1)*5+original*0.2)*(1+bonus/100)));
  }

  /* Rarity alone is no longer authoritative: two pieces of the same rarity may
     have different base power because of slot and stat-quality rolls. Returning
     0 here intentionally makes old safety layers fall through to valueForItem. */
  function valueForRarity(){return 0;}

  function normalizedDust(s,it){return valueForItem(s,it);}

  try{
    if(typeof dustValue==='function'){
      normalizedDust.__srV293=true;
      normalizedDust.__srV350=true;
      normalizedDust.__srV363=true;
      normalizedDust.__srV364=true;
      normalizedDust.__srPrevious=dustValue;
      dustValue=normalizedDust;
    }
  }catch(_){ }

  try{
    window.__srDustEconomyConfigV293={
      version:293,
      revision:364,
      byRarity:{},
      normalizeRarity:normalizeRarity,
      rankForRarity:rankForRarity,
      valueForRarity:valueForRarity,
      valueForItem:valueForItem,
      originalPowerOf:originalPowerOf,
      independentOfUpgradedPower:true,
      independentOfForgeStars:false
    };
  }catch(_){ }
})();
