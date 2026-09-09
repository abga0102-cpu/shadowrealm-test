/* SHADOWREACH · Rebirth Spectacle V222
   Compact, high-impact Rebirth presentation. UI-only: keeps every existing
   Rebirth formula, price, action, save field and progression rule unchanged. */
(function(){
'use strict';
if(window.__srRebirthSpectacleV222)return;window.__srRebirthSpectacleV222=true;
var st=document.createElement('style');st.id='srRebirthSpectacleV222';st.textContent=`
[data-sr-route="rebirth"]{--rb:#9B5CF6;--rb2:#D7B5FF;padding-bottom:2px}
[data-sr-route="rebirth"] .srRbPad{padding:5px 8px 2px}
[data-sr-route="rebirth"] .srRbHero{position:relative;overflow:hidden;min-height:116px;padding:10px 10px 9px;border:1px solid #9B5CF688;border-radius:14px;background:radial-gradient(circle at 50% 20%,#9B5CF638 0,#17122a 42%,#090d17 100%);box-shadow:inset 0 0 28px #9B5CF618,0 0 18px #9B5CF61f}
[data-sr-route="rebirth"] .srRbHero:before,[data-sr-route="rebirth"] .srRbHero:after{content:"";position:absolute;border-radius:50%;pointer-events:none}
[data-sr-route="rebirth"] .srRbHero:before{width:150px;height:150px;left:calc(50% - 75px);top:-76px;border:1px solid #d7b5ff55;box-shadow:0 0 22px #9B5CF655,inset 0 0 22px #9B5CF633;animation:srRbSpin 8s linear infinite}
[data-sr-route="rebirth"] .srRbHero:after{width:7px;height:7px;left:14%;top:24%;background:#d7b5ff;box-shadow:62px 30px 0 #9B5CF6,142px -3px 0 #d7b5ff,210px 35px 0 #9B5CF6,278px 5px 0 #d7b5ff;animation:srRbDust 2.4s ease-in-out infinite alternate}
[data-sr-route="rebirth"] .srRbCore{position:relative;z-index:1;display:flex;align-items:center;gap:10px}
[data-sr-route="rebirth"] .srRbOrb{width:58px;height:58px;flex:0 0 58px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,#f4e7ff 0 7%,#b778ff 17%,#5b1aa2 48%,#170725 72%);border:2px solid #d7b5ff;box-shadow:0 0 8px #fff8,0 0 25px #9B5CF6aa,inset 0 0 18px #fff5;animation:srRbPulse 1.8s ease-in-out infinite}
[data-sr-route="rebirth"] .srRbOrb svg{width:28px;height:28px;filter:drop-shadow(0 0 5px #fff)}
[data-sr-route="rebirth"] .srRbTitle{font-size:17px;font-weight:950;letter-spacing:1.2px;color:#f1e5ff;text-shadow:0 0 12px #9B5CF6}
[data-sr-route="rebirth"] .srRbStats{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:7px}
[data-sr-route="rebirth"] .srRbStat{padding:4px 3px;border-radius:7px;background:#080b14b8;border:1px solid #9B5CF633;text-align:center;font-size:8px;color:#9aa8c0}
[data-sr-route="rebirth"] .srRbStat b{display:block;color:#e8d6ff;font-size:10.5px;margin-top:1px}
[data-sr-route="rebirth"] .srRbAction{position:relative;z-index:2;margin-top:7px}.srRbAction .btn{min-height:32px!important;box-shadow:0 0 15px #9B5CF655!important}
[data-sr-route="rebirth"] .srRbProgress{margin-top:6px}
[data-sr-route="rebirth"] .srRbHead{display:flex;align-items:center;justify-content:space-between;margin:8px 1px 5px;font-size:9px;font-weight:900;letter-spacing:.9px;color:#cdb1ee}
[data-sr-route="rebirth"] .srRbGrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px!important}
[data-sr-route="rebirth"] .srRbUp{min-width:0;height:45px;padding:4px 5px;border-radius:9px;border:1px solid #263653;background:linear-gradient(135deg,#111827,#0b101b);display:flex;align-items:center;gap:5px;position:relative;overflow:hidden}
[data-sr-route="rebirth"] .srRbUp.ready{border-color:#9B5CF677;background:linear-gradient(135deg,#211332,#0e111c);box-shadow:inset 0 0 12px #9B5CF612}
[data-sr-route="rebirth"] .srRbUp.max{border-color:#3FB95066;background:linear-gradient(135deg,#10231a,#0b1110)}
[data-sr-route="rebirth"] .srRbIco{width:25px;height:25px;flex:0 0 25px;border-radius:7px;display:grid;place-items:center;border:1px solid #9B5CF666;background:#9B5CF618;color:#d9bdff}
[data-sr-route="rebirth"] .srRbIco svg{width:14px;height:14px}
[data-sr-route="rebirth"] .srRbTxt{min-width:0;flex:1}.srRbName{font-size:9px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.srRbVal{font-size:7.5px;color:#8897b2;white-space:nowrap}
[data-sr-route="rebirth"] .srRbBuy{flex:0 0 auto;min-width:33px;height:26px!important;min-height:26px!important;padding:2px 5px!important;font-size:8px!important;width:auto!important;border-radius:7px!important}
[data-sr-route="rebirth"] .srRbMax{font-size:7.5px;font-weight:900;color:#69df86;border:1px solid #3FB95066;border-radius:6px;padding:2px 4px}
@keyframes srRbPulse{50%{transform:scale(1.06);box-shadow:0 0 12px #fff9,0 0 34px #9B5CF6dd,inset 0 0 22px #fff6}}
@keyframes srRbSpin{to{transform:rotate(360deg)}}@keyframes srRbDust{to{transform:translateY(7px);opacity:.45}}
@media(max-height:700px){[data-sr-route="rebirth"] .srRbHero{min-height:102px;padding:7px}[data-sr-route="rebirth"] .srRbOrb{width:48px;height:48px;flex-basis:48px}[data-sr-route="rebirth"] .srRbTitle{font-size:15px}[data-sr-route="rebirth"] .srRbUp{height:40px}[data-sr-route="rebirth"] .srRbStats{margin-top:4px}[data-sr-route="rebirth"] .srRbAction{margin-top:4px}}
@media(prefers-reduced-motion:reduce){[data-sr-route="rebirth"] .srRbHero:before,[data-sr-route="rebirth"] .srRbHero:after,[data-sr-route="rebirth"] .srRbOrb{animation:none!important}}
`;
document.head.appendChild(st);
function render(){
 var ok=canRebirth(),bonus=rb(S,'prgain'),pr=Math.floor(prFromFloor(S.floor)*(1+bonus/100)),keep=rebirthKeepPct(S.rebirth.upgrades.keep||0),after=floorAfterRebirth(S);
 var action=ok?btn(ic('cycle',14)+' RENAÎTRE · +'+fmt(pr)+' PR',{cls:'purple',small:true,act:'doRebirth'}):btn(ic('cycle',14)+' ÉTAGE '+RULES.REBIRTH_UNLOCK_FLOOR+' REQUIS',{cls:'purple',small:true,act:'doRebirth',dis:true});
 var progress=ok?'':'<div class="srRbProgress">'+meter(Math.min(100,S.floor/RULES.REBIRTH_UNLOCK_FLOOR*100),C.purple,S.floor+' / '+RULES.REBIRTH_UNLOCK_FLOOR)+'</div>';
 var upgrades=REBIRTH_UPGRADES.map(function(u){var lvl=S.rebirth.upgrades[u.key]||0,max=lvl>=u.max,cost=max?0:rebirthUpgCost(u,lvl),ready=!max&&S.rebirth.pr>=cost,val=(lvl*u.perLvl).toFixed(u.perLvl<1?2:0)+u.unit;return '<div class="srRbUp '+(max?'max':ready?'ready':'')+'"><div class="srRbIco">'+ic(u.icon,13)+'</div><div class="srRbTxt"><div class="srRbName">'+u.label+' <span class="mute">'+lvl+'/'+u.max+'</span></div><div class="srRbVal">+'+val+(max?'':' · prochain +'+((lvl+1)*u.perLvl).toFixed(u.perLvl<1?2:0)+u.unit)+'</div></div>'+(max?'<span class="srRbMax">MAX</span>':btn(fmt(cost),{small:true,cls:'purple',act:'buyRebirth',arg:u.key,dis:!ready,style:'',primary:ready}).replace('class="btn','class="srRbBuy btn'))+'</div>';}).join('');
 return '<div data-sr-route="rebirth" class="srRebirthV222">'+topbar('Rebirth','<span class="pill" style="color:var(--purpleLit);border-color:var(--purple)">'+ic('cycle',11)+fmt(S.rebirth.pr)+' PR</span>')+'<div class="srRbPad"><div class="srRbHero"><div class="srRbCore"><div class="srRbOrb">'+ic('cycle',28)+'</div><div class="flex1"><div class="srRbTitle">REBIRTH '+S.rebirth.count+'</div><div class="mute" style="font-size:8.5px;margin-top:2px">'+(ok?'La renaissance est prête.':'Atteins l’étage '+RULES.REBIRTH_UNLOCK_FLOOR+' pour renaître.')+'</div><div class="srRbStats"><div class="srRbStat">GAIN<b>+'+fmt(pr)+' PR</b></div><div class="srRbStat">ÉTAGE<b>'+S.floor+' → '+after+'</b></div><div class="srRbStat">CONSERVÉ<b>'+keep+'%</b></div></div></div></div>'+progress+'<div class="srRbAction">'+action+'</div></div><div class="srRbHead"><span>AMÉLIORATIONS PERMANENTES</span><span>'+fmt(S.warScore)+' PG</span></div><div class="srRbGrid">'+upgrades+'</div></div></div>';
}
try{window.scrRebirth=render;if(typeof SCREENS!=='undefined'&&SCREENS)SCREENS.rebirth=render;}catch(_){ }
})();