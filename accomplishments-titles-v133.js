/* SHADOWREACH · Accomplishments titles + modal chat guard v133 */
(function(){
'use strict';
if(window.__srAccomplishmentsTitlesV133)return;window.__srAccomplishmentsTitlesV133=true;
if(typeof S==='undefined'||typeof ACT==='undefined')return;
function ensureTitles(){S.titles=S.titles&&typeof S.titles==='object'?S.titles:{};if(typeof S.equippedTitle!=='string')S.equippedTitle='';}
function divineProgress(){try{var st=S.sanctuary||{};return (st.divineTitleUnlocked||S.titles.divin)?1:0;}catch(_){return 0;}}
/* Only titles that actually exist are listed. No invented locked titles. */
function titlesHTML(){ensureTitles();var unlocked=!!S.titles.divin||divineProgress()>=1,eq=S.equippedTitle==='divin';
 return '<div class="sect" style="margin:14px 0 6px">Titres</div><div class="card frame"><div class="between"><div><div class="b">Collection de titres</div><div class="mute tiny">Titres débloqués : '+(unlocked?1:0)+' / 1</div></div></div></div>'+
 '<div class="itemRow"><div class="flex1"><div class="b small" style="color:#FFB52E">Divin</div><div class="mute tiny">Sacrifier un Divin · '+divineProgress()+' / 1</div></div>'+
 (unlocked?'<button class="btn sm '+(eq?'dark':'gold')+'" data-ach-title="divin">'+(eq?'Équipé':'Équiper')+'</button>':'<span class="pill">Verrouillé</span>')+'</div>';
}
var oldOpen=ACT.accomplishments;
ACT.accomplishments=function(){oldOpen();setTimeout(inject,0);};
function inject(){var modal=document.querySelector('.modal,.modalCard,.modalBox,[role="dialog"]');if(!modal)return;var txt=(modal.textContent||'').toLowerCase();if(txt.indexOf('accomplissement')<0)return;if(modal.querySelector('[data-ach-titles-v133]'))return;var box=document.createElement('div');box.setAttribute('data-ach-titles-v133','1');box.innerHTML=titlesHTML();var close=modal.querySelector('[data-act="closeModal"]');if(close&&close.parentNode)close.parentNode.insertBefore(box,close);else modal.appendChild(box);hideChat();}
function hideChat(){var modal=document.querySelector('.modal,.modalCard,.modalBox,[role="dialog"]');var b=document.getElementById('srChatBtn');if(b)b.style.display=modal?'none':'';var social=document.getElementById('srSocial');if(social&&modal)social.style.display='none';}
function equip(){ensureTitles();if(!S.titles.divin&&!divineProgress())return;S.equippedTitle=S.equippedTitle==='divin'?'':'divin';try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){}ACT.accomplishments();}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-ach-title="divin"]');if(!b)return;e.preventDefault();e.stopPropagation();equip();},true);
/* Chat button must never float over modal content. Restore it only after modal closes. */
var obs=new MutationObserver(function(){hideChat();if(document.querySelector('.modal,.modalCard,.modalBox,[role="dialog"]'))setTimeout(inject,0);});obs.observe(document.body,{childList:true,subtree:true});
setInterval(hideChat,500);
})();