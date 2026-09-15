/* SHADOWREACH · Accomplishments entry / Arena launcher stability v138
   - Prevent the legacy text-based Development detector from mounting the card on Accueil.
   - Mount Accomplissements only on the canonical Development route.
   - Mount one compact Progression Pass launcher on the right edge of Accueil/Arena.
   - Canonical Accomplishments / Pass modal rendering belongs exclusively to v139.
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
function ensureStyle(){
 if(document.getElementById('srAchLauncherV138Style'))return;
 var st=document.createElement('style');st.id='srAchLauncherV138Style';st.textContent='\
#srAchArenaLauncher138{position:fixed;right:max(8px,env(safe-area-inset-right));top:42%;transform:translateY(-50%);z-index:54;width:52px;min-height:70px;padding:7px 5px;border-radius:13px 0 0 13px;border:1px solid rgba(215,174,88,.54);border-right:0;background:linear-gradient(180deg,#1a2940,#0d1624);color:#f3dfaa;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 5px 16px rgba(0,0,0,.38);font:700 9px/1.1 system-ui,-apple-system,sans-serif;letter-spacing:.55px;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent}\
#srAchArenaLauncher138 .srAchLaunchMark{display:grid;place-items:center;width:28px;height:28px;margin:0 auto 5px;border-radius:9px;background:linear-gradient(180deg,#d8b45c,#9f7727);color:#1b1407;font-size:17px;box-shadow:inset 0 1px 0 rgba(255,255,255,.42),0 2px 7px rgba(0,0,0,.32)}\
#srAchArenaLauncher138 .srAchLaunchLabel{display:block;font-size:8px;color:#e8d398}\
#srAchArenaLauncher138 .srAchLaunchProgress{display:block;margin-top:3px;color:#9fb0c8;font-size:8px;letter-spacing:0}\
#srAchArenaLauncher138 .srAchLaunchBadge{position:absolute;left:-5px;top:-6px;min-width:17px;height:17px;padding:0 4px;border-radius:10px;display:grid;place-items:center;background:#d7ae58;color:#171006;border:2px solid #0b1320;font-size:9px;box-sizing:border-box}\
#srAchArenaLauncher138:active{transform:translateY(calc(-50% + 1px)) scale(.97);filter:brightness(.96)}\
@media(max-width:430px){#srAchArenaLauncher138{right:0;width:48px;min-height:65px;border-radius:12px 0 0 12px;padding:6px 4px}}\
@media(prefers-reduced-motion:reduce){#srAchArenaLauncher138{transition:none!important}}';
 document.head.appendChild(st);
}
function placeDevelopmentEntry(){
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
  var st=launcherState()||{},done=Math.max(0,Number(st.done)||0),total=Math.max(1,Number(st.total)||10),claimable=Math.max(0,Number(st.claimable)||0);
  b.innerHTML='<span class="srAchLaunchMark">✦</span><span class="srAchLaunchLabel">PASS</span><span class="srAchLaunchProgress">'+done+'/'+total+'</span>'+(claimable?'<span class="srAchLaunchBadge">'+(claimable>9?'9+':claimable)+'</span>':'');
 }catch(_){}
}
var q=false,retry=0;
function sync(){placeDevelopmentEntry();placeArenaLauncher();}
function schedulePlace(){
 if(!q){q=true;requestAnimationFrame(function(){q=false;sync();});}
 clearTimeout(retry);retry=setTimeout(sync,120);
}

/* V209 is the sole BottomNav renderTabs owner. V83 owns modal lifecycle. */
window.addEventListener('sr:bottomnavrendered',schedulePlace);
window.addEventListener('sr:modal-state',schedulePlace);
window.addEventListener('sr:accomplishments-ready',schedulePlace);
window.addEventListener('sr:accomplishmentclaimed',schedulePlace);
sync();
})();