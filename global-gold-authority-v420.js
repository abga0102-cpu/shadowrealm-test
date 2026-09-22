/* SHADOWREACH V420 · Final authority for Global Gold Tree bonuses.
   Loaded after legacy economy patches so no older layer can restore 1.25%/level. */
(function(){
  'use strict';
  if(window.__srGlobalGoldAuthorityV420)return;
  window.__srGlobalGoldAuthorityV420=true;

  var ids=['n1_06','n2_06','n3_06','n4_06'];
  var perLevel=[1,2,3,4];
  var caps=[5,10,15,20];

  try{
    if(typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID){
      ids.forEach(function(id,index){
        var node=TREE_BY_ID[id];
        if(!node)return;
        node.per=perLevel[index];
        node.max=5;
        node.tierScale=false;
        node.note='+'+perLevel[index]+' % d’or global par niveau · Max +'+caps[index]+' %';
      });
    }
  }catch(_){ }

  window.__srGlobalGoldConfigV420={
    perLevelPct:perLevel.slice(),
    tierCapsPct:caps.slice(),
    totalMaxPct:50
  };
  try{if(typeof scheduleRender==='function')scheduleRender();}catch(_){ }
})();
