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

var nativeRenderHUD=renderHUD;
var overlayObserver=null;

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

renderHUD=function(){
  var out=nativeRenderHUD.apply(this,arguments);
  sync();
  return out;
};
try{window.renderHUD=renderHUD;}catch(_){}

function observeOverlay(){
  if(overlayObserver||typeof MutationObserver!=='function')return;
  var app=document.getElementById('app');
  if(!app)return;
  overlayObserver=new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var m=muts[i];
      if(m.type!=='childList')continue;
      var changed=false;
      for(var j=0;j<m.addedNodes.length;j++){
        var a=m.addedNodes[j];
        if(a&&a.nodeType===1&&a.id==='overlay'){changed=true;break;}
      }
      for(var k=0;k<m.removedNodes.length&&!changed;k++){
        var r=m.removedNodes[k];
        if(r&&r.nodeType===1&&r.id==='overlay'){changed=true;break;}
      }
      if(changed){sync();break;}
    }
  });
  overlayObserver.observe(app,{childList:true,subtree:false});
}

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

observeOverlay();
sync();
window.__srSecondaryHudSelectiveV279={version:279,sync:sync,isSecondary:secondary};
})();
