/* SHADOWREACH · Forge interaction recovery V317
   Prevents fixed Forge comparison surfaces from swallowing taps intended for
   the rest of the game. Only the comparison's own controls remain interactive.
   Presentation-only: no Forge economy, inventory, save or progression changes. */
(function(){
'use strict';
if(window.__srForgeInteractionRecoveryV317)return;
window.__srForgeInteractionRecoveryV317=true;
var ID='srForgeInteractionRecoveryV317Style';
if(document.getElementById(ID))return;
var roots=['#srForgeArenaPreview142','#srForgeArenaPreview143','#srForgeArenaPreview145','#srForgeArenaPreview146'];
var st=document.createElement('style');
st.id=ID;
st.textContent=roots.join(',')+'{pointer-events:none!important;touch-action:auto!important}'+
 roots.map(function(r){return r+' button,'+r+' [data-sr-fp],'+r+' [data-sr-fp143],'+r+' [data-sr-fp145],'+r+' [data-sr-fp146]';}).join(',')+'{pointer-events:auto!important;touch-action:manipulation!important}';
document.head.appendChild(st);
})();
