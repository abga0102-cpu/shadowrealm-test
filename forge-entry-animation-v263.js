/* SHADOWREACH · Forge Entry Animation V263
   Presentation-only micro-animation for forged item cards.
   Runs after Forge UX V261/V262. No economy/progression/save changes.
*/
(function(){
'use strict';
if(window.__srForgeEntryAnimationV263)return;
window.__srForgeEntryAnimationV263=true;
var st=document.createElement('style');
st.id='srForgeEntryAnimationV263Style';
st.textContent=`
#srForgeLoot261 .srForgeCard261{
  opacity:0!important;
  transform:translateY(7px) scale(.965)!important;
  filter:brightness(.88) saturate(.86);
}
#srForgeLoot261 .srForgeCard261.show{
  animation:srForgeEnter263 .24s cubic-bezier(.2,.85,.3,1.12) both!important;
}
#srForgeLoot261 .srForgeCard261.show:nth-child(2){animation-delay:.045s!important}
#srForgeLoot261 .srForgeCard261.show:nth-child(3){animation-delay:.09s!important}
#srForgeLoot261 .srForgeCard261.show:nth-child(4){animation-delay:.135s!important}
#srForgeLoot261 .srForgeCard261.kept.show{
  box-shadow:0 3px 9px #0008,0 0 11px color-mix(in srgb,var(--r) 28%,transparent);
}
@keyframes srForgeEnter263{
  0%{opacity:0;transform:translateY(7px) scale(.965);filter:brightness(.88) saturate(.86)}
  72%{opacity:1;transform:translateY(-1px) scale(1.012);filter:brightness(1.08) saturate(1.04)}
  100%{opacity:1;transform:translateY(0) scale(1);filter:none}
}
@media(prefers-reduced-motion:reduce){
  #srForgeLoot261 .srForgeCard261.show{animation:srForgeEnterReduced263 .1s linear both!important}
  #srForgeLoot261 .srForgeCard261.show:nth-child(n){animation-delay:0s!important}
  @keyframes srForgeEnterReduced263{from{opacity:0}to{opacity:1}}
}
`;
document.head.appendChild(st);
window.__srForgeEntryAnimationV263={version:263};
})();
