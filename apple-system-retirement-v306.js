/* SHADOWREACH V306 · Apple system retirement
   Completes the already-approved removal of Apples without deleting legacy save data.
   V283/V286 retired Familiar Apple levelling; V305 stopped fusion/Ascension refunds.
   This authority closes the remaining live paths: Mega-Boss Apple rewards and Apple UI.
   Legacy `apples` / `applesInvested` fields remain inert for backward compatibility. */
(function(){'use strict';
if(window.__srAppleRetirementV306)return;window.__srAppleRetirementV306=true;

/* No active Apple income. */
try{if(typeof megaAppleBaseReward==='function')megaAppleBaseReward=function(){return 0;};}catch(_){ }
try{if(typeof megaAppleFirstClearReward==='function')megaAppleFirstClearReward=function(){return 0;};}catch(_){ }
/* Apple levelling stays impossible even if an older layer is reintroduced. */
try{if(typeof petUpgradeCost==='function')petUpgradeCost=function(){return Infinity;};}catch(_){ }
try{if(typeof upgradePet==='function')upgradePet=function(){return false;};}catch(_){ }

/* Generic resource popup must not expose a retired currency. */
try{if(typeof RESOURCE_INFO!=='undefined'&&RESOURCE_INFO&&Object.prototype.hasOwnProperty.call(RESOURCE_INFO,'apples'))delete RESOURCE_INFO.apples;}catch(_){ }

function clean(html){
  html=String(html||'');
  /* Remove standalone Apple counters / boosts. */
  html=html.replace(/<span class="pill"[^>]*>[^<]*(?:🍎|Gain Pommes?)[\s\S]*?<\/span>/gi,'');
  /* Mega Boss keeps its accelerator reward, but not Apple copy. */
  html=html.replace(/La première victoire donne les Pommes et 2× les accélérateurs/gi,'La première victoire donne 2× les accélérateurs');
  html=html.replace(/<div class="mute tiny mt6">Récompense par première victoire[^<]*Pomme[^<]*<\/div>/gi,'');
  /* Familiar fusion text reflects the no-level/no-Apple model. */
  html=html.replace(/Le Familier le plus avancé conserve son niveau, son espèce, son élément et ses Pommes investies\s*;\s*celles des doublons consommés sont remboursées\./gi,'Le Familier utilisé comme noyau conserve son espèce et son élément.');
  return html;
}
function wrap(name){
  try{
    var fn=eval(name);if(typeof fn!=='function'||fn.__srV306)return;
    var w=function(){return clean(fn.apply(this,arguments));};
    w.__srV306=true;w.__srPrevious=fn;eval(name+'=w');
  }catch(_){ }
}
wrap('scrMegaRaid');wrap('scrFamiliers');

try{if(typeof S!=='undefined'&&S){
  S.appleSystemRetiredVersion=306;
  if(typeof saveNow==='function')saveNow();
  if(typeof scheduleRender==='function')scheduleRender();
}}catch(_){ }
window.__srAppleRetirementConfigV306={active:false,megaReward:false,legacyFieldsPreserved:true,conversion:false};
})();
