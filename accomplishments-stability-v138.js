/* SHADOWREACH · Accomplishments entry / Arena launcher stability v138
   - Prevent the legacy text-based Development detector from mounting the card on Accueil.
   - Mount Accomplissements only on the canonical Development route.
   - Mount one compact Progression Pass launcher on the right edge of Accueil/Arena.
   - Canonical Accomplishments / Pass modal rendering belongs exclusively to v139.
   - V331 adds a presentation-only premium visual layer without changing payouts or progression.
   - Reconcile from the canonical BottomNav + modal lifecycle, without observers or render wrappers. */
(function(){
'use strict';
if(window.__srAccomplishmentsStabilityV138)return;window.__srAccomplishmentsStabilityV138=true;

/* v124 detects the word "Developpement" anywhere in #screen. Accueil contains
   a navigation tile with that word, so the old detector incorrectly inserts
   Accomplissements above the Forge. Stop only that UI injector. */
window.__srAccomplishmentsUIV124=true;

function activeRoute(id){
 try{
  if(typeof route!=='undefined'&&route===id)return true;
  return !!document.querySelector('#tabs .tab.on[data-arg="'+id+'"],#tabs .tab.active[data-arg="'+id+'"],#tabs .tab[aria-current="page"][data-arg="'+id+'"]');
 }catch(_){return false;}
}
function activeDevelopmentRoute(){return activeRoute('developpement');}
function activeHomeRoute(){return activeRoute('accueil');}
function realDevelopmentScreen(){var s=document.getElementById('screen');return !!s&&activeDevelopmentRoute();}
function openAchievements(e){
 if(e){e.preventDefault();e.stopPropagation();}
 try{if(typeof ACT!=='undefined'&&ACT&&typeof ACT.accomplishments==='function')ACT.accomplishments();}catch(_){}
}
function launcherState(){
 try{if(typeof window.__srAccomplishmentsLauncherStateV139==='function')return window.__srAccomplishmentsLauncherStateV139();}catch(_){}
 var floor=1;try{floor=Math.max(1,Number(S&&S.recordFloor)||1);}catch(_){}
 return {done:0,total:10,claimable:0,stage:(typeof window.__srCampaignStageLabel==='function'?window.__srCampaignStageLabel(floor):String(floor))};
}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch];});}
function ensureStyle(){
 if(document.getElementById('srAchLauncherV138Style'))return;
 var st=document.createElement('style');st.id='srAchLauncherV138Style';st.innerHTML='\
#srAchArenaLauncher138{--srPassFill:0%;position:fixed;right:max(7px,env(safe-area-inset-right));top:43%;transform:translateY(-50%);z-index:54;width:62px;min-height:128px;padding:8px 6px 7px;border-radius:18px 0 0 18px;border:2px solid #5c75d9;border-right:0;background:radial-gradient(circle at 50% 10%,rgba(122,99,255,.55),transparent 32%),linear-gradient(180deg,#243a79 0%,#17275a 50%,#101b3c 100%);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.25),inset 0 -10px 18px rgba(1,7,25,.25),0 8px 22px rgba(0,0,0,.48),0 0 18px rgba(75,108,255,.2);font:800 9px/1.05 system-ui,-apple-system,sans-serif;letter-spacing:.55px;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent;overflow:visible}\
#srAchArenaLauncher138:before{content:"";position:absolute;inset:4px 0 4px 4px;border-radius:13px 0 0 13px;border:1px solid rgba(172,197,255,.28);pointer-events:none}\
#srAchArenaLauncher138 .srAchLaunchMark{position:relative;z-index:1;display:grid;place-items:center;width:39px;height:34px;margin:0 auto 5px;border-radius:12px 12px 9px 9px;background:linear-gradient(180deg,#ffd85a,#e79b14);color:#342000;font-size:21px;line-height:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 0 13px rgba(255,196,45,.26)}\
#srAchArenaLauncher138 .srAchLaunchLabel{position:relative;z-index:1;display:block;font-size:8px;color:#eef4ff;text-shadow:0 1px 2px #07112d;letter-spacing:1px}\
#srAchArenaLauncher138 .srAchLaunchStage{position:relative;z-index:1;display:block;margin:3px auto 5px;color:#b8c9ff;font-size:8px;letter-spacing:0}\
#srAchArenaLauncher138 .srAchLaunchTrack{position:relative;z-index:1;display:block;width:13px;height:42px;margin:2px auto 4px;padding:2px;border-radius:9px;background:#0a1330;border:1px solid rgba(166,190,255,.5);box-shadow:inset 0 2px 4px rgba(0,0,0,.55)}\
#srAchArenaLauncher138 .srAchLaunchTrack i{position:absolute;left:2px;right:2px;bottom:2px;height:var(--srPassFill);max-height:calc(100% - 4px);border-radius:7px;background:linear-gradient(180deg,#ffe36b,#ffb41f);box-shadow:0 0 8px rgba(255,197,42,.65)}\
#srAchArenaLauncher138 .srAchLaunchProgress{position:relative;z-index:1;display:block;color:#fff;font-size:9px;letter-spacing:0;white-space:nowrap}\
#srAchArenaLauncher138 .srAchLaunchBadge{position:absolute;left:-7px;top:-7px;z-index:3;min-width:19px;height:19px;padding:0 4px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(180deg,#ff6470,#e62d42);color:#fff;border:2px solid #091331;font-size:9px;box-shadow:0 2px 7px rgba(0,0,0,.4)}\
#srAchArenaLauncher138:active{transform:translateY(calc(-50% + 1px)) scale(.97);filter:brightness(1.06)}\
#overlay.srPassOverlay331{position:fixed!important;inset:0!important;z-index:1000!important;background:rgba(3,7,18,.73)!important;backdrop-filter:blur(5px)}\
#overlay.srPassOverlay331>.card{width:min(94vw,820px)!important;max-width:820px!important;max-height:min(92dvh,900px)!important;padding:0!important;border-radius:23px!important;border:1px solid #39508e!important;background:linear-gradient(180deg,#101b38 0%,#0b142b 100%)!important;box-shadow:0 28px 80px rgba(0,0,0,.65),0 0 0 1px rgba(128,157,255,.12),inset 0 1px 0 rgba(255,255,255,.08)!important;overflow:hidden!important}\
#overlay.srPassOverlay331>.card>.mhead{display:none!important}\
#overlay.srPassOverlay331>.card>.mbody{max-height:min(92dvh,900px)!important;padding:14px 15px 16px!important;background:radial-gradient(circle at 50% -12%,rgba(78,99,224,.20),transparent 35%)!important}\
#overlay.srPassOverlay331 .srAch139{position:relative;--achGold:#ffc53f;--achBlue:#5b8dff;color:#eef4ff!important;padding-top:10px}\
#overlay.srPassOverlay331 .srAch139 .achPassHero{position:relative!important;overflow:visible!important;margin:10px 0 12px!important;padding:28px 64px 16px!important;border:1px solid #435b9c!important;border-radius:20px!important;background:radial-gradient(circle at 50% 0,rgba(107,88,255,.35),transparent 42%),linear-gradient(180deg,#1a2a59 0%,#121f43 100%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 8px 25px rgba(0,0,0,.26)!important;text-align:center}\
#overlay.srPassOverlay331 .srPassCrown331{position:absolute;left:50%;top:-27px;transform:translateX(-50%);width:62px;height:52px;display:grid;place-items:center;border-radius:18px;background:linear-gradient(180deg,#ffe06b,#f1a824);border:3px solid #5a3600;color:#493000;font-size:31px;line-height:1;box-shadow:inset 0 2px 0 rgba(255,255,255,.65),0 7px 14px rgba(0,0,0,.35),0 0 18px rgba(255,191,35,.26)}\
#overlay.srPassOverlay331 .srPassClose331{position:absolute;right:10px;top:10px;width:42px;height:42px;border-radius:50%;border:2px solid #712839;background:linear-gradient(180deg,#ff6773,#e63a4d);color:#fff;font:900 24px/1 system-ui;box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 4px 10px rgba(0,0,0,.32);cursor:pointer}\
#overlay.srPassOverlay331 .srAch139 .achPassTop{display:block!important}.srAch139 .achPassPrice.srPassHeroPrice331{display:none!important}\
#overlay.srPassOverlay331 .srAch139 .achPassKicker{color:#9db8ff!important;font-size:9px!important;letter-spacing:2px!important}.srPassOverlay331 .srAch139 .achPassTitle{font-size:26px!important;line-height:1.05!important;color:#fff!important;text-shadow:0 2px 0 rgba(0,0,0,.34)!important}.srPassOverlay331 .srAch139 .achPassSub{max-width:500px;margin:7px auto 0!important;color:#b7c6e8!important;font-size:11px!important}\
#overlay.srPassOverlay331 .srAch139 .achPassMeter{height:9px!important;margin-top:13px!important;border:1px solid #394a78!important;background:#080f25!important}.srPassOverlay331 .srAch139 .achPassMeter>i{background:linear-gradient(90deg,#6c77ff,#63b4ff,#ffd44a)!important;box-shadow:0 0 9px rgba(83,151,255,.45)}.srPassOverlay331 .srAch139 .achPassMeta{color:#9aadd3!important;font-size:9px!important}\
#overlay.srPassOverlay331 .srAch139 .achTabs{gap:8px!important;margin:11px 0 12px!important}.srPassOverlay331 .srAch139 .achTab{min-height:44px!important;border:1px solid #30446f!important;border-radius:13px!important;background:linear-gradient(180deg,#172647,#101b35)!important;color:#8fa2c7!important;font-size:12px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important}.srPassOverlay331 .srAch139 .achTab.on{border-color:#5b8dff!important;background:linear-gradient(180deg,#416fe3,#284cb1)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 0 13px rgba(74,118,255,.30)!important}\
#overlay.srPassOverlay331 .srAch139 .achCatTitle{margin:13px 2px 7px!important;color:#e5ecff!important;font-size:11px!important;letter-spacing:1px!important}.srPassOverlay331 .srAch139 .achCategorySummary{color:#8397bf!important}\
#overlay.srPassOverlay331 .srAch139 .achLaneHead{grid-template-columns:minmax(0,1fr) 66px minmax(0,1fr)!important;gap:9px!important;padding:0 7px 7px!important;align-items:end!important;color:#8da1c9!important}.srPassOverlay331 .srAch139 .achLaneHead>span:nth-child(1){grid-column:2;grid-row:1;text-align:center;font-size:7px}.srPassOverlay331 .srAch139 .achLaneHead>span:nth-child(2){grid-column:1;grid-row:1;text-align:center;font-size:11px;color:#dbe7ff}.srPassOverlay331 .srAch139 .achLaneHead>span:nth-child(3){grid-column:3;grid-row:1;text-align:center;color:#ffd65c!important}\
#overlay.srPassOverlay331 .srLanePremium331{width:100%;border:1px solid #d8a42b;border-radius:12px;padding:7px 9px;background:linear-gradient(180deg,#ffd458,#f0aa21);color:#402800;font:900 11px/1.05 system-ui;box-shadow:inset 0 1px 0 rgba(255,255,255,.56),0 3px 10px rgba(162,102,0,.24);cursor:pointer}.srPassOverlay331 .srLanePremium331 small{display:block;margin-top:3px;font-size:9px;color:#65420b}\
#overlay.srPassOverlay331 .srAch139 .achPassRow.srPassFloor331{position:relative!important;display:grid!important;grid-template-columns:minmax(0,1fr) 66px minmax(0,1fr)!important;gap:9px!important;align-items:stretch!important;margin:0!important;padding:7px 0!important;border:0!important;border-radius:0!important;background:none!important;overflow:visible!important}.srPassOverlay331 .srAch139 .achPassRow.srPassFloor331:before{content:"";position:absolute;left:50%;top:0;bottom:0;width:4px;transform:translateX(-50%);background:linear-gradient(180deg,#496fe2,#6b8fff);box-shadow:0 0 8px rgba(79,119,255,.32);z-index:0}.srPassOverlay331 .srAch139 .achPassRow.srPassFloor331:first-of-type:before{top:50%}.srPassOverlay331 .srAch139 .achPassRow.srPassFloor331:last-of-type:before{bottom:50%}\
#overlay.srPassOverlay331 .srAch139 .srPassFloor331>.achReward:not(.premium){grid-column:1;grid-row:1}.srPassOverlay331 .srAch139 .srPassFloor331>.achObjective{grid-column:2;grid-row:1}.srPassOverlay331 .srAch139 .srPassFloor331>.achReward.premium{grid-column:3;grid-row:1}\
#overlay.srPassOverlay331 .srAch139 .srPassFloor331>.achObjective{position:relative;z-index:2;align-self:center;min-width:0!important;padding:5px 2px!important;border:2px solid #3c5799!important;border-radius:18px!important;background:linear-gradient(180deg,#1d3061,#111f45)!important;box-shadow:0 3px 9px rgba(0,0,0,.35)!important;text-align:center!important}.srPassOverlay331 .srAch139 .srPassFloor331>.achObjective.isDone{border-color:#68d981!important}.srPassOverlay331 .srAch139 .srPassFloor331.isCurrent>.achObjective{border-color:#65a6ff!important;box-shadow:0 0 0 2px rgba(95,150,255,.18),0 0 18px rgba(72,137,255,.55)!important}.srPassOverlay331 .srStageStatus331{display:block;width:19px;height:19px;margin:-13px auto 2px;border-radius:50%;background:#182b57;border:2px solid #4f6fb4;color:#89a7e6;font-size:11px;line-height:15px}.srPassOverlay331 .achObjective.isDone .srStageStatus331{background:#1d783f;border-color:#80ef99;color:#fff}.srPassOverlay331 .srStageLabel331{display:block;color:#fff;font-size:10px;font-weight:900;white-space:nowrap}.srPassOverlay331 .srStageDiff331{display:block;margin-top:2px;color:#8299c8;font-size:7px;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
#overlay.srPassOverlay331 .srAch139 .srPassFloor331>.achReward{min-width:0!important;padding:10px 9px!important;border:1px solid #344b78!important;border-radius:14px!important;background:linear-gradient(180deg,#20345d,#152541)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 4px 12px rgba(0,0,0,.22)!important;gap:8px!important}.srPassOverlay331 .srAch139 .srPassFloor331>.achReward.premium{border:1px solid #9b6d20!important;border-radius:14px!important;background:radial-gradient(circle at 85% 0,rgba(255,201,70,.14),transparent 40%),linear-gradient(180deg,#4a381d,#2c2519)!important;box-shadow:inset 0 1px 0 rgba(255,237,183,.12),0 4px 12px rgba(0,0,0,.22)!important}.srPassOverlay331 .srAch139 .srPassFloor331.isCurrent>.achReward:not(.premium){border-color:#4f8cff!important;box-shadow:0 0 15px rgba(67,126,255,.23)!important}.srPassOverlay331 .srAch139 .srPassFloor331.isCurrent>.achReward.premium{border-color:#e7ad32!important;box-shadow:0 0 15px rgba(255,184,43,.20)!important}\
#overlay.srPassOverlay331 .srAch139 .achRewardText.srRewardVisual331{display:flex!important;align-items:center!important;gap:8px!important;color:#dce7fb!important;font-size:10px!important;line-height:1.25!important}.srPassOverlay331 .srAch139 .achReward.premium .achRewardText.srRewardVisual331{color:#ffe7a8!important}.srPassOverlay331 .srRewardIcon331{flex:0 0 auto;width:29px;height:29px;border-radius:10px;display:grid;place-items:center;border:1px solid #4d6ca5;background:linear-gradient(180deg,#2c4c85,#1b315b);color:#9fc8ff;font-size:17px;font-weight:900;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}.srPassOverlay331 .achReward.premium .srRewardIcon331{border-color:#b47a24;background:linear-gradient(180deg,#60461e,#3b2d18);color:#ffd45e}.srPassOverlay331 .srRewardIcon331.gold{color:#ffd75b}.srPassOverlay331 .srRewardIcon331.essence{color:#d58aff}.srPassOverlay331 .srRewardIcon331.eclat{color:#76d8ff}.srPassOverlay331 .srRewardIcon331.minerai{color:#83d3ff}.srPassOverlay331 .srRewardIcon331.piece{color:#ff9b62}.srPassOverlay331 .srRewardIcon331.key{color:#8ee2ba}.srPassOverlay331 .srRewardCopy331{min-width:0;overflow-wrap:anywhere}.srPassOverlay331 .srAch139 .achReward .btn{min-height:31px!important;border-radius:9px!important;font-size:9px!important;font-weight:850!important}.srPassOverlay331 .srAch139 .achReward.premium .btn{background:linear-gradient(180deg,#ffd157,#eca421)!important;color:#352100!important;border-color:#f2bf45!important}.srPassOverlay331 .srAch139 .achState{min-height:29px!important;border-radius:9px!important;background:rgba(8,15,32,.24)!important}.srPassOverlay331 .srAch139 .achState.done{color:#79e696!important;border-color:#397c55!important}.srPassOverlay331 .srAch139 .achState.locked{color:#e7c575!important;border-color:#745825!important;background:rgba(93,67,22,.18)!important}\
#overlay.srPassOverlay331 .srAch139 .achPassRow:not(.srPassFloor331){border:1px solid #2c426c!important;border-radius:14px!important;background:linear-gradient(180deg,#192a4c,#111e38)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important}.srPassOverlay331 .srAch139 .achPassRow:not(.srPassFloor331) .achReward.premium{background:rgba(167,116,26,.08)!important}.srPassOverlay331 .srAch139 .achPassRow:not(.srPassFloor331) .achObjective b{color:#eef4ff!important}\
#overlay.srPassOverlay331 .srAch139 .achPassNote{display:none!important}.srPassOverlay331 .srPassFooter331{position:sticky;bottom:-1px;z-index:8;margin-top:11px;padding:10px 11px;border:1px solid #354d80;border-radius:14px;background:linear-gradient(180deg,rgba(25,42,78,.98),rgba(14,25,49,.98));box-shadow:0 -7px 20px rgba(4,9,22,.42),inset 0 1px 0 rgba(255,255,255,.06)}.srPassOverlay331 .srPassFooterTop331{display:flex;align-items:center;justify-content:space-between;gap:8px;color:#eaf1ff;font-size:10px;font-weight:850}.srPassOverlay331 .srPassFooterTrack331{height:10px;margin-top:7px;padding:2px;border-radius:8px;border:1px solid #384d77;background:#091229;box-sizing:border-box}.srPassOverlay331 .srPassFooterTrack331 i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#536eff,#58b2ff,#ffd24b);box-shadow:0 0 9px rgba(84,142,255,.32)}.srPassOverlay331 .srPassFooterStage331{color:#9bb4e5;font-size:9px;font-weight:750}\
#overlay.srPassOverlay331 .srAch139>.mt10{margin-top:8px!important}.srPassOverlay331 .srAch139>.mt10 .btn{border-radius:12px!important;min-height:40px!important}\
@media(max-width:560px){#srAchArenaLauncher138{right:0;width:58px;min-height:119px;border-radius:17px 0 0 17px}.srPassOverlay331>.card>.mbody{padding:12px 10px 13px!important}.srPassOverlay331 .srAch139 .achPassHero{padding:25px 50px 13px!important;border-radius:18px!important}.srPassOverlay331 .srAch139 .achPassTitle{font-size:22px!important}.srPassOverlay331 .srAch139 .achPassSub{font-size:10px!important}.srPassOverlay331 .srPassClose331{right:7px;top:7px;width:38px;height:38px;font-size:21px}.srPassOverlay331 .srPassCrown331{width:54px;height:46px;top:-23px;font-size:27px}.srPassOverlay331 .srAch139 .achLaneHead,.srPassOverlay331 .srAch139 .achPassRow.srPassFloor331{grid-template-columns:minmax(0,1fr) 56px minmax(0,1fr)!important;gap:6px!important}.srPassOverlay331 .srAch139 .srPassFloor331>.achReward{padding:8px 7px!important;border-radius:12px!important}.srPassOverlay331 .srRewardIcon331{width:25px;height:25px;border-radius:8px;font-size:14px}.srPassOverlay331 .srAch139 .achRewardText.srRewardVisual331{gap:6px!important;font-size:9px!important}.srPassOverlay331 .srStageLabel331{font-size:9px}.srPassOverlay331 .srStageDiff331{font-size:6.5px}.srPassOverlay331 .srAch139 .achReward .btn{font-size:8px!important;padding:5px 4px!important}.srPassOverlay331 .srAch139 .achState{font-size:8px!important;padding:0 2px!important}.srPassOverlay331 .srLanePremium331{font-size:10px;padding:6px 4px}.srPassOverlay331 .srLanePremium331 small{font-size:8px}}\
@media(max-width:390px){.srPassOverlay331 .srAch139 .achLaneHead,.srPassOverlay331 .srAch139 .achPassRow.srPassFloor331{grid-template-columns:minmax(0,1fr) 50px minmax(0,1fr)!important;gap:5px!important}.srPassOverlay331 .srRewardIcon331{display:none}.srPassOverlay331 .srAch139 .achRewardText.srRewardVisual331{font-size:8.5px!important}.srPassOverlay331 .srAch139 .srPassFloor331>.achReward{padding:7px 5px!important}}\
@media(prefers-reduced-motion:reduce){#srAchArenaLauncher138{transition:none!important}.srPassOverlay331 *{animation:none!important;transition:none!important}}';
 document.head.appendChild(st);
}
function rewardKind(label){var s=String(label||'').toLowerCase();if(s.indexOf('or')>=0)return ['gold','●'];if(s.indexOf('essence')>=0)return ['essence','◆'];if(s.indexOf('étincelle')>=0||s.indexOf('etincelle')>=0)return ['eclat','✦'];if(s.indexOf('minerai')>=0)return ['minerai','⬟'];if(s.indexOf('pièce')>=0||s.indexOf('piece')>=0)return ['piece','⬢'];if(s.indexOf('clé')>=0||s.indexOf('cle')>=0)return ['key','⌑'];if(s.indexOf('boost')>=0)return ['boost','↗'];return ['generic','✧'];}
function enhanceReward(r){
 try{
  var copy=r.querySelector('.achRewardText');if(!copy||copy.getAttribute('data-sr-pass-reward-v331'))return;
  var label=copy.innerText||'',kind=rewardKind(label);copy.setAttribute('data-sr-pass-reward-v331','1');copy.classList.add('srRewardVisual331');
  copy.innerHTML='<span class="srRewardIcon331 '+kind[0]+'">'+kind[1]+'</span><span class="srRewardCopy331">'+esc(label)+'</span>';
 }catch(_){}
}
function enhanceFloorRows(root){
 try{
  var rows=root.querySelectorAll('.achPassRow[data-ach-floors-v138]'),currentSet=false;
  for(var i=0;i<rows.length;i++){
   var r=rows[i],obj=r.querySelector('.achObjective'),title=obj&&obj.querySelector('b'),small=obj&&obj.querySelector('small');if(!obj||!title)continue;
   var raw=title.innerText||'',state=small?(small.innerText||''):'',done=/Objectif atteint/i.test(state),parts=raw.split('·'),stage=parts.length>1?parts[parts.length-1].trim():raw,diff=(parts.length>1?parts[0]:raw).replace(/^Vaincre\s+/i,'').replace(/^Terminer\s+/i,'').trim();
   r.classList.add('srPassFloor331');if(done)r.classList.add('isDone');else if(!currentSet){r.classList.add('isCurrent');currentSet=true;}
   obj.classList.toggle('isDone',done);obj.setAttribute('title',raw);obj.innerHTML='<span class="srStageStatus331">'+(done?'✓':'•')+'</span><span class="srStageLabel331">'+esc(stage)+'</span><span class="srStageDiff331">'+esc(diff)+'</span>';
   var rewards=r.querySelectorAll('.achReward');for(var j=0;j<rewards.length;j++)enhanceReward(rewards[j]);
  }
 }catch(_){}
}
function enhanceOtherRewards(root){
 try{var rewards=root.querySelectorAll('.achPassRow:not([data-ach-floors-v138]) .achReward');for(var i=0;i<rewards.length;i++)enhanceReward(rewards[i]);}catch(_){}
}
function enhanceLane(root){
 try{
  var floorWrap=root.querySelector('[data-ach-floor-overview-v138]'),head=floorWrap&&floorWrap.querySelector('.achLaneHead');if(!head)return;
  var spans=head.children;if(spans&&spans.length>=3){spans[0].innerHTML='Palier';spans[1].innerHTML='Gratuit';spans[2].innerHTML='<button type="button" class="srLanePremium331" data-ach-premium-info="1">Premium<small>9,99 €</small></button>';}
 }catch(_){}
}
function enhanceFooter(root){
 try{
  if(root.querySelector('.srPassFooter331'))return;var st=launcherState()||{},done=Math.max(0,Number(st.done)||0),total=Math.max(1,Number(st.total)||10),pct=Math.max(0,Math.min(100,Math.round(done/total*100))),stage=String(st.stage||'');
  var close=root.querySelector(':scope > .mt10'),markup='<div class="srPassFooter331"><div class="srPassFooterTop331"><span>♛ Progression des étages</span><span>'+done+'/'+total+'</span></div><div class="srPassFooterTrack331"><i style="width:'+pct+'%"></i></div><div class="srPassFooterStage331">Étape actuelle : '+esc(stage||'—')+'</div></div>';
  if(close)close.insertAdjacentHTML('beforebegin',markup);else root.insertAdjacentHTML('beforeend',markup);
 }catch(_){}
}
function enhancePass(){
 try{
  ensureStyle();var root=document.querySelector('#overlay .srAch139');if(!root)return;var ov=document.getElementById('overlay');if(ov)ov.classList.add('srPassOverlay331');
  var card=ov&&ov.querySelector(':scope > .card');if(card)card.classList.add('srPassCard331');root.setAttribute('data-sr-pass-v331','1');
  var hero=root.querySelector('.achPassHero');if(hero){var price=hero.querySelector('.achPassPrice');if(price)price.classList.add('srPassHeroPrice331');var title=hero.querySelector('.achPassTitle'),kick=hero.querySelector('.achPassKicker'),sub=hero.querySelector('.achPassSub');if(title)title.innerHTML='Pass de progression';if(kick)kick.innerHTML='ARÈNE';if(sub)sub.innerHTML='Progresse dans les étages et relève des défis pour gagner des récompenses.';if(!hero.querySelector('.srPassCrown331'))hero.insertAdjacentHTML('afterbegin','<div class="srPassCrown331" aria-hidden="true">♛</div><button type="button" class="srPassClose331" data-act="closeModal" aria-label="Fermer">×</button>');}
  enhanceLane(root);enhanceFloorRows(root);enhanceOtherRewards(root);enhanceFooter(root);
 }catch(_){}
}
function placeEntry(){
 try{
  var s=document.getElementById('screen');if(!s)return;
  var old=s.querySelectorAll('[data-sr-accomplishments-entry]');for(var i=0;i<old.length;i++)old[i].remove();
  var mine=s.querySelector('[data-sr-accomplishments-v138]');
  if(!realDevelopmentScreen()){if(mine)mine.remove();return;}
  if(mine)return;
  var host=s.querySelector('.pad')||s;
  var b=document.createElement('button');b.type='button';b.className='card lit';b.setAttribute('data-sr-accomplishments-v138','1');
  b.style.cssText='display:block;width:100%;box-sizing:border-box;text-align:left;cursor:pointer;margin:8px 0 10px;padding:12px 14px;color:inherit;font:inherit;';
  b.innerHTML='<div class="between"><div><b>Accomplissements</b><div class="mute tiny mt3">Étages, défis et récompenses</div></div><span class="pill">Voir</span></div>';
  b.addEventListener('click',openAchievements,true);host.appendChild(b);
 }catch(_){}
}
function placeArenaLauncher(){
 try{
  ensureStyle();
  var b=document.getElementById('srAchArenaLauncher138');
  var visible=activeHomeRoute()&&!document.getElementById('overlay');
  if(!visible){if(b)b.remove();return;}
  if(!b){b=document.createElement('button');b.type='button';b.id='srAchArenaLauncher138';b.setAttribute('aria-label','Ouvrir le Pass Progression et les accomplissements');b.addEventListener('click',openAchievements,true);document.body.appendChild(b);}
  var st=launcherState()||{},done=Math.max(0,Number(st.done)||0),total=Math.max(1,Number(st.total)||10),claimable=Math.max(0,Number(st.claimable)||0),stage=String(st.stage||''),pct=Math.max(0,Math.min(100,Math.round(done/total*100)));
  b.style.setProperty('--srPassFill',pct+'%');
  b.innerHTML='<span class="srAchLaunchMark">♛</span><span class="srAchLaunchLabel">PASS</span><span class="srAchLaunchStage">'+esc(stage||'Progression')+'</span><span class="srAchLaunchTrack"><i></i></span><span class="srAchLaunchProgress">'+done+'/'+total+'</span>'+(claimable?'<span class="srAchLaunchBadge">'+(claimable>9?'9+':claimable)+'</span>':'');
 }catch(_){}
}
var q=false,retry=0,retryEnhance=0;
function schedulePlace(){
 if(!q){q=true;requestAnimationFrame(function(){q=false;placeEntry();placeArenaLauncher();enhancePass();});}
 clearTimeout(retry);retry=setTimeout(placeEntry,120);
 clearTimeout(retryEnhance);retryEnhance=setTimeout(function(){placeArenaLauncher();enhancePass();},150);
}

/* V209 is the sole BottomNav renderTabs owner. V83 owns modal lifecycle. */
window.addEventListener('sr:modal-state',schedulePlace);
window.addEventListener('sr:accomplishments-ready',schedulePlace);
window.addEventListener('sr:accomplishmentclaimed',schedulePlace);
placeArenaLauncher();
enhancePass();
window.addEventListener('sr:bottomnavrendered',schedulePlace);
placeEntry();
})();
