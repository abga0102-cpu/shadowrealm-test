/* SHADOWREACH · Accomplishments titles direct integration + no floating chat bubble v134 */
(function(){
'use strict';
if(window.__srAccomplishmentsTitlesV134)return;window.__srAccomplishmentsTitlesV134=true;
if(typeof S==='undefined'||typeof ACT==='undefined'||typeof openModal!=='function')return;

function ensureTitles(){
  S.titles=S.titles&&typeof S.titles==='object'?S.titles:{};
  if(typeof S.equippedTitle!=='string')S.equippedTitle='';
}
function divineUnlocked(){
  ensureTitles();
  var st=S.sanctuary||{};
  return !!(st.divineTitleUnlocked||S.titles.divin);
}
function titleOverview(){
  var unlocked=divineUnlocked(),eq=S.equippedTitle==='divin';
  return '<div data-ach-titles-v134="1">'+
    '<div class="sect" style="margin:14px 0 6px">Titres</div>'+
    '<div class="card frame" style="margin-bottom:7px">'+
      '<div class="between"><div><div class="b">Vue d’ensemble des titres</div>'+
      '<div class="mute tiny">Débloqués : '+(unlocked?1:0)+' / 1</div></div>'+
      '<span class="pill">'+(unlocked?'1 / 1':'0 / 1')+'</span></div>'+
    '</div>'+
    '<div class="itemRow">'+
      '<div class="flex1"><div class="b small" style="color:#FFB52E">Divin</div>'+
      '<div class="mute tiny">Sacrifier un Divin · '+(unlocked?'1 / 1':'0 / 1')+'</div></div>'+
      (unlocked?'<button class="btn sm '+(eq?'dark':'gold')+'" data-ach-title="divin">'+(eq?'Équipé':'Équiper')+'</button>':'<span class="pill">Verrouillé</span>')+
    '</div></div>';
}

/* Intégration directe dans la vraie fenêtre ouverte par Développement > Accomplissements.
   On intercepte le contenu avant que la modale soit créée, au lieu de chercher son DOM après coup. */
var baseOpenModal=openModal;
openModal=function(html,title){
  if(String(title||'').toLowerCase()==='accomplissements' && String(html).indexOf('data-ach-titles-v134')<0){
    var marker='<div class="mt10"><button class="btn ghost" data-act="closeModal">Fermer</button></div>';
    if(String(html).indexOf(marker)>=0) html=String(html).replace(marker,titleOverview()+marker);
    else html=String(html)+titleOverview();
  }
  return baseOpenModal(html,title);
};

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