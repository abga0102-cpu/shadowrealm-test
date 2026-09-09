/* SHADOWREACH · V255 retirement loader
   V255 flat power compensation is retired. Load the source-based V256 authority instead.
*/
(function(){
'use strict';
if(window.__srPowerIntegrityV255Retired)return;
window.__srPowerIntegrityV255Retired=true;
try{if(typeof S!=='undefined'){delete S.powerIntegrityCompensationV255;delete S.powerIntegrityCompensationV255At;}}catch(_){}
try{localStorage.removeItem('shadowreach.power.integrity.v255');}catch(_){}
if(window.__srPowerSourceIntegrityV256)return;
var s=document.createElement('script');
s.src='power-source-integrity-v256.js?v=2026.09.09.256';
s.async=false;
document.head.appendChild(s);
})();
