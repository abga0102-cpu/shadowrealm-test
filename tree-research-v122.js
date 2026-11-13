/* SHADOWREACH V477 · Tree research timing late authority
   V476 defined the approved research ladders in game-1.js, but this late-loaded
   compatibility file still restored the old tier II-IV values afterwards.
   V477 mirrors the approved ladders here so the final runtime cannot drift.
   Existing already-running research keeps its scheduled end time; every future
   research uses the approved V476/V477 duration through treeTime(). */
(function(){
'use strict';
if(window.__srTreeResearchV477)return;
window.__srTreeResearchV477=true;
window.__srTreeResearchV122=true;
if(typeof TREE_NODES==='undefined')return;

function mins(a){return a.map(function(v){return v*60;});}
function hours(a){return a.map(function(v){return v*3600;});}
var seconds={
  2:mins([180,185,190,195,200]),
  3:mins([600,605,610,615,620]),
  4:hours([72,77,82,87,92])
};

for(var i=0;i<TREE_NODES.length;i++){
  var n=TREE_NODES[i];
  if(!n||n.masteryKey||n.deprecatedKey)continue;
  if(seconds[n.tier])n.times=seconds[n.tier].slice();
}

window.__srTreeResearchConfigV477={
  version:477,
  preservesActiveResearch:true,
  tier2Seconds:seconds[2].slice(),
  tier3Seconds:seconds[3].slice(),
  tier4Seconds:seconds[4].slice()
};
})();