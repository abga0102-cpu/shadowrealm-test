/* SHADOWREACH V293 / V363 · Dust recycling economy authority
   Canonical rarity-based Dust values.
   V363 makes Auto-Forge recycling meaningful again: rejected Common/Rare gear
   no longer collapses to +1/+2 Dust, while higher rarities keep a controlled
   progression curve. Values stay rarity-based to avoid upgrade/recycle loops.
*/
(function(){
  'use strict';
  if(window.__srDustEconomyAuthorityV293)return;
  window.__srDustEconomyAuthorityV293=true;

  var DUST_BY_RARITY={
    COMMUN:8,
    RARE:20,
    EPIQUE:50,
    MYTHIQUE:125,
    ARTEFACT:300,
    LEGENDAIRE:750,
    INFERNAL:1800,
    IMMORTEL:4500,
    DIVIN:12000,
    /* legacy aliases kept only for old saves */
    HEROIQUE:300,
    ANCESTRAL:1800,
    PEU_COMMUN:12
  };

  function normalizeRarity(raw){
    var s=String(raw==null?'':raw).trim().toUpperCase();
    try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(_){}
    s=s.replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    if(s==='PEU__COMMUN')s='PEU_COMMUN';
    return s;
  }

  function valueForRarity(raw){
    var key=normalizeRarity(raw);
    if(!key||!Object.prototype.hasOwnProperty.call(DUST_BY_RARITY,key))return 0;
    return Math.max(0,Math.floor(Number(DUST_BY_RARITY[key])||0));
  }

  function normalizedDust(s,it){
    if(!it||!it.rarity)return 0;
    return valueForRarity(it.rarity);
  }

  try{
    if(typeof dustValue==='function'){
      normalizedDust.__srV293=true;
      normalizedDust.__srV350=true;
      normalizedDust.__srV363=true;
      normalizedDust.__srPrevious=dustValue;
      dustValue=normalizedDust;
    }
  }catch(_){ }

  try{
    window.__srDustEconomyConfigV293={
      version:293,
      revision:363,
      byRarity:Object.assign({},DUST_BY_RARITY),
      normalizeRarity:normalizeRarity,
      valueForRarity:valueForRarity,
      independentOfItemPower:true,
      independentOfForgeStars:true
    };
  }catch(_){ }
})();
