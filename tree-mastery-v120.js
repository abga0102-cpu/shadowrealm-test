/* SHADOWREACH · mastery key requirement fix v120
   All mastery raid keys require every mastery node at level 3/5 minimum.
   Also corrects the detail popup so it shows >= 3 instead of the generic >= 1. */
(function(){
'use strict';
if(window.__srTreeMasteryV120)return;window.__srTreeMasteryV120=true;
if(typeof TREE_NODES==='undefined'||typeof treeLv!=='function'||typeof treeReqOk!=='function')return;

/* Re-assert the real gameplay rule after all earlier tree wrappers. */
var previousTreeReqOk=treeReqOk;
treeReqOk=function(s,node){
  if(node&&node.masteryKey){
    var req=node.masteryReq||node.req||[];
    for(var i=0;i<req.length;i++)if(treeLv(s,req[i])<3)return false;
    return true;
  }
  return previousTreeReqOk(s,node);
};
try{window.treeReqOk=treeReqOk;}catch(_){}

function masteryNodeFromTitle(text){
  text=String(text||'').toLowerCase();
  if(text.indexOf('clé raid familier')>=0)return typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID.mk_familier;
  if(text.indexOf('clé raid or')>=0)return typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID.mk_or;
  if(text.indexOf('clé raid minerais')>=0)return typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID.mk_minerai;
  if(text.indexOf('clé raid pe')>=0)return typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID.mk_pe;
  if(text.indexOf('clé raid compétence')>=0)return typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID.mk_competence;
  return null;
}
function nodeLabel(id){
  var n=typeof TREE_BY_ID!=='undefined'&&TREE_BY_ID[id];
  return n?(n.short||n.label||id):id;
}
function syncPopup(){
  try{
    var candidates=document.querySelectorAll('.modal,.popup,.overlay,.sheet,.dialog,[role="dialog"]');
    for(var c=0;c<candidates.length;c++){
      var root=candidates[c],node=masteryNodeFromTitle(root.textContent);
      if(!node)continue;
      var req=node.masteryReq||node.req||[];
      var els=root.querySelectorAll('*');
      for(var i=0;i<els.length;i++){
        var el=els[i];
        if(el.children.length)continue;
        var txt=String(el.textContent||'').trim();
        if(!txt)continue;
        for(var r=0;r<req.length;r++){
          var label=nodeLabel(req[r]);
          if(txt.indexOf(label)>=0&&/≥\s*[12]/.test(txt)){
            el.textContent=txt.replace(/≥\s*[12]/g,'≥ 3');
            var ok=treeLv(S,req[r])>=3;
            el.style.color=ok?'#84E891':'#8FA0BE';
          }
        }
        if(txt.indexOf("Requiert d'abord")>=0||txt.indexOf('Requiert d’abord')>=0){
          var missing='';
          for(var m=0;m<req.length;m++)if(treeLv(S,req[m])<3){missing=nodeLabel(req[m]);break;}
          if(missing)el.textContent="Requiert d’abord : "+missing+' niveau 3.';
          else el.textContent='Tous les prérequis de maîtrise sont remplis.';
        }
      }
    }
  }catch(_){}
}
if(typeof MutationObserver!=='undefined')new MutationObserver(function(){requestAnimationFrame(syncPopup);}).observe(document.body,{childList:true,subtree:true});
setInterval(syncPopup,500);setTimeout(syncPopup,0);
})();