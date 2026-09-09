/* Shadowreach V245 — Familiers : viewport de scroll réservé au-dessus de la navigation basse.
   Corrige définitivement la fin de Collection/Fusion, Œufs et Progression qui pouvait rester
   visuellement sous la barre #tabs sur iPhone. UX uniquement : aucun changement gameplay/save. */
(function(){
  'use strict';
  if(window.__srFamScrollViewportV245)return;
  window.__srFamScrollViewportV245=true;
  var old=document.getElementById('famScrollViewportV245Style');
  if(old)old.remove();
  var style=document.createElement('style');
  style.id='famScrollViewportV245Style';
  style.textContent=`
/* On réserve physiquement la hauteur de la navigation dans le VIEWPORT du contenu,
   au lieu d'ajouter seulement un espace à la fin de la liste. C'est ce qui évite
   qu'une ligne Fusion reste derrière #tabs sur Safari iOS. */
#screen:has(.famScroll240) .fam240Body{
  box-sizing:border-box!important;
  min-height:0!important;
  padding-bottom:calc(66px + env(safe-area-inset-bottom, 0px))!important;
  overflow:hidden!important;
}
#screen:has(.famScroll240) .fam240Scroll{
  box-sizing:border-box!important;
  height:100%!important;
  max-height:100%!important;
  min-height:0!important;
  padding-bottom:18px!important;
  scroll-padding-bottom:18px!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  -webkit-overflow-scrolling:touch!important;
}
#screen:has(.famScroll240) .fam241Integrated:last-child{
  margin-bottom:18px!important;
}
/* Neutralise l'ancien correctif V242 : le dégagement est désormais porté par le viewport,
   pas par un padding de 112px dans la liste. */
#screen:has(.famScroll240) .fam240BottomSpace{display:none!important}
`;
  document.head.appendChild(style);
})();