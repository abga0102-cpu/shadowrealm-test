/* SHADOWREACH · Secondary HUD Selective V278
   Corrected interpretation from the visual reference:
   - Secondary screens/windows KEEP the normal player/resource HUD, including the blue resource pills.
   - The red utility group (harvest/moon, chat, menu) is hidden outside Home and while a modal is open.
   - Screen-specific resources remain owned by each screen topbar (Éclat, Essence, Pommes, clés, PE, etc.).
   Home remains unchanged. UI-only: no economy/progression/save changes.
*/
(function(){
'use strict';
if(window.__srSecondaryHudSelectiveV278)return;window.__srSecondaryHudSelectiveV278=true;
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
  app.classList.toggle('srSecondaryContext278',on);
  hud.classList.toggle('srSecondaryHud278',on);
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

['srSecondaryHudContextV276Style','srSecondaryHudSelectiveV277Style'].forEach(function(id){var x=document.getElementById(id);if(x)x.remove();});
var st=document.createElement('style');
st.id='srSecondaryHudSelectiveV278Style';
st.textContent='\
/* Keep the HUD itself, player card and resource pills on secondary screens. */\
#app.srSecondaryContext278 #hud.srSecondaryHud278{display:flex!important}\
#app.srSecondaryContext278 #hud.srSecondaryHud278>.pbox{display:flex!important}\
#app.srSecondaryContext278 #hud.srSecondaryHud278 .curr{display:flex!important}\
/* Red-circled utility controls: hide outside Home / during modal windows. */\
#app.srSecondaryContext278 #hud.srSecondaryHud278 .hudBtn,\
#app.srSecondaryContext278 #hud.srSecondaryHud278 .menuBtn{display:none!important}\
/* Remove the now-empty utility gap while preserving the resource rows. */\
#app.srSecondaryContext278 #hud.srSecondaryHud278>.col>.row:last-child{gap:4px!important}\
/* Familiers V240 historically hides the entire HUD; V278 is the final authority. */\
#app.srSecondaryContext278:has(.famScroll240) #hud.srSecondaryHud278{display:flex!important}\
#app.srSecondaryContext278 #screen>#topbar{position:relative;z-index:2}\
';
document.head.appendChild(st);

observeOverlay();
sync();
window.__srSecondaryHudSelectiveV278={version:278,sync:sync,isSecondary:secondary};
})();
