/* SHADOWREACH · Accomplishments title compatibility v134
   Phase 3E: canonical title rendering and equip interaction belong to v139.
   Keep only the requested floating-chat suppression here until social/UI
   ownership is migrated separately. */
(function(){
'use strict';
if(window.__srAccomplishmentsTitlesV134)return;
window.__srAccomplishmentsTitlesV134=true;

/* Suppression demandée de la bulle flottante. Le système social reste chargé,
   mais son bouton flottant ne recouvre plus Développement, Accomplissements ou les autres écrans. */
var style=document.createElement('style');
style.id='srNoFloatingChatV134';
style.textContent='#srChatBtn{display:none!important;}';
document.head.appendChild(style);
var chat=document.getElementById('srChatBtn');if(chat)chat.style.display='none';
})();
