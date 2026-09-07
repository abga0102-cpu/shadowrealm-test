/* SHADOWREACH · forge comparison v95
   Résultats de Forge : compare immédiatement la pièce obtenue avec celle portée,
   affiche d'abord la stat de base et permet d'équiper sans passer par l'Inventaire.
   Aucun objet existant, multiplicateur de rareté, coût ou sauvegarde n'est modifié.
*/
(function(){
  'use strict';
  if (window.__srForgeCompareV95) return;
  window.__srForgeCompareV95 = true;

  if (typeof forgeSummon !== 'function' || typeof showForgeResult !== 'function' ||
      typeof equipItem !== 'function' || typeof ACT === 'undefined') return;

  var lastForgeResults = null;
  var nativeForgeSummon = forgeSummon;

  function itemById(id){
    if (!id) return null;
    var eq = Object.values(S.equipped || {}).find(function(x){ return x && x.id === id; });
    return eq || (S.inventory || []).find(function(x){ return x && x.id === id; }) || null;
  }

  function primaryBase(it){
    if (!it) return 0;
    if (MASTERY_STAT[it.slot] === 'dmg') return Number(it.baseDamage != null ? it.baseDamage : (it.damage || 0));
    return Number(it.baseHp != null ? it.baseHp : (it.hp || 0));
  }

  function primaryLabel(it){ return it && MASTERY_STAT[it.slot] === 'dmg' ? 'ATQ BASE' : 'PV BASE'; }
  function signed(n){ n=Math.round(Number(n)||0); return (n>0?'+':'') + fmt(n); }

  function powerDeltaFor(it){
    if (!it || !it.slot || typeof computePower !== 'function') return 0;
    var before = Number(S.power || computePower(S) || 0);
    var trial = Object.assign({}, S, { equipped:Object.assign({}, S.equipped || {}, (function(){var x={};x[it.slot]=it;return x;})()) });
    return Math.round(computePower(trial) - before);
  }

  // Le moteur historique ne renvoyait que rareté/slot/puissance. On rattache ici
  // chaque ligne au véritable objet ajouté au sac, sans toucher au tirage lui-même.
  forgeSummon = function(n){
    var before = new Set((S.inventory || []).map(function(x){ return x.id; }));
    var res = nativeForgeSummon.apply(this, arguments) || [];
    var fresh = (S.inventory || []).filter(function(x){ return !before.has(x.id); });
    var used = new Set();
    res.forEach(function(r){
      if (!r || r.recycled) return;
      var hit = fresh.find(function(it){
        return !used.has(it.id) && it.slot === r.slot && it.rarity === r.rarity &&
          Math.abs(Number(it.power||0)-Number(r.power||0)) < 0.01;
      }) || fresh.find(function(it){ return !used.has(it.id) && it.slot === r.slot && it.rarity === r.rarity; });
      if (hit) { used.add(hit.id); r.id = hit.id; }
    });
    return res;
  };

  function resultCard(r){
    var it=itemById(r.id);
    if(!it){
      return '<div class="card" style="padding:8px 9px"><div class="mute tiny">Objet introuvable dans le sac.</div></div>';
    }
    var cur=(S.equipped||{})[it.slot]||null;
    var equippedNow=cur&&cur.id===it.id;
    var nb=primaryBase(it), cb=cur&&!equippedNow?primaryBase(cur):0;
    var baseDelta=cur&&!equippedNow?Math.round(nb-cb):Math.round(nb);
    var pDelta=equippedNow?0:powerDeltaFor(it);
    var col=RARITY[it.rarity].c;
    var curCol=cur&&RARITY[cur.rarity]?RARITY[cur.rarity].c:'var(--textMute)';
    var betterBase=!cur||equippedNow||baseDelta>0;
    var baseCol=betterBase?'var(--greenLit)':baseDelta<0?'var(--redLit)':'var(--textMute)';
    var powerCol=pDelta>0?'var(--greenLit)':pDelta<0?'var(--redLit)':'var(--textMute)';
    return '<div class="card rf" style="padding:9px 10px;border-color:'+col+';--rc:'+col+'">'+
      '<div class="row gap8"><div class="imini" style="width:38px;height:38px;border-color:'+col+'99">'+slotIcon(it.slot,24,it)+'</div>'+
      '<div class="flex1" style="min-width:0"><div class="between gap6"><b class="small" style="color:'+col+'">'+esc(RARITY[it.rarity].label)+' · '+esc(SLOT_LABEL[it.slot]||it.slot)+'</b>'+
      (r.free?'<span class="pill" style="color:#8FEFF4;border-color:#3FCFD666">GRATUIT</span>':'')+'</div>'+
      '<div class="tiny b mt3" style="color:'+baseCol+'">'+primaryLabel(it)+' · '+fmt(nb)+(cur&&!equippedNow?' <span class="mute">vs '+fmt(cb)+'</span> · '+signed(baseDelta):'')+'</div>'+
      '<div class="tiny b mt3" style="color:'+powerCol+'">PUISSANCE · '+fmt(it.power)+(equippedNow?' · PORTÉE':(' · '+signed(pDelta)))+'</div></div></div>'+
      (cur&&!equippedNow?'<div class="tiny mt6" style="padding:5px 7px;border-radius:8px;background:#070C15;border:1px solid #1E2B43"><span class="mute">Porté : </span><b style="color:'+curCol+'">'+esc(RARITY[cur.rarity].label)+'</b><span class="mute"> · '+primaryLabel(cur)+' '+fmt(primaryBase(cur))+' · puissance '+fmt(cur.power)+'</span></div>':'')+
      '<div class="row gap6 mt8">'+
        (equippedNow?'<span class="pill" style="min-height:36px;display:flex;align-items:center;justify-content:center;flex:1;color:var(--greenLit);border-color:#3FB950">✓ Porté</span>':btn('Équiper maintenant',{cls:'green',small:true,act:'forgeEquipNow',arg:it.id,style:'min-height:44px'}))+
        btn('Détails',{cls:'dark',small:true,act:'forgeDetailNow',arg:it.id,style:'width:auto;min-width:76px;min-height:44px'})+
      '</div></div>';
  }

  showForgeResult = function(res){
    res = Array.isArray(res) ? res : [];
    lastForgeResults = res;
    var kept=res.filter(function(r){return r&&!r.recycled;});
    var melted=res.filter(function(r){return r&&r.recycled;});
    var dust=melted.reduce(function(a,r){return a+(r.dust||0);},0);
    if(!kept.length){
      toast(melted.length+' pièce'+(melted.length>1?'s':'')+' recyclée'+(melted.length>1?'s':'')+' · +'+fmt(dust)+' poussière',true);
      return;
    }
    kept=kept.slice().sort(function(a,b){
      var ra=equipRank(b.rarity)-equipRank(a.rarity); if(ra) return ra;
      return primaryBase(itemById(b.id))-primaryBase(itemById(a.id));
    });
    var best=kept[0], bestItem=itemById(best.id), bc=RARITY[best.rarity].c;
    var intro='<div class="center">'+ic('hammer',32)+'</div><div class="modalT mt6" style="color:'+bc+'">FORGE RÉUSSIE</div>'+
      '<div class="mute tiny center" style="line-height:1.45;margin:4px 0 9px">Comparaison directe avec l’équipement porté. Les pièces sont classées par <b>rareté</b>, puis par <b>stat de base</b>.</div>';
    var summary=bestItem?'<div class="notice" style="border-left-color:'+bc+'"><b style="color:'+bc+'">Meilleure sortie : '+esc(RARITY[bestItem.rarity].label)+' '+esc(SLOT_LABEL[bestItem.slot]||bestItem.slot)+'</b> · '+primaryLabel(bestItem)+' '+fmt(primaryBase(bestItem))+'</div>':'';
    var meltedHtml=melted.length?'<div class="tiny b center mt8" style="color:var(--purpleLit)">'+ic('trash',11)+' '+melted.length+' recyclée'+(melted.length>1?'s':'')+' par le filtre · +'+fmt(dust)+' poussière</div>':'';
    openModal(intro+summary+'<div class="col gap7 mt8">'+kept.map(resultCard).join('')+'</div>'+meltedHtml+
      '<div class="mt10">'+btn('Continuer',{cls:'blue',act:'closeModal',style:'min-height:44px'})+'</div>','Comparer la Forge');
  };

  ACT.forgeEquipNow=function(id){
    if(!itemById(id)) return;
    equipItem(id);
    if(lastForgeResults) showForgeResult(lastForgeResults);
  };
  ACT.forgeDetailNow=function(id){
    if(itemById(id)) showItemDetail(id);
  };
})();
