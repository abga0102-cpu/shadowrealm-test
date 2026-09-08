/* SHADOWREACH · Sanctuary Touch Polish V181
   UX only: keeps all Sanctuary merge rules, costs, rewards and save values intact.
   Replaces only the gesture presentation layer with smoother touch tracking. */
(function(){
'use strict';
if(window.__srSanctTouchV181)return;window.__srSanctTouchV181=true;
if(typeof sanctMergeDrop!=='function'||typeof sanctMergeState!=='function')return;

var drag=null,raf=0;
function reduced(){return !!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}
function injectCss(){if(document.getElementById('srSanctTouch181Style'))return;var s=document.createElement('style');s.id='srSanctTouch181Style';s.textContent='\
.sanctMergePiece.srSanctLift181{opacity:.3!important;transform:scale(.94)!important}\
.srSanctGhost181{position:fixed!important;z-index:10020!important;pointer-events:none!important;width:72px!important;height:72px!important;margin:-36px 0 0 -36px!important;will-change:transform,left,top;transform:translate3d(0,0,0) scale(1.08);filter:drop-shadow(0 10px 14px #000b);transition:filter .12s,transform .12s;opacity:.98}\
.srSanctGhost181.srMagnet181{transform:translate3d(0,0,0) scale(1.13);filter:drop-shadow(0 0 14px var(--srMag,#8FEFF4)) drop-shadow(0 10px 14px #000b)}\
.sanctMergeCell.srCompat181{box-shadow:0 0 0 1px var(--srGlow,#8FEFF4),0 0 15px color-mix(in srgb,var(--srGlow,#8FEFF4) 45%,transparent)!important;animation:srSanctPulse181 1.05s ease-in-out infinite}\
.sanctMergeCell.srDim181{opacity:.62;filter:saturate(.72)}\
.sanctMergeCell.srNear181{transform:scale(1.055)!important;box-shadow:0 0 0 2px #84E891,0 0 22px #3FB95099!important}\
.sanctMergeCell.srBad181{box-shadow:0 0 0 2px #FF868A,0 0 14px #E5484D66!important}\
.srSanctLocalFx181{position:fixed;z-index:10010;pointer-events:none;width:20px;height:20px;margin:-10px;border-radius:50%;border:2px solid var(--srC,#fff);box-shadow:0 0 18px var(--srC,#fff);animation:srSanctBurst181 .48s ease-out both}\
.srSanctLocalFx181:before,.srSanctLocalFx181:after{content:"";position:absolute;inset:-10px;border-radius:50%;border:1px solid var(--srC,#fff);animation:srSanctBurstRing181 .5s ease-out both}\
.srSanctLocalFx181:after{animation-delay:.06s}\
@keyframes srSanctPulse181{0%,100%{filter:brightness(1)}50%{filter:brightness(1.18)}}\
@keyframes srSanctBurst181{0%{transform:scale(.3);opacity:1}100%{transform:scale(3.6);opacity:0}}\
@keyframes srSanctBurstRing181{0%{transform:scale(.4);opacity:.95}100%{transform:scale(2.9);opacity:0}}\
@media(prefers-reduced-motion:reduce){.sanctMergeCell.srCompat181{animation:none}.srSanctLocalFx181{display:none}}';document.head.appendChild(s);}
function colorFor(r){try{return (SANCT_MERGE_COLOR&&SANCT_MERGE_COLOR[r])||'#8FEFF4';}catch(_){return '#8FEFF4';}}
function clearMarks(){document.querySelectorAll('.srCompat181,.srDim181,.srNear181,.srBad181').forEach(function(el){el.classList.remove('srCompat181','srDim181','srNear181','srBad181');el.style.removeProperty('--srGlow');});}
function markBoard(r){clearMarks();document.querySelectorAll('.sanctMergeCell[data-sanct-slot]').forEach(function(c){var cr=c.dataset.sanctRarity||'';if(!cr)return;if(cr===r){c.classList.add('srCompat181');c.style.setProperty('--srGlow',colorFor(r));}else c.classList.add('srDim181');});}
function nearestCell(x,y,from){var best=null,bd=999;document.querySelectorAll('.sanctMergeCell[data-sanct-slot]').forEach(function(c){if(Number(c.dataset.sanctSlot)===from)return;var r=c.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,d=Math.hypot(x-cx,y-cy);if(d<bd&&d<58){bd=d;best=c;}});return best;}
function selectTarget(x,y){var el=document.elementFromPoint(x,y),c=el&&el.closest?el.closest('.sanctMergeCell[data-sanct-slot]'):null;if(c&&Number(c.dataset.sanctSlot)!==drag.from)return c;return nearestCell(x,y,drag.from);}
function updateTarget(){if(!drag)return;document.querySelectorAll('.srNear181,.srBad181').forEach(function(el){el.classList.remove('srNear181','srBad181');});var c=selectTarget(drag.pointerX,drag.pointerY);drag.target=c;if(!c)return;var rr=c.dataset.sanctRarity||'';if(!rr||rr===drag.rarity)c.classList.add('srNear181');else c.classList.add('srBad181');}
function tick(){raf=0;if(!drag||!drag.ghost)return;var tx=drag.pointerX,ty=drag.pointerY-32,mag=false;if(drag.target){var rr=drag.target.dataset.sanctRarity||'';if(!rr||rr===drag.rarity){var r=drag.target.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;tx=tx*.82+cx*.18;ty=ty*.82+(cy-18)*.18;mag=true;}}
drag.renderX+=(tx-drag.renderX)*(reduced()?1:.38);drag.renderY+=(ty-drag.renderY)*(reduced()?1:.38);drag.ghost.style.left=drag.renderX+'px';drag.ghost.style.top=drag.renderY+'px';drag.ghost.classList.toggle('srMagnet181',mag);if(mag)drag.ghost.style.setProperty('--srMag',colorFor(drag.rarity));if(Math.abs(tx-drag.renderX)>.3||Math.abs(ty-drag.renderY)>.3)raf=requestAnimationFrame(tick);}
function schedule(){if(!raf)raf=requestAnimationFrame(tick);}
function localFx(cell,rar){if(reduced()||!cell)return;var r=cell.getBoundingClientRect(),b=document.createElement('div');b.className='srSanctLocalFx181';b.style.left=(r.left+r.width/2)+'px';b.style.top=(r.top+r.height/2)+'px';b.style.setProperty('--srC',colorFor(rar));document.body.appendChild(b);setTimeout(function(){b.remove();},560);}
function animateBack(done){if(!drag||!drag.ghost||reduced()){done();return;}var r=drag.source.getBoundingClientRect(),gx=drag.renderX,gy=drag.renderY,tx=r.left+r.width/2,ty=r.top+r.height/2;drag.ghost.animate([{left:gx+'px',top:gy+'px',transform:'translate3d(0,0,0) scale(1.08)',opacity:.98},{left:tx+'px',top:ty+'px',transform:'translate3d(0,0,0) scale(.9)',opacity:.35}],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'}).onfinish=done;}
function finishCleanup(){if(raf){cancelAnimationFrame(raf);raf=0;}clearMarks();if(!drag)return;if(drag.source)drag.source.classList.remove('srSanctLift181');if(drag.ghost&&drag.ghost.parentNode)drag.ghost.remove();drag=null;}
function begin(e,piece){injectCss();drag={id:e.pointerId,from:Number(piece.dataset.sanctSlot),rarity:piece.dataset.sanctRarity,source:piece,startX:e.clientX,startY:e.clientY,pointerX:e.clientX,pointerY:e.clientY,renderX:e.clientX,renderY:e.clientY-32,dragging:false,target:null,ghost:null};}
function promote(){if(!drag||drag.dragging)return;drag.dragging=true;drag.source.classList.add('srSanctLift181');drag.ghost=drag.source.cloneNode(true);drag.ghost.classList.remove('sanctDragging','srSanctLift181');drag.ghost.classList.add('srSanctGhost181');drag.ghost.removeAttribute('data-sanct-slot');document.body.appendChild(drag.ghost);markBoard(drag.rarity);updateTarget();schedule();}

document.addEventListener('pointerdown',function(e){var p=e.target&&e.target.closest?e.target.closest('.sanctMergePiece[data-sanct-slot]'):null;if(!p)return;begin(e,p);e.stopImmediatePropagation();},true);
document.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;e.stopImmediatePropagation();drag.pointerX=e.clientX;drag.pointerY=e.clientY;if(!drag.dragging&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>=5)promote();if(drag.dragging){e.preventDefault();updateTarget();schedule();}}, {capture:true,passive:false});
document.addEventListener('pointerup',function(e){if(!drag||e.pointerId!==drag.id)return;e.stopImmediatePropagation();if(!drag.dragging){finishCleanup();return;}e.preventDefault();var target=drag.target,to=target?Number(target.dataset.sanctSlot):-1,st=sanctMergeState(),src=st.mergeBoard[drag.from],dst=to>=0?st.mergeBoard[to]:null,isMerge=!!(src&&dst===src),next=isMerge&&typeof sanctMergeNext==='function'?sanctMergeNext(src):null;if(to>=0){var ok=sanctMergeDrop(drag.from,to);if(ok){if(isMerge&&next)localFx(target,next);finishCleanup();return;}}animateBack(finishCleanup);}, {capture:true,passive:false});
document.addEventListener('pointercancel',function(e){if(!drag||e.pointerId!==drag.id)return;e.stopImmediatePropagation();animateBack(finishCleanup);},true);
})();
