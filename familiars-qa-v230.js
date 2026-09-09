/* Shadowreach V230 — Familiar UI QA/stability patch. No save/economy changes. */
(function(){
  'use strict';
  if(window.__srFamQaV230)return;
  window.__srFamQaV230=true;

  /* V229 replaces the global function after SCREENS was already built. Point the
     router at the new renderer explicitly so every entry path uses V229. */
  try{
    if(typeof SCREENS!=='undefined' && SCREENS && typeof scrFamiliers==='function'){
      SCREENS.familiers=scrFamiliers;
    }
  }catch(_){ }

  function actualPetDmgPct(p){
    if(!p)return 0;
    var base=petBonus(p);
    var hpMul=1+treeSum(S,'petHp')/100;
    var dmgMul=1+treeSum(S,'petDmg')/100;
    var normal=petElement(p).id==='normal'?1.10:1;
    return Math.round(base*hpMul*dmgMul*normal);
  }
  function actualPetHpPct(p){
    if(!p)return 0;
    return Math.round(petBonus(p)*(1+treeSum(S,'petHp')/100));
  }
  /* Keep V229's chosen comparison candidate stable; only correct the numbers
     used to describe it so the UI never claims a false power advantage. */
  function v229Alt(active){
    var others=(S.pets||[]).filter(function(p){return !active||p.id!==active.id;});
    var oldScore=function(p){return Math.round(petBonus(p)*(1+treeSum(S,'petDmg')/100));};
    others.sort(function(a,b){return (oldScore(b)-oldScore(a))||((b.level||0)-(a.level||0));});
    return others[0]||null;
  }
  function accelHtml(egg){
    var items=(typeof ACCEL_DEFS!=='undefined'?ACCEL_DEFS:[]).filter(function(a){return (S.accels&&S.accels[a.key]||0)>0;});
    if(!items.length)return '<span class="mute tiny">Aucun accélérateur disponible</span>';
    return items.map(function(a){
      return '<span class="pill" data-act="accel" data-arg="'+a.key+'" data-arg2="egg:'+egg.id+'" style="cursor:pointer;color:#8FEFF4;border-color:var(--cyan)">'+ic('bolt',10)+a.label+' ×'+S.accels[a.key]+'</span>';
    }).join('');
  }
  function enhance(){
    if(typeof route==='undefined'||route!=='familiers')return;
    var root=document.querySelector('.famV229');
    if(!root)return;

    var active=(S.pets||[]).find(function(p){return p.id===S.activePetId;})||null;
    if(active){
      var main=root.querySelector('.famBonusMain');
      if(main){
        var dmg=main.querySelector('b');
        if(dmg)dmg.innerHTML=ic('sword',14)+' +'+actualPetDmgPct(active)+'% dégâts';
        var hp=main.querySelector('.tiny');
        if(hp)hp.innerHTML=ic('heart',10)+' +'+actualPetHpPct(active)+'% PV';
      }
    }

    var alt=v229Alt(active);
    var compare=root.querySelector('.famCompare');
    if(compare&&active&&alt){
      var cards=compare.querySelectorAll('.famComparePet');
      if(cards[0]){var a=cards[0].querySelector('.tiny.b');if(a)a.innerHTML=ic('sword',9)+' +'+actualPetDmgPct(active)+'%';}
      if(cards[1]){var b=cards[1].querySelector('.tiny.b');if(b)b.innerHTML=ic('sword',9)+' +'+actualPetDmgPct(alt)+'%';}
      var delta=actualPetDmgPct(alt)-actualPetDmgPct(active);
      var note=compare.querySelector('.between .famSubtle');
      if(note)note.textContent=delta>0?'+'+delta+'% dégâts potentiels':delta===0?'Puissance de dégâts équivalente':Math.abs(delta)+'% dégâts en moins';
    }

    if(root.querySelector('#famAccelV230'))return;
    var hatching=eggsHatching(S).filter(function(e){return e&&e.hatchEnd>Date.now();});
    if(!hatching.length)return;
    var heads=root.querySelectorAll('.famSectionHead');
    var hatchHead=null;
    heads.forEach(function(h){if((h.textContent||'').indexOf('Éclosion (')>=0)hatchHead=h;});
    if(!hatchHead)return;
    var shelf=hatchHead.nextElementSibling;
    if(!shelf)return;
    var box=document.createElement('details');
    box.id='famAccelV230';
    box.className='famDetails';
    box.innerHTML='<summary>Accélérer une éclosion <span class="famSubtle">Optionnel</span></summary><div class="famDetailsBody">'+hatching.map(function(e){
      return '<div style="padding:7px 0;border-bottom:1px solid #ffffff0b"><div class="between gap6"><div class="tiny b" style="color:'+RARITY[e.rarity].c+'">'+RARITY[e.rarity].label+' · '+fmtTime(Math.max(0,(e.hatchEnd-Date.now())/1000))+'</div></div><div class="row gap4 mt6" style="flex-wrap:wrap">'+accelHtml(e)+'</div></div>';
    }).join('')+'</div>';
    shelf.insertAdjacentElement('afterend',box);
  }

  var screen=document.getElementById('screen');
  if(screen){
    new MutationObserver(function(){requestAnimationFrame(enhance);}).observe(screen,{childList:true,subtree:true});
  }
  document.addEventListener('click',function(){requestAnimationFrame(enhance);},true);
  requestAnimationFrame(enhance);
})();
