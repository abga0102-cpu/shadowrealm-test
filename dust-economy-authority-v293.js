/* SHADOWREACH V293 / V429 · Dust scarcity economy authority
   V429 makes Dust a scarce, rarity-driven resource instead of deriving it from
   equipment power. Recycling value is now fixed by rarity (Tree bonus still
   applies), so a huge late-game item can no longer create millions of Dust.
   Existing Dust balances are converted once at 1:100 to the new economy.
*/
(function(){
  'use strict';
  if(window.__srDustEconomyAuthorityV293)return;
  window.__srDustEconomyAuthorityV293=true;

  var DUST_BY_RARITY={
    COMMUN:1,
    PEU_COMMUN:2,
    RARE:4,
    EPIQUE:8,
    HEROIQUE:12,
    MYTHIQUE:20,
    ARTEFACT:35,
    LEGENDAIRE:60,
    INFERNAL:100,
    IMMORTEL:160,
    DIVIN:250,
    /* legacy alias */ ANCESTRAL:100
  };
  var STOCK_DIVISOR_V429=100;

  function normalizeRarity(raw){
    var s=String(raw==null?'':raw).trim().toUpperCase();
    try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(_){}
    s=s.replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
    if(s==='PEU__COMMUN')s='PEU_COMMUN';
    return s;
  }

  function valueForRarity(raw){
    var key=normalizeRarity(raw);
    var n=Number(DUST_BY_RARITY[key]);
    return Number.isFinite(n)&&n>0?Math.floor(n):0;
  }

  function treeDustBonus(s){
    try{
      if(typeof treeSum==='function')return Math.max(0,Number(treeSum(s,'dust'))||0);
    }catch(_){}
    return 0;
  }

  function valueForItem(s,it){
    if(!it||!it.rarity)return 0;
    var base=valueForRarity(it.rarity);
    if(!base)return 0;
    var bonus=treeDustBonus(s);
    return Math.max(0,Math.floor(base*(1+bonus/100)));
  }

  function migrateStockV429(){
    try{
      if(typeof S==='undefined'||!S)return {changed:false,before:0,after:0};
      if(!S.forge)S.forge={};
      var version=Math.floor(Number(S.forge.dustEconomyVersion)||0);
      var before=Math.max(0,Math.floor(Number(S.poussiere)||0));
      if(version>=429)return {changed:false,before:before,after:before};
      var after=before>0?Math.max(1,Math.floor(before/STOCK_DIVISOR_V429)):0;
      S.poussiere=after;
      S.forge.dustEconomyVersion=429;
      S.forge.dustEconomyV429={convertedAt:Date.now(),divisor:STOCK_DIVISOR_V429,before:before,after:after};
      try{if(typeof saveNow==='function'&&!(typeof SMOKE!=='undefined'&&SMOKE))saveNow();}catch(_){}
      try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
      return {changed:true,before:before,after:after};
    }catch(_){return {changed:false,before:0,after:0};}
  }

  function normalizedDust(s,it){return valueForItem(s,it);}

  try{
    if(typeof dustValue==='function'){
      normalizedDust.__srV293=true;
      normalizedDust.__srV350=true;
      normalizedDust.__srV363=true;
      normalizedDust.__srV364=true;
      normalizedDust.__srV429=true;
      normalizedDust.__srPrevious=dustValue;
      dustValue=normalizedDust;
      try{window.dustValue=normalizedDust;}catch(_){}
      try{globalThis.dustValue=normalizedDust;}catch(_){}
    }
  }catch(_){ }

  var migration=migrateStockV429();

  try{
    window.__srDustEconomyConfigV293={
      version:293,
      revision:429,
      byRarity:DUST_BY_RARITY,
      normalizeRarity:normalizeRarity,
      valueForRarity:valueForRarity,
      valueForItem:valueForItem,
      stockDivisor:STOCK_DIVISOR_V429,
      migrateStockV429:migrateStockV429,
      migration:migration,
      powerIndependent:true,
      treeBonusPreserved:true
    };
  }catch(_){ }
})();
