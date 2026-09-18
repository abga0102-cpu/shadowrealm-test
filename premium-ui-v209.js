/* SHADOWREACH · Premium UI polish V209 / V368
   Safe reference-fidelity rebuild: brighter fantasy scene, ornate blue-and-gold HUD, Forge and navigation.
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
  --primary-action-ring:#D7AE58;
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
/* Semantic action hierarchy: one primary language, one normal language, red only for danger. */
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

/* V243 final recommendation policy: contextual recommendation stays discreet and dismissible. */
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

/* Reference-faithful Home composition.
   The live game keeps its own art and systems, while the visible hierarchy,
   proportions and blue/gold mobile framing follow the supplied screen directly. */
#app.srHomeFullArena{
  border-left:1px solid #183F67!important;
  border-right:1px solid #183F67!important;
  background:#0A2039!important;
}

/* Layered top HUD: portrait/player plate on the left, resources and quick actions on the right. */
#app.srHomeFullArena>#hud{
  gap:7px!important;
  padding:7px 8px 8px!important;
  background:
    radial-gradient(88% 130% at 15% -25%,rgba(85,185,244,.34),transparent 62%),
    linear-gradient(180deg,#246292 0%,#174A78 43%,#0B3158 77%,rgba(7,28,50,.90) 100%)!important;
  border-bottom:2px solid #D4A447!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.24),
    inset 0 -4px 10px rgba(0,16,34,.56),
    0 4px 12px rgba(0,0,0,.32)!important;
}
#app.srHomeFullArena>#hud::before{
  content:""!important;
  position:absolute!important;
  left:7px!important;right:7px!important;top:4px!important;height:1px!important;
  background:linear-gradient(90deg,transparent,#BDE9FF 18%,rgba(255,255,255,.22) 70%,transparent)!important;
  pointer-events:none!important;
}
#app.srHomeFullArena>#hud::after{
  content:""!important;
  display:block!important;
  position:absolute!important;
  left:0!important;right:0!important;bottom:-3px!important;height:5px!important;
  background:linear-gradient(90deg,transparent 0%,#8C6423 6%,#F1CB6B 22%,#9B6C25 50%,#F1CB6B 78%,#8C6423 94%,transparent 100%)!important;
  opacity:.94!important;
  pointer-events:none!important;
}
#app.srHomeFullArena>#hud>.pbox{
  height:58px!important;
  min-height:58px!important;
  align-self:flex-start!important;
  padding:5px 7px 5px 4px!important;
  border:1px solid #D3AA54!important;
  border-radius:12px 10px 10px 12px!important;
  background:
    linear-gradient(135deg,rgba(64,135,190,.98),rgba(25,75,120,.98) 48%,rgba(12,48,83,.99))!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.27),
    inset 0 -2px 0 rgba(3,22,41,.58),
    0 0 0 1px rgba(72,37,5,.42),
    0 4px 8px rgba(0,0,0,.28)!important;
}
#app.srHomeFullArena .avatar{
  width:48px!important;height:48px!important;
  background:radial-gradient(circle at 50% 30%,#7CC9F2,#235B8B 58%,#0A2C50 100%)!important;
  box-shadow:0 0 0 1px #5F3D10,0 0 0 3px #E3B955,0 2px 8px rgba(0,0,0,.52),inset 0 0 9px rgba(0,0,0,.38)!important;
}
#app.srHomeFullArena .avatar::after{inset:-12%!important;filter:brightness(1.15) saturate(1.05) drop-shadow(0 1px 2px rgba(0,0,0,.55))!important}
#app.srHomeFullArena .pname{
  color:#FFFFFF!important;
  font-size:13px!important;
  letter-spacing:.25px!important;
  text-shadow:0 1px 2px rgba(0,0,0,.72)!important;
}
#app.srHomeFullArena .power{
  color:#FFE39A!important;
  padding:2px 5px!important;
  border:1px solid rgba(230,184,83,.55)!important;
  border-radius:999px!important;
  background:rgba(5,31,56,.56)!important;
  text-shadow:0 1px 2px rgba(0,0,0,.74)!important;
}
#app.srHomeFullArena .pbar{margin-top:5px!important}
#app.srHomeFullArena .pbar>.cap{
  min-width:25px!important;
  border:1px solid #F6D67F!important;
  background:linear-gradient(180deg,#AD86FF,#7045D0)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.42),0 1px 3px rgba(0,0,0,.42)!important;
}
#app.srHomeFullArena .pbar>.trk{
  height:13px!important;
  border-color:#132F52!important;
  background:#071D36!important;
}
#app.srHomeFullArena .pbar>.trk>i{background:linear-gradient(180deg,#C6A8FF,#7A4ADD)!important}
#app.srHomeFullArena>#hud>.col{
  gap:5px!important;
  flex:0 0 auto!important;
  max-width:47%!important;
}
#app.srHomeFullArena>#hud>.col>.row{gap:4px!important;flex-wrap:nowrap!important}
#app.srHomeFullArena .curr{
  min-height:27px!important;
  padding:2px 2px 2px 5px!important;
  gap:4px!important;
  border:1px solid #D2A64E!important;
  background:linear-gradient(180deg,#245E91,#123F6C)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),inset 0 -2px 0 rgba(3,22,42,.52),0 2px 4px rgba(0,0,0,.32)!important;
}
#app.srHomeFullArena .curr>b{font-size:11px!important;color:#FFFFFF!important}
#app.srHomeFullArena .curr>.plus{
  width:20px!important;height:20px!important;
  border:1px solid #15552D!important;
  background:linear-gradient(180deg,#78EA91,#25A954)!important;
}
#app.srHomeFullArena .hudBtn,
#app.srHomeFullArena .menuBtn{
  width:29px!important;height:28px!important;min-width:29px!important;
  border:1px solid #D2A64E!important;
  border-radius:8px!important;
  background:linear-gradient(180deg,#357BB0,#174D7B)!important;
  color:#F2FAFF!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -2px 0 rgba(4,28,51,.48),0 2px 4px rgba(0,0,0,.30)!important;
}

/* The combat area reads as one bright fantasy scene framed between HUD and controls. */
#app.srHomeFullArena #screen.fixed>.campaignWorld{
  border-top:1px solid #6FA9CC!important;
  border-bottom:2px solid #D0A34D!important;
  background:#102D46!important;
  box-shadow:inset 0 0 0 1px rgba(223,185,91,.20)!important;
}
#app.srHomeFullArena #arena::before{
  content:""!important;
  position:absolute!important;inset:0!important;z-index:7!important;pointer-events:none!important;
  background:
    linear-gradient(90deg,rgba(5,30,47,.24),transparent 11%,transparent 89%,rgba(5,30,47,.24)),
    linear-gradient(180deg,rgba(66,152,199,.06),transparent 30%,rgba(4,26,39,.20))!important;
}
#app.srHomeFullArena #arena::after{
  box-shadow:
    inset 0 0 28px rgba(0,25,39,.32),
    inset 0 1px 0 rgba(255,255,255,.20),
    inset 0 -2px 0 rgba(226,183,79,.52)!important;
}
#app.srHomeFullArena #arenaShade{
  background:linear-gradient(180deg,rgba(9,42,61,.04),rgba(5,24,37,.10) 58%,rgba(3,18,29,.34))!important;
}
#app.srHomeFullArena #aDecor{filter:brightness(.82) saturate(.92)!important}

/* Stage plaque and node path mirror the centered reference header. */
#app.srHomeFullArena #arena .floorTag{
  top:calc(var(--srHudH) + 1px)!important;
  gap:4px!important;
}
#app.srHomeFullArena #arena .floorTxt{
  min-width:126px!important;
  padding:4px 16px 5px!important;
  border:1px solid #D9AF57!important;
  border-radius:7px 7px 12px 12px!important;
  background:linear-gradient(180deg,rgba(41,102,153,.96),rgba(16,57,96,.96))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 2px 5px rgba(0,0,0,.42)!important;
  color:#FFF4CF!important;
  font-size:15px!important;
  letter-spacing:1.15px!important;
  line-height:1!important;
  text-shadow:0 2px 2px rgba(0,0,0,.72)!important;
}
#app.srHomeFullArena #arena .fTrack{
  padding:3px 8px!important;
  border:1px solid rgba(218,175,87,.62)!important;
  border-radius:999px!important;
  background:rgba(7,36,62,.79)!important;
  box-shadow:inset 0 1px 2px rgba(0,0,0,.48),0 1px 3px rgba(0,0,0,.30)!important;
}
#app.srHomeFullArena #arena .fTrack i{height:3px!important;background:#163D61!important}
#app.srHomeFullArena #arena .fTrack i.on{background:linear-gradient(90deg,#F2C65E,#FFE59B)!important}
#app.srHomeFullArena #arena .sdot{
  border-color:#77ACCF!important;
  background:radial-gradient(circle at 45% 35%,#77B8E3,#245B88 60%,#123B63)!important;
}
#app.srHomeFullArena #arena .sdot.on{
  border-color:#FFE9A9!important;
  background:radial-gradient(circle at 42% 32%,#FFF5C5,#E4AE40 60%,#A96E18)!important;
}
#app.srHomeFullArena #arena .fPill{
  border-color:#D4A64B!important;
  background:linear-gradient(180deg,rgba(35,87,130,.95),rgba(11,47,80,.95))!important;
  color:#FFFFFF!important;
}
#app.srHomeFullArena .hpMini{
  height:6px!important;
  border:1px solid rgba(255,235,192,.78)!important;
  background:#3D1014!important;
  box-shadow:0 1px 3px rgba(0,0,0,.58)!important;
}
#app.srHomeFullArena .hpMini>i{background:linear-gradient(180deg,#80EF82,#2FB950)!important}

/* Floating arena actions use the same small blue/gold button plates as the reference. */
#app.srHomeFullArena .worldAction,
#app.srHomeFullArena .worldMenu>summary{
  border:1px solid #D3A64C!important;
  border-radius:10px!important;
  background:linear-gradient(180deg,rgba(48,113,164,.96),rgba(18,59,96,.97))!important;
  color:#FFF0C5!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),inset 0 -2px 0 rgba(2,20,38,.55),0 3px 7px rgba(0,0,0,.38)!important;
}
#app.srHomeFullArena .worldRebirth{
  border-color:#D8B15A!important;
  color:#FFF0C5!important;
  background:linear-gradient(180deg,rgba(93,87,173,.96),rgba(48,48,116,.97))!important;
}
#app.srHomeFullArena .worldMenuPanel{
  border-color:#D3A64C!important;
  background:linear-gradient(180deg,rgba(31,81,124,.99),rgba(9,39,69,.99))!important;
}

/* Integrated combat controls: equipment, three skills and the Familiar share one framed shelf. */
#app.srHomeFullArena #screen.fixed>#skillbar{
  position:relative!important;
  box-sizing:border-box!important;
  padding:7px 8px!important;
  gap:6px!important;
  background:
    linear-gradient(180deg,#2A689C 0%,#174D79 48%,#0D355C 100%)!important;
  border-top:1px solid #82C1E5!important;
  border-bottom:2px solid #D5A74E!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.20),inset 0 -3px 8px rgba(1,20,38,.46)!important;
}
#app.srHomeFullArena #screen.fixed>#skillbar::before{
  content:""!important;position:absolute!important;left:7px!important;right:7px!important;top:3px!important;height:1px!important;
  background:linear-gradient(90deg,transparent,rgba(255,235,177,.65),transparent)!important;
}
#app.srHomeFullArena #skillbar .slot{
  width:45px!important;height:45px!important;
  border:2px solid #D0A44B!important;
  border-radius:11px!important;
  background:linear-gradient(180deg,#285E8D,#102F52)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -4px 7px rgba(0,14,29,.52),0 2px 4px rgba(0,0,0,.36)!important;
}
#app.srHomeFullArena #skillbar .slot::before{
  content:""!important;position:absolute!important;inset:2px!important;border-radius:8px!important;
  border:1px solid rgba(125,196,234,.34)!important;pointer-events:none!important;
}
#app.srHomeFullArena #skillbar .slot .catBar{height:4px!important}
#app.srHomeFullArena #skillbar .petMini{
  height:45px!important;
  min-width:92px!important;
  padding:0 7px 0 4px!important;
  gap:5px!important;
  border:2px solid #D0A44B!important;
  border-radius:11px!important;
  background:linear-gradient(180deg,#2B6595,#12395F)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -3px 6px rgba(0,17,32,.48),0 2px 4px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena #skillbar .petMini img{width:39px!important;height:39px!important}
#app.srHomeFullArena #skillbar .petMini .mute{color:#C7DFF0!important}

/* Forge occupies the lower blue-and-gold console, with a clear upgrade row and action row. */
#app.srHomeFullArena #screen.fixed>.pad.mt4{
  background:linear-gradient(180deg,#0D3459,#092746)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266{
  border:2px solid #C89638!important;
  border-radius:13px!important;
  background:
    radial-gradient(circle at 86% 13%,rgba(255,185,65,.16),transparent 26%),
    linear-gradient(180deg,#316A97 0%,#20527F 22%,#123B64 58%,#0A2A4C 100%)!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.28),
    inset 0 -3px 0 rgba(4,23,41,.58),
    0 0 0 1px rgba(87,49,8,.48),
    0 4px 9px rgba(0,0,0,.35)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266::before{
  width:22px!important;height:22px!important;
  border-width:3px!important;
  border-color:#F0C763!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266::after{
  width:22px!important;height:22px!important;
  border-width:3px!important;
  border-color:#F0C763!important;
}
#app.srHomeFullArena .srForgeHead266{
  padding:0 3px 3px!important;
  border-bottom:1px solid rgba(238,194,93,.42)!important;
}
#app.srHomeFullArena .srForgeHeadLeft266>b{
  font-size:12px!important;
  color:#FFF0BD!important;
  letter-spacing:.65px!important;
}
#app.srHomeFullArena .srForgeHammer266{
  width:23px!important;height:23px!important;
  border:1px solid #F0C763!important;
  border-radius:7px!important;
  background:linear-gradient(180deg,#3882B8,#1B527E)!important;
}
#app.srHomeFullArena .srForgeMineral266{
  min-height:22px!important;
  padding:0 7px!important;
  border:1px solid #76B6D8!important;
  border-radius:999px!important;
  background:rgba(5,37,63,.55)!important;
  color:#D4F3FF!important;
}
#app.srHomeFullArena .srForgeUpgrade266{
  margin-top:5px!important;
  padding:4px 6px!important;
  border:1px solid #7EB2D1!important;
  border-radius:9px!important;
  background:linear-gradient(180deg,#215883,#123D67)!important;
}
#app.srHomeFullArena .srForgeUpText266>b,
#app.srHomeFullArena .srForgeUpLine266,
#app.srHomeFullArena .srForgeUpLine266 b{font-size:9px!important;color:#FFE6A0!important}
#app.srHomeFullArena .srForgeLootReserve266{
  margin-top:4px!important;
  border:1px solid rgba(105,167,202,.36)!important;
  border-radius:9px!important;
  background:linear-gradient(180deg,rgba(7,35,60,.48),rgba(5,27,48,.34))!important;
  box-shadow:inset 0 1px 5px rgba(0,0,0,.25)!important;
}
#app.srHomeFullArena .srForgeActions266{
  gap:6px!important;margin-top:5px!important;
}
#app.srHomeFullArena .srForgeActions266>.btn.blue{
  border-color:#063D6A!important;
  background:linear-gradient(180deg,#4CC2FF,#1684D8)!important;
}
#app.srHomeFullArena .srForgeActions266 .tgl{
  border:1px solid #6C99BC!important;
  border-radius:10px!important;
  background:linear-gradient(180deg,#285F8D,#153E66)!important;
}
#app.srHomeFullArena .srForgeActions266 .tgl.on{
  border-color:#7BE596!important;
  background:linear-gradient(180deg,#61DD81,#28A957)!important;
}
#app.srHomeFullArena .srForgeFilter266{
  margin-top:4px!important;
  border:1px solid #6899BD!important;
  background:linear-gradient(180deg,#1A4D78,#0F355A)!important;
}
#app.srHomeFullArena .srForgeSpeedBtn266,
#app.srHomeFullArena .srForgeSpeedClose266,
#app.srHomeFullArena .srForgeSpeedChip266{border-color:#D1A44C!important}

/* Five-part blue steel navigation with gold-selected plate and readable labels. */
#tabs{
  border-top:2px solid #D1A34B!important;
  background:
    linear-gradient(180deg,#285F8D 0%,#17456E 25%,#0B2C4D 72%,#071D35 100%)!important;
  box-shadow:0 -4px 10px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.18)!important;
}
#tabs::before{
  height:3px!important;
  background:linear-gradient(90deg,#754916,#F0C866 18%,#9D6E25 50%,#F0C866 82%,#754916)!important;
}
#tabs>.tab{
  gap:2px!important;
  color:#B8CDE0!important;
  border-right:1px solid rgba(101,157,196,.20)!important;
}
#tabs>.tab:last-child{border-right:0!important}
#tabs>.tab .fantasyNavIcon{
  width:35px!important;height:35px!important;margin-top:0!important;
  opacity:.82!important;
}
#tabs>.tab span{
  font-size:8.5px!important;
  line-height:1!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  max-width:100%!important;
}
#tabs>.tab.on,
#tabs>.tab.active,
#tabs>.tab[aria-current="page"]{
  color:#FFF0B8!important;
  background:
    linear-gradient(180deg,rgba(244,196,80,.18),rgba(205,139,30,.08) 52%,transparent),
    radial-gradient(circle at 50% 18%,rgba(255,228,142,.24),transparent 62%)!important;
}
#tabs>.tab.on::before,
#tabs>.tab.active::before,
#tabs>.tab[aria-current="page"]::before{
  height:3px!important;left:13%!important;right:13%!important;
  background:linear-gradient(90deg,transparent,#FFF0A8 20%,#E8B548 80%,transparent)!important;
}

/* The same visual language continues on secondary screens. */
#topbar{
  min-height:42px!important;
  background:linear-gradient(180deg,#28618F,#123E68)!important;
  border-bottom:1px solid #D2A54D!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18)!important;
}
#topbar::after{background:linear-gradient(90deg,transparent,#F0CA70 20%,#F0CA70 80%,transparent)!important}
.back{
  border-color:#D0A44C!important;
  background:linear-gradient(180deg,#3477AA,#194B76)!important;
  color:#FFFFFF!important;
}
#screen:not(.fixed)>.pad>.card,
#screen:not(.fixed) .srNavHub{
  border-color:#527FA7!important;
  background:linear-gradient(180deg,#245984,#123A62)!important;
}
.srNavHubItem{
  border-color:#6A9ABE!important;
  background:linear-gradient(180deg,#2E6998,#17466F)!important;
}

/* Keep the exact composition usable on narrow or short phones. */
@media(max-width:390px){
  #app.srHomeFullArena>#hud{padding-left:6px!important;padding-right:6px!important;gap:5px!important}
  #app.srHomeFullArena>#hud>.pbox{height:55px!important;min-height:55px!important}
  #app.srHomeFullArena .avatar{width:44px!important;height:44px!important}
  #app.srHomeFullArena .pname{font-size:12px!important}
  #app.srHomeFullArena .power{font-size:9.5px!important;padding-left:4px!important;padding-right:4px!important}
  #app.srHomeFullArena .curr{gap:2px!important;padding-left:3px!important}
  #app.srHomeFullArena .curr>b{font-size:10px!important}
  #app.srHomeFullArena .curr>.plus{width:18px!important;height:18px!important}
  #app.srHomeFullArena .hudBtn,#app.srHomeFullArena .menuBtn{width:27px!important;height:27px!important;min-width:27px!important}
  #app.srHomeFullArena #screen.fixed>#skillbar{padding-left:6px!important;padding-right:6px!important;gap:4px!important}
  #app.srHomeFullArena #skillbar .slot{width:41px!important;height:41px!important}
  #app.srHomeFullArena #skillbar .petMini{height:41px!important;min-width:82px!important;padding-right:5px!important}
  #app.srHomeFullArena #skillbar .petMini img{width:35px!important;height:35px!important}
  #tabs>.tab .fantasyNavIcon{width:32px!important;height:32px!important}
  #tabs>.tab span{font-size:8px!important}
}
@media(max-height:720px){
  #app.srHomeFullArena>#hud{padding-top:5px!important;padding-bottom:6px!important}
  #app.srHomeFullArena>#hud>.pbox{height:52px!important;min-height:52px!important}
  #app.srHomeFullArena .avatar{width:42px!important;height:42px!important}
  #app.srHomeFullArena #skillbar .slot{width:40px!important;height:40px!important}
  #app.srHomeFullArena #skillbar .petMini{height:40px!important}
}

@media(prefers-reduced-motion:reduce){
  .btn,.hudBtn,.menuBtn,.iBtn,.recommendedClose,.seg>span,.tgl,#tabs>.tab,#tabs>.tab .fantasyNavIcon{transition:none!important}
}

/* V368 SAFE REFERENCE REBUILD
   Reintroduces the approved reference direction on top of the stable V367/V343 presentation owner.
   Deliberately presentation-only: no canonical Home geometry variables, route logic, state, economy,
   combat, save, timer or progression ownership is changed here. */
#app.srHomeFullArena{
  background:
    radial-gradient(120% 72% at 50% 2%,rgba(83,175,232,.16),transparent 62%),
    #081D34!important;
  border-left-color:#1D4E79!important;
  border-right-color:#1D4E79!important;
}

/* Floating fantasy HUD without replacing the stable Home layout geometry. */
#app.srHomeFullArena>#hud{
  background:
    radial-gradient(92% 125% at 13% -28%,rgba(89,191,244,.31),transparent 63%),
    linear-gradient(180deg,rgba(37,96,143,.98) 0%,rgba(20,68,108,.96) 48%,rgba(8,39,69,.91) 82%,rgba(7,28,50,.56) 100%)!important;
  border-bottom:2px solid #D7AA4C!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.24),
    inset 0 -4px 10px rgba(0,15,31,.46),
    0 4px 11px rgba(0,0,0,.27)!important;
}
#app.srHomeFullArena>#hud::before{
  content:""!important;
  position:absolute!important;
  left:8px!important;right:8px!important;top:3px!important;height:1px!important;
  background:linear-gradient(90deg,transparent,#C8EEFF 18%,rgba(255,255,255,.30) 68%,transparent)!important;
  opacity:.92!important;
  pointer-events:none!important;
}
#app.srHomeFullArena>#hud>.pbox{
  border-color:#D8AC50!important;
  background:linear-gradient(135deg,rgba(64,138,193,.98),rgba(24,75,119,.98) 51%,rgba(10,45,79,.99))!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.28),
    inset 0 -2px 0 rgba(2,20,39,.55),
    0 0 0 1px rgba(83,48,8,.32),
    0 4px 8px rgba(0,0,0,.28)!important;
}
#app.srHomeFullArena .avatar{
  background:radial-gradient(circle at 50% 28%,#84D2F8,#245F92 58%,#0A2C50 100%)!important;
  box-shadow:0 0 0 1px #62400F,0 0 0 3px #E7BA54,0 2px 9px rgba(0,0,0,.48),0 0 12px rgba(255,205,91,.18)!important;
}
#app.srHomeFullArena .avatar::after{
  filter:brightness(1.16) saturate(1.07) drop-shadow(0 2px 2px rgba(0,0,0,.50))!important;
}
#app.srHomeFullArena .pname{color:#FFFFFF!important;text-shadow:0 2px 2px rgba(0,0,0,.62)!important}
#app.srHomeFullArena .power{
  color:#FFE39A!important;
  border-color:rgba(232,187,82,.62)!important;
  background:rgba(3,30,55,.62)!important;
}
#app.srHomeFullArena .curr{
  border-color:#D7AA4E!important;
  background:linear-gradient(180deg,rgba(39,105,156,.98),rgba(13,57,95,.98))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),inset 0 -2px 0 rgba(1,19,36,.50),0 3px 6px rgba(0,0,0,.25)!important;
}
#app.srHomeFullArena .curr>.plus{
  border-color:#145C31!important;
  background:linear-gradient(180deg,#78EB92,#27B65A)!important;
}

/* Arena: brighter artwork and a centered gold/blue stage identity. */
#app.srHomeFullArena #screen.fixed>.campaignWorld{
  border-top-color:#78B4D8!important;
  border-bottom:2px solid #D6A94C!important;
  background:#103752!important;
  box-shadow:inset 0 0 0 1px rgba(240,201,104,.14)!important;
}
#app.srHomeFullArena #arenaBg{
  background-position:center 48%!important;
  filter:brightness(1.12) saturate(1.10) contrast(1.03)!important;
}
#app.srHomeFullArena #arenaShade{
  background:linear-gradient(180deg,rgba(9,38,60,.02) 0%,rgba(5,25,39,.04) 48%,rgba(2,17,27,.18) 100%)!important;
}
#app.srHomeFullArena #arena::before{
  content:""!important;
  position:absolute!important;inset:0!important;z-index:7!important;pointer-events:none!important;
  background:
    radial-gradient(90% 46% at 50% 16%,rgba(193,239,255,.10),transparent 72%),
    linear-gradient(90deg,rgba(5,28,45,.12),transparent 9%,transparent 91%,rgba(5,28,45,.12)),
    linear-gradient(180deg,transparent 68%,rgba(3,23,36,.12))!important;
}
#app.srHomeFullArena #aDecor{filter:brightness(1.06) saturate(1.06) drop-shadow(0 3px 3px rgba(0,0,0,.15))!important}
#app.srHomeFullArena #aLayer .unit{filter:saturate(1.05) brightness(1.035) drop-shadow(0 4px 4px rgba(0,0,0,.28))!important}
#app.srHomeFullArena #arena .floorTxt{
  border-color:#E3B652!important;
  background:linear-gradient(180deg,rgba(48,119,171,.95),rgba(11,55,91,.96))!important;
  color:#FFF4CE!important;
  font-family:Georgia,var(--fd),serif!important;
  text-shadow:0 2px 2px rgba(0,0,0,.76)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -2px 0 rgba(0,21,39,.40),0 3px 7px rgba(0,0,0,.33),0 0 10px rgba(255,209,93,.10)!important;
}
#app.srHomeFullArena #arena .fTrack{background:rgba(6,35,61,.64)!important;border-color:rgba(224,181,84,.54)!important}
#app.srHomeFullArena #arena .fTrack i.on{background:linear-gradient(90deg,#F1C55C,#FFE49A)!important}
#app.srHomeFullArena #arena .sdot.cur,
#app.srHomeFullArena #arena .sdot.on{
  border-color:#FFE59B!important;
  background:radial-gradient(circle at 40% 30%,#FFF5C6,#E9AD39 62%,#A96C15)!important;
  box-shadow:0 0 8px rgba(255,203,79,.52)!important;
}
#app.srHomeFullArena #arena .fPill{
  border-color:#D7AB50!important;
  background:linear-gradient(180deg,rgba(31,82,124,.96),rgba(7,42,73,.97))!important;
  color:#FFFFFF!important;
}
#app.srHomeFullArena .worldAction,
#app.srHomeFullArena .worldMenu>summary{
  border-color:#D7AB50!important;
  background:linear-gradient(180deg,rgba(48,113,164,.97),rgba(17,58,95,.98))!important;
  color:#FFF0C4!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.23),inset 0 -2px 0 rgba(2,20,38,.53),0 3px 7px rgba(0,0,0,.34)!important;
}

/* One ornate combat shelf, retaining all stable sizing/interaction rules. */
#app.srHomeFullArena #screen.fixed>#skillbar{
  background:linear-gradient(180deg,#123D65 0%,#0A2D4F 100%)!important;
  border-top:2px solid #DDB04E!important;
  border-bottom:2px solid #DDB04E!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -3px 7px rgba(0,14,27,.50),0 -2px 8px rgba(0,0,0,.20)!important;
}
#app.srHomeFullArena #screen.fixed>#skillbar::before{
  content:""!important;
  position:absolute!important;left:6px!important;right:6px!important;top:-2px!important;height:3px!important;
  background:linear-gradient(90deg,transparent,#B68125 9%,#F0CB68 23%,#A87520 50%,#F0CB68 77%,#B68125 91%,transparent)!important;
  pointer-events:none!important;
}
#app.srHomeFullArena #skillbar .slot,
#app.srHomeFullArena #skillbar .petMini{
  border-color:#DDB04E!important;
  background:linear-gradient(180deg,#285F90,#0E3459)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.23),inset 0 -4px 7px rgba(0,13,26,.48),0 2px 5px rgba(0,0,0,.33)!important;
}
#app.srHomeFullArena #skillbar .slot::before{border-color:rgba(126,207,248,.34)!important}
#app.srHomeFullArena #skillbar .petMini img{
  filter:saturate(1.10) brightness(1.07) drop-shadow(0 0 5px rgba(78,218,255,.20))!important;
}

/* Forge: warm workshop depth and strong gold/blue actions, but no Forge layout sizing overrides. */
#app.srHomeFullArena #screen.fixed>.pad.mt4{
  background:linear-gradient(180deg,#0C3152,#082541)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266{
  border-color:#D1A13E!important;
  background:
    radial-gradient(62% 90% at 84% 45%,rgba(255,126,28,.16),transparent 65%),
    linear-gradient(180deg,#1D4D78 0%,#12385E 45%,#0A294A 100%)!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.21),
    inset 0 -3px 0 rgba(3,19,34,.55),
    0 0 0 1px rgba(89,51,11,.42),
    0 4px 10px rgba(0,0,0,.32)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266::before,
#app.srHomeFullArena .homeForge.srForgePanel266::after{border-color:#F0C663!important}
#app.srHomeFullArena .srForgeHead266{border-bottom-color:rgba(239,196,94,.38)!important}
#app.srHomeFullArena .srForgeHeadLeft266>b{
  color:#FFF0BB!important;
  font-family:Georgia,var(--fd),serif!important;
  text-shadow:0 2px 2px rgba(0,0,0,.60)!important;
}
#app.srHomeFullArena .srForgeHammer266{
  border-color:#EFC35B!important;
  background:linear-gradient(180deg,#3A82B4,#17496F)!important;
}
#app.srHomeFullArena .srForgeMineral266{
  border-color:#72B6DC!important;
  background:rgba(4,35,60,.66)!important;
  color:#D9F4FF!important;
}
#app.srHomeFullArena .srForgeUpgrade266{
  border-color:#6EA8CF!important;
  background:linear-gradient(180deg,rgba(31,85,126,.95),rgba(11,48,80,.96))!important;
}
#app.srHomeFullArena .srForgeUpgrade266>.btn{
  --bA:#FFC353;--bB:#D98615;--bS:#8C4B05;--bE:#FFF0AD;--bT:#fff;--bSh:0 1px 1px #6A3400;
  border-color:#704006!important;
}
#app.srHomeFullArena .srForgeLootReserve266{
  border-color:rgba(103,170,209,.38)!important;
  background:
    linear-gradient(90deg,rgba(4,27,47,.84) 0%,rgba(5,29,49,.60) 53%,rgba(13,28,38,.18) 100%),
    radial-gradient(circle at 78% 82%,rgba(255,142,38,.52),transparent 25%),
    url("art/props/brazier.png") 82% 82% / 76px auto no-repeat,
    url("art/props/crystal.png") 97% 86% / 36px auto no-repeat,
    linear-gradient(180deg,#123D60,#081F37)!important;
  box-shadow:inset 0 1px 6px rgba(0,0,0,.27),inset 0 0 28px rgba(255,106,18,.055)!important;
}
#app.srHomeFullArena .srForgeActions266>.btn.blue{
  border-color:#075383!important;
  background:linear-gradient(180deg,#54CAFF,#148BE0)!important;
  box-shadow:inset 0 1px 0 #C9F1FF,inset 0 -3px 0 #075A9E,0 2px 0 #052B49,0 4px 8px rgba(0,0,0,.25)!important;
}
#app.srHomeFullArena .srForgeActions266 .tgl{
  border-color:#719DC0!important;
  background:linear-gradient(180deg,#315F88,#173D61)!important;
  color:#D8E7F4!important;
}
#app.srHomeFullArena .srForgeActions266 .tgl.on{
  border-color:#7BE797!important;
  background:linear-gradient(180deg,#5DDB80,#27AA58)!important;
}
#app.srHomeFullArena .srForgeFilter266{
  border-color:#5789B0!important;
  background:linear-gradient(180deg,#16466F,#0A2C4E)!important;
}

/* Navigation adopts the strict reference materials, without changing tab geometry. */
#tabs{
  border-top:2px solid #D8AB4A!important;
  background:linear-gradient(180deg,#183F66 0%,#0C2B4A 58%,#071D34 100%)!important;
  box-shadow:0 -4px 12px rgba(0,0,0,.30),inset 0 1px 0 rgba(255,255,255,.11)!important;
}
#tabs::before{
  height:3px!important;
  background:linear-gradient(90deg,#70470F,#F0C866 15%,#A97723 50%,#F0C866 85%,#70470F)!important;
  box-shadow:0 0 8px rgba(255,199,76,.14)!important;
}
#tabs>.tab{
  color:#B8CDE0!important;
  border-right-color:rgba(112,167,205,.18)!important;
}
#tabs>.tab .fantasyNavIcon{
  opacity:.84!important;
  filter:saturate(.76) brightness(.96) drop-shadow(0 2px 3px rgba(0,0,0,.48))!important;
}
#tabs>.tab.on,
#tabs>.tab.active,
#tabs>.tab[aria-current="page"]{
  color:#FFF0B1!important;
  background:radial-gradient(80% 90% at 50% 23%,rgba(255,210,93,.28),rgba(205,137,25,.09) 51%,transparent 74%)!important;
}
#tabs>.tab.on .fantasyNavIcon,
#tabs>.tab.active .fantasyNavIcon,
#tabs>.tab[aria-current="page"] .fantasyNavIcon{
  opacity:1!important;
  filter:saturate(1.02) brightness(1.16) drop-shadow(0 0 7px rgba(255,207,79,.43))!important;
}
#tabs>.tab.on::before,
#tabs>.tab.active::before,
#tabs>.tab[aria-current="page"]::before{
  background:linear-gradient(90deg,transparent,#FFF2AF 18%,#E6AD35 82%,transparent)!important;
  box-shadow:0 0 8px rgba(255,203,75,.36)!important;
}

/* Secondary screens inherit only materials, not structure. */
#topbar{
  background:linear-gradient(180deg,#286490,#113D65)!important;
  border-bottom-color:#D7A94E!important;
}
.back{
  border-color:#D4A74B!important;
  background:linear-gradient(180deg,#367CAF,#194B75)!important;
  color:#FFFFFF!important;
}
#screen:not(.fixed)>.pad>.card,
#screen:not(.fixed) .srNavHub{
  border-color:#527FA7!important;
  background:linear-gradient(180deg,#245984,#123A62)!important;
}
.srNavHubItem{
  border-color:#6A9ABE!important;
  background:linear-gradient(180deg,#2E6998,#17466F)!important;
}

`;
  document.head.appendChild(style);
})();
