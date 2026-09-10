/* SHADOWREACH · mastery key requirement authority v149
   Canonical rule: every designated mastery prerequisite must be level 3/5.
   Popup synchronization is owned by runtime-tree-stability-v216.js. */
(function(){
'use strict';
if(window.__srTreeMasteryV149)return;window.__srTreeMasteryV149=true;
if(typeof TREE_NODES==='undefined'||typeof TREE_BY_ID==='undefined'||typeof treeLv!=='function')return;
var REQUIRED=3;
var keys=TREE_NODES.filter(function(n){return n&&n.masteryKey;});
keys.forEach(function(n){
  var req=(n.masteryReq||n.req||[]).slice();
  n.masteryReq=req;
  n.req=req.slice();
  n.masteryLevelRequired=REQUIRED;
  n.note='Tous les nœuds indiqués doivent être au niveau 3/5. Recherche de base : 7 jours.';
});
var previous=treeReqOk;
treeReqOk=function(s,node){
  if(node&&node.deprecatedKey)return false;
  if(node&&node.masteryKey){
    var req=node.masteryReq||node.req||[];
    return req.every(function(id){return treeLv(s,id)>=REQUIRED;});
  }
  return previous(s,node);
};
try{window.treeReqOk=treeReqOk;}catch(_){}
})();
