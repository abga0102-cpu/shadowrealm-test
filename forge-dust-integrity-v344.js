/* SHADOWREACH V344 / V351 · Forge dust integrity + one-time compensation
   Final authority loaded after every Forge/Dust layer.
   - V351 verifies Dust from canonical equipment rarity before trusting result payloads.
   - Protects filtered Forge recycling and manual comparison-button recycling.
   - Tops up only a missing delta, so an already-correct credit is never doubled.
   - Keeps the existing one-time total compensation of 6000 Dust, with no new grant.
*/
(function(){
  'use strict';
  if(window.__srForgeDustIntegrityV344)return;
  window.__srForgeDustIntegrityV344=true;
  if(typeof S==='undefined'||!S.forge)return;

  var COMPENSATION=6000;
  var CANON_DUST={
    COMMUN:1,RARE:2,EPIQUE:4,MYTHIQUE:10,ARTEFACT:25,
    LEGENDAIRE:60,INFERNAL:150,IMMORTEL:400,DIVIN:1000,
    HEROIQUE:25,ANCESTRAL:150,PEU_COMMUN:2
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

  function rarityDust(raw){
    var key=normalizeRarity(raw);
    if(!key)return 0;
    try{
      var cfg=window.__srDustEconomyConfigV293;
      if(cfg&&typeof cfg.valueForRarity==='function'){
        var exact=Number(cfg.valueForRarity(key));
        if(isFinite(exact)&&exact>0)return Math.floor(exact);
      }
      var map=cfg&&cfg.byRarity;
      var mapped=map&&Number(map[key]);
      if(isFinite(mapped)&&mapped>0)return Math.floor(mapped);
    }catch(_){}
    var own=Number(CANON_DUST[key]);
    return isFinite(own)&&own>0?Math.floor(own):0;
  }

  function expectedResultDust(r){
    if(!r||!r.recycled)return 0;
    /* Canonical rarity is authoritative. A stale payload such as dust:1 on a
       Mythique must never downgrade the reward to Common. */
    var canonical=rarityDust(r.rarity);
    if(canonical>0){r.dust=canonical;return canonical;}
    var direct=Number(r.dust);
    if(isFinite(direct)&&direct>0)return Math.floor(direct);
    return 0;
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
      }catch(e){console.warn('Forge dust integrity V351 audit skipped',e);}
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
        if(item){
          expected=rarityDust(item.rarity);
          if(!expected&&typeof dustValue==='function')expected=Math.max(0,Math.floor(Number(dustValue(S,item))||0));
        }
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
    }catch(e){console.warn('Forge dust compensation V344 skipped',e);}
  }

  grantCompensation();
  window.__srForgeDustIntegrityV344Audit=audit;
  window.__srForgeDustIntegrityV351={version:351,value:expectedResultDust,rarityValue:rarityDust,audit:audit};
})();
