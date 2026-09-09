/* Shadowreach V245/V246 hotfix — Familiers : un seul scroll naturel, comme l'Arbre.
   Le viewport interne est supprimé : Collection/Fusion, Œufs/Accélérateurs et Progression
   utilisent le scroll de #screen, ce qui élimine le contenu coincé derrière #tabs sur iPhone. */
(function(){
  'use strict';
  if(window.__srFamScrollViewportV245)return;
  window.__srFamScrollViewportV245=true;
  var old=document.getElementById('famScrollViewportV245Style');
  if(old)old.remove();
  var style=document.createElement('style');
  style.id='famScrollViewportV245Style';
  style.textContent=`
#screen:has(.famScroll240){
  display:block!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  min-height:0!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior-y:contain!important;
}
#screen:has(.famScroll240)>#topbar{position:relative!important}
#screen:has(.famScroll240) .famScroll240{
  display:block!important;
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  overflow:visible!important;
  padding:6px 10px calc(82px + env(safe-area-inset-bottom, 0px))!important;
}
#screen:has(.famScroll240) .fam240Body{
  display:block!important;
  height:auto!important;
  max-height:none!important;
  min-height:0!important;
  overflow:visible!important;
  padding-bottom:0!important;
}
#screen:has(.famScroll240) .fam240Scroll{
  display:block!important;
  height:auto!important;
  max-height:none!important;
  min-height:0!important;
  overflow:visible!important;
  padding:2px 0 0!important;
  scroll-padding-bottom:0!important;
}
#screen:has(.famScroll240) .fam240BottomSpace{display:none!important}
#screen:has(.famScroll240) .fam241Integrated:last-child{margin-bottom:24px!important}
#screen:has(.famScroll240) .fam240HatchGrid{max-height:none!important;overflow:visible!important}
`;
  document.head.appendChild(style);
})();