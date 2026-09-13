/* SHADOWREACH · Premium UI polish V209
   Clean arcade-RPG interaction language: deep navy, burnished gold, crisp silhouettes.
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
  --primary-action-glow:rgba(215,174,88,.18);
  --premium-gold:#D7AE58;
  --premium-gold-lit:#F0D58E;
  --premium-gold-dim:#81652D;
  --arcade-surface:#111B2B;
  --arcade-surface-raised:#172338;
  --arcade-border:#2B3A52;
  --arcade-border-lit:#53647E;
  --arcade-text:#E8EEF7;
  --arcade-muted:#8E9CB0;
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

/* Cleaner surfaces: keep the RPG frame language, remove ornamental noise. */
.card{
  border-radius:11px!important;
  border-color:var(--arcade-border)!important;
  background:linear-gradient(180deg,#172338 0%,#111B2B 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 4px 12px rgba(0,0,0,.30)!important;
}
.frame::before,.frame::after{display:none!important}
.card.lit{
  border-color:rgba(215,174,88,.48)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 0 0 1px rgba(215,174,88,.07),0 5px 14px rgba(0,0,0,.32)!important;
}
.sect{
  gap:7px!important;
  letter-spacing:1.25px!important;
  text-shadow:none!important;
  color:#DCC47E!important;
}
.sect::before{
  width:3px!important;height:12px!important;border-radius:2px!important;
  transform:none!important;background:var(--premium-gold)!important;
  box-shadow:none!important;
}
.sect::after{background:linear-gradient(90deg,rgba(215,174,88,.34),transparent)!important}
.orn{gap:6px!important;margin:9px 0!important}
.orn i{background:linear-gradient(90deg,transparent,rgba(215,174,88,.30),transparent)!important}
.orn b{width:4px!important;height:4px!important;box-shadow:none!important}
.divider{background:linear-gradient(90deg,transparent,var(--arcade-border) 16%,var(--arcade-border) 84%,transparent)!important}

/* Tactile arcade buttons: short travel, crisp edge, restrained sheen. */
.btn{
  --bA:#D7B35C;--bB:#A87A27;--bS:#6D4B12;--bE:#F0D991;--bT:#211705;--bSh:0 1px 0 rgba(255,246,206,.28);
  border:1px solid #080D17!important;
  border-radius:10px!important;
  letter-spacing:.35px!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -1px 0 var(--bS),0 2px 0 #080D17,0 5px 12px rgba(0,0,0,.34)!important;
  transition:transform .11s cubic-bezier(.2,.75,.2,1),filter .11s ease,box-shadow .11s ease,border-color .11s ease!important;
}
.btn::after{
  left:4px!important;right:4px!important;top:1px!important;height:20%!important;
  border-radius:8px 8px 5px 5px!important;
  background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,0))!important;
  opacity:.55!important;
}
/* Semantic action hierarchy: one primary language, one normal language, red only for danger. */
.btn.green,.btn.blue,.btn.purple,.btn.teal,.btn.orange,
.btn.ghost{
  --bA:#34445D;--bB:#222E42;--bS:#141D2B;--bE:#71819B;--bT:#E2E8F2;--bSh:0 1px 1px #0A101B;
}
.btn.dark{
  --bA:#293342;--bB:#1A2230;--bS:#0E141E;--bE:#52627A;--bT:#C6D0DF;--bSh:0 1px 1px #080C13;
}
.btn[data-primary-action="true"]:not(.red),
.btn[data-primary="true"]:not(.red){
  --bA:#D7B35C;--bB:#A87A27;--bS:#6D4B12;--bE:#F0D991;--bT:#211705;--bSh:0 1px 0 rgba(255,246,206,.28);
}
.btn.red{
  --bA:#C45D61;--bB:#833238;--bS:#511D22;--bE:#E9A1A4;--bT:#FFF7F7;--bSh:0 1px 1px #351015;
}
.btn:disabled{
  --bA:#4C5563;--bB:#353D49;--bS:#252B34;--bE:#687383;--bT:#9CA7B6;--bSh:0 1px 0 rgba(0,0,0,.45);
  opacity:.68!important;filter:saturate(.45)!important;
}
@media(hover:hover){
  .btn:hover:not(:disabled){
    transform:translateY(-1px)!important;
    filter:brightness(1.06)!important;
    box-shadow:inset 0 1px 0 var(--bE),inset 0 -1px 0 var(--bS),0 3px 0 #080D17,0 7px 14px rgba(0,0,0,.36)!important;
  }
}
.btn:active:not(:disabled){
  transform:translateY(1px) scale(.985)!important;
  filter:brightness(.96)!important;
  box-shadow:inset 0 1px 0 var(--bE),0 1px 0 #080D17,0 3px 7px rgba(0,0,0,.34)!important;
}
.btn.sm{
  border-radius:9px!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -1px 0 var(--bS),0 2px 0 #080D17,0 4px 9px rgba(0,0,0,.30)!important;
}
.btn.sm:active:not(:disabled){transform:translateY(1px) scale(.988)!important}

/* Compact icon controls use one shape and one feedback language. */
.hudBtn,.menuBtn,.iBtn,.recommendedClose{
  border:1px solid var(--arcade-border)!important;
  background:#172132!important;
  color:#C5CFDC!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.055),0 2px 5px rgba(0,0,0,.24)!important;
  transition:transform .11s cubic-bezier(.2,.75,.2,1),filter .11s ease,border-color .11s ease,background .11s ease,color .11s ease!important;
}
.hudBtn,.menuBtn{border-radius:8px!important}
.hudBtn.ready,.iBtn{border-color:rgba(215,174,88,.55)!important;color:var(--premium-gold-lit)!important}
.iBtn{background:#191B20!important;box-shadow:inset 0 1px 0 rgba(255,236,181,.06),0 2px 5px rgba(0,0,0,.24)!important}
.recommendedClose{color:#AAB5C4!important}
@media(hover:hover){
  .hudBtn:hover,.menuBtn:hover,.iBtn:hover,.recommendedClose:hover{
    transform:translateY(-1px);filter:brightness(1.08);border-color:rgba(215,174,88,.55)!important;color:var(--premium-gold-lit)!important;
  }
}
.hudBtn:active,.menuBtn:active,.iBtn:active,.recommendedClose:active{transform:translateY(1px) scale(.95)!important;filter:brightness(.93)!important}

/* HUD chips stay game-like but stop competing with primary actions. */
.pbox,.curr,.chip{
  border-color:var(--arcade-border)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 2px 6px rgba(0,0,0,.24)!important;
}
.curr{background:#141F30!important}
.curr>.plus{box-shadow:none!important;border-width:1px!important}

/* Segments and toggles read as controls, not extra CTA buttons. */
.seg{
  border:1px solid #0B111C!important;
  border-radius:9px!important;
  box-shadow:0 2px 0 #080D17!important;
  background:#0E1624!important;
}
.seg>span{
  background:#172132!important;color:#98A6B9!important;
  border-right:1px solid #0B111C!important;
  transition:background .11s,color .11s,filter .11s!important;
}
.seg>span.on{
  background:#9A782F!important;
  color:#FFF0C0!important;
  text-shadow:none!important;
}
.tgl{
  border-width:1px!important;
  background:#172132!important;
  box-shadow:0 2px 0 #080D17!important;
  transition:background .11s,filter .11s,transform .11s!important;
}
.tgl>i{border-width:1px!important;box-shadow:0 1px 2px rgba(0,0,0,.30)!important}
.tgl.on{background:#2F6F43!important;color:#F1FFF4!important;text-shadow:none!important}

/* Progress bars: high contrast, low ornament. */
.pbar>.trk,.bar{box-shadow:inset 0 1px 2px rgba(0,0,0,.65)!important}
.pbar>.trk>i::after,.bar>i::after{opacity:.45!important}

/* Bottom navigation: simpler silhouettes, quieter inactive state, crisp active hit. */
#tabs{
  background:#090F19!important;
  border-top:1px solid rgba(215,174,88,.18)!important;
  box-shadow:0 -5px 16px rgba(0,0,0,.24)!important;
}
#tabs::before{height:1px!important;background:linear-gradient(90deg,transparent,rgba(215,174,88,.36) 50%,transparent)!important;opacity:1!important}
#tabs>.tab{
  color:#718096!important;
  transition:color .13s ease,background .13s ease!important;
}
#tabs>.tab .fantasyNavIcon{
  width:31px!important;height:31px!important;margin-top:2px!important;
  opacity:.62!important;
  filter:saturate(.38) brightness(.78) contrast(1.04) drop-shadow(0 2px 2px rgba(0,0,0,.62))!important;
  transform:none!important;
  transition:opacity .13s ease,filter .13s ease,transform .13s ease!important;
}
#tabs>.tab.on,#tabs>.tab.active,#tabs>.tab[aria-current="page"]{
  color:var(--premium-gold-lit)!important;
  text-shadow:none!important;
  background:linear-gradient(180deg,rgba(215,174,88,.075),transparent 72%)!important;
}
#tabs>.tab.on .fantasyNavIcon,
#tabs>.tab.active .fantasyNavIcon,
#tabs>.tab[aria-current="page"] .fantasyNavIcon{
  opacity:1!important;
  filter:saturate(.72) brightness(1.08) contrast(1.03) drop-shadow(0 0 4px rgba(215,174,88,.28))!important;
  transform:translateY(-1px)!important;
}
#tabs>.tab.on::before,#tabs>.tab.active::before,#tabs>.tab[aria-current="page"]::before{
  height:2px!important;left:28%!important;right:28%!important;
  background:var(--premium-gold)!important;
  box-shadow:none!important;
}
#tabs>.tab.on::after,#tabs>.tab.active::after,#tabs>.tab[aria-current="page"]::after{display:none!important}
#tabs>.tab:active .fantasyNavIcon{transform:translateY(1px) scale(.94)!important;filter:brightness(.94)!important}

/* Navigation hubs behave like arcade menu tiles, not ornamental cards. */
.srNavHub{padding:8px!important;margin-bottom:7px!important}
.srNavHubTitle{font-size:10px!important;letter-spacing:1px!important;color:#DCC47E!important;margin-bottom:6px!important}
.srNavHubGrid{gap:5px!important}
.srNavHubItem{min-height:38px!important;border-radius:9px!important}
.srNavHubItem svg{opacity:.88}
.srNavHubSection{margin:8px 0 5px!important}

/* V243 final recommendation policy, now owned directly by Premium UI. */
[data-primary-action="true"]:not([data-primary="true"])::after{content:none!important;display:none!important}
[data-primary-action="true"]:not(.btn){box-shadow:none!important;filter:none!important}
.recommendedActionCard{
  border:1px solid var(--arcade-border)!important;
  border-left:3px solid rgba(215,174,88,.55)!important;
  background:#121D2D!important;
  box-shadow:0 4px 12px rgba(0,0,0,.28)!important;
}
.recommendedKicker{display:none!important}

@media(prefers-reduced-motion:reduce){
  .btn,.hudBtn,.menuBtn,.iBtn,.recommendedClose,.seg>span,.tgl,#tabs>.tab,#tabs>.tab .fantasyNavIcon{transition:none!important}
}
`;
  document.head.appendChild(style);
})();