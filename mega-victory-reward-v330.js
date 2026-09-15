/* SHADOWREACH V330 · Mega victory reward receipt
   Direct Boss reward and Monday milestone payout are deliberately separate. */
(function(){
  'use strict';
  if(window.__srMegaVictoryRewardV330)return;
  window.__srMegaVictoryRewardV330=true;

  function accelLabel(accel){
    if(!accel)return '';
    var def=(typeof ACCEL_DEFS!=='undefined'&&Array.isArray(ACCEL_DEFS))
      ? ACCEL_DEFS.find(function(a){return a.key===accel.key;}) : null;
    return (def&&def.label)||accel.key||'accélérateur';
  }

  function install(){
    if(typeof showMegaResult!=='function'){setTimeout(install,100);return;}
    if(showMegaResult.__srV330)return;
    showMegaResult=function(r){
      r=r||{};
      var def=typeof bossFor==='function'?bossFor(r.floor):null;
      var won=!!r.won;
      var first=won&&!!r.firstClear;
      var direct='';
      if(first){
        direct=r.accel
          ? '<div class="notice mt10" style="text-align:left"><b style="color:var(--goldLit)">RÉCOMPENSE DU BOSS · ENCAISSÉE IMMÉDIATEMENT</b><br><span class="small">+'+fmt(r.accel.qty)+' Accélérateur '+esc(accelLabel(r.accel))+' <span class="mute">(×2 Boss normal)</span></span></div>'
          : '<div class="notice mt10" style="text-align:left"><b>RÉCOMPENSE DU BOSS</b><br><span class="small">Aucune récompense directe configurée pour ce Boss.</span></div>';
      }else if(won){
        direct='<div class="notice mt10" style="text-align:left"><b>REPLAY</b><br><span class="small">Récompense directe déjà encaissée lors de la première victoire · aucun nouveau gain direct.</span></div>';
      }
      var weekly=won
        ? '<div class="card mt8" style="padding:9px 11px;text-align:left"><b class="small">PALIER HEBDOMADAIRE</b><br><span class="mute tiny">La case Méga correspondante est cochée. Les fragments de fusion + accélérateurs du palier ne sont pas encaissés ici : versement le lundi à 02:00 selon le meilleur palier atteint.</span></div>'
        : '';
      openModal('<div class="center">'+ic(won?'trophy':'skull',40)+'</div>'+
        '<div class="modalT mt6" style="color:'+(won?'var(--goldLit)':'var(--redLit)')+'">'+(won?'VICTOIRE':'DÉFAITE')+'</div>'+
        '<div class="dim small center" style="line-height:1.6">Méga niveau '+megaLevelForFloor(r.floor)+' · Méga-'+esc(def?def.name:'Boss')+'<br>Référence : Boss normal étage '+fmtInt(r.floor)+' · puissance ×10</div>'+
        direct+weekly+
        (!won?'<div class="dim small center mt10">Aucune clé ni récompense perdue. Renforce-toi et réessaie.</div>':'')+
        '<div class="mt10">'+btn('Continuer',{cls:won?'green':'ghost',act:'closeMega'})+'</div>',
        won?'Méga-Boss vaincu':'Méga Boss échoué');
    };
    showMegaResult.__srV330=true;
  }
  install();
})();