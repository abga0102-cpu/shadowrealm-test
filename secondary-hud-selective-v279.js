/* SHADOWREACH · Secondary HUD Selective V279
   Corrected from the visual reference:
   - Secondary screens/windows keep the normal player/resource HUD, including resource pills.
   - The red utility group (harvest/moon, chat, menu) is hidden outside Home and while a modal is open.
   - Screen-specific resources remain owned by each screen topbar (Éclat, Essence, Pommes, clés, PE, etc.).
   Home remains unchanged. UI-only: no economy/progression/save changes.
*/
(function(){
'use strict';
if(window.__srSecondaryHudSelectiveV279)return;window.__srSecondaryHudSelectiveV279=true;
if(typeof renderHUD!=='function')return;

function secondary(){
  try{
    if(document.getElementById('overlay'))return true;
    return typeof route!=='undefined'&&route!=='accueil';
  }catch(_){return false;}
}

function sync(){
  var app=document.getElementById('app'),hud=document.getElementById('hud');
  if(!app||!hud)return;
  var on=secondary();
  app.classList.toggle('srSecondaryContext279',on);
  hud.classList.toggle('srSecondaryHud279',on);
  hud.removeAttribute('aria-hidden');
}

/* Route context follows the canonical BottomNav render lifecycle; modal context
   follows the canonical modal lifecycle. Startup remains synchronized below. */
window.addEventListener('sr:bottomnavrendered',sync);
window.addEventListener('sr:modal-state',sync);

['srSecondaryHudContextV276Style','srSecondaryHudSelectiveV277Style','srSecondaryHudSelectiveV278Style'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});
var st=document.createElement('style');
st.id='srSecondaryHudSelectiveV279Style';
st.textContent='\
/* Keep the HUD, player card and resource pills on secondary screens. */\
#app.srSecondaryContext279 #hud.srSecondaryHud279{display:flex!important}\
#app.srSecondaryContext279 #hud.srSecondaryHud279>.pbox{display:flex!important}\
#app.srSecondaryContext279 #hud.srSecondaryHud279 .curr{display:flex!important}\
/* Red-circled controls: hide moon/harvest, chat and menu outside Home / during modal windows. */\
#app.srSecondaryContext279 #hud.srSecondaryHud279 .hudBtn,\
#app.srSecondaryContext279 #hud.srSecondaryHud279 .menuBtn{display:none!important}\
/* Familiers V240 historically hides the whole HUD; V279 is the final selective authority. */\
#app.srSecondaryContext279:has(.famScroll240) #hud.srSecondaryHud279{display:flex!important}\
#app.srSecondaryContext279 #screen>#topbar{position:relative;z-index:2}\
';
document.head.appendChild(st);

sync();
window.__srSecondaryHudSelectiveV279={version:279,sync:sync,isSecondary:secondary};
})();
