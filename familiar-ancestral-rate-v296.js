/* SHADOWREACH V296 · Familiar Ancestral max-mastery rate
   Additive correction to V295: Ancestral remains obtainable by fusion, but it
   can also be summoned directly at 5% once Familiar mastery reaches its max.
   The 5 points are taken proportionally from the other positive summon rates
   so the distribution always remains normalized to 100%. */
(function(){'use strict';
if(window.__srFamiliarAncestralRateV296)return;window.__srFamiliarAncestralRateV296=true;

function petMasteryMax(){
  try{if(typeof masteryMax==='function')return Math.max(0,Number(masteryMax('pet'))||0);}catch(_){ }
  try{return Math.max(0,Number(RULES&&RULES.MASTERY_MAX)||0);}catch(_){ }
  return 50;
}
function normalizedWithAncestral(out){
  if(!out||typeof out!=='object')return out;
  var next={};Object.keys(out).forEach(function(k){next[k]=Math.max(0,Number(out[k])||0);});
  var target=5,other=0;
  Object.keys(next).forEach(function(k){if(k!=='ANCESTRAL')other+=next[k];});
  if(other>0){var scale=Math.max(0,(100-target)/other);Object.keys(next).forEach(function(k){if(k!=='ANCESTRAL')next[k]*=scale;});}
  next.ANCESTRAL=target;
  return next;
}
try{if(typeof getRates==='function'&&!getRates.__srV296){
  var oldRates=getRates;
  getRates=function(system,m,a,s){
    var out=oldRates(system,m,a,s);
    if(system!=='pet')return out;
    var mastery=Math.max(0,Number(m)||0),max=petMasteryMax();
    if(mastery>=max)return normalizedWithAncestral(out);
    if(out&&out.ANCESTRAL==null)out.ANCESTRAL=0;
    return out;
  };
  getRates.__srV296=true;
}}catch(_){ }
try{if(typeof S!=='undefined'&&S){S.familiarAncestralRateVersion=296;if(typeof saveNow==='function')saveNow();if(typeof scheduleRender==='function')scheduleRender();}}catch(_){ }
window.__srFamiliarAncestralRateConfigV296={maxMasteryRate:5,fusionStillAvailable:true};
})();