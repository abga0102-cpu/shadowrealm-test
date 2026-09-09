/* SHADOWREACH · Accomplishments titles interactions + no floating chat bubble v134
   Rendering ownership moved to canonical Accomplishments v139. */
(function(){
'use strict';
if(window.__srAccomplishmentsTitlesV134)return;window.__srAccomplishmentsTitlesV134=true;
if(typeof S==='undefined'||typeof ACT==='undefined')return;

function ensureTitles(){
  S.titles=S.titles&&typeof S.titles==='object'?S.titles:{};
  if(typeof S.equippedTitle!=='string')S.equippedTitle='';
}
function divineUnlocked(){
  ensureTitles();
  var st=S.sanctuary||{};
  return !!(st.divineTitleUnlocked||S.titles.divin);
}

/* v139 now owns all Accomplissements modal rendering, including the Titres
   section. This file keeps only the title interaction/state behavior. */
function saveTitle(){try{dirty=true;if(typeof saveNow==='function')saveNow();}catch(_){} }
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('[data-ach-title="divin"]'):null;
  if(!b)return;
  e.preventDefault();e.stopPropagation();
  if(!divineUnlocked())return;
  S.equippedTitle=S.equippedTitle==='divin'?'':'divin';
  saveTitle();
  if(typeof ACT.accomplishments==='function')ACT.accomplishments();
},true);

/* Suppression demandée de la bulle flottante. Le système social reste chargé,
   mais son bouton flottant ne recouvre plus Développement, Accomplissements ou les autres écrans. */
var style=document.createElement('style');
style.id='srNoFloatingChatV134';
style.textContent='#srChatBtn{display:none!important;}';
document.head.appendChild(style);
var chat=document.getElementById('srChatBtn');if(chat)chat.style.display='none';
})();