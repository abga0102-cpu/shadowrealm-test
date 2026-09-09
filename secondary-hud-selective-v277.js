/* SHADOWREACH · Secondary HUD Selective V277
   Secondary screens/windows keep only the global utility controls (harvest/chat/menu),
   while player identity/progression and generic global currencies are hidden.
   Screen-specific resources stay owned by each screen topbar (Éclat, Essence, Pommes, clés, PE, etc.).
   Home keeps the full HUD. Modal overlays use the same selective rule.
   UI-only: no economy/progression/save changes.
*/
(function(){
'use strict';
if(window.__srSecondaryHudSelectiveV277)return;window.__srSecondaryHudSelectiveV277=true;
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
  app.classList.toggle('srSecondaryContext277',on);
  hud.classList.toggle('srSecondaryHud277',on);
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

var old=document.getElementById('srSecondaryHudContextV276Style');if(old)old.remove();
var st=document.createElement('style');
st.id='srSecondaryHudSelectiveV277Style';
st.textContent='\
/* Full HUD remains untouched on Home. */\
#app.srSecondaryContext277 #hud.srSecondaryHud277{display:flex!important;justify-content:flex-end!important;align-items:center!important;gap:0!important;padding:4px 8px!important;min-height:0!important;background:linear-gradient(180deg,#101A2CEE,#0A121FEE)!important;border-bottom:1px solid #00000080!important;flex:0 0 auto!important}\
/* Red-zone content: player card/progression + generic global currencies. */\
#app.srSecondaryContext277 #hud.srSecondaryHud277>.pbox{display:none!important}\
#app.srSecondaryContext277 #hud.srSecondaryHud277 .curr{display:none!important}\
/* Collapse empty currency row/gaps but keep the blue utility controls. */\
#app.srSecondaryContext277 #hud.srSecondaryHud277>.col{align-items:flex-end!important;gap:0!important;margin:0!important}\
#app.srSecondaryContext277 #hud.srSecondaryHud277>.col>.row{gap:4px!important;min-height:0!important}\
#app.srSecondaryContext277 #hud.srSecondaryHud277>.col>.row:first-child{display:none!important}\
#app.srSecondaryContext277 #hud.srSecondaryHud277 .hudBtn,#app.srSecondaryContext277 #hud.srSecondaryHud277 .menuBtn{display:flex!important}\
/* Familiers V240 used to hide the entire HUD: selective V277 wins and keeps utilities. */\
#app.srSecondaryContext277:has(.famScroll240) #hud.srSecondaryHud277{display:flex!important}\
#app.srSecondaryContext277 #screen>#topbar{position:relative;z-index:2}\
';
document.head.appendChild(st);

observeOverlay();
sync();
window.__srSecondaryHudSelectiveV277={version:277,sync:sync,isSecondary:secondary};
})();
