/* SHADOWREACH · Progression Pass visual authority v331
   Presentation-only layer for the existing v139/v140 Accomplishments owners.
   No progression, payout, entitlement, modal or navigation ownership changes. */
(function(){
'use strict';
if(window.__srAccomplishmentsVisualV331)return;
window.__srAccomplishmentsVisualV331=true;
var s=document.createElement('style');
s.id='srAccomplishmentsVisualV331Style';
s.textContent=`
/* Full pass window */
#overlay:has(.srAch139){
  background:rgba(3,7,16,.82)!important;
  backdrop-filter:blur(5px) saturate(.86);
  -webkit-backdrop-filter:blur(5px) saturate(.86);
}
#overlay:has(.srAch139)>.card{
  width:min(95vw,590px)!important;
  max-width:590px!important;
  border-radius:24px!important;
  border:2px solid #314f86!important;
  background:
    radial-gradient(90% 38% at 50% -4%,rgba(122,81,255,.28),transparent 63%),
    linear-gradient(180deg,#162746 0%,#0b1528 35%,#09111f 100%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 0 0 3px rgba(5,10,22,.72),0 24px 70px rgba(0,0,0,.72),0 0 34px rgba(71,126,255,.16)!important;
  overflow:hidden!important;
}
#overlay:has(.srAch139)>.card>.mbody{padding:12px!important;}
#overlay:has(.srAch139)>.card>.mhead{
  min-height:44px!important;
  border-bottom:1px solid rgba(108,142,207,.22)!important;
  background:linear-gradient(180deg,rgba(22,37,66,.9),rgba(11,20,37,.72))!important;
}
#overlay:has(.srAch139)>.card>.mhead b{font-family:var(--fd)!important;letter-spacing:.5px!important;color:#f2f6ff!important;}

.srAch139{
  --passBlue:#4ca5ff;
  --passBlue2:#79c8ff;
  --passGold:#ffbf3c;
  --passGold2:#ffe08a;
  --passInk:#091220;
  position:relative;
  padding:4px 2px 2px!important;
  color:#f3f6fd!important;
}
.srAch139:before{
  content:"♛";
  position:absolute;
  z-index:4;
  left:50%;top:-35px;
  transform:translateX(-50%);
  display:grid;place-items:center;
  width:58px;height:45px;
  font-size:35px;line-height:1;
  color:#ffd15c;
  text-shadow:0 3px 0 #7c4b08,0 0 18px rgba(255,191,60,.62);
  filter:drop-shadow(0 4px 4px rgba(0,0,0,.45));
  pointer-events:none;
}

/* Hero */
.srAch139 .achPassHero{
  position:relative!important;
  overflow:hidden!important;
  border:1px solid #395c98!important;
  border-radius:18px!important;
  padding:18px 16px 14px!important;
  background:
    radial-gradient(80% 100% at 8% 0,rgba(75,151,255,.18),transparent 58%),
    radial-gradient(60% 100% at 98% 0,rgba(255,190,50,.15),transparent 60%),
    linear-gradient(180deg,#172b4f,#0e1b33)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(0,0,0,.55),0 8px 20px rgba(0,0,0,.3)!important;
}
.srAch139 .achPassHero:after{
  content:"";position:absolute;left:-15%;right:-15%;top:-72px;height:105px;
  background:radial-gradient(ellipse at center,rgba(121,89,255,.34),transparent 68%);
  pointer-events:none;
}
.srAch139 .achPassTop{position:relative;z-index:1;align-items:center!important;gap:14px!important;}
.srAch139 .achPassKicker{color:#7fc5ff!important;font-size:9px!important;letter-spacing:2px!important;}
.srAch139 .achPassTitle{
  font-family:var(--fd)!important;
  font-size:25px!important;
  line-height:1.05!important;
  letter-spacing:.3px!important;
  color:#fff!important;
  text-shadow:0 2px 0 #071023,0 0 16px rgba(92,151,255,.25)!important;
}
.srAch139 .achPassSub{max-width:340px!important;color:#b6c5df!important;font-size:11px!important;line-height:1.4!important;}
.srAch139 .achPassPrice{
  min-width:104px!important;
  border:2px solid #8d5d08!important;
  border-radius:13px!important;
  padding:8px 10px!important;
  background:linear-gradient(180deg,#ffe487 0%,#f7b62f 50%,#cf8211 100%)!important;
  color:#2b1902!important;
  font-size:11px!important;
  text-shadow:0 1px rgba(255,255,255,.52)!important;
  box-shadow:inset 0 2px 0 #fff5bf,inset 0 -3px 0 #8f5406,0 4px 0 #07101f,0 7px 16px rgba(0,0,0,.38)!important;
}
.srAch139 .achPassPrice small{color:#5d3b08!important;font-size:8px!important;}
.srAch139 .achPassMeter{
  height:12px!important;border:2px solid #07101d!important;border-radius:999px!important;
  background:#07101e!important;margin-top:14px!important;box-shadow:inset 0 2px 5px rgba(0,0,0,.72)!important;
}
.srAch139 .achPassMeter>i{
  border-radius:999px!important;
  background:linear-gradient(180deg,#ffe77a,#ffb619)!important;
  box-shadow:inset 0 2px 0 rgba(255,255,255,.65),0 0 12px rgba(255,186,33,.42)!important;
}
.srAch139 .achPassMeta{color:#a8b9d4!important;font-size:9px!important;font-weight:800!important;}

/* Tabs */
.srAch139 .achTabs{
  gap:8px!important;margin:10px 2px 12px!important;padding:4px!important;
  border:1px solid #273d65!important;border-radius:15px!important;background:#081221!important;
  box-shadow:inset 0 2px 5px rgba(0,0,0,.52)!important;
}
.srAch139 .achTab{
  min-height:43px!important;border:1px solid transparent!important;border-radius:11px!important;
  background:transparent!important;color:#7f90ad!important;font-size:12px!important;font-weight:900!important;
  letter-spacing:.2px!important;box-shadow:none!important;
}
.srAch139 .achTab.on{
  border-color:#56a9ff!important;
  background:linear-gradient(180deg,#328bec,#1b5eb5)!important;
  color:#fff!important;
  text-shadow:0 2px 0 #0a3472!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.46),0 0 0 1px rgba(70,160,255,.22),0 0 18px rgba(61,151,255,.36)!important;
}

/* Categories + lane headings */
.srAch139 .achCatTitle{
  margin:14px 3px 8px!important;padding:0 2px!important;
  font-family:var(--fd)!important;font-size:12px!important;letter-spacing:1.5px!important;
  color:#f0f4fc!important;text-shadow:0 1px 0 #000!important;
}
.srAch139 .achCategorySummary{
  display:inline-flex!important;align-items:center!important;margin-left:7px!important;padding:3px 7px!important;
  border:1px solid #334d77!important;border-radius:999px!important;background:#101d32!important;
  color:#86a4ce!important;font-size:8px!important;letter-spacing:.2px!important;
}
.srAch139 .achLaneHead{
  display:grid!important;grid-template-columns:1fr 54px 1fr!important;gap:8px!important;
  padding:0 9px 6px!important;color:#91a7c8!important;font-size:9px!important;letter-spacing:1px!important;
  text-align:center!important;
}
.srAch139 .achLaneHead span:first-child{grid-column:2!important;font-size:0!important;}
.srAch139 .achLaneHead span:first-child:after{content:"PALIER";font-size:7px;color:#6982aa;}
.srAch139 .achLaneHead span:nth-child(2){grid-column:1!important;grid-row:1!important;color:#9bc9ff!important;}
.srAch139 .achLaneHead span:nth-child(3){grid-column:3!important;grid-row:1!important;color:#ffd36b!important;}

/* Progression ladder */
.srAch139 [data-ach-floor-overview-v138]{position:relative!important;isolation:isolate;}
.srAch139 [data-ach-floor-overview-v138]:before{
  content:"";position:absolute;z-index:-1;top:80px;bottom:18px;left:50%;width:5px;transform:translateX(-50%);
  border-radius:999px;background:linear-gradient(180deg,#65bcff,#6e63ff 46%,#283f6c 100%);
  box-shadow:0 0 10px rgba(73,151,255,.45),inset 0 0 0 1px rgba(255,255,255,.2);
}
.srAch139 .achPassRow{
  position:relative!important;
  display:grid!important;
  grid-template-columns:minmax(0,1fr) 54px minmax(0,1fr)!important;
  grid-template-rows:auto 1fr!important;
  gap:7px 8px!important;
  align-items:stretch!important;
  margin:8px 0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}
.srAch139 .achObjective{
  grid-column:2!important;grid-row:1 / span 2!important;align-self:center!important;justify-self:center!important;
  z-index:3!important;width:52px!important;min-height:52px!important;padding:7px 4px!important;
  display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;
  border:2px solid #507ab8!important;border-radius:999px!important;
  background:radial-gradient(circle at 35% 28%,#253f6c,#111f3b 72%)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 0 0 3px #081324,0 3px 9px rgba(0,0,0,.48)!important;
  text-align:center!important;
}
.srAch139 .achObjective b{
  max-width:44px!important;font-size:7.5px!important;line-height:1.08!important;color:#e9f1ff!important;
  overflow:hidden!important;display:-webkit-box!important;-webkit-line-clamp:3!important;-webkit-box-orient:vertical!important;
}
.srAch139 .achObjective small{
  margin-top:3px!important;font-size:6.5px!important;line-height:1.05!important;color:#78a7e8!important;
  white-space:normal!important;
}
.srAch139 .achReward{
  grid-column:1!important;grid-row:1 / span 2!important;
  min-width:0!important;min-height:92px!important;padding:10px!important;
  border:1px solid #335b90!important;border-radius:14px!important;
  background:
    linear-gradient(135deg,rgba(76,165,255,.12),transparent 47%),
    linear-gradient(180deg,#1a3156,#10213d)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.13),inset 0 -1px 0 rgba(0,0,0,.45),0 5px 12px rgba(0,0,0,.24)!important;
  display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:8px!important;
}
.srAch139 .achReward.premium{
  grid-column:3!important;grid-row:1 / span 2!important;
  border:1px solid #9a6714!important;
  border-left:1px solid #9a6714!important;
  border-radius:14px!important;
  background:
    radial-gradient(100% 90% at 100% 0,rgba(255,210,93,.16),transparent 55%),
    linear-gradient(180deg,#40331d,#282016)!important;
  box-shadow:inset 0 1px 0 rgba(255,238,174,.2),inset 0 -1px 0 rgba(0,0,0,.5),0 5px 12px rgba(0,0,0,.26),0 0 12px rgba(255,184,42,.07)!important;
  padding-left:10px!important;
}
.srAch139 .achReward:before{
  content:"✦";display:grid;place-items:center;width:27px;height:27px;flex:0 0 auto;
  border-radius:9px;background:linear-gradient(180deg,#2f72bd,#17457d);color:#bfe3ff;
  border:1px solid #5faeff;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 2px 6px rgba(0,0,0,.25);
  font-size:13px;
}
.srAch139 .achReward.premium:before{
  content:"♛";background:linear-gradient(180deg,#ffd661,#c87d11);color:#3b2303;border-color:#ffd977;
  box-shadow:inset 0 1px 0 #fff3bd,0 2px 7px rgba(0,0,0,.3),0 0 10px rgba(255,190,44,.22);
}
.srAch139 .achRewardText{
  margin-top:-31px!important;padding-left:36px!important;min-height:29px!important;
  color:#e5effd!important;font-size:10px!important;line-height:1.24!important;font-weight:800!important;
  display:flex!important;align-items:center!important;
}
.srAch139 .achReward.premium .achRewardText{color:#ffe2a0!important;}
.srAch139 .achReward .btn{
  min-height:31px!important;padding:6px 7px!important;border-radius:9px!important;font-size:9px!important;
}
.srAch139 .achReward:not(.premium) .btn{
  --bA:#66bdff!important;--bB:#2d78d0!important;--bS:#16477e!important;--bE:#ccecff!important;--bT:#fff!important;--bSh:0 2px 0 #0b3566!important;
}
.srAch139 .achReward.premium .btn{
  --bA:#ffe071!important;--bB:#f2a91d!important;--bS:#9a5b05!important;--bE:#fff4bc!important;--bT:#2a1802!important;--bSh:0 1px 0 #fff2a8!important;
}
.srAch139 .achState{
  min-height:31px!important;border-radius:9px!important;border:1px solid #35547e!important;
  background:#0d1a2d!important;color:#8298b8!important;font-size:8.5px!important;
}
.srAch139 .achState.done{
  color:#a5f3b0!important;border-color:#287647!important;background:linear-gradient(180deg,#153b29,#0d281c)!important;
  box-shadow:inset 0 1px 0 rgba(141,240,164,.14)!important;
}
.srAch139 .achState.done:before{content:"✓";margin-right:5px;color:#62e77f;font-size:12px;}
.srAch139 .achState.locked{
  color:#c6a75e!important;border-color:#6e5423!important;background:linear-gradient(180deg,#2a2418,#1a1711)!important;
}
.srAch139 .achState.locked:before{content:"🔒";font-size:10px;margin-right:4px;}

/* Challenge view keeps the same premium/free treatment but without the long ladder */
.srAch139:not(:has([data-ach-floor-overview-v138])) .achPassRow .achObjective{border-color:#49628a!important;}

/* Bottom explanation becomes a premium banner */
.srAch139 .achPassNote{
  position:relative!important;margin:13px 2px 5px!important;padding:11px 12px 11px 42px!important;
  border:1px solid #705328!important;border-radius:13px!important;
  background:linear-gradient(90deg,#1c1a18,#241e15 62%,#322616)!important;
  color:#aeb9cc!important;font-size:9px!important;line-height:1.4!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;
}
.srAch139 .achPassNote:before{
  content:"♛";position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:20px;color:#ffc84e;
  text-shadow:0 0 10px rgba(255,190,44,.4);
}
.srAch139 .achPassNote b{color:#ffd679!important;}
.srAch139 .mt10>.btn.ghost{margin-top:4px!important;opacity:.78!important;}

/* Arena launcher: visible enough to feel like a real feature, still out of the way */
#srAchArenaLauncher138{
  right:max(5px,env(safe-area-inset-right))!important;
  top:40%!important;
  width:58px!important;min-height:99px!important;padding:8px 5px 9px!important;
  border:2px solid #32558e!important;border-right:0!important;border-radius:17px 0 0 17px!important;
  background:
    radial-gradient(circle at 45% 18%,rgba(101,174,255,.24),transparent 35%),
    linear-gradient(180deg,#1b3563,#101e39 58%,#0a1528)!important;
  color:#dcecff!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 0 0 2px rgba(5,12,24,.45),0 6px 18px rgba(0,0,0,.46),0 0 16px rgba(64,145,255,.17)!important;
}
#srAchArenaLauncher138:before{
  content:"";position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:7px;height:30px;border-radius:999px;
  background:linear-gradient(180deg,#ffd957 0 58%,#1a2943 58% 100%);border:1px solid #071122;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.55),0 0 7px rgba(255,190,40,.18);
}
#srAchArenaLauncher138 .srAchLaunchMark{
  width:35px!important;height:35px!important;margin:0 auto 4px!important;border-radius:11px!important;
  background:linear-gradient(180deg,#ffd966,#d78c15)!important;border:1px solid #fff0a7!important;
  color:transparent!important;font-size:0!important;
  box-shadow:inset 0 2px 0 rgba(255,255,255,.48),0 3px 7px rgba(0,0,0,.35),0 0 12px rgba(255,190,42,.19)!important;
}
#srAchArenaLauncher138 .srAchLaunchMark:after{content:"♛";color:#392104;font-size:21px;line-height:1;}
#srAchArenaLauncher138 .srAchLaunchLabel{font-size:7.5px!important;letter-spacing:1px!important;color:#bcd7fa!important;}
#srAchArenaLauncher138 .srAchLaunchProgress{position:relative;z-index:2;margin-top:35px!important;font-size:7px!important;color:#eef5ff!important;font-weight:900!important;}
#srAchArenaLauncher138 .srAchLaunchBadge{
  left:-7px!important;top:-7px!important;min-width:19px!important;height:19px!important;
  background:linear-gradient(180deg,#ff646b,#cf2732)!important;color:#fff!important;border:2px solid #fff!important;
  box-shadow:0 2px 6px rgba(0,0,0,.45)!important;
}

@media(max-width:430px){
  #overlay:has(.srAch139)>.card{width:96vw!important;border-radius:20px!important;}
  #overlay:has(.srAch139)>.card>.mbody{padding:9px!important;}
  .srAch139 .achPassHero{padding:16px 12px 12px!important;}
  .srAch139 .achPassTitle{font-size:21px!important;}
  .srAch139 .achPassSub{font-size:9.5px!important;}
  .srAch139 .achPassPrice{min-width:92px!important;padding:7px 8px!important;font-size:10px!important;}
  .srAch139 .achPassRow{grid-template-columns:minmax(0,1fr) 48px minmax(0,1fr)!important;gap:6px!important;}
  .srAch139 .achLaneHead{grid-template-columns:1fr 48px 1fr!important;gap:6px!important;}
  .srAch139 .achObjective{width:46px!important;min-height:48px!important;padding:6px 3px!important;}
  .srAch139 .achObjective b{max-width:40px!important;font-size:6.8px!important;}
  .srAch139 .achObjective small{font-size:6px!important;}
  .srAch139 .achReward{min-height:88px!important;padding:8px!important;}
  .srAch139 .achRewardText{font-size:9px!important;padding-left:33px!important;}
  #srAchArenaLauncher138{right:0!important;width:55px!important;min-height:94px!important;}
}
@media(max-width:350px){
  .srAch139 .achPassTop{align-items:flex-start!important;}
  .srAch139 .achPassPrice{min-width:82px!important;font-size:9px!important;}
  .srAch139 .achPassRow{grid-template-columns:minmax(0,1fr) 42px minmax(0,1fr)!important;gap:4px!important;}
  .srAch139 .achLaneHead{grid-template-columns:1fr 42px 1fr!important;gap:4px!important;}
  .srAch139 .achObjective{width:40px!important;min-height:44px!important;}
  .srAch139 .achReward{padding:7px!important;}
  .srAch139 .achReward:before{width:24px;height:24px!important;}
  .srAch139 .achRewardText{margin-top:-28px!important;padding-left:29px!important;font-size:8.2px!important;}
}
`;
document.head.appendChild(s);
})();
