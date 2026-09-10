/* SHADOWREACH · Rebirth removal authority V281
   Final authority loaded after the dynamic UI stack. Removes every remaining
   Rebirth entry point and prevents late legacy layers from restoring it.
   Legacy save fields stay inert for compatibility. */
(function(){
'use strict';
if(window.__srRebirthRemovalAuthorityV281)return;
window.__srRebirthRemovalAuthorityV281=true;

function norm(v){try{return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}catch(_){return String(v||'').toLowerCase();}}
function retireEngine(){
  try{if(typeof rb==='function')rb=function(){return 0;};}catch(_){}
  try{if(typeof prFromFloor==='function')prFromFloor=function(){return 0;};}catch(_){}
  try{if(typeof canRebirth==='function')canRebirth=function(){return false;};}catch(_){}
  try{if(typeof doRebirth==='function')doRebirth=function(){return 0;};}catch(_){}
  try{if(typeof buyRebirth==='function')buyRebirth=function(){return false;};}catch(_){}
  try{if(typeof REBIRTH_UPGRADES!=='undefined'&&Array.isArray(REBIRTH_UPGRADES))REBIRTH_UPGRADES.splice(0,REBIRTH_UPGRADES.length);}catch(_){}
}
function removeVisible(root){
  if(!root||!root.querySelectorAll)return;
  var selectors='[data-arg="rebirth"],[data-go="rebirth"],[href*="rebirth"],.worldRebirth';
  Array.prototype.slice.call(root.querySelectorAll(selectors)).forEach(function(el){
    var host=el.closest&&el.closest('.navBtn,.worldAction,.itemRow,.card,.hubItem,.menuItem');
    (host||el).remove();
  });
  Array.prototype.slice.call(root.querySelectorAll('button,[role="button"],.navBtn,.worldAction,.itemRow,.card')).forEach(function(el){
    var tx=norm(el.textContent).trim();
    if(tx==='rebirth'||/^rebirth\b/.test(tx))el.remove();
  });
}
function cleanHtml(h){
  if(typeof h!=='string')return h;
  try{var t=document.createElement('template');t.innerHTML=h;removeVisible(t.content);return t.innerHTML;}catch(_){return h;}
}
function wrap(key){
  try{
    if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS[key]!=='function')return;
    var cur=SCREENS[key];if(cur.__srNoRebirthAuthorityV281)return;
    var w=function(){return cleanHtml(cur.apply(this,arguments));};
    w.__srNoRebirthAuthorityV281=true;SCREENS[key]=w;
  }catch(_){}
}
function install(){
  retireEngine();
  try{
    if(typeof SCREENS!=='undefined'&&SCREENS){
      wrap('accueil');wrap('progression');wrap('classement');wrap('parametres');
      var asc=function(){return typeof scrAscension==='function'?scrAscension():'';};
      asc.__srNoRebirthAuthorityV281=true;
      SCREENS.rebirth=asc;
    }
  }catch(_){}
  try{
    if(typeof ACT!=='undefined'&&ACT){ACT.doRebirth=function(){return false;};ACT.buyRebirth=function(){return false;};}
  }catch(_){}
  removeVisible(document);
  try{if(typeof route!=='undefined'&&route==='rebirth'&&typeof nav==='function')nav('progression');}catch(_){}
  try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){}
}
install();
/* Late render layers can rebuild Home after this file executes. Observe only the
   two rendered roots and remove a Rebirth entry synchronously when inserted. */
try{
  if(typeof MutationObserver==='function'){
    var obs=new MutationObserver(function(){removeVisible(document);});
    var s=document.getElementById('screen'),t=document.getElementById('tabs');
    if(s)obs.observe(s,{childList:true,subtree:true});
    if(t)obs.observe(t,{childList:true,subtree:true});
    window.__srRebirthRemovalObserverV281=obs;
  }
}catch(_){}
})();
