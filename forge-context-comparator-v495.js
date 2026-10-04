/* SHADOWREACH V495 · Comparateur Forge contextuel
   Couche UI uniquement : ne modifie ni computePower, ni les stats, ni le combat,
   ni la sauvegarde. Elle enrichit la fenêtre de résultat de Forge avec trois
   lectures séparées : puissance globale, offense, survie et un verdict contextuel. */
(function(){
  'use strict';
  if(window.__srForgeContextComparatorV495) return;
  window.__srForgeContextComparatorV495=true;
  if(typeof showForgeResult!=='function'||typeof computePower!=='function'||typeof ACT==='undefined') return;

  var nativeShowForgeResult=showForgeResult;
  function itemById(id){
    if(!id) return null;
    var eq=Object.values(S.equipped||{}).find(function(x){return x&&x.id===id;});
    return eq||(S.inventory||[]).find(function(x){return x&&x.id===id;})||null;
  }
  function n(v){return Number(v)||0;}
  function offense(it){return it?n(it.damage!=null?it.damage:it.baseDamage):0;}
  function survival(it){return it?n(it.hp!=null?it.hp:it.baseHp):0;}
  function signed(v){v=Math.round(n(v));return (v>0?'+':'')+fmt(v);}
  function trialPower(it){
    if(!it||!it.slot) return 0;
    var before=n(S.power||computePower(S));
    var equipped=Object.assign({},S.equipped||{}); equipped[it.slot]=it;
    var trial=Object.assign({},S,{equipped:equipped});
    return Math.round(n(computePower(trial))-before);
  }
  function metrics(it){
    var cur=(S.equipped||{})[it.slot]||null;
    var equippedNow=cur&&cur.id===it.id;
    return {cur:cur,equippedNow:equippedNow,power:equippedNow?0:trialPower(it),offense:equippedNow?0:offense(it)-offense(cur),survival:equippedNow?0:survival(it)-survival(cur)};
  }
  function verdict(m){
    if(m.equippedNow) return {text:'Équipé actuellement',tone:'var(--textMute)'};
    if(m.power>0&&m.offense>=0&&m.survival>=0) return {text:'Amélioration nette',tone:'var(--greenLit)'};
    if(m.power<0&&m.offense<=0&&m.survival<=0) return {text:'Moins performant globalement',tone:'var(--redLit)'};
    if(m.offense>0&&m.survival<0) return {text:'Plus offensif, moins résistant',tone:'#F3C969'};
    if(m.survival>0&&m.offense<0) return {text:'Plus résistant, moins offensif',tone:'#F3C969'};
    if(m.power>0) return {text:'Gain global malgré un compromis',tone:'var(--greenLit)'};
    if(m.power<0) return {text:'Perte globale malgré un avantage',tone:'#F3C969'};
    return {text:'Impact global neutre',tone:'var(--textMute)'};
  }
  function metric(label,value){
    var c=value>0?'var(--greenLit)':value<0?'var(--redLit)':'var(--textMute)';
    return '<div class="tiny b" style="color:'+c+'">'+label+' · '+signed(value)+'</div>';
  }
  function panel(it){
    var m=metrics(it),v=verdict(m);
    return '<div class="sr-v495-compare tiny" style="margin-top:7px;padding:7px 8px;border-radius:9px;background:#070C15;border:1px solid #1E2B43">'+
      '<div class="between gap6"><b>IMPACT SI ÉQUIPÉ</b><b style="color:'+v.tone+'">'+v.text+'</b></div>'+
      '<div class="col gap3 mt6">'+metric('PUISSANCE GLOBALE',m.power)+metric('OFFENSE',m.offense)+metric('SURVIE',m.survival)+'</div></div>';
  }
  function inject(){
    var root=document.querySelector('.modal,.modalBox,[role="dialog"]')||document.body;
    var cards=root.querySelectorAll('.card.rf');
    cards.forEach(function(card){
      if(card.querySelector('.sr-v495-compare')) return;
      var detail=card.querySelector('[data-act="forgeDetailNow"],button');
      var id=null;
      var candidates=(S.inventory||[]).concat(Object.values(S.equipped||{}));
      var title=(card.textContent||'');
      var it=candidates.find(function(x){return x&&title.indexOf((RARITY[x.rarity]&&RARITY[x.rarity].label)||'§§§')>=0&&title.indexOf(SLOT_LABEL[x.slot]||x.slot)>=0;});
      if(!it) return;
      var actions=card.querySelector('.row.gap6.mt8');
      if(actions) actions.insertAdjacentHTML('beforebegin',panel(it)); else card.insertAdjacentHTML('beforeend',panel(it));
    });
  }
  showForgeResult=function(res){nativeShowForgeResult.apply(this,arguments);try{inject();}catch(e){console.warn('[V495] comparator UI',e);}};
  window.__srForgeContextComparatorV495={version:495,uiOnly:true,combatFormulaChanged:false,saveChanged:false};
})();
