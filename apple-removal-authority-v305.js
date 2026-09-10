/* SHADOWREACH V305 · Apple system removal authority
   Final additive authority for the already-approved removal of Apples.
   - Apples remain only as inert legacy save fields for backward compatibility.
   - No new Apple gain from Mega Boss, Familiar fusion or Familiar Ascension.
   - Familiar Apple levelling remains disabled.
   - Apple UI/resource explanations are removed from active screens.
   No legacy save value is deleted or converted. */
(function(){'use strict';
if(window.__srAppleRemovalV305)return;window.__srAppleRemovalV305=true;

/* ---------- mechanics: no active Apple economy ---------- */
try{if(typeof megaAppleBaseReward==='function')megaAppleBaseReward=function(){return 0;};}catch(_){ }
try{if(typeof megaAppleFirstClearReward==='function')megaAppleFirstClearReward=function(){return 0;};}catch(_){ }
try{if(typeof petUpgradeCost==='function')petUpgradeCost=function(){return Infinity;};}catch(_){ }
try{if(typeof upgradePet==='function')upgradePet=function(){return false;};}catch(_){ }

/* Fusion keeps the exact current Familiar result, but cannot create/refund Apples. */
try{if(typeof fusePets==='function'&&!fusePets.__srV305){
  var oldFuse=fusePets;
  fusePets=function(){
    var before=(typeof S!=='undefined'&&S)?Number(S.apples)||0:0;
    var out=oldFuse.apply(this,arguments);
    try{if(typeof S!=='undefined'&&S)S.apples=before;}catch(_){ }
    if(out&&typeof out==='object')out.refund=0;
    return out;
  };
  fusePets.__srV305=true;fusePets.__srPrevious=oldFuse;
}}catch(_){ }

/* Familiar Ascension follows the approved reset/star rules, but Apple refunds
   are inert and must not recreate the retired currency. */
try{if(typeof doAscendMastery==='function'&&!doAscendMastery.__srV305){
  var oldAscend=doAscendMastery;
  doAscendMastery=function(sys){
    var before=(typeof S!=='undefined'&&S)?Number(S.apples)||0:0;
    var out=oldAscend.apply(this,arguments);
    if(sys==='pet'){
      try{if(typeof S!=='undefined'&&S)S.apples=before;}catch(_){ }
      if(out&&typeof out==='object')out.appleRefund=0;
    }
    return out;
  };
  doAscendMastery.__srV305=true;doAscendMastery.__srPrevious=oldAscend;
}}catch(_){ }

/* Remove Apple from the generic resource-information registry. */
try{if(typeof RESOURCE_INFO!=='undefined'&&RESOURCE_INFO&&Object.prototype.hasOwnProperty.call(RESOURCE_INFO,'apples'))delete RESOURCE_INFO.apples;}catch(_){ }

function cleanAppleUI(html){
  html=String(html||'');
  /* dedicated Apple pills / counters */
  html=html.replace(/<span class="pill"[^>]*>[^<]*(?:🍎|Pommes?)[\s\S]*?<\/span>/gi,'');
  /* obsolete Mega-Boss reward explanations */
  html=html.replace(/<div class="mute tiny mt6">Récompense par première victoire[^<]*Pomme[^<]*<\/div>/gi,'');
  html=html.replace(/La première victoire donne les Pommes et 2× les accélérateurs/gi,'La première victoire donne 2× les accélérateurs');
  /* obsolete Familiar fusion copy */
  html=html.replace(/Le Familier le plus avancé conserve son niveau, son espèce, son élément et ses Pommes investies\s*;\s*celles des doublons consommés sont remboursées\./gi,'Le Familier utilisé comme noyau conserve son espèce et son élément.');
  html=html.replace(/Pommes après remboursement/gi,'');
  return html;
}
function wrapScreen(fnName){
  try{
    var fn=eval(fnName);
    if(typeof fn!=='function'||fn.__srNoAppleV305)return;
    var wrapped=function(){return cleanAppleUI(fn.apply(this,arguments));};
    wrapped.__srNoAppleV305=true;wrapped.__srPrevious=fn;
    eval(fnName+'=wrapped');
  }catch(_){ }
}
wrapScreen('scrMegaRaid');wrapScreen('scrFamiliers');wrapScreen('scrAscension');

try{if(typeof S!=='undefined'&&S){
  S.appleSystemRetiredVersion=305;
  if(typeof saveNow==='function')saveNow();
  if(typeof scheduleRender==='function')scheduleRender();
}}catch(_){ }
window.__srAppleRemovalConfigV305={activeAppleEconomy:false,legacyFieldsPreserved:true,conversion:false};
})();
