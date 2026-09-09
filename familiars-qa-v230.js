/* Shadowreach V230 — Familiar UI QA/stability hardened. No save/economy changes. */
(function(){
  'use strict';
  if(window.__srFamQaV230)return;
  window.__srFamQaV230=true;

  try{
    if(typeof SCREENS!=='undefined'&&SCREENS&&typeof scrFamiliers==='function')SCREENS.familiers=scrFamiliers;
  }catch(_){ }

  function actualPetHpPct(p){
    if(!p)return 0;
    return Math.round(petBonus(p)*(1+treeSum(S,'petHp')/100));
  }
  function actualPetDmgPct(p){
    if(!p)return 0;
    var petPct=petBonus(p)*(1+treeSum(S,'petHp')/100);
    var normal=petElement(p).id==='normal'?1.10:1;
    return Math.round(petPct*(1+treeSum(S,'petDmg')/100)*normal);
  }
  function bestAlternative(active){
    return (S.pets||[]).filter(function(p){return !active||p.id!==active.id;}).sort(function(a,b){
      return (actualPetDmgPct(b)-actualPetDmgPct(a)) ||
        (actualPetHpPct(b)-actualPetHpPct(a)) ||
        ((b.level||0)-(a.level||0));
    })[0]||null;
  }
  function setHtmlIfChanged(el,html){if(el&&el.innerHTML!==html)el.innerHTML=html;}
  function setTextIfChanged(el,text){if(el&&el.textContent!==text)el.textContent=text;}
  function accelHtml(egg){
    var items=(typeof ACCEL_DEFS!=='undefined'?ACCEL_DEFS:[]).filter(function(a){return (S.accels&&S.accels[a.key]||0)>0;});
    if(!items.length)return '<span class="mute tiny">Aucun accélérateur disponible</span>';
    return items.map(function(a){
      return '<span class="pill" data-act="accel" data-arg="'+a.key+'" data-arg2="egg:'+egg.id+'" style="cursor:pointer;color:#8FEFF4;border-color:var(--cyan)">'+ic('bolt',10)+a.label+' ×'+S.accels[a.key]+'</span>';
    }).join('');
  }
  function accelerationMarkup(){
    var hatching=eggsHatching(S).filter(function(e){return e&&e.hatchEnd>Date.now();});
    if(!hatching.length)return '';
    return '<summary>Accélérer une éclosion <span class="famSubtle">Optionnel</span></summary><div class="famDetailsBody">'+hatching.map(function(e){
      return '<div style="padding:7px 0;border-bottom:1px solid #ffffff0b"><div class="tiny b" style="color:'+RARITY[e.rarity].c+'">'+RARITY[e.rarity].label+' · '+fmtTime(Math.max(0,(e.hatchEnd-Date.now())/1000))+'</div><div class="row gap4 mt6" style="flex-wrap:wrap">'+accelHtml(e)+'</div></div>';
    }).join('')+'</div>';
  }

  var enhancing=false;
  function enhance(){
    if(enhancing||typeof route==='undefined'||route!=='familiers')return;
    var root=document.querySelector('.famV229');
    if(!root)return;
    enhancing=true;
    try{
      var active=(S.pets||[]).find(function(p){return p.id===S.activePetId;})||null;
      if(active){
        var main=root.querySelector('.famBonusMain');
        if(main){
          setHtmlIfChanged(main.querySelector('b'),ic('sword',14)+' +'+actualPetDmgPct(active)+'% dégâts');
          setHtmlIfChanged(main.querySelector('.tiny'),ic('heart',10)+' +'+actualPetHpPct(active)+'% PV');
        }
      }

      var alt=bestAlternative(active), compare=root.querySelector('.famCompare');
      if(compare&&active&&alt){
        var cards=compare.querySelectorAll('.famComparePet');
        if(cards[0])setHtmlIfChanged(cards[0].querySelector('.tiny.b'),ic('sword',9)+' +'+actualPetDmgPct(active)+'%');
        if(cards[1]){
          var img=cards[1].querySelector('img'); if(img&&img.getAttribute('src')!==petArt(alt))img.setAttribute('src',petArt(alt));
          var name=cards[1].querySelector('.b.small'); setTextIfChanged(name,petFullName(alt)); if(name)name.style.color=RARITY[alt.rarity].c;
          var meta=cards[1].querySelector('.tiny.mute'); setTextIfChanged(meta,'Niv. '+(alt.level||0)+' · '+RARITY[alt.rarity].label);
          setHtmlIfChanged(cards[1].querySelector('.tiny.b'),ic('sword',9)+' +'+actualPetDmgPct(alt)+'%');
        }
        var delta=actualPetDmgPct(alt)-actualPetDmgPct(active);
        setTextIfChanged(compare.querySelector('.between .famSubtle'),delta>0?'+'+delta+'% dégâts potentiels':delta===0?'Puissance de dégâts équivalente':Math.abs(delta)+'% dégâts en moins');
        var equip=compare.querySelector('[data-act="setPet"]');
        if(equip){equip.setAttribute('data-arg',alt.id);setTextIfChanged(equip,'Équiper '+petSpecies(alt).label);}
      }

      var markup=accelerationMarkup();
      var box=root.querySelector('#famAccelV230');
      if(!markup){if(box)box.remove();return;}
      if(!box){
        var heads=root.querySelectorAll('.famSectionHead'), hatchHead=null;
        heads.forEach(function(h){if((h.textContent||'').indexOf('Éclosion (')>=0)hatchHead=h;});
        var shelf=hatchHead&&hatchHead.nextElementSibling;
        if(!shelf)return;
        box=document.createElement('details');box.id='famAccelV230';box.className='famDetails';
        shelf.insertAdjacentElement('afterend',box);
      }
      setHtmlIfChanged(box,markup);
    }finally{enhancing=false;}
  }

  var screen=document.getElementById('screen');
  var scheduled=false;
  function scheduleEnhance(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(function(){scheduled=false;enhance();});
  }
  if(screen)new MutationObserver(scheduleEnhance).observe(screen,{childList:true,subtree:true});
  document.addEventListener('click',scheduleEnhance,true);
  window.addEventListener('focus',scheduleEnhance,{passive:true});
  scheduleEnhance();
})();
