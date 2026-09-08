/* SHADOWREACH · Forge power feedback v148
   Additive feedback layer. After a real Forge EQUIP action, measures real power
   before/after equipItem and shows the signed change briefly at screen center.
   Also lets the v147 safe test demonstrate the centered feedback without mutating state.
   No inventory, equipment rules, economy, drops, filters or saves are changed here. */
(function(){
'use strict';
if(window.__srForgePowerFeedbackV148)return;
window.__srForgePowerFeedbackV148=true;
var ROOT='srForgePowerFeedback148',timer=0;
function fmt2(v){try{return typeof fmt==='function'?fmt(v):Number(v||0).toLocaleString('fr-FR');}catch(_){return String(v||0);}}
function actualPower(){try{return Math.round(Number(typeof computePower==='function'?computePower(S):(S&&S.power))||0);}catch(_){return 0;}}
function show(before,after,test){
 before=Math.round(Number(before)||0);after=Math.round(Number(after)||0);var d=after-before;
 var old=document.getElementById(ROOT);if(old)old.remove();if(timer)clearTimeout(timer);
 var box=document.createElement('div');box.id=ROOT;box.setAttribute('aria-live','polite');
 box.style.cssText='position:fixed;z-index:12000;left:50%;top:48%;transform:translate(-50%,-50%) scale(.94);pointer-events:none;min-width:190px;max-width:calc(100vw - 36px);padding:11px 16px;border-radius:13px;background:rgba(6,12,21,.92);border:1px solid '+(d>0?'#3fb95099':d<0?'#ff626299':'#64748b88')+';box-shadow:0 12px 36px #000a;text-align:center;font-family:inherit;opacity:0;transition:opacity .16s ease,transform .16s ease;';
 box.innerHTML='<div style="font-size:9px;font-weight:900;letter-spacing:.8px;color:#91a0b7">'+(test?'TEST · ':'')+'PUISSANCE</div><div style="font-size:12px;font-weight:800;color:#cbd5e1;margin-top:2px">'+fmt2(before)+' → '+fmt2(after)+'</div><div style="font-size:20px;line-height:1.15;font-weight:1000;margin-top:3px;color:'+(d>0?'#6ee7a0':d<0?'#ff7474':'#aebbd0')+'">'+(d>0?'+':d<0?'−':'')+fmt2(Math.abs(d))+'</div>';
 document.body.appendChild(box);requestAnimationFrame(function(){box.style.opacity='1';box.style.transform='translate(-50%,-50%) scale(1)';});
 timer=setTimeout(function(){box.style.opacity='0';box.style.transform='translate(-50%,-54%) scale(.98)';setTimeout(function(){if(box.parentNode)box.remove();},180);},1450);
}
/* Capture the authoritative v146 EQUIP click before its handler runs, then measure after equipItem completes. */
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('#srForgeArenaPreview146 [data-sr-fp146="equip"]'):null;if(!b)return;var before=actualPower();setTimeout(function(){var after=actualPower();show(before,after,false);},0);},false);
/* Safe v147 test: show the centered feedback with synthetic numbers only. */
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('#srForgeComparisonTest147 [data-t147="equip"]'):null;if(!b)return;var before=actualPower()||125400;var gain=Math.max(100,Math.round(before*.052));show(before,before+gain,true);},true);
window.__srShowForgePowerFeedbackV148=show;
})();