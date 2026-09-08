/* SHADOWREACH · Bottom navigation runtime V198
   Phase 2 ownership consolidation.
   One owner for fantasy icon decoration and the effective V197 navigation styles.
   It replaces the legacy V65 observer + V183/V186/V187 override stack without
   changing routes, data-act values, click/touch handlers, or game state. */
(function(){
  'use strict';
  if(window.__srBottomNavRuntimeV198)return;
  window.__srBottomNavRuntimeV198=true;

  const ICONS={
    accueil:`<span class="fantasyNavIcon fantasyHome"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fhg" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFF2A6"/><stop offset=".45" stop-color="#E7B64D"/><stop offset="1" stop-color="#8A5718"/></linearGradient><linearGradient id="fhb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4CB5FF"/><stop offset="1" stop-color="#123766"/></linearGradient></defs><ellipse cx="32" cy="54" rx="24" ry="5" fill="#E8B44A" opacity=".28"/><path d="M10 48V25l8-5v-7l8 5 6-10 6 10 8-5v7l8 5v23H10Z" fill="url(#fhg)" stroke="#5B3510" stroke-width="2"/><path d="M16 29h8v13h-8zm24 0h8v13h-8z" fill="url(#fhb)"/><path d="M25 48V32c0-5 3-9 7-9s7 4 7 9v16H25Z" fill="#FFCF45" stroke="#6D430F" stroke-width="2"/><path d="M29 48V33c0-3 1-5 3-5s3 2 3 5v15" fill="#FFF1A0" opacity=".75"/></svg></span>`,
    equipement:`<span class="fantasyNavIcon fantasyEquip"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="feg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF1A4"/><stop offset=".5" stop-color="#C99432"/><stop offset="1" stop-color="#6C4214"/></linearGradient><linearGradient id="fes" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset=".45" stop-color="#AFC5DE"/><stop offset="1" stop-color="#4C6380"/></linearGradient><linearGradient id="feb" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#376DA8"/><stop offset="1" stop-color="#142B4C"/></linearGradient></defs><path d="M35 10c8 5 14 5 20 3v20c0 11-8 17-20 21-12-4-20-10-20-21V13c6 2 12 2 20-3Z" fill="url(#feb)" stroke="url(#feg)" stroke-width="3"/><path d="M20 16 48 44" stroke="#5A3510" stroke-width="7" stroke-linecap="round"/><path d="M18 12 52 46" stroke="url(#fes)" stroke-width="4" stroke-linecap="round"/><path d="m14 11 9 1-8 8Z" fill="url(#feg)"/><path d="m47 38 8 8-4 4-8-8Z" fill="url(#feg)"/></svg></span>`,
    developpement:`<span class="fantasyNavIcon fantasyDev"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fdg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFD66A"/><stop offset="1" stop-color="#784616"/></linearGradient><radialGradient id="fdb"><stop stop-color="#8EEBFF"/><stop offset=".45" stop-color="#2D9BFF"/><stop offset="1" stop-color="#0E3D82"/></radialGradient></defs><ellipse cx="32" cy="55" rx="23" ry="5" fill="#178BFF" opacity=".25"/><path d="M32 54c-2-10 3-15 1-24-1-7 2-14 3-18-7 9-8 15-7 22-3-5-7-8-12-10 7 6 9 13 8 21-5 0-9 3-12 8h38c-4-5-8-8-13-8 1-8 4-15 10-22-6 3-10 7-13 12 1-9 0-14-3-23" fill="none" stroke="url(#fdg)" stroke-width="5" stroke-linecap="round"/><g fill="url(#fdb)" stroke="#62CFFF" stroke-width="1"><path d="M15 23c5-5 10-4 13 1-5 4-10 4-13-1Z"/><path d="M39 20c4-6 10-7 14-3-3 6-8 8-14 3Z"/><path d="M25 13c2-7 7-10 12-7-1 7-5 10-12 7Z"/><path d="M43 31c5-4 10-2 12 3-5 4-10 3-12-3Z"/><path d="M14 35c5-4 10-2 12 3-5 4-10 3-12-3Z"/></g></svg></span>`,
    parametres:`<span class="fantasyNavIcon fantasySettings"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="fsg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#E8D3A2"/><stop offset=".45" stop-color="#987044"/><stop offset="1" stop-color="#4C3421"/></linearGradient><radialGradient id="fsb"><stop stop-color="#C8F4FF"/><stop offset=".35" stop-color="#3BB7FF"/><stop offset="1" stop-color="#14509C"/></radialGradient></defs><path d="m32 7 5 6 8-1 2 8 7 4-4 7 4 7-7 4-2 8-8-1-5 6-5-6-8 1-2-8-7-4 4-7-4-7 7-4 2-8 8 1 5-6Z" fill="url(#fsg)" stroke="#D2B57A" stroke-width="2"/><circle cx="32" cy="31" r="15" fill="#17243A" stroke="#D2B57A" stroke-width="2"/><path d="m32 18 10 13-10 13-10-13Z" fill="url(#fsb)" stroke="#70D6FF" stroke-width="2"/></svg></span>`
  };

  var style=document.createElement('style');
  style.id='srBottomNavRuntimeV198';
  style.textContent=`
/* V65 baseline used by non-home screens in V197. */
#tabs .fantasyNavV65{position:relative;overflow:visible}
#tabs .fantasyNavIcon{width:38px;height:38px;display:block;margin:0 auto 2px;filter:drop-shadow(0 3px 4px #000a);transition:filter .18s,transform .18s,opacity .18s}
#tabs .fantasyNavIcon svg{width:100%;height:100%;display:block;overflow:visible}
#tabs .fantasyNavV65:not(.on):not(.active):not([aria-current="page"]) .fantasyNavIcon{opacity:.62;filter:saturate(.72) brightness(.78) drop-shadow(0 2px 3px #0009)}
#tabs .fantasyNavV65.on .fantasyNavIcon,#tabs .fantasyNavV65.active .fantasyNavIcon,#tabs .fantasyNavV65[aria-current="page"] .fantasyNavIcon{transform:translateY(-2px) scale(1.07);filter:brightness(1.16) saturate(1.15) drop-shadow(0 0 8px #E8B44A99) drop-shadow(0 3px 4px #000a)}
#tabs .fantasyNavV65.on,#tabs .fantasyNavV65.active,#tabs .fantasyNavV65[aria-current="page"]{color:#FBDD8C!important;text-shadow:0 0 10px #E8B44A66}

/* V183/V186/V187 effective Home geometry, now owned in one place. */
#app.srHomeFullArena>#tabs{
  box-sizing:border-box!important;display:grid!important;
  grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:58px!important;
  align-items:start!important;flex:0 0 calc(58px + env(safe-area-inset-bottom))!important;
  height:calc(58px + env(safe-area-inset-bottom))!important;
  min-height:calc(58px + env(safe-area-inset-bottom))!important;
  max-height:calc(58px + env(safe-area-inset-bottom))!important;
  padding:0 4px env(safe-area-inset-bottom)!important;overflow:hidden!important;
}
#app.srHomeFullArena>#tabs>.tab{
  box-sizing:border-box!important;position:relative!important;display:block!important;
  width:100%!important;height:58px!important;min-width:0!important;
  min-height:58px!important;max-height:58px!important;padding:0!important;margin:0!important;
  overflow:hidden!important;transform:none!important;color:#AAB8D0!important;
}
#app.srHomeFullArena>#tabs>.tab>.ico{
  position:absolute!important;left:50%!important;top:3px!important;
  width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;margin:0!important;padding:0!important;
  transform:translateX(-50%)!important;display:flex!important;align-items:center!important;
  justify-content:center!important;line-height:0!important;
}
#app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon{
  position:static!important;display:block!important;width:34px!important;height:34px!important;
  min-width:34px!important;min-height:34px!important;max-width:34px!important;max-height:34px!important;
  margin:0!important;transform:none!important;
}
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{
  position:absolute!important;left:50%!important;top:3px!important;display:block!important;
  width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important;
  max-width:34px!important;max-height:34px!important;margin:0!important;padding:0!important;
  transform:translateX(-50%)!important;line-height:0!important;
}
#app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon):not(.dot){
  position:absolute!important;left:0!important;right:0!important;top:40px!important;
  display:block!important;width:100%!important;height:14px!important;margin:0!important;padding:0!important;
  transform:none!important;line-height:14px!important;font-size:10px!important;letter-spacing:.2px!important;
  text-align:center!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:clip!important;
}
#app.srHomeFullArena>#tabs>.tab>.dot{top:3px!important;right:22%!important}
#app.srHomeFullArena>#tabs>.fantasyNavV65 .fantasyNavIcon{transition:filter .18s,opacity .18s!important;filter:drop-shadow(0 3px 4px #000a)}
#app.srHomeFullArena>#tabs>.fantasyNavV65:not(.on):not(.active):not([aria-current="page"]) .fantasyNavIcon{opacity:.74!important;filter:saturate(.78) brightness(.9) drop-shadow(0 2px 3px #0009)!important}
#app.srHomeFullArena>#tabs>.fantasyNavV65.on .fantasyNavIcon,#app.srHomeFullArena>#tabs>.fantasyNavV65.active .fantasyNavIcon,#app.srHomeFullArena>#tabs>.fantasyNavV65[aria-current="page"] .fantasyNavIcon{opacity:1!important;filter:brightness(1.16) saturate(1.15) drop-shadow(0 0 8px #E8B44A99) drop-shadow(0 3px 4px #000a)!important}
#app.srHomeFullArena>#tabs>.tab.on>.ico .fantasyNavIcon,#app.srHomeFullArena>#tabs>.tab.active>.ico .fantasyNavIcon,#app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.ico .fantasyNavIcon{transform:none!important}
#app.srHomeFullArena>#tabs>.tab.on>.fantasyNavIcon,#app.srHomeFullArena>#tabs>.tab.active>.fantasyNavIcon,#app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.fantasyNavIcon{transform:translateX(-50%)!important}
@media(max-width:370px),(max-height:720px){
  #app.srHomeFullArena>#tabs{
    grid-template-rows:54px!important;flex-basis:calc(54px + env(safe-area-inset-bottom))!important;
    height:calc(54px + env(safe-area-inset-bottom))!important;
    min-height:calc(54px + env(safe-area-inset-bottom))!important;
    max-height:calc(54px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs>.tab{height:54px!important;min-height:54px!important;max-height:54px!important}
  #app.srHomeFullArena>#tabs>.tab>.ico{top:2px!important;width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon{width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon{top:2px!important;width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;max-width:31px!important;max-height:31px!important}
  #app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon):not(.dot){top:36px!important;height:14px!important;line-height:14px!important;font-size:9.5px!important}
}
`;
  document.head.appendChild(style);

  function decorateTab(tab){
    var key=tab&&tab.dataset?tab.dataset.arg:'';
    var markup=ICONS[key];
    if(!markup)return;
    if(!tab.querySelector('.fantasyNavIcon')){
      var app=document.getElementById('app');
      var home=!!(app&&app.classList.contains('srHomeFullArena'));
      if(key==='developpement'&&home){
        var direct=tab.querySelector(':scope > .ico');
        if(direct)direct.outerHTML=markup;
        else tab.insertAdjacentHTML('afterbegin',markup);
      }else{
        var wrapper=tab.querySelector(':scope > .ico');
        if(wrapper){
          var art=wrapper.querySelector('svg,img');
          if(art)art.outerHTML=markup;else wrapper.innerHTML=markup;
        }else{
          var artDirect=tab.querySelector(':scope > svg,:scope > img');
          if(artDirect)artDirect.outerHTML=markup;else tab.insertAdjacentHTML('afterbegin',markup);
        }
      }
    }
    tab.classList.add('fantasyNavV65');
    tab.dataset.fantasyNav='198';
  }

  function decorate(){
    var tabs=document.getElementById('tabs');
    if(!tabs)return;
    Array.prototype.forEach.call(tabs.querySelectorAll(':scope > .tab'),decorateTab);
  }

  var nativeRenderTabs=typeof window.renderTabs==='function'?window.renderTabs:null;
  if(nativeRenderTabs){
    window.renderTabs=function(){
      var out=nativeRenderTabs.apply(this,arguments);
      decorate();
      return out;
    };
  }
  decorate();
})();
