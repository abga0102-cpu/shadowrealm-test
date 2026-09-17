/* SHADOWREACH V352 · Facile 5-2 balance + campaign tier labels
   - Adds an extra monster power reduction from Facile 5-2 through 5-20.
   - Renames only the first four campaign tiers for now:
     Facile -> Looser, Difficile -> Débutant, Expert -> Aventurier, Cauchemar -> Héros.
   - Later tiers remain unchanged. */
(function(){
  'use strict';
  if(window.__srCampaignTierBalanceV352)return;
  window.__srCampaignTierBalanceV352=true;

  var START_FLOOR=82; /* Facile 5-2 */
  var END_FLOOR=100;  /* Facile 5-20 */
  var HP_MUL=0.85;
  var DMG_MUL=0.85;

  try{
    if(typeof makeEnemy==='function'&&!makeEnemy.__srCampaignTierBalanceV352){
      var previousMakeEnemy=makeEnemy;
      makeEnemy=function(mode,opts){
        var enemy=previousMakeEnemy(mode,opts);
        if(mode!=='campaign'||!opts||!enemy)return enemy;
        var floor=Number(opts.floor)||0;
        if(floor<START_FLOOR||floor>END_FLOOR)return enemy;

        enemy.maxHP=Math.max(1,Math.floor(Number(enemy.maxHP||enemy.hp||1)*HP_MUL));
        enemy.hp=Math.min(enemy.maxHP,Math.max(1,Math.floor(Number(enemy.hp||enemy.maxHP||1)*HP_MUL)));
        enemy.dmg=Math.max(1,Math.floor(Number(enemy.dmg||1)*DMG_MUL));
        enemy.__srFacile52BalanceV352={hpMul:HP_MUL,dmgMul:DMG_MUL};
        return enemy;
      };
      makeEnemy.__srCampaignTierBalanceV352=true;
    }
  }catch(_){ }

  var LABELS={
    'Facile':'Looser',
    'Difficile':'Débutant',
    'Expert':'Aventurier',
    'Cauchemar':'Héros'
  };
  var LABEL_RE=/\b(Facile|Difficile|Expert|Cauchemar)\b/g;

  function replaceLabelText(value){
    if(!value||typeof value!=='string')return value;
    return value.replace(LABEL_RE,function(m){return LABELS[m]||m;});
  }

  function relabel(root){
    try{
      root=root||document.body;
      if(!root)return;
      var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
      var node;
      while((node=walker.nextNode())){
        var parent=node.parentNode;
        if(!parent||/^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.nodeName||''))continue;
        var next=replaceLabelText(node.nodeValue);
        if(next!==node.nodeValue)node.nodeValue=next;
      }
      if(root.querySelectorAll){
        var els=root.querySelectorAll('[aria-label],[title],[placeholder]');
        for(var i=0;i<els.length;i++){
          ['aria-label','title','placeholder'].forEach(function(attr){
            if(!els[i].hasAttribute(attr))return;
            var before=els[i].getAttribute(attr)||'';
            var after=replaceLabelText(before);
            if(after!==before)els[i].setAttribute(attr,after);
          });
        }
      }
    }catch(_){ }
  }

  function installRelabelObserver(){
    relabel(document.body);
    try{
      var pending=false;
      var observer=new MutationObserver(function(){
        if(pending)return;
        pending=true;
        requestAnimationFrame(function(){pending=false;relabel(document.body);});
      });
      observer.observe(document.body,{subtree:true,childList:true,characterData:true});
      window.__srCampaignTierLabelObserverV352=observer;
    }catch(_){ }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installRelabelObserver,{once:true});
  else installRelabelObserver();

  window.__srCampaignTierBalanceConfigV352={
    startFloor:START_FLOOR,
    startStage:'Looser 5-2',
    endFloor:END_FLOOR,
    hpMul:HP_MUL,
    damageMul:DMG_MUL,
    labels:LABELS
  };
})();
