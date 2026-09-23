/* SHADOWREACH V344 / V429 · Forge Dust integrity
   Final authority loaded after every Forge/Dust layer.
   - V429 validates the new fixed rarity-based Dust values.
   - Auto-Forge and manual recycling stay identical.
   - Equipment power and upgrades never inflate recycling value.
   - Tops up only a missing delta, so an already-correct credit is never doubled.
   - Historical 7500-Dust compensation is retired in the scarce economy.
*/
(function(){
  'use strict';
  if(window.__srForgeDustIntegrityV344)return;
  window.__srForgeDustIntegrityV344=true;
  if(typeof S==='undefined'||!S.forge)return;

  var COMPENSATION=0;
  var DUST_BY_RARITY={
    COMMUN:1,PEU_COMMUN:2,RARE:4,EPIQUE:8,HEROIQUE:12,MYTHIQUE:20,
    ARTEFACT:35,LEGENDAIRE:60,INFERNAL:100,IMMORTEL:160,DIVIN:250,
    ANCESTRAL:100
  };
  var audit={forgeTopups:0,recycleTopups:0,compensation:0};

  function dustBalance(){
    var n=Number(S&&S.poussiere);
    return isFinite(n)?n:0;
  }

  function normalizeRarity(raw){
    try{
      var cfg=window.__srDustEconomyConfigV293;
      if(cfg&&typeof cfg.normalizeRarity==='function')return cfg.normalizeRarity(raw);
    }catch(_){}
    var s=String(raw==null?'':raw).trim().toUpperCase();
    try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(_){}
    return s.replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  }

  function localItemDust(it){
    if(!it||!it.rarity)return 0;
    var key=normalizeRarity(it.rarity);
    var base=Number(DUST_BY_RARITY[key]);
    if(!isFinite(base)||base<=0)return 0;
    var bonus=0;
    try{if(typeof treeSum==='function')bonus=Math.max(0,Number(treeSum(S,'dust'))||0);}catch(_){}
    return Math.max(0,Math.floor(base*(1+bonus/100)));
  }

  function itemDust(it){
    if(!it)return 0;
    try{
      var cfg=window.__srDustEconomyConfigV293;
      if(cfg&&typeof cfg.valueForItem==='function'){
        var exact=Number(cfg.valueForItem(S,it));
        if(isFinite(exact)&&exact>0)return Math.floor(exact);
      }
    }catch(_){}
    try{
      if(typeof dustValue==='function'){
        var v=Number(dustValue(S,it));
        if(isFinite(v)&&v>0)return Math.floor(v);
      }
    }catch(_){}
    return localItemDust(it);
  }

  function expectedResultDust(r){
    if(!r||!r.recycled)return 0;
    /* A freshly forged result has no upgrades, so result.power is its original
       power. Reconstruct the same value that manual recycling would use. */
    var expected=itemDust({rarity:r.rarity,power:r.power,originalPower:r.power});
    if(expected>0){r.dust=expected;return expected;}
    var direct=Number(r.dust);
    return isFinite(direct)&&direct>0?Math.floor(direct):0;
  }

  function addMissingDust(amount,kind){
    amount=Math.max(0,Math.floor(Number(amount)||0));
    if(!amount)return 0;
    try{
      S.poussiere=(Number(S.poussiere)||0)+amount;
      if(typeof saveNow==='function')saveNow();
      if(typeof renderHUD==='function')try{renderHUD();}catch(_){}
      if(typeof scheduleRender==='function')scheduleRender();
      if(kind==='forge')audit.forgeTopups+=amount;
      else audit.recycleTopups+=amount;
      return amount;
    }catch(_){return 0;}
  }

  if(typeof forgeSummon==='function'){
    var nativeForgeSummon=forgeSummon;
    forgeSummon=function(){
      var before=dustBalance();
      var res=nativeForgeSummon.apply(this,arguments)||[];
      try{
        var expected=Array.isArray(res)?res.reduce(function(sum,r){return sum+expectedResultDust(r);},0):0;
        var credited=Math.max(0,dustBalance()-before);
        if(expected>credited)addMissingDust(expected-credited,'forge');
      }catch(e){console.warn('Forge dust integrity V364 audit skipped',e);}
      return res;
    };
    try{window.forgeSummon=forgeSummon;}catch(_){}
  }

  if(typeof recycleItem==='function'){
    var nativeRecycleItem=recycleItem;
    recycleItem=function(id){
      var item=null,expected=0,before=dustBalance();
      try{
        item=(S.inventory||[]).find(function(x){return x&&x.id===id;})||null;
        if(item)expected=itemDust(item);
      }catch(_){}
      var reported=nativeRecycleItem.apply(this,arguments)||0;
      try{
        var stillThere=!!((S.inventory||[]).find(function(x){return x&&x.id===id;}));
        if(item&&!stillThere){
          var credited=Math.max(0,dustBalance()-before);
          if(expected>credited)addMissingDust(expected-credited,'recycle');
          return Math.max(Number(reported)||0,expected);
        }
      }catch(_){}
      return reported;
    };
    try{window.recycleItem=recycleItem;}catch(_){}
  }

  function grantCompensation(){
    try{
      if(typeof SMOKE!=='undefined'&&SMOKE)return;
      if(!S.forge)return;
      var previous=S.forge.dustCompensationV344;
      var already=Math.max(0,Math.floor(Number(previous&&previous.amount)||0));
      var grant=Math.max(0,COMPENSATION-already);
      if(!grant)return;
      S.forge.dustCompensationV344={amount:COMPENSATION,claimedAt:previous&&previous.claimedAt||Date.now(),updatedAt:Date.now()};
      S.poussiere=(Number(S.poussiere)||0)+grant;
      audit.compensation=grant;
      if(typeof saveNow==='function')saveNow();
      if(typeof scheduleRender==='function')scheduleRender();
      setTimeout(function(){
        try{if(typeof toast==='function')toast('Compensation Auto-Forge · +'+(typeof fmt==='function'?fmt(grant):grant)+' poussière',true);}catch(_){}
      },450);
    }catch(e){console.warn('Forge dust compensation V364 skipped',e);}
  }

  grantCompensation();
  window.__srForgeDustIntegrityV344Audit=audit;
  window.__srForgeDustIntegrityV351={version:351,value:expectedResultDust,rarityValue:function(){return 0;},audit:audit};
  window.__srForgeDustIntegrityV363={version:363,value:expectedResultDust,rarityValue:function(){return 0;},audit:audit,compensation:COMPENSATION};
  window.__srForgeDustIntegrityV364={version:364,value:expectedResultDust,itemValue:itemDust,audit:audit,compensation:COMPENSATION};
  window.__srForgeDustIntegrityV429={version:429,value:expectedResultDust,itemValue:itemDust,audit:audit,compensation:COMPENSATION,byRarity:DUST_BY_RARITY};
})();
