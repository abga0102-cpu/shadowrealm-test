/* SHADOWREACH · Premium UI polish V209 / V364
   Strict reference-fidelity pass: luminous fantasy scene, floating HUD, ornate Forge and navigation.
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
  --primary-action-glow:rgba(255,211,105,.34);
  --premium-gold:#E8B84F;
  --premium-gold-lit:#FFE9A5;
  --premium-gold-dim:#906321;
  --arcade-surface:#0C3157;
  --arcade-surface-raised:#164D7D;
  --arcade-border:#4F8AB8;
  --arcade-border-lit:#8BCDF2;
  --arcade-text:#F8FBFF;
  --arcade-muted:#BDD1E2;
  --sr-blue:#1598EB;
  --sr-blue-lit:#6CD1FF;
  --sr-blue-deep:#075896;
  --sr-green:#36D66F;
  --sr-red:#B42738;
}
button:focus-visible,[data-act]:focus-visible,[role="button"]:focus-visible,
input:focus-visible,select:focus-visible,a:focus-visible{
  outline:2px solid var(--premium-gold-lit)!important;
  outline-offset:2px!important;
}
body{background:radial-gradient(120% 90% at 50% 0%,#183D66 0%,#091B31 57%,#040A12 100%)!important}
#app{
  background:linear-gradient(180deg,#123B63 0%,#071B30 100%)!important;
  box-shadow:0 0 50px rgba(0,0,0,.6),0 0 0 1px rgba(108,182,227,.35)!important;
}
#screen{scrollbar-color:#6197C1 transparent!important}
#screen::-webkit-scrollbar-thumb{background:linear-gradient(#8BCDF2,#3E729E)!important}
.card{
  border:1px solid #477BA7!important;border-radius:13px!important;
  background:linear-gradient(180deg,#245B88 0%,#153F69 42%,#0C2B4C 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.15),inset 0 -1px 0 rgba(2,16,29,.68),0 4px 13px rgba(0,0,0,.3)!important;
}
.frame::before,.frame::after{display:block!important;filter:drop-shadow(0 0 4px rgba(255,207,96,.28))}
.frame::before{border-top-color:var(--premium-gold)!important;border-left-color:var(--premium-gold)!important}
.frame::after{border-right-color:var(--premium-gold)!important;border-bottom-color:var(--premium-gold)!important}
.card.lit{border-color:#75B6DE!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 0 0 1px rgba(232,184,79,.16),0 5px 15px rgba(0,0,0,.3)!important}
.gt,.sect{color:#FFE4A0!important;text-shadow:0 1px 2px rgba(0,0,0,.48)!important}
.dim{color:#CBDCEB!important}.mute{color:#9FB9CF!important}
/* Semantic action hierarchy: one primary language, one normal language, red only for danger. */
.btn{
  --bA:#F5C95F;--bB:#C98B24;--bS:#775011;--bE:#FFF0AF;--bT:#241803;--bSh:0 1px 0 rgba(255,249,218,.35);
  border:1px solid #07182B!important;border-radius:11px!important;
  box-shadow:inset 0 1px 0 var(--bE),inset 0 -2px 0 var(--bS),0 2px 0 #061522,0 5px 10px rgba(0,0,0,.3)!important;
}
.btn::after{opacity:.72!important}
.btn.blue{--bA:#4CC7FF;--bB:#1488DB;--bS:#075899;--bE:#C5EDFF;--bT:#fff;--bSh:0 1px 1px #064472}
.btn.green{--bA:#72E48F;--bB:#29B65C;--bS:#147A39;--bE:#CEF8D8;--bT:#fff;--bSh:0 1px 1px #0A5125}
.btn.red{--bA:#F16B78;--bB:#B72B3B;--bS:#711A25;--bE:#FFC0C7;--bT:#fff;--bSh:0 1px 1px #54111A}
.btn.ghost,.btn.dark{--bA:#3A668D;--bB:#244B70;--bS:#15334E;--bE:#7AA8CA;--bT:#EDF8FF;--bSh:0 1px 1px #10283C}
.btn:disabled{opacity:.78!important;filter:saturate(.58) brightness(.92)!important}
.hudBtn,.menuBtn,.iBtn,.recommendedClose{
  border:1px solid #D8AE54!important;border-radius:9px!important;
  background:linear-gradient(180deg,#327DB4,#174A77)!important;color:#F2FAFF!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -2px 0 rgba(3,24,44,.5),0 2px 5px rgba(0,0,0,.3)!important;
}
/* V243 final recommendation policy: contextual recommendation stays discreet and dismissible. */
[data-primary-action="true"]:not([data-primary="true"])::after{content:none!important;display:none!important}
[data-primary-action="true"]:not(.btn){box-shadow:none!important;filter:none!important}
.recommendedActionCard{border:1px solid #4C7DA8!important;border-left:3px solid rgba(234,182,75,.76)!important;background:linear-gradient(180deg,#214E78,#153A5F)!important}
.recommendedKicker{display:none!important}

/* HOME V364 · strict visual match to the supplied reference. */
#app.srHomeFullArena{
  --srHudH:108px;--srSkillH:62px;--srForgeH:208px;
  background:#071A2C!important;border-left:1px solid #173D64!important;border-right:1px solid #173D64!important;
}
#app.srHomeFullArena>#hud{
  gap:7px!important;padding:7px 8px 5px!important;
  background:linear-gradient(180deg,rgba(5,24,43,.78) 0%,rgba(7,35,61,.34) 53%,rgba(7,35,61,.08) 78%,transparent 100%)!important;
  border:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
}
#app.srHomeFullArena>#hud::before{
  content:""!important;position:absolute!important;left:0!important;right:0!important;top:0!important;height:2px!important;
  background:linear-gradient(90deg,transparent,#E9BB58 14%,#FFE2A0 50%,#E9BB58 86%,transparent)!important;
  opacity:.7!important;pointer-events:none!important;
}
#app.srHomeFullArena>#hud::after{display:none!important}
#app.srHomeFullArena>#hud>.pbox{
  height:61px!important;min-height:61px!important;padding:5px 9px 5px 4px!important;
  border:1px solid #D9AE52!important;border-radius:14px!important;
  background:linear-gradient(135deg,rgba(42,112,169,.94),rgba(17,68,111,.94) 57%,rgba(7,40,70,.96))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -2px 0 rgba(3,18,34,.52),0 3px 8px rgba(0,0,0,.32),0 0 0 1px rgba(95,61,16,.35)!important;
  overflow:visible!important;
}
#app.srHomeFullArena .avatar{
  width:50px!important;height:50px!important;background:radial-gradient(circle at 50% 30%,#75C7F2,#1D5688 58%,#082A4D 100%)!important;
  box-shadow:0 0 0 1px #603D0C,0 0 0 3px #E6B84F,0 2px 9px rgba(0,0,0,.5),0 0 12px rgba(255,201,83,.25)!important;
}
#app.srHomeFullArena .avatar::after{inset:-18%!important;filter:brightness(1.22) saturate(1.1) drop-shadow(0 2px 2px rgba(0,0,0,.55))!important}
#app.srHomeFullArena .avatar img{width:62%!important;height:62%!important}
#app.srHomeFullArena .pname{font-size:13.5px!important;color:#fff!important;text-shadow:0 2px 2px rgba(0,0,0,.65)!important}
#app.srHomeFullArena .power{color:#FFE39A!important;padding:2px 6px!important;border:1px solid rgba(231,185,79,.58)!important;border-radius:999px!important;background:rgba(3,30,55,.67)!important}
#app.srHomeFullArena .pbar{margin-top:4px!important}
#app.srHomeFullArena .pbar>.cap{min-width:27px!important;width:27px!important;height:27px!important;border:1px solid #FFE4A1!important;background:linear-gradient(180deg,#B18CFF,#7044D1)!important}
#app.srHomeFullArena .pbar>.trk{height:14px!important;border:1px solid #1B456D!important;background:#071A31!important}
#app.srHomeFullArena .pbar>.trk>i{background:linear-gradient(180deg,#CEAFFF,#7547DB)!important}
#app.srHomeFullArena>#hud>.col{gap:5px!important;max-width:48%!important;align-items:flex-end!important}
#app.srHomeFullArena>#hud>.col>.row{gap:5px!important;justify-content:flex-end!important}
#app.srHomeFullArena .curr{
  min-height:31px!important;height:31px!important;padding:2px 2px 2px 7px!important;gap:5px!important;
  border:1px solid #D7AA4E!important;border-radius:15px!important;background:linear-gradient(180deg,rgba(37,102,152,.96),rgba(13,56,94,.97))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -2px 0 rgba(1,19,36,.52),0 3px 6px rgba(0,0,0,.28)!important;
}
#app.srHomeFullArena .curr>b{font-size:11px!important;color:#fff!important}
#app.srHomeFullArena .curr>.plus{
  width:24px!important;height:28px!important;margin:-1px -1px -1px 1px!important;border:1px solid #145C31!important;border-radius:50%!important;
  background:linear-gradient(180deg,#78EB92,#27B65A)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 2px 4px rgba(0,0,0,.26)!important;
}
#app.srHomeFullArena .hudBtn,#app.srHomeFullArena .menuBtn{width:31px!important;height:31px!important;min-width:31px!important;border-radius:9px!important;background:linear-gradient(180deg,#327AB0,#164A78)!important}

#app.srHomeFullArena #screen.fixed>.campaignWorld{
  border-top:0!important;border-bottom:1px solid #E1B653!important;background:#123E5E!important;
  box-shadow:inset 0 0 0 1px rgba(240,201,104,.14)!important;
}
#app.srHomeFullArena #arenaBg{background-position:center 48%!important;filter:brightness(1.14) saturate(1.12) contrast(1.03)!important;transform:scale(1.015)!important}
#app.srHomeFullArena #arenaShade{background:linear-gradient(180deg,rgba(9,38,60,.03) 0%,rgba(5,25,39,.02) 45%,rgba(2,17,27,.17) 100%)!important}
#app.srHomeFullArena #arena::before{
  content:""!important;position:absolute!important;inset:0!important;z-index:7!important;pointer-events:none!important;
  background:radial-gradient(90% 46% at 50% 16%,rgba(193,239,255,.11),transparent 72%),linear-gradient(90deg,rgba(5,28,45,.12),transparent 9%,transparent 91%,rgba(5,28,45,.12)),linear-gradient(180deg,transparent 68%,rgba(3,23,36,.12))!important;
}
#app.srHomeFullArena #arena::after{box-shadow:inset 0 1px 0 rgba(255,255,255,.17),inset 0 -2px 0 rgba(232,189,83,.48)!important}
#app.srHomeFullArena #aDecor{filter:brightness(1.08) saturate(1.08) drop-shadow(0 3px 3px rgba(0,0,0,.16))!important}
#app.srHomeFullArena #aLayer .unit{filter:saturate(1.06) brightness(1.04) drop-shadow(0 4px 4px rgba(0,0,0,.3))!important}

#app.srHomeFullArena #arena .floorTag{top:calc(var(--srHudH) - 5px)!important;gap:6px!important;z-index:24!important}
#app.srHomeFullArena #arena .floorTxt{
  min-width:150px!important;padding:5px 20px 6px!important;border:1px solid #E4B754!important;border-radius:13px!important;
  background:linear-gradient(180deg,rgba(47,118,169,.93),rgba(11,55,91,.95))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.30),inset 0 -2px 0 rgba(0,21,39,.42),0 3px 7px rgba(0,0,0,.35),0 0 10px rgba(255,209,93,.11)!important;
  color:#FFF4CE!important;font-family:Georgia,var(--fd),serif!important;font-size:17px!important;letter-spacing:1.7px!important;line-height:1!important;text-shadow:0 2px 2px rgba(0,0,0,.78)!important;
}
#app.srHomeFullArena #arena .fTrack{transform:scale(.92)!important;padding:3px 7px!important;border:0!important;background:transparent!important;box-shadow:none!important}
#app.srHomeFullArena #arena .fTrack i{height:3px!important;background:#173955!important}
#app.srHomeFullArena #arena .sdot{width:12px!important;height:12px!important;border:2px solid #AEDCF4!important;background:radial-gradient(circle at 42% 32%,#7ACAF5,#1D5F91 62%,#0B355D)!important;box-shadow:0 1px 3px rgba(0,0,0,.5)!important}
#app.srHomeFullArena #arena .sdot.cur,#app.srHomeFullArena #arena .sdot.on{border-color:#FFE59B!important;background:radial-gradient(circle at 40% 30%,#FFF5C6,#E9AD39 62%,#A96C15)!important;box-shadow:0 0 9px rgba(255,203,79,.62)!important}
#app.srHomeFullArena #arena #aSub{gap:9px!important}
#app.srHomeFullArena #arena .fPill{
  min-height:25px!important;padding:3px 11px!important;border:1px solid #D9AE52!important;border-radius:999px!important;
  background:linear-gradient(180deg,rgba(28,77,117,.95),rgba(6,39,69,.96))!important;color:#fff!important;font-size:10.5px!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.17),0 2px 5px rgba(0,0,0,.3)!important;
}
#app.srHomeFullArena .campaignWorld .btn.red{
  border:1px solid #FF7E8E!important;border-radius:18px!important;background:linear-gradient(180deg,#9E2234,#64111F)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.21),inset 0 -2px 0 #410B14,0 0 14px rgba(210,53,70,.25),0 4px 8px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena .hpMini{height:7px!important;border:1px solid rgba(255,237,201,.78)!important;background:#421016!important;box-shadow:0 1px 3px rgba(0,0,0,.55)!important}
#app.srHomeFullArena .hpMini>i{background:linear-gradient(180deg,#79ED85,#27B74D)!important}
#app.srHomeFullArena .worldAction,#app.srHomeFullArena .worldMenu>summary{
  border:1px solid #D9AE52!important;border-radius:10px!important;background:linear-gradient(180deg,rgba(45,110,159,.97),rgba(14,53,88,.98))!important;color:#FFF0BF!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.23),inset 0 -2px 0 rgba(2,19,36,.54),0 3px 7px rgba(0,0,0,.36)!important;
}

#app.srHomeFullArena #screen.fixed>#skillbar{
  position:relative!important;box-sizing:border-box!important;padding:6px 8px!important;gap:6px!important;
  background:linear-gradient(180deg,#113B62 0%,#0A2B4C 100%)!important;border-top:1px solid #E2B452!important;border-bottom:2px solid #E2B452!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.11),inset 0 -3px 7px rgba(0,14,27,.55),0 -2px 8px rgba(0,0,0,.22)!important;overflow:visible!important;
}
#app.srHomeFullArena #screen.fixed>#skillbar::before{
  content:""!important;position:absolute!important;left:5px!important;right:5px!important;top:-3px!important;height:5px!important;
  background:linear-gradient(90deg,transparent,#B68125 8%,#F2CD6D 22%,#A87520 50%,#F2CD6D 78%,#B68125 92%,transparent)!important;
  clip-path:polygon(0 45%,46% 45%,48% 0,52% 0,54% 45%,100% 45%,100% 65%,54% 65%,52% 100%,48% 100%,46% 65%,0 65%)!important;pointer-events:none!important;
}
#app.srHomeFullArena #skillbar .slot{
  width:47px!important;height:47px!important;border:2px solid #DDB14F!important;border-radius:12px!important;background:linear-gradient(180deg,#265E8E,#0D3155)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -4px 7px rgba(0,13,26,.5),0 2px 5px rgba(0,0,0,.36)!important;
}
#app.srHomeFullArena #skillbar .slot::before{inset:2px!important;border:1px solid rgba(126,207,248,.35)!important;border-radius:9px!important}
#app.srHomeFullArena #skillbar .slot .catBar{height:4px!important}
#app.srHomeFullArena #skillbar .petMini{
  height:47px!important;min-width:105px!important;padding:0 9px 0 4px!important;gap:6px!important;border:2px solid #DDB14F!important;border-radius:12px!important;
  background:linear-gradient(180deg,#245C8B,#0D3459)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -3px 6px rgba(0,15,29,.47),0 2px 5px rgba(0,0,0,.34)!important;
}
#app.srHomeFullArena #skillbar .petMini img{width:41px!important;height:41px!important;filter:saturate(1.12) brightness(1.08) drop-shadow(0 0 5px rgba(78,218,255,.22))!important}
#app.srHomeFullArena #skillbar .petMini .mute{color:#C8DDED!important}

#app.srHomeFullArena #screen.fixed>.pad.mt4{padding:4px 8px 5px!important;background:linear-gradient(180deg,#0B2B49,#071E35)!important}
#app.srHomeFullArena .homeForge.srForgePanel266{
  position:relative!important;overflow:visible!important;border:2px solid #D2A341!important;border-radius:14px!important;
  background:radial-gradient(65% 90% at 83% 45%,rgba(255,126,28,.17),transparent 65%),linear-gradient(180deg,#173F68 0%,#0B2948 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.23),inset 0 -3px 0 rgba(3,19,34,.6),0 0 0 1px rgba(89,51,11,.5),0 4px 10px rgba(0,0,0,.36)!important;
}
#app.srHomeFullArena .homeForge.srForgePanel266::before,#app.srHomeFullArena .homeForge.srForgePanel266::after{width:24px!important;height:24px!important;border-width:3px!important;border-color:#F2CA68!important;z-index:6!important}
#app.srHomeFullArena .srForgeHead266{position:relative!important;z-index:4!important;height:27px!important;flex-basis:27px!important;padding:0 4px 4px!important;border-bottom:1px solid rgba(239,196,94,.38)!important}
#app.srHomeFullArena .srForgeHeadLeft266>b{font:900 13px/1 Georgia,var(--fd),serif!important;color:#FFF0BB!important;letter-spacing:.8px!important;text-shadow:0 2px 2px rgba(0,0,0,.64)!important}
#app.srHomeFullArena .srForgeHammer266{width:25px!important;height:25px!important;border:1px solid #F0C35B!important;border-radius:9px!important;background:linear-gradient(180deg,#3A82B4,#17496F)!important}
#app.srHomeFullArena .srForgeMineral266{min-height:23px!important;padding:0 8px!important;border:1px solid #72B6DC!important;border-radius:999px!important;background:rgba(4,35,60,.68)!important;color:#D9F4FF!important}
#app.srHomeFullArena .srForgeUpgrade266{
  position:relative!important;z-index:4!important;margin-top:5px!important;min-height:39px!important;flex:0 0 39px!important;padding:4px 5px 4px 8px!important;
  border:1px solid #6EA8CF!important;border-radius:10px!important;background:linear-gradient(180deg,rgba(31,85,126,.95),rgba(11,48,80,.96))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.11)!important;
}
#app.srHomeFullArena .srForgeUpText266>b,#app.srHomeFullArena .srForgeUpLine266,#app.srHomeFullArena .srForgeUpLine266 b{font-size:9px!important;color:#FFE59A!important}
#app.srHomeFullArena .srForgeUpgrade266>.btn{
  min-width:92px!important;height:31px!important;min-height:31px!important;padding:4px 10px!important;
  --bA:#FFC353;--bB:#D98615;--bS:#8C4B05;--bE:#FFF0AD;--bT:#fff;--bSh:0 1px 1px #6A3400;
  border-color:#704006!important;border-radius:9px!important;
}
#app.srHomeFullArena .srForgeUpgrade266>.btn:disabled{--bA:#C49A55;--bB:#8A6A37;--bS:#59441F;--bE:#D8BE88;--bT:#EADDBF;opacity:.72!important}
#app.srHomeFullArena .srForgeLootReserve266{
  position:relative!important;z-index:2!important;min-height:46px!important;flex:1 1 auto!important;margin-top:4px!important;
  border:1px solid rgba(103,170,209,.38)!important;border-radius:10px!important;
  background:linear-gradient(90deg,rgba(4,27,47,.84) 0%,rgba(5,29,49,.60) 53%,rgba(13,28,38,.18) 100%),radial-gradient(circle at 78% 82%,rgba(255,142,38,.55),transparent 25%),url("art/props/brazier.png") 82% 82% / 76px auto no-repeat,url("art/props/crystal.png") 97% 86% / 36px auto no-repeat,linear-gradient(180deg,#123D60,#081F37)!important;
  box-shadow:inset 0 1px 6px rgba(0,0,0,.28),inset 0 0 28px rgba(255,106,18,.06)!important;
}
#app.srHomeFullArena .srForgeLootReserve266::before{content:""!important;position:absolute!important;inset:0!important;pointer-events:none!important;border-radius:inherit!important;background:linear-gradient(110deg,transparent 48%,rgba(255,189,75,.08) 72%,transparent 92%)!important}
#app.srHomeFullArena .srForgeActions266{position:relative!important;z-index:4!important;gap:7px!important;margin-top:5px!important;height:39px!important;flex:0 0 39px!important}
#app.srHomeFullArena .srForgeActions266>.btn{height:39px!important;min-height:39px!important}
#app.srHomeFullArena .srForgeActions266>.btn.blue{border-color:#075383!important;background:linear-gradient(180deg,#54CAFF,#148BE0)!important;box-shadow:inset 0 1px 0 #C9F1FF,inset 0 -3px 0 #075A9E,0 2px 0 #052B49,0 4px 8px rgba(0,0,0,.27)!important}
#app.srHomeFullArena .srForgeActions266 .tgl{flex:0 0 92px!important;min-width:92px!important;height:39px!important;border:1px solid #719DC0!important;border-radius:11px!important;background:linear-gradient(180deg,#315F88,#173D61)!important;color:#D8E7F4!important}
#app.srHomeFullArena .srForgeActions266 .tgl.on{border-color:#7BE797!important;background:linear-gradient(180deg,#5DDB80,#27AA58)!important}
#app.srHomeFullArena .srForgeFilter266{position:relative!important;z-index:4!important;margin-top:4px!important;height:25px!important;min-height:25px!important;max-height:25px!important;flex:0 0 25px!important;border:1px solid #5789B0!important;border-radius:8px!important;background:linear-gradient(180deg,#16466F,#0A2C4E)!important}

#tabs{
  border-top:2px solid #D9AC4B!important;background:linear-gradient(180deg,#163B61 0%,#0B2847 58%,#061A30 100%)!important;
  box-shadow:0 -4px 12px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.12)!important;
}
#tabs::before{height:4px!important;background:linear-gradient(90deg,#70470F,#F0C866 15%,#A97723 50%,#F0C866 85%,#70470F)!important;box-shadow:0 0 8px rgba(255,199,76,.16)!important}
#tabs>.tab{position:relative!important;gap:1px!important;color:#B7CBDE!important;border-right:1px solid rgba(112,167,205,.18)!important}
#tabs>.tab:last-child{border-right:0!important}
#tabs>.tab::after{content:""!important;position:absolute!important;top:6px!important;bottom:6px!important;right:-1px!important;width:1px!important;background:linear-gradient(transparent,rgba(230,184,79,.33),transparent)!important;display:block!important}
#tabs>.tab:last-child::after{display:none!important}
#tabs>.tab .fantasyNavIcon{width:38px!important;height:38px!important;margin-top:-1px!important;opacity:.82!important;filter:saturate(.72) brightness(.92) drop-shadow(0 2px 3px rgba(0,0,0,.5))!important}
#tabs>.tab span{font-size:9px!important;font-weight:900!important;text-shadow:0 1px 2px rgba(0,0,0,.55)!important}
#tabs>.tab.on,#tabs>.tab.active,#tabs>.tab[aria-current="page"]{color:#FFF0B1!important;background:radial-gradient(80% 90% at 50% 23%,rgba(255,210,93,.30),rgba(205,137,25,.10) 51%,transparent 74%)!important}
#tabs>.tab.on .fantasyNavIcon,#tabs>.tab.active .fantasyNavIcon,#tabs>.tab[aria-current="page"] .fantasyNavIcon{opacity:1!important;transform:translateY(-2px) scale(1.04)!important;filter:saturate(1.03) brightness(1.18) drop-shadow(0 0 7px rgba(255,207,79,.47))!important}
#tabs>.tab.on::before,#tabs>.tab.active::before,#tabs>.tab[aria-current="page"]::before{height:3px!important;left:12%!important;right:12%!important;background:linear-gradient(90deg,transparent,#FFF2AF 18%,#E6AD35 82%,transparent)!important;box-shadow:0 0 8px rgba(255,203,75,.42)!important}

#topbar{min-height:42px!important;background:linear-gradient(180deg,#286490,#113D65)!important;border-bottom:1px solid #D7A94E!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)!important}
.back{border-color:#D4A74B!important;background:linear-gradient(180deg,#367CAF,#194B75)!important;color:#fff!important}
#screen:not(.fixed)>.pad>.card,#screen:not(.fixed) .srNavHub{border-color:#527FA7!important;background:linear-gradient(180deg,#245984,#123A62)!important}
.srNavHubItem{border-color:#6A9ABE!important;background:linear-gradient(180deg,#2E6998,#17466F)!important}

@media(max-width:390px){
  #app.srHomeFullArena{--srHudH:104px;--srSkillH:58px;--srForgeH:206px}
  #app.srHomeFullArena>#hud{padding-left:6px!important;padding-right:6px!important;gap:5px!important}
  #app.srHomeFullArena>#hud>.pbox{height:58px!important;min-height:58px!important}
  #app.srHomeFullArena .avatar{width:46px!important;height:46px!important}
  #app.srHomeFullArena .pname{font-size:12px!important}
  #app.srHomeFullArena .power{font-size:9px!important;padding-left:4px!important;padding-right:4px!important}
  #app.srHomeFullArena .curr{gap:3px!important;padding-left:4px!important}
  #app.srHomeFullArena .curr>b{font-size:10px!important}
  #app.srHomeFullArena .curr>.plus{width:21px!important;height:25px!important}
  #app.srHomeFullArena .hudBtn,#app.srHomeFullArena .menuBtn{width:29px!important;height:29px!important;min-width:29px!important}
  #app.srHomeFullArena #arena .floorTxt{min-width:142px!important;font-size:16px!important;padding-left:16px!important;padding-right:16px!important}
  #app.srHomeFullArena #screen.fixed>#skillbar{padding-left:6px!important;padding-right:6px!important;gap:4px!important}
  #app.srHomeFullArena #skillbar .slot{width:43px!important;height:43px!important}
  #app.srHomeFullArena #skillbar .petMini{height:43px!important;min-width:90px!important;padding-right:5px!important}
  #app.srHomeFullArena #skillbar .petMini img{width:37px!important;height:37px!important}
  #app.srHomeFullArena .srForgeUpgrade266>.btn{min-width:83px!important}
  #app.srHomeFullArena .srForgeActions266 .tgl{flex-basis:84px!important;min-width:84px!important}
  #tabs>.tab .fantasyNavIcon{width:35px!important;height:35px!important}
  #tabs>.tab span{font-size:8.5px!important}
}
@media(max-height:720px){
  #app.srHomeFullArena{--srHudH:100px;--srSkillH:54px;--srForgeH:190px}
  #app.srHomeFullArena>#hud{padding-top:4px!important}
  #app.srHomeFullArena>#hud>.pbox{height:54px!important;min-height:54px!important}
  #app.srHomeFullArena .avatar{width:43px!important;height:43px!important}
  #app.srHomeFullArena #skillbar .slot{width:40px!important;height:40px!important}
  #app.srHomeFullArena #skillbar .petMini{height:40px!important}
  #app.srHomeFullArena .srForgeLootReserve266{min-height:34px!important}
  #app.srHomeFullArena .srForgeUpgrade266{min-height:34px!important;flex-basis:34px!important}
  #app.srHomeFullArena .srForgeActions266{height:35px!important;flex-basis:35px!important}
  #app.srHomeFullArena .srForgeActions266>.btn,#app.srHomeFullArena .srForgeActions266 .tgl{height:35px!important;min-height:35px!important}
}
@media(prefers-reduced-motion:reduce){.btn,.hudBtn,.menuBtn,.iBtn,.recommendedClose,.tgl,#tabs>.tab,#tabs>.tab .fantasyNavIcon{transition:none!important}}
`;
  document.head.appendChild(style);
})();
