/* SHADOWREACH · Rebirth Floor Skip Balance V225
   Rebalances only Saut d'étage. 50 levels cost exactly 15,000 PR in total.
   Existing purchased levels/save data are preserved; only future level prices change. */
(function(){
'use strict';
if(window.__srRebirthFloorSkipV225)return;
window.__srRebirthFloorSkipV225=true;
try{
  if(typeof REBIRTH_UPGRADES==='undefined'||!Array.isArray(REBIRTH_UPGRADES))return;
  var def=REBIRTH_UPGRADES.find(function(u){return u&&u.key==='floorSkip';});
  if(!def)return;
  var costs=[];
  for(var i=0;i<50;i++) costs.push(Math.round(50+(500*i/49)));
  /* Symmetric 50 -> 550 curve: 25 pairs x 600 = exactly 15,000 PR. */
  def.max=50;
  def.costDiv=1;
  def.costs=costs;
  def.totalCost=15000;
  if(typeof scheduleRender==='function')scheduleRender();
}catch(_){ }
})();