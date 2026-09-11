/* SHADOWREACH · Legacy floor reward compensation v141 · RETIRED OWNER
   The exact floor25/floor50/floor75 make-good logic and persisted V141 markers
   now live in accomplishments-reward-fix-v127.js so boot and imported saves share
   one durable Accomplishments legacy-reward migration owner.

   This compatibility marker remains loaded temporarily during the staged lean-code
   rollout. It must not grant rewards, wrap migration/render lifecycles, or schedule
   retry timers. A later L1 batch may unload the marker after regression soak. */
(function(){
'use strict';
if(window.__srFloorCompV141)return;
window.__srFloorCompV141=true;
window.__srFloorCompV141Retired=true;
})();
