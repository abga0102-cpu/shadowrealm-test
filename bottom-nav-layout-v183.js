/* SHADOWREACH · Bottom navigation authority V209
   All four tabs use one DOM shape, one geometry owner, one fantasy-decoration owner,
   one permanent destination map and one render lifecycle. The former bottom-nav-v53.js
   decoration is consolidated here so BottomNav has one durable runtime owner. */
(function(){
  'use strict';
  if(window.__srBottomNavGeometryV209)return;
  window.__srBottomNavGeometryV209=true;
  window.__srBottomNavPhase2A=true;

  const LABELS={developpement:'Progression',parametres:'Menu'};
  const ICONS={
    accueil:`<span class="fantasyNavIcon fantasyHome"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fhg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFF2A6"/><stop offset=".45" stop-color="#E7B64D"/><stop offset="1" stop-color="#8A5718"/></linearGradient><linearGradient id="fhb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4CB5FF"/><stop offset="1" stop-color="#123766"/></linearGradient></defs><ellipse cx="32" cy="54" rx="24" ry="5" fill="#E8B44A" opacity=".28"/><path d="M10 48V25l8-5v-7l8 5 6-10 6 10 8-5v7l8 5v23H10Z" fill="url(#fhg)" stroke="#5B3510" stroke-width="2"/><path d="M16 29h8v13h-8zm24 0h8v13h-8z" fill="url(#fhb)"/><path d="M25 48V32c0-5 3-9 7-9s7 4 7 9v16H25Z" fill="#FFCF45" stroke="#6D430F" stroke-width="2"/><path d="M29 48V33c0-3 1-5 3-5s3 2 3 5v15" fill="#FFF1A0" opacity=".75"/></svg></span>`,
    equipement:`<span class="fantasyNavIcon fantasyEquip"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="feg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF1A4"/><stop offset=".5" stop-color="#C99432"/><stop offset="1" stop-color="#6C4214"/></linearGradient><linearGradient id="fes" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset=".45" stop-color="#AFC5DE"/><stop offset="1" stop-color="#4C6380"/></linearGradient><linearGradient id="feb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#376DA8"/><stop offset="1" stop-color="#142B4C"/></linearGradient></defs><path d="M35 10c8 5 14 5 20 3v20c0 11-8 17-20 21-12-4-20-10-20-21V13c6 2 12 2 20-3Z" fill="url(#feb)" stroke="url(#feg)" stroke-width="3"/><path d="M20 16 48 44" stroke="#5A3510" stroke-width="7" stroke-linecap="round"/><path d="M18 12 52 46" stroke="url(#fes)" stroke-width="4" stroke-linecap="round"/><path d="m14 11 9 1-8 8Z" fill="url(#feg)"/><path d="m47 38 8 8-4 4-8-8Z" fill="url(#feg)"/></svg></span>`,
    developpement:`<span class="fantasyNavIcon fantasyDev"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fdg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFD66A"/><stop offset="1" stop-color="#784616"/></linearGradient><radialGradient id="fdb"><stop stop-color="#8EEBFF"/><stop offset=".45" stop-color="#2D9BFF"/><stop offset="1" stop-color="#0E3D82"/></radialGradient></defs><ellipse cx="32" cy="55" rx="23" ry="5" fill="#178BFF" opacity=".25"/><path d="M32 54c-2-10 3-15 1-24-1-7 2-14 3-18-7 9-8 15-7 22-3-5-7-8-12-10 7 6 9 13 8 21-5 0-9 3-12 8h38c-4-5-8-8-13-8 1-8 4-15 10-22-6 3-10 7-13 12 1-9 0-14-3-23" fill="none" stroke="url(#fdg)" stroke-width="5" stroke-linecap="round"/><g fill="url(#fdb)" stroke="#62CFFF" stroke-width="1"><path d="M15 23c5-5 10-4 13 1-5 4-10 4-13-1Z"/><path d="M39 20c4-6 10-7 14-3-3 6-8 8-14 3Z"/><path d="M25 13c2-7 7-10 12-7-1 7-5 10-12 7Z"/><path d="M43 31c5-4 10-2 12 3-5 4-10 3-12-3Z"/><path d="M14 35c5-4 10-2 12 3-5 4-10 3-12-3Z"/></g></svg></span>`,
    parametres:`<span class="fantasyNavIcon fantasyMenu"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fmg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F4D98A"/><stop offset=".5" stop-color="#B18437"/><stop offset="1" stop-color="#5A3B15"/></linearGradient><linearGradient id="fmb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#263A5C"/><stop offset="1" stop-color="#111C30"/></linearGradient></defs><rect x="10" y="10" width="44" height="44" rx="13" fill="url(#fmb)" stroke="url(#fmg)" stroke-width="3"/><path d="M19 22h26M19 32h26M19 42h26" stroke="#F0D58E" stroke-width="4" stroke-linecap="round"/><circle cx="16" cy="22" r="2" fill="#FFF2B8"/><circle cx="16" cy="32" r="2" fill="#FFF2B8"/><circle cx="16" cy="42" r="2" fill="#FFF2B8"/></svg></span>`
  };

  function decorateTab(tab){
    var key=tab&&tab.dataset?tab.dataset.arg:'';
    var markup=ICONS[key];
    if(!markup)return;
    var fantasy=tab.querySelector('.fantasyNavIcon');
    if(!fantasy){
      var old=tab.querySelector(':scope > svg,:scope > img,.ico svg,.ico img');
      if(old)old.outerHTML=markup;else tab.insertAdjacentHTML('afterbegin',markup);
    }
    var label=tab.querySelector(':scope > span:not(.fantasyNavIcon):not(.dot)');
    if(label&&LABELS[key])label.textContent=LABELS[key];
    tab.classList.add('fantasyNavV65');
    tab.dataset.fantasyNav='phase2a';
  }

  function decorate(){
    var root=document.getElementById('tabs');
    if(!root)return;
    Array.prototype.forEach.call(root.querySelectorAll(':scope > .tab'),decorateTab);
  }

  function navTile(item){
    var locked=Number(item.locked)||0;
    var act=locked?'locked':(item.act||'go');
    var arg=locked?locked:(item.arg||item.route||'');
    var icon=item.icon||'chevron';
    var label=item.label+(locked?' · Niv.'+locked:'');
    return '<button class="srNavHubItem btn sm ghost" data-act="'+act+'"'+(arg!==''?' data-arg="'+arg+'"':'')+'>'+((typeof ic==='function')?ic(locked?'lock':icon,14):'')+'<span>'+label+'</span></button>';
  }

  function composeHub(html,title,items,sectionLabel){
    try{
      var box=document.createElement('div');box.innerHTML=html;
      var titleEl=box.querySelector('#topbar h2.title,#topbar .title');
      if(titleEl)titleEl.textContent=title;
      var pad=box.querySelector('.pad.mt6,.pad.mt8,.pad');
      if(!pad)return box.innerHTML;
      var missing=items.filter(function(item){
        if(item.route&&typeof SCREENS[item.route]!=='function')return false;
        if(item.act&&item.act!=='go')return !box.querySelector('[data-act="'+item.act+'"]');
        return !box.querySelector('[data-act="go"][data-arg="'+item.route+'"],[data-act="locked"][data-arg="'+(item.locked||'')+'"]');
      });
      if(missing.length){
        var hub=document.createElement('div');hub.className='srNavHub card frame';
        hub.innerHTML='<div class="srNavHubTitle">'+title+'</div><div class="srNavHubGrid">'+missing.map(navTile).join('')+'</div>';
        pad.insertBefore(hub,pad.firstChild);
      }
      if(sectionLabel){
        var section=document.createElement('div');section.className='sect srNavHubSection';section.textContent=sectionLabel;
        var after=pad.querySelector('.srNavHub');
        if(after&&after.nextSibling)pad.insertBefore(section,after.nextSibling);else if(after)pad.appendChild(section);else pad.insertBefore(section,pad.firstChild);
      }
      return box.innerHTML;
    }catch(_){return html;}
  }

  function installNavigationHubs(){
    if(window.__srNavigationHubsV209)return;
    if(typeof SCREENS==='undefined'||!SCREENS)return;
    window.__srNavigationHubsV209=true;
    if(typeof SCREENS.developpement==='function'){
      var nativeProgress=SCREENS.developpement;
      SCREENS.developpement=function(){return composeHub(nativeProgress(),'Progression',[
        {label:'Arbre',route:'arbre',icon:'tree'},
        {label:'Familiers',route:'familiers',icon:'crown'},
        {label:'Compétences',route:'competences',icon:'bolt'},
        {label:'Défis',route:'defis',icon:'flame'},
        {label:'Ascension',route:'ascension',icon:'star'}
      ]);};
    }
    if(typeof SCREENS.parametres==='function'){
      var nativeMenu=SCREENS.parametres;
      SCREENS.parametres=function(){return composeHub(nativeMenu(),'Menu',[
        {label:'Clan',route:'clan',icon:'banner',locked:(typeof S!=='undefined'&&S.level<10)?10:0},
        {label:'Boutique',route:'boutique',icon:'shop'},
        {label:'Événement',route:'evenement',icon:'gift'},
        {label:'Classement',route:'classement',icon:'trophy'},
        {label:'Chat',route:'chat',icon:'chat'}
      ],'Réglages');};
    }
  }

  var fantasyStyle=document.createElement('style');
  fantasyStyle.id='fantasyNavStyleV65';
  fantasyStyle.textContent=`
    #tabs .fantasyNavV65{position:relative;overflow:visible}
    #tabs .fantasyNavIcon{width:38px;height:38px;display:block;margin:0 auto 2px;filter:drop-shadow(0 3px 4px #000a);transition:filter .18s,transform .18s,opacity .18s}
    #tabs .fantasyNavIcon svg{width:100%;height:100%;display:block;overflow:visible}
    #tabs .fantasyNavV65:not(.on):not(.active):not([aria-current="page"]) .fantasyNavIcon{opacity:.62;filter:saturate(.72) brightness(.78) drop-shadow(0 2px 3px #0009)}
    #tabs .fantasyNavV65.on .fantasyNavIcon,#tabs .fantasyNavV65.active .fantasyNavIcon,#tabs .fantasyNavV65[aria-current="page"] .fantasyNavIcon{transform:translateY(-2px) scale(1.07);filter:brightness(1.16) saturate(1.15) drop-shadow(0 0 8px #E8B44A99) drop-shadow(0 3px 4px #000a)}
    #tabs .fantasyNavV65.on,#tabs .fantasyNavV65.active,#tabs .fantasyNavV65[aria-current="page"]{color:#FBDD8C!important;text-shadow:0 0 10px #E8B44A66}
    .srNavHub{margin-bottom:8px!important;padding:9px!important}
    .srNavHubTitle{font-family:var(--fd);color:var(--goldLit);font-weight:900;letter-spacing:1.2px;text-transform:uppercase;font-size:11px;margin-bottom:7px}
    .srNavHubGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
    .srNavHubItem{width:100%!important;justify-content:flex-start!important;text-align:left!important;min-height:36px!important}
    .srNavHubSection{margin:9px 0 6px!important}
    #app.srHomeFullArena #screen .worldNavLayer>.worldDev,#app.srHomeFullArena #screen .worldNavLayer>.worldDefis,#app.srHomeFullArena #screen .worldNavLayer>.worldMenu,#app.srHomeFullArena #screen .worldNavLayer>.worldRebirth{display:none!important}
  `;
  document.head.appendChild(fantasyStyle);
  window.__srDecorateBottomNavPhase2A=decorate;

  var style=document.createElement('style');
  style.id='srBottomNavGeometryV209';
  style.textContent=`
#tabs{
  box-sizing:border-box!important;
  display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;
  grid-template-rows:58px!important;
  align-items:start!important;
  flex:0 0 calc(58px + env(safe-area-inset-bottom))!important;
  height:calc(58px + env(safe-area-inset-bottom))!important;
  min-height:calc(58px + env(safe-area-inset-bottom))!important;
  max-height:calc(58px + env(safe-area-inset-bottom))!important;
  padding:0 4px env(safe-area-inset-bottom)!important;
  overflow:hidden!important;
}
#tabs>.tab{
  box-sizing:border-box!important;
  position:relative!important;
  display:block!important;
  width:100%!important;
  height:58px!important;
  min-width:0!important;
  min-height:58px!important;
  max-height:58px!important;
  padding:0!important;
  margin:0!important;
  overflow:hidden!important;
  transform:none!important;
}
#tabs>.tab>.ico{
  position:absolute!important;
  left:50%!important;
  top:3px!important;
  width:34px!important;height:34px!important;
  min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;
  margin:0!important;padding:0!important;
  transform:translateX(-50%)!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  line-height:0!important;
  background:none!important;
  -webkit-mask:none!important;mask:none!important;
}
#tabs>.tab>.ico>.fantasyNavIcon{
  position:static!important;
  display:block!important;
  width:34px!important;height:34px!important;
  min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;
  margin:0!important;padding:0!important;
  transform:none!important;
}
#tabs>.tab>span:not(.fantasyNavIcon):not(.dot){
  position:absolute!important;
  left:0!important;right:0!important;top:40px!important;
  display:block!important;
  width:100%!important;height:14px!important;
  margin:0!important;padding:0!important;
  transform:none!important;
  line-height:14px!important;
  font-size:10px!important;
  letter-spacing:.2px!important;
  text-align:center!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:clip!important;
}
#tabs>.tab>.dot{top:3px!important;right:22%!important}
#tabs>.tab .fantasyNavIcon{transition:filter .2s ease,opacity .2s ease!important}
#tabs>.tab.on>.ico>.fantasyNavIcon,
#tabs>.tab.active>.ico>.fantasyNavIcon,
#tabs>.tab[aria-current="page"]>.ico>.fantasyNavIcon{transform:none!important}
@media(max-width:370px),(max-height:720px){
  #tabs{
    grid-template-rows:54px!important;
    flex-basis:calc(54px + env(safe-area-inset-bottom))!important;
    height:calc(54px + env(safe-area-inset-bottom))!important;
    min-height:calc(54px + env(safe-area-inset-bottom))!important;
    max-height:calc(54px + env(safe-area-inset-bottom))!important;
  }
  #tabs>.tab{height:54px!important;min-height:54px!important;max-height:54px!important}
  #tabs>.tab>.ico{top:2px!important;width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #tabs>.tab>.ico>.fantasyNavIcon{width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #tabs>.tab>span:not(.fantasyNavIcon):not(.dot){top:36px!important;height:14px!important;line-height:14px!important;font-size:9.5px!important}
}
`;
  document.head.appendChild(style);

  function imp(el,p,v){if(el)el.style.setProperty(p,v,'important');}
  function compact(){try{return matchMedia('(max-width:370px),(max-height:720px)').matches;}catch(_){return false;}}

  function normalizeIconSlot(tab){
    if(!tab)return null;
    var slot=tab.querySelector(':scope > .ico');
    var direct=tab.querySelector(':scope > .fantasyNavIcon');
    var nested=slot&&slot.querySelector('.fantasyNavIcon');

    if(direct){
      if(!slot){
        slot=document.createElement('i');
        slot.className='ico';
        tab.insertBefore(slot,direct);
      }
      slot.removeAttribute('style');
      slot.classList.add('fantasyNavSlot');
      while(slot.firstChild)slot.removeChild(slot.firstChild);
      slot.appendChild(direct);
      nested=direct;
    }else if(nested){
      slot.removeAttribute('style');
      slot.classList.add('fantasyNavSlot');
    }
    return nested||null;
  }

  function apply(){
    var tabs=document.getElementById('tabs');
    if(!tabs)return;
    var small=compact();
    var row=small?'54px':'58px';
    var icon=small?'31px':'34px';
    var iconTop=small?'2px':'3px';
    var labelTop=small?'36px':'40px';
    var labelSize=small?'9.5px':'10px';

    imp(tabs,'box-sizing','border-box');
    imp(tabs,'display','grid');
    imp(tabs,'grid-template-columns','repeat(4,minmax(0,1fr))');
    imp(tabs,'grid-template-rows',row);
    imp(tabs,'align-items','start');
    imp(tabs,'height','calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'min-height','calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'max-height','calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'flex','0 0 calc('+row+' + env(safe-area-inset-bottom))');
    imp(tabs,'padding','0 4px env(safe-area-inset-bottom)');
    imp(tabs,'overflow','hidden');

    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),function(tab){
      normalizeIconSlot(tab);
      imp(tab,'box-sizing','border-box');imp(tab,'position','relative');imp(tab,'display','block');
      imp(tab,'width','100%');imp(tab,'height',row);imp(tab,'min-width','0');imp(tab,'min-height',row);imp(tab,'max-height',row);
      imp(tab,'padding','0');imp(tab,'margin','0');imp(tab,'overflow','hidden');imp(tab,'transform','none');

      var ico=tab.querySelector(':scope > .ico');
      if(ico){
        imp(ico,'position','absolute');imp(ico,'left','50%');imp(ico,'top',iconTop);
        imp(ico,'width',icon);imp(ico,'height',icon);imp(ico,'min-width',icon);imp(ico,'min-height',icon);imp(ico,'max-width',icon);imp(ico,'max-height',icon);
        imp(ico,'margin','0');imp(ico,'padding','0');imp(ico,'transform','translateX(-50%)');
        imp(ico,'display','flex');imp(ico,'align-items','center');imp(ico,'justify-content','center');imp(ico,'line-height','0');
        imp(ico,'background','none');ico.style.setProperty('-webkit-mask','none','important');imp(ico,'mask','none');
      }
      var fantasy=tab.querySelector(':scope > .ico > .fantasyNavIcon');
      if(fantasy){
        imp(fantasy,'position','static');imp(fantasy,'display','block');
        imp(fantasy,'width',icon);imp(fantasy,'height',icon);imp(fantasy,'min-width',icon);imp(fantasy,'min-height',icon);imp(fantasy,'max-width',icon);imp(fantasy,'max-height',icon);
        imp(fantasy,'margin','0');imp(fantasy,'padding','0');imp(fantasy,'transform','none');
      }
      var label=tab.querySelector(':scope > span:not(.fantasyNavIcon):not(.dot)');
      if(label){
        var key=tab.dataset?tab.dataset.arg:'';if(LABELS[key])label.textContent=LABELS[key];
        imp(label,'position','absolute');imp(label,'left','0');imp(label,'right','0');imp(label,'top',labelTop);
        imp(label,'display','block');imp(label,'width','100%');imp(label,'height','14px');imp(label,'margin','0');imp(label,'padding','0');
        imp(label,'transform','none');imp(label,'line-height','14px');imp(label,'font-size',labelSize);imp(label,'letter-spacing','.2px');
        imp(label,'text-align','center');imp(label,'white-space','nowrap');imp(label,'overflow','hidden');imp(label,'text-overflow','clip');
      }
      var dot=tab.querySelector(':scope > .dot');if(dot){imp(dot,'top',iconTop);imp(dot,'right','22%');}
    });
  }

  function decorateAndApply(){decorate();apply();}
  function publishRendered(){
    try{window.dispatchEvent(new Event('sr:bottomnavrendered'));}catch(_){}
  }

  installNavigationHubs();
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;decorateAndApply();});}
  window.__srApplyBottomNavGeometryV209=apply;
  window.__srRefreshBottomNavV209=decorateAndApply;

  var nativeRenderTabs=typeof window.renderTabs==='function'?window.renderTabs:null;
  if(nativeRenderTabs){
    window.renderTabs=function(){
      var out=nativeRenderTabs.apply(this,arguments);
      decorateAndApply();
      publishRendered();
      return out;
    };
  }
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('orientationchange',schedule,{passive:true});
  decorateAndApply();
  publishRendered();
})();