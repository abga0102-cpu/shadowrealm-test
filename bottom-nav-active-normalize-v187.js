/* SHADOWREACH · Bottom nav active icon normalization V187
   Keep selected icons the same size and position as inactive icons.
   Save import is owned by import-save-guard-v207.js. */
(function(){
  'use strict';
  if(window.__srBottomNavActiveNormalizeV187)return;
  window.__srBottomNavActiveNormalizeV187=true;

  var old=document.getElementById('srBottomNavActiveNormalizeV187');
  if(old)old.remove();

  var style=document.createElement('style');
  style.id='srBottomNavActiveNormalizeV187';
  style.textContent=`
/* Icons inside the normal .ico wrapper never move or scale when selected. */
#app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.on>.ico .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active>.ico .fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.ico .fantasyNavIcon{
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  margin:0!important;
  transform:none!important;
}

/* A direct fantasy icon (Development in the legacy V187 DOM) must preserve centering. */
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.on>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.fantasyNavIcon{
  width:34px!important;
  height:34px!important;
  min-width:34px!important;
  min-height:34px!important;
  max-width:34px!important;
  max-height:34px!important;
  margin:0!important;
  transform:translateX(-50%)!important;
}

@media(max-width:370px),(max-height:720px){
  #app.srHomeFullArena>#tabs>.tab>.ico .fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab.on>.ico .fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab.active>.ico .fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.ico .fantasyNavIcon{
    width:31px!important;
    height:31px!important;
    min-width:31px!important;
    min-height:31px!important;
    max-width:31px!important;
    max-height:31px!important;
    transform:none!important;
  }

  #app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab.on>.fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab.active>.fantasyNavIcon,
  #app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.fantasyNavIcon{
    width:31px!important;
    height:31px!important;
    min-width:31px!important;
    min-height:31px!important;
    max-width:31px!important;
    max-height:31px!important;
    transform:translateX(-50%)!important;
  }
}
`;
  document.head.appendChild(style);
})();
