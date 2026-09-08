/* SHADOWREACH · Bottom navigation layout V184
   Stable CSS-only bottom navigation. No runtime MutationObserver, no delayed
   corrections, so iOS Safari cannot flash between default and corrected layouts. */
(function(){
  'use strict';
  if(window.__srBottomNavLayoutV184)return;
  window.__srBottomNavLayoutV184=true;

  var style=document.createElement('style');
  style.id='srBottomNavLayoutV184';
  style.textContent=`
#app.srHomeFullArena>#tabs{
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

#app.srHomeFullArena>#tabs>.tab{
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

#app.srHomeFullArena>#tabs>.tab>.ico{
  position:absolute!important;
  left:50%!important;
  top:3px!important;
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  margin:0!important;
  padding:0!important;
  transform:translateX(-50%)!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  line-height:0!important;
}

#app.srHomeFullArena>#tabs>.tab>.ico>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon{
  position:static!important;
  display:block!important;
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  margin:0!important;
  transform:none!important;
}

#app.srHomeFullArena>#tabs>.tab>span:not(.ico){
  position:absolute!important;
  left:0!important;
  right:0!important;
  top:40px!important;
  display:block!important;
  width:100%!important;
  height:14px!important;
  margin:0!important;
  padding:0!important;
  transform:none!important;
  line-height:14px!important;
  font-size:10px!important;
  text-align:center!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:clip!important;
}

#app.srHomeFullArena>#tabs>.tab[data-arg="developpement"]>span:not(.ico){
  font-size:9px!important;
  letter-spacing:0!important;
}

#app.srHomeFullArena>#tabs>.tab>.dot{
  top:3px!important;
  right:22%!important;
}

/* Disable the active-icon translate/scale animation from fantasy nav V65.
   The glow remains, but the icon never physically moves. */
#app.srHomeFullArena>#tabs>.tab .fantasyNavIcon{
  transition:filter .18s,opacity .18s!important;
}
#app.srHomeFullArena>#tabs>.tab.on .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"] .fantasyNavIcon{
  transform:none!important;
}

@media(max-width:370px), (max-height:720px){
  #app.srHomeFullArena>#tabs{
    grid-template-rows:54px!important;
    flex-basis:calc(54px + env(safe-area-inset-bottom))!important;
    height:calc(54px + env(safe-area-inset-bottom))!important;
    min-height:calc(54px + env(safe-area-inset-bottom))!important;
    max-height:calc(54px + env(safe-area-inset-bottom))!important;
  }
  #app.srHomeFullArena>#tabs>.tab{
    height:54px!important;
    min-height:54px!important;
    max-height:54px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>.ico{
    top:2px!important;
    width:31px!important;height:31px!important;
    min-width:31px!important;min-height:31px!important;
    max-width:31px!important;max-height:31px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon{
    width:31px!important;height:31px!important;
    min-width:31px!important;min-height:31px!important;
    max-width:31px!important;max-height:31px!important;
  }
  #app.srHomeFullArena>#tabs>.tab>span:not(.ico){top:36px!important;height:14px!important;line-height:14px!important}
}
`;
  document.head.appendChild(style);
})();