/* SHADOWREACH V296 · Familiar summon-rate authority
   Durable Familiar rate owner. It keeps Ancestral at 0% before max mastery,
   enables exactly 5% direct Ancestral summons at max mastery, and repairs
   invalid Familiar rate tables before applying that policy. Fusion and
   non-Familiar rate systems are unchanged. */
(function(){'use strict';
if(window.__srFamiliarAncestralRateV296)return;window.__srFamiliarAncestralRateV296=true;

function finiteRate(v){v=Number(v);return isFinite(v)&&v>0?v:0;}
function petMasteryMax(){
  try{if(typeof masteryMax==='function')return Math.max(0,Number(masteryMax('pet'))||0);}catch(_){ }
  try{return Math.max(0,Number(RULES&&RULES.MASTERY_MAX)||0);}catch(_){ }
  return 50;
}
function rateTableNeedsRepair(src,order){
  var total=0;
  for(var i=0;i<(order||[]).length;i++){
    var raw=Number(src&&src[order[i]]);
    if(!isFinite(raw)||raw<0)return true;
    total+=raw;
  }
  return !(total>0);
}
function normalizeTable(src,order){
  var out={},sum=0;
  (order||[]).forEach(function(r){var v=finiteRate(src&&src[r]);out[r]=v;sum+=v;});
  if(sum<=0){if(order&&order.length)out[order[0]]=100;return out;}
  (order||[]).forEach(function(r){out[r]=out[r]/sum*100;});
  return out;
}
function withAncestralPolicy(src,order,mastery){
  var max=petMasteryMax(),target=Math.max(0,Number(mastery)||0)>=max?5:0;
  if(target===0&&!rateTableNeedsRepair(src,order)){
    if(src.ANCESTRAL==null)src.ANCESTRAL=0;
    else if(finiteRate(src.ANCESTRAL)!==0){
      var pre=normalizeTable(src,order),preOthers=(order||[]).filter(function(r){return r!=='ANCESTRAL';});
      var preSum=preOthers.reduce(function(n,r){return n+finiteRate(pre[r]);},0);
      if(preSum>0)preOthers.forEach(function(r){pre[r]=finiteRate(pre[r])/preSum*100;});
      pre.ANCESTRAL=0;return pre;
    }
    return src;
  }
  var clean=normalizeTable(src,order),current=finiteRate(clean.ANCESTRAL);
  if(Math.abs(current-target)>1e-9){
    var others=(order||[]).filter(function(r){return r!=='ANCESTRAL';});
    var otherSum=others.reduce(function(n,r){return n+finiteRate(clean[r]);},0);
    var available=Math.max(0,100-target);
    if(otherSum>0)others.forEach(function(r){clean[r]=finiteRate(clean[r])/otherSum*available;});
    else if(others.length)clean[others[0]]=available;
    clean.ANCESTRAL=target;
  }
  return clean;
}
try{if(typeof getRates==='function'&&!getRates.__srV296){
  var oldRates=getRates;
  getRates=function(system,m,a,s){
    var out=oldRates.apply(this,arguments);
    if(system!=='pet'||!out)return out;
    var order=(typeof PET_RARITY_ORDER!=='undefined'&&Array.isArray(PET_RARITY_ORDER))?PET_RARITY_ORDER.slice():Object.keys(out);
    if(order.indexOf('ANCESTRAL')<0)order.push('ANCESTRAL');
    return withAncestralPolicy(out,order,m);
  };
  getRates.__srV296=true;getRates.__srPrevious=oldRates;
}}catch(_){ }
try{if(typeof S!=='undefined'&&S){S.familiarAncestralRateVersion=296;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srFamiliarAncestralRateConfigV296={maxMasteryRate:5,fusionStillAvailable:true,normalizesInvalidRates:true,rateOwner:true};
})();