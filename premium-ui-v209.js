/* SHADOWREACH · Premium UI polish V209 / V339
   Bright fantasy-RPG material pass: royal blue glass, warm gold trim, vivid controls.
   Presentation-only: no routes, economy, saves, timers, combat values or gameplay state are changed. */
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
  --primary-action-ring:#F4C85C;
  --primary-action-glow:rgba(65,169,255,.30);
  --premium-gold:#EAB64B;
  --premium-gold-lit:#FFE8A3;
  --premium-gold-dim:#9A6C23;
  --arcade-surface:#12335B;
  --arcade-surface-raised:#1A4678;
  --arcade-surface-soft:#21578E;
  --arcade-border:#4779A9;
  --arcade-border-lit:#77B8E8;
  --arcade-text:#F5FAFF;
  --arcade-muted:#B8CCE0;
  --sr-blue:#2597E8;
  --sr-blue-lit:#71C8FF;
  --sr-blue-deep:#0D5DA8;
  --sr-green:#38C86A;
  --sr-red:#D84B57;
}

button:focus-visible,
[data-act]:focus-visible,
[role="button"]:focus-visible,
input:focus-visible,
select:focus-visible,
a:focus-visible{
  outline:2px solid var(--premium-gold-lit)!important;
  outline-offset:2px!important;
}

/* Global shell: brighter than the previous near-black pass, while preserving arena art. */
body{
  background:radial-gradient(120% 90% at 50% 0%,#173A63 0%,#0A1B31 58%,#050B14 100%)!important;
}
#app{
  background:
    radial-gradient(130% 62% at 50% -4%,rgba(82,169,231,.28) 0%,transparent 62%),
    linear-gradient(180deg,#12335A 0%,#0B213C 48%,#071426 100%)!important;
  box-shadow:0 0 46px rgba(0,0,0,.58),0 0 0 1px rgba(114,179,226,.44),inset 0 1px 0 rgba(255,255,255,.08)!important;
}
#screen{scrollbar-color:#5E8DB9 transparent!important}
#screen::-webkit-scrollbar-thumb{background:linear-gradient(#7CBCE8,#3A6F9D)!important}

/* Panels: glossy royal-blue plates with readable gold framing. */
.card{
  border-radius:13px!important;
  border:1px solid #3E70A1!important;
  background:
    linear-gradient(180deg,rgba(45,103,157,.96) 0%,rgba(24,67,112,.98) 34%,rgba(14,43,78,.99) 100%)!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.16),
    inset 0 -1px 0 rgba(4,18,34,.7),
    0 4px 13px rgba(0,0,0,.30)!important;
}
.frame::before,.frame::after{display:block!important}
.frame::before{
  border-top-color:var(--premium-gold)!important;
  border-left-color:var(--premium-gold)!important;
  filter:drop-shadow(0 0 3px rgba(244,200,92,.24));
}
.frame::after{
  border-right-color:var(--premium-gold)!important;
  border-bottom-color:var(--premium-gold)!important;
  filter:drop-shadow(0 0 3px rgba(244,200,92,.24));
}
.card.lit{
  border-color:#77B8E8!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.20),0 0 0 1px rgba(234,182,75,.18),0 5px 15px rgba(0,0,0,.31)!important;
}
.sect{
  gap:7px!important;
  letter-spacing:1.35px!important;
  text-shadow:0 1px 2px rgba(0,0,0,.35)!important;
  color:#FFE4A0!important;
}
.sect::before{
  width:6px!important;height:6px!important;
  transform:rotate(45deg)!important;
  background:var(--premium-gold)!important;
  box-shadow:0 0 7px rgba(244,200,92,.34)!important;
}
.sect::after{background:linear-gradient(90deg,rgba(234,182,75,.52),transparent)!important}
.orn{gap:7px!important;margin:10px 0!important}
.orn i{background:linear-gradient(90deg,transparent,rgba(234,182,75,.48),transparent)!important}
.orn b{width:5px!important;height:5px!important;background:var(--premium-gold)!important;box-shadow:0 0 5px rgba(244,200,92,.28)!important}
.divider{background:linear-gradient(90deg,transparent,#4B7CA8 16%,#4B7CA8 84%,transparent)!important}
.gt{color:#FFE5A5!important;text-shadow:0 1px 2px rgba(0,0,0,.42)!important}
.dim{color:#C5D7E8!important}.mute{color:#9DB7CF!important}

/* Buttons: vivid blue for actions, warm gold for upgrades, danger remains red. */
.btn{
  --bA:#F2C65E;--bB:#C68B25;--bS:#795012;--bE:#FFF1B1;--bT:#241803;--bSh:0 1px 0 rgba(255,249,218,.34);
  border:1px solid #0A1D32!important;
  border-radius:11px!important;
  letter-spacing:.35px!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 2px 0 #07172A,0 5px 11px rgba(0,0,0,.28)!important;
  transition:transform .11s cubic-bezier(.2,.75,.2,1),filter .11s ease,box-shadow .11s ease!important;
}
.btn::after{
  left:4px!important;right:4px!important;top:1px!important;height:27%!important;
  border-radius:8px 8px 6px 6px!important;
  background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,0))!important;
  opacity:.75!important;
}
.btn.blue{
  --bA:#43B9FF;--bB:#1684D8;--bS:#07579E;--bE:#B9E8FF;--bT:#FFFFFF;--bSh:0 1px 1px #064478;
}
.btn.green{
  --bA:#6EE18B;--bB:#2BB75D;--bS:#157A39;--bE:#C9F7D4;--bT:#FFFFFF;--bSh:0 1px 1px #0A5225;
}
.btn.purple{
  --bA:#BA8CFF;--bB:#7F4DE0;--bS:#4C2A9B;--bE:#E7D4FF;--bT:#FFFFFF;--bSh:0 1px 1px #31176B;
}
.btn.teal{
  --bA:#5DE8D8;--bB:#1BB8AC;--bS:#0D756E;--bE:#C2FAF3;--bT:#FFFFFF;--bSh:0 1px 1px #07514C;
}
.btn.orange{
  --bA:#FFB169;--bB:#E46E1A;--bS:#944207;--bE:#FFE0BE;--bT:#FFFFFF;--bSh:0 1px 1px #652804;
}
.btn.ghost{
  --bA:#3B6B98;--bB:#275077;--bS:#153650;--bE:#7FAFD5;--bT:#EFF8FF;--bSh:0 1px 1px #102A40;
}
.btn.dark{
  --bA:#31577C;--bB:#203E5E;--bS:#122B43;--bE:#668FB1;--bT:#D7E8F6;--bSh:0 1px 1px #0C2034;
}
.btn.red{
  --bA:#F27780;--bB:#C83B48;--bS:#7E202A;--bE:#FFC1C6;--bT:#FFFFFF;--bSh:0 1px 1px #5B151D;
}
.btn:disabled{
  --bA:#7390AA;--bB:#536D85;--bS:#374D62;--bE:#9DB6CB;--bT:#D6E2EC;--bSh:0 1px 0 rgba(0,0,0,.28);
  opacity:.66!important;filter:saturate(.48)!important;
}
@media(hover:hover){
  .btn:hover:not(:disabled){
    transform:translateY(-1px)!important;
    filter:brightness(1.07) saturate(1.04)!important;
    box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 3px 0 #07172A,0 7px 14px rgba(0,0,0,.30)!important;
  }
}
.btn:active:not(:disabled){
  transform:translateY(1px) scale(.985)!important;
  filter:brightness(.97)!important;
  box-shadow:inset 0 1px 0 var(--bE),0 1px 0 #07172A,0 3px 7px rgba(0,0,0,.28)!important;
}
.btn.sm{border-radius:9px!important;box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 2px 0 #07172A,0 4px 8px rgba(0,0,0,.25)!important}
.btn.sm:active:not(:disabled){transform:translateY(1px) scale(.988)!important}

/* Compact icon controls: same glossy blue material as the reference direction. */
.hudBtn,.menuBtn,.iBtn,.recommendedClose{
  border:1px solid #4F83B2!important;
  background:linear-gradient(180deg,#285E8D,#173F67)!important;
  color:#E9F6FF!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.17),0 2px 5px rgba(0,0,0,.23)!important;
  transition:transform .11s cubic-bezier(.2,.75,.2,1),filter .11s ease,border-color .11s ease!important;
}
.hudBtn,.menuBtn,.iBtn,.recommendedClose{border-radius:9px!important}
.hudBtn.ready,.iBtn{border-color:rgba(234,182,75,.76)!important;color:#FFE6A0!important}
@media(hover:hover){
  .hudBtn:hover,.menuBtn:hover,.iBtn:hover,.recommendedClose:hover{
    transform:translateY(-1px);filter:brightness(1.09);border-color:#7FC5F0!important;color:#FFFFFF!important;
  }
}
.hudBtn:active,.menuBtn:active,.iBtn:active,.recommendedClose:active{transform:translateY(1px) scale(.95)!important;filter:brightness(.95)!important}

/* HUD chips: saturated, readable and no longer almost black. */
.pbox,.curr,.chip{
  border-color:#4779A9!important;
  background:linear-gradient(180deg,rgba(38,89,136,.96),rgba(18,55,92,.97))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 2px 6px rgba(0,0,0,.24)!important;
}
.pbox{border-color:#5A8BB8!important}
.curr>.plus{
  border-width:1px!important;
  border-color:#157C43!important;
  background:linear-gradient(180deg,#53D97D,#25A957)!important;
  color:#fff!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 4px rgba(0,0,0,.25)!important;
}

/* Segments and toggles retain function but gain cleaner fantasy-game readability. */
.seg{
  border:1px solid #0B2844!important;
  border-radius:10px!important;
  box-shadow:0 2px 0 #071A2D!important;
  background:#0D2B49!important;
}
.seg>span{
  background:linear-gradient(180deg,#2A5B87,#1B456C)!important;color:#C2D7E8!important;
  border-right:1px solid #123958!important;
  transition:background .11s,color .11s,filter .11s,transform .11s!important;
}
.seg>span.on{
  background:linear-gradient(180deg,#4EBFFF,#1E88DC)!important;
  color:#FFFFFF!important;
  text-shadow:0 1px 2px rgba(0,0,0,.35)!important;
}
.tgl{
  border-width:1px!important;
  border-color:#315F88!important;
  background:linear-gradient(180deg,#28567F,#183F63)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 2px 0 #071A2D!important;
  transition:background .11s,filter .11s,transform .11s!important;
}
.tgl>i{border-width:1px!important;box-shadow:0 1px 2px rgba(0,0,0,.30)!important}
.tgl.on{background:linear-gradient(180deg,#59D985,#25A957)!important;color:#F5FFF8!important;text-shadow:0 1px 1px rgba(0,0,0,.25)!important}
@media(hover:hover){
  .seg>span:hover:not(.on){background:#3472A8!important;color:#fff!important}
  .tgl:hover{filter:brightness(1.07)!important}
}
.seg>span:active,.tgl:active{transform:translateY(1px) scale(.98)!important;filter:brightness(.96)!important}

/* Progress bars: luminous fills against brighter navy tracks. */
.pbar>.trk,.bar{
  background:#071A2D!important;
  border-color:#3D6D99!important;
  box-shadow:inset 0 1px 3px rgba(0,0,0,.66),0 1px 0 rgba(255,255,255,.05)!important;
}
.pbar>.trk>i::after,.bar>i::after{opacity:.58!important}

/* Home-specific material alignment without touching canonical geometry. */
#app.srHomeFullArena>#hud{
  background:linear-gradient(180deg,rgba(10,38,69,.96) 0%,rgba(12,43,75,.86) 72%,rgba(10,34,60,.48) 90%,transparent 100%)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266{
  border-color:#A97929!important;
  background:
    radial-gradient(circle at 84% 18%,rgba(255,151,38,.13),transparent 28%),
    linear-gradient(180deg,#244F78 0%,#183B60 45%,#102D4C 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 0 0 1px rgba(234,182,75,.12),0 5px 14px rgba(0,0,0,.31)!important;
}
.srForgeHeadLeft266>b{color:#FFE3A0!important;text-shadow:0 1px 2px rgba(0,0,0,.42)!important}
.srForgeHammer266{
  border-color:#C7973A!important;
  background:linear-gradient(180deg,#2B6392,#17456E)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.13)!important;
}
.srForgeMineral266{color:#B9E7FF!important}
.srForgeUpgrade266{
  border-color:#4B7FAA!important;
  background:linear-gradient(180deg,#1D4B77,#12385D)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;
}
.srForgeUpText266>b,.srForgeUpLine266 b,.srForgeUpLine266{color:#FFE091!important}
.srForgeSpeedBtn266{
  border-color:#4C91B0!important;
  background:linear-gradient(180deg,#246A86,#174C65)!important;
  color:#C9F7FF!important;
}
.srForgeSpeedPop266{border-color:#4C91B0!important;background:rgba(8,35,57,.97)!important}
.srForgeSpeedClose266{border-color:#46769D!important;background:#173F63!important;color:#E8F6FF!important}
.srForgeSpeedChip266{background:#15475D!important;color:#CCFBFF!important}
.srForgeFilter266{
  border-color:#3F709A!important;
  background:linear-gradient(180deg,#1B456C,#123653)!important;
  border-radius:9px!important;
}
.srForgeAuto266{background:linear-gradient(180deg,#2A5B87,#183F63)!important}
.srForgeAuto266.on{background:linear-gradient(180deg,#4ED37A,#239D51)!important}

/* Modals and utility panes share the same lightened material family. */
#overlay>.card,
.modalCard{
  border-color:#4E7FAB!important;
  background:linear-gradient(180deg,#1D4B78 0%,#12365A 34%,#0B2846 100%)!important;
}
.mhead{border-bottom-color:rgba(122,176,218,.36)!important}

/* Bottom navigation: blue steel plate, gold separators, clear selected state. */
#tabs{
  background:linear-gradient(180deg,#153A60 0%,#0C2947 55%,#081D34 100%)!important;
  border-top:1px solid rgba(234,182,75,.54)!important;
  box-shadow:0 -5px 15px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.07)!important;
}
#tabs::before{height:1px!important;background:linear-gradient(90deg,transparent,rgba(255,219,132,.72) 50%,transparent)!important;opacity:1!important}
#tabs>.tab{
  color:#A9C2D7!important;
  transition:color .13s ease,background .13s ease,filter .13s ease!important;
}
#tabs>.tab .fantasyNavIcon{
  width:32px!important;height:32px!important;margin-top:2px!important;
  opacity:.78!important;
  filter:saturate(.70) brightness(.90) contrast(1.03) drop-shadow(0 2px 2px rgba(0,0,0,.52))!important;
  transform:none!important;
  transition:opacity .13s ease,filter .13s ease,transform .13s ease!important;
}
#tabs>.tab.on,#tabs>.tab.active,#tabs>.tab[aria-current="page"]{
  color:#FFE6A0!important;
  text-shadow:0 1px 2px rgba(0,0,0,.44)!important;
  background:radial-gradient(circle at 50% 18%,rgba(234,182,75,.22),transparent 60%)!important;
}
#tabs>.tab.on .fantasyNavIcon,
#tabs>.tab.active .fantasyNavIcon,
#tabs>.tab[aria-current="page"] .fantasyNavIcon{
  opacity:1!important;
  filter:saturate(.96) brightness(1.13) contrast(1.03) drop-shadow(0 0 6px rgba(255,209,91,.38))!important;
  transform:translateY(-1px)!important;
}
#tabs>.tab.on::before,#tabs>.tab.active::before,#tabs>.tab[aria-current="page"]::before{
  height:2px!important;left:24%!important;right:24%!important;
  background:linear-gradient(90deg,transparent,#FFD56E 25%,#FFD56E 75%,transparent)!important;
  box-shadow:0 0 7px rgba(255,201,73,.30)!important;
}
#tabs>.tab.on::after,#tabs>.tab.active::after,#tabs>.tab[aria-current="page"]::after{display:none!important}
#tabs>.tab:active .fantasyNavIcon{transform:translateY(1px) scale(.94)!important;filter:brightness(.95)!important}

/* Navigation hubs use lighter blue tiles without becoming visually noisy. */
.srNavHub{padding:8px!important;margin-bottom:7px!important}
.srNavHubTitle{font-size:10px!important;letter-spacing:1px!important;color:#FFE1A0!important;margin-bottom:6px!important}
.srNavHubGrid{gap:5px!important}
.srNavHubItem{
  min-height:38px!important;border-radius:9px!important;
  border-color:#4678A5!important;
  background:linear-gradient(180deg,#285C88,#193F65)!important;
}
.srNavHubItem svg{opacity:.96}
.srNavHubSection{margin:8px 0 5px!important}

/* Contextual recommendation stays discreet and dismissible. */
[data-primary-action="true"]:not([data-primary="true"])::after{content:none!important;display:none!important}
[data-primary-action="true"]:not(.btn){box-shadow:none!important;filter:none!important}
.recommendedActionCard{
  border:1px solid #4C7DA8!important;
  border-left:3px solid rgba(234,182,75,.76)!important;
  background:linear-gradient(180deg,#214E78,#153A5F)!important;
  box-shadow:0 4px 11px rgba(0,0,0,.24)!important;
}
.recommendedKicker{display:none!important}

@media(max-width:390px){
  .card{border-radius:12px!important}
  #tabs>.tab .fantasyNavIcon{width:30px!important;height:30px!important}
}
@media(prefers-reduced-motion:reduce){
  .btn,.hudBtn,.menuBtn,.iBtn,.recommendedClose,.seg>span,.tgl,#tabs>.tab,#tabs>.tab .fantasyNavIcon{transition:none!important}
}
`;
  document.head.appendChild(style);
})();
