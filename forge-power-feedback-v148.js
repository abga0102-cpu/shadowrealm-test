/* SHADOWREACH · Forge power feedback V251
   Hard-disable the legacy centre-screen power delta popup.
   Root cause remains isolated to this legacy feedback layer; gameplay/equipment/power formulas are untouched.
   This guard prevents any stale/duplicate invocation from making the popup visible. */
(function(){
'use strict';
if(window.__srForgePowerFeedbackV251)return;
window.__srForgePowerFeedbackV251=true;

var ROOT='srForgePowerFeedback148';
function remove(){
  try{var el=document.getElementById(ROOT);if(el)el.remove();}catch(_){}
}

/* Global visual kill-switch for every version of this legacy popup. */
var style=document.createElement('style');
style.id='srForgePowerFeedbackV251Style';
style.textContent='#'+ROOT+'{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
document.head.appendChild(style);

/* Remove anything already mounted and make the old public hook inert. */
remove();
try{window.__srShowForgePowerFeedbackV148=function(){remove();};}catch(_){}

/* Lightweight safety net only while legacy code may still attempt to mount it. */
var checks=0;
var timer=setInterval(function(){remove();checks++;if(checks>=20)clearInterval(timer);},250);
})();
