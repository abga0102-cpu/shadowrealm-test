/* SHADOWREACH · Personal Tree spectacle + deeper keys v212
   Additive authority loaded after all existing tree layers.
   - Mastery keys stay at their current coordinates.
   - Each key costs exactly 100 PE.
   - Key access requires its existing mastery set PLUS up to 3 deeper descendant bonus nodes.
   - Existing levels, percentages, hybrid routes, research durations and saves are preserved.
   - Visual-only glow/pulse/energy treatment makes the radial tree more spectacular. */
(function(){
'use strict';
if(window.__srPersonalTreeSpectacleV212)return;window.__srPersonalTreeSpectacleV212=true;
if(typeof TREE_NODES==='undefined'||typeof TREE_BY_ID==='undefined'||typeof treeLv!=='function'||typeof treeReqOk!=='function')return;
var COST=100,LEVEL=3;
var keys=TREE_NODES.filter(function(n){return n&&n.masteryKey&&!n.deprecatedKey;});
function descendants(seed){
 var seen={},front=seed.slice(),out=[];seed.forEach(function(id){seen[id]=1;});
 for(var depth=0;depth<4&&front.length;depth++){
  var next=[];
  TREE_NODES.forEach(function(n){
   if(!n||n.masteryKey||n.deprecatedKey||seen[n.id])return;
   var req=n.req||[];
   if(req.some(function(id){return front.indexOf(id)>=0;})){seen[n.id]=1;next.push(n.id);out.push(n);}
  });
  front=next;
 }
 return out;
}
keys.forEach(function(k){
 k.cost=COST;
 var base=(k.masteryReq||k.req||[]).slice();
 var deep=descendants(base).filter(function(n){return Number(n.tier||0)>=3;});
 if(deep.length<3)deep=descendants(base);
 deep.sort(function(a,b){return Number(a.tier||0)-Number(b.tier||0)||String(a.id).localeCompare(String(b.id));});
 var extra=[];for(var i=0;i<deep.length&&extra.length<3;i++)if(base.indexOf(deep[i].id)<0)extra.push(deep[i].id);
 k.masteryBaseReq=base;k.masteryDeepReq=extra;k.masteryReq=base.concat(extra);k.req=k.masteryReq.slice();k.masteryLevelRequired=LEVEL;
 k.note='Maîtrise avancée : prérequis niveau 3/5 + bonus profonds requis. Coût : 100 PE. Recherche de base : 7 jours.';
});
var previous=treeReqOk;
treeReqOk=function(s,node){
 if(node&&node.deprecatedKey)return false;
 if(node&&node.masteryKey){return (node.masteryReq||node.req||[]).every(function(id){return treeLv(s,id)>=LEVEL;});}
 return previous(s,node);
};
try{window.treeReqOk=treeReqOk;}catch(_){}
/* Visual enhancement only. */
var style=document.createElement('style');style.id='srTreeSpectacle212Style';style.textContent='\
.srRadialTree{filter:drop-shadow(0 0 16px rgba(63,207,214,.12));overflow:visible}\
.srRadialTree g[data-act="treeNode"] circle{transition:filter .22s ease,stroke-width .22s ease,transform .22s ease;transform-box:fill-box;transform-origin:center}\
.srRadialTree g[data-act="treeNode"]:active circle{transform:scale(1.09)}\
.srRadialTree g[data-act="treeNode"] circle[opacity=".10"]{animation:srTreePulse212 1.8s ease-in-out infinite;filter:drop-shadow(0 0 9px currentColor)}\
.srRadialTree line[stroke-width="3"]{filter:drop-shadow(0 0 4px rgba(143,239,244,.5));stroke-dasharray:8 5;animation:srTreeFlow212 2.4s linear infinite}\
@keyframes srTreePulse212{0%,100%{opacity:.08}50%{opacity:.28}}\
@keyframes srTreeFlow212{to{stroke-dashoffset:-26}}\
@media (prefers-reduced-motion:reduce){.srRadialTree *{animation:none!important;transition:none!important}}';document.head.appendChild(style);
/* Enrich the existing graph without moving any node. */
if(typeof treeGraph==='function'){
 var oldGraph=treeGraph;
 treeGraph=function(active,remain){
  var html=oldGraph(active,remain);
  try{
   html=html.replace('<svg class="srRadialTree"','<svg class="srRadialTree" data-sr-spectacle="212"');
   html=html.replace(/(<circle cx="700" cy="700" r="76"[^>]*>)/,'<circle cx="700" cy="700" r="92" fill="none" stroke="#3FCFD6" stroke-width="1.5" opacity=".22"><animate attributeName="r" values="86;98;86" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".10;.32;.10" dur="3s" repeatCount="indefinite"/></circle>$1');
  }catch(_){}
  return html;
 };
 try{window.treeGraph=treeGraph;}catch(_){}
}
function syncPopup(){
 try{
  document.querySelectorAll('.modal,.popup,.overlay,.sheet,.dialog,[role="dialog"]').forEach(function(root){
   var text=String(root.textContent||'').toLowerCase(),key=keys.find(function(k){return text.indexOf(String(k.label||'').toLowerCase())>=0;});if(!key)return;
   var missing=(key.masteryReq||[]).filter(function(id){return treeLv(S,id)<LEVEL;});
   var leaves=root.querySelectorAll('*');
   for(var i=0;i<leaves.length;i++)if(!leaves[i].children.length){var t=String(leaves[i].textContent||'');if(t.indexOf("Requiert d'abord")>=0||t.indexOf('Requiert d’abord')>=0)leaves[i].textContent=missing.length?'Requiert d’abord : '+missing.length+' bonus à atteindre au niveau 3/5.':'Maîtrise complète · clé disponible pour 100 PE.';}
  });
 }catch(_){}
}
if(typeof MutationObserver!=='undefined')new MutationObserver(function(){requestAnimationFrame(syncPopup);}).observe(document.body,{childList:true,subtree:true});
setTimeout(syncPopup,0);
})();