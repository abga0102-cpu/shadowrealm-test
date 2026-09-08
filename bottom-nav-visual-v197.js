/* SHADOWREACH · Bottom navigation visual fix V197
   Visual-only correction built on the known-good V187 interaction model.
   No MutationObserver, no route writes, no DOM restructuring, no event handlers.
   - keeps every selected icon at exactly the same size as its inactive state
   - aligns direct fantasy icons (notably Development) with wrapped icons
   - keeps labels out of icon/dot geometry
*/
(function(){
  'use strict';
  if(window.__srBottomNavVisualV197)return;
  window.__srBottomNavVisualV197=true;

  var old=document.getElementById('srBottomNavVisualV197');
  if(old)old.remove();

  var style=document.createElement('style');
  style.id='srBottomNavVisualV197';
  style.textContent=`
/* Wrapped icons: fixed geometry, active state never scales or moves. */
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

/* Direct icons use the same visual box, but retain horizontal centering. */
#app.srHomeFullArena>#tabs>.tab>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.on>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab.active>.fantasyNavIcon,
#app.srHomeFullArena>#tabs>.tab[aria-current="page"]>.fantasyNavIcon{
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
  display:block!important;
  line-height:0!important;
}

/* Text label geometry must never capture the fantasy icon or notification dot. */
#app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon):not(.dot){
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
  letter-spacing:.2px!important;
  text-align:center!important;
  white-space:nowrap!important;
  overflow:hidden!important;
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
    top:2px!important;
    width:31px!important;
    height:31px!important;
    min-width:31px!important;
    min-height:31px!important;
    max-width:31px!important;
    max-height:31px!important;
    transform:translateX(-50%)!important;
  }

  #app.srHomeFullArena>#tabs>.tab>span:not(.ico):not(.fantasyNavIcon):not(.dot){
    top:36px!important;
    font-size:9.5px!important;
  }
}
`;
  document.head.appendChild(style);
})();
