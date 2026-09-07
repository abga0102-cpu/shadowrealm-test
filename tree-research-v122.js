/* SHADOWREACH · tree research balance v122
   Rebalances normal node research times by tier. Existing active research keeps
   its already-scheduled end time; all future node levels use these tables. */
(function(){
'use strict';
if(window.__srTreeResearchV122)return;window.__srTreeResearchV122=true;
if(typeof TREE_NODES==='undefined')return;
var byTier={
  2:[32,60,92,120,152],
  3:[152,212,272,332,392],
  4:[632,812,992,1172,1440]
};
function mins(a){return a.map(function(v){return v*60;});}
var seconds={2:mins(byTier[2]),3:mins(byTier[3]),4:mins(byTier[4])};
for(var i=0;i<TREE_NODES.length;i++){
  var n=TREE_NODES[i];
  if(!n||n.masteryKey||n.deprecatedKey)continue;
  if(seconds[n.tier])n.times=seconds[n.tier].slice();
}
})();