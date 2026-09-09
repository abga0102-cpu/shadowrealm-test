/* Shadowreach V241 — Familiers : 3 onglets cohérents.
   - Supprime l'onglet « Plus ».
   - Fusion intégrée sous Collection.
   - Accélérateurs intégrés sous Œufs.
   - Aucun MutationObserver, aucun changement économie/sauvegarde/gameplay. */
(function(){
  'use strict';
  if(window.__srFamTabsMergeV241)return;
  window.__srFamTabsMergeV241=true;
  if(typeof SCREENS==='undefined'||!SCREENS||typeof SCREENS.familiers!=='function')return;

  var base=SCREENS.familiers;

  function accelRow(e){
    var items=(typeof ACCEL_DEFS!=='undefined'?ACCEL_DEFS:[]).filter(function(a){return(S.accels&&S.accels[a.key]||0)>0;});
    return '<div class="fam240Accel"><span style="color:'+RARITY[e.rarity].c+'">'+RARITY[e.rarity].label+' · '+fmtTime(Math.max(0,(e.hatchEnd-Date.now())/1000))+'</span><div>'+
      (items.length?items.map(function(a){return '<button class="fam240Pill" data-act="accel" data-arg="'+a.key+'" data-arg2="egg:'+e.id+'">'+ic('bolt',9)+a.label+' ×'+S.accels[a.key]+'</button>';}).join(''):'<small class="mute">Aucun accélérateur</small>')+'</div></div>';
  }

  function fusionBlock(){
    var pets=(S.pets||[]).slice();
    var rarities=PET_RARITY_ORDER.slice(0,-1);
    return '<section class="fam241Integrated"><div class="fam240MiniHead">Fusion</div><div class="fam240Fusion">'+rarities.map(function(r){
      var count=pets.filter(function(p){return p.rarity===r;}).length;
      var need=petFuseNeed(r),can=count>=need;
      return '<div><span style="color:'+RARITY[r].c+'">'+RARITY[r].label+' '+count+'/'+need+'</span>'+
        btn('Fusion',{small:true,cls:can?'purple':'dark',act:'fuse',arg:r,dis:!can,style:'width:auto;padding:4px 8px;font-size:9px'})+'</div>';
    }).join('')+'</div></section>';
  }

  function acceleratorBlock(){
    var active=eggsHatching(S).filter(function(e){return e.hatchEnd>Date.now();});
    return '<section class="fam241Integrated"><div class="fam240MiniHead">Accélérateurs</div>'+
      (active.length?active.map(accelRow).join(''):'<div class="fam240Empty compact">Aucune éclosion active.</div>')+'</section>';
  }

  SCREENS.familiers=function(){
    var html=base();
    var tpl=document.createElement('template');
    tpl.innerHTML=html;
    var root=tpl.content.querySelector('.famScroll240');
    if(!root)return html;

    var plus=root.querySelector('[data-fam240-tab="utility"]');
    if(plus)plus.remove();
    var tabs=root.querySelector('.fam240Tabs');
    if(tabs)tabs.classList.add('fam241ThreeTabs');

    var activeTab=root.querySelector('.fam240Tab.on');
    var id=activeTab&&activeTab.getAttribute('data-fam240-tab');
    var scroll=root.querySelector('.fam240Body .fam240Scroll');
    if(scroll){
      var spacer=scroll.querySelector('.fam240BottomSpace');
      var wrap=document.createElement('div');
      if(id==='collection')wrap.innerHTML=fusionBlock();
      else if(id==='eggs')wrap.innerHTML=acceleratorBlock();
      if(wrap.firstElementChild)scroll.insertBefore(wrap.firstElementChild,spacer||null);
    }
    return tpl.innerHTML;
  };

  var style=document.createElement('style');
  style.id='famTabsMergeV241Style';
  style.textContent=`
.fam240Tabs.fam241ThreeTabs{grid-template-columns:repeat(3,minmax(0,1fr))!important}
.fam241Integrated{margin-top:12px;padding-top:10px;border-top:1px solid rgba(215,174,88,.20)}
.fam241Integrated .fam240MiniHead{margin-bottom:6px;color:var(--goldLit);font:900 10px var(--fd)}
.fam241Integrated .fam240Fusion{padding-bottom:2px}
`;
  document.head.appendChild(style);
})();