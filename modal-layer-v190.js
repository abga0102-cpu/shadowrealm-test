/* SHADOWREACH · Modal interaction layer V190
   Modal dialogs must be the top interactive surface. Several later UI layers
   (HUD, reward feed, tutorials, social and Forge previews) use z-index values
   above the original #overlay value of 60, which can leave invisible/blurred
   hit targets above modal controls on mobile Safari. This layer restores a
   single modal stacking contract without changing any game action handlers. */
(function(){
  'use strict';
  if(window.__srModalLayerV190)return;
  window.__srModalLayerV190=true;

  var style=document.createElement('style');
  style.id='srModalLayerV190';
  style.textContent=`
#overlay{
  z-index:15000!important;
  pointer-events:auto!important;
  isolation:isolate!important;
}
#overlay>.card{
  position:relative!important;
  z-index:1!important;
  pointer-events:auto!important;
}
#overlay [data-act]{
  touch-action:manipulation!important;
}
#overlay .mx{
  position:relative!important;
  width:32px!important;
  height:32px!important;
  min-width:32px!important;
  min-height:32px!important;
  flex:0 0 32px!important;
  touch-action:manipulation!important;
}
#overlay .mx::before{
  content:"";
  position:absolute;
  inset:-6px;
}
#toast{
  z-index:15010!important;
}
`;
  document.head.appendChild(style);
})();
