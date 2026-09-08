/* SHADOWREACH · mastery key requirement authority v149
   Canonical rule: every designated mastery prerequisite must be level 3/5.
   Loaded after all legacy tree renderers/wrappers so gameplay and popup agree. */
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
function labelOf(id){var n=TREE_BY_ID[id];return n?(n.label||n.short||id):id;}
function fixPopup(){
  try{
    var roots=document.querySelectorAll('.modal,.popup,.overlay,.sheet,.dialog,[role="dialog"]');
    for(var a=0;a<roots.length;a++){
      var root=roots[a],text=String(root.textContent||'').toLowerCase(),node=null;
      for(var k=0;k<keys.length;k++)if(text.indexOf(String(keys[k].label||'').toLowerCase())>=0){node=keys[k];break;}
      if(!node)continue;
      var req=node.masteryReq||[],missing=[];
      for(var r=0;r<req.length;r++)if(treeLv(S,req[r])<REQUIRED)missing.push(labelOf(req[r]));
      var leaves=root.querySelectorAll('*');
      for(var i=0;i<leaves.length;i++){
        var el=leaves[i];if(el.children.length)continue;
        var txt=String(el.textContent||'').trim();if(!txt)continue;
        for(var j=0;j<req.length;j++){
          var lab=labelOf(req[j]);
          if(txt.indexOf(lab)>=0&&/≥\s*[12]\b/.test(txt)){
            el.textContent=txt.replace(/≥\s*[12]\b/g,'≥ 3');
            el.style.color=treeLv(S,req[j])>=REQUIRED?'var(--greenLit)':'var(--textMute)';
          }
        }
        if(txt.indexOf("Requiert d'abord")>=0||txt.indexOf('Requiert d’abord')>=0){
          el.textContent=missing.length?'Requiert d’abord : '+missing.join(', ')+' niveau 3.':'Tous les prérequis de maîtrise sont remplis.';
        }
      }
    }
  }catch(_){}
}
if(typeof showTreeNode==='function'){
  var oldShow=showTreeNode;
  showTreeNode=function(id){oldShow(id);fixPopup();requestAnimationFrame(fixPopup);setTimeout(fixPopup,50);};
  try{window.showTreeNode=showTreeNode;}catch(_){}
}
if(typeof MutationObserver!=='undefined')new MutationObserver(function(){requestAnimationFrame(fixPopup);}).observe(document.body,{childList:true,subtree:true});
setTimeout(fixPopup,0);
})();