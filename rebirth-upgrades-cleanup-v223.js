/* SHADOWREACH · Rebirth Upgrades Cleanup V223
   Removes obsolete/unwanted Rebirth upgrades without touching save data.
   Existing saved levels remain stored for compatibility, but these upgrades
   are no longer available and rb() returns 0 because their definitions are
   removed from the active REBIRTH_UPGRADES registry. */
(function(){
'use strict';
if(window.__srRebirthUpgradesCleanupV223)return;
window.__srRebirthUpgradesCleanupV223=true;
try{
  if(typeof REBIRTH_UPGRADES==='undefined'||!Array.isArray(REBIRTH_UPGRADES))return;
  var blockedKeys={atkspeed:true,critdmg:true};
  for(var i=REBIRTH_UPGRADES.length-1;i>=0;i--){
    var u=REBIRTH_UPGRADES[i]||{};
    var key=String(u.key||'').toLowerCase();
    var label=String(u.label||'').toLowerCase();
    var remove=!!blockedKeys[key] || /pomme/.test(label) || /vol\s*(de\s*)?vie/.test(label) || /lifesteal|life\s*steal/.test(key+' '+label);
    if(remove) REBIRTH_UPGRADES.splice(i,1);
  }
}catch(_){ }
})();