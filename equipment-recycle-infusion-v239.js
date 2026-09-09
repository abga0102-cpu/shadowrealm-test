/* Shadowreach V239 — recyclage stratégique des équipements.
   - Recyclage normal : valeur de base + 50% des Poussières investies dans les améliorations réussies.
   - Catalyseur d'infusion : consommé sur un recyclage individuel pour récupérer 100% de l'investissement.
   - Les tentatives ratées restent perdues.
   - 1 Catalyseur tous les 5 premiers clears uniques de Méga-Boss : rare, prévisible et non farmable.
   - Compensation migration : 1 Catalyseur aux sauvegardes existantes possédant déjà un équipement amélioré.
*/
(function(){
  'use strict';
  if(window.__srEquipmentRecycleInfusionV239)return;
  window.__srEquipmentRecycleInfusionV239=true;
  if(typeof S==='undefined'||typeof dustValue!=='function'||typeof itemUpgradeCost!=='function'||typeof upgradeItem!=='function')return;

  var baseUpgradeItem=upgradeItem;
  var baseShowMegaResult=(typeof showMegaResult==='function')?showMegaResult:null;

  function clampInt(v){return Math.max(0,Math.floor(Number(v)||0));}
  function allItems(s){
    var out=[];
    if(s&&s.equipped)Object.keys(s.equipped).forEach(function(k){if(s.equipped[k])out.push(s.equipped[k]);});
    if(s&&Array.isArray(s.inventory))out=out.concat(s.inventory.filter(Boolean));
    return out;
  }
  function successfulInvestmentEstimate(it){
    var level=clampInt(it&&it.level);
    var anchor=clampInt(it&&it.upgradeBaseLevel);
    if(level<=anchor)return 0;
    var total=0;
    for(var lv=anchor;lv<level;lv++) total+=Math.round(20+lv*12);
    return total;
  }
  function investmentOf(it){
    var tracked=Number(it&&it.dustInvested);
    if(Number.isFinite(tracked)&&tracked>=0)return tracked;
    return successfulInvestmentEstimate(it);
  }
  function baseRecycleValue(s,it){
    if(!it)return 0;
    var original=Math.max(0,it.originalPower!=null?Number(it.originalPower)||0:
      (((Number(it.baseDamage)||0)+(Number(it.baseHp)||0))||(Number(it.power)||0)));
    var rank=(typeof equipRank==='function')?equipRank(it.rarity):0;
    var bonus=(typeof treeSum==='function')?treeSum(s,'dust'):0;
    return Math.floor(((rank+1)*5+original*0.2)*(1+bonus/100));
  }
  function normalRecycleValue(s,it){
    return baseRecycleValue(s,it)+Math.floor(investmentOf(it)*0.50);
  }
  function infusedRecycleValue(s,it){
    return baseRecycleValue(s,it)+Math.floor(investmentOf(it));
  }

  // Migration sûre : l'investissement remboursable se reconstruit à partir des niveaux réussis.
  // Cela ne rembourse jamais les échecs, dont le nombre n'est pas déductible du niveau final.
  try{
    if(!S.equipmentRecycleInfusionV239){
      var owned=allItems(S);
      owned.forEach(function(it){it.dustInvested=successfulInvestmentEstimate(it);});
      if(!Number.isFinite(Number(S.infusionCatalysts)))S.infusionCatalysts=0;
      if(!S.infusionMegaMilestones||typeof S.infusionMegaMilestones!=='object')S.infusionMegaMilestones={};
      // Compensation ponctuelle uniquement pour une sauvegarde qui a déjà investi dans au moins une pièce.
      if(owned.some(function(it){return investmentOf(it)>0;})){
        S.infusionCatalysts+=1;
        S.infusionCompensationV239=1;
      }
      S.equipmentRecycleInfusionV239=true;
      if(typeof dirty!=='undefined')dirty=true;
      if(typeof saveNow==='function')saveNow();
    }
  }catch(e){console.warn('equipment recycle migration V239',e);}

  // Toutes les prévisualisations et tous les recyclages en lot passent automatiquement à 50%.
  dustValue=function(s,it){return normalRecycleValue(s,it);};

  // Après chaque amélioration réussie, on resynchronise l'investissement depuis le niveau atteint.
  // Ainsi aucun ancien wrapper ne peut doubler le remboursement.
  upgradeItem=function(id){
    var it=null;
    try{
      it=Object.values(S.equipped||{}).find(function(x){return x&&x.id===id;})||
        (S.inventory||[]).find(function(x){return x&&x.id===id;});
    }catch(_){}
    var result=baseUpgradeItem.apply(this,arguments);
    if(result&&result.ok&&result.success&&it){
      it.dustInvested=successfulInvestmentEstimate(it);
      try{if(typeof dirty!=='undefined')dirty=true;}catch(_){}
    }
    return result;
  };

  function recycleOne(id,infused){
    var it=(S.inventory||[]).find(function(x){return x&&x.id===id;});
    if(!it)return {ok:false,dust:0,infused:false};
    var use=!!infused;
    if(use&&clampInt(S.infusionCatalysts)<=0)return {ok:false,dust:0,infused:false,reason:'catalyst'};
    var dust=use?infusedRecycleValue(S,it):normalRecycleValue(S,it);
    update(function(st){
      st.inventory=st.inventory.filter(function(x){return x.id!==id;});
      st.poussiere+=dust;
      if(use)st.infusionCatalysts=Math.max(0,clampInt(st.infusionCatalysts)-1);
    });
    return {ok:true,dust:dust,infused:use};
  }

  function askRecycleOne(id){
    var it=(S.inventory||[]).find(function(x){return x&&x.id===id;});
    if(!it){if(typeof toast==='function')toast('Objet introuvable');return;}
    var invested=Math.floor(investmentOf(it));
    var base=baseRecycleValue(S,it);
    var normal=normalRecycleValue(S,it);
    var full=infusedRecycleValue(S,it);
    var catalysts=clampInt(S.infusionCatalysts);
    var color=(typeof RARITY!=='undefined'&&RARITY[it.rarity])?RARITY[it.rarity].c:'var(--purpleLit)';
    var infusionButton=(invested>0&&catalysts>0)
      ? btn('✦ Infuser · +'+fmt(full)+' poussière',{cls:'purple',small:true,act:'recycleInfused',arg:id})
      : btn('✦ Infusion indisponible',{cls:'ghost',small:true,act:'noop',dis:true});
    openModal(
      '<div class="center">'+ic('cycle',30)+'</div>'+
      '<div class="modalT center mt6" style="color:'+color+'">RECYCLER '+esc(it.name||'Équipement')+'</div>'+
      '<div class="card mt8" style="padding:8px 10px">'+
        '<div class="kv"><span class="dim">Valeur de base</span><b>+'+fmt(base)+'</b></div>'+
        '<div class="kv"><span class="dim">Poussières investies</span><b>'+fmt(invested)+'</b></div>'+
        '<div class="kv"><span class="dim">Recyclage normal</span><b style="color:var(--purpleLit)">50% · +'+fmt(normal)+'</b></div>'+
        '<div class="kv"><span class="dim">Catalyseur d’infusion</span><b style="color:var(--goldLit)">×'+catalysts+' · remboursement 100%</b></div>'+
      '</div>'+
      '<div class="mute tiny center mt6">Le Catalyseur n’est consommé que si tu choisis l’infusion. Les tentatives d’amélioration ratées ne sont jamais remboursées.</div>'+
      '<div class="row gap6 mt8">'+btn('Annuler',{cls:'ghost',small:true,act:'closeModal'})+
        btn(ic('trash',11)+' Recycler · +'+fmt(normal),{cls:'red',small:true,act:'recycleNormal',arg:id})+'</div>'+
      '<div class="mt6">'+infusionButton+'</div>',
      'Recyclage équipement'
    );
  }

  // Le bouton de recyclage individuel ouvre désormais le choix 50% / infusion 100%.
  try{
    if(typeof ACT!=='undefined'&&ACT){
      ACT.recycle=function(a){askRecycleOne(a);};
      ACT.recycleNormal=function(a){
        var r=recycleOne(a,false);closeModal();
        toast(r.ok?'+'+fmt(r.dust)+' poussière':'Objet introuvable',!!r.ok);render();
      };
      ACT.recycleInfused=function(a){
        var r=recycleOne(a,true);
        if(!r.ok){if(r.reason==='catalyst')toast('Catalyseur d’infusion insuffisant');else toast('Objet introuvable');return;}
        closeModal();toast('Infusion réussie · +'+fmt(r.dust)+' poussière',true);render();
      };
      if(!ACT.noop)ACT.noop=function(){};
    }
  }catch(e){console.warn('equipment recycle actions V239',e);}

  // Source rare et non farmable : 1 Catalyseur tous les 5 premiers clears uniques de Méga-Boss.
  if(baseShowMegaResult){
    showMegaResult=function(r){
      var awarded=0;
      try{
        if(r&&r.won&&r.firstClear){
          var clears=Object.keys(S.megaBossClears||{}).length;
          if(clears>0&&clears%5===0){
            if(!S.infusionMegaMilestones||typeof S.infusionMegaMilestones!=='object')S.infusionMegaMilestones={};
            if(!S.infusionMegaMilestones[String(clears)]){
              S.infusionMegaMilestones[String(clears)]=true;
              S.infusionCatalysts=clampInt(S.infusionCatalysts)+1;
              awarded=1;
              try{if(typeof dirty!=='undefined')dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}
            }
          }
        }
      }catch(e){console.warn('infusion mega reward V239',e);}
      var out=baseShowMegaResult.apply(this,arguments);
      if(awarded&&typeof toast==='function')setTimeout(function(){toast('+1 Catalyseur d’infusion',true);},80);
      return out;
    };
  }

  // Expose uniquement les helpers de lecture utiles au QA, sans modifier le schéma des autres systèmes.
  window.__srInfusionV239={
    normalValue:function(it){return normalRecycleValue(S,it);},
    infusedValue:function(it){return infusedRecycleValue(S,it);},
    investment:function(it){return investmentOf(it);}
  };
})();