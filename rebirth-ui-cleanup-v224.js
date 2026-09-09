/* SHADOWREACH · Rebirth UI Cleanup V224
   Final UI authority after V222/V221: removes PG from Rebirth and re-applies
   the active upgrade cleanup as a defensive pass without touching save values. */
(function(){
'use strict';
if(window.__srRebirthUiCleanupV224)return;
window.__srRebirthUiCleanupV224=true;

function blocked(u){
  if(!u)return false;
  var k=String(u.key||'').toLowerCase(),l=String(u.label||'').toLowerCase();
  return k==='regen'||k==='lifesteal'||k==='atkspeed'||k==='critdmg'||k==='apples'||
    /r[eé]g[eé]n[eé]ration/.test(l)||/vol\s*(de\s*)?vie/.test(l)||/vitesse.*attaque|vit\.\s*attaque/.test(l)||
    /d[eé]g[aâ]ts?\s*crit/.test(l)||/pomme/.test(l);
}
function prune(){
  try{
    if(typeof REBIRTH_UPGRADES==='undefined'||!Array.isArray(REBIRTH_UPGRADES))return;
    for(var i=REBIRTH_UPGRADES.length-1;i>=0;i--)if(blocked(REBIRTH_UPGRADES[i]))REBIRTH_UPGRADES.splice(i,1);
  }catch(_){ }
}
function cleanHtml(html){
  if(typeof html!=='string')return html;
  /* V222 places PG as the second span in this exact compact section header. */
  html=html.replace(/(<div class="srRbHead"><span>AMÉLIORATIONS PERMANENTES<\/span>)<span>[^<]*\sPG<\/span>/i,'$1');
  return html;
}
function install(){
  prune();
  try{
    if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.rebirth!=='function')return false;
    if(SCREENS.rebirth.__srUiCleanupV224)return true;
    var prior=SCREENS.rebirth;
    var wrapped=function(){prune();return cleanHtml(prior.apply(this,arguments));};
    wrapped.__srUiCleanupV224=true;
    SCREENS.rebirth=wrapped;
    try{window.scrRebirth=wrapped;}catch(_){ }
    if(typeof scheduleRender==='function')scheduleRender();
    return true;
  }catch(_){return false;}
}

/* This file is loaded after V222 spectacle and V221 scroll in the dynamic core,
   so installation is normally immediate. Short retries cover slow/mobile loads
   without adding another global observer or permanent timer. */
if(!install()){
  var tries=0,t=setInterval(function(){tries++;if(install()||tries>=12)clearInterval(t);},100);
}
})();