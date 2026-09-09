/* Shadowreach V242 — Familiers : fin de scroll au-dessus de la navigation basse.
   Corrige le contenu Fusion/Œufs/Progression qui pouvait passer derrière #tabs sur iPhone.
   Visuel/UX uniquement : aucun changement économie, sauvegarde ou gameplay. */
(function(){
  'use strict';
  if(window.__srFamScrollSafeV242)return;
  window.__srFamScrollSafeV242=true;

  var old=document.getElementById('famScrollSafeV242Style');
  if(old)old.remove();
  var style=document.createElement('style');
  style.id='famScrollSafeV242Style';
  style.textContent=`
/* #tabs est une barre persistante superposée. Le contenu scrollable doit avoir
   sa propre zone de dégagement afin que sa dernière ligne puisse remonter
   complètement au-dessus de la navigation, y compris avec la safe-area iOS. */
#screen:has(.famScroll240) .fam240Scroll{
  box-sizing:border-box!important;
  padding-bottom:calc(112px + env(safe-area-inset-bottom, 0px))!important;
  scroll-padding-bottom:calc(112px + env(safe-area-inset-bottom, 0px))!important;
}
#screen:has(.famScroll240) .fam240BottomSpace{
  display:none!important;
}
/* Les blocs ajoutés en V241 ne doivent jamais créer leur propre débordement :
   le seul scroll vertical reste celui de .fam240Scroll. */
#screen:has(.famScroll240) .fam241Fusion,
#screen:has(.famScroll240) .fam241Accel{
  overflow:visible!important;
  min-height:0!important;
}
/* Un peu d'air après la dernière ligne de Fusion pour qu'un bouton ne colle
   jamais visuellement au bord supérieur de la barre de navigation. */
#screen:has(.famScroll240) .fam241Fusion:last-child{
  margin-bottom:8px!important;
}
`;
  document.head.appendChild(style);
})();