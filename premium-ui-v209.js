/* SHADOWREACH · Premium UI polish V209 / V386
   Reference-locked dark fantasy composition: V386 icon-first skill readability.
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


/* V369 STRICT REFERENCE COMPOSITION
   Final visual correction pass against the supplied reference screen.
   Presentation-only: canonical layout sizing lives in home-layout-authority-v219.js. */

/* HUD: cleaner, lighter and less massive, while preserving the same controls. */
#app.srHomeFullArena>#hud{
  gap:6px!important;
  padding:5px 7px 5px!important;
  background:
    radial-gradient(92% 110% at 13% -18%,rgba(98,205,255,.32),transparent 63%),
    linear-gradient(180deg,rgba(41,103,151,.98) 0%,rgba(20,70,112,.96) 50%,rgba(8,40,70,.88) 82%,rgba(7,28,50,.42) 100%)!important;
  border-bottom:2px solid #DDB24F!important;
}
#app.srHomeFullArena>#hud>.pbox{
  height:56px!important;min-height:56px!important;
  padding:4px 7px 4px 4px!important;
  border-radius:13px!important;
  border:1px solid #E0B75B!important;
  background:linear-gradient(135deg,#3F8BC2 0%,#205A8D 48%,#0E3A66 100%)!important;
}
#app.srHomeFullArena .avatar{
  width:47px!important;height:47px!important;
  box-shadow:0 0 0 1px #694510,0 0 0 3px #EDC45F,0 3px 8px rgba(0,0,0,.46),0 0 12px rgba(255,209,91,.22)!important;
}
#app.srHomeFullArena .pname{font-size:13px!important}
#app.srHomeFullArena .power{
  padding:2px 6px!important;
  border-color:#DDB24F!important;
  background:rgba(5,33,60,.62)!important;
}
#app.srHomeFullArena .curr{
  min-height:29px!important;height:29px!important;
  padding:2px 2px 2px 6px!important;
  border-radius:14px!important;
  border-color:#DDB24F!important;
  background:linear-gradient(180deg,#2B6FA4,#123F69)!important;
}
#app.srHomeFullArena .curr>.plus{
  width:22px!important;height:25px!important;
  margin:-1px -1px -1px 1px!important;
  border-radius:50%!important;
}
#app.srHomeFullArena .hudBtn,
#app.srHomeFullArena .menuBtn{
  width:29px!important;height:29px!important;min-width:29px!important;
  border-color:#DDB24F!important;
  background:linear-gradient(180deg,#3D82B5,#174C78)!important;
}

/* Keep popups in the same top-right notification lane as the reference. */
#app.srHomeFullArena>#toast{
  left:auto!important;right:8px!important;
  top:calc(var(--srHudH) + 10px)!important;bottom:auto!important;
  width:min(205px,57%)!important;max-width:205px!important;
  margin:0!important;
}
#app.srHomeFullArena>#toast.nban{
  padding:6px 8px!important;
  border-radius:10px!important;
  font-size:9px!important;
  box-shadow:0 3px 9px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena>#toast .nt{font-size:9px!important;line-height:1.2!important}
#app.srHomeFullArena>#toast .ns{font-size:8px!important}

/* Arena: more room for the scene, brighter fantasy presentation and centered stage hierarchy. */
#app.srHomeFullArena #screen.fixed>.campaignWorld{
  background:#123B58!important;
  border-bottom:2px solid #E1B655!important;
}
#app.srHomeFullArena #arenaBg{
  filter:brightness(1.18) saturate(1.12) contrast(1.02)!important;
  background-position:center 45%!important;
}
#app.srHomeFullArena #arenaShade{
  background:
    radial-gradient(95% 48% at 50% 18%,rgba(188,235,255,.10),transparent 72%),
    linear-gradient(180deg,rgba(4,31,49,0) 0%,rgba(3,22,35,.02) 52%,rgba(2,15,24,.15) 100%)!important;
}
#app.srHomeFullArena #aDecor{filter:brightness(1.12) saturate(1.08)!important}
#app.srHomeFullArena #aLayer .unit{
  scale:.82!important;
  filter:saturate(1.08) brightness(1.05) drop-shadow(0 4px 4px rgba(0,0,0,.26))!important;
}
#app.srHomeFullArena #arena .floorTag{
  top:calc(var(--srHudH) + 2px)!important;
  gap:4px!important;
}
#app.srHomeFullArena #arena .floorTxt{
  min-width:146px!important;
  padding:5px 18px 6px!important;
  border-radius:12px!important;
  border:1px solid #E7BE62!important;
  background:linear-gradient(180deg,#3E85B7 0%,#174D7A 100%)!important;
  font-size:16px!important;
  letter-spacing:1.35px!important;
}
#app.srHomeFullArena #arena .fTrack{
  padding:2px 6px!important;
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
  transform:scale(.88)!important;
}
#app.srHomeFullArena #arena .sdot{width:11px!important;height:11px!important}
#app.srHomeFullArena #arena #aSub{gap:7px!important}
#app.srHomeFullArena #arena .fPill{
  min-height:24px!important;
  padding:3px 10px!important;
  border-radius:999px!important;
}
#app.srHomeFullArena .campaignWorld .btn.red{
  min-width:144px!important;
  border-radius:18px!important;
  border-color:#FF8191!important;
  background:linear-gradient(180deg,#A6273A,#65111F)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.19),inset 0 -2px 0 #410B14,0 0 13px rgba(208,52,70,.20),0 4px 8px rgba(0,0,0,.30)!important;
}

/* Skills + Familiar: one slim framed shelf, close to the reference proportions. */
#app.srHomeFullArena #screen.fixed>#skillbar{
  padding:5px 7px!important;
  gap:5px!important;
  background:linear-gradient(180deg,#173F67 0%,#0A2A49 100%)!important;
  border-top:2px solid #E0B554!important;
  border-bottom:2px solid #E0B554!important;
}
#app.srHomeFullArena #skillbar .slot{
  width:44px!important;height:44px!important;
  border-radius:11px!important;
  border-color:#E0B554!important;
}
#app.srHomeFullArena #skillbar .petMini{
  height:44px!important;min-width:98px!important;
  border-radius:11px!important;
  border-color:#E0B554!important;
  padding-right:6px!important;
}
#app.srHomeFullArena #skillbar .petMini img{width:38px!important;height:38px!important}

/* Forge: remove the oversized empty middle and reproduce the compact reference console. */
#app.srHomeFullArena #screen.fixed>.pad.mt4{
  padding:4px 7px 4px!important;
  background:linear-gradient(180deg,#0D3152,#08233E)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266{
  padding:4px 6px!important;
  border:2px solid #D8A947!important;
  border-radius:13px!important;
  background:
    linear-gradient(90deg,rgba(8,38,65,.90) 0%,rgba(9,43,72,.78) 54%,rgba(34,42,45,.30) 100%),
    radial-gradient(circle at 85% 58%,rgba(255,139,34,.34),transparent 27%),
    url("art/props/brazier.png") 86% 58% / 72px auto no-repeat,
    url("art/props/crystal.png") 97% 65% / 34px auto no-repeat,
    linear-gradient(180deg,#1C4A75,#0B2948)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -3px 0 rgba(3,19,34,.54),0 0 0 1px rgba(91,53,12,.42),0 4px 10px rgba(0,0,0,.30)!important;
}
#app.srHomeFullArena .srForgeHead266{
  height:24px!important;flex-basis:24px!important;
  padding:0 2px 3px!important;
}
#app.srHomeFullArena .srForgeHeadLeft266>b{
  font-size:11.5px!important;
  letter-spacing:.65px!important;
}
#app.srHomeFullArena .srForgeHammer266{width:23px!important;height:23px!important}
#app.srHomeFullArena .srForgeUpgrade266{
  margin-top:3px!important;
  min-height:34px!important;flex:0 0 34px!important;
  padding:3px 5px 3px 7px!important;
  border-radius:9px!important;
}
#app.srHomeFullArena .srForgeUpgrade266>.btn{
  min-width:78px!important;
  height:28px!important;min-height:28px!important;
  padding:3px 8px!important;
  border-radius:8px!important;
}
#app.srHomeFullArena .srForgeUpText266>b,
#app.srHomeFullArena .srForgeUpLine266,
#app.srHomeFullArena .srForgeUpLine266 b{font-size:8.5px!important}

/* The result/anvil lane stays functional but no longer dominates the Forge. */
#app.srHomeFullArena .srForgeLootReserve266{
  min-height:38px!important;
  height:38px!important;
  max-height:38px!important;
  flex:0 0 38px!important;
  margin-top:3px!important;
  overflow:hidden!important;
  border-radius:8px!important;
  background:linear-gradient(90deg,rgba(4,27,47,.72),rgba(7,34,55,.38) 62%,transparent)!important;
}
#app.srHomeFullArena #srForgeLoot273{
  height:38px!important;max-height:38px!important;
}
#app.srHomeFullArena #srForgeLoot273 .srForgeStack273,
#app.srHomeFullArena #srForgeLoot273 .srForgeTransient273{right:78px!important}
#app.srHomeFullArena #srForgeLoot273 .srForgeStackCard273{
  width:32px!important;height:34px!important;border-radius:7px!important;
}
#app.srHomeFullArena #srForgeLoot273 .srForgeStackCard273 img{width:22px!important;height:22px!important}
#app.srHomeFullArena #srForgeLoot273 .srForgeTransientCard273{
  left:19px!important;top:1px!important;
  width:90px!important;height:35px!important;
  padding:3px 5px!important;gap:4px!important;border-radius:8px!important;
}
#app.srHomeFullArena #srForgeLoot273 .srForgeTransientIcon273{
  width:25px!important;height:25px!important;flex-basis:25px!important;
}
#app.srHomeFullArena #srForgeLoot273 .srForgeTransientIcon273 img{width:23px!important;height:23px!important}
#app.srHomeFullArena #srForgeLoot273 .srForgeTool273{
  right:2px!important;top:1px!important;
  width:72px!important;height:36px!important;
  border-radius:9px!important;
}
#app.srHomeFullArena #srForgeLoot273 .srForgeHammer273{
  left:27px!important;top:1px!important;
  transform:scale(.72) rotate(-13deg)!important;
  transform-origin:13px 34px!important;
}
#app.srHomeFullArena #srForgeLoot273 .srForgeAnvil273{
  left:14px!important;bottom:2px!important;
  width:44px!important;height:12px!important;
}
#app.srHomeFullArena #srForgeLoot273 .srForgeGlow273{
  left:18px!important;bottom:-14px!important;width:42px!important;
}

#app.srHomeFullArena .srForgeActions266{
  height:35px!important;flex:0 0 35px!important;
  gap:5px!important;margin-top:3px!important;
}
#app.srHomeFullArena .srForgeActions266>.btn{
  height:35px!important;min-height:35px!important;
  border-radius:9px!important;
}
#app.srHomeFullArena .srForgeActions266 .tgl{
  flex:0 0 82px!important;min-width:82px!important;
  height:35px!important;
  border-radius:10px!important;
}
#app.srHomeFullArena .srForgeFilter266{
  margin-top:3px!important;
  height:22px!important;min-height:22px!important;max-height:22px!important;
  flex:0 0 22px!important;
  padding:1px 5px!important;
  border-radius:7px!important;
}
#app.srHomeFullArena .srForgeFilter266 .pill{
  padding:1px 4px!important;
  font-size:6.5px!important;
}

/* Bottom navigation: slimmer, more ornate and with a stronger selected plate. */
#tabs{
  border-top:2px solid #DFB452!important;
  background:linear-gradient(180deg,#173D63 0%,#0A2846 58%,#06192E 100%)!important;
  box-shadow:0 -4px 11px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.11)!important;
}
#tabs::before{
  height:3px!important;
  background:linear-gradient(90deg,#6E4510,#F4CF6D 16%,#A97927 50%,#F4CF6D 84%,#6E4510)!important;
}
#tabs>.tab{
  border-right:1px solid rgba(216,173,73,.20)!important;
}
#tabs>.tab.on,
#tabs>.tab.active,
#tabs>.tab[aria-current="page"]{
  color:#FFF0B2!important;
  background:
    linear-gradient(180deg,rgba(238,186,70,.18),rgba(132,84,18,.05) 56%,transparent),
    radial-gradient(circle at 50% 12%,rgba(255,225,137,.24),transparent 62%)!important;
}
#tabs>.tab.on>.ico>.fantasyNavIcon,
#tabs>.tab.active>.ico>.fantasyNavIcon,
#tabs>.tab[aria-current="page"]>.ico>.fantasyNavIcon{
  filter:saturate(1.06) brightness(1.20) drop-shadow(0 0 7px rgba(255,210,87,.46))!important;
}

/* Narrow phones retain the same hierarchy rather than inflating the Forge. */
@media(max-width:390px){
  #app.srHomeFullArena>#hud>.pbox{height:53px!important;min-height:53px!important}
  #app.srHomeFullArena .avatar{width:44px!important;height:44px!important}
  #app.srHomeFullArena .curr{height:27px!important;min-height:27px!important}
  #app.srHomeFullArena #arena .floorTxt{min-width:138px!important;font-size:15px!important}
  #app.srHomeFullArena .srForgeLootReserve266{height:34px!important;min-height:34px!important;max-height:34px!important;flex-basis:34px!important}
  #app.srHomeFullArena #srForgeLoot273{height:34px!important;max-height:34px!important}
}


/* V377 REFERENCE LOCK
   Locked to the annotated reference: dark navy UI, gold trim, luminous ruins,
   premium skill buttons, ready-egg capsule and a dramatic visible Forge fire. */

/* Global navy/gold language: no light-cyan dominant surfaces. */
#app.srHomeFullArena{
  background:#06182B!important;
  border-left-color:#244C6E!important;
  border-right-color:#244C6E!important;
}
#app.srHomeFullArena>#hud{
  background:
    radial-gradient(88% 90% at 18% -18%,rgba(54,112,157,.18),transparent 64%),
    linear-gradient(180deg,#0D2A47 0%,#09213A 58%,#06182B 88%,rgba(6,24,43,.38) 100%)!important;
  border-bottom:2px solid #D6A948!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 4px 10px rgba(0,0,0,.28)!important;
}
#app.srHomeFullArena>#hud>.pbox{
  border:1.5px solid #D6AA4D!important;
  background:linear-gradient(145deg,#173B60 0%,#102E4D 48%,#081D33 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -3px 8px rgba(0,10,22,.58),0 3px 8px rgba(0,0,0,.30)!important;
}
#app.srHomeFullArena .avatar{
  background:radial-gradient(circle at 50% 30%,#315F87,#0C2947 66%,#061629)!important;
  box-shadow:0 0 0 1px #684611,0 0 0 3px #E8BA55,0 3px 8px rgba(0,0,0,.50),0 0 10px rgba(231,183,76,.22)!important;
}
#app.srHomeFullArena .power{
  color:#FFE3A0!important;
  border-color:#C99A3E!important;
  background:#071A2F!important;
}
#app.srHomeFullArena .curr{
  border-color:#D0A345!important;
  background:linear-gradient(180deg,#173C60,#0A2744)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.13),inset 0 -2px 0 #041426,0 3px 6px rgba(0,0,0,.28)!important;
}
#app.srHomeFullArena .curr>.plus{
  border-color:#13713A!important;
  background:linear-gradient(180deg,#55E77C,#19B851)!important;
  box-shadow:inset 0 1px 0 #C6FBD2,0 1px 4px rgba(0,0,0,.30)!important;
}
#app.srHomeFullArena .hudBtn,
#app.srHomeFullArena .menuBtn{
  color:#BFD4E8!important;
  border:1.5px solid #CCA042!important;
  background:linear-gradient(180deg,#173B5E,#0B2744)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -2px 0 #041528,0 2px 6px rgba(0,0,0,.30)!important;
}

/* Reference arena: luminous forgotten ruins, dark UI stays on top. */
#app.srHomeFullArena #screen.fixed>.campaignWorld{
  background:#0B2A40!important;
  border-top:0!important;
  border-bottom:2px solid #DDB14E!important;
}
#app.srHomeFullArena #arenaBg{
  background-image:url("art/env_ruins.jpg")!important;
  background-position:center 48%!important;
  background-size:cover!important;
  filter:brightness(1.08) saturate(1.08) contrast(1.03)!important;
}
#app.srHomeFullArena #arenaShade{
  background:
    radial-gradient(90% 46% at 50% 12%,rgba(197,237,255,.05),transparent 75%),
    linear-gradient(90deg,rgba(4,19,32,.13),transparent 12%,transparent 88%,rgba(4,19,32,.13)),
    linear-gradient(180deg,rgba(4,22,36,.02) 0%,rgba(2,18,31,.02) 58%,rgba(2,14,25,.16) 100%)!important;
}
#app.srHomeFullArena #aDecor{
  filter:brightness(1.03) saturate(1.04) drop-shadow(0 3px 3px rgba(0,0,0,.20))!important;
}
#app.srHomeFullArena #aLayer .unit{
  scale:.80!important;
  filter:saturate(1.05) brightness(1.03) drop-shadow(0 4px 4px rgba(0,0,0,.30))!important;
}

/* Stage hierarchy like the reference: title floats over the scenery, not inside a cyan plate. */
#app.srHomeFullArena #arena .floorTxt{
  min-width:0!important;
  padding:2px 7px!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  color:#FFF1BF!important;
  font-family:Georgia,var(--fd),serif!important;
  font-size:18px!important;
  letter-spacing:1.4px!important;
  text-shadow:0 2px 0 #07101A,0 0 4px #000,0 0 8px rgba(223,177,70,.30)!important;
  box-shadow:none!important;
}
#app.srHomeFullArena #arena .fTrack{
  border:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
#app.srHomeFullArena #arena .sdot{
  border-color:#0C2138!important;
  box-shadow:0 0 0 1px rgba(238,199,104,.42),0 1px 4px rgba(0,0,0,.40)!important;
}
#app.srHomeFullArena #arena .sdot.cur,
#app.srHomeFullArena #arena .sdot.on{
  border-color:#FFF1B3!important;
  box-shadow:0 0 8px rgba(200,92,255,.42),0 0 0 1px #8558C6!important;
}
#app.srHomeFullArena #arena .fPill{
  border:1px solid #284C6D!important;
  background:linear-gradient(180deg,rgba(13,43,70,.97),rgba(6,26,46,.98))!important;
  color:#F6F4F1!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 2px 5px rgba(0,0,0,.30)!important;
}
#app.srHomeFullArena .campaignWorld .btn.red{
  border:1.5px solid #FF7A8B!important;
  background:linear-gradient(180deg,#992238,#5B101E)!important;
  color:#FFD7D9!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -3px 0 #370814,0 0 12px rgba(217,54,75,.22),0 4px 8px rgba(0,0,0,.34)!important;
}

/* Egg-ready capsule: visible, elegant and anchored under the right HUD controls. */
#app.srHomeFullArena .srEggReadyV377{
  position:absolute!important;
  top:calc(var(--srHudH) + 46px)!important;
  right:10px!important;
  z-index:42!important;
  width:min(196px,51vw)!important;
  min-height:48px!important;
  padding:5px 34px 5px 10px!important;
  display:flex!important;
  align-items:center!important;
  gap:7px!important;
  appearance:none!important;
  border:1.5px solid #567EA3!important;
  border-radius:12px!important;
  background:linear-gradient(180deg,rgba(17,50,79,.98),rgba(7,29,51,.98))!important;
  color:#F3F7FB!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -2px 0 #03111F,0 3px 8px rgba(0,0,0,.38)!important;
  text-align:left!important;
  cursor:pointer!important;
}
#app.srHomeFullArena .srEggReadyCopyV377{
  min-width:0!important;flex:1!important;
  display:flex!important;flex-direction:column!important;gap:2px!important;
}
#app.srHomeFullArena .srEggReadyCopyV377 b{
  font-size:10px!important;line-height:1.05!important;color:#E8EEF6!important;
}
#app.srHomeFullArena .srEggReadyCopyV377 small{
  font-size:7.5px!important;line-height:1!important;font-weight:900!important;color:#B8C7D8!important;
}
#app.srHomeFullArena .srEggReadyNestV377{
  position:absolute!important;right:18px!important;bottom:2px!important;
  width:45px!important;height:45px!important;
  display:grid!important;place-items:center!important;
  background:radial-gradient(ellipse at 50% 82%,rgba(227,184,64,.70),rgba(117,75,17,.12) 48%,transparent 69%)!important;
}
#app.srHomeFullArena .srEggReadyNestV377 img{
  width:36px!important;height:36px!important;object-fit:contain!important;
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.45))!important;
}
#app.srHomeFullArena .srEggReadyChevronV377{
  position:absolute!important;right:5px!important;top:50%!important;transform:translateY(-50%)!important;
  color:#C5D7E7!important;font-size:20px!important;font-weight:900!important;
}

/* Secondary reward feed lives left so it never collides with the egg capsule. */
#app.srHomeFullArena #rewardFeed{
  left:8px!important;right:auto!important;
  top:calc(var(--srHudH) + 55px)!important;
  width:min(160px,42%)!important;
}

/* Skills: thick premium frames, dark wells, circular painted icons and stronger cooldown readability. */
#app.srHomeFullArena #screen.fixed>#skillbar{
  padding:5px 7px!important;
  gap:6px!important;
  background:linear-gradient(180deg,#0F3456 0%,#082440 60%,#061B31 100%)!important;
  border-top:2px solid #D8AB4B!important;
  border-bottom:2px solid #D8AB4B!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),inset 0 -3px 7px rgba(0,11,22,.52),0 -2px 8px rgba(0,0,0,.24)!important;
}
#app.srHomeFullArena #skillbar .slot{
  width:45px!important;height:45px!important;
  border:2px solid #D8AB4B!important;
  border-radius:11px!important;
  background:linear-gradient(180deg,#102C49,#061A2F)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -4px 8px rgba(0,10,22,.58),0 2px 6px rgba(0,0,0,.36)!important;
}
#app.srHomeFullArena #skillbar .slot .skfx{
  inset:3px!important;
  border-radius:50%!important;
  overflow:hidden!important;
  box-shadow:inset 0 0 0 2px rgba(255,255,255,.20),0 0 6px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena #skillbar .slot .skfx::after{
  border-radius:50%!important;
  background:radial-gradient(circle at 50% 20%,rgba(255,255,255,.38),transparent 54%)!important;
}
#app.srHomeFullArena #skillbar .slot .cdRing{inset:1px!important}
#app.srHomeFullArena #skillbar .slot .cdTxt{
  font-size:13px!important;color:#FFF4D3!important;
  -webkit-text-stroke:1px rgba(4,9,16,.55)!important;
}
#app.srHomeFullArena #skillbar .slot .catBar{
  left:4px!important;right:4px!important;bottom:1px!important;height:3px!important;border-radius:999px!important;
  box-shadow:0 0 5px currentColor!important;
}
#app.srHomeFullArena #skillbar .autoSk{
  width:45px!important;height:45px!important;
  border:2px solid #B98C31!important;
  border-radius:11px!important;
  background:linear-gradient(180deg,#163657,#08233E)!important;
  color:#D3C18D!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),inset 0 -3px 6px rgba(0,10,21,.48)!important;
}
#app.srHomeFullArena #skillbar .autoSk.on{
  color:#FFE08C!important;border-color:#E2B348!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 0 8px rgba(226,179,72,.20)!important;
}
#app.srHomeFullArena #skillbar .petMini{
  height:45px!important;
  min-width:104px!important;
  border:2px solid #D8AB4B!important;
  border-radius:11px!important;
  background:linear-gradient(180deg,#123252,#071E36)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.11),inset 0 -3px 7px rgba(0,10,22,.50),0 2px 6px rgba(0,0,0,.32)!important;
}
#app.srHomeFullArena #skillbar .petMini img{
  width:39px!important;height:39px!important;
  filter:saturate(1.12) brightness(1.06) drop-shadow(0 2px 4px rgba(0,0,0,.45))!important;
}

/* Forge: dark navy frame with a large visible fire/anvil atmosphere on the right. */
#app.srHomeFullArena #screen.fixed>.pad.mt4{
  background:linear-gradient(180deg,#08243F,#061A2F)!important;
  padding:4px 7px!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266{
  position:relative!important;
  border:2px solid #D5A640!important;
  border-radius:13px!important;
  background:
    linear-gradient(90deg,rgba(8,29,50,.98) 0%,rgba(8,31,54,.94) 52%,rgba(20,28,35,.50) 71%,rgba(32,22,16,.36) 100%),
    radial-gradient(circle at 84% 56%,rgba(255,119,22,.64),rgba(232,70,10,.19) 28%,transparent 54%),
    url("art/props/brazier.png") 84% 58% / 142px auto no-repeat,
    url("art/props/brazier.png") 101% 67% / 96px auto no-repeat,
    url("art/props/crystal.png") 97% 70% / 34px auto no-repeat,
    linear-gradient(180deg,#123856,#071D34)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.11),inset 0 -3px 0 rgba(2,15,28,.58),0 0 0 1px rgba(92,53,10,.42),0 4px 10px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266::before{
  content:""!important;
  position:absolute!important;inset:1px!important;pointer-events:none!important;border-radius:10px!important;
  background:radial-gradient(45% 70% at 83% 57%,rgba(255,177,53,.16),transparent 70%)!important;
  border:1px solid rgba(241,195,89,.24)!important;
}
#app.srHomeFullArena .srForgeHead266{
  border-bottom:1px solid rgba(209,164,69,.34)!important;
}
#app.srHomeFullArena .srForgeHeadLeft266>b{
  color:#FFF0B8!important;
  font-family:Georgia,var(--fd),serif!important;
  font-size:11.5px!important;
  letter-spacing:.75px!important;
  text-shadow:0 2px 2px #000!important;
}
#app.srHomeFullArena .srForgeHammer266{
  border-color:#D7AA4A!important;
  background:linear-gradient(180deg,#183A5A,#0A2540)!important;
}
#app.srHomeFullArena .srForgeMineral266{
  color:#E4EEF7!important;
  border-color:#4F7190!important;
  background:rgba(5,26,45,.76)!important;
}
#app.srHomeFullArena .srForgeUpgrade266{
  border:1px solid #436789!important;
  background:linear-gradient(180deg,rgba(17,50,78,.96),rgba(7,28,49,.97))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;
}
#app.srHomeFullArena .srForgeUpgrade266>.btn{
  --bA:#F9B73B;--bB:#D97A13;--bS:#8C4604;--bE:#FFF0A9;--bT:#fff;--bSh:0 1px 1px #6B3600;
  min-width:82px!important;
  border:1px solid #6F3D05!important;
  border-radius:8px!important;
  box-shadow:inset 0 1px 0 #FFE2A2,inset 0 -3px 0 #9A5107,0 2px 5px rgba(0,0,0,.32)!important;
}
#app.srHomeFullArena .srForgeLootReserve266{
  border:1px solid rgba(72,104,132,.46)!important;
  background:linear-gradient(90deg,rgba(4,22,39,.78),rgba(5,26,44,.30) 55%,transparent 100%)!important;
  box-shadow:inset 0 1px 8px rgba(0,0,0,.32)!important;
}
#app.srHomeFullArena .srForgeActions266>.btn.blue{
  border:1px solid #16669B!important;
  background:linear-gradient(180deg,#1D91D5,#0D5F9F)!important;
  color:#F3F8FC!important;
  box-shadow:inset 0 1px 0 #9FD8F6,inset 0 -3px 0 #074E86,0 2px 0 #032D4C,0 4px 7px rgba(0,0,0,.28)!important;
}
#app.srHomeFullArena .srForgeActions266 .tgl{
  border:1px solid #496D8E!important;
  background:linear-gradient(180deg,#183B5D,#0A2643)!important;
  color:#C1CEE0!important;
}
#app.srHomeFullArena .srForgeActions266 .tgl.on{
  border-color:#6FD28D!important;
  background:linear-gradient(180deg,#1B6E45,#11492F)!important;
  color:#A5F0BB!important;
}
#app.srHomeFullArena .srForgeFilter266{
  border-color:#395D7C!important;
  background:linear-gradient(180deg,rgba(12,40,65,.95),rgba(5,25,44,.96))!important;
}

/* Preserve V371 dust feedback as part of the Forge language. */
#app.srHomeFullArena #srAutoDustNoticeV371{
  color:#78E996!important;
  border-color:rgba(87,214,126,.55)!important;
  background:rgba(7,43,26,.91)!important;
}

/* Bottom navigation: deep navy, gold separators and a strong active glow. */
#tabs{
  border-top:2px solid #D8AB49!important;
  background:linear-gradient(180deg,#0E2F50 0%,#08233E 55%,#05182C 100%)!important;
  box-shadow:0 -4px 12px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08)!important;
}
#tabs::before{
  height:3px!important;
  background:linear-gradient(90deg,#71470F,#F0C968 17%,#8E6120 50%,#F0C968 83%,#71470F)!important;
  box-shadow:0 0 8px rgba(232,182,72,.18)!important;
}
#tabs>.tab{
  color:#AFC1D2!important;
  border-right:1px solid rgba(217,174,73,.25)!important;
}
#tabs>.tab.on,
#tabs>.tab.active,
#tabs>.tab[aria-current="page"]{
  color:#FFF0B3!important;
  background:
    linear-gradient(180deg,rgba(211,159,49,.16),rgba(108,70,16,.04) 58%,transparent),
    radial-gradient(circle at 50% 14%,rgba(255,216,105,.28),transparent 63%)!important;
}
#tabs>.tab.on::before,
#tabs>.tab.active::before,
#tabs>.tab[aria-current="page"]::before{
  background:linear-gradient(90deg,transparent,#FFF0A9 18%,#E3AC38 82%,transparent)!important;
  box-shadow:0 0 9px rgba(236,182,66,.40)!important;
}
#tabs>.tab.on>.ico>.fantasyNavIcon,
#tabs>.tab.active>.ico>.fantasyNavIcon,
#tabs>.tab[aria-current="page"]>.ico>.fantasyNavIcon{
  filter:saturate(1.06) brightness(1.17) drop-shadow(0 0 8px rgba(243,194,78,.48))!important;
}

/* Keep the same identity on smaller phones instead of inflating Forge again. */
@media(max-width:390px){
  #app.srHomeFullArena .srEggReadyV377{right:7px!important;width:min(184px,52vw)!important;top:calc(var(--srHudH) + 42px)!important}
  #app.srHomeFullArena #skillbar .slot,
  #app.srHomeFullArena #skillbar .autoSk{width:42px!important;height:42px!important}
  #app.srHomeFullArena #skillbar .petMini{height:42px!important;min-width:92px!important}
  #app.srHomeFullArena #skillbar .petMini img{width:36px!important;height:36px!important}
}


/* V378 TARGETED REFERENCE FINISH
   Final pass from the V377 phone capture: keep the approved navy/gold identity,
   but restore reference hierarchy, move secondary feedback out of combat,
   brighten the ruins and make the Forge fire/anvil read immediately. */

/* 1) Arena: same ruins asset, now closer to the bright reference instead of dusk-purple. */
#app.srHomeFullArena #arenaBg{
  filter:brightness(1.24) saturate(1.13) contrast(1.01) hue-rotate(-18deg)!important;
  background-position:center 43%!important;
}
#app.srHomeFullArena #arenaBg::after{
  content:""!important;
  position:absolute!important;inset:0!important;pointer-events:none!important;
  background:
    url("art/props/bush.png") left -22px bottom -22px / 150px auto no-repeat,
    url("art/props/bush.png") right -26px bottom -26px / 145px auto no-repeat,
    url("art/props/crystal.png") 7% 83% / 48px auto no-repeat,
    url("art/props/crystal.png") 94% 79% / 42px auto no-repeat,
    linear-gradient(180deg,rgba(112,199,235,.045) 0%,rgba(58,165,144,.025) 48%,rgba(44,145,86,.11) 100%)!important;
  opacity:.88!important;
}
#app.srHomeFullArena #arenaShade{
  background:
    radial-gradient(85% 52% at 50% 8%,rgba(165,225,255,.08),transparent 70%),
    linear-gradient(90deg,rgba(3,22,35,.08),transparent 11%,transparent 89%,rgba(3,22,35,.08)),
    linear-gradient(180deg,rgba(4,21,33,0) 0%,rgba(3,21,31,.015) 56%,rgba(3,19,27,.10) 100%)!important;
}
#app.srHomeFullArena #aDecor{
  filter:brightness(1.08) saturate(1.08) drop-shadow(0 3px 3px rgba(0,0,0,.18))!important;
  opacity:.90!important;
}

/* 2) Reference hierarchy: notification lane below HUD, then stage content. */
#app.srHomeFullArena .srEggReadyV377{
  top:calc(var(--srHudH) + 10px)!important;
  right:10px!important;
  width:min(190px,50vw)!important;
  min-height:44px!important;
  padding:5px 61px 5px 10px!important;
  border-radius:11px!important;
  background:linear-gradient(180deg,rgba(14,47,77,.98),rgba(6,27,48,.985))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -2px 0 #03111F,0 3px 7px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena .srEggReadyCopyV377 b{font-size:9.5px!important;white-space:nowrap!important}
#app.srHomeFullArena .srEggReadyCopyV377 small{font-size:7.2px!important;white-space:nowrap!important}
#app.srHomeFullArena .srEggReadyNestV377{
  right:17px!important;bottom:1px!important;width:43px!important;height:43px!important;
}
#app.srHomeFullArena .srEggReadyNestV377 img{width:35px!important;height:35px!important}
#app.srHomeFullArena #arena .floorTag{
  top:calc(var(--srHudH) + 66px)!important;
  gap:3px!important;
}
#app.srHomeFullArena #arena .floorTxt{
  font-size:17.5px!important;
  letter-spacing:1.25px!important;
}
#app.srHomeFullArena #rewardFeed{
  top:calc(var(--srHudH) + 9px)!important;
  left:8px!important;right:auto!important;
  width:min(145px,38%)!important;
  z-index:41!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop{
  padding:3px 6px!important;
  background:linear-gradient(180deg,rgba(12,40,65,.88),rgba(5,25,44,.88))!important;
  border-color:rgba(91,132,166,.55)!important;
  box-shadow:0 2px 5px rgba(0,0,0,.24)!important;
}
#app.srHomeFullArena #rewardFeed .rewardPop .rpT{font-size:8.5px!important}
#app.srHomeFullArena #rewardFeed .rewardPop .rpS{font-size:7.5px!important}

/* 3) Skills: preserve V377 proportions, strengthen the painted-circle / cooldown treatment. */
#app.srHomeFullArena #screen.fixed>#skillbar{
  background:linear-gradient(180deg,#0B2B49 0%,#071F39 62%,#05182D 100%)!important;
  border-top-color:#DAB04F!important;
  border-bottom-color:#DAB04F!important;
}
#app.srHomeFullArena #skillbar .slot{
  background:linear-gradient(180deg,#0F3152,#061B31)!important;
  border-color:#D7AA49!important;
}
#app.srHomeFullArena #skillbar .slot .skfx{
  inset:4px!important;
  border:1.5px solid rgba(241,219,154,.34)!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.13),0 0 7px rgba(0,0,0,.38)!important;
}
#app.srHomeFullArena #skillbar .slot .cdArc{
  stroke-width:4!important;
  filter:drop-shadow(0 0 1.5px currentColor)!important;
}
#app.srHomeFullArena #skillbar .slot .cdTxt{
  font-size:13.5px!important;
  font-weight:1000!important;
}
#app.srHomeFullArena #skillbar .autoSk{
  background:linear-gradient(180deg,#123653,#071F37)!important;
}
#app.srHomeFullArena #skillbar .petMini{
  background:linear-gradient(180deg,#103553,#071F37)!important;
  padding-right:6px!important;
}
#app.srHomeFullArena #skillbar .petMini>.flex1{min-width:0!important;overflow:hidden!important}
#app.srHomeFullArena #skillbar .petMini .mute{font-size:7px!important;line-height:1!important}
#app.srHomeFullArena #skillbar .petMini .bb{font-size:10.5px!important;line-height:1.05!important}
#app.srHomeFullArena #skillbar .petMini .tiny{font-size:7.5px!important;line-height:1.05!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}

/* 4) Forge: a real visual furnace window with large fire and an anvil silhouette. */
#app.srHomeFullArena .homeForge.srForgePanel266{
  overflow:hidden!important;
  background:
    linear-gradient(90deg,rgba(7,29,50,.99) 0%,rgba(7,30,52,.97) 52%,rgba(13,27,38,.72) 69%,rgba(31,22,16,.50) 100%),
    linear-gradient(180deg,#123858,#071D34)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266>*{
  position:relative!important;
  z-index:3!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266::before{
  content:""!important;
  position:absolute!important;
  right:-6px!important;
  top:54px!important;
  width:184px!important;
  height:82px!important;
  left:auto!important;bottom:auto!important;
  border:0!important;
  border-radius:18px 0 0 18px!important;
  pointer-events:none!important;
  z-index:0!important;
  background:
    radial-gradient(ellipse at 58% 84%,rgba(255,226,125,.94) 0 7%,rgba(255,155,37,.86) 13%,rgba(240,75,11,.58) 29%,transparent 57%),
    radial-gradient(ellipse at 77% 72%,rgba(255,196,73,.78),rgba(232,64,8,.35) 34%,transparent 61%),
    url("art/props/brazier.png") 70% 78% / 168px auto no-repeat,
    linear-gradient(180deg,rgba(69,30,15,.12),rgba(33,18,14,.45))!important;
  filter:saturate(1.16) brightness(1.13) drop-shadow(0 0 10px rgba(255,100,16,.32))!important;
  opacity:.98!important;
  animation:srForgeFirePulseV378 1.8s ease-in-out infinite alternate!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266::after{
  content:""!important;
  position:absolute!important;
  right:45px!important;
  top:91px!important;
  width:78px!important;
  height:24px!important;
  z-index:1!important;
  pointer-events:none!important;
  background:linear-gradient(180deg,#9AA5B3 0%,#5D6875 36%,#2D343D 100%)!important;
  clip-path:polygon(0 23%,57% 23%,67% 0,100% 0,100% 34%,73% 48%,69% 72%,91% 72%,91% 100%,25% 100%,25% 72%,10% 63%)!important;
  box-shadow:0 4px 0 #12161C,0 6px 9px rgba(0,0,0,.46)!important;
  filter:drop-shadow(0 0 3px rgba(255,170,67,.24))!important;
}
@keyframes srForgeFirePulseV378{
  from{filter:saturate(1.08) brightness(1.04) drop-shadow(0 0 7px rgba(255,92,12,.24))}
  to{filter:saturate(1.24) brightness(1.22) drop-shadow(0 0 14px rgba(255,115,20,.42))}
}
#app.srHomeFullArena .srForgeLootReserve266{
  position:relative!important;
  z-index:2!important;
  background:
    linear-gradient(90deg,rgba(4,24,42,.93) 0%,rgba(5,27,47,.88) 48%,rgba(5,26,45,.47) 62%,rgba(5,24,40,.05) 77%,transparent 100%)!important;
  border-color:rgba(73,110,141,.56)!important;
}
#app.srHomeFullArena #srForgeLoot273{z-index:4!important}
#app.srHomeFullArena .srForgeActions266,
#app.srHomeFullArena .srForgeFilter266{z-index:4!important}
#app.srHomeFullArena .srForgeActions266>.btn.blue{
  background:linear-gradient(180deg,#209BDF,#0C659F)!important;
  border-color:#0B5585!important;
}
#app.srHomeFullArena #srAutoDustNoticeV371{
  left:10px!important;
  right:104px!important;
  bottom:61px!important;
  z-index:12!important;
  min-height:18px!important;
  background:rgba(7,44,27,.94)!important;
  color:#7BF09A!important;
  border-color:rgba(103,228,139,.62)!important;
}

/* Smaller phones keep the same vertical order: egg card first, stage second. */
@media(max-width:390px){
  #app.srHomeFullArena .srEggReadyV377{
    top:calc(var(--srHudH) + 8px)!important;
    right:7px!important;
    width:min(178px,51vw)!important;
    min-height:42px!important;
    padding-right:57px!important;
  }
  #app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 62px)!important}
  #app.srHomeFullArena #rewardFeed{top:calc(var(--srHudH) + 8px)!important;width:min(134px,37%)!important}
  #app.srHomeFullArena .homeForge.srForgePanel266::before{width:168px!important;height:77px!important;top:54px!important}
  #app.srHomeFullArena .homeForge.srForgePanel266::after{right:39px!important;top:90px!important;width:72px!important}
}


/* V379 CLEAN HOME HIERARCHY
   One ready-egg capsule, quieter foreground scenery, brighter ruins and a
   roomier Familiar strip. Presentation only. */

/* The reference is luminous blue/green fantasy, not pink dusk. */
#app.srHomeFullArena #arenaBg{
  filter:brightness(1.31) saturate(1.04) contrast(.99) hue-rotate(18deg)!important;
  background-position:center 41%!important;
}
#app.srHomeFullArena #arenaBg::after{
  background:
    url("art/props/bush.png") left -18px bottom -15px / 100px auto no-repeat,
    url("art/props/bush.png") right -20px bottom -17px / 98px auto no-repeat,
    url("art/props/crystal.png") 7% 85% / 34px auto no-repeat,
    url("art/props/crystal.png") 94% 82% / 30px auto no-repeat,
    linear-gradient(180deg,rgba(142,218,246,.055) 0%,rgba(94,195,176,.03) 50%,rgba(50,151,92,.075) 100%)!important;
  opacity:.64!important;
}
#app.srHomeFullArena #arenaShade{
  background:
    radial-gradient(88% 56% at 50% 5%,rgba(188,235,255,.10),transparent 72%),
    linear-gradient(90deg,rgba(3,19,31,.06),transparent 12%,transparent 88%,rgba(3,19,31,.06)),
    linear-gradient(180deg,rgba(3,20,31,0) 0%,rgba(3,18,28,.008) 60%,rgba(3,17,25,.075) 100%)!important;
}
#app.srHomeFullArena #aDecor{
  filter:brightness(1.13) saturate(1.03) drop-shadow(0 2px 2px rgba(0,0,0,.15))!important;
  opacity:.82!important;
}

/* A single right-side egg card owns the ready state. */
#app.srHomeFullArena .srEggReadyV377{
  top:calc(var(--srHudH) + 8px)!important;
  right:8px!important;
  width:min(190px,52vw)!important;
  min-height:42px!important;
  padding:5px 58px 5px 9px!important;
}
#app.srHomeFullArena .srEggReadyCopyV377 b{
  font-size:9.2px!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#app.srHomeFullArena .srEggReadyCopyV377 small{
  font-size:6.9px!important;
  white-space:nowrap!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
}
#app.srHomeFullArena .srEggReadyNestV377{
  right:16px!important;
  width:41px!important;height:41px!important;
}
#app.srHomeFullArena .srEggReadyNestV377 img{
  width:34px!important;height:34px!important;
}
#app.srHomeFullArena #arena .floorTag{
  top:calc(var(--srHudH) + 59px)!important;
}

/* No egg-ready reward card should remain visible on Home even during a hot reload. */
#app.srHomeFullArena #rewardFeed .rewardPop[data-sr-egg-ready],
#app.srHomeFullArena #rewardFeed .rewardPop.eggReady{display:none!important}

/* Free horizontal room for Familiar without shrinking the visual quality of skills. */
#app.srHomeFullArena #screen.fixed>#skillbar{
  gap:4px!important;
  padding-left:6px!important;
  padding-right:6px!important;
}
#app.srHomeFullArena #skillbar .slot,
#app.srHomeFullArena #skillbar .autoSk{
  width:43px!important;
  height:43px!important;
}
#app.srHomeFullArena #skillbar .petMini{
  min-width:110px!important;
  height:43px!important;
  padding:0 5px 0 3px!important;
  gap:4px!important;
}
#app.srHomeFullArena #skillbar .petMini img{
  width:34px!important;
  height:34px!important;
}
#app.srHomeFullArena #skillbar .petMini .mute{
  font-size:6.8px!important;
}
#app.srHomeFullArena #skillbar .petMini .bb{
  font-size:10px!important;
}
#app.srHomeFullArena #skillbar .petMini .tiny{
  font-size:7.2px!important;
  max-width:100%!important;
}

/* Keep the V378 Forge spectacle exactly as approved; only preserve its green feedback clarity. */
#app.srHomeFullArena #srAutoDustNoticeV371{
  color:#80F09D!important;
  background:rgba(6,43,25,.95)!important;
}

@media(max-width:390px){
  #app.srHomeFullArena .srEggReadyV377{
    width:min(180px,52vw)!important;
    padding-right:55px!important;
  }
  #app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) + 57px)!important}
  #app.srHomeFullArena #skillbar .slot,
  #app.srHomeFullArena #skillbar .autoSk{width:41px!important;height:41px!important}
  #app.srHomeFullArena #skillbar .petMini{height:41px!important;min-width:104px!important}
  #app.srHomeFullArena #skillbar .petMini img{width:32px!important;height:32px!important}
}


/* V382 REFERENCE SKILL BUTTONS
   Actual redesign of the Home skill buttons from the annotated reference.
   Strong gold frames, circular painted skill wells, thicker coloured cooldown
   rings and a distinct AUTO tile. Presentation only. */

#app.srHomeFullArena #screen.fixed>#skillbar{
  gap:5px!important;
  padding:5px 7px!important;
  background:
    linear-gradient(180deg,#0E2F4D 0%,#08233C 55%,#05172A 100%)!important;
  border-top:2px solid #E0B650!important;
  border-bottom:2px solid #C89A38!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.10),
    inset 0 -3px 7px rgba(0,8,17,.58),
    0 -2px 7px rgba(0,0,0,.24)!important;
}

/* Real outer frame: visibly different from the flat V379 squares. */
#app.srHomeFullArena #skillbar .slot{
  position:relative!important;
  width:46px!important;
  height:46px!important;
  flex:0 0 46px!important;
  border:2px solid #D9AC4D!important;
  border-radius:12px!important;
  overflow:visible!important;
  background:
    linear-gradient(180deg,#183A5E 0%,#0B2743 55%,#06182B 100%)!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.16),
    inset 0 -3px 0 #03101E,
    0 2px 0 #5B3C0D,
    0 3px 7px rgba(0,0,0,.42)!important;
  transform:translateY(-1px)!important;
}
#app.srHomeFullArena #skillbar .slot::before{
  content:""!important;
  position:absolute!important;
  inset:2px!important;
  z-index:0!important;
  pointer-events:none!important;
  border-radius:9px!important;
  border:1px solid rgba(255,225,147,.28)!important;
  background:
    linear-gradient(135deg,rgba(255,239,190,.09),transparent 30%),
    linear-gradient(315deg,rgba(0,0,0,.22),transparent 35%)!important;
}
#app.srHomeFullArena #skillbar .slot::after{
  content:""!important;
  position:absolute!important;
  width:7px!important;height:7px!important;
  left:50%!important;top:-4px!important;
  transform:translateX(-50%) rotate(45deg)!important;
  z-index:5!important;
  pointer-events:none!important;
  background:#D8AB4A!important;
  border:1px solid #FFE7A8!important;
  box-shadow:0 0 5px rgba(233,188,81,.35)!important;
}

/* The actual skill art becomes a circular medallion like the reference. */
#app.srHomeFullArena #skillbar .slot[data-skill] .skfx{
  position:absolute!important;
  inset:4px!important;
  z-index:1!important;
  border-radius:50%!important;
  overflow:hidden!important;
  border:2px solid rgba(231,196,112,.62)!important;
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.16),
    inset 0 -5px 8px rgba(0,0,0,.35),
    0 0 5px rgba(0,0,0,.38)!important;
}
#app.srHomeFullArena #skillbar .slot[data-skill] .skfx::before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  border-radius:50%!important;
  z-index:0!important;
  background:
    radial-gradient(circle at 50% 23%,rgba(255,255,255,.30),transparent 34%),
    radial-gradient(circle at 50% 68%,rgba(0,0,0,.05),rgba(0,0,0,.28) 82%)!important;
}
#app.srHomeFullArena #skillbar .slot[data-skill] .skfx::after{
  content:""!important;
  position:absolute!important;
  inset:1px!important;
  border-radius:50%!important;
  z-index:2!important;
  pointer-events:none!important;
  background:
    linear-gradient(155deg,rgba(255,255,255,.18),transparent 38%),
    radial-gradient(circle at 50% 110%,rgba(0,0,0,.28),transparent 54%)!important;
}
#app.srHomeFullArena #skillbar .slot[data-skill] .skfx>svg{
  position:relative!important;
  z-index:1!important;
  width:26px!important;
  height:26px!important;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.58))!important;
}

/* Coloured cooldown ring is now a dominant visual element rather than a thin outline. */
#app.srHomeFullArena #skillbar .slot[data-skill] .cdRing{
  position:absolute!important;
  inset:1px!important;
  z-index:3!important;
  width:44px!important;
  height:44px!important;
  overflow:visible!important;
  pointer-events:none!important;
  filter:drop-shadow(0 0 2px rgba(255,255,255,.14))!important;
}
#app.srHomeFullArena #skillbar .slot[data-skill] .cdArc{
  stroke-width:4.5!important;
  stroke-linecap:round!important;
  filter:drop-shadow(0 0 2.4px currentColor)!important;
}
#app.srHomeFullArena #skillbar .slot[data-skill] .cdTxt{
  z-index:4!important;
  font-size:14px!important;
  font-weight:1000!important;
  letter-spacing:.1px!important;
  color:#FFF7E0!important;
  text-shadow:
    0 2px 2px #000,
    0 0 4px rgba(0,0,0,.9)!important;
  -webkit-text-stroke:.35px rgba(0,0,0,.5)!important;
}
#app.srHomeFullArena #skillbar .slot[data-skill].cooling .skfx{
  filter:saturate(.68) brightness(.62)!important;
}

/* Level badge becomes a small deliberate jewel rather than flat text. */
#app.srHomeFullArena #skillbar .slot .lv{
  right:-2px!important;
  bottom:-3px!important;
  z-index:6!important;
  min-width:15px!important;
  height:14px!important;
  padding:0 3px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  border-radius:7px!important;
  border:1px solid #D2A64A!important;
  background:linear-gradient(180deg,#272D3B,#0B101B)!important;
  color:#FFF0BC!important;
  font-size:8.5px!important;
  line-height:12px!important;
  box-shadow:0 1px 3px rgba(0,0,0,.52)!important;
}
#app.srHomeFullArena #skillbar .slot .catBar{
  left:8px!important;
  right:8px!important;
  bottom:2px!important;
  z-index:5!important;
  height:3px!important;
  border-radius:999px!important;
  box-shadow:0 0 6px currentColor!important;
}

/* Weapon slot uses its own inset plate, matching the left-most reference tile. */
#app.srHomeFullArena #skillbar>.slot:first-child{
  overflow:hidden!important;
  background:
    radial-gradient(circle at 50% 36%,rgba(63,138,198,.23),transparent 52%),
    linear-gradient(180deg,#123859,#071E35)!important;
}
#app.srHomeFullArena #skillbar>.slot:first-child::before{
  inset:3px!important;
  border-color:rgba(92,176,229,.40)!important;
  box-shadow:inset 0 0 10px rgba(37,138,203,.18)!important;
}
#app.srHomeFullArena #skillbar>.slot:first-child img{
  width:30px!important;
  height:30px!important;
  z-index:2!important;
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.58))!important;
}

/* AUTO gets the same premium depth as the reference instead of looking like a normal slot. */
#app.srHomeFullArena #skillbar .autoSk{
  position:relative!important;
  width:46px!important;
  height:46px!important;
  flex:0 0 46px!important;
  border:2px solid #D4A84A!important;
  border-radius:12px!important;
  gap:0!important;
  background:
    linear-gradient(180deg,#173653 0%,#0A243D 58%,#06182B 100%)!important;
  color:#D7C793!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.14),
    inset 0 -3px 0 #03111F,
    0 2px 0 #5A3A0D,
    0 3px 6px rgba(0,0,0,.38)!important;
  transform:translateY(-1px)!important;
}
#app.srHomeFullArena #skillbar .autoSk svg{
  width:17px!important;
  height:17px!important;
  color:#FFD256!important;
  filter:drop-shadow(0 0 4px rgba(255,199,55,.36))!important;
  margin-bottom:1px!important;
}
#app.srHomeFullArena #skillbar .autoSk>span{
  font-size:7.5px!important;
  line-height:9px!important;
  letter-spacing:.5px!important;
}
#app.srHomeFullArena #skillbar .autoSk>i{
  width:20px!important;
  height:3px!important;
  margin-top:2px!important;
  border-radius:999px!important;
  background:#5C6570!important;
}
#app.srHomeFullArena #skillbar .autoSk.on{
  color:#FFE59A!important;
  border-color:#E8BC55!important;
  background:
    radial-gradient(circle at 50% 22%,rgba(242,188,63,.13),transparent 48%),
    linear-gradient(180deg,#183B59,#0A263F 58%,#06182B)!important;
}
#app.srHomeFullArena #skillbar .autoSk.on>i{
  background:#F0BB3F!important;
  box-shadow:0 0 7px rgba(240,187,63,.58)!important;
}

/* Familiar remains readable; the skills get the visual change, not its width. */
#app.srHomeFullArena #skillbar .petMini{
  height:46px!important;
  min-width:106px!important;
  border:2px solid #D4A84A!important;
  background:linear-gradient(180deg,#12324F,#071D34)!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.12),
    inset 0 -3px 0 #03101E,
    0 2px 0 #5A3A0D,
    0 3px 6px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena #skillbar .petMini img{
  width:36px!important;
  height:36px!important;
}

@media(max-width:390px){
  #app.srHomeFullArena #screen.fixed>#skillbar{gap:4px!important;padding-left:5px!important;padding-right:5px!important}
  #app.srHomeFullArena #skillbar .slot,
  #app.srHomeFullArena #skillbar .autoSk{
    width:43px!important;height:43px!important;flex-basis:43px!important;
  }
  #app.srHomeFullArena #skillbar .slot[data-skill] .cdRing{
    width:41px!important;height:41px!important;
  }
  #app.srHomeFullArena #skillbar .petMini{
    height:43px!important;min-width:101px!important;
  }
  #app.srHomeFullArena #skillbar .petMini img{width:33px!important;height:33px!important}
}


/* V383 TRUE REFERENCE SKILLS
   Rebuilds the skill strip from the actual reference: weapon tile, three large
   circular coloured skill orbs, rectangular AUTO tile, then Familiar. */

/* Remove the V382 decorative diamonds/triangles completely. */
#app.srHomeFullArena #skillbar .slot::before,
#app.srHomeFullArena #skillbar .slot::after{
  display:none!important;
  content:none!important;
}

/* Reference strip itself: thin gold rails, dark interior, no boxed skill cards. */
#app.srHomeFullArena #screen.fixed>#skillbar{
  display:flex!important;
  align-items:center!important;
  gap:4px!important;
  padding:5px 7px!important;
  background:
    linear-gradient(180deg,#0B2946 0%,#071D34 58%,#041426 100%)!important;
  border-top:2px solid #D8AD4D!important;
  border-bottom:2px solid #C99A38!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    inset 0 -3px 7px rgba(0,8,16,.50),
    0 -2px 6px rgba(0,0,0,.22)!important;
}

/* Weapon remains a framed square, as in the left-most reference tile. */
#app.srHomeFullArena #skillbar .srWeaponSlotV383{
  width:43px!important;
  height:43px!important;
  flex:0 0 43px!important;
  border:2px solid #D7A947!important;
  border-radius:10px!important;
  overflow:hidden!important;
  background:
    radial-gradient(circle at 50% 33%,rgba(54,139,198,.20),transparent 58%),
    linear-gradient(180deg,#123A5E,#071D34)!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.13),
    inset 0 -3px 0 #03101D,
    0 2px 4px rgba(0,0,0,.34)!important;
  transform:none!important;
}
#app.srHomeFullArena #skillbar .srWeaponSlotV383 img{
  width:27px!important;height:27px!important;
}
#app.srHomeFullArena #skillbar .srWeaponSlotV383 .catBar{
  left:3px!important;right:3px!important;bottom:1px!important;height:3px!important;
  border-radius:999px!important;
}

/* Filled skills are genuine circular orbs now, not gold squares with circles inside. */
#app.srHomeFullArena #skillbar .srSkillRefV383{
  position:relative!important;
  width:43px!important;
  height:43px!important;
  flex:0 0 43px!important;
  overflow:visible!important;
  border:0!important;
  border-radius:50%!important;
  background:transparent!important;
  box-shadow:none!important;
  transform:none!important;
}
#app.srHomeFullArena #skillbar .srSkillOrbV383{
  position:absolute!important;
  inset:0!important;
  border-radius:50%!important;
  overflow:visible!important;
  background:#07182A!important;
  box-shadow:
    0 0 0 1px #07111D,
    0 0 0 3px var(--srSkillColor),
    0 0 0 4px rgba(236,203,123,.30),
    0 3px 6px rgba(0,0,0,.42),
    inset 0 0 10px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx{
  position:absolute!important;
  inset:4px!important;
  border-radius:50%!important;
  overflow:hidden!important;
  border:0!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.22),
    inset 0 -6px 9px rgba(0,0,0,.35),
    0 0 5px color-mix(in srgb,var(--srSkillColor) 40%,transparent)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx::before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  border-radius:50%!important;
  background:
    radial-gradient(circle at 50% 18%,rgba(255,255,255,.34),transparent 33%),
    linear-gradient(160deg,rgba(255,255,255,.12),transparent 38%)!important;
  z-index:0!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx::after{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  border-radius:50%!important;
  background:radial-gradient(circle at 50% 110%,rgba(0,0,0,.32),transparent 56%)!important;
  z-index:2!important;
  pointer-events:none!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx>svg{
  position:relative!important;
  z-index:1!important;
  width:25px!important;height:25px!important;
  filter:drop-shadow(0 1px 2px rgba(0,0,0,.60))!important;
}

/* Thick category-colour ring exactly around the orb. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .cdRing{
  position:absolute!important;
  inset:-1px!important;
  width:45px!important;
  height:45px!important;
  z-index:3!important;
  overflow:visible!important;
  pointer-events:none!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .srSkillRingBaseV383{
  opacity:.72!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .cdArc{
  stroke-width:4.2!important;
  stroke-linecap:round!important;
  filter:drop-shadow(0 0 2.2px var(--srSkillColor))!important;
}

/* Main cooldown number is centered and dominant like the reference. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .cdTxt{
  position:absolute!important;
  inset:0!important;
  z-index:4!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  font-size:14px!important;
  line-height:1!important;
  font-weight:1000!important;
  color:#FFF7DF!important;
  text-shadow:0 2px 2px #000,0 0 5px #000!important;
  -webkit-text-stroke:.3px rgba(0,0,0,.62)!important;
}

/* Active-effect duration becomes the small coloured pill underneath the orb. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .fxBub{
  left:50%!important;
  bottom:-5px!important;
  transform:translateX(-50%)!important;
  z-index:7!important;
  min-width:27px!important;
  padding:1px 4px!important;
  border-radius:999px!important;
  font-size:7px!important;
  line-height:9px!important;
  text-align:center!important;
  background:#071421f2!important;
  border:1px solid currentColor!important;
  box-shadow:0 1px 3px rgba(0,0,0,.55),0 0 4px currentColor!important;
}

/* Level badge is a tiny dark circle at the bottom-right, matching the reference. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .lv{
  right:-3px!important;
  bottom:-4px!important;
  z-index:8!important;
  min-width:13px!important;
  width:13px!important;
  height:13px!important;
  padding:0!important;
  border-radius:50%!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  border:1px solid #D6AA4D!important;
  background:#0A101A!important;
  color:#FFF0BB!important;
  font-size:7px!important;
  line-height:13px!important;
  box-shadow:0 1px 3px rgba(0,0,0,.62)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383.cooling .skfx{
  filter:saturate(.72) brightness(.62)!important;
}

/* Empty skill slots keep the circular language too. */
#app.srHomeFullArena #skillbar .srSkillEmptyV383{
  width:43px!important;height:43px!important;flex:0 0 43px!important;
  border:0!important;border-radius:50%!important;background:transparent!important;
  box-shadow:none!important;overflow:visible!important;transform:none!important;
}
#app.srHomeFullArena #skillbar .srSkillEmptyOrbV383{
  width:39px!important;height:39px!important;margin:2px!important;
  border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;
  color:#8CA4BA!important;border:2px solid #58728B!important;
  background:linear-gradient(180deg,#102B46,#071A2D)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 2px 4px rgba(0,0,0,.32)!important;
}

/* AUTO remains rectangular and visually separate, just like the reference. */
#app.srHomeFullArena #skillbar .srAutoRefV383{
  width:43px!important;
  height:43px!important;
  flex:0 0 43px!important;
  border:2px solid #D5A949!important;
  border-radius:10px!important;
  gap:0!important;
  background:linear-gradient(180deg,#153653,#08233B 58%,#05182A)!important;
  color:#D6C58F!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.12),
    inset 0 -3px 0 #03111E,
    0 2px 4px rgba(0,0,0,.34)!important;
  transform:none!important;
}
#app.srHomeFullArena #skillbar .srAutoRefV383 .srAutoBoltV383{
  width:20px!important;height:20px!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  margin-bottom:0!important;color:#FFD45A!important;
  filter:drop-shadow(0 0 4px rgba(255,204,68,.35))!important;
}
#app.srHomeFullArena #skillbar .srAutoRefV383>span:not(.srAutoBoltV383){
  font-size:7px!important;line-height:8px!important;letter-spacing:.5px!important;
}
#app.srHomeFullArena #skillbar .srAutoRefV383>i{
  width:19px!important;height:3px!important;margin-top:2px!important;border-radius:999px!important;
  background:#606A74!important;
}
#app.srHomeFullArena #skillbar .srAutoRefV383.on>i{
  background:#F0BD42!important;
  box-shadow:0 0 6px rgba(240,189,66,.58)!important;
}

/* Keep Familiar as the long right-side card from the reference. */
#app.srHomeFullArena #skillbar .petMini{
  height:43px!important;
  min-width:98px!important;
  flex:1 1 auto!important;
  border:2px solid #D5A949!important;
  border-radius:10px!important;
  background:linear-gradient(180deg,#113452,#071E35)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 2px 4px rgba(0,0,0,.32)!important;
}
#app.srHomeFullArena #skillbar .petMini img{
  width:34px!important;height:34px!important;
}

@media(max-width:390px){
  #app.srHomeFullArena #screen.fixed>#skillbar{
    gap:3px!important;
    padding-left:5px!important;
    padding-right:5px!important;
  }
  #app.srHomeFullArena #skillbar .srWeaponSlotV383,
  #app.srHomeFullArena #skillbar .srSkillRefV383,
  #app.srHomeFullArena #skillbar .srSkillEmptyV383,
  #app.srHomeFullArena #skillbar .srAutoRefV383{
    width:41px!important;height:41px!important;flex-basis:41px!important;
  }
  #app.srHomeFullArena #skillbar .srSkillRefV383 .cdRing{
    width:43px!important;height:43px!important;
  }
  #app.srHomeFullArena #skillbar .petMini{height:41px!important;min-width:94px!important}
  #app.srHomeFullArena #skillbar .petMini img{width:32px!important;height:32px!important}
}


/* V386 SKILL ICON PRIORITY
   Keep the V383 circular reference structure, but make the skill art the hero.
   Cooldowns become supporting information instead of covering the icon. */

/* Give the artwork more room and more light. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx{
  inset:2px!important;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.30),
    inset 0 -5px 8px rgba(0,0,0,.20),
    0 0 8px color-mix(in srgb,var(--srSkillColor) 55%,transparent)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx::before{
  background:
    radial-gradient(circle at 50% 18%,rgba(255,255,255,.38),transparent 31%),
    linear-gradient(160deg,rgba(255,255,255,.16),transparent 36%)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx::after{
  background:
    radial-gradient(circle at 50% 115%,rgba(0,0,0,.18),transparent 54%)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .skfx>svg{
  width:30px!important;
  height:30px!important;
  color:#FFF6DA!important;
  filter:
    brightness(1.28)
    saturate(1.12)
    drop-shadow(0 1px 2px rgba(0,0,0,.62))
    drop-shadow(0 0 4px color-mix(in srgb,var(--srSkillColor) 62%,transparent))!important;
  transform:scale(1.03)!important;
}

/* Cooling must never black out the skill artwork. */
#app.srHomeFullArena #skillbar .srSkillRefV383.cooling .skfx{
  filter:brightness(.96) saturate(.96)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383.cooling .skfx::after{
  background:
    linear-gradient(rgba(2,10,17,.08),rgba(2,10,17,.08)),
    radial-gradient(circle at 50% 115%,rgba(0,0,0,.18),transparent 54%)!important;
}

/* The ring is a progress accent, not the dominant shape. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .cdRing{
  inset:-1px!important;
  width:45px!important;
  height:45px!important;
  opacity:.90!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .srSkillRingBaseV383{
  stroke-width:2.4!important;
  opacity:.46!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .cdArc{
  stroke-width:2.8!important;
  filter:drop-shadow(0 0 1.5px var(--srSkillColor))!important;
}

/* Timer moves to a compact lower badge so the center remains the skill icon. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .cdTxt{
  inset:auto 7px 3px 7px!important;
  min-height:13px!important;
  border-radius:7px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  z-index:6!important;
  font-size:9.5px!important;
  line-height:11px!important;
  font-weight:1000!important;
  letter-spacing:0!important;
  color:#FFF7DE!important;
  background:rgba(4,13,22,.72)!important;
  border:1px solid rgba(255,255,255,.12)!important;
  box-shadow:0 1px 3px rgba(0,0,0,.48)!important;
  text-shadow:0 1px 1px #000!important;
  -webkit-text-stroke:0!important;
  pointer-events:none!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .cdTxt:empty{
  display:none!important;
}

/* Keep secondary information truly secondary. */
#app.srHomeFullArena #skillbar .srSkillRefV383 .lv{
  width:12px!important;
  min-width:12px!important;
  height:12px!important;
  right:-2px!important;
  bottom:-2px!important;
  font-size:6.5px!important;
  line-height:12px!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383 .fxBub{
  bottom:-4px!important;
  min-width:24px!important;
  padding:1px 3px!important;
  font-size:6.5px!important;
  line-height:8px!important;
  opacity:.94!important;
}

/* Ready skills receive a subtle coloured halo, so they read as abilities rather than timers. */
#app.srHomeFullArena #skillbar .srSkillRefV383:not(.cooling) .srSkillOrbV383{
  box-shadow:
    0 0 0 1px #07111D,
    0 0 0 2px var(--srSkillColor),
    0 0 8px color-mix(in srgb,var(--srSkillColor) 58%,transparent),
    0 3px 6px rgba(0,0,0,.38),
    inset 0 0 8px rgba(0,0,0,.22)!important;
}
#app.srHomeFullArena #skillbar .srSkillRefV383.cooling .srSkillOrbV383{
  box-shadow:
    0 0 0 1px #07111D,
    0 0 0 2px color-mix(in srgb,var(--srSkillColor) 74%,#23313D),
    0 2px 5px rgba(0,0,0,.34),
    inset 0 0 8px rgba(0,0,0,.18)!important;
}

@media(max-width:390px){
  #app.srHomeFullArena #skillbar .srSkillRefV383 .skfx>svg{
    width:28px!important;height:28px!important;
  }
  #app.srHomeFullArena #skillbar .srSkillRefV383 .cdTxt{
    inset:auto 6px 3px 6px!important;
    font-size:9px!important;
  }
}

`;
  document.head.appendChild(style);
})();
