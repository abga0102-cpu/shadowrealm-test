/* SHADOWREACH · Premium UI polish V209
   Deep-navy / burnished-gold interaction language with restrained jewel tones.
   Visual-only: no routes, economy, saves, timers, or gameplay state are changed. */
(function(){
  'use strict';
  if(window.__srPremiumUiV209)return;
  window.__srPremiumUiV209=true;

  var old=document.getElementById('srPremiumUiV209');
  if(old)old.remove();

  var style=document.createElement('style');
  style.id='srPremiumUiV209';
  style.textContent=`
:root{
  --primary-action-ring:#D7AE58;
  --primary-action-glow:rgba(215,174,88,.24);
  --premium-gold:#D7AE58;
  --premium-gold-lit:#F0D58E;
  --premium-gold-dim:#81652D;
}

button:focus-visible,
[data-act]:focus-visible,
[role="button"]:focus-visible,
input:focus-visible,
select:focus-visible,
a:focus-visible{
  outline:2px solid var(--premium-gold)!important;
  outline-offset:2px!important;
}

[data-primary-action="true"]{
  border-color:var(--premium-gold)!important;
  filter:brightness(1.04) saturate(1.02)!important;
  box-shadow:0 0 0 1px rgba(215,174,88,.72),0 0 16px var(--primary-action-glow),0 9px 22px rgba(0,0,0,.38)!important;
}
[data-primary-action="true"]:not([data-primary="true"])::after{
  background:linear-gradient(180deg,#E5C66F,#AE8232)!important;
  color:#171006!important;
  border:1px solid #F3D995!important;
  box-shadow:0 3px 10px rgba(0,0,0,.42)!important;
}
.recommendedActionCard{
  border:1px solid rgba(215,174,88,.48)!important;
  border-left:4px solid var(--premium-gold)!important;
  background:linear-gradient(135deg,rgba(41,34,25,.94),rgba(13,20,34,.98) 58%,rgba(9,15,27,.99))!important;
  box-shadow:0 8px 24px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,236,181,.08),inset 0 0 24px rgba(215,174,88,.045)!important;
}
.recommendedKicker{color:var(--premium-gold-lit)!important}
.card.lit{
  border-color:rgba(215,174,88,.42)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.11),0 0 0 1px rgba(215,174,88,.10),0 6px 18px rgba(0,0,0,.38)!important;
}

.btn{
  --bA:#D7B35C;--bB:#A87A27;--bS:#6D4B12;--bE:#F0D991;--bT:#211705;--bSh:0 1px 0 rgba(255,246,206,.34);
  border-color:#080D17!important;
  border-radius:12px!important;
  letter-spacing:.45px!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 3px 0 #080D17,0 8px 18px rgba(0,0,0,.42)!important;
  transition:transform .16s cubic-bezier(.2,.75,.2,1),filter .16s ease,box-shadow .16s ease,border-color .16s ease!important;
}
.btn::after{
  top:1px!important;height:34%!important;
  background:linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,0))!important;
  opacity:.75;
}
.btn.green {--bA:#58AE69;--bB:#327743;--bS:#1D4A2A;--bE:#9AD8A5;--bT:#F6FFF7;--bSh:0 1px 1px #102B18}
.btn.red   {--bA:#C45D61;--bB:#833238;--bS:#511D22;--bE:#E9A1A4;--bT:#FFF7F7;--bSh:0 1px 1px #351015}
.btn.blue  {--bA:#5878A5;--bB:#344E77;--bS:#20314D;--bE:#91A8C8;--bT:#F5F8FC;--bSh:0 1px 1px #152236}
.btn.purple{--bA:#8466AE;--bB:#554074;--bS:#352648;--bE:#B9A4D2;--bT:#FBF8FF;--bSh:0 1px 1px #261A36}
.btn.teal  {--bA:#4D928B;--bB:#2F655F;--bS:#1D403D;--bE:#8CC4BE;--bT:#F5FFFE;--bSh:0 1px 1px #14302D}
.btn.orange{--bA:#B57A45;--bB:#7A4A27;--bS:#4D2D16;--bE:#D9AD82;--bT:#FFF9F2;--bSh:0 1px 1px #332013}
.btn.ghost {--bA:#3A465C;--bB:#252F42;--bS:#151D2A;--bE:#6D7C98;--bT:#DCE4F0;--bSh:0 1px 1px #0A101B}
.btn.dark  {--bA:#293342;--bB:#1A2230;--bS:#0E141E;--bE:#52627A;--bT:#C6D0DF;--bSh:0 1px 1px #080C13}
.btn:disabled{
  --bA:#5D6470;--bB:#444A55;--bS:#30343D;--bE:#777F8C;--bT:#AEB7C5;--bSh:0 1px 0 rgba(0,0,0,.5);
  opacity:.74!important;filter:saturate(.55)!important;
}
@media(hover:hover){
  .btn:hover:not(:disabled){
    transform:translateY(-1px)!important;
    filter:brightness(1.055) saturate(1.025)!important;
    box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 4px 0 #080D17,0 11px 22px rgba(0,0,0,.44)!important;
  }
}
.btn:active:not(:disabled){
  transform:translateY(1px) scale(.988)!important;
  filter:brightness(.97)!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -1px 0 var(--bS),0 1px 0 #080D17,0 4px 10px rgba(0,0,0,.40)!important;
}
.btn.sm{
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 2px 0 #080D17,0 6px 13px rgba(0,0,0,.38)!important;
}
.btn.sm:active:not(:disabled){transform:translateY(1px) scale(.99)!important}

.hudBtn,.menuBtn,.iBtn,.recommendedClose{
  transition:transform .15s cubic-bezier(.2,.75,.2,1),filter .15s ease,border-color .15s ease,background .15s ease,box-shadow .15s ease!important;
}
.hudBtn,.menuBtn{
  border-color:#111A29!important;
  background:linear-gradient(180deg,#303A4C,#1A2230)!important;
  color:#BFC9D8!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 2px 0 #080D17,0 5px 12px rgba(0,0,0,.26)!important;
}
.hudBtn.ready{border-color:rgba(215,174,88,.58)!important;color:var(--premium-gold-lit)!important}
.iBtn{
  border-color:rgba(215,174,88,.58)!important;
  background:linear-gradient(180deg,#2D2A24,#171A22)!important;
  color:var(--premium-gold-lit)!important;
  box-shadow:inset 0 1px 0 rgba(255,236,181,.10),0 3px 9px rgba(0,0,0,.28)!important;
}
.recommendedClose{
  border-color:#4D5666!important;background:#111824!important;color:#AEB8C7!important;
}
@media(hover:hover){
  .hudBtn:hover,.menuBtn:hover,.iBtn:hover,.recommendedClose:hover{
    transform:translateY(-1px);filter:brightness(1.08);border-color:rgba(215,174,88,.62)!important;color:var(--premium-gold-lit)!important;
  }
}
.hudBtn:active,.menuBtn:active,.iBtn:active,.recommendedClose:active{transform:translateY(1px) scale(.96)!important;filter:brightness(.94)!important}

.seg>span{background:linear-gradient(180deg,#2B3444,#171E2B)!important;color:#A9B4C5!important;transition:background .16s,color .16s,filter .16s!important}
.seg>span.on{
  background:linear-gradient(180deg,#C3A054,#886628)!important;
  color:#191207!important;
  text-shadow:0 1px 0 rgba(255,239,188,.22)!important;
}
.tgl{background:linear-gradient(180deg,#303949,#1A2230)!important;transition:background .16s,filter .16s,transform .16s!important}
.tgl.on{background:linear-gradient(180deg,#4C9860,#2E6A3D)!important;color:#F3FFF5!important;text-shadow:0 1px 1px #17351F!important}

#tabs{
  background:linear-gradient(180deg,#101724 0%,#080D16 82%)!important;
  border-top:1px solid rgba(215,174,88,.18)!important;
  box-shadow:0 -8px 24px rgba(0,0,0,.22)!important;
}
#tabs::before{background:linear-gradient(90deg,transparent,rgba(215,174,88,.52) 50%,transparent)!important;opacity:.8}
#tabs>.tab{
  color:#75839A!important;
  transition:color .2s ease,filter .2s ease,background .2s ease!important;
}
#tabs>.tab .fantasyNavIcon{
  opacity:.68!important;
  filter:saturate(.72) brightness(.78) drop-shadow(0 2px 3px rgba(0,0,0,.7))!important;
  transform:none!important;
}
#tabs>.tab.on,#tabs>.tab.active,#tabs>.tab[aria-current="page"]{
  color:var(--premium-gold-lit)!important;
  text-shadow:0 0 9px rgba(215,174,88,.24)!important;
  background:radial-gradient(75% 62% at 50% 0%,rgba(215,174,88,.085),transparent 72%)!important;
}
#tabs>.tab.on .fantasyNavIcon,
#tabs>.tab.active .fantasyNavIcon,
#tabs>.tab[aria-current="page"] .fantasyNavIcon{
  opacity:1!important;
  filter:brightness(1.08) saturate(.98) drop-shadow(0 0 6px rgba(215,174,88,.44)) drop-shadow(0 2px 3px rgba(0,0,0,.72))!important;
  transform:none!important;
}
#tabs>.tab.on::before,#tabs>.tab.active::before,#tabs>.tab[aria-current="page"]::before{
  height:2px!important;
  left:24%!important;right:24%!important;
  background:linear-gradient(90deg,transparent,var(--premium-gold),transparent)!important;
  box-shadow:0 0 8px rgba(215,174,88,.46)!important;
}
#tabs>.tab.on::after,#tabs>.tab.active::after,#tabs>.tab[aria-current="page"]::after{
  background:radial-gradient(65% 70% at 50% 0%,rgba(215,174,88,.075),transparent 74%)!important;
}
#tabs>.tab:active .fantasyNavIcon{filter:brightness(.95) saturate(.9) drop-shadow(0 1px 2px rgba(0,0,0,.72))!important}

/* V243 final recommendation policy, now owned directly by Premium UI. */
[data-primary-action="true"]:not([data-primary="true"])::after{
  content:none!important;
  display:none!important;
}
.btn[data-primary-action="true"]{
  border-color:#080D17!important;
  filter:none!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 3px 0 #080D17,0 8px 18px rgba(0,0,0,.42)!important;
}
[data-primary-action="true"]:not(.btn){box-shadow:none!important;filter:none!important}
.recommendedActionCard{
  border:1px solid var(--border)!important;
  border-left:1px solid var(--border)!important;
  background:linear-gradient(180deg,#1B2942 0%,#141F35 46%,#101A2C 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 -1px 0 rgba(0,0,0,.35),0 4px 14px rgba(0,0,0,.34)!important;
}
.recommendedKicker{display:none!important}

@media(prefers-reduced-motion:reduce){
  .btn,.hudBtn,.menuBtn,.iBtn,.recommendedClose,.seg>span,.tgl,#tabs>.tab,#tabs>.tab .fantasyNavIcon{transition:none!important}
}
`;
  document.head.appendChild(style);
})();