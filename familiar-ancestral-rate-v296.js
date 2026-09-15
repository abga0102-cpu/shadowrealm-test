/* SHADOWREACH V296 · Familiar summon-rate authority
   Durable Familiar rate owner. It keeps Ancestral at 0% before max mastery,
   enables exactly 5% direct Ancestral summons at max mastery, and sanitizes
   non-finite/negative Familiar rates before normalizing them to 100%.
   Fusion availability and non-Familiar rate systems are unchanged. */
(function(){'use strict';
if(window.__srFamiliarAncestralRateV296)return;window.__srFamiliarAncestralRateV296=true;

function finiteRate(v){v=Number(v);return isFinite(v)&&v>0?v:0;}
function petMasteryMax(){
  try{if(typeof masteryMax==='function')return Math.max(0,Number(masteryMax('pet'))||0);}catch(_){ }
  try{return Math.max(0,Number(RULES&&RULES.MASTERY_MAX)||0);}catch(_){ }
  return 50;
}
function normalizeTable(src,order){
  var out={},sum=0;
  (order||[]).forEach(function(r){var v=finiteRate(src&&src[r]);out[r]=v;sum+=v;});
  if(sum<=0){if(order&&order.length)out[order[0]]=100;return out;}
  (order||[]).forEach(function(r){out[r]=out[r]/sum*100;});
  return out;
}
function withAncestralPolicy(src,order,mastery){
  var clean=normalizeTable(src,order),max=petMasteryMax();
  var target=Math.max(0,Number(mastery)||0)>=max?5:0;
  var others=(order||[]).filter(function(r){return r!=='ANCESTRAL';});
  var otherSum=others.reduce(function(n,r){return n+finiteRate(clean[r]);},0);
  var available=Math.max(0,100-target);
  if(otherSum>0)others.forEach(function(r){clean[r]=finiteRate(clean[r])/otherSum*available;});
  else if(others.length)clean[others[0]]=available;
  clean.ANCESTRAL=target;
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