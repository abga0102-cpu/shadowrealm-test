/* SHADOWREACH V293 · Dust recycling economy authority
   Additive authority layer.
   V283 massively increased equipment base stats, while the legacy dustValue()
   still paid 20% of original item power. At high Forge rarity this turns one
   recycled item into tens of thousands/millions of Dust and collapses the +100
   progression target. V293 decouples Dust from combat power entirely.

   Goals:
   - no stat-power -> currency exploit
   - predictable rarity value
   - no inflation from Forge Ascension stat multipliers
   - ~4–6 weeks for a first +100 for an active late-Forge player who recycles
     most unusable drops, while keeping useful upgrades
*/
(function(){
  'use strict';
  if(window.__srDustEconomyAuthorityV293)return;
  window.__srDustEconomyAuthorityV293=true;

  var DUST_BY_RARITY={
    COMMUN:1,
    RARE:2,
    EPIQUE:4,
    MYTHIQUE:10,
    ARTEFACT:25,
    LEGENDAIRE:60,
    INFERNAL:150,
    IMMORTEL:400,
    DIVIN:1000,
    /* legacy aliases kept only for old saves */
    HEROIQUE:25,
    ANCESTRAL:150,
    PEU_COMMUN:2
  };

  function normalizedDust(s,it){
    if(!it||!it.rarity)return 0;
    return Math.max(0,Math.floor(Number(DUST_BY_RARITY[it.rarity])||1));
  }

  try{
    if(typeof dustValue==='function'){
      normalizedDust.__srV293=true;
      normalizedDust.__srPrevious=dustValue;
      dustValue=normalizedDust;
    }
  }catch(_){ }

  try{
    window.__srDustEconomyConfigV293={
      version:293,
      byRarity:Object.assign({},DUST_BY_RARITY),
      independentOfItemPower:true,
      independentOfForgeStars:true
    };
  }catch(_){ }
})();
