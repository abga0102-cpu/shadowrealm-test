/* Shadowreach V246 — Familiers : un seul scroll naturel, comme l'Arbre.
   Remplace les scrolls imbriqués V240/V242/V245 qui provoquaient un contenu Fusion
   coupé derrière la barre basse sur iPhone. UX uniquement : aucun changement gameplay/save. */
(function(){
  'use strict';
  if(window.__srFamNaturalScrollV246)return;
  window.__srFamNaturalScrollV246=true;

  var old=document.getElementById('famNaturalScrollV246Style');
  if(old)old.remove();
  var style=document.createElement('style');
  style.id='famNaturalScrollV246Style';
  style.textContent=`
/* Familiers repasse sur le scroll natif de #screen : plus de viewport interne
   qui peut finir derrière #tabs. */
#screen:has(.famScroll240){
  display:block!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  min-height:0!important;
  -webkit-overflow-scrolling:touch!important;
  overscroll-behavior-y:contain!important;
}
#screen:has(.famScroll240)>#topbar{
  position:relative!important;
}
#screen:has(.famScroll240) .famScroll240{
  display:block!important;
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
  overflow:visible!important;
  padding:6px 10px calc(82px + env(safe-area-inset-bottom, 0px))!important;
}
#screen:has(.famScroll240) .fam240Hero,
#screen:has(.famScroll240) .fam240Hatching,
#screen:has(.famScroll240) .fam240Tabs{
  position:relative!important;
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
/* L'ancienne compensation V242/V245 ne doit plus intervenir. */
#screen:has(.famScroll240) .fam240BottomSpace{display:none!important}
#screen:has(.famScroll240) .fam241Integrated:last-child{
  margin-bottom:24px!important;
}
/* Les oeufs en cours gardent une petite zone interne uniquement si nécessaire ;
   ce n'est pas le scroll principal de la page. */
#screen:has(.famScroll240) .fam240HatchGrid{
  max-height:none!important;
  overflow:visible!important;
}
`;
  document.head.appendChild(style);
})();