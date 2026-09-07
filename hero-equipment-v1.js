/* SHADOWREACH HERO EQUIPMENT VISUAL V2
   Safety-first equipment visual bridge.
   V1 replaced the authored hero sprite with CSS geometry, which degraded the
   game's art direction. V2 NEVER hides or replaces the original fighter.
   Until authored transparent equipment layers exist, the original hero remains
   intact and the already-existing weapon renderer is authoritative.
   Future equipment PNG layers can plug into this file without touching combat. */
(()=>{
"use strict";
if(typeof drawArena!=="function") return;
const originalDrawArena=drawArena;
function preserveHero(){
  const layer=document.getElementById("aLayer");
  if(!layer) return;
  const hero=layer.querySelector(":scope > .unit");
  if(!hero) return;
  const sprite=hero.querySelector(":scope > img");
  if(sprite){
    sprite.classList.remove("heroOriginalSprite");
    sprite.style.removeProperty("display");
  }
  hero.querySelectorAll(":scope > .heroEqVisual").forEach(n=>n.remove());
}
drawArena=function(){
  originalDrawArena.apply(this,arguments);
  try{preserveHero();}catch(_){/* cosmetic bridge must never affect combat */}
};
})();
