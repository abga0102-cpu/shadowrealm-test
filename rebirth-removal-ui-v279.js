/* SHADOWREACH · Rebirth removal UI V279
   Final visible cleanup after V278: Sanctuary/Fusion no longer advertises PR
   rewards or PR boosts anywhere. Gameplay removal remains owned by V278. */
(function(){
'use strict';
if(window.__srRebirthRemovalUiV279)return;window.__srRebirthRemovalUiV279=true;
function clean(h){
 if(typeof h!=='string')return h;
 h=h.replace(/<div class="tiny b mt3">PR · [^<]*<\/div>/gi,'');
 h=h.replace(/(?:\s*\+\s*)?1×\s*\+50%\s*PR\s*de\s*Rebirth\s*·\s*1\s*h/gi,'');
 h=h.replace(/10(?:[\s\u202f])000\s*PR(?:\s*\+\s*)?/gi,'');
 h=h.replace(/\+\s*\+/g,'+').replace(/>\s*\+\s*</g,'><');
 return h;
}
function install(){
 try{
  if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.sanctuaire!=='function')return false;
  var cur=SCREENS.sanctuaire;if(cur.__srNoPrUiV279)return true;
  var w=function(){return clean(cur.apply(this,arguments));};w.__srNoPrUiV279=true;SCREENS.sanctuaire=w;
  try{window.scrSanctuaire=w;}catch(_){}
  if(typeof scheduleRender==='function')scheduleRender();
  return true;
 }catch(_){return false;}
}
install();var n=0,t=setInterval(function(){n++;if(install()||n>=15)clearInterval(t);},150);
})();
