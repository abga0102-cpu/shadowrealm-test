/* SHADOWREACH · Progression Pass launcher compact visual v332
   Presentation-only override for the Arena shortcut.
   Keeps the Pass easy to access without competing with combat information. */
(function(){
'use strict';
if(window.__srAccomplishmentsLauncherCompactV332)return;
window.__srAccomplishmentsLauncherCompactV332=true;
var s=document.createElement('style');
s.id='srAccomplishmentsLauncherCompactV332Style';
s.textContent=`
#srAchArenaLauncher138{
  right:0!important;
  top:43%!important;
  width:44px!important;
  min-height:86px!important;
  padding:6px 4px 6px!important;
  border-radius:14px 0 0 14px!important;
  border:1px solid rgba(105,130,205,.58)!important;
  border-right:0!important;
  background:linear-gradient(180deg,rgba(25,42,83,.94),rgba(12,24,53,.94))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 4px 12px rgba(0,0,0,.30)!important;
  opacity:.86!important;
}
#srAchArenaLauncher138:before{
  inset:3px 0 3px 3px!important;
  border-radius:10px 0 0 10px!important;
  border-color:rgba(166,190,255,.14)!important;
}
#srAchArenaLauncher138 .srAchLaunchMark{
  width:28px!important;
  height:25px!important;
  margin:0 auto 5px!important;
  border-radius:8px!important;
  font-size:16px!important;
  background:linear-gradient(180deg,#e9bd48,#b87713)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.38),0 2px 5px rgba(0,0,0,.28)!important;
  filter:none!important;
}
#srAchArenaLauncher138 .srAchLaunchLabel,
#srAchArenaLauncher138 .srAchLaunchStage{display:none!important;}
#srAchArenaLauncher138 .srAchLaunchTrack{
  width:8px!important;
  height:30px!important;
  margin:1px auto 4px!important;
  padding:1px!important;
  border-radius:7px!important;
  border-color:rgba(166,190,255,.34)!important;
  background:#0a1328!important;
}
#srAchArenaLauncher138 .srAchLaunchTrack i{
  left:1px!important;
  right:1px!important;
  bottom:1px!important;
  border-radius:6px!important;
  background:linear-gradient(180deg,#e9c85a,#d99a18)!important;
  box-shadow:none!important;
}
#srAchArenaLauncher138 .srAchLaunchProgress{
  font-size:7px!important;
  color:#b9c6df!important;
  font-weight:800!important;
}
#srAchArenaLauncher138 .srAchLaunchBadge{
  left:-5px!important;
  top:-5px!important;
  min-width:16px!important;
  height:16px!important;
  padding:0 3px!important;
  border-width:1px!important;
  font-size:8px!important;
  box-shadow:0 2px 5px rgba(0,0,0,.35)!important;
}
#srAchArenaLauncher138:has(.srAchLaunchBadge){
  opacity:1!important;
  border-color:rgba(124,153,238,.82)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.13),0 5px 14px rgba(0,0,0,.35)!important;
}
#srAchArenaLauncher138:active{
  transform:translateY(calc(-50% + 1px)) scale(.97)!important;
  opacity:1!important;
}
@media(max-width:430px){
  #srAchArenaLauncher138{width:40px!important;min-height:80px!important;padding:5px 3px!important;}
  #srAchArenaLauncher138 .srAchLaunchMark{width:25px!important;height:23px!important;font-size:15px!important;}
  #srAchArenaLauncher138 .srAchLaunchTrack{height:27px!important;}
}
`;
document.head.appendChild(s);
try{
 if(!window.__srFusionGoldRewardsV355){
  var r=document.createElement('script');
  r.src='fusion-gold-rewards-v352.js?v=2026.09.17.355';
  r.async=false;
  document.body.appendChild(r);
 }
}catch(_){}
})();
