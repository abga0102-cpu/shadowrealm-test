/* SHADOWREACH · mastery key popup native display fix v128
   Mastery keys require every mastery prerequisite at 3/5. The base popup still
   rendered generic >=1 labels; this wrapper corrects the freshly opened popup
   without changing normal tree-node requirements. */
(function(){
'use strict';
if(window.__srTreeMasteryUIV128)return;window.__srTreeMasteryUIV128=true;
if(typeof showTreeNode!=='function'||typeof TREE_BY_ID==='undefined'||typeof treeLv!=='function')return;
var baseShowTreeNode=showTreeNode;
function labelOf(id){var n=TREE_BY_ID[id];return n?(n.label||n.short||id):id;}
function fixMasteryPopup(id){
  try{
    var node=TREE_BY_ID[id];if(!node||!node.masteryKey)return;
    var req=node.masteryReq||node.req||[];
    var leaves=document.querySelectorAll('body *');
    var missing=[];
    for(var r=0;r<req.length;r++)if(treeLv(S,req[r])<3)missing.push(labelOf(req[r]));
    for(var i=0;i<leaves.length;i++){
      var el=leaves[i];if(el.children.length)continue;
      var txt=String(el.textContent||'').trim();if(!txt)continue;
      for(var j=0;j<req.length;j++){
        var lab=labelOf(req[j]);
        if(txt.indexOf(lab)>=0&&/≥\s*1\b/.test(txt)){
          el.textContent=txt.replace(/≥\s*1\b/g,'≥ 3');
          el.style.color=treeLv(S,req[j])>=3?'var(--greenLit)':'var(--textMute)';
        }
      }
      if(txt.indexOf("Requiert d'abord")>=0||txt.indexOf('Requiert d’abord')>=0){
        el.textContent=missing.length?'Requiert d’abord : '+missing.join(', ')+' niveau 3.':'Tous les prérequis de maîtrise sont remplis.';
      }
    }
  }catch(_){}
}
showTreeNode=function(id){baseShowTreeNode(id);fixMasteryPopup(id);requestAnimationFrame(function(){fixMasteryPopup(id);});setTimeout(function(){fixMasteryPopup(id);},40);};
try{window.showTreeNode=showTreeNode;}catch(_){}
})();