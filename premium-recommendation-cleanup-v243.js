/* SHADOWREACH · Recommendation visual cleanup V243
   Removes recommendation labels and emphasis glow while preserving the
   premium button palette, accessibility focus states, and interaction logic. */
(function(){
  'use strict';
  if(window.__srRecommendationCleanupV243)return;
  window.__srRecommendationCleanupV243=true;

  var style=document.createElement('style');
  style.id='srRecommendationCleanupV243';
  style.textContent=`
/* Recommendation is conveyed by placement/context only: no badge or halo. */
[data-primary-action="true"]:not([data-primary="true"])::after{
  content:none!important;
  display:none!important;
}
.btn[data-primary-action="true"]{
  border-color:#080D17!important;
  filter:none!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 3px 0 #080D17,0 8px 18px rgba(0,0,0,.42)!important;
}
[data-primary-action="true"]:not(.btn){
  box-shadow:none!important;
  filter:none!important;
}
.recommendedActionCard{
  border:1px solid var(--border)!important;
  border-left:1px solid var(--border)!important;
  background:linear-gradient(180deg,#1B2942 0%,#141F35 46%,#101A2C 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(0,0,0,.35),0 4px 14px rgba(0,0,0,.34)!important;
}
.recommendedKicker{display:none!important}
`;
  document.head.appendChild(style);
})();
