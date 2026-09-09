/* SHADOWREACH · Secondary HUD Context V274
   Global secondary-screen HUD authority.
   Keeps the full player HUD on Home only; secondary windows/screens keep their own topbar and contextual resources.
   Any modal overlay also hides the global player HUD without touching the underlying topbar/resources.
   UI-only: no economy/progression/save changes.
*/
(function(){
'use strict';
if(window.__srSecondaryHudContextV274)return;window.__srSecondaryHudContextV274=true;
if(typeof renderHUD!=='function')return;

var nativeRenderHUD=renderHUD;
var hudObserver=null;

function isSecondaryContext(){
  try{
    if(document.getElementById('overlay'))return true;
    if(typeof route!=='undefined'&&route!=='accueil')return true;
  }catch(_){}
  return false;
}

function syncHudContext(){
  var hud=document.getElementById('hud');
  if(!hud)return;
  var hide=isSecondaryContext();
  hud.classList.toggle('srSecondaryHudHidden274',hide);
  if(hide)hud.setAttribute('aria-hidden','true');
  else hud.removeAttribute('aria-hidden');
  var app=document.getElementById('app');
  if(app)app.classList.toggle('srSecondaryContext274',hide);
}

renderHUD=function(){
  var out=nativeRenderHUD.apply(this,arguments);
  syncHudContext();
  return out;
};
try{window.renderHUD=renderHUD;}catch(_){}

function startObserver(){
  if(hudObserver||typeof MutationObserver!=='function')return;
  var app=document.getElementById('app');
  if(!app)return;
  hudObserver=new MutationObserver(function(muts){
    var relevant=false;
    for(var i=0;i<muts.length&&!relevant;i++){
      var m=muts[i];
      if(m.type!=='childList')continue;
      for(var j=0;j<m.addedNodes.length;j++){
        var a=m.addedNodes[j];
        if(a&&a.nodeType===1&&(a.id==='overlay'||(a.querySelector&&a.querySelector('#overlay')))){relevant=true;break;}
      }
      for(var k=0;k<m.removedNodes.length&&!relevant;k++){
        var r=m.removedNodes[k];
        if(r&&r.nodeType===1&&(r.id==='overlay'||(r.querySelector&&r.querySelector('#overlay')))){relevant=true;break;}
      }
    }
    if(relevant)syncHudContext();
  });
  hudObserver.observe(app,{childList:true,subtree:false});
}

var st=document.createElement('style');
st.id='srSecondaryHudContextV274Style';
st.textContent='\
#hud.srSecondaryHudHidden274{display:none!important}\
#app.srSecondaryContext274 #screen>#topbar{position:relative;z-index:2}\
';
document.head.appendChild(st);

startObserver();
syncHudContext();
window.__srSecondaryHudContextV274={version:274,sync:syncHudContext,isSecondary:isSecondaryContext};
})();
